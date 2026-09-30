import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { useEffect, useMemo, useState } from 'react'
import { createRemoteSearch, type RemoteSearchState, type SearchLoader } from '@/lib/remote-search.ts'
export function useRemoteSearch<T>(
  query: string,
  load: SearchLoader<T> | undefined,
  enabled: boolean,
  debounceMs: number,
  minQueryLength: number,
) {
  const notifyError = useErrorNotification()
  const [state, setState] = useState<RemoteSearchState<T>>(), [revision, setRevision] = useState(0)
  const task = useMemo(
    () =>
      createRemoteSearch<T>(
        setState,
        notifyError ? (error) => notifyError(error, 'Search failed. Please try again.') : undefined,
      ),
    [notifyError],
  )
  const ready = query.trim().length >= minQueryLength
  useEffect(() => {
    if (enabled && load && ready) task.search(query, load, debounceMs)
    else {
      task.cancel()
      setState(undefined)
    }
    return task.cancel
  }, [query, load, enabled, debounceMs, ready, revision, task])
  const current = state?.query === query ? state : undefined
  return {
    items: enabled && ready && current?.status === 'ready' ? current.items : [],
    loading: !!load && enabled && ready && (!current || current.status === 'loading'),
    error: enabled && ready && current?.status === 'error' ? current.error : undefined,
    waiting: !!load && !ready,
    retry: () => setRevision((value) => value + 1),
  }
}
