import type { CSSProperties } from 'react'
import { type FocusEventHandler, type ReactNode, type Ref, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './index.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select.tsx'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '../shadcn/combobox.tsx'
import type { Choice } from './choice-types.ts'
export type { Choice } from './choice-types.ts'
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
export function ChoiceContent({ item, compact = false }: { item: Choice; compact?: boolean }) {
  return (
    <span className='inline-flex items-center gap-[7px] min-w-0 [&_small]:block [&_small]:text-muted-foreground [&_small]:text-[11px]'>
      {item.avatar && <img src={item.avatar} alt='' className='w-[20px] h-[20px] object-cover rounded-[50%]' />}
      {item.color && (
        <span
          className='w-[7px] h-[7px] rounded-[50%] flex-none bg-(--choice-color)'
          style={{ '--choice-color': item.color } as CSSProperties}
        />
      )}
      <span>{item.label}{!compact && item.description && <small>{item.description}</small>}</span>
    </span>
  )
}
function useChoices(props: ComboboxOptions, open: boolean, query: string) {
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
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load options.')
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
  }, [open, query, loadOptions, debounceMs, revision])
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
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load options.')
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
    more,
    hasMore: !!page.cursor,
    truncated: filtered.length > maxVisible,
    retry: () => retry((n) => n + 1),
    remember,
  }
}
type Props = {
  items: Choice[]
  value: string[]
  onValueChange: (value: string[]) => void
  label: string
  id?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  'aria-describedby'?: string
}
export function MultiSelect(
  { items, value, onValueChange, label, id, disabled, readOnly, invalid, open, onOpenChange, ...aria }: Props & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  },
) {
  return (
    <Select
      multiple
      items={items}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || readOnly}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        {...aria}
        id={id}
        aria-label={label}
        aria-invalid={invalid}
        className="[box-shadow:0_1px_2px_#00000005] [transition:border-color_120ms,_box-shadow_120ms] w-full min-w-0 h-[36px] p-[7px_10px] [border:1px_solid_var(--ui-border)] rounded-[var(--dir-radius)] [background:var(--ui-raised)] text-foreground text-[length:var(--dir-text-body)] [outline:none] [&:disabled]:cursor-not-allowed [&[readonly]]:[background:var(--ui-subtle)] [&[readonly]]:text-muted-foreground [&:disabled]:opacity-55 [textarea&]:h-auto [textarea&]:min-h-[90px] [textarea&]:resize-y [textarea&]:leading-[1.6] [@media(prefers-reduced-motion:reduce)]:[transition:none] [&:focus]:[outline:none] [&:focus]:outline-offset-0 [&:focus]:[border-color:var(--ui-ring)] [&:focus]:[box-shadow:none] [&:focus-visible]:[outline:none] [&:focus-visible]:outline-offset-0 [&:focus-visible]:[border-color:var(--ui-ring)] [&:focus-visible]:[box-shadow:none] [&[aria-invalid='true']]:[border-color:var(--ui-red)] [&[aria-invalid='true']]:[box-shadow:none] [&::placeholder]:text-muted-foreground [&::placeholder]:opacity-75 [&[aria-invalid='true']:focus]:[box-shadow:none] [&[aria-invalid='true']:focus]:[border-color:var(--ui-red)] [&:is(:focus,_:focus-visible)]:[border-color:var(--ui-ring)] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:outline-offset-0 [&:is(:focus,_:focus-visible)]:[box-shadow:none] group/crm-select flex items-center justify-between gap-[12px] text-left [&_[class~='group/svg-wrap']]:w-[14px] [&_[class~='group/svg-wrap']]:h-[14px] [&_[class~='group/svg-wrap']]:shrink-0 [&>span:first-child]:overflow-hidden [&>span:first-child]:text-ellipsis [&>span:first-child]:whitespace-nowrap"
      >
        <SelectValue>
          {() =>
            value.length
              ? items.filter((i) => value.includes(i.value)).map((i) => i.label).join(', ')
              : 'Select an option'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

export function MultiCombobox(props: ComboboxOptions & { value: string[]; onValueChange: (value: string[]) => void }) {
  const { value, onValueChange, label, id, disabled, readOnly, invalid, ref, onBlur, renderOption, renderValue } = props
  const anchor = useRef<HTMLDivElement>(null), [open, setOpen] = useState(false), [query, setQuery] = useState('')
  const data = useChoices(props, open, query), selected = value.map((v) => data.lookup.get(v) ?? { value: v, label: v })
  return (
    <Combobox<Choice, true>
      multiple
      items={data.options}
      filter={null}
      value={selected}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      onValueChange={(next, details) => {
        if (details.reason === 'escape-key') {
          details.cancel()
          return
        }
        data.remember(next)
        onValueChange(next.map((i) => i.value))
      }}
      itemToStringLabel={(i) => i.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled || readOnly}
    >
      <ComboboxChips
        ref={anchor}
        className="group/catalog-combobox-chips min-h-[32px] h-auto w-full [&_[data-slot='combobox-chip-input']]:h-[22px] [&_[data-slot='combobox-chip-input']]:min-h-0 [&_[data-slot='combobox-chip-input']]:p-0 [&_[data-slot='combobox-chip-input']]:[border:0] [&_[data-slot='combobox-chip-input']]:rounded-none [&_[data-slot='combobox-chip-input']]:[background:transparent] [&_[data-slot='combobox-chip-input']]:[box-shadow:none] [&_[data-slot='combobox-chip-input']]:[font:inherit] [&_[data-slot='combobox-chip-input']]:leading-[22px] [&[data-invalid]]:[border-color:var(--ui-red)]"
        data-disabled={disabled || readOnly || undefined}
        data-invalid={invalid || undefined}
      >
        <ComboboxValue>
          {(values: Choice[]) =>
            values.map((item) => (
              <ComboboxChip key={item.value} showRemove={!readOnly && !disabled} removeLabel={`Remove ${item.label}`}>
                {renderValue?.(item) ?? <ChoiceContent item={item} compact />}
              </ComboboxChip>
            ))}
        </ComboboxValue>
        <ComboboxChipsInput
          id={id}
          ref={ref}
          onBlur={onBlur}
          aria-label={label}
          aria-invalid={invalid}
          aria-describedby={props['aria-describedby']}
          placeholder={readOnly ? '' : props.placeholder ?? 'Search to add…'}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{data.loading ? 'Searching…' : data.error ? '' : 'No options found'}</ComboboxEmpty>
        <ComboboxList>
          {(item: Choice) => (
            <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
              {renderOption?.(item) ?? <ChoiceContent item={item} />}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ChoiceFooter data={data} query={query} onCreate={props.onCreate} />
      </ComboboxContent>
    </Combobox>
  )
}
export function SingleCombobox(
  props: ComboboxOptions & { value: string | null; onValueChange: (value: string | null) => void },
) {
  const { value, onValueChange, label, id, disabled, readOnly, invalid, ref, onBlur, renderOption } = props
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), data = useChoices(props, open, query)
  const selected = value === null ? null : data.lookup.get(value) ?? { value, label: value }
  return (
    <Combobox<Choice>
      items={data.options}
      filter={null}
      value={selected}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setQuery('')
      }}
      onInputValueChange={(next, details) => {
        if (details.reason === 'input-change' || details.reason === 'input-clear') setQuery(next)
      }}
      onValueChange={(next, details) => {
        if (details.reason === 'escape-key') {
          details.cancel()
          return
        }
        data.remember(next ? [next] : [])
        onValueChange(next?.value ?? null)
      }}
      itemToStringLabel={(i) => i.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled || readOnly}
    >
      <ComboboxInput
        id={id}
        ref={ref}
        onBlur={onBlur}
        disabled={disabled || readOnly}
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={props['aria-describedby']}
        placeholder={props.placeholder ?? 'Search to select…'}
        showClear={(props.clearable ?? true) && !readOnly}
        showTrigger={!readOnly}
      />
      <ComboboxContent>
        <ComboboxEmpty>{data.loading ? 'Searching…' : data.error ? '' : 'No options found'}</ComboboxEmpty>
        <ComboboxList>
          {(item: Choice) => (
            <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
              {renderOption?.(item) ?? <ChoiceContent item={item} />}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ChoiceFooter data={data} query={query} onCreate={props.onCreate} />
      </ComboboxContent>
    </Combobox>
  )
}
function ChoiceFooter(
  { data, query, onCreate }: { data: ReturnType<typeof useChoices>; query: string; onCreate?: (query: string) => void },
) {
  return (
    <div className='p-[4px_8px] text-[12px] text-muted-foreground [&:empty]:hidden'>
      {data.error && (
        <div role='alert'>
          {data.error}
          <Button variant='ghost' onClick={data.retry}>Retry</Button>
        </div>
      )}
      {data.hasMore && (
        <Button
          disabled={data.loading}
          onClick={() => {
            void data.more()
          }}
        >
          Load more
        </Button>
      )}
      {data.truncated && <small>Refine your search to see more results.</small>}
      {onCreate && query.trim() && (
        <Button variant='ghost' onClick={() => onCreate(query.trim())}>Create “{query.trim()}”</Button>
      )}
    </div>
  )
}
