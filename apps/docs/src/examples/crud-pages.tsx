// Shared page bodies for the layout demos: a small CRUD back office for a mortgage team.
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { List, ListItem } from '@dir/ui/components/ui/list.tsx'
import { EmptyState } from '@dir/ui/components/ui/empty-state.tsx'
import { TabBar } from '@dir/ui/components/ui/tab-bar.tsx'
import { TabsContent } from '@dir/ui/components/ui/tabs.tsx'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const statuses = {
  active: { value: 'active', label: 'Active', color: 'var(--ui-green)' },
  lead: { value: 'lead', label: 'Lead', color: 'var(--ui-blue)' },
  paused: { value: 'paused', label: 'Paused', color: 'var(--ui-muted)' },
}
const clients = [
  {
    name: 'Chris and Ada Okafor',
    email: 'okafor@example.com',
    status: statuses.active,
    owner: 'Nizam',
    updated: 'Today',
  },
  { name: 'Tomasz Wierzbicki', email: 'tomasz@example.com', status: statuses.active, owner: 'Nizam', updated: 'Today' },
  {
    name: 'Marisol Quenby',
    email: 'marisol@example.com',
    status: statuses.lead,
    owner: 'Tessaly',
    updated: 'Yesterday',
  },
  { name: 'Odile Fontaine', email: 'odile@example.com', status: statuses.active, owner: 'Nizam', updated: 'Oct 30' },
  { name: 'Ines Calloway', email: 'ines@example.com', status: statuses.paused, owner: 'Tessaly', updated: 'Oct 28' },
  { name: 'Gideon Marsh', email: 'gideon@example.com', status: statuses.lead, owner: 'Nizam', updated: 'Oct 27' },
  {
    name: 'Lucille Brandt',
    email: 'lucille@example.com',
    status: statuses.active,
    owner: 'Tessaly',
    updated: 'Oct 25',
  },
]
const page = 'flex flex-col gap-6 p-6 max-[600px]:gap-4 max-[600px]:p-4'
const panel = 'rounded-lg border border-border'
const table =
  'w-full border-collapse text-left text-[13px] [&_td]:h-11 [&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_th]:h-9 [&_th]:px-4 [&_th]:text-[12px] [&_th]:font-normal [&_th]:text-muted-foreground'

export const newClientButton = (
  <Button variant='default'>
    <PlusIcon aria-hidden='true' />New client
  </Button>
)
export const clientListActions = (
  <>
    <Button variant='ghost' className='max-[600px]:hidden'>
      <DownloadIcon aria-hidden='true' />Export
    </Button>
    {newClientButton}
  </>
)
export const clientDetailActions = (
  <>
    <Button variant='ghost' className='max-[600px]:hidden'>Delete</Button>
    <Button variant='default'>
      <PencilIcon aria-hidden='true' />Edit
    </Button>
  </>
)
export const backToClients = (
  <IconButton label='Back to clients'>
    <ArrowLeftIcon {...icon} />
  </IconButton>
)
export function DashboardBody() {
  const stats = [['Active clients', '1,248'], ['Open loans', '86'], ['Tasks due today', '12'], [
    'Closed this month',
    '$4.2M',
  ]]
  const tasks = [['Call back Ines Calloway', 'Today, 2:30 pm'], ['Send estimate to Remy Fontaine', 'Today'], [
    'Review Marsh pre-approval',
    'Tomorrow',
  ]]
  return (
    <div className={page}>
      <dl className='m-0 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2'>
        {stats.map(([label, value]) => (
          <div key={label} className={`${panel} px-4 py-3`}>
            <dt className='text-[12px] text-muted-foreground'>{label}</dt>
            <dd className='m-0 mt-1 text-[22px] leading-7 font-semibold tabular-nums'>{value}</dd>
          </div>
        ))}
      </dl>
      <div className='grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 max-[900px]:grid-cols-1'>
        <section className={panel}>
          <h2 className='m-0 px-4 py-3 text-[14px] font-semibold'>Recently updated clients</h2>
          <table className={`${table} max-[600px]:hidden`}>
            <tbody>
              {clients.slice(0, 5).map((client) => (
                <tr key={client.name}>
                  <td className='font-medium'>{client.name}</td>
                  <td className='max-[600px]:hidden'>
                    <ChoiceContent item={client.status} compact />
                  </td>
                  <td className='text-right text-muted-foreground'>{client.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <List className='hidden max-[600px]:block [&>li]:border-t [&>li]:border-border [&>li]:px-4'>
            {clients.slice(0, 5).map((client) => (
              <ListItem
                key={client.name}
                title={client.name}
                description={`Updated ${client.updated}`}
                trailing={<ChoiceContent item={client.status} compact />}
              />
            ))}
          </List>
        </section>
        <section className={panel}>
          <h2 className='m-0 px-4 py-3 text-[14px] font-semibold'>Tasks due</h2>
          <ul className='m-0 list-none p-0 text-[13px]'>
            {tasks.map(([task, due]) => (
              <li key={task} className='border-t border-border px-4 py-2.5'>
                <span className='block'>{task}</span>
                <span className='block text-[12px] text-muted-foreground'>{due}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

/** `status` comes from header tabs; without it the list shows its own status filter. */
export function ClientListBody({ status: fixed }: { status?: string }) {
  const [query, setQuery] = useState('')
  const [chosen, setStatus] = useState('all')
  const status = fixed ?? chosen
  const rows = clients.filter((client) =>
    client.name.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || client.status.value === status)
  )
  return (
    <div className={page}>
      <div className='flex items-center gap-2'>
        <div className='w-[240px] max-[600px]:min-w-0 max-[600px]:flex-1'>
          <Input
            type='search'
            aria-label='Search clients'
            placeholder='Search clients…'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {fixed === undefined && (
          <div className='w-[140px]'>
            <Select
              label='Status'
              items={[{ value: 'all', label: 'All statuses' }, ...Object.values(statuses)]}
              value={status}
              onChange={setStatus}
            />
          </div>
        )}
      </div>
      <div className={`${panel} overflow-x-auto`}>
        <table className={`${table} max-[600px]:hidden`}>
          <thead>
            <tr>
              <th>Name</th>
              <th className='max-[800px]:hidden'>Email</th>
              <th>Status</th>
              <th className='max-[600px]:hidden'>Owner</th>
              <th className='max-[600px]:hidden'>Updated</th>
              <th className='w-10' />
            </tr>
          </thead>
          <tbody>
            {rows.map((client) => (
              <tr key={client.name} className='hover:bg-(--ui-hover)'>
                <td className='font-medium'>{client.name}</td>
                <td className='text-muted-foreground max-[800px]:hidden'>{client.email}</td>
                <td>
                  <ChoiceContent item={client.status} compact />
                </td>
                <td className='max-[600px]:hidden'>{client.owner}</td>
                <td className='text-muted-foreground max-[600px]:hidden'>{client.updated}</td>
                <td className='text-muted-foreground'>
                  <ChevronRightIcon {...icon} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <List className='hidden max-[600px]:block [&>li]:border-t [&>li]:border-border [&>li:first-child]:border-t-0 [&>li]:px-4'>
          {rows.map((client) => (
            <ListItem
              key={client.name}
              title={client.name}
              description={`${client.email} · ${client.owner}`}
              trailing={<ChoiceContent item={client.status} compact />}
            />
          ))}
        </List>
        {!rows.length && (
          <p className='m-0 px-4 py-6 text-center text-[13px] text-muted-foreground'>
            No clients found
          </p>
        )}
      </div>
      <div className='flex items-center justify-between text-[12px] text-muted-foreground'>
        <span>{rows.length} of 1,248 clients</span>
        <span className='flex gap-1'>
          <IconButton label='Previous page' disabled>
            <ChevronLeftIcon {...icon} />
          </IconButton>
          <IconButton label='Next page'>
            <ChevronRightIcon {...icon} />
          </IconButton>
        </span>
      </div>
    </div>
  )
}

const details = [
  ['Email', 'okafor@example.com'],
  ['Phone', '(555) 014-2290'],
  ['Address', '41 Alder Way, Portland, OR'],
  ['Owner', 'Nizam'],
  ['Created', 'Mar 14, 2023'],
]
const loans = [['30 year fixed', '7.125%', '$412,000', 'Funded'], ['HELOC', '8.250%', '$60,000', 'Draft']]
const activity = [['Status changed to Active', 'Nizam · Today'], ['Call logged, 12 min', 'Nizam · Oct 30'], [
  'Client created',
  'Tessaly · Mar 14, 2023',
]]
function DetailsPanel() {
  return (
    <section className={panel}>
      <h2 className='m-0 flex items-center justify-between px-4 py-3 text-[14px] font-semibold'>
        Details
        <ChoiceContent item={statuses.active} compact />
      </h2>
      <dl className='m-0 grid grid-cols-[120px_minmax(0,1fr)] border-t border-border text-[13px] [&>dd]:m-0 [&>dd]:border-t [&>dd]:border-border [&>dd]:py-2.5 [&>dd]:pr-4 [&>dt]:border-t [&>dt]:border-border [&>dt]:py-2.5 [&>dt]:pl-4 [&>dt]:text-muted-foreground [&>dt:first-of-type]:border-t-0 [&>dd:first-of-type]:border-t-0'>
        {details.map(([label, value]) => [<dt key={`${label}-t`}>{label}</dt>, <dd key={`${label}-d`}>{value}</dd>])}
      </dl>
    </section>
  )
}
function LoansPanel() {
  return (
    <section className={panel}>
      <h2 className='m-0 px-4 py-3 text-[14px] font-semibold'>Loans</h2>
      <table className={table}>
        <tbody>
          {loans.map(([product, rate, amount, state]) => (
            <tr key={product}>
              <td className='font-medium'>{product}</td>
              <td className='text-muted-foreground tabular-nums'>{rate}</td>
              <td className='text-right tabular-nums'>{amount}</td>
              <td className='text-right text-muted-foreground'>{state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
function ActivityPanel() {
  return (
    <section className={panel}>
      <h2 className='m-0 px-4 py-3 text-[14px] font-semibold'>Activity</h2>
      <ul className='m-0 list-none p-0 text-[13px]'>
        {activity.map(([event, by]) => (
          <li key={event} className='border-t border-border px-4 py-2.5'>
            <span className='block'>{event}</span>
            <span className='block text-[12px] text-muted-foreground'>{by}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
export function ClientDetailBody() {
  return (
    <div className={`${page} grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start max-[900px]:grid-cols-1`}>
      <div className='flex flex-col gap-6 max-[600px]:gap-4'>
        <DetailsPanel />
        <LoansPanel />
      </div>
      <ActivityPanel />
    </div>
  )
}
/** The same record split into tabs inside the content: one panel at a time, the header stays put. */
export function ClientDetailTabsBody() {
  return (
    <TabBar
      label='Client sections'
      items={[
        { value: 'overview', label: 'Overview' },
        { value: 'loans', label: 'Loans', count: loans.length },
        { value: 'activity', label: 'Activity', count: activity.length },
        { value: 'documents', label: 'Documents' },
      ]}
      className='px-4.5 max-[600px]:px-2.5'
    >
      <TabsContent value='overview' className={page}>
        <DetailsPanel />
      </TabsContent>
      <TabsContent value='loans' className={page}>
        <LoansPanel />
      </TabsContent>
      <TabsContent value='activity' className={page}>
        <ActivityPanel />
      </TabsContent>
      <TabsContent value='documents' className={page}>
        <EmptyState title='No documents yet' />
      </TabsContent>
    </TabBar>
  )
}
