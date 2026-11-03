// Contract: the main contract as read-only values, its documents to download, and every other contract.
import { DownloadIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { DateValue, formatDate, NumberValue } from '@/components/ui/value.tsx'
import { DashboardBody, DashboardPanel } from '@/components/systems/kit/dashboard.tsx'
import type { KitPageContext, KitRecord } from '@/components/systems/kit/types.ts'
import { mainContract, yen } from '@/components/systems/customer-portal/home.tsx'
import { contractStatus, customer, plans } from '@/components/systems/customer-portal/objects.tsx'

const option = (items: { value: string; label: string; color?: string }[], value: unknown) =>
  items.find((item) => item.value === value) ?? items[0]!

/** Documents that come with a contract; each downloads as a plain-text copy in this example. */
function documents(contract: KitRecord) {
  const { number, startAt } = contract.values as { number: string; startAt: string }
  return [
    { id: 'agreement', title: 'Service agreement', detail: `Signed ${formatDate(startAt)}` },
    { id: 'order', title: `Order form ${number}`, detail: `${contract.name} · ${formatDate(startAt)}` },
    { id: 'sla', title: 'Service level agreement', detail: '99.9% monthly uptime, 1 business day first reply' },
  ]
}
/** Saves lines of text as a file; stands in for a stored PDF in this example. */
export function saveText(fileName: string, lines: string[]) {
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }))
  Object.assign(document.createElement('a'), { href: url, download: fileName }).click()
  URL.revokeObjectURL(url)
}
function download(contract: KitRecord, title: string) {
  const values = contract.values
  saveText(`${values.number}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`, [
    title,
    '',
    `Customer: ${customer.name} (${customer.id})`,
    `Contract: ${contract.name} · ${values.number}`,
    `Term: ${formatDate(String(values.startAt))} to ${formatDate(String(values.renewsAt))}`,
    `Monthly fee: ${yen(Number(values.monthlyFee))} excluding tax`,
  ])
}
/** The contract's documents, each with a Download button; on the Contract page and the contract record. */
export function DocumentList({ contract, className = '' }: { contract: KitRecord; className?: string }) {
  return (
    <List className={className}>
      {documents(contract).map((item) => (
        <ListItem
          key={item.id}
          title={item.title}
          description={item.detail}
          actions={
            <Button size='sm' onClick={() => download(contract, item.title)}>
              <DownloadIcon aria-hidden='true' />Download
            </Button>
          }
        />
      ))}
    </List>
  )
}

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 border-t border-border px-5 py-3'>
      <dt className='text-[12px] text-muted-foreground'>{label}</dt>
      <dd className='m-0 mt-1 truncate text-[13px]'>{children}</dd>
    </div>
  )
}

export function ContractPage({ store, navigate, openRecord }: KitPageContext) {
  const contract = mainContract(store.rows.contracts)
  if (!contract) {
    return (
      <DashboardBody>
        <EmptyState title='You have no active contract'>
          <Button onClick={() => navigate('/contact')}>Ask about plans</Button>
        </EmptyState>
      </DashboardBody>
    )
  }
  const values = contract.record.values
  const others = store.rows.contracts!.filter((row) => !row.archivedAt && row.id !== contract.id)
  return (
    <DashboardBody>
      <DashboardPanel
        title={contract.name}
        description={`Contract ${values.number} · to change your plan or seats, contact support`}
        action={<ChoiceContent item={option(contractStatus, values.status)} />}
      >
        <dl className='m-0 grid grid-cols-3 @max-[740px]:grid-cols-2 @max-[440px]:grid-cols-1'>
          <Property label='Plan'>{option(plans, values.plan).label}</Property>
          <Property label='Monthly fee (excl. tax)'>
            <NumberValue value={Number(values.monthlyFee)} format='currency' currency='JPY' />
          </Property>
          <Property label='Seats'>{String(values.seats)}</Property>
          <Property label='Started'>
            <DateValue value={String(values.startAt)} />
          </Property>
          <Property label='Renews on'>
            <DateValue value={String(values.renewsAt)} />
          </Property>
          <Property label='Renewal'>{values.autoRenew ? 'Automatic' : 'Needs your confirmation'}</Property>
          <Property label='Payment method'>{String(contract.payment)}</Property>
          <Property label='Billing email'>{String(values.billingEmail)}</Property>
          <Property label='Account manager'>{store.memberName(values.manager)}</Property>
        </dl>
      </DashboardPanel>
      <DashboardPanel title='Documents' description='Signed copies of your agreement'>
        <DocumentList contract={contract.record} className='border-t border-border px-3' />
      </DashboardPanel>
      {others.length > 0 && (
        <DashboardPanel title='Your other contracts' description={`${others.length} more under ${customer.name}`}>
          <List className='border-t border-border'>
            {others.map((row) => (
              <ListItem
                key={row.id}
                className='px-5'
                onOpen={() => openRecord('contracts', row.id)}
                title={row.name}
                description={`${String(row.plan)} · ${yen(Number(row.record.values.monthlyFee))} a month · ${
                  row.record.values.status === 'ended' ? 'ended' : 'renews'
                } ${formatDate(String(row.record.values.renewsAt))}`}
                trailing={<ChoiceContent item={option(contractStatus, row.record.values.status)} compact />}
              />
            ))}
          </List>
        </DashboardPanel>
      )}
    </DashboardBody>
  )
}
