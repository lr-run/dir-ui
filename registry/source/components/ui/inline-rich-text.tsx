import '@/components/ui/dir-theme.css'
import { PencilIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Note } from '@/components/ui/rich-text.tsx'
import { Button } from '@/components/ui/button.tsx'
import { type InlineSaveHandler, useInlineSave } from '@/hooks/use-inline-save.ts'
import { InlineSaveFeedback } from '@/components/ui/inline-save-feedback.tsx'
import { RichText, type RichTextValue } from '@/components/ui/rich-text.tsx'

export type InlineRichTextProps = {
  label: string
  value: { notes: string; notesDoc?: Note }
  onValueChange: InlineSaveHandler<RichTextValue>
  disabled?: boolean
}
export function InlineRichText({ label, value, onValueChange, disabled = false }: InlineRichTextProps) {
  const [editing, setEditing] = useState(false)
  const draft = useRef<RichTextValue | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const persistence = useInlineSave()
  const finish = async (save: boolean) => {
    if (persistence.isSaving()) return
    if (save && disabled) return
    if (save && draft.current && !await persistence.save(() => onValueChange(draft.current!))) return
    persistence.clearError()
    setEditing(false)
    requestAnimationFrame(() => trigger.current?.focus())
  }
  return editing
    ? (
      <div
        className="[&_[class~='group/rich-editor-content']]:text-[length:var(--dir-text-inline,_13px)] min-w-0 [&_[class~='group/rich-editor']]:min-w-0"
        aria-busy={persistence.saving}
        onKeyDownCapture={(event) => {
          if (event.nativeEvent.isComposing || event.defaultPrevented) return
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            void finish(false)
          }
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            event.stopPropagation()
            void finish(true)
          }
        }}
      >
        <RichText
          label={label}
          initialText={value.notes}
          initialContent={value.notesDoc}
          disabled={disabled || persistence.saving}
          onUpdate={(next) => {
            draft.current = next
          }}
        />
        <InlineSaveFeedback
          saving={persistence.saving}
          error={persistence.error}
          disabled={disabled}
          retry={() => {
            void finish(true)
          }}
          cancel={() => {
            void finish(false)
          }}
        />
        {!persistence.error && (
          <div className='crm-inline-rich-actions flex gap-2 justify-end mt-2'>
            <Button
              disabled={persistence.saving}
              onClick={() => {
                void finish(false)
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={disabled || persistence.saving}
              variant='default'
              onClick={() => {
                void finish(true)
              }}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    )
    : (
      <button
        ref={trigger}
        type='button'
        className='group/inline-value flex items-center justify-between gap-[12px] min-h-[32px] w-full text-left [border:1px_solid_transparent] rounded-[5px] p-[5px_8px] [background:transparent] text-[length:var(--dir-text-inline,_13px)] [&>span:first-child]:overflow-hidden [&>span:first-child]:text-ellipsis [&>span:first-child]:whitespace-nowrap [&_[data-empty]]:text-muted-foreground [&:focus-visible]:[outline:none] [&:focus-visible]:[box-shadow:none] [&:focus-visible]:[border-color:var(--ui-ring)] [&>svg>svg]:invisible [&>svg>svg]:opacity-0 [&>svg>svg]:pointer-events-none [&>svg>svg]:text-muted-foreground [&:hover:not(:disabled)]:[background:var(--ui-hover)] [&:is(:focus,_:focus-visible)]:[border-color:var(--ui-ring)] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:outline-offset-0 [&:is(:focus,_:focus-visible)]:[box-shadow:none] [@media(hover:_hover)]:[&:hover:not(:disabled)>svg>svg]:visible [@media(hover:_hover)]:[&:hover:not(:disabled)>svg>svg]:opacity-100'
        disabled={disabled}
        aria-label={`Edit ${label}`}
        onClick={() => {
          persistence.clearError()
          draft.current = null
          setEditing(true)
        }}
      >
        <span data-empty={!value.notes || undefined}>{value.notes || 'Add notes'}</span>
        <PencilIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      </button>
    )
}
