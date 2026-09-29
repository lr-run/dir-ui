import { ToolbarButton } from '../../ui/toolbar-button.tsx'
import { useState } from 'react'
import { Button, Checkbox, IconButton } from '../../ui/index.tsx'
import { TextInput } from '../../ui/input.tsx'
import { PopoverPanel } from '../../ui/popover-panel.tsx'
import { moveItem } from '../../query/model.ts'
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
function ColumnSettings({ columns, value, onChange, onReset, disabled }: ColumnSettingsProps) {
  const [search, setSearch] = useState(''), [dragging, setDragging] = useState<number | null>(null)
  const normalized = normalizeColumns(columns, value), definitions = new Map(columns.map((c) => [c.id, c]))
  const patch = (index: number, changes: Partial<ColumnState>) =>
    onChange(normalized.map((c, i) => i === index ? { ...c, ...changes } : c))
  return (
    <div className="grid gap-[12px] w-full min-h-0 [&_ul]:list-none [&_ul]:m-0 [&_ul]:p-0 [&>ul]:min-h-0 [&>ul]:max-h-[min(420px,_55dvh)] [&>ul]:overflow-y-auto [&_li]:flex [&_li]:items-center [&_li]:gap-[6px] [&_li]:p-[5px_0] [&_li]:text-[13px] [&>[data-slot='input']]:w-full [&>[data-slot='input']]:min-w-0 [&>[data-slot='input']]:h-[32px] [&>[data-slot='input']]:text-[13px] [&_[class~='group/crm-icon-button']]:w-[26px] [&_[class~='group/crm-icon-button']]:h-[28px] [&_[class~='group/crm-icon-button']]:min-h-[28px] [&_[class~='group/crm-icon-button']]:p-0 [&_[class~='group/crm-icon-button']]:shrink-0">
      <TextInput
        aria-label='Search columns'
        placeholder='Search columns…'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {normalized.map((state, index) => {
          const column = definitions.get(state.id)!
          return column.label.toLowerCase().includes(search.toLowerCase()) && (
            <li
              key={state.id}
              draggable={!disabled && !search}
              onDragStart={() => setDragging(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (!disabled && dragging !== null) onChange(moveItem(normalized, dragging, index))
                setDragging(null)
              }}
              onDragEnd={() => setDragging(null)}
            >
              <span aria-hidden className='text-muted-foreground cursor-grab'>⠿</span>
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
                label={`${state.frozen ? 'Unfreeze' : 'Freeze'} ${column.label}`}
                disabled={disabled || column.canFreeze === false || !state.visible}
                aria-pressed={!!state.frozen}
                onClick={() => patch(index, { frozen: !state.frozen })}
              >
                {state.frozen ? '◆' : '◇'}
              </IconButton>
              <IconButton
                label={`Move ${column.label} up`}
                disabled={disabled || !!search || index === 0}
                onClick={() => onChange(moveItem(normalized, index, index - 1))}
              >
                ↑
              </IconButton>
              <IconButton
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
        <ToolbarButton icon='columns' chevron disabled={props.disabled}>
          <span>Columns</span>
        </ToolbarButton>
      }
    >
      <ColumnSettings {...props} />
    </PopoverPanel>
  )
}
