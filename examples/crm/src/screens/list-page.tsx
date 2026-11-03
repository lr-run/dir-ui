import { ActionsMenu } from '@/components/crm/components/actions-menu.tsx'
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  Columns3Icon,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { type RecordColumn, type RecordTableProps } from '@/components/crm/components/record-table.tsx'
import { RecordList } from '@/components/crm/components/record-list.tsx'
import type { RecordFilter, RecordSort } from '@/components/data-grid/data-grid.tsx'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { ConfirmDialog } from '@/components/ui/alert-dialog.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { Menu as DropdownMenu } from '@base-ui/react/menu'
import { MenuPopup } from '@/components/ui/menu-popup.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { cellText } from '@/components/crm/components/record-table-model.ts'
import type { QueryField } from '@/lib/query.ts'

import { useForm } from 'react-hook-form'
import type { ListView, ListViewProps, ListViews } from '@/components/crm/types.ts'

export type ListQuery = { search: string; sorts: readonly RecordSort[]; filter: RecordFilter }
export type ListPageDefinition<R> = {
  title: string
  singular: string
  icon?: ReactNode
  columns: readonly RecordColumn<R>[]
  queryFields: readonly QueryField[]
  rowKey: (record: R) => string
  query: (records: readonly R[], query: ListQuery) => readonly R[]
}

export function ListPage<R>(
  {
    definition: config,
    leading,
    records,
    views: saved,
    onViewsChange: setSaved,
    onCreate,
    onOpenDetail,
    onOpenPreview,
    archived = false,
    onArchivedChange,
    inlineEditing,
  }: ListViewProps & {
    inlineEditing?: RecordTableProps<R>['inlineEditing']
    archived?: boolean
    onArchivedChange?: (value: boolean) => void
    definition: ListPageDefinition<R>
    leading?: ReactNode
    records: readonly R[]
    /** Omit for read-only records: the New button and the empty state's create action disappear. */
    onCreate?: () => void
    onOpenDetail: (record: R) => void
    onOpenPreview: (record: R, rows: readonly R[]) => void
  },
) {
  const [search, setSearch] = useState('')
  const viewButtons = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState<ListView | null>(null)
  const [deleting, setDeleting] = useState<ListView | null>(null)
  const [removed, setRemoved] = useState<{ view: ListView; index: number } | null>(null)
  const active = saved.views.find((view) => view.id === saved.activeId)!
  const { sorts, filter } = active
  const updateView = (patch: Partial<ListView>) =>
    setSaved((previous) => ({
      ...previous,
      views: previous.views.map((view) => view.id === previous.activeId ? { ...view, ...patch } : view),
    }))
  const setSorts = (sorts: RecordSort[]) => updateView({ sorts })
  const setFilter = (filter: RecordFilter) => updateView({ filter })
  useEffect(() => {
    viewButtons.current?.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [saved.activeId])
  const selectView = (id: string) => {
    setSearch('')
    setSaved((previous) => ({ ...previous, activeId: id }))
  }
  const { columns, queryFields: fields, query } = config
  const rows = useMemo(() => query(records, { search, sorts, filter }), [records, query, search, sorts, filter])
  // Phones get a List instead of the grid (rule 12); the header and views stay the same.
  const phone = usePhone()
  const emptyState = (
    <div className='sticky left-0 [grid-column:1_/_-1] w-[100cqw] [align-self:start] p-[48px_20px] text-center text-muted-foreground [&_h3]:text-foreground [&_h3]:text-[15px] [&_p]:text-[13px] [&_p]:m-[12px_0_20px]'>
      <h3>
        {archived
          ? 'No archived records found'
          : records.length
          ? 'No matching records'
          : `No ${config.title.toLowerCase()} yet`}
      </h3>
      <p>
        {archived
          ? 'Archived records appear here. Try a different search or filter, or return to active records.'
          : records.length
          ? 'Try a different search or filter.'
          : onCreate
          ? `Create your first ${config.singular.toLowerCase()}.`
          : 'Nothing has been added yet.'}
      </p>
      {(archived || records.length > 0 || onCreate) && (
        <Button
          onClick={() => {
            if (archived && onArchivedChange) {
              onArchivedChange(false)
            } else if (records.length) {
              setSearch('')
              setFilter({ conjunction: 'and', conditions: [] })
            } else onCreate?.()
          }}
        >
          {archived ? 'Back to active records' : records.length ? 'Clear search and filters' : `New ${config.singular}`}
        </Button>
      )}
    </div>
  )
  const grid: RecordTableProps<R> = {
    inlineEditing,
    containerClassName: 'contents',
    toolbarClassName:
      'col-start-1 row-start-2 min-w-0 flex-nowrap gap-1.5 border-b border-border px-3 py-0 [&>button]:shrink-0 @max-[520px]:[&>button:first-child]:max-w-[110px] @max-[520px]:[&>button]:px-2 @max-[520px]:[&>button:first-child_span]:truncate',
    className: 'col-span-full row-start-3 h-full min-h-0 rounded-none border-0 @container',
    columns,
    rows,
    rowKeyGetter: config.rowKey,
    'aria-label': config.title,
    columnSettings: true,
    columnState: active.columns,
    onColumnStateChange: (columns) => updateView({ columns }),
    sort: { fields, value: sorts, onChange: setSorts },
    filter: { fields, value: filter, onChange: setFilter },
    rowHeight: 40,
    search: { value: search, onChange: setSearch, label: `Search ${config.title.toLowerCase()}` },
    onOpenRecord: onOpenDetail,
    onPreviewRecord: (record) => onOpenPreview(record, rows),
    renderers: {
      noRowsFallback: emptyState,
    },
  }
  return (
    <div className='flex-1 min-h-0 min-w-0 overflow-hidden [container-type:inline-size] [&_h1]:text-[16px] [&_h1]:font-semibold [&_h1]:m-0 [&_h1]:whitespace-nowrap'>
      <RecordList
        gridKey={active.id}
        className='grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[56px_44px_minmax(0,1fr)_30px]'
        classNames={{
          header: 'col-start-1 row-start-1 min-w-0 flex-nowrap gap-2 border-b border-border px-3 py-0',
          title: 'm-0 flex min-w-0 flex-1 items-center gap-2 font-normal',
          content: 'contents',
          footer: 'col-span-full row-start-4 border-t border-border px-3.5 py-0 text-[11px] text-muted-foreground',
        }}
        title={
          <>
            {leading}
            {config.icon}
            <h1>{config.title}</h1>
            {archived && <span className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>Archived</span>}
            <span className='mx-1 h-4 w-px shrink-0 bg-border @max-[520px]:hidden' />
            <div
              ref={viewButtons}
              role='group'
              aria-label={`${config.title} views`}
              className='flex min-w-0 items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none]'
            >
              {saved.views.map((view) => (
                <div
                  key={view.id}
                  data-active={view.id === saved.activeId || undefined}
                  className='flex shrink-0 items-center rounded-md border border-transparent text-muted-foreground hover:bg-accent data-active:border-border data-active:bg-accent data-active:text-foreground'
                >
                  <Button
                    variant='ghost'
                    aria-pressed={view.id === saved.activeId}
                    title={view.name}
                    onClick={() => selectView(view.id)}
                    className='h-7 max-w-40 gap-1.5 rounded-r-none px-2 text-xs font-medium @max-[520px]:max-w-24'
                  >
                    <span className='@max-[520px]:hidden'>
                      <Columns3Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                    </span>
                    <span className='truncate'>{view.name}</span>
                  </Button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                      render={
                        <IconButton
                          variant='ghost'
                          label={`${view.name} options`}
                          className='h-7 w-6 rounded-l-none border-l border-transparent px-0'
                        />
                      }
                    >
                      <ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                    </DropdownMenu.Trigger>
                    <MenuPopup>
                      <DropdownMenu.Group>
                        <DropdownMenu.GroupLabel className='max-w-64 truncate px-2 py-1.5 text-xs font-medium text-muted-foreground'>
                          {view.name}
                        </DropdownMenu.GroupLabel>
                        <DropdownMenu.Item
                          onClick={() => setEditing(view)}
                          className='flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-xs outline-none data-highlighted:bg-accent'
                        >
                          <PencilIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onClick={() => {
                            setRemoved(null)
                            setSearch('')
                            setSaved((previous) => addListView(previous, view, `${view.name} copy`))
                          }}
                          className='flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-xs outline-none data-highlighted:bg-accent'
                        >
                          <CopyIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Duplicate
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className='my-1 h-px bg-border' />
                        <DropdownMenu.Item
                          disabled={saved.views.length === 1}
                          onClick={() => setDeleting(view)}
                          className='flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-xs text-destructive outline-none data-highlighted:bg-accent data-disabled:opacity-40'
                        >
                          <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Group>
                    </MenuPopup>
                  </DropdownMenu.Root>
                </div>
              ))}
            </div>
            <IconButton
              label='Add view'
              variant='ghost'
              className='shrink-0'
              onClick={() => {
                setRemoved(null)
                setSearch('')
                setSaved((previous) => addListView(previous, active))
              }}
            >
              <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </IconButton>
          </>
        }
        actions={
          <>
            {archived && onArchivedChange && (
              <Button
                variant='ghost'
                onClick={() => onArchivedChange(false)}
                className='h-7 text-xs'
                aria-label='Back to active records'
              >
                <ArrowLeftIcon size={14} aria-hidden />
                <span className='@max-[700px]:hidden'>Back to active records</span>
              </Button>
            )}
            {!archived && onCreate && !phone && (
              <Button
                className="h-[28px] text-[12px] whitespace-nowrap [@container(max-width:_420px)]:w-[28px] [@container(max-width:_420px)]:p-0 [@container(max-width:_420px)]:ml-auto [@container(max-width:_420px)]:[&_[class~='group/screen-create-label']]:hidden"
                aria-label={`New ${config.singular}`}
                variant='default'
                onClick={onCreate}
              >
                <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                <span className='group/screen-create-label'>New {config.singular}</span>
              </Button>
            )}
            {!archived && onArchivedChange && (
              <ActionsMenu
                label={`${config.title} options`}
                items={[{
                  label: 'View archived records',
                  icon: <ArchiveIcon size={14} aria-hidden />,
                  onClick: () => onArchivedChange(true),
                }]}
              />
            )}
          </>
        }
        footer={
          <>
            <span>
              {rows.length} {rows.length === 1 ? 'record' : 'records'}
              {rows.length !== records.length && ` of ${records.length}`}
            </span>
            {removed && (
              <span role='status' className='flex items-center gap-2'>
                View deleted{' '}
                <button
                  type='button'
                  className='underline'
                  onClick={() => {
                    setSaved((previous) => {
                      const views = [...previous.views]
                      views.splice(removed.index, 0, removed.view)
                      return { views, activeId: removed.view.id }
                    })
                    setRemoved(null)
                  }}
                >
                  Undo
                </button>
              </span>
            )}
          </>
        }
        {...phone
          ? {
            children: (
              <PhoneRows
                rows={rows}
                columns={columns}
                search={search}
                onSearch={setSearch}
                label={`Search ${config.title.toLowerCase()}`}
                empty={emptyState}
                onOpen={onOpenDetail}
                create={!archived && onCreate ? { label: `New ${config.singular}`, onClick: onCreate } : undefined}
              />
            ),
          }
          : { grid }}
      />
      {deleting && (
        <ConfirmDialog
          open
          title='Delete view?'
          description={`Delete “${deleting.name}” from your saved views? You can undo this after deletion.`}
          action='Delete view'
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
          onConfirm={() => {
            setRemoved({
              view: deleting,
              index: saved.views.findIndex((view) =>
                view.id === deleting.id
              ),
            })
            setSaved((previous) => removeListView(previous, deleting.id))
            if (deleting.id === saved.activeId) setSearch('')
            setDeleting(null)
          }}
        />
      )}
      {editing && (
        <ViewNameForm
          initialName={editing.name}
          names={saved.views.filter((view) => view.id !== editing.id).map((view) => view.name)}
          onClose={() => setEditing(null)}
          onSave={(name) => {
            setRemoved(null)
            setSaved((previous) => ({
              ...previous,
              views: previous.views.map((view) => view.id === editing.id ? { ...view, name } : view),
            }))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ViewNameForm({ initialName, names, onClose, onSave }: {
  initialName: string
  names: string[]
  onClose: () => void
  onSave: (name: string) => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
    defaultValues: { name: initialName },
  })
  return (
    <Dialog
      open
      title='Rename view'
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      className='w-[min(400px,calc(100vw_-_32px))]'
    >
      <form className='grid gap-5 p-5' onSubmit={handleSubmit(({ name }) => onSave(name.trim()))}>
        <Field label='View name' required error={errors.name?.message}>
          {(props) => (
            <Input
              {...props}
              maxLength={80}
              placeholder='e.g. Active customers'
              {...register('name', {
                validate: (name) =>
                  !name.trim()
                    ? 'Enter a view name.'
                    : names.some((existing) => existing.toLowerCase() === name.trim().toLowerCase())
                    ? 'A view with this name already exists.'
                    : true,
              })}
            />
          )}
        </Field>
        <div className='flex justify-end gap-2'>
          <Button type='button' onClick={onClose}>Cancel</Button>
          <Button type='submit' variant='default'>Save</Button>
        </div>
      </form>
    </Dialog>
  )
}

export function addListView(state: ListViews, source: ListView, name?: string): ListViews {
  const names = new Set(state.views.map((view) => view.name.toLowerCase()))
  const base = name?.trim().slice(0, 80)
  let nextName = base || 'View 1'
  for (let number = 2; names.has(nextName.toLowerCase()); number++) {
    const suffix = ` ${number}`
    nextName = base ? `${base.slice(0, 80 - suffix.length)}${suffix}` : `View ${number}`
  }
  const view = { ...structuredClone(source), id: crypto.randomUUID(), name: nextName }
  return { activeId: view.id, views: [...state.views, view] }
}
export function removeListView(state: ListViews, id: string): ListViews {
  if (state.views.length <= 1) return state
  const views = state.views.filter((view) => view.id !== id)
  const index = state.views.findIndex((view) => view.id === id)
  return { views, activeId: state.activeId === id ? views[Math.max(0, index - 1)]!.id : state.activeId }
}

const phoneQuery = '(max-width: 600px)'
function usePhone() {
  return useSyncExternalStore(
    (notify) => {
      const media = matchMedia(phoneQuery)
      media.addEventListener('change', notify)
      return () => media.removeEventListener('change', notify)
    },
    () => matchMedia(phoneQuery).matches,
    () => false,
  )
}
/** The phone layout of a list: search, then one ListItem per record with its first details and status. */
function PhoneRows<R>({ rows, columns, search, onSearch, label, empty, onOpen, create }: {
  rows: readonly R[]
  columns: readonly RecordColumn<R>[]
  search: string
  onSearch: (value: string) => void
  label: string
  empty: ReactNode
  onOpen: (row: R) => void
  create?: { label: string; onClick: () => void }
}) {
  const [limit, setLimit] = useState(50)
  const [name, ...rest] = columns
  const read = (row: R, column: RecordColumn<R>) =>
    column.getValue ? column.getValue(row) : Reflect.get(row as object, column.key)
  const status = rest.find((column) => column.type === 'status')
  const details = rest.filter((column) => column !== status && column.type !== 'date' && column.type !== 'datetime')
    .slice(0, 2)
  return (
    <>
      <div className='col-start-1 row-start-2 flex items-center border-b border-border px-3'>
        <Input
          type='search'
          aria-label={label}
          placeholder={`${label}…`}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className='col-start-1 row-start-3 flex min-h-0 flex-col'>
        <div className='min-h-0 flex-1 overflow-auto'>
          {rows.length
            ? (
              <List>
                {rows.slice(0, limit).map((row, index) => (
                  <ListItem
                    key={index}
                    className='px-3'
                    onOpen={() => onOpen(row)}
                    title={cellText(read(row, name!), name!.type, name!.format)}
                    description={details.map((column) => cellText(read(row, column), column.type, column.format))
                      .filter(Boolean).join(' · ') || undefined}
                    trailing={status && (
                      <span className='flex shrink-0 items-center gap-1.5 text-[12px]'>
                        {status.renderCell
                          ? status.renderCell(
                            { row, column: status } as Parameters<NonNullable<typeof status.renderCell>>[0],
                          )
                          : (
                            <>
                              <span className='size-1.5 rounded-full bg-(--ui-muted)' aria-hidden='true' />
                              {cellText(read(row, status), 'text')}
                            </>
                          )}
                      </span>
                    )}
                  />
                ))}
              </List>
            )
            : empty}
          {rows.length > limit && (
            <div className='p-3'>
              <Button className='w-full' onClick={() => setLimit(limit + 50)}>Show more</Button>
            </div>
          )}
        </div>
        {create && (
          <div className='shrink-0 border-t border-border p-3 pb-[calc(12px+env(safe-area-inset-bottom))]'>
            <Button variant='default' className='h-8 w-full' onClick={create.onClick}>
              <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
              {create.label}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
