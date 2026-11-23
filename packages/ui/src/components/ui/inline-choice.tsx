import { useRef } from 'react'
import { Select } from '@/components/ui/select.tsx'
import { type Choice } from '@/lib/choice-types.ts'
import { type InlineSaveHandler, useInlineSave } from '@/hooks/use-inline-save.ts'
import { InlineSaveFeedback } from '@/components/ui/inline-save-feedback.tsx'

export function InlineSelect(props: {
  label: string
  value: string
  items: Choice[]
  onValueChange: InlineSaveHandler<string>
  disabled?: boolean
}) {
  const persistence = useInlineSave(), draft = useRef(props.value)
  const commit = async (next: string) => {
    if (props.disabled || persistence.isSaving()) return
    draft.current = next
    await persistence.save(() => props.onValueChange(next))
  }
  return (
    <div
      className="[&_[class~='group/inline-search']_:is(input,_[data-slot='combobox-chips'],_[data-slot='combobox-chip'])]:text-[length:var(--dir-text-inline,_13px)] min-w-0 [&_[aria-busy=true]]:cursor-progress"
      aria-busy={persistence.saving}
    >
      <div className="[&_[class~='group/crm-select']]:[border-color:transparent] [&_[class~='group/crm-select']]:[background:transparent] [&_[class~='group/crm-select']]:[box-shadow:none] [&_[class~='group/crm-select']]:p-[5px_8px] [&_[class~='group/crm-select']]:h-[32px] [&_[class~='group/crm-select']]:min-h-[32px] [&_[class~='group/crm-select']]:text-[length:var(--dir-text-inline,_13px)] [&_[class~='group/crm-select']:hover]:[background:var(--ui-hover)] [&_[class~='group/crm-select']>[data-slot='select-trigger-icon']]:invisible [&_[class~='group/crm-select']>[data-slot='select-trigger-icon']]:opacity-0 [&_[class~='group/crm-select']>[data-slot='select-trigger-icon']]:pointer-events-none [&_[class~='group/crm-select']>[data-slot='select-trigger-icon']]:text-muted-foreground [@media(hover:_hover)]:[&_[class~='group/crm-select']:hover:not(:disabled):not([aria-disabled='true'])>[data-slot='select-trigger-icon']]:visible [@media(hover:_hover)]:[&_[class~='group/crm-select']:hover:not(:disabled):not([aria-disabled='true'])>[data-slot='select-trigger-icon']]:opacity-100">
        <Select
          label={props.label}
          value={props.value}
          items={props.items}
          disabled={props.disabled || persistence.saving}
          invalid={!!persistence.error}
          onChange={(next) => {
            void commit(next)
          }}
        />
      </div>
      {persistence.error && (
        <p className='inline-save-status block text-muted-foreground text-xs px-2 py-1.5'>
          Unsaved: {props.items.find((item) => item.value === draft.current)?.label ?? (draft.current || 'None')}
        </p>
      )}
      <InlineSaveFeedback
        saving={persistence.saving}
        error={persistence.error}
        disabled={props.disabled}
        retry={() => {
          void commit(draft.current)
        }}
        cancel={() => {
          draft.current = props.value
          persistence.clearError()
        }}
      />
    </div>
  )
}
