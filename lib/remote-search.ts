export type SearchLoader<T> = (query: string, context: { signal: AbortSignal }) => Promise<readonly T[]>
export type RemoteSearchState<T> = {
  query: string
  items: readonly T[]
  status: 'loading' | 'ready' | 'error'
  error?: string
}

/** Cancels debounced/in-flight work and ignores late responses even if the adapter ignores AbortSignal. */
export function createRemoteSearch<T>(publish: (state: RemoteSearchState<T>) => void) {
  let generation = 0, timer: ReturnType<typeof setTimeout> | undefined, controller: AbortController | undefined
  const cancel = () => {
    generation++
    clearTimeout(timer)
    controller?.abort()
  }
  return {
    cancel,
    search(query: string, load: SearchLoader<T>, debounceMs: number) {
      cancel()
      const current = generation, request = new AbortController()
      controller = request
      publish({ query, items: [], status: 'loading' })
      timer = setTimeout(async () => {
        try {
          const items = await load(query, { signal: request.signal })
          if (current === generation) publish({ query, items, status: 'ready' })
        } catch (error) {
          if (current === generation) {
            publish({
              query,
              items: [],
              status: 'error',
              error: error instanceof Error ? error.message : 'Search failed. Please try again.',
            })
          }
        }
      }, Math.max(0, debounceMs))
    },
  }
}
