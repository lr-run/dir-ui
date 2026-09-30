import {
  AlignLeftIcon,
  ArrowDownWideNarrowIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpNarrowWideIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  CircleDotIcon,
  ClockIcon,
  DollarSignIcon,
  EyeOffIcon,
  HashIcon,
  LinkIcon,
  MailIcon,
  PanelRightOpenIcon,
  PercentIcon,
  PinIcon,
  Settings2Icon,
  SquareCheckIcon,
  TagsIcon,
  UserRoundIcon,
} from 'lucide-react'
import { cn } from 'cn'
import { ColumnHeader, columnMenuItem, ColumnPopup } from '../data-grid/internal/column-header.tsx'
import { type Key, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Column, type DataGridHandle } from 'react-data-grid'
import { DataGrid, type DataGridProps } from '../data-grid/data-grid.tsx'
import { Menu } from '@base-ui/react/menu'
import { Button } from '../ui/button.tsx'
import {
  cellText,
  type ColumnFormat,
  type RecordCellType,
  reorderTableColumns,
  type TableColumnState,
} from '../../lib/record-table-model.ts'
export type { ColumnFormat, RecordCellType, TableColumnState } from '../../lib/record-table-model.ts'
export type RecordColumn<R, SR = unknown> = Column<R, SR> & {
  type?: RecordCellType
  getValue?: (row: R) => unknown
  icon?: ReactNode
  required?: boolean
  format?: ColumnFormat
}
export type RecordPagination = {
  hasMore: boolean
  loading: boolean
  error?: string | null
  onLoadMore: () => void | Promise<void>
  total?: number
  threshold?: number
}
export type RecordTableProps<R, SR = unknown, K extends Key = Key> = Omit<DataGridProps<R, SR, K>, 'columns'> & {
  columns: readonly RecordColumn<R, SR>[]
  columnState?: readonly TableColumnState[]
  onColumnStateChange?: (state: TableColumnState[]) => void
  pagination?: RecordPagination
  onOpenRecord?: (row: R) => void
  onPreviewRecord?: (row: R) => void
}
const freezeGroup = (frozen: boolean | 'start' | 'end') => frozen === 'end' ? 2 : frozen ? 0 : 1
const numeric = (type?: RecordCellType) => type === 'number' || type === 'money' || type === 'percent'
const readValue = <R,>(row: R, column: { key: string; getValue?: (row: R) => unknown }) =>
  column.getValue
    ? column.getValue(row)
    : row !== null && typeof row === 'object'
    ? Reflect.get(row, column.key)
    : undefined
function Value(
  { value, type = 'text', format, onOpen, onPreview }: {
    value: unknown
    type?: RecordCellType
    format?: ColumnFormat
    onOpen?: () => void
    onPreview?: () => void
  },
) {
  const text = cellText(value, type, format)
  if (!text) return null
  if (type === 'status' || type === 'tags') {
    return (
      <span className='flex gap-[4px] overflow-hidden'>
        {(Array.isArray(value) ? value : [value]).map((v, i) => (
          <span
            className="inline-flex items-center gap-[5px] h-[22px] p-[0_7px] rounded-[5px] text-[12px] [background:color-mix(in_srgb,_#64748b_12%,_var(--ui-raised))] whitespace-nowrap [&>span]:text-[8px] [&>span]:opacity-50 [&[data-tone='1']]:[background:color-mix(in_srgb,_#6366f1_12%,_var(--ui-raised))] [&[data-tone='2']]:[background:color-mix(in_srgb,_#22c55e_12%,_var(--ui-raised))] [&[data-tone='3']]:[background:color-mix(in_srgb,_#f59e0b_12%,_var(--ui-raised))]"
            data-tone={String(v).length % 4}
            key={i}
          >
            {type === 'status' && <span aria-hidden>●</span>}
            {String(v)}
          </span>
        ))}
      </span>
    )
  }
  if (type === 'boolean') return <span className='record-cell-boolean' aria-label={text}>{value ? '✓' : '—'}</span>
  if (type === 'email' || type === 'url') {
    const href = type === 'email' ? `mailto:${text}` : /^https?:\/\//i.test(text) ? text : `https://${text}`
    return (
      <a
        className='text-[var(--ui-accent)] no-underline overflow-hidden text-ellipsis whitespace-nowrap [&:hover]:underline'
        href={href}
        target={type === 'url' ? '_blank' : undefined}
        rel='noreferrer'
        title={text}
      >
        {text.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </a>
    )
  }
  if (type === 'record' || type === 'member') {
    return (
      <span className='flex items-center gap-[8px] w-full min-w-0'>
        <span
          className='w-[18px] h-[18px] [border:1px_solid_var(--ui-border)] [background:var(--ui-hover)] rounded-[4px] inline-flex justify-center items-center text-[10px] shrink-0 [&[data-member]]:rounded-[50%]'
          data-member={type === 'member' || undefined}
          aria-hidden
        >
          {text.slice(0, 1)}
        </span>
        {onOpen
          ? (
            <button
              type='button'
              className='overflow-hidden text-ellipsis whitespace-nowrap [border:0] [background:none] p-0 [font:inherit] text-inherit text-left cursor-pointer [&:hover]:underline [&:focus-visible]:[outline:1px_solid_var(--ui-ring)] [&:focus-visible]:outline-offset-[2px]'
              title={text}
              onClick={onOpen}
            >
              {text}
            </button>
          )
          : <span className='overflow-hidden text-ellipsis whitespace-nowrap' title={text}>{text}</span>}
        {(onPreview || onOpen) && (
          <button
            className='group/record-cell-open inline-flex items-center justify-center ml-auto [border:1px_solid_var(--ui-border)] rounded-[4px] [background:var(--ui-raised)] w-[22px] h-[22px] leading-[20px] cursor-pointer opacity-0 [@media(pointer:_coarse)]:inline-flex [@media(pointer:_coarse)]:items-center [@media(pointer:_coarse)]:justify-center [@media(pointer:_coarse)]:opacity-100 [&:focus-visible]:opacity-100'
            type='button'
            onClick={onPreview ?? onOpen}
            aria-label={`${onPreview ? 'Preview' : 'Open'} ${text}`}
          >
            <PanelRightOpenIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </button>
        )}
      </span>
    )
  }
  return <span className='overflow-hidden text-ellipsis whitespace-nowrap' title={text}>{text}</span>
}
export function RecordTable<R, SR = unknown, K extends Key = Key>(
  { columns, columnState, onColumnStateChange, pagination, onOpenRecord, onPreviewRecord, ...grid }: RecordTableProps<
    R,
    SR,
    K
  >,
) {
  const [local, setLocal] = useState<TableColumnState[]>([])
  const sortColumns = grid.sortColumns ??
    grid.sort?.value.map((item) => ({
      columnKey: item.field,
      direction: item.direction === 'asc' ? 'ASC' as const : 'DESC' as const,
    }))
  const onSortColumnsChange = grid.onSortColumnsChange ??
    (grid.sort
      ? (next: import('react-data-grid').SortColumn[]) =>
        grid.sort!.onChange(
          next.map((item) => ({ field: item.columnKey, direction: item.direction === 'ASC' ? 'asc' : 'desc' })),
        )
      : undefined)
  const handle = useRef<DataGridHandle>(null)
  const layout = columnState ?? local
  const setLayout = useCallback((next: TableColumnState[]) => {
    if (columnState === undefined) setLocal(next)
    onColumnStateChange?.(next)
  }, [columnState, onColumnStateChange])
  const ordered = useMemo(() => {
    const byKey = new Map(columns.map((c) => [c.key, c])), seen = new Set<string>()
    return [...layout, ...columns].flatMap((c) => {
      const source = byKey.get(c.key)
      if (!source || seen.has(c.key)) return []
      seen.add(c.key)
      const state = layout.find((s) => s.key === c.key)
      return [{ ...source, state, frozen: state?.frozen ?? source.frozen ?? (source.type === 'record') }]
    })
  }, [columns, layout])
  const locked = useMemo(() => new Set(columns.filter((c) => c.type === 'record' || c.required).map((c) => c.key)), [
    columns,
  ])
  const patch = useCallback(
    (key: string, update: Partial<TableColumnState>) =>
      setLayout(ordered.map((c) => ({ key: c.key, ...c.state, ...(c.key === key ? update : {}) }))),
    [ordered, setLayout],
  )
  const visible = useMemo(() => {
    const columns = ordered.filter((c) => !c.state?.hidden || locked.has(c.key))
    return columns.sort((a, b) => freezeGroup(a.frozen) - freezeGroup(b.frozen))
  }, [ordered, locked])
  const reorder = useCallback(
    (source: string, target: string) => {
      if (
        freezeGroup(ordered.find((c) => c.key === source)?.frozen ?? false) !== freezeGroup(
          ordered.find((c) => c.key === target)?.frozen ?? false,
        )
      ) return
      setLayout(reorderTableColumns(ordered.map((c) => ({ key: c.key, ...c.state })), source, target, locked))
    },
    [ordered, locked, setLayout],
  )
  const rendered = useMemo(() =>
    visible.map((column, index): Column<R, SR> => {
      const ColumnIcon = columnIcons[column.type ?? 'text']
      const label = column.state?.label ?? (typeof column.name === 'string' ? column.name : column.key)
      const format = { ...column.format, ...column.state?.format }
      const activeSort = sortColumns?.find((s) => s.columnKey === column.key)
      const sorting = (direction: 'ASC' | 'DESC') =>
        onSortColumnsChange?.(
          activeSort?.direction === direction ? (sortColumns ?? []).filter((s) => s.columnKey !== column.key) : [
            { columnKey: column.key, direction },
            ...(sortColumns ?? []).filter((s) => s.columnKey !== column.key),
          ],
        )
      const formatting = numeric(column.type) || column.type === 'date' || column.type === 'datetime'
      return {
        ...column,
        name: label,
        width: column.state?.width ?? column.width ?? (column.type === 'record' ? 220 : 180),
        minWidth: column.minWidth ?? 100,
        resizable: column.resizable ?? true,
        draggable: !locked.has(column.key),
        frozen: column.frozen,
        editable: false,
        // Sorting is performed only by the menu, never by the header cell's click handler.
        sortable: false,
        headerCellClass: 'record-table-heading',
        cellClass: (row) =>
          `${typeof column.cellClass === 'function' ? column.cellClass(row) : column.cellClass ?? ''} ${
            numeric(column.type) ? 'record-cell-numeric' : ''
          }`,
        renderHeaderCell: column.renderHeaderCell ??
          (({ tabIndex }) => (
            <ColumnHeader
              label={label}
              icon={column.icon ?? <ColumnIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
              direction={activeSort?.direction}
              tabIndex={tabIndex}
            >
              {column.sortable !== false && onSortColumnsChange && (
                <>
                  <Menu.CheckboxItem
                    closeOnClick
                    className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                    checked={activeSort?.direction === 'ASC'}
                    onClick={() => sorting('ASC')}
                  >
                    <ArrowUpNarrowWideIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Sort
                    ascending<Menu.CheckboxItemIndicator>
                      <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                    </Menu.CheckboxItemIndicator>
                  </Menu.CheckboxItem>
                  <Menu.CheckboxItem
                    closeOnClick
                    className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                    checked={activeSort?.direction === 'DESC'}
                    onClick={() => sorting('DESC')}
                  >
                    <ArrowDownWideNarrowIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Sort
                    descending<Menu.CheckboxItemIndicator>
                      <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                    </Menu.CheckboxItemIndicator>
                  </Menu.CheckboxItem>
                </>
              )}
              <Menu.Item className={columnMenuItem} onClick={() => patch(column.key, { frozen: !column.frozen })}>
                <PinIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                {column.frozen ? 'Unfreeze column' : 'Freeze column'}
              </Menu.Item>
              <Menu.Item
                className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                disabled={index === 0 || locked.has(visible[index - 1]?.key ?? '') || locked.has(column.key) ||
                  freezeGroup(visible[index - 1]?.frozen ?? false) !== freezeGroup(column.frozen)}
                onClick={() => reorder(column.key, visible[index - 1]!.key)}
              >
                <ArrowLeftIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Move left
              </Menu.Item>
              <Menu.Item
                className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                disabled={index === visible.length - 1 || locked.has(column.key) ||
                  locked.has(visible[index + 1]?.key ?? '') ||
                  freezeGroup(visible[index + 1]?.frozen ?? false) !== freezeGroup(column.frozen)}
                onClick={() => reorder(column.key, visible[index + 1]!.key)}
              >
                <ArrowRightIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Move right
              </Menu.Item>
              <Menu.Separator className='h-[1px] m-[5px_-5px] [background:var(--ui-border)]' />
              {formatting && (
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'>
                    <Settings2Icon
                      size={15}
                      strokeWidth={1.5}
                      aria-hidden='true'
                      className='shrink-0'
                    />Formatting<span className='ml-auto text-muted-foreground text-[12px]'>
                      ›
                    </span>
                  </Menu.SubmenuTrigger>
                  <ColumnPopup>
                    {numeric(column.type)
                      ? (
                        <>
                          <div className='p-[5px_8px] text-muted-foreground text-[11px]'>Grouping</div>
                          {[true, false].map((grouping) => (
                            <Menu.CheckboxItem
                              closeOnClick
                              key={String(grouping)}
                              className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                              checked={(format.grouping ?? true) === grouping}
                              onClick={() => patch(column.key, { format: { ...format, grouping } })}
                            >
                              {grouping ? 'Default' : 'No groups'}
                              <span className='ml-auto text-muted-foreground text-[12px]'>
                                {grouping ? '1,200.5' : '1200.5'}
                              </span>
                              <Menu.CheckboxItemIndicator>
                                <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                              </Menu.CheckboxItemIndicator>
                            </Menu.CheckboxItem>
                          ))}
                          <Menu.Separator className='h-[1px] m-[5px_-5px] [background:var(--ui-border)]' />
                          <div className='p-[5px_8px] text-muted-foreground text-[11px]'>Decimal places</div>
                          {[0, 1, 2, 3, 4].map((decimals) => (
                            <Menu.CheckboxItem
                              closeOnClick
                              key={decimals}
                              className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                              checked={format.decimals === decimals}
                              onClick={() => patch(column.key, { format: { ...format, decimals } })}
                            >
                              {decimals} decimals<Menu.CheckboxItemIndicator>
                                <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                              </Menu.CheckboxItemIndicator>
                            </Menu.CheckboxItem>
                          ))}
                        </>
                      )
                      : (
                        <>
                          {(['short', 'medium', 'long'] as const).map((dateStyle) => (
                            <Menu.CheckboxItem
                              closeOnClick
                              key={dateStyle}
                              className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                              checked={(format.dateStyle ?? 'medium') === dateStyle}
                              onClick={() => patch(column.key, { format: { ...format, dateStyle } })}
                            >
                              {dateStyle}
                              <span className='ml-auto text-muted-foreground text-[12px]'>
                                {cellText('2026-09-28', 'date', { dateStyle })}
                              </span>
                              <Menu.CheckboxItemIndicator>
                                <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                              </Menu.CheckboxItemIndicator>
                            </Menu.CheckboxItem>
                          ))}
                        </>
                      )}
                  </ColumnPopup>
                </Menu.SubmenuRoot>
              )}
              <Menu.Item
                className='flex items-center gap-[8px] min-h-[32px] p-[6px_8px] rounded-[5px] cursor-default [outline:none] leading-[20px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-popup-open]]:[background:var(--ui-hover)] [&[data-disabled]]:opacity-40 [&>[data-slot]]:ml-auto [&>[data-slot]]:text-[var(--ui-accent)] [&>[data-checked]]:ml-auto [&>[data-checked]]:text-[var(--ui-accent)]'
                disabled={locked.has(column.key)}
                onClick={() => patch(column.key, { hidden: true })}
              >
                <EyeOffIcon size={15} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Hide from view
              </Menu.Item>
            </ColumnHeader>
          )),
        renderCell: column.renderCell ??
          (({ row }) => (
            <Value
              value={readValue(row, column)}
              type={column.type}
              format={format}
              onOpen={column.type === 'record' && onOpenRecord ? () => onOpenRecord(row) : undefined}
              onPreview={column.type === 'record' && onPreviewRecord ? () => onPreviewRecord(row) : undefined}
            />
          )),
      }
    }), [visible, sortColumns, onSortColumnsChange, locked, patch, reorder, onOpenRecord, onPreviewRecord])
  const loadIfNearEnd = useCallback(() => {
    const el = handle.current?.element
    if (
      el && pagination?.hasMore && !pagination.loading && !pagination.error &&
      el.scrollHeight - el.scrollTop - el.clientHeight <= (pagination.threshold ?? 240)
    ) void pagination.onLoadMore()
  }, [pagination])
  useEffect(() => {
    loadIfNearEnd()
  }, [loadIfNearEnd, grid.rows.length])
  useEffect(() => {
    const el = handle.current?.element
    if (!el) return
    const observer = new ResizeObserver(loadIfNearEnd)
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadIfNearEnd])
  return (
    <>
      <DataGrid
        {...grid}
        columnSettings={grid.columnSettings === true
          ? {
            columns: ordered.map((column) => ({
              id: column.key,
              label: column.state?.label ?? String(column.name),
              required: locked.has(column.key),
            })),
            value: ordered.map((column) => ({
              id: column.key,
              visible: !column.state?.hidden || locked.has(column.key),
              frozen: Boolean(column.frozen),
            })),
            onChange: (next) =>
              setLayout(
                next.map((column) => ({
                  ...layout.find((state) => state.key === column.id),
                  key: column.id,
                  hidden: !column.visible,
                  frozen: column.frozen,
                })),
              ),
            onReset: () => setLayout([]),
          }
          : grid.columnSettings}
        ref={(value) => {
          handle.current = value
          if (typeof grid.ref === 'function') grid.ref(value)
          else if (grid.ref) grid.ref.current = value
        }}
        columns={rendered}
        renderers={{
          noRowsFallback: (
            <div
              className='group/crm-record-list-empty [grid-column:1_/_-1] p-[32px] text-center text-muted-foreground'
              role='status'
            >
              {pagination?.loading
                ? 'Loading records…'
                : pagination?.error
                ? 'Records could not be loaded.'
                : 'No records found.'}
            </div>
          ),
          ...grid.renderers,
        }}
        rowHeight={grid.rowHeight ?? 36}
        headerRowHeight={grid.headerRowHeight ?? 40}
        className={cn(
          "[--rdg-color:var(--ui-text)] [--rdg-background-color:var(--ui-raised)] [--rdg-row-hover-background-color:var(--ui-hover)] [--rdg-row-selected-background-color:#edf3ff] [--rdg-row-selected-hover-background-color:#e4edff] [--rdg-selection-color:var(--ui-accent)] [--rdg-selection-width:1px] flex-1 h-full min-h-0 min-w-0 [border:0] [font-family:inherit] [&_[role='gridcell']]:[border-bottom:1px_solid_var(--ui-border)] [&_[role='gridcell']]:[border-right:1px_solid_var(--ui-border)] [&_[role='gridcell']]:items-center [&_[role='columnheader']]:[border-bottom:1px_solid_var(--ui-border)] [&_[role='columnheader']]:[border-right:1px_solid_var(--ui-border)] [&_[role='columnheader']]:items-center [&_[role='columnheader']]:font-medium [&_[class~='group/record-title-actions']]:h-full [&_[class~='group/record-title-actions']]:w-full [&_[class~='group/record-link']]:overflow-hidden [&_[class~='group/record-link']]:flex-1 [&_[class~='group/record-link']]:min-w-0 [&_[class~='group/crm-record-identity']]:w-full [&_[class~='group/sidebar-open']]:shrink-0 [&_[class~='group/sidebar-open']]:opacity-0 [&_[class~='group/row-skeleton']]:inline-block [&_[class~='group/row-skeleton']]:w-[65%] [&_[class~='group/row-skeleton']]:h-[10px] [&_[class~='group/crm-empty']]:[grid-column:1_/_-1] [&_[class~='group/crm-empty']]:sticky [&_[class~='group/crm-empty']]:left-0 [&_[class~='group/crm-empty']]:w-full [@media(pointer:_coarse)]:[&_[class~='group/sidebar-open']]:opacity-100 [&_[class~='group/record-title-actions']]:flex [&_[class~='group/record-title-actions']]:items-center [&_[class~='group/record-title-actions']]:gap-[6px] [&_[class~='group/record-title-actions']]:min-w-0 [&_[class~='group/record-link']]:flex [&_[class~='group/record-link']]:items-center [&_[class~='group/record-link']]:h-full [&_[class~='group/record-link']]:no-underline [&_[class~='group/crm-record-name']]:overflow-hidden [&_[class~='group/crm-record-name']]:whitespace-nowrap [&_[class~='group/crm-record-name']]:text-ellipsis [&_[class~='group/crm-record-name']]:min-w-0 [&_[class~='group/crm-record-mark']]:shrink-0 [&_[class~='group/crm-record-identity'][class~='group/compact']]:text-[length:var(--dir-text-body)] [&_[class~='group/crm-record-identity'][class~='group/compact']]:leading-[1.4] [&_[role=\"gridcell\"][aria-selected=\"true\"]]:[outline:1px_solid_var(--ui-accent,_#3867ed)] [&_[role=\"gridcell\"][aria-selected=\"true\"]]:outline-offset-[-1px] [&_[role=\"columnheader\"][aria-selected=\"true\"]]:[outline:1px_solid_var(--ui-accent,_#3867ed)] [&_[role=\"columnheader\"][aria-selected=\"true\"]]:outline-offset-[-1px] [&_[role='row']:hover_[class~='group/sidebar-open']]:opacity-100 [&_[role='row']:focus-within_[class~='group/sidebar-open']]:opacity-100 [--rdg-font-size:13px] [--rdg-border-color:var(--ui-border)] [--rdg-header-background-color:var(--ui-raised)] [container-type:inline-size] [&_[role='gridcell']]:p-[0_12px] [&_[role='gridcell']]:flex [&_[role='gridcell']]:text-[13px] [&_[role='columnheader']]:p-0 [&_[role='columnheader']]:text-foreground [&_[role='columnheader']]:text-[13px] [&_[role='columnheader']]:[font-weight:450] [&>[class~='group/crm-record-list-empty']]:sticky [&>[class~='group/crm-record-list-empty']]:left-0 [&>[class~='group/crm-record-list-empty']]:w-[100cqw] [&>[class~='group/crm-record-list-empty']]:max-w-[100cqw] [&>[class~='group/crm-record-list-empty']]:whitespace-normal [&>[class~='group/crm-record-list-empty']]:[align-self:start] [&_[role='gridcell']:hover]:[background:var(--ui-hover)] [&_[role='row']:hover_[class~='group/record-cell-open']]:opacity-100",
          grid.className,
        )}
        onColumnsReorder={(source, target) => {
          reorder(source, target)
          grid.onColumnsReorder?.(source, target)
        }}
        onColumnResize={(column, width) => {
          patch(column.key, { width })
          grid.onColumnResize?.(column, width)
        }}
        onScroll={(event) => {
          grid.onScroll?.(event)
          loadIfNearEnd()
        }}
        onCellClick={(args, event) => {
          grid.onCellClick?.(args, event)
          if (
            !event.defaultPrevented && columns.find((column) => column.key === args.column.key)?.type === 'record' &&
            !(event.target as HTMLElement).closest('a,button,input')
          ) onOpenRecord?.(args.row)
        }}
        onCellDoubleClick={(args, event) => {
          grid.onCellDoubleClick?.(args, event)
          if (!(event.target as HTMLElement).closest('a,button,input')) onOpenRecord?.(args.row)
        }}
        onCellKeyDown={(args, event) => {
          grid.onCellKeyDown?.(args, event)
          if (
            args.mode === 'ACTIVE' && args.row !== undefined && event.key === 'Enter' && onOpenRecord &&
            !(event.target as HTMLElement).closest('button,a,input')
          ) {
            event.preventGridDefault()
            event.preventDefault()
            onOpenRecord(args.row)
          }
        }}
        onCellCopy={(args, event) => {
          if (grid.onCellCopy) {
            grid.onCellCopy(args, event)
            return
          }
          const col = visible.find((c) => c.key === args.column.key)
          if (col) {
            event.preventDefault()
            event.clipboardData.setData(
              'text/plain',
              cellText(readValue(args.row, col), col.type, { ...col.format, ...col.state?.format }),
            )
          }
        }}
      />
      {pagination && (
        <div className="flex items-center gap-[8px] min-h-[34px] p-[3px_10px] [border-top:1px_solid_var(--ui-border)] text-[12px] text-muted-foreground shrink-0 [&_[data-slot='button']]:h-[26px] [&_[data-slot='button']]:p-[0_8px]">
          <span role={pagination?.error ? 'alert' : 'status'}>
            {pagination?.error ?? (pagination?.loading
              ? 'Loading records…'
              : `${grid.rows.length.toLocaleString()}${
                pagination?.total !== undefined ? ` of ${pagination.total.toLocaleString()}` : ''
              } records`)}
          </span>
          {pagination?.hasMore && (
            <Button
              variant='ghost'
              disabled={pagination.loading}
              onClick={() => void pagination.onLoadMore()}
            >
              {pagination.error ? 'Retry' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </>
  )
}

const columnIcons = {
  text: AlignLeftIcon,
  record: Building2Icon,
  email: MailIcon,
  url: LinkIcon,
  number: HashIcon,
  money: DollarSignIcon,
  percent: PercentIcon,
  date: CalendarIcon,
  datetime: ClockIcon,
  boolean: SquareCheckIcon,
  status: CircleDotIcon,
  tags: TagsIcon,
  member: UserRoundIcon,
}
