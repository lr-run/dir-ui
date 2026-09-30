import assert from 'node:assert/strict'
import { createErrorNotifier } from '../src/lib/error-notifier.ts'
import { createRemoteSearch } from '../src/lib/remote-search.ts'

Deno.test('error notifications suppress cancellation and duplicate bubbling, but allow later retries', () => {
  const messages: string[] = [], notify = createErrorNotifier((message) => messages.push(message))
  const error = new Error('Save failed')
  notify(error)
  notify(error)
  notify(new DOMException('Cancelled', 'AbortError'))
  notify(new Error('Save failed'))
  notify(null, 'Request failed')
  assert.deepEqual(messages, ['Save failed', 'Save failed', 'Request failed'])
})
Deno.test('remote search notifies only current failures and retries successfully', async () => {
  const messages: string[] = [], states: string[] = []
  const finished = Promise.withResolvers<void>()
  const search = createRemoteSearch<string>((state) => {
    states.push(state.status)
    if (state.status === 'error') finished.resolve()
  }, createErrorNotifier((message) => messages.push(message)))
  search.search('failed', () => Promise.reject(new Error('Offline')), 0)
  await finished.promise
  assert.deepEqual(messages, ['Offline'])
  const ready = Promise.withResolvers<void>()
  search.search('retry', () => {
    ready.resolve()
    return Promise.resolve(['result'])
  }, 0)
  await ready.promise
  await Promise.resolve()
  assert.equal(states.at(-1), 'ready')
  search.cancel()
  const pending = Promise.withResolvers<readonly string[]>(), started = Promise.withResolvers<void>()
  search.search('cancelled', () => {
    started.resolve()
    return pending.promise
  }, 0)
  await started.promise
  search.cancel()
  pending.reject(new Error('Late failure'))
  await Promise.resolve()
  assert.deepEqual(messages, ['Offline'])
})
