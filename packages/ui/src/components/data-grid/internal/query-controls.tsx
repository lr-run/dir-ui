import {
  ALargeSmallIcon,
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  DatabaseIcon,
  EllipsisIcon,
  GripVerticalIcon,
  HashIcon,
  ListFilterIcon,
  PlusIcon,
  TargetIcon,
  Trash2Icon,
} from 'lucide-react'
import { ToolbarButton } from '@/components/ui/toolbar-button.tsx'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Input } from '@/components/ui/input.tsx'
import { MultiCombobox } from '@/components/ui/combobox.tsx'
import { PopoverPanel } from '@/components/ui/popover-panel.tsx'
import {
  conditionError,
  countConditions,
  emptyFilter,
  fieldLabel,
  type FilterCondition,
  filterErrors,
  type FilterGroup,
  type FilterValue,
  initialValue,
  moveItem,
  newCondition,
  operatorsFor,
  type QueryField,
  type RecordFilter,
  type RecordSort,
} from '@/lib/query.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {
  canWrapFilterNode,
  cloneFilterNode,
  filterDepthLimit,
  filterGroupLevels,
  filterNodeDepth,
  nodeConditionCount,
} from '@/lib/filter-tree.ts'
const fieldIcons = {
  number: HashIcon,
  date: CalendarIcon,
  datetime: CalendarIcon,
  boolean: CheckIcon,
  select: TargetIcon,
  multiSelect: TargetIcon,
  relation: DatabaseIcon,
  text: ALargeSmallIcon,
}
function PropertyPicker({ fields, value, onChange, label, disabled, add = false }: {
  fields: readonly QueryField[]
  value?: string
  onChange: (id: string) => void
  label: string
  disabled?: boolean
  add?: boolean
}) {
  const [open, setOpen] = useState(false), [search, setSearch] = useState('')
  const field = fields.find((item) => item.id === value)
  const FieldIcon = fieldIcons[field?.type ?? 'text']
  const matches = fields.filter((item) => fieldLabel(item).toLowerCase().includes(search.trim().toLowerCase()))
  return (
    <PopoverPanel
      title='Select property'
      className="flex flex-col gap-[6px] [&>[data-slot='popover-header']]:absolute [&>[data-slot='popover-header']]:w-[1px] [&>[data-slot='popover-header']]:h-[1px] [&>[data-slot='popover-header']]:overflow-hidden [&>[data-slot='popover-header']]:[clip-path:inset(50%)] [&>[data-slot='input']]:h-[32px] [&>[data-slot='input']]:text-[13px] [&_[class~='group/query-property-option']]:justify-start [&_[class~='group/query-property-option']]:text-[13px] [&_[class~='group/query-property-option']]:h-[32px]"
      width={240}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setSearch('')
      }}
      trigger={
        <Button
          variant='ghost'
          className={`group/query-property-trigger justify-start gap-[6px] min-w-0 h-[32px] [padding-inline:8px] [background:var(--ui-hover)] text-[13px] font-medium [&>span:not(svg)]:overflow-hidden [&>span:not(svg)]:text-ellipsis [&>span:not(svg)]:whitespace-nowrap [&_svg:last-child]:ml-auto ${
            add
              ? 'group/query-add justify-start self-start gap-[6px] [background:transparent] text-muted-foreground font-normal text-[13px] h-[32px] [padding-inline:6px]'
              : ''
          }`}
          disabled={disabled}
          aria-label={label}
        >
          {add
            ? <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            : <FieldIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
          <span>{add ? label : field ? fieldLabel(field) : 'Select property'}</span>
          <ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        </Button>
      }
    >
      <Input
        autoFocus
        aria-label='Search properties'
        placeholder='Search properties…'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
              "[class~='group/query-property-option']",
            )?.focus()
          }
        }}
      />
      <div className='grid max-h-[250px] overflow-y-auto'>
        {matches.map((item) => {
          const OptionIcon = fieldIcons[item.type]
          return (
            <Button
              key={item.id}
              variant='ghost'
              className="group/query-property-option justify-start gap-[8px] min-h-[32px] text-[13px] min-w-0 [&[aria-pressed='true']]:[background:var(--ui-hover)] [&>span:not(svg):not([class~='group/query-field-icon'])]:flex-1 [&>span:not(svg):not([class~='group/query-field-icon'])]:text-left [&>span:not(svg):not([class~='group/query-field-icon'])]:overflow-hidden [&>span:not(svg):not([class~='group/query-field-icon'])]:text-ellipsis"
              aria-pressed={item.id === value}
              onClick={() => {
                onChange(item.id)
                setOpen(false)
              }}
            >
              <OptionIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
              <span>{fieldLabel(item)}</span>
              {item.id === value && <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
            </Button>
          )
        })}
        {!matches.length && (
          <p className='basis-full text-muted-foreground text-[11px] block m-0'>No properties found.</p>
        )}
      </div>
    </PopoverPanel>
  )
}
function RuleActions({ label, remove, duplicate, wrap, disabled }: {
  label: string
  remove: () => void
  duplicate?: () => void
  wrap?: () => void
  disabled?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton variant='ghost' label={label} disabled={disabled}>
            <EllipsisIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </IconButton>
        }
      />
      <DropdownMenuContent className='group/query-action-menu min-w-[185px] text-[13px]'>
        <DropdownMenuItem variant='destructive' onClick={remove}>
          <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Remove
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!duplicate} onClick={duplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled={!wrap} onClick={wrap}>Turn into group</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function directionOptions(field?: QueryField) {
  return field?.type === 'text'
    ? [{ value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }]
    : field?.type === 'number'
    ? [{ value: 'asc', label: 'Low → High' }, { value: 'desc', label: 'High → Low' }]
    : field?.type === 'date' || field?.type === 'datetime'
    ? [{ value: 'asc', label: 'Oldest first' }, { value: 'desc', label: 'Newest first' }]
    : [{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]
}
export type SortEditorProps = {
  fields: readonly QueryField[]
  value: RecordSort[]
  onChange: (value: RecordSort[]) => void
  disabled?: boolean
  maxSorts?: number
}
function SortEditor({ fields, value, onChange, disabled, maxSorts = Infinity }: SortEditorProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const dragImage = useRef<HTMLElement | null>(null)
  const finishDrag = () => {
    dragImage.current?.remove()
    dragImage.current = null
    setDragging(null)
    setDropTarget(null)
  }
  useEffect(() => () => dragImage.current?.remove(), [])
  const available = fields.filter((f) => f.sortable !== false)
  const options = (index = -1) => available.filter((f) => !value.some((s, i) => i !== index && s.field === f.id))
  return (
    <div className="group/query-editor w-full min-w-0 min-h-0 max-h-[min(480px,_65dvh)] overflow-y-auto p-[2px] text-[13px] [container-type:inline-size] [&_fieldset]:[border:0] [&_fieldset]:p-0 [&_fieldset]:m-0 [&_fieldset]:min-w-0 [&_fieldset]:grid [&_fieldset]:gap-[6px] [&_[data-slot='input']]:min-w-0 [&_[data-slot='input']]:max-w-full [&_[data-slot='input']]:text-[13px] [&_[data-slot='input-group']]:min-w-0 [&_[data-slot='input-group']]:max-w-full [&_[data-slot='input-group']]:text-[13px] [&_[class~='group/catalog-combobox-chips']]:min-w-0 [&_[class~='group/catalog-combobox-chips']]:max-w-full [&_[class~='group/catalog-combobox-chips']]:text-[13px] [&_[data-slot='input']]:h-[32px] [&_[data-slot='input-group']]:h-[32px] [&_[class~='group/crm-select']]:w-auto [&_[class~='group/crm-select']]:[background:var(--ui-hover)] [&_[class~='group/crm-select']]:[border-color:transparent] [&_[class~='group/crm-select']]:[box-shadow:none] [&_[class~='group/crm-select']]:[padding-inline:8px] [&_[class~='group/crm-icon-button']]:w-[26px] [&_[class~='group/crm-icon-button']]:h-[30px] [&_[class~='group/crm-icon-button']]:min-h-[30px] [&_[class~='group/crm-icon-button']]:p-0 [&_[class~='group/crm-icon-button']]:shrink-0 [&_[class~='group/crm-icon-button']]:text-muted-foreground">
      <fieldset disabled={disabled}>
        {value.map((sort, index) => (
          <div
            className="query-row grid grid-cols-[18px_minmax(85px,_1fr)_minmax(136px,_auto)_26px] items-center gap-[6px] [@container(max-width:_380px)]:grid-cols-[18px_minmax(85px,_1fr)_120px_26px] [@container(max-width:_380px)]:gap-[4px] relative [transition:opacity_100ms] [&>[class~='group/crm-select']]:w-full [&[data-dragging]]:opacity-30 [&[data-drop]::after]:[content:''] [&[data-drop]::after]:absolute [&[data-drop]::after]:left-0 [&[data-drop]::after]:right-0 [&[data-drop]::after]:h-[2px] [&[data-drop]::after]:rounded-[1px] [&[data-drop]::after]:[background:var(--ui-accent)] [&[data-drop]::after]:pointer-events-none [&[data-drop='before']::after]:top-[-7px] [&[data-drop='after']::after]:bottom-[-7px]"
            key={sort.field}
            data-dragging={dragging === sort.field || undefined}
            data-drop={dropTarget === index && dragging !== sort.field
              ? (value.findIndex((s) => s.field === dragging) < index
                ? 'after'
                : 'before')
              : undefined}
            onDragOver={(e) => {
              if (!dragging || disabled) {
                return
              }
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDropTarget(index)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const from = value.findIndex((s) =>
                s.field === dragging
              )
              if (from >= 0 && !disabled) onChange(moveItem(value, from, index))
              finishDrag()
            }}
          >
            <button
              type='button'
              className='cursor-grab inline-flex items-center justify-center flex-none w-[24px] h-[32px] p-0 [border:0] rounded-[4px] [background:transparent] text-muted-foreground [&:active]:cursor-grabbing [&:disabled]:cursor-default [&:disabled]:opacity-40 [&:hover:not(:disabled)]:[background:var(--ui-hover)]'
              aria-label={`Drag sort ${index + 1} to reorder`}
              title='Drag to reorder, or use Alt + Up / Down'
              onKeyDown={(event) => {
                if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                  event.preventDefault()
                  onChange(moveItem(value, index, index + (event.key === 'ArrowUp' ? -1 : 1)))
                }
              }}
              disabled={disabled || value.length < 2}
              draggable={!disabled && value.length > 1}
              onDragStart={(event) => {
                const field = fields.find((f) => f.id === sort.field)
                const preview = document.createElement('div')
                preview.className =
                  'fixed top-[-10000px] left-0 flex items-center gap-[10px] w-[320px] h-[40px] box-border p-[0_12px] [border:1px_solid_var(--ui-border)] rounded-[8px] [background:var(--ui-raised)] text-foreground [font-family:inherit] text-[13px] leading-[20px] [box-shadow:0_5px_16px_#00000022] pointer-events-none whitespace-nowrap'
                preview.setAttribute('aria-hidden', 'true')
                const grip = document.createElement('span'),
                  label = document.createElement('span'),
                  direction = document.createElement('span')
                grip.textContent = '⠿'
                grip.className = 'text-muted-foreground flex-none'
                label.textContent = field ? fieldLabel(field) : sort.field
                label.className = 'overflow-hidden text-ellipsis flex-1 min-w-0'
                direction.textContent = sort.direction === 'asc' ? '↑ Ascending' : '↓ Descending'
                direction.className = 'text-[12px] text-muted-foreground flex-none'
                preview.append(grip, label, direction)
                document.body.append(preview)
                dragImage.current?.remove()
                dragImage.current = preview
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', sort.field)
                event.dataTransfer.setDragImage(preview, 16, 20)
                setDragging(sort.field)
              }}
              onDragEnd={finishDrag}
            >
              <GripVerticalIcon size={14} strokeWidth={1.5} aria-hidden='true' />
            </button>
            <PropertyPicker
              label={`Sort field ${index + 1}`}
              fields={options(index)}
              value={sort.field}
              onChange={(field) => onChange(value.map((s, i) => i === index ? { ...s, field } : s))}
              disabled={disabled}
            />
            <Select
              label={`Direction ${index + 1}`}
              value={sort.direction}
              items={directionOptions(fields.find((field) => field.id === sort.field))}
              onChange={(direction) =>
                onChange(value.map((s, i) => i === index ? { ...s, direction: direction as 'asc' | 'desc' } : s))}
              disabled={disabled}
            />
            <IconButton
              variant='ghost'
              label={`Remove sort ${index + 1}`}
              disabled={disabled}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              ×
            </IconButton>
          </div>
        ))}
        <div className='flex flex-col items-stretch gap-[4px] mt-[4px]'>
          {value.length < maxSorts && options().length > 0 && (
            <PropertyPicker
              add
              label='Add sort'
              fields={options()}
              onChange={(field) => onChange([...value, { field, direction: 'asc' }])}
              disabled={disabled}
            />
          )}
          {!!value.length && (
            <Button
              className='group/query-delete justify-start shrink-0 gap-[8px] [border-top:1px_solid_var(--ui-border)] rounded-none p-[8px_6px_2px] min-h-[34px] h-auto text-[13px] text-muted-foreground'
              variant='ghost'
              disabled={disabled}
              onClick={() => onChange([])}
            >
              <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' /> Delete sort
            </Button>
          )}
        </div>
      </fieldset>
    </div>
  )
}
export type FilterEditorProps = {
  fields: readonly QueryField[]
  value: RecordFilter
  onChange: (value: RecordFilter) => void
  disabled?: boolean
  maxConditions?: number
  maxDepth?: number
  contextLabel?: string
}
function Condition(
  { condition, fields, onChange, disabled }: {
    condition: FilterCondition
    fields: readonly QueryField[]
    onChange: (value: FilterCondition) => void
    disabled?: boolean
  },
) {
  const field = fields.find((f) => f.id === condition.field),
    ops = field ? operatorsFor(field) : [],
    operator = ops.find((o) => o.id === condition.operator),
    error = conditionError(condition, fields)
  const set = (value: FilterValue) => onChange({ ...condition, value })
  const v = condition.value
  return (
    <div
      className="group/query-condition flex items-start gap-[6px] flex-wrap min-w-0 [&[data-input='relative']>[class~='group/query-value']]:basis-full [&[data-input='relative']>[class~='group/query-value']]:max-w-[340px] [&[data-input='range']>[class~='group/query-value']]:basis-full [&[data-input='range']>[class~='group/query-value']]:max-w-[340px] [&[data-type='number']:not([data-input='range'])_[class~='group/query-value-inputs']]:max-w-[140px]"
      data-input={operator?.input ?? 'single'}
      data-type={field?.type}
    >
      <div className="contents [&>[class~='group/query-property-trigger']]:[flex:0_1_124px] [&>[class~='group/query-property-trigger']]:max-w-[49%] [&>[class~='group/crm-select']]:[flex:0_1_108px] [&>[class~='group/crm-select']]:max-w-[calc(51%_-_6px)]">
        <PropertyPicker
          label='Filter field'
          fields={fields}
          value={condition.field}
          disabled={disabled}
          onChange={(id) => {
            const next = fields.find((f) => f.id === id)
            if (next) onChange({ ...newCondition(next), id: condition.id })
          }}
        />
        <Select
          label='Operator'
          value={condition.operator}
          disabled={disabled}
          items={ops.map((o) => ({ value: o.id, label: o.label }))}
          onChange={(id) => {
            if (field) {
              onChange({ ...condition, operator: id, value: initialValue(field, ops.find((o) => o.id === id)) })
            }
          }}
        />
      </div>
      {field && operator?.input !== 'none' && (
        <div className='group/query-value [flex:1_1_120px] min-w-0'>
          {field.renderValue
            ? field.renderValue({ condition, onChange: set, disabled })
            : operator?.input === 'multiple'
            ? (
              <MultiCombobox
                label='Filter values'
                disabled={disabled}
                items={field.options ?? []}
                value={Array.isArray(v) ? v.map(String) : []}
                onValueChange={set}
              />
            )
            : operator?.input === 'relative'
            ? (
              <div className="flex flex-wrap gap-[6px] [&>[data-slot='input']]:w-auto [&>[data-slot='input']]:[flex:1_1_70px] [&>input[data-slot='input']]:[flex:0_1_64px] [&>input[data-slot='input']]:w-[64px]">
                <Select
                  label='Relative direction'
                  disabled={disabled}
                  value={typeof v === 'object' && v !== null && !Array.isArray(v) ? v.direction : 'past'}
                  items={[{ value: 'past', label: 'In the past' }, { value: 'next', label: 'In the next' }]}
                  onChange={(direction) =>
                    set({
                      ...(typeof v === 'object' && v !== null && !Array.isArray(v)
                        ? v
                        : { amount: 7, unit: 'day' as const }),
                      direction: direction as 'past' | 'next',
                    })}
                />
                <Input
                  aria-label='Relative amount'
                  disabled={disabled}
                  type='number'
                  min={1}
                  step={1}
                  value={typeof v === 'object' && v !== null && !Array.isArray(v) ? v.amount : 7}
                  onChange={(e) =>
                    set({
                      ...(typeof v === 'object' && v !== null && !Array.isArray(v)
                        ? v
                        : { direction: 'past' as const, unit: 'day' as const }),
                      amount: Number(e.target.value),
                    })}
                />
                <Select
                  label='Relative unit'
                  disabled={disabled}
                  value={typeof v === 'object' && v !== null && !Array.isArray(v) ? v.unit : 'day'}
                  items={['day', 'week', 'month'].map((value) => ({ value, label: `${value}s` }))}
                  onChange={(unit) =>
                    set({
                      ...(typeof v === 'object' && v !== null && !Array.isArray(v)
                        ? v
                        : { direction: 'past' as const, amount: 7 }),
                      unit: unit as 'day' | 'week' | 'month',
                    })}
                />
              </div>
            )
            : field.type === 'boolean'
            ? (
              <Select
                label='Filter value'
                disabled={disabled}
                value={String(v)}
                items={[{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }]}
                onChange={(next) => set(next === 'true')}
              />
            )
            : (
              <div className="group/query-value-inputs flex items-center gap-[6px] min-w-0 [&>[data-slot='input']]:w-full [&>[data-slot='input']]:min-w-0">
                {(operator?.input === 'range' ? [0, 1] : [0]).map((index) => (
                  <Input
                    key={index}
                    aria-label={operator?.input === 'range' ? index ? 'Range end' : 'Range start' : 'Filter value'}
                    disabled={disabled}
                    type={field.type === 'number'
                      ? 'number'
                      : field.type === 'date'
                      ? 'date'
                      : field.type === 'datetime'
                      ? 'datetime-local'
                      : 'text'}
                    step='any'
                    value={String(operator?.input === 'range' ? Array.isArray(v) ? v[index] ?? '' : '' : v ?? '')}
                    onChange={(e) => {
                      const next = field.type === 'number' && e.target.value !== ''
                        ? Number(e.target.value)
                        : e.target.value
                      if (operator?.input === 'range') {
                        const values = Array.isArray(v) ? [...v] : ['', '']
                        values[index] = next
                        set(values)
                      } else set(next)
                    }}
                  />
                ))}
              </div>
            )}
        </div>
      )}
      {error && <small className='basis-full text-muted-foreground text-[11px] block m-0'>{error}</small>}
    </div>
  )
}
function FilterEditor(
  { fields, value, onChange, disabled, maxConditions = Infinity, maxDepth = 2, contextLabel }: FilterEditorProps,
) {
  const count = countConditions(value), depthLimit = filterDepthLimit(maxDepth)
  const group = (node: FilterGroup, change: (next: FilterGroup) => void, depth: number, path = '1') => {
    const addRule = () => {
      if (fields[0]) change({ ...node, conditions: [...node.conditions, newCondition(fields[0])] })
    }
    return (
      <section
        className='group/query-group min-w-0 flex flex-col gap-[6px] [container-type:inline-size] [&[data-nested]]:p-[8px] [&[data-nested]]:[border:1px_solid_var(--ui-border)] [&[data-nested]]:rounded-[6px] [&[data-nested]]:[background:var(--ui-hover)]'
        data-nested={depth > 0 || undefined}
        data-depth={Math.min(depth, 2)}
        aria-label={`Filter group ${path}`}
      >
        {node.conditions.map((child, index) => (
          <div
            key={child.id}
            className="grid grid-cols-[56px_minmax(0,_1fr)_26px] gap-[6px] [align-items:start] min-w-0 [@container(max-width:_380px)]:grid-cols-[56px_minmax(0,_1fr)_24px] [@container(max-width:_280px)]:[&>[class~='group/query-condition']]:[grid-column:1_/_-1] [@container(max-width:_280px)]:[&>[class~='group/query-condition']]:[grid-row:2] [@container(max-width:_380px)]:[&:has(>_[class~='group/query-group'])>[class~='group/query-group']]:[grid-column:1_/_-1] [@container(max-width:_380px)]:[&:has(>_[class~='group/query-group'])>[class~='group/query-group']]:[grid-row:2] [@container(max-width:_380px)]:[&:has(>_[class~='group/query-group'])>[class~='group/crm-icon-button']]:[grid-column:3] [@container(max-width:_380px)]:[&:has(>_[class~='group/query-group'])>[class~='group/crm-icon-button']]:[grid-row:1] [@container(max-width:_280px)]:[&:has(>_[class~='group/query-condition'])>[class~='group/crm-icon-button']]:[grid-column:3] [@container(max-width:_280px)]:[&:has(>_[class~='group/query-condition'])>[class~='group/crm-icon-button']]:[grid-row:1]"
          >
            <div className="group/query-conjunction min-h-[32px] flex items-center justify-end text-[12px] pr-[2px] [&_[class~='group/crm-select']]:h-[32px] [&_[class~='group/crm-select']]:w-full [&_[class~='group/crm-select']]:[padding-inline:6px] [&_[class~='group/crm-select']]:text-[12px]">
              {index === 0 ? 'Where' : index === 1
                ? (
                  <Select
                    label={`Group match level ${depth + 1}`}
                    value={node.conjunction}
                    disabled={disabled}
                    items={[{ value: 'and', label: 'And' }, { value: 'or', label: 'Or' }]}
                    onChange={(conjunction) => change({ ...node, conjunction: conjunction as 'and' | 'or' })}
                  />
                )
                : node.conjunction === 'and'
                ? 'And'
                : 'Or'}
            </div>
            {'conditions' in child
              ? group(
                child,
                (next) =>
                  change({
                    ...node,
                    conditions: node.conditions.map((item, i) => i === index ? { ...next, id: child.id } : item),
                  }),
                depth + 1,
                `${path}.${index + 1}`,
              )
              : (
                <Condition
                  condition={child}
                  fields={fields}
                  disabled={disabled}
                  onChange={(next) =>
                    change({ ...node, conditions: node.conditions.map((item, i) => i === index ? next : item) })}
                />
              )}
            <RuleActions
              label={`${'conditions' in child ? 'Group' : 'Filter'} actions ${path}.${index + 1}`}
              disabled={disabled}
              remove={() => change({ ...node, conditions: node.conditions.filter((_, i) => i !== index) })}
              duplicate={count + nodeConditionCount(child) <= maxConditions &&
                  depth + filterNodeDepth(child) <= depthLimit
                ? () =>
                  change({
                    ...node,
                    conditions: node.conditions.flatMap((item, i) =>
                      i === index ? [item, cloneFilterNode(item)] : [item]
                    ),
                  })
                : undefined}
              wrap={canWrapFilterNode(child, depth, depthLimit)
                ? () =>
                  change({
                    ...node,
                    conditions: node.conditions.map((item, i) =>
                      i === index ? { id: crypto.randomUUID(), conjunction: 'and', conditions: [item] } : item
                    ),
                  })
                : undefined}
            />
          </div>
        ))}
        {count < maxConditions && fields[0] && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className='group/query-add justify-start self-start gap-[6px] [background:transparent] text-muted-foreground font-normal text-[13px] h-[32px] [padding-inline:6px]'
                  variant='ghost'
                  disabled={disabled}
                >
                  <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Add filter
                  rule<ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                </Button>
              }
            />
            <DropdownMenuContent className='group/query-action-menu min-w-[185px] text-[13px]'>
              <DropdownMenuItem onClick={addRule}>
                <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Add filter rule
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={depth >= depthLimit}
                title={depth >= depthLimit ? `Maximum ${depthLimit + 1} levels` : undefined}
                onClick={() =>
                  change({
                    ...node,
                    conditions: [...node.conditions, {
                      id: crypto.randomUUID(),
                      conjunction: 'and',
                      conditions: [newCondition(fields[0]!)],
                    }],
                  })}
              >
                <DatabaseIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Add filter group
                {depth >= depthLimit && (
                  <span className='ml-auto text-[10px] text-muted-foreground whitespace-nowrap'>
                    Max {depthLimit + 1} levels
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </section>
    )
  }
  return (
    <div className="group/query-editor w-full min-w-0 min-h-0 max-h-[min(480px,_65dvh)] overflow-y-auto p-[2px] text-[13px] [container-type:inline-size] [&_fieldset]:[border:0] [&_fieldset]:p-0 [&_fieldset]:m-0 [&_fieldset]:min-w-0 [&_fieldset]:grid [&_fieldset]:gap-[6px] [&_[data-slot='input']]:min-w-0 [&_[data-slot='input']]:max-w-full [&_[data-slot='input']]:text-[13px] [&_[data-slot='input-group']]:min-w-0 [&_[data-slot='input-group']]:max-w-full [&_[data-slot='input-group']]:text-[13px] [&_[class~='group/catalog-combobox-chips']]:min-w-0 [&_[class~='group/catalog-combobox-chips']]:max-w-full [&_[class~='group/catalog-combobox-chips']]:text-[13px] [&_[data-slot='input']]:h-[32px] [&_[data-slot='input-group']]:h-[32px] [&_[class~='group/crm-select']]:w-auto [&_[class~='group/crm-select']]:[background:var(--ui-hover)] [&_[class~='group/crm-select']]:[border-color:transparent] [&_[class~='group/crm-select']]:[box-shadow:none] [&_[class~='group/crm-select']]:[padding-inline:8px] [&_[class~='group/crm-icon-button']]:w-[26px] [&_[class~='group/crm-icon-button']]:h-[30px] [&_[class~='group/crm-icon-button']]:min-h-[30px] [&_[class~='group/crm-icon-button']]:p-0 [&_[class~='group/crm-icon-button']]:shrink-0 [&_[class~='group/crm-icon-button']]:text-muted-foreground">
      <fieldset disabled={disabled}>
        {contextLabel && <p className='basis-full text-muted-foreground text-[11px] block m-0'>{contextLabel}</p>}
        {group(value, onChange, 0)}
      </fieldset>
    </div>
  )
}
export function SortMenu(props: SortEditorProps) {
  const first = props.value[0], field = props.fields.find((field) => field.id === first?.field)
  const label = field ? fieldLabel(field) : first?.field
  return (
    <PopoverPanel
      title='Sort records'
      className="flex flex-col gap-[8px] [&>[data-slot='popover-header']]:absolute [&>[data-slot='popover-header']]:w-[1px] [&>[data-slot='popover-header']]:h-[1px] [&>[data-slot='popover-header']]:overflow-hidden [&>[data-slot='popover-header']]:[clip-path:inset(50%)] [&_[class~='group/query-delete']]:justify-start [&_[class~='group/query-delete']]:text-muted-foreground [&_[class~='group/query-delete']]:[background:transparent] [&_[class~='group/query-delete']]:text-[13px] [&_[class~='group/query-delete']]:font-normal [&_[class~='group/query-delete']]:[border-top:1px_solid_var(--ui-border)] [&_[class~='group/query-delete']]:rounded-none [&_[class~='group/query-delete']]:p-[8px_6px_2px] [&_[class~='group/query-editor']_[class~='group/query-property-trigger']]:justify-start [&_[class~='group/query-editor']_[class~='group/query-property-trigger']]:text-[13px] [&_[class~='group/query-editor']_[class~='group/query-property-trigger']]:h-[32px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:h-[32px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:min-h-[32px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:text-[13px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:p-[0_8px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:gap-[4px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:[border-color:transparent] [&_[class~='group/query-editor']_[class~='group/crm-select']]:[box-shadow:none] [&_[class~='group/query-conjunction']_[class~='group/crm-select']]:text-[12px] [&_[class~='group/query-conjunction']_[class~='group/crm-select']]:p-[0_4px] [&_[class~='group/query-conjunction']_[class~='group/crm-select']]:gap-[3px] [&_[class~='group/query-conjunction']_[data-slot='select-trigger-icon']]:w-[12px] [&_[class~='group/query-conjunction']_[data-slot='select-trigger-icon']]:h-[12px] [&_[class~='group/query-editor']_[class~='group/query-add']]:justify-start [&_[class~='group/query-editor']_[class~='group/query-add']]:text-muted-foreground [&_[class~='group/query-editor']_[class~='group/query-add']]:[background:transparent] [&_[class~='group/query-editor']_[class~='group/query-add']]:text-[13px] [&_[class~='group/query-editor']_[class~='group/query-add']]:font-normal [&_[class~='group/query-delete']:hover]:[background:var(--ui-hover)] [&_[class~='group/query-group'][data-depth='0']]:[background:transparent] [&_[class~='group/query-group'][data-depth='0']]:[border:0] [&_[class~='group/query-group'][data-depth='0']]:p-0 [&_[class~='group/query-group'][data-depth='0']]:gap-[6px] [&_[class~='group/query-group'][data-nested]]:[border:1px_solid_light-dark(#e3e3e1,_#414141)] [&_[class~='group/query-group'][data-nested]]:rounded-[6px] [&_[class~='group/query-group'][data-nested]]:p-[8px] [&_[class~='group/query-group'][data-nested]]:gap-[6px] [&_[class~='group/query-group'][data-depth='1']]:[background:light-dark(#f7f7f6,_#2b2b2b)] [&_[class~='group/query-group'][data-depth='2']]:[background:light-dark(#efefed,_#333333)] [&_[class~='group/query-group'][data-depth='2']]:[border-color:light-dark(#dbdbd8,_#494949)] [&_[class~='group/query-editor']_[class~='group/crm-select']]:[background:light-dark(#f0f0ee,_#1f1f1f)] [&_[class~='group/query-value']_input[data-slot='input']]:[background:light-dark(#ffffff,_#ffffff03)] [&_[class~='group/query-value']_input[data-slot='input']]:[border-color:light-dark(#dfdfdc,_#454545)] [&_[class~='group/query-editor']_[class~='group/query-add']:hover]:[background:var(--ui-hover)] [&_[class~='group/query-group'][data-nested]_[class~='group/crm-select']]:[background:light-dark(#ffffff,_#222222)] [&_[class~='group/query-editor']_[class~='group/query-property-trigger']:not([class~='group/query-add'])]:[background:light-dark(#f0f0ee,_#1f1f1f)] [&_[class~='group/query-group'][data-nested]_[class~='group/query-property-trigger']:not([class~='group/query-add'])]:[background:light-dark(#ffffff,_#222222)]"
      width={400}
      trigger={
        <ToolbarButton
          icon={first?.direction === 'desc'
            ? <ArrowDownWideNarrowIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            : <ArrowUpNarrowWideIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
          active={!!first}
          disabled={props.disabled}
        >
          {first
            ? (
              <>
                <span className='crm-toolbar-prefix text-muted-foreground'>Sorted by</span>
                <span className='crm-toolbar-label min-w-0 max-w-[180px] overflow-hidden text-ellipsis' title={label}>
                  {label}
                </span>
                {props.value.length > 1 && (
                  <span className='crm-toolbar-count inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded bg-accent text-muted-foreground text-xs leading-[18px] flex-none'>
                    +{props.value.length - 1}
                  </span>
                )}
              </>
            )
            : <span>Sort</span>}
        </ToolbarButton>
      }
    >
      <SortEditor {...props} />
    </PopoverPanel>
  )
}
export function FilterMenu(props: FilterEditorProps) {
  const [draft, setDraft] = useState(props.value)
  useEffect(() => setDraft(props.value), [props.value])
  const update = (next: RecordFilter) => {
    setDraft(next)
    if (!filterErrors(next, props.fields).length && filterGroupLevels(next) <= filterDepthLimit(props.maxDepth) + 1) {
      props.onChange(next)
    }
  }
  return (
    <PopoverPanel
      title='Filter records'
      className="flex flex-col gap-[8px] [&>[data-slot='popover-header']]:absolute [&>[data-slot='popover-header']]:w-[1px] [&>[data-slot='popover-header']]:h-[1px] [&>[data-slot='popover-header']]:overflow-hidden [&>[data-slot='popover-header']]:[clip-path:inset(50%)] [&_[class~='group/query-delete']]:justify-start [&_[class~='group/query-delete']]:text-muted-foreground [&_[class~='group/query-delete']]:[background:transparent] [&_[class~='group/query-delete']]:text-[13px] [&_[class~='group/query-delete']]:font-normal [&_[class~='group/query-delete']]:[border-top:1px_solid_var(--ui-border)] [&_[class~='group/query-delete']]:rounded-none [&_[class~='group/query-delete']]:p-[8px_6px_2px] [&_[class~='group/query-editor']_[class~='group/query-property-trigger']]:justify-start [&_[class~='group/query-editor']_[class~='group/query-property-trigger']]:text-[13px] [&_[class~='group/query-editor']_[class~='group/query-property-trigger']]:h-[32px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:h-[32px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:min-h-[32px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:text-[13px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:p-[0_8px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:gap-[4px] [&_[class~='group/query-editor']_[class~='group/crm-select']]:[border-color:transparent] [&_[class~='group/query-editor']_[class~='group/crm-select']]:[box-shadow:none] [&_[class~='group/query-conjunction']_[class~='group/crm-select']]:text-[12px] [&_[class~='group/query-conjunction']_[class~='group/crm-select']]:p-[0_4px] [&_[class~='group/query-conjunction']_[class~='group/crm-select']]:gap-[3px] [&_[class~='group/query-conjunction']_[data-slot='select-trigger-icon']]:w-[12px] [&_[class~='group/query-conjunction']_[data-slot='select-trigger-icon']]:h-[12px] [&_[class~='group/query-editor']_[class~='group/query-add']]:justify-start [&_[class~='group/query-editor']_[class~='group/query-add']]:text-muted-foreground [&_[class~='group/query-editor']_[class~='group/query-add']]:[background:transparent] [&_[class~='group/query-editor']_[class~='group/query-add']]:text-[13px] [&_[class~='group/query-editor']_[class~='group/query-add']]:font-normal [&_[class~='group/query-delete']:hover]:[background:var(--ui-hover)] [&_[class~='group/query-group'][data-depth='0']]:[background:transparent] [&_[class~='group/query-group'][data-depth='0']]:[border:0] [&_[class~='group/query-group'][data-depth='0']]:p-0 [&_[class~='group/query-group'][data-depth='0']]:gap-[6px] [&_[class~='group/query-group'][data-nested]]:[border:1px_solid_light-dark(#e3e3e1,_#414141)] [&_[class~='group/query-group'][data-nested]]:rounded-[6px] [&_[class~='group/query-group'][data-nested]]:p-[8px] [&_[class~='group/query-group'][data-nested]]:gap-[6px] [&_[class~='group/query-group'][data-depth='1']]:[background:light-dark(#f7f7f6,_#2b2b2b)] [&_[class~='group/query-group'][data-depth='2']]:[background:light-dark(#efefed,_#333333)] [&_[class~='group/query-group'][data-depth='2']]:[border-color:light-dark(#dbdbd8,_#494949)] [&_[class~='group/query-editor']_[class~='group/crm-select']]:[background:light-dark(#f0f0ee,_#1f1f1f)] [&_[class~='group/query-value']_input[data-slot='input']]:[background:light-dark(#ffffff,_#ffffff03)] [&_[class~='group/query-value']_input[data-slot='input']]:[border-color:light-dark(#dfdfdc,_#454545)] [&_[class~='group/query-editor']_[class~='group/query-add']:hover]:[background:var(--ui-hover)] [&_[class~='group/query-group'][data-nested]_[class~='group/crm-select']]:[background:light-dark(#ffffff,_#222222)] [&_[class~='group/query-editor']_[class~='group/query-property-trigger']:not([class~='group/query-add'])]:[background:light-dark(#f0f0ee,_#1f1f1f)] [&_[class~='group/query-group'][data-nested]_[class~='group/query-property-trigger']:not([class~='group/query-add'])]:[background:light-dark(#ffffff,_#222222)]"
      width={720}
      trigger={
        <ToolbarButton
          icon={<ListFilterIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
          active={countConditions(props.value) > 0}
          disabled={props.disabled}
        >
          <span>Filter</span>
          {countConditions(props.value) > 0 && (
            <span className='crm-toolbar-count inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded bg-accent text-muted-foreground text-xs leading-[18px] flex-none'>
              {countConditions(props.value)}
            </span>
          )}
        </ToolbarButton>
      }
    >
      {filterGroupLevels(draft) > filterDepthLimit(props.maxDepth) + 1 && (
        <p className='basis-full text-muted-foreground text-[11px] block m-0' role='status'>
          Reduce this filter to {filterDepthLimit(props.maxDepth) + 1} levels to apply changes.
        </p>
      )}
      <FilterEditor {...props} value={draft} onChange={update} />
      {!!draft.conditions.length && (
        <Button
          className='group/query-delete justify-start shrink-0 gap-[8px] [border-top:1px_solid_var(--ui-border)] rounded-none p-[8px_6px_2px] min-h-[34px] h-auto text-[13px] text-muted-foreground'
          variant='ghost'
          disabled={props.disabled}
          onClick={() => update(emptyFilter())}
        >
          <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Delete filter
        </Button>
      )}
    </PopoverPanel>
  )
}
