import { createInfiniteRecords, type InfiniteRecordState, type RecordPage } from '../lib/infinite-records.ts'
function assert(value: unknown, message: string) {
  if (!value) throw new Error(message)
}
const deferred = <T>() => {
  let resolve!: (value: T) => void, reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
type Row = { id: number }
Deno.test('pagination deduplicates requests and overlapping rows, then stops at the final cursor', async () => {
  let state!: InfiniteRecordState<Row>, calls = 0
  const pending = deferred<RecordPage<Row>>()
  const controller = createInfiniteRecords<Row>((next) => state = next, (r) => r.id)
  controller.reset(async ({ cursor }) => {
    calls++
    return cursor ? { rows: [{ id: 1 }, { id: 2 }], nextCursor: null, total: 2 } : await pending.promise
  })
  await controller.loadMore()
  assert(calls === 1, 'Duplicate initial request')
  pending.resolve({ rows: [{ id: 1 }], nextCursor: 'next', total: 2 })
  await pending.promise
  await Promise.resolve()
  await controller.loadMore()
  assert(state.rows.length === 2 && !state.hasMore && state.total === 2, 'Deduplication or final page failed')
  await controller.loadMore()
  assert(calls === 2, 'Requested beyond the final page')
})
Deno.test('query reset aborts and ignores stale success and failure', async () => {
  let state!: InfiniteRecordState<Row>, signal!: AbortSignal
  const first = deferred<RecordPage<Row>>()
  const controller = createInfiniteRecords<Row>((next) => state = next, (r) => r.id)
  controller.reset((context) => {
    signal = context.signal
    return first.promise
  })
  controller.reset(() => Promise.resolve({ rows: [{ id: 2 }], nextCursor: null }))
  await Promise.resolve()
  first.resolve({ rows: [{ id: 1 }], nextCursor: 'old' })
  await first.promise
  assert(signal.aborted && state.rows[0]?.id === 2 && !state.hasMore, 'Stale page leaked into new query')
  const failure = deferred<RecordPage<Row>>()
  controller.reset(() => failure.promise)
  controller.dispose()
  failure.reject(new Error('Late failure'))
  await failure.promise.catch(() => {})
  assert(state.error === null, 'Disposed request published an error')
})
Deno.test('page failures retain loaded rows and retry the same cursor', async () => {
  let state!: InfiniteRecordState<Row>, failures = 0
  const cursors: (string | null)[] = []
  const controller = createInfiniteRecords<Row>((next) => state = next, (r) => r.id)
  controller.reset(({ cursor }) => {
    cursors.push(cursor)
    if (cursor && failures++ === 0) throw new Error('Offline')
    return Promise.resolve(
      cursor ? { rows: [{ id: 2 }], nextCursor: null } : { rows: [{ id: 1 }], nextCursor: 'second' },
    )
  })
  await Promise.resolve()
  await controller.loadMore()
  assert(state.error === 'Offline' && state.rows.length === 1, 'Failed page lost existing data')
  await controller.loadMore()
  assert(state.rows.length === 2 && !state.error && cursors.join() === ',second,second', 'Retry skipped cursor')
})
Deno.test('repeated server cursors produce a recoverable error rather than a request loop', async () => {
  let state!: InfiniteRecordState<Row>
  const controller = createInfiniteRecords<Row>((next) => state = next, (r) => r.id)
  controller.reset(() => Promise.resolve({ rows: [{ id: 1 }], nextCursor: 'same' }))
  await Promise.resolve()
  await controller.loadMore()
  assert(state.error?.includes('repeated') && state.rows.length === 1, 'Invalid cursor was accepted')
})
