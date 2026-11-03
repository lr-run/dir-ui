// Contract management (契約管理): contracts, counterparties and signed documents, with a renewals dashboard of what
// ends soonest.
import {
  Building2Icon,
  CalendarClockIcon,
  FileSignatureIcon,
  FileTextIcon,
  PlusIcon,
  RefreshCcwIcon,
  RefreshCwIcon,
  ScrollTextIcon,
} from 'lucide-react'
import { useState } from 'react'
import { HorizontalBars } from '@/components/charts/index.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { ToolbarButton } from '@/components/ui/toolbar-button.tsx'
import { formatDate, formatNumber } from '@/components/ui/value.tsx'
import { KitApp } from '@/components/systems/kit/app.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import { CreateForm } from '@/components/systems/kit/list.tsx'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { FilterCondition, RecordFilter } from '@/lib/query.ts'
import type {
  KitConfig,
  KitDetailContext,
  KitObject,
  KitPageContext,
  KitRecord,
  KitRow,
} from '@/components/systems/kit/types.ts'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const users = [
  { value: 'u1', label: 'Haruka Tanaka' },
  { value: 'u2', label: 'Ren Suzuki' },
  { value: 'u3', label: 'Yuna Takahashi' },
  { value: 'u4', label: 'Sho Watanabe' },
]
const contractStatus = [
  { value: 'draft', label: 'Draft', color: 'var(--ui-muted)' },
  { value: 'review', label: 'In review', color: 'var(--ui-blue)' },
  { value: 'active', label: 'Active', color: 'var(--ui-green)' },
  { value: 'expiring', label: 'Expiring', color: 'var(--ui-amber)' },
  { value: 'terminated', label: 'Terminated', color: 'var(--ui-red)' },
]
const contractTypes = ['Services', 'Subscription', 'License', 'Maintenance', 'Lease', 'Supply'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))
const industries = ['Logistics', 'Software', 'Real estate', 'Manufacturing', 'Facilities', 'Consulting'].map((
  label,
) => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }))
const documentKinds = [
  { value: 'original', label: 'Signed original' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'termination', label: 'Termination notice' },
  { value: 'draft', label: 'Draft for review' },
]

const offset = (date: string, days: number) => new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10)
const and = (conditions: FilterCondition[]): RecordFilter => ({ conjunction: 'and', conditions })

const contracts: KitObject = {
  id: 'contracts',
  title: 'Contracts',
  singular: 'Contract',
  nameLabel: 'Contract',
  icon: <FileSignatureIcon {...icon} />,
  fields: [
    {
      key: 'counterparty',
      label: 'Counterparty',
      type: 'reference',
      reference: 'counterparties',
      width: 190,
      required: true,
    },
    { key: 'number', label: 'Contract no.', type: 'text', width: 120 },
    {
      key: 'status',
      label: 'Status',
      type: 'choice',
      options: contractStatus,
      width: 130,
      confirm: {
        terminated: {
          title: 'Terminate this contract?',
          description:
            'It stops counting toward active value and renewals, and the counterparty must be sent a termination notice. You can set the status back while the record is open.',
          action: 'Terminate contract',
        },
      },
    },
    { key: 'type', label: 'Type', type: 'choice', options: contractTypes, width: 130 },
    { key: 'value', label: 'Value', type: 'money', width: 130 },
    { key: 'startDate', label: 'Start', type: 'date', width: 130 },
    { key: 'endDate', label: 'End', type: 'date', width: 130, required: true },
    { key: 'renewalDate', label: 'Notice by', type: 'date', width: 130 },
    { key: 'autoRenew', label: 'Auto-renew', type: 'boolean', width: 110 },
    { key: 'owner', label: 'Owner', type: 'member', options: users, width: 150 },
    { key: 'terms', label: 'Key terms', type: 'longtext', hideInList: true },
  ],
  views: [
    { id: 'all', name: 'All contracts', sorts: [{ field: 'endDate', direction: 'asc' }] },
    {
      id: 'active',
      name: 'Active',
      filter: and([{ id: 'status', field: 'status', operator: 'in', value: ['Active', 'Expiring'] }]),
      sorts: [{ field: 'endDate', direction: 'asc' }],
    },
    {
      id: 'expiring',
      name: 'Expiring soon',
      filter: and([
        { id: 'status', field: 'status', operator: 'in', value: ['Active', 'Expiring'] },
        { id: 'end', field: 'endDate', operator: 'between', value: [day(0), day(60)] },
      ]),
      sorts: [{ field: 'endDate', direction: 'asc' }],
    },
    {
      id: 'review',
      name: 'In review',
      filter: and([{ id: 'status', field: 'status', operator: 'in', value: ['Draft', 'In review'] }]),
      sorts: [{ field: 'updatedAt', direction: 'asc' }],
    },
  ],
  defaults: (store) => ({
    number: `CT-${String(2600 + (store.rows.contracts?.length ?? 0)).padStart(5, '0')}`,
    status: 'draft',
    startDate: day(0),
    endDate: offset(day(0), 364),
    owner: 'u1',
  }),
  detail: {
    actions: (context) => <RenewContract {...context} />,
    tabs: [{ id: 'documents', label: 'Documents', render: (context) => <ContractDocuments {...context} /> }],
    hideRelated: ['documents'],
  },
}
const counterparties: KitObject = {
  id: 'counterparties',
  title: 'Counterparties',
  singular: 'Counterparty',
  nameLabel: 'Company',
  icon: <Building2Icon {...icon} />,
  fields: [
    { key: 'industry', label: 'Industry', type: 'choice', options: industries, width: 140 },
    { key: 'contact', label: 'Contact', type: 'text', width: 150 },
    { key: 'email', label: 'Email', type: 'email', width: 230 },
    { key: 'phone', label: 'Phone', type: 'tel', width: 140 },
    { key: 'owner', label: 'Relationship owner', type: 'member', options: users, width: 160 },
  ],
}
const documents: KitObject = {
  id: 'documents',
  title: 'Documents',
  singular: 'Document',
  nameLabel: 'Document',
  icon: <FileTextIcon {...icon} />,
  fields: [
    { key: 'contract', label: 'Contract', type: 'reference', reference: 'contracts', width: 220, required: true },
    { key: 'kind', label: 'Kind', type: 'choice', options: documentKinds, width: 160 },
    { key: 'signedAt', label: 'Signed', type: 'date', width: 130 },
    { key: 'signatory', label: 'Signed by', type: 'text', width: 150 },
    { key: 'owner', label: 'Filed by', type: 'member', options: users, width: 150 },
  ],
}

const prefixes = [
  'Hokuto',
  'Seiryu',
  'Minato',
  'Asahi',
  'Kawa',
  'Tokai',
  'Sakura',
  'Fuji',
  'Midori',
  'Hikari',
  'Kita',
  'Nishi',
  'Aoba',
  'Yamato',
  'Shinsei',
  'Kaede',
]
const suffixes = [
  ['Logistics', 'logistics'],
  ['Systems', 'software'],
  ['Realty', 'real-estate'],
  ['Industries', 'manufacturing'],
  ['Facilities', 'facilities'],
  ['Consulting', 'consulting'],
  ['Networks', 'software'],
  ['Leasing', 'real-estate'],
  ['Electric', 'manufacturing'],
  ['Trading', 'logistics'],
  ['Partners', 'consulting'],
  ['Software', 'software'],
] as const
const subjects: Record<string, string[]> = {
  services: ['Systems integration', 'Customer support outsourcing', 'Payroll processing', 'Recruitment services'],
  subscription: ['Cloud hosting', 'CRM seats', 'Design tool seats', 'Security monitoring'],
  license: ['ERP license', 'Font license', 'Map data license', 'Patent license'],
  maintenance: ['Server maintenance', 'Elevator maintenance', 'Network maintenance', 'Printer fleet maintenance'],
  lease: ['Head office lease', 'Osaka branch lease', 'Warehouse lease', 'Vehicle fleet lease'],
  supply: ['Packaging supply', 'Office supply', 'Component supply', 'Catering supply'],
}
const people = [
  'Haruto Abe',
  'Yui Ono',
  'Sota Endo',
  'Rin Kudo',
  'Kaito Mori',
  'Mei Inoue',
  'Riku Hayashi',
  'Aoi Kimura',
]

function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 11)
  // Counterparties are reference data: enough to pick from even when there are no contracts yet.
  const companyCount = Math.min(prefixes.length * suffixes.length, Math.max(8, Math.round(count / 4)))
  const companyRecords = Array.from({ length: companyCount }, (_, index) => {
    const prefix = prefixes[index % prefixes.length]!
    const [suffix, industry] = suffixes[(Math.floor(index / prefixes.length) + (index % prefixes.length) * 5) % 12]!
    const name = `${prefix} ${suffix}`
    return record(`cp${index + 1}`, name, {
      industry,
      contact: r.pick(people),
      email: `legal@${name.toLowerCase().replace(/\s+/g, '-')}.example`,
      phone: `0${r.pick(['3', '6', '52', '92'])}-${r.int(1000, 9999)}-${r.int(1000, 9999)}`,
      owner: r.pick(users).value,
    }, r.int(200, 900))
  })
  const contractRecords = Array.from({ length: count }, (_, index) => {
    const type = r.pick(contractTypes).value
    const term = r.pick([365, 365, 730, 1095])
    const roll = r.next()
    // Every fifth contract ends within 60 days and every eighth is in review, so the renewals dashboard always has
    // something to act on.
    const status = index % 5 === 1
      ? 'expiring'
      : index % 8 === 3
      ? 'review'
      : roll < 0.08
      ? 'draft'
      : roll < 0.14
      ? 'review'
      : roll < 0.22
      ? 'terminated'
      : 'active'
    const end = status === 'expiring'
      ? day(r.int(3, 60))
      : status === 'terminated'
      ? day(-r.int(10, 300))
      : status === 'active'
      ? day(r.int(61, 900))
      : day(r.int(14, 75) + term)
    const notice = r.pick([30, 60, 90])
    return record(`ct${index + 1}`, r.pick(subjects[type]!), {
      counterparty: r.pick(companyRecords).id,
      number: `CT-${String(2600 + index).padStart(5, '0')}`,
      status,
      type,
      value: r.int(12, 960) * 10000,
      startDate: offset(end, -term),
      endDate: end,
      renewalDate: offset(end, -notice),
      autoRenew: status !== 'terminated' && r.next() < 0.45,
      owner: r.pick(users).value,
      terms: `${notice}-day notice period. Payment net 30. Governed by the laws of Japan.`,
    }, r.int(5, 400))
  })
  const documentRecords = contractRecords.flatMap((contract) => {
    const values = contract.values
    const number = String(values.number)
    const signer = r.pick(people)
    const filedBy = String(values.owner)
    if (values.status === 'draft' || values.status === 'review') {
      return [record(`${contract.id}-d`, `${number} draft`, {
        contract: contract.id,
        kind: 'draft',
        signedAt: '',
        signatory: '',
        owner: filedBy,
      }, r.int(1, 20))]
    }
    const docs = [record(`${contract.id}-o`, `${number} signed original`, {
      contract: contract.id,
      kind: 'original',
      signedAt: offset(String(values.startDate), -r.int(3, 20)),
      signatory: signer,
      owner: filedBy,
    }, r.int(30, 600))]
    if (r.next() < 0.3) {
      docs.push(record(`${contract.id}-a`, `${number} amendment 1`, {
        contract: contract.id,
        kind: 'amendment',
        signedAt: offset(String(values.startDate), r.int(30, 200)),
        signatory: signer,
        owner: filedBy,
      }, r.int(10, 300)))
    }
    if (values.status === 'terminated') {
      docs.push(record(`${contract.id}-t`, `${number} termination notice`, {
        contract: contract.id,
        kind: 'termination',
        signedAt: offset(String(values.endDate), -r.int(30, 90)),
        signatory: signer,
        owner: filedBy,
      }, r.int(10, 300)))
    }
    return docs
  })
  return { contracts: contractRecords, counterparties: companyRecords, documents: documentRecords }
}

const today = day(0)
const daysUntil = (date: unknown) => Math.round((Date.parse(String(date)) - Date.parse(today)) / 86400000)
const yen = (value: number) => formatNumber(value, { format: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const isRunning = (row: KitRow) => row.record.values.status === 'active' || row.record.values.status === 'expiring'
const statusOf = (row: KitRow) => contractStatus.find((option) => option.value === row.record.values.status)!

function Renewals(context: KitPageContext) {
  const { store, openRecord } = context
  const [autoOnly, setAutoOnly] = useState(false)
  const live = store.rows.contracts!.filter((row) => !row.archivedAt)
  if (!live.length) {
    return (
      <div className='flex min-h-0 flex-1 items-center justify-center'>
        <EmptyState title='No contracts yet. Add the first one to track its renewal.'>
          <NewContract {...context} variant='outline' />
        </EmptyState>
      </div>
    )
  }
  const value = (row: KitRow) => Number(row.record.values.value) || 0
  const running = live.filter(isRunning)
  const upcoming = running.filter((row) => daysUntil(row.record.values.endDate) >= 0)
    .sort((a, b) => String(a.record.values.endDate).localeCompare(String(b.record.values.endDate)))
  const within60 = upcoming.filter((row) => daysUntil(row.record.values.endDate) <= 60)
  const inReview = live.filter((row) => row.record.values.status === 'review')
  const autoRenewing = running.filter((row) => row.record.values.autoRenew)
  const shown = (autoOnly ? upcoming.filter((row) => row.record.values.autoRenew) : upcoming).slice(0, 8)
  const byType = contractTypes.map((type) => ({
    label: type.label,
    value: running.filter((row) => row.record.values.type === type.value).reduce((sum, row) => sum + value(row), 0),
  })).filter((point) => point.value > 0).sort((a, b) => b.value - a.value)
  return (
    <DashboardBody>
      <StatGrid
        stats={[
          ['Active value', yen(running.reduce((sum, row) => sum + value(row), 0)), `${running.length} contracts`],
          ['Expiring in 60 days', String(within60.length), yen(within60.reduce((sum, row) => sum + value(row), 0))],
          ['In review', String(inReview.length), 'waiting for signature'],
          ['Auto-renewing', String(autoRenewing.length), `of ${running.length} active`],
        ]}
      />
      <DashboardColumns>
        <DashboardPanel
          title='Ending soonest'
          description='Active contracts by end date'
          action={
            <ToolbarButton
              icon={<RefreshCwIcon size={14} strokeWidth={1.5} aria-hidden='true' />}
              active={autoOnly}
              aria-pressed={autoOnly}
              onClick={() => setAutoOnly(!autoOnly)}
            >
              Auto-renew only
            </ToolbarButton>
          }
        >
          <DashboardList
            empty={autoOnly ? 'No auto-renewing contract ends soon.' : 'No active contract has an upcoming end date.'}
            rows={shown.map((row) => {
              const days = daysUntil(row.record.values.endDate)
              return {
                id: row.id,
                title: row.name,
                detail: `${row.counterparty} · ends ${formatDate(String(row.record.values.endDate))} · ${
                  yen(value(row))
                }${row.record.values.autoRenew ? ' · auto-renews' : ''}`,
                trailing: (
                  <span className='flex shrink-0 items-center gap-3'>
                    <Badge>{days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'}`}</Badge>
                    <span className='max-[600px]:hidden'>
                      <ChoiceContent item={statusOf(row)} compact />
                    </span>
                  </span>
                ),
                onOpen: () => openRecord('contracts', row.id),
              }
            })}
          />
        </DashboardPanel>
        <DashboardPanel title='Active value by type' description='Contract value of active and expiring contracts'>
          <div className='px-3 pb-4'>
            <HorizontalBars values={byType} labelWidth={96} />
          </div>
        </DashboardPanel>
      </DashboardColumns>
      <DashboardPanel title='In review' description='Drafts with the counterparty or legal, oldest first'>
        <DashboardList
          empty='Nothing is waiting for review.'
          rows={inReview.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)).slice(0, 6).map((row) => ({
            id: row.id,
            title: row.name,
            detail: `${row.counterparty} · ${row.type} · ${yen(value(row))} · ${row.owner}`,
            trailing: <ChoiceContent item={statusOf(row)} compact />,
            onOpen: () => openRecord('contracts', row.id),
          }))}
        />
      </DashboardPanel>
    </DashboardBody>
  )
}
function NewContract({ variant = 'default', ...context }: KitPageContext & { variant?: 'default' | 'outline' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <PlusIcon aria-hidden='true' />New contract
      </Button>
      {open && (
        <CreateForm
          object={contracts}
          store={context.store}
          users={users}
          onClose={() => setOpen(false)}
          onCreated={(id) => context.openRecord('contracts', id)}
        />
      )}
    </>
  )
}

const termOf = (values: KitRecord['values']) =>
  Math.max(30, Math.round((Date.parse(String(values.endDate)) - Date.parse(String(values.startDate))) / 86400000))

/** Renew extends the end and notice dates by one term, sets the contract Active and files a renewal document. */
function RenewContract({ store, object, record }: KitDetailContext) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const values = record.values
  if (record.archivedAt || (values.status !== 'active' && values.status !== 'expiring')) return null
  const term = termOf(values)
  const end = offset(String(values.endDate), term)
  const notice = values.renewalDate
    ? Math.round(
      (Date.parse(String(values.endDate)) - Date.parse(String(values.renewalDate))) / 86400000,
    )
    : 30
  const renew = async () => {
    setSaving(true)
    // The in-memory store answers at once; an API call would be awaited here the same way.
    await Promise.resolve(store.update(object.id, record.id, {
      values: { status: 'active', endDate: end, renewalDate: offset(end, -notice) },
    }))
    store.create('documents', `${values.number || record.name} renewal`, {
      contract: record.id,
      kind: 'renewal',
      signedAt: day(0),
      signatory: '',
      owner: 'u1',
    })
    setSaving(false)
    setOpen(false)
  }
  return (
    <>
      <Button variant='default' onClick={() => setOpen(true)}>
        <RefreshCcwIcon aria-hidden='true' />Renew
      </Button>
      <Dialog
        open={open}
        title={`Renew ${record.name}?`}
        onOpenChange={(next) => !saving && setOpen(next)}
        footer={
          <div className='flex justify-end gap-2'>
            <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant='default' onClick={renew} disabled={saving} className='min-w-[140px]'>
              {saving ? 'Renewing…' : 'Renew contract'}
            </Button>
          </div>
        }
      >
        <p className='m-0 p-5 text-[13px] leading-6 text-muted-foreground'>
          The contract with {store.recordName('counterparties', String(values.counterparty))} is extended by {term}{' '}
          days, from {formatDate(String(values.endDate))} to{' '}
          {formatDate(end)}. Its status becomes Active and a renewal document is filed.
        </p>
      </Dialog>
    </>
  )
}

/** The contract's documents as a list, with one way to add another. */
function ContractDocuments({ store, record, openRecord }: KitDetailContext) {
  const [adding, setAdding] = useState(false)
  const rows = store.rows.documents!.filter((row) => row.record.values.contract === record.id && !row.archivedAt)
    .sort((a, b) => String(b.record.values.signedAt).localeCompare(String(a.record.values.signedAt)))
  const add = (
    <Button onClick={() => setAdding(true)} disabled={!!record.archivedAt}>
      <PlusIcon aria-hidden='true' />Add document
    </Button>
  )
  return (
    <div className='flex flex-col gap-3'>
      {rows.length
        ? (
          <>
            <div className='flex justify-end'>{add}</div>
            <List className='rounded-lg border border-border'>
              {rows.map((row) => (
                <ListItem
                  key={row.id}
                  className='px-3'
                  leading={<FileTextIcon {...icon} />}
                  onOpen={() => openRecord('documents', row.id)}
                  title={row.name}
                  description={`${row.kind} · ${
                    row.record.values.signedAt ? `signed ${formatDate(String(row.record.values.signedAt))}` : 'unsigned'
                  }${row.signatory ? ` by ${row.signatory}` : ''}`}
                  trailing={<span className='text-[12px] text-muted-foreground'>{String(row.owner)}</span>}
                />
              ))}
            </List>
          </>
        )
        : <EmptyState title='No documents are filed for this contract.'>{add}</EmptyState>}
      {adding && (
        <CreateForm
          object={{
            ...documents,
            defaults: () => ({
              contract: record.id,
              kind: 'amendment',
              signedAt: day(0),
              owner: 'u1',
            }),
          }}
          store={store}
          users={users}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}

export const contract: KitConfig = {
  id: 'contract',
  brand: { name: 'Contracts', mark: <ScrollTextIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [contracts, documents, counterparties],
  pages: [{
    id: 'renewals',
    label: 'Renewals',
    icon: <CalendarClockIcon {...icon} />,
    actions: (context) => <NewContract {...context} />,
    render: (context) => <Renewals {...context} />,
  }],
  navigation: [{ items: ['renewals', 'contracts', 'documents'] }, { label: 'Partners', items: ['counterparties'] }],
  home: '/renewals',
  users,
  me: 'u1',
  seed,
}
export function ContractApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={contract} layout='app' count={count} basePath={basePath} />
}
