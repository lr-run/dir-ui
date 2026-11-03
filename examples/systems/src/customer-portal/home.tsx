// Home: what the customer checks first — the contract, what is still to pay, open tickets and news.
import { RevenueBars } from '@/components/charts/index.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { DateValue, formatDate, formatNumber, NumberValue } from '@/components/ui/value.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import type { KitPageContext, KitRow } from '@/components/systems/kit/types.ts'
import {
  announcementTypes,
  contractStatus,
  customer,
  invoiceStatus,
  plans,
  ticketStatus,
} from '@/components/systems/customer-portal/objects.tsx'

export const yen = (value: number) => formatNumber(value, { format: 'currency', currency: 'JPY' })
const choice = (items: { value: string; label: string; color?: string }[], value: unknown) =>
  items.find((item) => item.value === value) ?? items[0]!
const live = (rows: KitRow[] | undefined) => (rows ?? []).filter((row) => !row.archivedAt)
const value = (row: KitRow, key: string) => row.record.values[key]

/** The contract the portal leads with: the largest one that is still running. */
export function mainContract(rows: KitRow[] | undefined) {
  return live(rows).filter((row) => value(row, 'status') !== 'ended')
    .sort((a, b) => Number(value(b, 'monthlyFee')) - Number(value(a, 'monthlyFee')))[0]
}

export function Home({ store, navigate, openRecord }: KitPageContext) {
  const contracts = live(store.rows.contracts), invoices = live(store.rows.invoices)
  const tickets = live(store.rows.tickets), news = live(store.rows.announcements)
  const contract = mainContract(store.rows.contracts)
  const unpaid = invoices.filter((row) => value(row, 'status') !== 'paid')
    .sort((a, b) => String(value(a, 'dueAt')).localeCompare(String(value(b, 'dueAt'))))
  const open = tickets.filter((row) => value(row, 'status') === 'open' || value(row, 'status') === 'waiting')
  const thisYear = invoices.filter((row) => String(value(row, 'issuedAt')).startsWith('2026'))
  const billed = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(Date.UTC(2026, 5 + index, 1))
    const key = month.toISOString().slice(0, 7)
    return {
      label: month.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      value: invoices.filter((row) => String(value(row, 'issuedAt')).startsWith(key))
        .reduce((sum, row) => sum + Number(value(row, 'amount')), 0),
    }
  })
  const overdue = unpaid.filter((row) => value(row, 'status') === 'overdue')
  return (
    <DashboardBody>
      <p className='m-0 text-[13px] text-muted-foreground'>
        {customer.name} · Customer ID {customer.id} · With us since {formatDate(customer.since)}
      </p>
      <StatGrid
        stats={[
          [
            'Your plan',
            contract ? choice(plans, value(contract, 'plan')).label : '—',
            contract ? `${value(contract, 'seats')} seats` : 'No active contract',
          ],
          [
            'To pay',
            yen(unpaid.reduce((sum, row) => sum + Number(value(row, 'amount')), 0)),
            unpaid.length
              ? `${unpaid.length} invoices · next due ${formatDate(String(value(unpaid[0]!, 'dueAt')))}`
              : 'Nothing to pay',
          ],
          [
            'Open tickets',
            String(open.length),
            `${open.filter((row) => value(row, 'status') === 'waiting').length} waiting on you`,
          ],
          ['Billed in 2026', yen(thisYear.reduce((sum, row) => sum + Number(value(row, 'amount')), 0)), 'incl. tax'],
        ]}
      />
      <DashboardColumns>
        <DashboardPanel
          title='Your contract'
          description={contracts.length > 1 ? `${contracts.length} contracts in total` : undefined}
          action={contract && <Button size='sm' onClick={() => navigate('/contract')}>View contract</Button>}
        >
          {contract
            ? (
              <dl className='m-0 grid grid-cols-2 gap-x-4 gap-y-3 px-5 pb-5 text-[13px] [&_dt]:text-[12px] [&_dt]:text-muted-foreground [&_dd]:m-0 [&_dd]:mt-1'>
                <div className='col-span-full'>
                  <dt>Service</dt>
                  <dd className='font-medium'>{contract.name}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <ChoiceContent item={choice(contractStatus, value(contract, 'status'))} />
                  </dd>
                </div>
                <div>
                  <dt>Monthly fee</dt>
                  <dd>
                    <NumberValue value={Number(value(contract, 'monthlyFee'))} format='currency' currency='JPY' />
                  </dd>
                </div>
                <div>
                  <dt>Renews on</dt>
                  <dd>
                    <DateValue value={String(value(contract, 'renewsAt'))} />
                  </dd>
                </div>
                <div>
                  <dt>Account manager</dt>
                  <dd>{store.memberName(value(contract, 'manager'))}</dd>
                </div>
              </dl>
            )
            : (
              <EmptyState title='You have no active contract'>
                <Button onClick={() => navigate('/contact')}>Ask about plans</Button>
              </EmptyState>
            )}
        </DashboardPanel>
        <DashboardPanel
          title='Invoices to pay'
          description={overdue.length
            ? `${overdue.length} overdue · please pay as soon as possible`
            : 'Oldest due date first'}
        >
          <DashboardList
            empty='You have no unpaid invoices.'
            rows={unpaid.slice(0, 5).map((row) => ({
              id: row.id,
              title: `${row.name} · ${yen(Number(value(row, 'amount')))}`,
              detail: `${value(row, 'period')} · due ${formatDate(String(value(row, 'dueAt')))}`,
              trailing: <ChoiceContent item={choice(invoiceStatus, value(row, 'status'))} compact />,
              onOpen: () => openRecord('invoices', row.id),
            }))}
          />
        </DashboardPanel>
      </DashboardColumns>
      <DashboardColumns>
        <DashboardPanel
          title='Your open tickets'
          description='Newest first'
          action={tickets.length > 0 && <Button size='sm' onClick={() => navigate('/tickets')}>View tickets</Button>}
        >
          <DashboardList
            empty='You have no open tickets.'
            rows={open.slice(0, 5).map((row) => ({
              id: row.id,
              title: row.name,
              detail: `Opened ${formatDate(row.createdAt)} · ${
                store.memberName(value(row, 'assignee')) || 'Not assigned yet'
              }`,
              trailing: <ChoiceContent item={choice(ticketStatus, value(row, 'status'))} compact />,
              onOpen: () => openRecord('tickets', row.id),
            }))}
          />
        </DashboardPanel>
        <DashboardPanel title='Announcements' description='From the Kumo Cloud team'>
          <DashboardList
            empty='There are no announcements yet.'
            rows={news.slice(0, 5).map((row) => ({
              id: row.id,
              title: row.name,
              detail: `${formatDate(String(value(row, 'publishedAt')))} · ${value(row, 'body')}`,
              trailing: <ChoiceContent item={choice(announcementTypes, value(row, 'type'))} compact />,
              onOpen: () => openRecord('announcements', row.id),
            }))}
          />
        </DashboardPanel>
      </DashboardColumns>
      <DashboardPanel title='Billed per month' description='June to November 2026, including tax'>
        <div className='px-3 pb-4'>
          <RevenueBars values={invoices.length ? billed : []} />
        </div>
      </DashboardPanel>
    </DashboardBody>
  )
}
