import { GripVerticalIcon, SlidersHorizontalIcon } from 'lucide-react'
import { ToolbarButton } from '@/components/ui/toolbar-button.tsx'
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Input } from '@/components/ui/input.tsx'
import { PopoverPanel } from '@/components/ui/popover-panel.tsx'
import { moveItem } from '@/lib/query.ts'
export type ColumnDefinition = { id: string; label: string; required?: boolean; canFreeze?: boolean }
export type ColumnState = { id: string; visible: boolean; frozen?: boolean }
export type ColumnSettingsProps = {
  columns: readonly ColumnDefinition[]
  value: ColumnState[]
  onChange: (value: ColumnState[]) => void
  onReset?: () => void
  disabled?: boolean
}
export function normalizeColumns(columns: readonly ColumnDefinition[], value: readonly ColumnState[]): ColumnState[] {
  const definitions = new Map(columns.map((c) => [c.id, c])), seen = new Set<string>(), result: ColumnState[] = []
  for (const item of [...value, ...columns.map((c) => ({ id: c.id, visible: true }))]) {
    const column = definitions.get(item.id)
    if (!column || seen.has(item.id)) continue
    seen.add(item.id)
    result.push({
      ...item,
      visible: column.required ? true : item.visible,
      frozen: column.canFreeze === false ? false : 'frozen' in item ? Boolean(item.frozen) : false,
    })
  }
  return result
}
/** Reorder by stable IDs and an insertion edge, including downward index adjustment. */
export function reorderColumn(value: ColumnState[], id: string, target: string, after: boolean): ColumnState[] {
  const from = value.findIndex((column) => column.id === id)
  const over = value.findIndex((column) => column.id === target)
  if (from < 0 || over < 0 || id === target) return value
  const to = over + Number(after) - Number(from < over)
  return from === to ? value : moveItem(value, from, to)
}
type ColumnDrag = {
  id: string
  pointerId: number
  x: number
  y: number
  clientX: number
  clientY: number
  handle: HTMLButtonElement
  row: HTMLLIElement
  preview?: HTMLElement
  line?: HTMLElement
  frame?: number
  target?: { id: string; after: boolean }
}
function ColumnSettings({ columns, value, onChange, onReset, disabled }: ColumnSettingsProps) {
  const [search, setSearch] = useState(''), [announcement, setAnnouncement] = useState('')
  const normalized = useMemo(() => normalizeColumns(columns, value), [columns, value])
  const definitions = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])
  const list = useRef<HTMLUListElement>(null)
  const drag = useRef<ColumnDrag | null>(null)
  const finish = () => {
    const active = drag.current
    if (!active) return
    drag.current = null
    if (active.frame !== undefined) cancelAnimationFrame(active.frame)
    active.preview?.remove()
    active.line?.remove()
    delete active.row.dataset.dragging
    if (active.handle.hasPointerCapture(active.pointerId)) active.handle.releasePointerCapture(active.pointerId)
  }
  useEffect(() => finish, [normalized, disabled, search])
  const draw = () => {
    const active = drag.current, container = list.current
    if (!active?.preview || !active.line || !container) return
    active.frame = undefined
    // No React state or grid updates during movement. Auto-scroll stays in the same frame loop.
    const bounds = container.getBoundingClientRect()
    const inside = active.clientX >= bounds.left - 24 && active.clientX <= bounds.right + 24 &&
      active.clientY >= bounds.top - 24 && active.clientY <= bounds.bottom + 24
    const edge = 28
    const scroll = !inside
      ? 0
      : active.clientY < bounds.top + edge
      ? -Math.ceil((bounds.top + edge - active.clientY) / 5)
      : active.clientY > bounds.bottom - edge
      ? Math.ceil((active.clientY - bounds.bottom + edge) / 5)
      : 0
    const previousScroll = container.scrollTop
    if (scroll) container.scrollTop += Math.max(-12, Math.min(12, scroll))
    active.preview.style.transform = `translate3d(${active.clientX - active.x}px, ${active.clientY - active.y}px, 0)`
    active.target = undefined
    active.line.hidden = true
    if (inside) {
      const rows = Array.from(container.querySelectorAll<HTMLLIElement>('[data-column-id]'))
      const target = rows.find((row) => active.clientY < row.getBoundingClientRect().bottom) ?? rows.at(-1)
      if (target) {
        const rect = target.getBoundingClientRect()
        const after = active.clientY >= rect.top + rect.height / 2
        const id = target.dataset.columnId!
        const lineY = after ? rect.bottom : rect.top
        if (lineY >= bounds.top && lineY <= bounds.bottom) {
          active.target = { id, after }
          const from = normalized.findIndex((column) => column.id === active.id)
          const over = normalized.findIndex((column) => column.id === id)
          if (id !== active.id && over + Number(after) - Number(from < over) !== from) {
            active.line.hidden = false
            active.line.style.width = `${rect.width}px`
            active.line.style.transform = `translate3d(${rect.left}px, ${lineY - 1}px, 0)`
          }
        }
      }
    }
    if (container.scrollTop !== previousScroll) active.frame = requestAnimationFrame(draw)
  }
  const pointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    active.clientX = event.clientX
    active.clientY = event.clientY
    if (!active.preview) {
      if (Math.hypot(event.clientX - active.x, event.clientY - active.y) < 5) return
      const rect = active.row.getBoundingClientRect()
      const computed = getComputedStyle(active.row)
      const preview = active.row.cloneNode(true) as HTMLElement
      preview.removeAttribute('id')
      preview.removeAttribute('data-column-id')
      preview.setAttribute('aria-hidden', 'true')
      preview.inert = true
      for (const element of preview.querySelectorAll('[id]')) element.removeAttribute('id')
      // Keep the original row's exact dimensions and inherited theme when portaled to body.
      for (const property of computed) {
        if (property.startsWith('--')) preview.style.setProperty(property, computed.getPropertyValue(property))
      }
      Object.assign(preview.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        zIndex: '2147483646',
        font: computed.font,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        boxShadow: '0 4px 12px #00000026',
        borderRadius: '6px',
        listStyle: 'none',
      })
      const line = document.createElement('div')
      line.setAttribute('aria-hidden', 'true')
      Object.assign(line.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        height: '2px',
        pointerEvents: 'none',
        zIndex: '2147483647',
        backgroundColor: computed.getPropertyValue('--ui-accent') || computed.color,
      })
      line.hidden = true
      document.body.append(preview, line)
      active.preview = preview
      active.line = line
      active.x -= rect.left
      active.y -= rect.top
      active.row.dataset.dragging = 'true'
    }
    if (active.frame === undefined) active.frame = requestAnimationFrame(draw)
  }
  const drop = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    if (active.preview) {
      if (active.frame !== undefined) cancelAnimationFrame(active.frame)
      active.clientX = event.clientX
      active.clientY = event.clientY
      draw()
    }
    const target = active.target
    const next = target ? reorderColumn(normalized, active.id, target.id, target.after) : normalized
    finish()
    if (!disabled && !search && next !== normalized) {
      onChange(next)
      setAnnouncement(
        `${definitions.get(active.id)?.label} moved to position ${next.findIndex((c) => c.id === active.id) + 1}.`,
      )
    }
  }
  const patch = (index: number, changes: Partial<ColumnState>) =>
    onChange(normalized.map((c, i) => i === index ? { ...c, ...changes } : c))
  return (
    <div className='grid w-full min-h-0 gap-3'>
      <span className='sr-only' role='status'>{announcement}</span>
      <Input
        className='h-8 min-w-0 w-full text-[13px]'
        aria-label='Search columns'
        placeholder='Search columns…'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul ref={list} className='m-0 min-h-0 max-h-[min(420px,55dvh)] list-none overflow-y-auto overscroll-contain p-0'>
        {normalized.map((state, index) => {
          const column = definitions.get(state.id)!
          return column.label.toLowerCase().includes(search.toLowerCase()) && (
            <li
              key={state.id}
              data-column-id={state.id}
              className='relative flex items-center gap-1.5 bg-popover py-[5px] text-[13px] data-dragging:opacity-30'
            >
              <button
                type='button'
                aria-label={`Drag ${column.label} to reorder`}
                title='Drag to reorder, or use Alt + Up / Down'
                disabled={disabled || !!search || normalized.length < 2}
                className='flex h-7 w-5 shrink-0 touch-none items-center justify-center rounded text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring disabled:cursor-default disabled:opacity-40'
                onPointerDown={(event) => {
                  if (event.button !== 0 || !event.isPrimary || disabled || search) return
                  event.preventDefault()
                  finish()
                  event.currentTarget.focus()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  drag.current = {
                    id: state.id,
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    handle: event.currentTarget,
                    row: event.currentTarget.closest('li')!,
                  }
                }}
                onPointerMove={pointerMove}
                onPointerUp={drop}
                onPointerCancel={finish}
                onLostPointerCapture={finish}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && drag.current) {
                    event.preventDefault()
                    event.stopPropagation()
                    finish()
                  } else if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                    event.preventDefault()
                    const to = index + (event.key === 'ArrowUp' ? -1 : 1)
                    if (to >= 0 && to < normalized.length) onChange(moveItem(normalized, index, to))
                  }
                }}
              >
                <GripVerticalIcon size={14} strokeWidth={1.5} aria-hidden />
              </button>
              <Checkbox
                label={`Show ${column.label}`}
                checked={state.visible}
                disabled={disabled || column.required}
                onCheckedChange={(visible) => patch(index, { visible })}
              />
              <span className='flex-1 min-w-0 [&_small]:block [&_small]:text-[10px] [&_small]:text-muted-foreground'>
                {column.label}
                {column.required && <small>Required</small>}
              </span>
              <IconButton
                className='h-7 min-h-7 w-[26px] shrink-0 p-0'
                label={`${state.frozen ? 'Unfreeze' : 'Freeze'} ${column.label}`}
                disabled={disabled || column.canFreeze === false || !state.visible}
                aria-pressed={!!state.frozen}
                onClick={() => patch(index, { frozen: !state.frozen })}
              >
                {state.frozen ? '◆' : '◇'}
              </IconButton>
              <IconButton
                className='h-7 min-h-7 w-[26px] shrink-0 p-0'
                label={`Move ${column.label} up`}
                disabled={disabled || !!search || index === 0}
                onClick={() => onChange(moveItem(normalized, index, index - 1))}
              >
                ↑
              </IconButton>
              <IconButton
                className='h-7 min-h-7 w-[26px] shrink-0 p-0'
                label={`Move ${column.label} down`}
                disabled={disabled || !!search || index === normalized.length - 1}
                onClick={() => onChange(moveItem(normalized, index, index + 1))}
              >
                ↓
              </IconButton>
            </li>
          )
        })}
      </ul>
      {!normalized.some((c) => definitions.get(c.id)!.label.toLowerCase().includes(search.toLowerCase())) && (
        <p role='status'>No columns found.</p>
      )}
      {onReset && <Button variant='ghost' disabled={disabled} onClick={onReset}>Reset columns</Button>}
    </div>
  )
}
export function ColumnSettingsMenu(props: ColumnSettingsProps) {
  return (
    <PopoverPanel
      title='Columns'
      width={360}
      className='flex flex-col gap-[8px]'
      trigger={
        <ToolbarButton
          icon={<SlidersHorizontalIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
          chevron
          disabled={props.disabled}
        >
          <span>Columns</span>
        </ToolbarButton>
      }
    >
      <ColumnSettings {...props} />
    </PopoverPanel>
  )
}
