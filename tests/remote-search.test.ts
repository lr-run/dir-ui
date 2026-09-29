import { createRemoteSearch, type RemoteSearchState } from '../components/collections/remote-search.ts'
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}
const tick = () => new Promise((resolve) => setTimeout(resolve, 5))
Deno.test('remote search debounces and cancels pending requests', async () => {
  const calls: string[] = [], states: RemoteSearchState<string>[] = []
  const search = createRemoteSearch<string>((s) => states.push(s))
  const load = (q: string) => {
    calls.push(q)
    return Promise.resolve([q])
  }
  search.search('old', load, 20)
  search.search('new', load, 0)
  await tick()
  assert(calls.join() === 'new' && states.at(-1)?.items[0] === 'new', 'Only latest request should run')
  search.cancel()
})
Deno.test('remote search aborts superseded work and ignores out-of-order completion', async () => {
  const old = Promise.withResolvers<readonly string[]>(), latest = Promise.withResolvers<readonly string[]>()
  const states: RemoteSearchState<string>[] = []
  let signal: AbortSignal | undefined
  const search = createRemoteSearch<string>((s) => states.push(s))
  search.search('old', (_q, c) => {
    signal = c.signal
    return old.promise
  }, 0)
  await tick()
  search.search('new', () => latest.promise, 0)
  await tick()
  assert(signal?.aborted, 'Old fetch signal must abort')
  latest.resolve(['new'])
  await tick()
  old.resolve(['stale'])
  await tick()
  assert(states.at(-1)?.items[0] === 'new', 'An adapter ignoring abort must not overwrite new results')
  search.cancel()
})
Deno.test('remote search reports errors and permits retry of the same query', async () => {
  const states: RemoteSearchState<string>[] = [], search = createRemoteSearch<string>((s) => states.push(s))
  search.search('query', () => {
    throw new Error('Offline')
  }, 0)
  await tick()
  assert(states.at(-1)?.error === 'Offline', 'Synchronous failures must be handled')
  search.search('query', () => Promise.resolve(['retry']), 0)
  await tick()
  assert(states.at(-1)?.items[0] === 'retry', 'Same query retry must succeed')
  search.cancel()
})
Deno.test('closing remote search prevents late success and failure updates', async () => {
  const result = Promise.withResolvers<readonly string[]>(), states: RemoteSearchState<string>[] = []
  const search = createRemoteSearch<string>((s) => states.push(s))
  search.search('query', () => result.promise, 0)
  await tick()
  search.cancel()
  const count = states.length
  result.reject(new Error('Request aborted'))
  await tick()
  assert(states.length === count, 'Canceled requests must not publish errors')
})
