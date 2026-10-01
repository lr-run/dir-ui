import { type ComponentProps, useId, useImperativeHandle, useRef, useState } from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { Popover } from '@base-ui/react/popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from 'cn'
import { Calendar } from '@/components/ui/calendar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { calendarDate, calendarInputValue } from '@/lib/date-input.ts'

type DateInputProps = Omit<ComponentProps<'input'>, 'type'> & { type?: 'date' | 'datetime-local' }

/** Preserves native input events, form registration and date/time constraints. */
export function DateInput(
  { ref, value, defaultValue, onChange, onKeyDown, className, type = 'date', ...props }: DateInputProps,
) {
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current!, [])
  const [open, setOpen] = useState(false)
  const [uncontrolled, setUncontrolled] = useState(String(defaultValue ?? ''))
  const current = String(value ?? uncontrolled)
  const selected = calendarDate(current)
  const [month, setMonth] = useState(selected ?? new Date())
  const titleId = useId()
  const disabled = props.disabled || props.readOnly
  const minimum = calendarDate(String(props.min ?? ''))
  const maximum = calendarDate(String(props.max ?? ''))
  const setValue = (next: string) => {
    if (!input.current || disabled) return
    // Dispatch from the actual input so React Hook Form and React's value tracking
    // receive a normal change event, with the correct name, ref and form owner.
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input.current, next)
    input.current.dispatchEvent(new Event('input', { bubbles: true }))
    setOpen(false)
  }
  const showCalendar = () => {
    const next = input.current?.value ?? ''
    setUncontrolled(next)
    setMonth(calendarDate(next) ?? new Date())
    setOpen(true)
  }
  return (
    <Popover.Root open={open && !disabled} onOpenChange={(next) => next ? showCalendar() : setOpen(false)}>
      <div className='relative flex h-full w-full min-w-0 items-center' data-slot='date-input'>
        <InputPrimitive
          {...props}
          ref={input}
          disabled={disabled}
          type={type}
          value={value}
          defaultValue={defaultValue}
          data-slot='input'
          className={cn(className, 'pr-9! [&::-webkit-calendar-picker-indicator]:hidden')}
          onChange={(event) => {
            setUncontrolled(event.target.value)
            onChange?.(event)
          }}
          onKeyDown={(event) => {
            if (event.altKey && event.key === 'ArrowDown' && !disabled) {
              event.preventDefault()
              event.stopPropagation()
              showCalendar()
            } else onKeyDown?.(event)
          }}
        />
        <Popover.Trigger
          disabled={disabled}
          aria-label={props['aria-label'] ? `Choose date for ${props['aria-label']}` : 'Choose date'}
          className='absolute right-1.5 flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50'
        >
          <CalendarIcon size={14} strokeWidth={1.5} aria-hidden />
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Positioner align='start' sideOffset={4} collisionPadding={12} className='z-2147483141'>
          <Popover.Popup
            data-slot='date-picker-content'
            aria-labelledby={titleId}
            finalFocus={input}
            className='w-fit max-w-[calc(100vw-24px)] overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none'
            onKeyDown={(event) => {
              // Calendar arrows/Enter navigate dates rather than committing a grid cell.
              if (event.key !== 'Escape' && event.key !== 'Tab') event.stopPropagation()
            }}
          >
            <Popover.Title id={titleId} className='sr-only'>Choose date</Popover.Title>
            <Calendar
              mode='single'
              selected={selected}
              month={month}
              onMonthChange={setMonth}
              captionLayout='dropdown'
              startMonth={minimum ?? new Date(1900, 0)}
              endMonth={maximum ?? new Date(new Date().getFullYear() + 100, 11)}
              autoFocus
              disabled={[...(minimum ? [{ before: minimum }] : []), ...(maximum ? [{ after: maximum }] : [])]}
              onSelect={(date) => {
                if (date) setValue(calendarInputValue(date, current, type === 'datetime-local', props.min, props.max))
              }}
            />
            <div className='flex justify-end border-t border-border px-2 py-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={props.required || !current}
                onClick={() => setValue('')}
              >
                Clear date
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
