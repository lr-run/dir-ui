import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { type FocusEventHandler, type ReactNode, type Ref, useEffect, useMemo, useRef, useState } from 'react'
import type { Choice } from '@/lib/choice-types.ts'
export type ChoicePage = { items: Choice[]; cursor?: string }
export type LoadChoices = (query: string, context: { signal: AbortSignal; cursor?: string }) => Promise<ChoicePage>
export type ComboboxOptions = {
  items: Choice[]
  selectedItems?: Choice[]
  label: string
  id?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  placeholder?: string
  clearable?: boolean
  loadOptions?: LoadChoices
  debounceMs?: number
  maxVisible?: number
  renderOption?: (item: Choice) => ReactNode
  renderValue?: (item: Choice) => ReactNode
  onCreate?: (query: string) => void
  ref?: Ref<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  'aria-describedby'?: string
}

export function useChoices(props: ComboboxOptions, open: boolean, query: string) {
  const notifyError = useErrorNotification()
  const [page, setPage] = useState<ChoicePage>({ items: [] }),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(''),
    [revision, retry] = useState(0)
  const request = useRef<AbortController | null>(null),
    busy = useRef(false),
    [remembered, remember] = useState<Choice[]>([])
  const { loadOptions, debounceMs = 150, maxVisible = 100, items, selectedItems } = props
  useEffect(() => {
    if (!open || !loadOptions) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    busy.current = true
    setLoading(true)
    setError('')
    setPage({ items: [] })
    const timer = setTimeout(() => {
      loadOptions(query, { signal: controller.signal }).then((next) => {
        if (!controller.signal.aborted) setPage(next)
      }).catch((e) => {
        if (!controller.signal.aborted) {
          notifyError?.(e, 'Unable to load options.')
          setError(e instanceof Error ? e.message : 'Unable to load options.')
        }
      }).finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
          busy.current = false
        }
      })
    }, debounceMs)
    return () => {
      clearTimeout(timer)
      controller.abort()
      request.current?.abort()
      busy.current = false
    }
  }, [open, query, loadOptions, debounceMs, revision, notifyError])
  const more = async () => {
    if (!loadOptions || !page.cursor || busy.current) return
    const controller = new AbortController()
    request.current?.abort()
    request.current = controller
    busy.current = true
    setLoading(true)
    setError('')
    try {
      const next = await loadOptions(query, { signal: controller.signal, cursor: page.cursor })
      if (!controller.signal.aborted) {
        setPage((old) => ({
          ...next,
          items: [...new Map([...old.items, ...next.items].map((i) => [i.value, i])).values()],
        }))
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        notifyError?.(e, 'Unable to load options.')
        setError(e instanceof Error ? e.message : 'Unable to load options.')
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
        busy.current = false
      }
    }
  }
  useEffect(() => () => request.current?.abort(), [])
  const filtered = useMemo(
    () =>
      loadOptions
        ? page.items
        : items.filter((i) =>
          [i.label, i.description ?? '', ...(i.keywords ?? [])].join(' ').toLocaleLowerCase().includes(
            query.toLocaleLowerCase(),
          )
        ),
    [loadOptions, page.items, items, query],
  )
  const lookup = useMemo(
    () => new Map([...remembered, ...(selectedItems ?? []), ...items, ...page.items].map((i) => [i.value, i])),
    [remembered, selectedItems, items, page.items],
  )
  return {
    options: filtered.slice(0, Math.max(1, maxVisible)),
    lookup,
    loading,
    error,
    errorNotified: !!notifyError,
    more,
    hasMore: !!page.cursor,
    truncated: filtered.length > maxVisible,
    retry: () => retry((n) => n + 1),
    remember,
  }
}
