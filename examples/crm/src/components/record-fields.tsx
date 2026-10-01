import { useMemo } from 'react'
import { createRecordChoiceLoader } from '@/components/crm/example/query.ts'
import { recordFieldChange } from '@/components/crm/components/record-editing.ts'
import { type Control, Controller, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form'
import { InlineEdit } from '@/components/ui/inline-edit.tsx'
import { InlineCombobox } from '@/components/ui/inline-inputs.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { Input, type InputType } from '@/components/ui/input.tsx'
import { Field } from '@/components/ui/field.tsx'
import type { ExampleState } from '@/components/crm/example/store.ts'
import type { ExampleKind, RecordDraft, RecordField } from '@/components/crm/types.ts'
export type Choice = { value: string; label: string; disabled?: boolean }
export function recordChoices(
  state: ExampleState,
  kind: ExampleKind,
  companyId?: string,
  selectedId?: string,
): Choice[] {
  return state.records.filter((r) =>
    r.kind === kind && (!companyId || 'companyId' in r && r.companyId === companyId || r.id === selectedId)
  )
    .map((r) => ({ value: r.id, label: r.name + (r.archivedAt ? ' (archived)' : ''), disabled: !!r.archivedAt }))
}
export function userChoices(state: ExampleState): Choice[] {
  return state.users.map((u) => ({
    value: u.id,
    label: u.name + (u.isActive ? '' : ' (inactive)'),
    disabled: !u.isActive,
  }))
}
export function localDateTime(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export function utcDateTime(value: string) {
  return value ? new Date(value).toISOString() : ''
}
export function textField(
  id: keyof RecordDraft,
  label: string,
  type: InputType = 'text',
  required = false,
): RecordField {
  return {
    id,
    label,
    editor: { type: 'text', inputType: type, required },
    render: ({ record, onChange }) => {
      const raw = Reflect.get(record.data, id)
      const value = type === 'datetime-local' ? localDateTime(String(raw ?? '')) : String(raw ?? '')
      return (
        <InlineEdit
          label={label}
          value={value}
          type={type}
          currency={record.currency}
          disabled={!!record.archivedAt}
          min={type === 'money' ? 0 : undefined}
          step={type === 'money' ? 0.01 : undefined}
          validate={required ? (v) => !v.trim() ? `${label} is required.` : undefined : undefined}
          onValueChange={(v) =>
            onChange(
              { [id]: type === 'datetime-local' ? utcDateTime(v) : id === 'amount' ? (v || null) : v } as Partial<
                RecordDraft
              >,
              label,
            )}
        />
      )
    },
  }
}
export function choiceField(id: keyof RecordDraft, label: string, items: Choice[], required = false): RecordField {
  const loadOptions = ['companyId', 'dealId', 'personId'].includes(id) ? createRecordChoiceLoader(items) : undefined
  return {
    id,
    label,
    editor: { type: 'choice', items, required, loadOptions },
    render: ({ record, onChange }) => {
      const value = String(Reflect.get(record.data, id) ?? '')
      const options = [...items]
      if (value && !options.some((i) => i.value === value)) {
        options.push({
          value,
          label: (id === 'personId'
            ? record.person
            : id === 'dealId'
            ? record.deal
            : id === 'companyId'
            ? record.company
            : id === 'ownerId' || id === 'assigneeId'
            ? record.owner
            : undefined) || value,
          disabled: true,
        })
      }
      return (
        <InlineCombobox
          label={label}
          value={value || null}
          items={options}
          loadOptions={loadOptions}
          selectedItems={options}
          clearable={!required}
          disabled={!!record.archivedAt}
          onValueChange={(v) => onChange(recordFieldChange(record.data, id, v ?? ''), label)}
        />
      )
    },
  }
}
export function TextField<T extends FieldValues>(
  { name, label, register, type = 'text', required = false, error }: {
    name: Path<T>
    label: string
    register: UseFormRegister<T>
    type?: InputType
    required?: boolean
    error?: string
  },
) {
  return (
    <Field label={label} required={required} error={error}>
      {(p) => (
        <Input
          {...p}
          {...register(name)}
          type={type}
          min={type === 'money' ? 0 : undefined}
          step={type === 'money' ? 0.01 : undefined}
        />
      )}
    </Field>
  )
}
export function ChoiceField<T extends FieldValues>(
  { name, label, control, items, required = false }: {
    name: Path<T>
    label: string
    control: Control<T>
    items: Choice[]
    required?: boolean
  },
) {
  const loadOptions = useMemo(
    () => ['companyId', 'dealId', 'personId'].includes(name) ? createRecordChoiceLoader(items) : undefined,
    [name, items],
  )
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field label={label} required={required} error={fieldState.error?.message}>
          {(p) => (
            <SingleCombobox
              {...p}
              label={label}
              value={field.value || null}
              items={items}
              loadOptions={loadOptions}
              selectedItems={items}
              clearable={!required}
              onValueChange={(v) => field.onChange(v ?? '')}
              onBlur={field.onBlur}
            />
          )}
        </Field>
      )}
    />
  )
}
