import { useRef } from 'react'
import { InlineEdit } from '@/components/ui/inline-edit.tsx'
import { Input } from '@/components/ui/input.tsx'
import { DateValue, type NumberFormat, NumberValue } from '@/components/ui/value.tsx'
import { type ComboboxOptions } from '@/hooks/use-choices.ts'
import { MultiCombobox, SingleCombobox } from '@/components/ui/combobox.tsx'
import { type InlineSaveHandler, useInlineSave } from '@/hooks/use-inline-save.ts'
import { InlineSaveFeedback } from '@/components/ui/inline-save-feedback.tsx'
type NumberProps = NumberFormat & {
  label: string
  value: number | null
  onValueChange: InlineSaveHandler<number | null>
  disabled?: boolean
  min?: number
  max?: number
  step?: number | 'any'
}
export function InlineNumber(
  { value, onValueChange, label, disabled, min, max, step = 'any', ...format }: NumberProps,
) {
  const inputType = format.format === 'currency' ? 'money' : format.format === 'percent' ? 'percent' : 'number'
  return (
    <InlineEdit
      label={label}
      disabled={disabled}
      value={value === null ? '' : String(value)}
      type='number'
      display={<NumberValue value={value} {...format} />}
      onValueChange={(next) => onValueChange(next === '' ? null : Number(next))}
      validate={(next) =>
        next !== '' &&
          (!Number.isFinite(Number(next)) || Number(next) < (min ?? -Infinity) || Number(next) > (max ?? Infinity))
          ? 'Enter a number within the allowed range.'
          : undefined}
      renderInput={(props) => (
        <Input {...props} type={inputType} min={min} max={max} step={step} currency={format.currency} />
      )}
    />
  )
}
export function InlineMoney(props: Omit<NumberProps, 'format'>) {
  return <InlineNumber {...props} format='currency' />
}
export function InlinePercent(props: Omit<NumberProps, 'format'>) {
  return <InlineNumber {...props} format='percent' />
}
type DateProps = {
  label: string
  value: string
  onValueChange: InlineSaveHandler<string>
  disabled?: boolean
  locale?: string
}
export function InlineDate(props: DateProps) {
  return (
    <InlineEdit
      {...props}
      type='date'
      display={<DateValue value={props.value} locale={props.locale} />}
      renderInput={(input) => <Input {...input} type='date' />}
    />
  )
}
export function InlineDateTime(props: DateProps) {
  return (
    <InlineEdit
      {...props}
      type='datetime-local'
      display={props.value.replace('T', ' ')}
      renderInput={(input) => <Input {...input} type='datetime-local' />}
    />
  )
}
export function InlineCombobox(
  props: ComboboxOptions & { value: string | null; onValueChange: InlineSaveHandler<string | null> },
) {
  return <InlineSearch {...props} multiple={false} />
}
export function InlineMultiCombobox(
  props: ComboboxOptions & { value: string[]; onValueChange: InlineSaveHandler<string[]> },
) {
  return <InlineSearch {...props} multiple />
}
function InlineSearch(
  props:
    | (ComboboxOptions & { value: string | null; onValueChange: InlineSaveHandler<string | null>; multiple: false })
    | (ComboboxOptions & { value: string[]; onValueChange: InlineSaveHandler<string[]>; multiple: true }),
) {
  const persistence = useInlineSave(), draft = useRef<string | null | string[]>(props.value)
  const commit = async (next: string | null | string[]) => {
    if (props.disabled || props.readOnly || persistence.isSaving()) return
    draft.current = next
    await persistence.save(() =>
      props.multiple ? props.onValueChange(next as string[]) : props.onValueChange(next as string | null)
    )
  }
  return (
    <div
      className="[&_[class~='group/inline-search']_:is(input,_[data-slot='combobox-chips'],_[data-slot='combobox-chip'])]:text-[length:var(--dir-text-inline,_13px)] min-w-0 [&_[aria-busy=true]]:cursor-progress"
      aria-busy={persistence.saving}
    >
      <div className="group/inline-search [&_[data-slot='input-group']]:[border-color:transparent] [&_[data-slot='input-group']]:[background:transparent] [&_[data-slot='input-group']]:[box-shadow:none] [&_[data-slot='combobox-chips']]:[border-color:transparent] [&_[data-slot='combobox-chips']]:[background:transparent] [&_[data-slot='combobox-chips']]:[box-shadow:none] [&_[data-slot='input-group-button']_svg]:invisible [&_[data-slot='combobox-chip-remove']_svg]:invisible [&:hover_[data-slot='input-group']]:[background:var(--ui-hover)] [&:hover_[data-slot='combobox-chips']]:[background:var(--ui-hover)] [&:hover_[data-slot='input-group-button']_svg]:visible [&:hover_[data-slot='combobox-chip-remove']_svg]:visible">
        {props.multiple
          ? (
            <MultiCombobox
              {...props}
              disabled={props.disabled || persistence.saving}
              invalid={!!persistence.error || props.invalid}
              onValueChange={(next) => {
                void commit(next)
              }}
            />
          )
          : (
            <SingleCombobox
              {...props}
              disabled={props.disabled || persistence.saving}
              invalid={!!persistence.error || props.invalid}
              onValueChange={(next) => {
                void commit(next)
              }}
            />
          )}
      </div>
      {persistence.error && (
        <p className='inline-save-status block text-muted-foreground text-xs px-2 py-1.5'>
          Unsaved:{' '}
          {(Array.isArray(draft.current) ? draft.current : [draft.current]).filter(Boolean).map((id) =>
            [...props.items, ...(props.selectedItems ?? [])].find((i) => i.value === id)?.label ?? id
          ).join(', ') || 'None'}
        </p>
      )}
      <InlineSaveFeedback
        saving={persistence.saving}
        error={persistence.error}
        disabled={props.disabled}
        retry={() => {
          void commit(draft.current)
        }}
        cancel={() => persistence.clearError()}
      />
    </div>
  )
}
