import { useEffect, useMemo, useState } from 'react'
import { createInfiniteRecords, type InfiniteRecordState, type LoadRecordPage } from '../lib/infinite-records.ts'
export type { InfiniteRecordState, LoadRecordPage, RecordPage } from '../lib/infinite-records.ts'
export function useInfiniteRecords<R>({ loadPage, queryKey, rowKeyGetter }: {
  loadPage?: LoadRecordPage<R>
  queryKey: string
  rowKeyGetter: (row: R) => string | number
}) {
  const [snapshot, setSnapshot] = useState<{ key: string; state: InfiniteRecordState<R> }>({
    key: queryKey,
    state: { rows: [], loading: !!loadPage, error: null, hasMore: !!loadPage },
  })
  const controller = useMemo(
    () => createInfiniteRecords<R>((state) => setSnapshot({ key: queryKey, state }), rowKeyGetter),
    [queryKey, rowKeyGetter],
  )
  useEffect(() => {
    controller.reset(loadPage)
    return () => controller.dispose()
  }, [controller, loadPage])
  const state = snapshot.key === queryKey
    ? snapshot.state
    : { rows: [], loading: !!loadPage, error: null, hasMore: !!loadPage }
  return { ...state, loadMore: controller.loadMore, retry: controller.loadMore }
}
