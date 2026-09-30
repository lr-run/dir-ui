import { createInlineSaveTask } from '../src/lib/inline-save-task.ts'
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
Deno.test('inline persistence blocks duplicate requests until the original write resolves', async () => {
  const task = createInlineSaveTask()
  const wait = Promise.withResolvers<void>()
  let writes = 0
  const first = task.run(() => {
    writes++
    return wait.promise
  })
  const duplicate = await task.run(() => {
    writes++
  })
  assert(task.isSaving() && writes === 1 && duplicate.status === 'busy', 'Must not send a second write')
  wait.resolve()
  assert((await first).status === 'saved' && !task.isSaving(), 'Must complete and release the lock')
})
Deno.test('failed async writes preserve the last confirmed value and allow an explicit retry', async () => {
  const task = createInlineSaveTask()
  let confirmed = 'old'
  const failure = await task.run(async () => {
    await Promise.resolve()
    throw new Error('network failure')
  })
  assert(
    failure.status === 'failed' && failure.error === 'network failure' && confirmed === 'old',
    'Must surface failure without confirming a value',
  )
  assert(!task.isSaving(), 'Failure must release the lock')
  const retry = await task.run(() => {
    confirmed = 'draft'
  })
  assert(retry.status === 'saved' && String(confirmed) === 'draft', 'Retry must persist the draft')
})
Deno.test('synchronous handlers and non-Error failures use the same save contract', async () => {
  const task = createInlineSaveTask()
  assert((await task.run(() => {})).status === 'saved', 'Sync callbacks remain compatible')
  const failure = await task.run(() => {
    throw null
  })
  assert(failure.status === 'failed' && !!failure.error, 'Unknown failures need a visible message')
})
