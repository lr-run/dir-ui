import '@/components/ui/dir-theme.css'
import { PencilIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, useId, useRef, useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Input, type InputType } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { DateValue, NumberValue } from '@/components/ui/value.tsx'
import { type InlineSaveHandler, useInlineSave } from '@/hooks/use-inline-save.ts'
import { InlineSaveFeedback } from '@/components/ui/inline-save-feedback.tsx'

export type InlineEditProps = {
  label: string
  value: string
  onValueChange: InlineSaveHandler<string>
  placeholder?: string
  type?: InputType
  currency?: string
  min?: number | string
  max?: number | string
  step?: number | 'any'
  rows?: number
  display?: ReactNode
  renderInput?: (props: ComponentProps<typeof Input>) => ReactNode
  multiline?: boolean
  disabled?: boolean
  validate?: (value: string) => string | undefined
}
export function InlineEdit(
  {
    label,
    value,
    onValueChange,
    placeholder = 'Add a value',
    type = 'text',
    currency = 'USD',
    min,
    max,
    step = 'any',
    rows = 4,
    multiline = false,
    disabled = false,
    validate,
    display,
    renderInput,
  }: InlineEditProps,
) {
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(value)
  const id = useId(), persistence = useInlineSave(), popup = useRef<HTMLDivElement>(null)
  const cancel = () => {
    if (persistence.isSaving()) return
    setOpen(false)
    setDraft(value)
    persistence.clearError()
  }
  const commit = async () => {
    if (disabled || persistence.isSaving()) return
    const input = popup.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
    if (input && !input.validity.valid) {
      persistence.setError(input.validationMessage)
      return
    }
    const next = draft.trim()
    const numeric = ['number', 'money', 'percent'].includes(type)
    const number = Number(next)
    const error = validate?.(next) ||
      (numeric && next !== '' &&
          (!Number.isFinite(number) || number < (min === undefined ? -Infinity : Number(min)) ||
            number > (max === undefined ? Infinity : Number(max)))
        ? 'Enter a number within the allowed range.'
        : undefined)
    if (error) {
      persistence.setError(error)
      return
    }
    if (next === value) {
      cancel()
      return
    }
    if (await persistence.save(() => onValueChange(next))) setOpen(false)
  }
  const inputProps = {
    'aria-label': label,
    value: draft,
    disabled: disabled || persistence.saving,
    invalid: !!persistence.error,
    'aria-describedby': `${id}-hint`,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft(event.target.value)
      persistence.clearError()
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
        event.preventDefault()
        void commit()
      }
    },
  }
  const formatted = display ??
    (type === 'money' || type === 'percent' || type === 'number'
      ? (
        <NumberValue
          value={value === '' ? null : Number(value)}
          format={type === 'money' ? 'currency' : type === 'percent' ? 'percent' : 'number'}
          currency={currency}
        />
      )
      : type === 'date'
      ? <DateValue value={value} />
      : type === 'datetime-local'
      ? value.replace('T', ' ')
      : type === 'password'
      ? '••••••••'
      : value)
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next, details) => {
        if (next) {
          setDraft(value)
          persistence.clearError()
          setOpen(true)
          return
        }
        if (persistence.isSaving()) {
          details.cancel()
          return
        }
        if (details.reason === 'escape-key') {
          cancel()
          return
        }
        // Keep the popup and draft until persistence has actually succeeded.
        details.cancel()
        // A failed request requires an explicit retry, not another outside click.
        if (!persistence.error) void commit()
      }}
    >
      <Popover.Trigger
        className='group/inline-value flex items-center justify-between gap-[12px] min-h-[32px] w-full text-left [border:1px_solid_transparent] rounded-[5px] p-[5px_8px] [background:transparent] text-[length:var(--dir-text-inline,_13px)] [&>span:first-child]:overflow-hidden [&>span:first-child]:text-ellipsis [&>span:first-child]:whitespace-nowrap [&_[data-empty]]:text-muted-foreground [&:focus-visible]:[outline:none] [&:focus-visible]:[box-shadow:none] [&:focus-visible]:[border-color:var(--ui-ring)] [&>svg>svg]:invisible [&>svg>svg]:opacity-0 [&>svg>svg]:pointer-events-none [&>svg>svg]:text-muted-foreground [&:hover:not(:disabled)]:[background:var(--ui-hover)] [&:is(:focus,_:focus-visible)]:[border-color:var(--ui-ring)] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:outline-offset-0 [&:is(:focus,_:focus-visible)]:[box-shadow:none] [@media(hover:_hover)]:[&:hover:not(:disabled)>svg>svg]:visible [@media(hover:_hover)]:[&:hover:not(:disabled)>svg>svg]:opacity-100'
        disabled={disabled}
        aria-label={`Edit ${label}`}
      >
        <span data-empty={!value || undefined}>{value ? formatted : placeholder}</span>
        <PencilIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="z-2147483140 [&_[class~='group/query-action-menu']]:min-w-[240px]"
          align='start'
          sideOffset={-36}
          collisionPadding={12}
        >
          <Popover.Popup
            ref={popup}
            className="[background:var(--ui-surface)] [border:1px_solid_var(--ui-ring)] rounded-[7px] w-[min(330px,calc(100vw_-_32px))] p-0 [box-shadow:0_4px_18px_#00000018] overflow-hidden [outline:none] text-[length:var(--dir-text-inline,_13px)] [&_input]:text-[length:var(--dir-text-inline,_13px)] [&_textarea]:text-[length:var(--dir-text-inline,_13px)] [&_[data-slot='input']]:[border:0] [&_[data-slot='input']]:[box-shadow:none] [&_[data-slot='input']]:[outline:none] [&_[data-slot='input']]:[background:transparent] [&_[data-slot='input']]:rounded-none [&_[data-slot='input']]:min-h-[36px] [&_[data-slot='input']]:p-[9px_10px] [&_[data-slot='input']]:text-[length:var(--dir-text-inline,_13px)] [&_textarea[data-slot='input']]:min-h-[130px] [&_textarea[data-slot='input']]:resize-y [&_[data-slot='input']:focus]:[border:0] [&_[data-slot='input']:focus]:[box-shadow:none] [&_[data-slot='input']:focus]:[outline:none] [&_[data-slot='input']:focus]:[background:transparent] [&_[data-slot='input']:focus]:rounded-none [&_[data-slot='input']:focus]:min-h-[36px] [&_[data-slot='input']:focus]:p-[9px_10px] [&_[data-slot='input']:focus]:text-[length:var(--dir-text-inline,_13px)] [&_[data-slot='input']:focus-visible]:[border:0] [&_[data-slot='input']:focus-visible]:[box-shadow:none] [&_[data-slot='input']:focus-visible]:[outline:none] [&_[data-slot='input']:focus-visible]:[background:transparent] [&_[data-slot='input']:focus-visible]:rounded-none [&_[data-slot='input']:focus-visible]:min-h-[36px] [&_[data-slot='input']:focus-visible]:p-[9px_10px] [&_[data-slot='input']:focus-visible]:text-[length:var(--dir-text-inline,_13px)] [&_[data-slot='input']:focus-visible]:[box-shadow:none] [&_[data-slot='input']:focus-visible]:[outline:none] [&_[data-slot='input']:focus-visible]:[border:0] [&_[data-slot='textarea']:focus-visible]:[box-shadow:none] [&_[data-slot='textarea']:focus-visible]:[outline:none] [&_[data-slot='textarea']:focus-visible]:[border:0] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[border:0] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[outline:none] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[box-shadow:none]"
            aria-busy={persistence.saving}
          >
            <Popover.Title className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
              Edit {label}
            </Popover.Title>
            {renderInput ? renderInput(inputProps) : multiline ? <Textarea {...inputProps} rows={rows} /> : (
              <Input
                {...inputProps}
                type={type}
                currency={currency}
                min={min}
                max={max}
                step={step}
                onFocus={(event) => event.target.select()}
              />
            )}
            <div id={`${id}-hint`}>
              <InlineSaveFeedback
                saving={persistence.saving}
                error={persistence.error}
                disabled={disabled}
                retry={() => {
                  void commit()
                }}
                cancel={cancel}
              />
              {!persistence.saving && !persistence.error && (
                <div className='flex justify-between gap-[14px] p-[7px_10px] [border-top:1px_solid_var(--ui-border)] [background:var(--ui-subtle)] text-[10px] text-muted-foreground [&_kbd]:[font-family:inherit] [&_kbd]:text-foreground [&_kbd]:mr-[4px] [&_[role=alert]]:text-destructive [&_[role=alert]]:text-[12px]'>
                  <span>
                    <kbd>{multiline ? '⌘/Ctrl ↵' : '↵'}</kbd> Save
                  </span>
                  <span>
                    <kbd>esc</kbd> Cancel
                  </span>
                </div>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
export { InlineRichText, type InlineRichTextProps } from '@/components/ui/inline-rich-text.tsx'
export { InlineMultiSelect, InlineSelect } from '@/components/ui/inline-choice.tsx'
export type { InlineSaveHandler } from '@/hooks/use-inline-save.ts'

export function InlineInput(props: Omit<InlineEditProps, 'multiline' | 'rows'>) {
  return <InlineEdit {...props} />
}
export function InlineTextarea(
  props: Omit<InlineEditProps, 'type' | 'currency' | 'min' | 'max' | 'step' | 'multiline'>,
) {
  return <InlineEdit {...props} multiline />
}
