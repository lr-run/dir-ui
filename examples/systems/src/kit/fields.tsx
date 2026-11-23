// One renderer per field type: an inline editor on the record and a control in the create form.
import { useState } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { ConfirmDialog } from '@/components/ui/confirm-dialog.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { Field } from '@/components/ui/field.tsx'
import { InlineField, InlineSelect, InlineTextarea } from '@/components/ui/inline-field.tsx'
import {
  InlineCombobox,
  InlineDate,
  InlineDateTime,
  InlineMoney,
  InlineNumber,
  InlinePercent,
} from '@/components/ui/inline-inputs.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import type { Choice } from '@/lib/choice-types.ts'
import type { KitStore } from '@/components/systems/kit/store.ts'
import type { KitField, KitRecord } from '@/components/systems/kit/types.ts'

const inputType = (field: KitField) =>
  field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'tel' ? 'tel' : 'text'
const asNumber = (value: unknown) => value == null || value === '' ? null : Number(value)

/** Choices for a member or reference field. */
export function fieldChoices(field: KitField, store: KitStore, users: Choice[]): Choice[] {
  if (field.type === 'member') return users
  if (field.type === 'reference') {
    return (store.state.records[field.reference!] ?? []).filter((record) => !record.archivedAt).map((record) => ({
      value: record.id,
      label: record.name,
    }))
  }
  return field.options ?? []
}

export function RecordField({ field, record, store, users, readOnly = false, onSave: save }: {
  field: KitField
  record: KitRecord
  store: KitStore
  users: Choice[]
  readOnly?: boolean
  onSave: (value: unknown) => void
}) {
  const [pending, setPending] = useState<{ value: string; title: string; description: string; action: string }>()
  // Choices listed in `confirm`, such as Rejected, ask in an AlertDialog before they are saved.
  const onSave = (next: unknown) => {
    const ask = typeof next === 'string' ? field.confirm?.[next] : undefined
    if (ask) setPending({ value: next as string, ...ask })
    else save(next)
  }
  const value = record.values[field.key]
  const disabled = !!record.archivedAt || field.readOnly || readOnly
  const common = { label: field.label, disabled }
  if (disabled && field.type !== 'boolean') {
    const shown = store.label(field, value)
    return <span className='block px-2 py-1 text-[13px]'>{shown == null || shown === '' ? '—' : String(shown)}</span>
  }
  switch (field.type) {
    case 'longtext':
      return <InlineTextarea {...common} value={String(value ?? '')} onValueChange={onSave} />
    case 'number':
      return <InlineNumber {...common} value={asNumber(value)} onValueChange={onSave} />
    case 'money':
      return (
        <InlineMoney {...common} value={asNumber(value)} currency={field.currency ?? 'JPY'} onValueChange={onSave} />
      )
    case 'percent':
      return <InlinePercent {...common} value={asNumber(value)} onValueChange={onSave} />
    case 'date':
      return <InlineDate {...common} value={String(value ?? '')} onValueChange={onSave} />
    case 'datetime':
      return <InlineDateTime {...common} value={String(value ?? '')} onValueChange={onSave} />
    case 'choice':
      return (
        <>
          <InlineSelect
            key={String(value)}
            {...common}
            value={String(value ?? '')}
            items={field.options!}
            onValueChange={onSave}
          />
          {pending && (
            <ConfirmDialog
              open
              title={pending.title}
              description={pending.description}
              action={pending.action}
              onOpenChange={(open) => !open && setPending(undefined)}
              onConfirm={() => {
                save(pending.value)
                setPending(undefined)
              }}
            />
          )}
        </>
      )
    case 'member':
    case 'reference':
      return (
        <InlineCombobox
          {...common}
          items={fieldChoices(field, store, users)}
          value={value == null || value === '' ? null : String(value)}
          onValueChange={onSave}
        />
      )
    case 'boolean':
      return (
        <span className='flex h-8 items-center px-2'>
          <Checkbox label={field.label} checked={!!value} disabled={disabled} onCheckedChange={onSave} />
        </span>
      )
    default:
      return (
        <InlineField
          {...common}
          type={inputType(field)}
          value={String(value ?? '')}
          onValueChange={onSave}
        />
      )
  }
}

/** A form control bound to react-hook-form, wrapped in `Field` with its label and error. */
export function FormField<V extends FieldValues>({ field, control, store, users }: {
  field: KitField
  control: Control<V>
  store: KitStore
  users: Choice[]
}) {
  return (
    <Controller
      name={field.key as Path<V>}
      control={control}
      rules={{
        validate: (value) => !field.required || (value != null && value !== '') || `${field.label} is required.`,
      }}
      render={({ field: input, fieldState }) => (
        <Field label={field.label} required={field.required} error={fieldState.error?.message}>
          {(props) => {
            switch (field.type) {
              case 'longtext':
                return <Textarea {...props} rows={3} value={input.value ?? ''} onChange={input.onChange} />
              case 'number':
              case 'money':
              case 'percent':
                return (
                  <Input
                    {...props}
                    type={field.type}
                    currency={field.currency ?? 'JPY'}
                    value={input.value ?? ''}
                    onChange={(event) => input.onChange(event.target.value)}
                  />
                )
              case 'date':
              case 'datetime':
                return (
                  <Input
                    {...props}
                    type={field.type === 'date' ? 'date' : 'datetime-local'}
                    value={input.value ?? ''}
                    onChange={input.onChange}
                  />
                )
              case 'choice':
                return (
                  <Select
                    id={props.id}
                    label={field.label}
                    items={field.options!}
                    value={input.value ?? ''}
                    onChange={input.onChange}
                  />
                )
              case 'member':
              case 'reference':
                return (
                  <SingleCombobox
                    id={props.id}
                    label={field.label}
                    invalid={props.invalid}
                    items={fieldChoices(field, store, users)}
                    value={input.value || null}
                    onValueChange={(next) => input.onChange(next ?? '')}
                  />
                )
              case 'boolean':
                return <Checkbox label={field.label} checked={!!input.value} onCheckedChange={input.onChange} />
              default:
                return (
                  <Input
                    {...props}
                    type={inputType(field)}
                    value={input.value ?? ''}
                    onChange={input.onChange}
                    onBlur={input.onBlur}
                  />
                )
            }
          }}
        </Field>
      )}
    />
  )
}
