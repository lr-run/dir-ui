import { validateFile } from '../components/collections/file-model.ts'
import { UploadQueue } from '../components/collections/upload-queue.ts'
function assert(value: unknown, message: string): void {
  if (!value) throw new Error(message)
}
const file = new File(['sample'], 'sample.txt', { type: 'text/plain' })
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))
Deno.test('file validation honors extension, MIME wildcard, and size before upload', () => {
  assert(!validateFile(file, '.pdf,.txt', 20), 'Allows listed extensions')
  assert(!validateFile(file, 'text/*', 20), 'Allows matching MIME wildcard')
  assert(!!validateFile(file, 'image/*', 20), 'Rejects unsupported types')
  assert(!!validateFile(file, '.txt', 1), 'Rejects oversized file')
})
Deno.test('upload queue caps concurrency and releases the next queued file', async () => {
  const releases: (() => void)[] = [], started: string[] = [], done: string[] = []
  const queue = new UploadQueue(() => ({
    concurrency: 1,
    upload: async (file) => {
      started.push(file.name)
      await new Promise<void>((r) => releases.push(r))
      return { id: file.name, name: file.name, size: file.size }
    },
    onComplete: (f) => done.push(f.name),
  }), () => {})
  queue.add('a', file)
  queue.add('b', new File(['b'], 'second.txt'))
  queue.pump()
  queue.pump()
  await tick()
  assert(started.length === 1, 'Only one request starts')
  releases.shift()!()
  await tick()
  assert(started.includes('second.txt'), 'Next starts after completion')
  releases.shift()!()
  await tick()
  assert(done.length === 2, 'Both complete once')
  queue.dispose()
})
Deno.test('canceled upload completion cannot overwrite a retry', async () => {
  const releases: (() => void)[] = [], completed: string[] = [], statuses: string[] = []
  const queue = new UploadQueue(() => ({
    concurrency: 2,
    upload: async () => {
      await new Promise<void>((r) => releases.push(r))
      return { id: 'remote', name: 'sample.txt', size: 6 }
    },
    onComplete: (f) => completed.push(f.id),
  }), (_, patch) => {
    if (patch.status) statuses.push(patch.status)
  })
  queue.add('a', file)
  queue.pump()
  await tick()
  queue.cancel('a')
  queue.retry('a')
  await tick()
  releases[0]!()
  await tick()
  assert(completed.length === 0, 'Canceled completion is ignored')
  releases[1]!()
  await tick()
  assert(completed.length === 1, 'Only retry completes')
  assert(statuses.filter((s) => s === 'complete').length === 1, 'No stale success state')
  queue.dispose()
})
Deno.test('synchronous upload failures become retryable errors', async () => {
  const statuses: string[] = []
  let fail = true
  const queue = new UploadQueue(() => ({
    concurrency: 1,
    upload: () => {
      if (fail) throw new Error('Offline')
      return Promise.resolve({ id: 'ok', name: file.name, size: file.size })
    },
  }), (_, p) => {
    if (p.status) statuses.push(p.status)
  })
  queue.add('a', file)
  queue.pump()
  await tick()
  assert(statuses.includes('error'), 'Error is surfaced')
  fail = false
  queue.retry('a')
  await tick()
  assert(statuses.at(-1) === 'complete', 'Retry succeeds')
  queue.dispose()
})
