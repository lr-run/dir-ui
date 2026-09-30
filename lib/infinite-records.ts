export type RecordPage<R> = { rows: readonly R[]; nextCursor: string | null; total?: number }
export type LoadRecordPage<R> = (context: { cursor: string | null; signal: AbortSignal }) => Promise<RecordPage<R>>
export type InfiniteRecordState<R> = {
  rows: readonly R[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total?: number
}
/** One request per cursor; resets invalidate even adapters that ignore AbortSignal. */
export function createInfiniteRecords<R>(
  publish: (state: InfiniteRecordState<R>) => void,
  rowKey: (row: R) => string | number,
) {
  let state: InfiniteRecordState<R> = { rows: [], loading: false, error: null, hasMore: true }
  let loader: LoadRecordPage<R> | undefined, cursor: string | null = null, generation = 0
  let controller: AbortController | undefined
  let keys = new Set<string | number>(), cursors = new Set<string>()
  const emit = (patch: Partial<InfiniteRecordState<R>>) => {
    state = { ...state, ...patch }
    publish(state)
  }
  const loadMore = async () => {
    if (!loader || state.loading || !state.hasMore) return
    const current = generation, requested = cursor, activeLoader = loader
    const request = new AbortController()
    controller = request
    emit({ loading: true, error: null })
    try {
      const page = await activeLoader({ cursor: requested, signal: request.signal })
      if (current !== generation || request.signal.aborted) return
      if (page.nextCursor !== null && (page.nextCursor === requested || cursors.has(page.nextCursor))) {
        throw new Error('The server returned a repeated pagination cursor.')
      }
      const added: R[] = []
      for (const row of page.rows) {
        const key = rowKey(row)
        if (!keys.has(key)) {
          keys.add(key)
          added.push(row)
        }
      }
      if (page.nextCursor !== null) cursors.add(page.nextCursor)
      cursor = page.nextCursor
      emit({
        rows: [...state.rows, ...added],
        total: page.total ?? state.total,
        loading: false,
        hasMore: cursor !== null,
      })
    } catch (error) {
      if (current === generation && !request.signal.aborted) {
        emit({ loading: false, error: error instanceof Error ? error.message : 'Unable to load records.' })
      }
    }
  }
  return {
    loadMore,
    reset(next: LoadRecordPage<R> | undefined) {
      generation++
      controller?.abort()
      loader = next
      cursor = null
      keys = new Set()
      cursors = new Set()
      state = { rows: [], loading: false, error: null, hasMore: !!next }
      publish(state)
      if (next) void loadMore()
    },
    dispose() {
      generation++
      controller?.abort()
      loader = undefined
    },
  }
}
