import { AlignLeftIcon, InfoIcon, SearchIcon, XIcon } from 'lucide-react'
import { Combobox } from '@base-ui/react/combobox'
import { type ComponentProps, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/button.tsx'
import { Dialog } from '../ui/dialog.tsx'
import { useRemoteSearch } from '../../hooks/use-remote-search.ts'
import type { SearchLoader } from '../../lib/remote-search.ts'
export type LoadSearchResults = SearchLoader<SearchItem>

export type SearchItem = {
  id: string
  label: string
  description?: string
  group?: string
  keywords?: string[]
  icon?: ReactNode
  meta?: string
  disabled?: boolean
}
export type SearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  shortcut?: boolean
  items?: readonly SearchItem[]
  loadResults?: LoadSearchResults
  debounceMs?: number
  minQueryLength?: number
  onSelect: (item: SearchItem) => void | Promise<void>
  query?: string
  onQueryChange?: (query: string) => void
  filter?: boolean
  placeholder?: string
  loading?: boolean
  error?: string
  onRetry?: () => void
  maxVisible?: number
  inputLabel?: string
  emptyMessage?: ReactNode
  emptyQueryLabel?: string
  selectLabel?: string
  renderItem?: (item: SearchItem) => ReactNode
  renderPreview?: (item: SearchItem) => ReactNode
}

function Match({ text, query }: { text: string; query: string }) {
  const needle = query.trim(), index = text.toLowerCase().indexOf(needle.toLowerCase())
  if (!needle || index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  )
}

function SearchResults({
  items: localItems = [],
  loadResults,
  debounceMs = 250,
  minQueryLength = 0,
  enabled,
  onSelect,
  query: controlled,
  onQueryChange,
  filter = true,
  placeholder = 'Search…',
  loading: externalLoading,
  error: externalError,
  onRetry: externalRetry,
  maxVisible = 100,
  inputLabel = 'Search',
  emptyMessage = 'No results found.',
  emptyQueryLabel = 'Suggestions',
  selectLabel = 'Select',
  renderItem,
  renderPreview,
  title,
  onClose,
}: Omit<SearchDialogProps, 'open' | 'onOpenChange' | 'shortcut'> & {
  title: string
  onClose: () => void
  enabled: boolean
}) {
  const [localQuery, setQuery] = useState(''),
    [failure, setFailure] = useState(''),
    [busy, setBusy] = useState(false),
    [highlightedId, setHighlightedId] = useState<string>(),
    lock = useRef(false),
    input = useRef<HTMLInputElement>(null),
    query = controlled ?? localQuery
  const remote = useRemoteSearch(query, loadResults, enabled, debounceMs, minQueryLength)
  const items = loadResults ? remote.items : localItems
  const loading = remote.loading || externalLoading
  const error = remote.error || externalError
  const onRetry = remote.error ? remote.retry : externalRetry
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase(), grouped = new Map<string, SearchItem[]>()
    const limit = Math.max(1, Math.floor(maxVisible) || 100)
    let count = 0
    for (const item of items) {
      if (
        !loadResults && filter &&
        ![item.label, item.description ?? '', ...(item.keywords ?? [])].join(' ').toLowerCase().includes(needle)
      ) continue
      const name = item.group ?? (needle ? 'Results' : emptyQueryLabel)
      const entries = grouped.get(name) ?? []
      entries.push(item)
      grouped.set(name, entries)
      if (++count >= limit) break
    }
    return [...grouped]
  }, [items, filter, query, maxVisible, emptyQueryLabel, loadResults])
  const visible = useMemo(() => groups.flatMap(([, entries]) => entries), [groups])
  const active = loading || error
    ? undefined
    : visible.find((item) => item.id === highlightedId && !item.disabled) ?? visible.find((item) => !item.disabled)
  useEffect(() => {
    setFailure('')
  }, [query])
  const changeQuery = (next: string) => {
    setQuery(next)
    setHighlightedId(undefined)
    onQueryChange?.(next)
  }
  const select = async (item: SearchItem) => {
    if (item.disabled || loading || error || lock.current) return
    lock.current = true
    setBusy(true)
    setFailure('')
    try {
      await onSelect(item)
    } catch (e) {
      setFailure(e instanceof Error ? e.message : 'Unable to select this result.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <div className="flex flex-col min-h-0 max-h-[inherit] w-full text-[13px] [&_kbd]:inline-flex [&_kbd]:items-center [&_kbd]:justify-center [&_kbd]:min-w-[19px] [&_kbd]:h-[19px] [&_kbd]:p-[0_4px] [&_kbd]:[border:1px_solid_var(--ui-border)] [&_kbd]:rounded-[4px] [&_kbd]:[font-family:inherit] [&_kbd]:text-[10px] [&_kbd]:text-muted-foreground [&_kbd]:[background:var(--ui-surface)] [&_[class~='group/search-input']]:flex-1 [&_[class~='group/search-input']]:min-w-0 [&_[class~='group/search-input']]:w-full [&_[class~='group/search-input']]:h-[44px] [&_[class~='group/search-input']]:p-0 [&_[class~='group/search-input']]:[border:0] [&_[class~='group/search-input']]:[outline:none] [&_[class~='group/search-input']]:[box-shadow:none] [&_[class~='group/search-input']]:[background:transparent] [&_[class~='group/search-input']]:text-foreground [&_[class~='group/search-input']]:[font:inherit] [&_[class~='group/search-input']]:text-[16px] [&_[class~='group/search-input']:focus]:flex-1 [&_[class~='group/search-input']:focus]:min-w-0 [&_[class~='group/search-input']:focus]:w-full [&_[class~='group/search-input']:focus]:h-[44px] [&_[class~='group/search-input']:focus]:p-0 [&_[class~='group/search-input']:focus]:[border:0] [&_[class~='group/search-input']:focus]:[outline:none] [&_[class~='group/search-input']:focus]:[box-shadow:none] [&_[class~='group/search-input']:focus]:[background:transparent] [&_[class~='group/search-input']:focus]:text-foreground [&_[class~='group/search-input']:focus]:[font:inherit] [&_[class~='group/search-input']:focus]:text-[16px] [&_[class~='group/search-input']:focus-visible]:flex-1 [&_[class~='group/search-input']:focus-visible]:min-w-0 [&_[class~='group/search-input']:focus-visible]:w-full [&_[class~='group/search-input']:focus-visible]:h-[44px] [&_[class~='group/search-input']:focus-visible]:p-0 [&_[class~='group/search-input']:focus-visible]:[border:0] [&_[class~='group/search-input']:focus-visible]:[outline:none] [&_[class~='group/search-input']:focus-visible]:[box-shadow:none] [&_[class~='group/search-input']:focus-visible]:[background:transparent] [&_[class~='group/search-input']:focus-visible]:text-foreground [&_[class~='group/search-input']:focus-visible]:[font:inherit] [&_[class~='group/search-input']:focus-visible]:text-[16px]">
      <div className='flex items-center justify-between p-[10px_16px_0] text-muted-foreground text-[12px] [&>span]:flex [&>span]:items-center [&>span]:gap-[8px]'>
        <span>
          <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          {title}
        </span>
        <button
          type='button'
          className='grid [place-items:center] w-[28px] h-[28px] [border:0] rounded-[5px] [background:transparent] text-muted-foreground cursor-pointer shrink-0 [&:hover]:[background:var(--ui-hover)] [&:hover]:text-foreground [&:focus-visible]:[outline:1px_solid_var(--ui-blue)] [&:focus-visible]:outline-offset-[1px]'
          aria-label='Close search'
          onClick={onClose}
        >
          <XIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        </button>
      </div>
      <Combobox.Root<SearchItem>
        inline
        open
        items={loading || error ? [] : visible}
        filter={null}
        autoHighlight
        value={null}
        inputValue={query}
        onInputValueChange={(next, details) => {
          if (details.reason === 'input-change' || details.reason === 'input-clear') changeQuery(next)
        }}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(a, b) => a.id === b.id}
        onItemHighlighted={(item) => {
          if (item) setHighlightedId(item.id)
        }}
        onValueChange={(item, details) => {
          if (details.reason !== 'escape-key' && item) void select(item)
        }}
      >
        <div className='flex items-center gap-[8px] p-[3px_18px_9px] [border-bottom:1px_solid_var(--ui-border)]'>
          <Combobox.Input
            ref={input}
            className='group/search-input [&::placeholder]:text-muted-foreground'
            aria-label={inputLabel}
            placeholder={placeholder}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing && active) {
                event.preventDefault()
                void select(active)
              }
            }}
          />
          {query && (
            <button
              type='button'
              className='grid [place-items:center] w-[28px] h-[28px] [border:0] rounded-[5px] [background:transparent] text-muted-foreground cursor-pointer shrink-0 [&:hover]:[background:var(--ui-hover)] [&:hover]:text-foreground [&:focus-visible]:[outline:1px_solid_var(--ui-blue)] [&:focus-visible]:outline-offset-[1px]'
              aria-label='Clear search'
              onClick={() => {
                changeQuery('')
                input.current?.focus()
              }}
            >
              <XIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </button>
          )}
          <kbd className='opacity-75' aria-hidden>Esc</kbd>
        </div>
        <div
          className='grid min-h-[180px] h-[min(360px,_45dvh)] [@media(max-width:_600px)]:h-[min(360px,_48dvh)] [@media(max-width:_600px)]:min-h-[100px] [&[data-preview]]:grid-cols-[minmax(0,_1.15fr)_minmax(0,_1fr)] [@media(max-width:_600px)]:[&[data-preview]]:grid-cols-[minmax(0,_1fr)]'
          data-preview={!!renderPreview || undefined}
        >
          <div className='min-w-0 min-h-0 overflow-auto overscroll-contain p-[6px]'>
            <Combobox.List
              className='max-h-[380px] overflow-auto p-[0_12px_12px] [&>button]:flex [&>button]:items-center [&>button]:gap-[12px] [&>button]:p-[12px_8px] [&>button]:rounded-[6px] [&>button]:w-full [&>button]:text-left [&>button]:text-[length:var(--dir-text-label)] [&_small]:block [&_small]:text-muted-foreground [&_small]:text-[length:var(--dir-text-caption)] [&_small]:mt-[5px] [outline:none] [&>button:hover]:[background:var(--ui-hover)] [&>button>span:nth-child(2)]:flex-1'
              aria-label='Search results'
              aria-busy={loading || busy}
            >
              {!loading && !error && groups.map(([group, entries]) => (
                <Combobox.Group key={group}>
                  <Combobox.GroupLabel className='sticky top-[-6px] z-1 p-[8px_10px] [background:var(--ui-raised)] text-muted-foreground text-[11px] font-medium'>
                    {group}
                  </Combobox.GroupLabel>
                  {entries.map((item) => (
                    <Combobox.Item
                      key={item.id}
                      value={item}
                      disabled={item.disabled || busy}
                      className='flex items-center gap-[9px] min-h-[38px] p-[7px_9px] rounded-[7px] cursor-pointer [&_strong]:text-[13px] [&_strong]:font-medium [&_strong]:whitespace-nowrap [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_small]:text-muted-foreground [&_small]:text-[12px] [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap [&_mark]:text-inherit [&_mark]:[background:transparent] [&_mark]:[font-weight:650] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-current]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-45 [&[data-disabled]]:cursor-default'
                      data-current={item.id === active?.id || undefined}
                    >
                      {renderItem ? renderItem(item) : (
                        <>
                          <span
                            className='grid [place-items:center] shrink-0 w-[23px] h-[23px] [border:1px_solid_var(--ui-border)] rounded-[6px] [background:var(--ui-surface)] text-muted-foreground [&_svg]:w-[14px] [&_svg]:h-[14px]'
                            aria-hidden
                          >
                            {item.icon ?? (
                              <AlignLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                            )}
                          </span>
                          <span className='min-w-0 flex-1 flex items-baseline gap-[7px] [@media(max-width:_600px)]:block [@media(max-width:_600px)]:[&_strong]:block [@media(max-width:_600px)]:[&_small]:block'>
                            <strong>
                              <Match text={item.label} query={query} />
                            </strong>
                            {item.description && (
                              <small>
                                <Match text={item.description} query={query} />
                              </small>
                            )}
                          </span>
                          {item.meta && (
                            <span className='ml-auto shrink-0 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap rounded-[4px] p-[1px_5px] text-[var(--ui-blue)] [background:color-mix(in_srgb,_var(--ui-blue)_9%,_transparent)] text-[10px]'>
                              {item.meta}
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Item>
                  ))}
                </Combobox.Group>
              ))}
            </Combobox.List>
            {!loading && !error && !remote.waiting && (
              <Combobox.Empty className='flex flex-col items-center justify-center gap-[9px] min-h-[170px] p-[24px] text-center text-muted-foreground text-[12px] [&_strong]:font-medium [&_strong]:text-foreground'>
                <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                <strong>{emptyMessage}</strong>
                <span>Try a different name or keyword.</span>
              </Combobox.Empty>
            )}
            {remote.waiting && (
              <div
                role='status'
                className='flex flex-col items-center justify-center gap-[9px] min-h-[170px] p-[24px] text-center text-muted-foreground text-[12px] [&_strong]:font-medium [&_strong]:text-foreground'
              >
                Type at least {minQueryLength} characters to search.
              </div>
            )}
            {loading && (
              <div
                role='status'
                className='flex flex-col items-center justify-center gap-[9px] min-h-[170px] p-[24px] text-center text-muted-foreground text-[12px] [&_strong]:font-medium [&_strong]:text-foreground'
              >
                <span
                  className='w-[16px] h-[16px] [border:1.5px_solid_var(--ui-border)] [border-top-color:var(--ui-muted)] rounded-[50%] [animation:search-spin_.8s_linear_infinite] [@media(prefers-reduced-motion:_reduce)]:[animation:none]'
                  aria-hidden
                />
                <span>Searching…</span>
              </div>
            )}
            {error && (
              <div
                role='alert'
                className='flex flex-col items-center justify-center gap-[9px] min-h-[170px] p-[24px] text-center text-muted-foreground text-[12px] [&_strong]:font-medium [&_strong]:text-foreground'
              >
                <InfoIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                <strong>{error}</strong>
                {onRetry && <Button size='sm' onClick={onRetry}>Retry search</Button>}
              </div>
            )}
          </div>
          {renderPreview && (
            <aside
              className='min-w-0 overflow-auto p-[18px] [border-left:1px_solid_var(--ui-border)] [@media(max-width:_600px)]:hidden'
              aria-label='Result preview'
            >
              {active
                ? renderPreview(active)
                : (
                  <div className='grid [place-items:center] h-full text-muted-foreground text-[12px]'>
                    Result preview
                  </div>
                )}
            </aside>
          )}
        </div>
      </Combobox.Root>
      {failure && <div role='alert' className='p-[8px_16px] text-[var(--ui-red,_#dc2626)] text-[12px]'>{failure}</div>}
      <footer className="flex items-center gap-[14px] [border-top:1px_solid_var(--ui-border)] p-[8px_12px] [&>[data-slot='button']]:ml-auto [&>[data-slot='button']]:gap-[10px] [&>[data-slot='button']]:text-[12px]">
        <span className='flex items-center gap-[4px] text-muted-foreground text-[11px] whitespace-nowrap'>
          <kbd>↑</kbd>
          <kbd>↓</kbd> Navigate
        </span>
        <span className='flex items-center gap-[4px] text-muted-foreground text-[11px] whitespace-nowrap [@media(max-width:_600px)]:hidden'>
          <kbd>Esc</kbd> Close
        </span>
        <Button size='sm' disabled={!active || busy} onClick={() => active && void select(active)}>
          {busy ? 'Selecting…' : selectLabel}
          <kbd>↵</kbd>
        </Button>
      </footer>
    </div>
  )
}

export function SearchDialog({ open, onOpenChange, title = 'Search', shortcut = false, ...props }: SearchDialogProps) {
  useEffect(() => {
    if (!shortcut) return
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.isComposing) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut, open, onOpenChange])
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      hideHeading
      className={`group/search-dialog [&_[class~='group/crm-dialog-body']]:overflow-hidden${
        props.renderPreview ? ' group/search-dialog-wide' : ''
      }`}
    >
      <SearchResults
        {...props}
        enabled={open}
        title={title}
        onClose={() => onOpenChange(false)}
        onSelect={async (item) => {
          await props.onSelect(item)
          onOpenChange(false)
        }}
      />
    </Dialog>
  )
}

export type SearchDialogTriggerProps = ComponentProps<'button'> & { placeholder?: string; shortcut?: boolean }
/** A button styled as a search field; it opens a dialog rather than accepting text. */
export function SearchDialogTrigger(
  { placeholder = 'Search…', shortcut = false, className = '', ...props }: SearchDialogTriggerProps,
) {
  const [modifier, setModifier] = useState('Ctrl')
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setModifier('⌘')
  }, [])
  return (
    <button
      type='button'
      aria-haspopup='dialog'
      aria-label={placeholder}
      {...props}
      className={`group/search-dialog-trigger flex items-center gap-[8px] w-full min-w-0 h-[34px] p-[0_10px] [border:1px_solid_var(--ui-border)] rounded-[7px] [background:var(--ui-surface)] text-muted-foreground [font:inherit] text-[13px] cursor-pointer [box-shadow:0_1px_2px_#00000005] [&_kbd]:p-[1px_4px] [&_kbd]:[font:inherit] [&_kbd]:text-[10px] [&_kbd]:[border:1px_solid_var(--ui-border)] [&_kbd]:rounded-[4px] [&_kbd]:whitespace-nowrap [&_svg]:shrink-0 [&:focus-visible]:[outline:1px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[1px] [&:disabled]:opacity-50 [&:disabled]:cursor-not-allowed [&>span:not(svg)]:flex-1 [&>span:not(svg)]:min-w-0 [&>span:not(svg)]:overflow-hidden [&>span:not(svg)]:text-ellipsis [&>span:not(svg)]:whitespace-nowrap [&>span:not(svg)]:text-left [&:hover:not(:disabled)]:[background:var(--ui-hover)] [&:hover:not(:disabled)]:text-foreground ${className}`}
    >
      <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      <span>{placeholder}</span>
      {shortcut && <kbd aria-hidden>{modifier} K</kbd>}
    </button>
  )
}
