import { useMemo, useState } from 'react'
import { type RecordColumn, type TableColumnState } from '@dir/ui/components/record-list/record-table.tsx'
import { RecordList } from '@dir/ui/components/record-list/record-list.tsx'
import { useInfiniteRecords } from '@dir/ui/hooks/use-infinite-records.ts'
import { queryDemoRecords } from '../../../demo/query.ts'
import { type DemoRecord, makeDemoRecords } from '../../../demo/records.ts'
import { demoRecordLoader } from '../../../demo/loaders.ts'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import type { QueryField, RecordFilter, RecordSort } from '@dir/ui/lib/query.ts'
import { bool, num, str, type Update, type Values } from './model.ts'
import { literal, source, state } from './code.ts'
import { Surface } from './surface.tsx'
const rowKeyGetter = (row: DemoRecord) => row.id
const allColumns: RecordColumn<DemoRecord>[] = [
  { key: 'title', name: 'Name', type: 'record', width: 210, getValue: (row) => row.name, required: true },
  { key: 'department', name: 'Team', type: 'text', getValue: (row) => row.team },
  { key: 'email', name: 'Email', type: 'email', width: 240 },
  { key: 'website', name: 'Website', type: 'url', width: 230 },
  { key: 'revenue', name: 'Revenue', type: 'money', width: 180 },
  { key: 'score', name: 'Score', type: 'number', width: 130 },
  { key: 'probability', name: 'Probability', type: 'percent', width: 150 },
  { key: 'joined', name: 'Created', type: 'date', width: 170 },
  { key: 'updated', name: 'Last interaction', type: 'datetime', width: 220 },
  { key: 'active', name: 'Verified', type: 'boolean', width: 130 },
  { key: 'status', name: 'Status', type: 'status', width: 150 },
  { key: 'tags', name: 'Tags', type: 'tags', width: 200 },
  { key: 'owner', name: 'Owner', type: 'member', width: 190 },
  { key: 'description', name: 'Description', type: 'text', width: 300 },
]
const datasets: Record<string, string[]> = {
  People: ['title', 'department', 'email'],
  'Mixed types': [
    'title',
    'status',
    'owner',
    'revenue',
    'probability',
    'joined',
    'active',
    'tags',
    'email',
    'website',
    'description',
  ],
  Numbers: ['title', 'revenue', 'score', 'probability'],
  Dates: ['title', 'joined', 'updated'],
  Choices: ['title', 'status', 'tags', 'owner', 'active'],
}
export function RecordListPreview({ values: v, update }: { values: Values; update: Update }) {
  const filter = v.filter as RecordFilter,
    sorts = v.sorts as RecordSort[],
    search = str(v, 'search'),
    dataset = str(v, 'dataset'),
    remote = bool(v, 'remote'),
    count = num(v, 'rowCount'),
    pageSize = num(v, 'pageSize'),
    failPage = bool(v, 'failPage')
  const [message, setMessage] = useState(''), [columnState, setColumnState] = useState<TableColumnState[]>([])
  const columns = useMemo(
    () => (datasets[dataset] ?? datasets.People!).map((key) => allColumns.find((c) => c.key === key)!),
    [dataset],
  )
  const fields: QueryField[] = columns.map((c) => ({
    id: c.key,
    label: String(c.name),
    type: c.type === 'number' || c.type === 'money' || c.type === 'percent'
      ? 'number'
      : c.type === 'date'
      ? 'date'
      : c.type === 'datetime'
      ? 'datetime'
      : c.type === 'boolean'
      ? 'boolean'
      : c.type === 'status'
      ? 'select'
      : c.type === 'tags'
      ? 'multiSelect'
      : c.type === 'member'
      ? 'relation'
      : 'text',
    options:
      (c.type === 'status'
        ? ['Active', 'Prospect', 'Customer']
        : c.type === 'tags'
        ? ['New', 'Partner', 'Priority']
        : c.type === 'member'
        ? ['Alex Morgan', 'Jordan Lee', 'Sam Taylor']
        : []).map((value) => ({ value, label: value })),
  }))
  const queryKey = JSON.stringify({ search, filter, sorts, count, pageSize, remote, failPage })
  const loadPage = useMemo(() => {
    if (!remote) return undefined
    const load = demoRecordLoader({ count, pageSize, search, sorts, filter })
    let failed = false
    return async (context: Parameters<typeof load>[0]) => {
      if (failPage && context.cursor && !failed) {
        failed = true
        throw new Error('Example page failed. Retry to continue without losing loaded rows.')
      }
      return await load(context)
    }
  }, [remote, count, pageSize, search, sorts, filter, failPage])
  const pages = useInfiniteRecords({ loadPage, queryKey, rowKeyGetter })
  const data = useMemo(() => remote ? [] : makeDemoRecords(count), [remote, count])
  const localRows = useMemo(
    () => remote ? [] : queryDemoRecords(data, { search, filter, sorts }),
    [remote, data, search, filter, sorts],
  )
  const visible = remote ? pages.rows : localRows
  const sortColumns = useMemo(
    () =>
      sorts.map((s) => ({ columnKey: s.field, direction: s.direction === 'asc' ? 'ASC' as const : 'DESC' as const })),
    [sorts],
  )
  const preview = (
    <>
      <RecordList
        title={str(v, 'title')}
        actions={bool(v, 'actions')
          ? <Button onClick={() => setMessage('Add action triggered')}>Add record</Button>
          : undefined}
        footer={bool(v, 'footer') && !remote
          ? `${visible.length.toLocaleString()} of ${count.toLocaleString()} records`
          : undefined}
        grid={{
          sort: {
            fields,
            value: sorts,
            onChange: (next) => update('sorts', next),
          },
          filter: { fields, value: filter, onChange: (next) => update('filter', next) },
          columnSettings: true,
          toolbar: (
            <Input
              aria-label='Search records'
              placeholder='Search records…'
              value={search}
              onChange={(event) => update('search', event.target.value)}
            />
          ),
          'aria-label': 'Records',
          columns,
          rows: visible,
          rowKeyGetter,
          columnState,
          onColumnStateChange: setColumnState,
          sortColumns,
          onSortColumnsChange: (next) =>
            update(
              'sorts',
              next.map((s) => ({ field: s.columnKey, direction: s.direction === 'ASC' ? 'asc' : 'desc' })),
            ),
          pagination: remote ? { ...pages, onLoadMore: pages.loadMore } : undefined,
          onOpenRecord: (row) => setMessage(`Opened: ${row.name}`),
          renderers: {
            noRowsFallback: (
              <div
                className='group/crm-record-list-empty [grid-column:1_/_-1] p-[32px] text-center text-muted-foreground'
                role='status'
              >
                {remote && pages.loading
                  ? 'Loading records…'
                  : remote && pages.error
                  ? 'Records could not be loaded.'
                  : 'No records match your search or filters.'}
              </div>
            ),
          },
        }}
      />
      <output>{message}</output>
    </>
  )
  const columnSource = literal(columns.map(({ getValue: _getValue, ...c }) => c)).replaceAll(
    '"key": "title",',
    '"key": "title",\n    getValue: row => row.name,',
  ).replaceAll('"key": "department",', '"key": "department",\n    getValue: row => row.team,')
  const imports = `import { useMemo } from 'react'
import { RecordList } from './components/record-list/record-list.tsx'
import { useInfiniteRecords } from './hooks/use-infinite-records.ts'
import { type RecordColumn, type TableColumnState } from './components/record-list/record-table.tsx'
import { Button } from './components/ui/button.tsx'
import { Input } from './components/ui/input.tsx'
import type { QueryField, RecordFilter, RecordSort } from './lib/query.ts'
import { makeDemoRecords, type DemoRecord } from './demo/records.ts'
import { queryDemoRecords } from './demo/query.ts'
${remote ? "import { demoRecordLoader } from './demo/loaders.ts'" : ''}
const columns: RecordColumn<DemoRecord>[] = ${columnSource}
const fields: QueryField[] = ${literal(fields)}
const rowKeyGetter = (row: DemoRecord) => row.id`
  const setup = state('columnState', columnState, 'TableColumnState[]') + '\n' + state('sorts', sorts, 'RecordSort[]') +
    '\n' + state('filter', filter, 'RecordFilter') + '\n' + state('search', search) + '\n' + state('message', '') +
    '\n' +
    (remote
      ? `const queryKey = JSON.stringify({ search, filter, sorts })
const loadPage = useMemo(() => {
  const load = demoRecordLoader({ count: ${count}, pageSize: ${pageSize}, search, filter, sorts })
  ${
        failPage
          ? "let failed = false; return async (context: Parameters<typeof load>[0]) => { if (context.cursor && !failed) { failed = true; throw new Error('Example page failed. Retry to continue without losing loaded rows.') } return await load(context) }"
          : 'return load'
      }
}, [search, filter, sorts])
const pages = useInfiniteRecords({ loadPage, queryKey, rowKeyGetter })
const rows = pages.rows`
      : `const data = useMemo(() => makeDemoRecords(${count}), [])
const rows = useMemo(() => queryDemoRecords(data, { search, filter, sorts }), [data, search, filter, sorts])`)
  const body = `<><RecordList title={${literal(v.title)}}
  ${
    bool(v, 'actions')
      ? 'actions={<Button onClick={() => setMessage("Add action triggered")}>Add record</Button>}'
      : ''
  }
  ${
    bool(v, 'footer') && !remote
      ? 'footer={`${rows.length.toLocaleString()} of ' + count.toLocaleString() + ' records`}'
      : ''
  }
  grid={{
  sort: { fields, value: sorts, onChange: setSorts },
  filter: { fields, value: filter, onChange: setFilter },
  columnSettings: true,
  toolbar: <Input aria-label="Search records" placeholder="Search records…" value={search} onChange={event => setSearch(event.target.value)} />,
    'aria-label': 'Records', columns, rows, rowKeyGetter,
    columnState, onColumnStateChange: setColumnState,
    sortColumns: sorts.map(s => ({ columnKey: s.field, direction: s.direction === 'asc' ? 'ASC' : 'DESC' })),
    onSortColumnsChange: next => setSorts(next.map(s => ({ field: s.columnKey, direction: s.direction === 'ASC' ? 'asc' : 'desc' }))),
    onOpenRecord: row => setMessage(\`Opened: \${row.name}\`),
    ${remote ? 'pagination: { ...pages, onLoadMore: pages.loadMore },' : ''}
    renderers: { noRowsFallback: <div className="group/crm-record-list-empty [grid-column:1_/_-1] p-[32px] text-center text-muted-foreground" role="status">${
    remote
      ? '{pages.loading ? "Loading records…" : pages.error ? "Records could not be loaded." : "No records match your search or filters."}'
      : 'No records match your search or filters.'
  }</div> }
  }} /><output>{message}</output></>`
  return <Surface code={source(imports, body, setup)}>{preview}</Surface>
}
