import type { RenderEditCellProps } from 'react-data-grid'
import { Input } from '@/components/ui/input.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { localDateTime, utcDateTime } from '@/components/crm/components/record-fields.tsx'
import { recordFieldChange } from '@/components/crm/components/record-editing.ts'
import { projectRecord } from '@/components/crm/example/data.ts'
import type { ExampleState } from '@/components/crm/example/store.ts'
import type { RecordChange } from '@/components/crm/types.ts'
import type { ExampleRecord, RecordField } from '@/components/crm/types.ts'

/** The grid owns the draft, commit/cancel lifecycle and keyboard navigation. */
export function RecordCellEditor({ row, onRowChange, onClose, field, state }: RenderEditCellProps<ExampleRecord> & {
  field: RecordField
  state: ExampleState
}) {
  const spec = field.editor
  if (!spec) return null
  const value = Reflect.get(row.data, field.id)
  const change = (patch: RecordChange, commit = false) => {
    const data = { ...row.data, ...patch }
    onRowChange(projectRecord(data, state.records, state.users, state.stages), commit)
  }
  const options = spec.type === 'text' ? [] : [...spec.items]
  const selectedIds = Array.isArray(value) ? value : value ? [String(value)] : []
  for (const id of selectedIds) {
    if (!options.some((option) => option.value === id)) {
      const label = state.records.find((record) => record.id === id)?.name ??
        state.users.find((user) => user.id === id)?.name ?? id
      options.push({ value: id, label, disabled: true })
    }
  }
  const input = spec.type === 'text'
    ? (
      <Input
        autoFocus
        aria-label={field.label}
        required={spec.required}
        type={spec.inputType}
        currency={row.currency}
        min={spec.inputType === 'money' ? 0 : undefined}
        step={spec.inputType === 'money' ? 0.01 : undefined}
        value={spec.inputType === 'datetime-local' ? localDateTime(String(value ?? '')) : String(value ?? '')}
        onFocus={(event) => event.target.select()}
        onChange={(event) =>
          change({
            [field.id]: spec.inputType === 'datetime-local'
              ? utcDateTime(event.target.value)
              : field.id === 'amount'
              ? event.target.value || null
              : event.target.value,
          })}
        className='h-full min-h-0 w-full rounded-none border-0 bg-transparent px-2 text-[13px] shadow-none focus-visible:ring-0'
      />
    )
    : (
      <SingleCombobox
        modal={false}
        autoFocus
        label={field.label}
        value={value ? String(value) : null}
        items={options}
        loadOptions={spec.loadOptions}
        selectedItems={options}
        clearable={!spec.required}
        onValueChange={(next) => change(recordFieldChange(row.data, field.id, next ?? ''), true)}
      />
    )
  return (
    <div
      className='h-full min-w-0 [&_[data-slot=input-group]]:h-full [&_[data-slot=input-group]]:rounded-none [&_[data-slot=combobox-chips]]:h-full [&_[data-slot=combobox-chips]]:flex-nowrap [&_[data-slot=combobox-chips]]:overflow-hidden [&_input]:text-[13px]'
      onKeyDownCapture={(event) => {
        if (event.nativeEvent.isComposing) {
          event.stopPropagation()
        } else if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose(false)
        }
      }}
      onKeyDown={(event) => {
        // The combobox owns arrow keys and Enter while its popup is open.
        if (spec.type !== 'text' && (event.key === 'Enter' || event.key.startsWith('Arrow'))) {
          event.stopPropagation()
          if (event.key === 'Enter' && !(event.target as HTMLElement).closest('[aria-expanded=true]')) onClose(true)
        }
      }}
    >
      {input}
    </div>
  )
}
