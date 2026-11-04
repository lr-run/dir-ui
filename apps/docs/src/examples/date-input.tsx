import { Calendar } from '@dir/ui/components/ui/calendar.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import type { ComponentDoc } from './index.ts'

export function DateInputDemo() {
  return (
    <div className='w-full max-w-xs'>
      <Input type='date' defaultValue='2026-11-14' aria-label='Close date' />
    </div>
  )
}
export function DateInputDateTime() {
  return (
    <div className='w-full max-w-xs'>
      <Input type='datetime-local' defaultValue='2026-11-14T10:00' aria-label='Next call' />
    </div>
  )
}
export function CalendarDemo() {
  return (
    <div className='rounded-lg border border-border bg-(--ui-raised) shadow-md'>
      <Calendar
        mode='single'
        selected={new Date(2026, 10, 14)}
        defaultMonth={new Date(2026, 10, 1)}
        captionLayout='dropdown'
        disabled={{ after: new Date(2026, 10, 30) }}
      />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: DateInputDemo,
  sections: [
    {
      id: 'datetime',
      title: 'Date and Time',
      description: 'Use `type="datetime-local"`; the time is kept when a day is picked. `Alt+↓` opens the calendar.',
      example: DateInputDateTime,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'The popover content. `min` and `max` disable days outside the range.',
      example: CalendarDemo,
    },
  ],
}
