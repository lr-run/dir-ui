import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, EyeOffIcon, PinIcon, SearchIcon } from 'lucide-react'
import { type Key, type ReactNode, useCallback, useMemo, useState } from 'react'
import {
  type Column,
  DataGrid as ReactDataGrid,
  type DataGridProps as NativeDataGridProps,
  SELECT_COLUMN_KEY,
  type SortColumn,
} from 'react-data-grid'
import { type FilterEditorProps, FilterMenu, type SortEditorProps, SortMenu } from './internal/query-controls.tsx'
import {
  ColumnSettingsMenu,
  type ColumnSettingsProps,
  type ColumnState,
  normalizeColumns,
} from './internal/column-settings.tsx'
import { cn } from 'cn'
import { Menu } from '@base-ui/react/menu'
import { IconButton } from '../ui/icon-button.tsx'
import { Input } from '../ui/input.tsx'
import { PopoverPanel } from '../ui/popover-panel.tsx'
import { ColumnHeader, columnMenuItem } from './internal/column-header.tsx'
import { moveItem } from '../../lib/query.ts'
export { renderTextEditor, SelectColumn } from 'react-data-grid'
export type { Column, SortColumn } from 'react-data-grid'
export type { FilterCondition, FilterValue, QueryField, RecordFilter, RecordSort } from '../../lib/query.ts'
export type GridSortOptions = SortEditorProps
export type GridFilterOptions = FilterEditorProps
export type GridColumnSettings = ColumnSettingsProps
export type { ColumnState as GridColumnState } from './internal/column-settings.tsx'
export type GridSearchOptions = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
}
export type DataGridProps<R, SR = unknown, K extends Key = Key> = Omit<NativeDataGridProps<R, SR, K>, 'columns'> & {
  columns: readonly Column<R, SR>[]
  sort?: GridSortOptions
  filter?: GridFilterOptions
  columnSettings?: boolean | GridColumnSettings
  search?: GridSearchOptions
  columnMenus?: boolean
  toolbar?: ReactNode
  containerClassName?: string
  toolbarClassName?: string
}
export function DataGrid<R, SR = unknown, K extends Key = Key>(
  { sort, filter, search, columnMenus = true, columnSettings, toolbar, containerClassName, toolbarClassName, ...grid }:
    DataGridProps<R, SR, K>,
) {
  const [localColumns, setLocalColumns] = useState<ColumnState[]>([])
  const settings = typeof columnSettings === 'object' ? columnSettings : undefined
  const definitions = useMemo(() =>
    grid.columns.map((column) => ({
      id: column.key,
      label: column.key === SELECT_COLUMN_KEY
        ? 'Selection'
        : typeof column.name === 'string'
        ? column.name
        : column.key,
      required: column.key === SELECT_COLUMN_KEY,
    })), [grid.columns])
  const defaults = useMemo(
    () => grid.columns.map((column) => ({ id: column.key, visible: true, frozen: Boolean(column.frozen) })),
    [grid.columns],
  )
  const controls: ColumnSettingsProps = useMemo(() =>
    settings ?? {
      columns: definitions,
      value: localColumns.length ? localColumns : defaults,
      onChange: setLocalColumns,
      onReset: () => setLocalColumns([]),
    }, [settings, definitions, localColumns, defaults])
  const sortColumns = useMemo(() =>
    grid.sortColumns ??
      sort?.value.map((item) => ({
        columnKey: item.field,
        direction: item.direction === 'asc' ? 'ASC' as const : 'DESC' as const,
      })), [grid.sortColumns, sort?.value])
  const changeSort = useMemo(() =>
    grid.onSortColumnsChange ??
      (sort
        ? (next: SortColumn[]) =>
          sort.onChange(
            next.map((item) => ({ field: item.columnKey, direction: item.direction === 'ASC' ? 'asc' : 'desc' })),
          )
        : undefined), [grid.onSortColumnsChange, sort])
  const normalized = useMemo(() => normalizeColumns(controls.columns, controls.value), [
    controls.columns,
    controls.value,
  ])
  const patchColumn = useCallback(
    (id: string, patch: Partial<ColumnState>) =>
      controls.onChange(normalized.map((column) => column.id === id ? { ...column, ...patch } : column)),
    [controls.onChange, normalized],
  )
  const ordered = useMemo(
    () => normalized.filter((state) => state.visible).sort((a, b) => Number(!!b.frozen) - Number(!!a.frozen)),
    [normalized],
  )
  const moveColumn = useCallback((source: string, target: string) => {
    if (controls.disabled) return
    const from = normalized.findIndex((c) => c.id === source), to = normalized.findIndex((c) => c.id === target)
    if (
      from < 0 || to < 0 || source === SELECT_COLUMN_KEY || target === SELECT_COLUMN_KEY ||
      !!normalized[from]!.frozen !== !!normalized[to]!.frozen
    ) return
    controls.onChange(moveItem(normalized, from, to))
  }, [controls.disabled, controls.onChange, normalized])
  const columns = useMemo(() =>
    !columnSettings && !columnMenus ? grid.columns : ordered.flatMap((state, index) => {
      const source = grid.columns.find((column) => column.key === state.id)
      if (!source) return []
      const column = { ...source, frozen: state.frozen ? source.frozen === 'end' ? 'end' as const : true : false }
      if (!columnMenus || column.renderHeaderCell || column.key === SELECT_COLUMN_KEY) return [column]
      const label = typeof column.name === 'string' ? column.name : column.key
      const definition = controls.columns.find((item) => item.id === column.key)
      const activeSort = sortColumns?.find((item) => item.columnKey === column.key)
      const sorting = (direction: 'ASC' | 'DESC') =>
        changeSort?.(
          activeSort?.direction === direction
            ? (sortColumns ?? []).filter((s) => s.columnKey !== column.key)
            : [{ columnKey: column.key, direction }, ...(sortColumns ?? []).filter((s) => s.columnKey !== column.key)],
        )
      return [{
        ...column,
        sortable: false,
        draggable: column.draggable ?? column.key !== SELECT_COLUMN_KEY,
        renderHeaderCell: ({ tabIndex }: { tabIndex: number }) => (
          <ColumnHeader label={label} direction={activeSort?.direction} tabIndex={tabIndex}>
            {changeSort && column.sortable !== false && (
              <>
                <Menu.CheckboxItem
                  className={columnMenuItem}
                  closeOnClick
                  checked={activeSort?.direction === 'ASC'}
                  disabled={sort?.disabled}
                  onClick={() => sorting('ASC')}
                >
                  <span aria-hidden>↑</span>Sort ascending<Menu.CheckboxItemIndicator className='ml-auto'>
                    <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                  </Menu.CheckboxItemIndicator>
                </Menu.CheckboxItem>
                <Menu.CheckboxItem
                  className={columnMenuItem}
                  closeOnClick
                  checked={activeSort?.direction === 'DESC'}
                  disabled={sort?.disabled}
                  onClick={() =>
                    sorting('DESC')}
                >
                  <span aria-hidden>↓</span>Sort descending<Menu.CheckboxItemIndicator className='ml-auto'>
                    <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                  </Menu.CheckboxItemIndicator>
                </Menu.CheckboxItem>
              </>
            )}
            <Menu.Item
              className={columnMenuItem}
              disabled={controls.disabled || definition?.canFreeze === false}
              onClick={() =>
                patchColumn(column.key, { frozen: !state.frozen })}
            >
              <PinIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
              {state.frozen ? 'Unfreeze column' : 'Freeze column'}
            </Menu.Item>
            <Menu.Item
              className={columnMenuItem}
              disabled={controls.disabled || index === 0 || ordered[index - 1]?.id === SELECT_COLUMN_KEY ||
                !!ordered[index - 1]?.frozen !== !!state.frozen}
              onClick={() =>
                moveColumn(column.key, ordered[index - 1]!.id)}
            >
              <ArrowLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Move left
            </Menu.Item>
            <Menu.Item
              className={columnMenuItem}
              disabled={controls.disabled || index === ordered.length - 1 ||
                !!ordered[index + 1]?.frozen !== !!state.frozen}
              onClick={() => moveColumn(column.key, ordered[index + 1]!.id)}
            >
              <ArrowRightIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Move right
            </Menu.Item>
            <Menu.Separator className='my-1 h-px bg-border' />
            <Menu.Item
              className={columnMenuItem}
              disabled={!columnSettings || controls.disabled || definition?.required}
              onClick={() => patchColumn(column.key, { visible: false })}
            >
              <EyeOffIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Hide from view
            </Menu.Item>
          </ColumnHeader>
        ),
      }]
    }), [
    columnSettings,
    columnMenus,
    grid.columns,
    ordered,
    controls,
    sortColumns,
    changeSort,
    sort?.disabled,
    patchColumn,
    moveColumn,
  ])

  return (
    <div
      className={cn(
        '@container min-w-0 w-full',
        containerClassName,
      )}
    >
      {(sort || filter || columnSettings || search || toolbar) && (
        <div
          className={cn(
            "@container flex flex-wrap items-center gap-1.5 px-3 py-2 [&>[data-slot='input']]:ml-auto [&>[data-slot='input']]:w-[220px] [&>[data-slot='input']]:max-w-full",
            toolbarClassName,
          )}
          role='group'
          aria-label='Grid controls'
        >
          {sort && <SortMenu {...sort} />}
          {filter && <FilterMenu {...filter} />}
          {columnSettings && <ColumnSettingsMenu {...controls} />}
          {toolbar}
          {search && <GridSearch {...search} />}
        </div>
      )}
      <ReactDataGrid
        {...grid}
        rowHeight={grid.rowHeight ?? 40}
        headerRowHeight={grid.headerRowHeight ?? 40}
        onColumnsReorder={grid.onColumnsReorder ?? moveColumn}
        // RDG beta.61 renders frozen-edge shadows as role-less children with logical insets.
        // Keep its scroll-state visibility and RTL placement; only soften the edge.
        className={cn(
          "h-[var(--record-list-height,320px)] border border-border rounded-none [--rdg-background-color:var(--ui-raised)] [--rdg-header-background-color:var(--ui-raised)] [--rdg-color:var(--ui-text)] [--rdg-row-hover-background-color:var(--ui-hover)] [--rdg-border-color:var(--ui-border)] [--rdg-selection-color:var(--ui-accent)] [--rdg-selection-width:1px] [font-family:inherit] [--rdg-font-size:13px] [&_[role='columnheader']]:p-0 [&_[role='columnheader']]:font-medium [&_[role='gridcell']]:px-3 [&>div:not([role])[style*='inset-inline-']]:w-1! [&>div:not([role])[style*='inset-inline-']]:[filter:opacity(.4)]",
          grid.className,
        )}
        columns={columns}
        sortColumns={sortColumns}
        onSortColumnsChange={changeSort}
      />
    </div>
  )
}

function GridSearch(
  { value, onChange, label = 'Search records', placeholder = 'Search records…', disabled }: GridSearchOptions,
) {
  return (
    <>
      <label className='ml-auto hidden min-w-20 max-w-[180px] flex-1 items-center gap-1.5 rounded border border-transparent pl-2 text-muted-foreground focus-within:border-ring @min-[521px]:flex'>
        <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        <Input
          aria-label={label}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className='h-[30px] min-w-0 w-full border-transparent bg-transparent pl-0 text-xs shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none'
        />
      </label>
      <div className='ml-auto shrink-0 @min-[521px]:hidden'>
        <PopoverPanel
          title='Search records'
          width={280}
          align='end'
          trigger={
            <IconButton
              label={label}
              variant='ghost'
              disabled={disabled}
              className={value ? 'bg-accent text-foreground' : 'text-muted-foreground'}
            >
              <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </IconButton>
          }
        >
          <Input
            aria-label={label}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        </PopoverPanel>
      </div>
    </>
  )
}
