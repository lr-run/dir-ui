import { ExternalLinkIcon, PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  type Column,
  DataGrid,
  type QueryField,
  type RecordFilter,
  type RecordSort,
  SelectColumn,
} from '@dir/ui/components/data-grid/data-grid.tsx'
import { Header } from '@dir/ui/components/header.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import { NumberValue } from '@dir/ui/components/ui/value.tsx'
import { queryTextRecords } from '@dir/ui/lib/record-list-query.ts'
import { stage, stages } from './data.ts'
import type { ComponentDoc } from './index.ts'

type Deal = { id: number; name: string; company: string; stage: string; amount: number }
const deals: Deal[] = [
  { id: 1, name: 'Core system renewal', company: 'ABC Trading', stage: 'negotiation', amount: 12000000 },
  { id: 2, name: 'Production management PoC', company: 'Hokuto Manufacturing', stage: 'proposed', amount: 4800000 },
  { id: 3, name: 'Attendance integration', company: 'Hokuto Manufacturing', stage: 'lead', amount: 1500000 },
  { id: 4, name: 'Warehouse scanners', company: 'Daichi Logistics', stage: 'won', amount: 8200000 },
  { id: 5, name: 'Portal redesign', company: 'Sakura Foods', stage: 'lost', amount: 3100000 },
]
const fields: QueryField[] = [
  { id: 'name', label: 'Deal', type: 'text' },
  { id: 'company', label: 'Company', type: 'text' },
  { id: 'stage', label: 'Stage', type: 'select', options: stages },
  { id: 'amount', label: 'Amount', type: 'number' },
]

export function DataGridDemo() {
  const [search, setSearch] = useState('')
  const [sorts, setSorts] = useState<RecordSort[]>([])
  const [filter, setFilter] = useState<RecordFilter>({ conjunction: 'and', conditions: [] })
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set([2]))
  const columns = useMemo<Column<Deal>[]>(() => [
    SelectColumn,
    {
      key: 'name',
      name: 'Deal',
      frozen: true,
      minWidth: 220,
      resizable: true,
      sortable: true,
      renderCell: ({ row }) => <span className='font-medium'>{row.name}</span>,
    },
    { key: 'company', name: 'Company', minWidth: 160, resizable: true, sortable: true },
    {
      key: 'stage',
      name: 'Stage',
      minWidth: 140,
      sortable: true,
      renderCell: ({ row }) => <ChoiceContent item={stage(row.stage)} compact />,
    },
    {
      key: 'amount',
      name: 'Amount',
      minWidth: 130,
      sortable: true,
      cellClass: 'text-right',
      headerCellClass: 'text-right',
      renderCell: ({ row }) => (
        <NumberValue value={row.amount} format='currency' currency='JPY' locale='ja-JP' maximumFractionDigits={0} />
      ),
    },
    {
      key: 'preview',
      name: '',
      width: 44,
      renderCell: () => (
        <IconButton variant='ghost' label='Preview'>
          <ExternalLinkIcon size={14} strokeWidth={1.5} aria-hidden='true' />
        </IconButton>
      ),
    },
  ], [])
  const rows = useMemo(
    () =>
      queryTextRecords(deals, {
        name: (r) => r.name,
        company: (r) => r.company,
        stage: (r) => stage(r.stage).label,
        amount: (r) => String(r.amount),
      }, {
        search,
        sorts,
        filter,
      }),
    [search, sorts, filter],
  )
  return (
    <div className='flex h-[330px] w-full flex-col overflow-hidden rounded-lg border border-border bg-(--ui-surface)'>
      <Header
        className='min-h-12 px-3.5'
        title={
          <span className='flex items-center gap-3'>
            Deals
            <span className='flex gap-1'>
              <Button variant='ghost' className='bg-muted'>Default</Button>
              <Button variant='ghost'>View 2</Button>
              <IconButton variant='ghost' label='Save view'>
                <PlusIcon size={14} strokeWidth={1.5} aria-hidden='true' />
              </IconButton>
            </span>
          </span>
        }
        actions={
          <>
            <Button variant='ghost'>Archive</Button>
            <Button variant='default'>New deal</Button>
          </>
        }
      />
      <DataGrid
        className='min-h-0 flex-1'
        aria-label='Deals'
        columns={columns}
        rows={rows}
        rowKeyGetter={(row) => row.id}
        selectedRows={selected}
        onSelectedRowsChange={setSelected}
        search={{ value: search, onChange: setSearch }}
        sort={{ fields, value: sorts, onChange: setSorts }}
        filter={{ fields, value: filter, onChange: setFilter }}
        columnSettings
        toolbar={<span className='ml-auto text-[12px] text-muted-foreground'>{rows.length} records</span>}
      />
    </div>
  )
}
export function DataGridBasic() {
  const columns: Column<Deal>[] = [
    { key: 'name', name: 'Deal', frozen: true, minWidth: 220, resizable: true },
    { key: 'company', name: 'Company', minWidth: 160 },
    { key: 'amount', name: 'Amount', minWidth: 130, cellClass: 'text-right', headerCellClass: 'text-right' },
  ]
  return (
    <div className='h-[260px] w-full overflow-hidden rounded-lg border border-border'>
      <DataGrid
        className='h-full'
        aria-label='Deals'
        columns={columns}
        rows={deals}
        rowKeyGetter={(row) => row.id}
        columnMenus={false}
      />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: DataGridDemo,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'basic',
      title: 'Basic',
      description:
        'A grid with columns and rows only. Rows are 40px, cells 13px, headers 12px muted; numeric columns are right-aligned. Set `columnMenus={false}` to hide the header menus.',
      example: DataGridBasic,
      align: 'stretch',
    },
  ],
}
