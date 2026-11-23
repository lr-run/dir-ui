import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  CircleXIcon,
  MessageSquareIcon,
} from 'lucide-react'
import { ListItem } from '@/components/ui/list.tsx'
import { DateValue } from '@/components/ui/value.tsx'
import { type Status, statuses, type Task } from './model.ts'
export const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
export function StatusIcon({ status }: { status: Status }) {
  const Icon = {
    backlog: CircleDashedIcon,
    todo: CircleIcon,
    progress: CircleDotIcon,
    review: CircleDotIcon,
    done: CheckCircle2Icon,
    canceled: CircleXIcon,
  }[status]
  return (
    <span
      className='inline-flex shrink-0'
      style={{ color: statuses.find((item) => item.value === status)!.color }}
    >
      <Icon {...icon} />
    </span>
  )
}
export function Person({ name }: { name: string }) {
  return (
    <span
      title={name}
      aria-label={name}
      className='inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground'
    >
      {name === 'Unassigned' ? '—' : name.split(' ').map((word) => word[0]).join('')}
    </span>
  )
}
export function Priority({ value }: { value: string }) {
  const bars = { High: 3, Medium: 2, Low: 1 }[value] ?? 0
  return (
    <span
      role='img'
      title={value}
      aria-label={value}
      className='inline-grid size-4 place-items-center text-muted-foreground'
    >
      {value === 'Urgent'
        ? (
          <span
            aria-hidden='true'
            className='grid size-3.5 place-items-center rounded-sm bg-muted-foreground text-xs leading-none font-semibold text-background'
          >
            !
          </span>
        )
        : (
          <span aria-hidden='true' className='flex items-end gap-0.5'>
            {(bars ? ['h-1.5', 'h-2.5', 'h-3.5'] : ['h-px', 'h-px', 'h-px']).map((height, index) => (
              <span
                key={index}
                className={`w-0.75 rounded-xs bg-current ${height} ${bars && index >= bars ? 'opacity-35' : ''}`}
              />
            ))}
          </span>
        )}
    </span>
  )
}
export function TaskCard(
  { task, selected, disabled, onOpen, onDrag }: {
    task: Task
    selected: boolean
    disabled: boolean
    onOpen: () => void
    onDrag: (id: string | null) => void
  },
) {
  return (
    <ListItem
      draggable={!disabled}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
        onDrag(task.id)
      }}
      onDragEnd={() => onDrag(null)}
      selected={selected}
      onOpen={onOpen}
      className='task-board-card border border-border bg-(--ui-surface) p-4! [&_button]:w-full'
      title={
        <span className='flex flex-col gap-2'>
          <span className='flex items-center justify-between gap-2 text-xs font-normal text-muted-foreground'>
            <span>{task.id}</span>
            <Person name={task.owner} />
          </span>
          <span className='flex items-start gap-2 text-sm font-medium leading-5'>
            <StatusIcon status={task.status} />
            {task.title}
          </span>
        </span>
      }
      description={
        <span className='flex flex-col gap-3 pt-1'>
          <span className='flex flex-wrap items-center gap-2'>
            <Priority value={task.priority} />
            <span className='inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs'>
              <CalendarDaysIcon {...icon} />
              <DateValue value={task.due} />
            </span>
            <span className='text-xs'>{task.label}</span>
          </span>
          <span className='flex items-center justify-between text-xs'>
            <span>{task.project}</span>
            {task.comments.length > 0 && (
              <span className='inline-flex items-center gap-1'>
                <MessageSquareIcon {...icon} />
                {task.comments.length}
              </span>
            )}
          </span>
        </span>
      }
    />
  )
}

export function SaveLabel({ busy, label }: { busy: boolean; label: string }) {
  return (
    <span className='grid'>
      <span className={busy ? 'invisible col-start-1 row-start-1' : 'col-start-1 row-start-1'}>{label}</span>
      <span aria-hidden={!busy} className={busy ? 'col-start-1 row-start-1' : 'invisible col-start-1 row-start-1'}>
        Saving…
      </span>
    </span>
  )
}
