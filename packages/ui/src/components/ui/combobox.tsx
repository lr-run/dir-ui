'use client'
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import * as React from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { cn } from 'cn'

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input.tsx'

const Combobox = ComboboxPrimitive.Root

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot='combobox-trigger'
      className={cn('[&_svg:not([class*=size-])]:size-4', className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        strokeWidth={1.5}
        aria-hidden='true'
        className='text-muted-foreground size-4 pointer-events-none'
      />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot='combobox-clear'
      render={<InputGroupButton variant='ghost' size='icon-xs' />}
      className={cn('', className)}
      {...props}
    >
      <XIcon strokeWidth={1.5} aria-hidden='true' className='pointer-events-none' />
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <InputGroup className={cn('w-auto', className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align='inline-end'>
        {showTrigger && (
          <InputGroupButton
            size='icon-xs'
            variant='ghost'
            render={<ComboboxTrigger />}
            data-slot='input-group-button'
            className='group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent'
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}:
  & ComboboxPrimitive.Popup.Props
  & Pick<
    ComboboxPrimitive.Positioner.Props,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-2147483140 [&_[class~='group/query-action-menu']]:min-w-[240px] isolate"
      >
        <ComboboxPrimitive.Popup
          data-slot='combobox-content'
          data-chips={!!anchor}
          className={cn(
            '[background:var(--ui-surface)] bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:border-input/30 overflow-hidden rounded-lg shadow-md ring-1 duration-100 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot='combobox-list'
      className={cn(
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 p-1 data-empty:p-0 overflow-y-auto overscroll-contain',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot='combobox-item'
      className={cn(
        'data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm [&_svg:not([class*=size-])]:size-4 relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={<span className='pointer-events-none absolute right-2 flex size-4 items-center justify-center' />}
      >
        <CheckIcon strokeWidth={1.5} aria-hidden='true' className='pointer-events-none' />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot='combobox-group'
      className={cn('', className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot='combobox-label'
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot='combobox-collection' {...props} />
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot='combobox-empty'
      className={cn(
        'text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot='combobox-separator'
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}:
  & React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips>
  & ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot='combobox-chips'
      className={cn(
        "[&:focus-within]:[border-color:var(--ui-ring)] [&:focus-within]:[outline:none] [&:focus-within]:outline-offset-0 [&:focus-within]:[box-shadow:none] [&[data-invalid]]:[border-color:var(--ui-red)] [&[data-invalid]]:[box-shadow:none] [&:has([aria-invalid='true'])]:[border-color:var(--ui-red)] [&:has([aria-invalid='true'])]:[box-shadow:none] [&[data-invalid]:focus-within]:[border-color:var(--ui-red)] [&:has([aria-invalid='true']):focus-within]:[border-color:var(--ui-red)] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[border:0] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[outline:none] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[box-shadow:none] dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-8 flex-wrap items-center gap-1 rounded-lg border bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:ring-0 has-aria-invalid:ring-0 has-data-[slot=combobox-chip]:px-1",
        className,
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  removeLabel,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
  removeLabel?: string
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot='combobox-chip'
      className={cn(
        'bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          aria-label={removeLabel}
          render={<Button variant='ghost' size='icon-xs' />}
          className='-ml-1 opacity-50 hover:opacity-100'
          data-slot='combobox-chip-remove'
        >
          <XIcon strokeWidth={1.5} aria-hidden='true' className='pointer-events-none' />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot='combobox-chip-input'
      className={cn(
        '[outline:none] [box-shadow:none] [border:0] rounded-none [background:transparent] [&:focus]:[outline:none] [&:focus]:[box-shadow:none] [&:focus]:[border:0] [&:focus]:rounded-none [&:focus]:[background:transparent] [&:focus-visible]:[outline:none] [&:focus-visible]:[box-shadow:none] [&:focus-visible]:[border:0] [&:focus-visible]:rounded-none [&:focus-visible]:[background:transparent] min-w-16 flex-1 outline-none',
        className,
      )}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import type { Choice } from '@/lib/choice-types.ts'
import { type ComboboxOptions, useChoices } from '@/hooks/use-choices.ts'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
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
