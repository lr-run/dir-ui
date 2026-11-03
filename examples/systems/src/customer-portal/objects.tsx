// Customer portal data: what one customer company sees of its contracts, invoices, support tickets and the
// provider's announcements. Billing is read-only; customers raise and follow up tickets.
import { FileTextIcon, LifeBuoyIcon, MegaphoneIcon, ReceiptIcon } from 'lucide-react'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitObject, KitRecord } from '@/components/systems/kit/types.ts'

export const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
/** The customer company signed in to the portal. */
export const customer = { name: 'Sakura Logistics Co., Ltd.', id: 'C-10482', since: '2023-04-01' }
export const users = [
  { value: 'c1', label: 'Haruka Tanaka', description: 'Sakura Logistics' },
  { value: 'c2', label: 'Takumi Yamada', description: 'Sakura Logistics' },
  { value: 'c3', label: 'Nana Kobayashi', description: 'Sakura Logistics' },
  { value: 's1', label: 'Ren Suzuki', description: 'Kumo Cloud support' },
  { value: 's2', label: 'Mio Watanabe', description: 'Kumo Cloud support' },
  { value: 's3', label: 'Shota Nakamura', description: 'Account manager' },
]
const staff = users.filter((user) => user.value.startsWith('c'))
const support = users.filter((user) => user.value.startsWith('s') && user.value !== 's3')

export const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'business', label: 'Business' },
  { value: 'enterprise', label: 'Enterprise' },
]
export const contractStatus = [
  { value: 'active', label: 'Active', color: 'var(--ui-green)' },
  { value: 'renewal', label: 'Renewal due', color: 'var(--ui-amber)' },
  { value: 'ended', label: 'Ended', color: 'var(--ui-muted)' },
]
const paymentMethods = [
  { value: 'transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Corporate card' },
  { value: 'debit', label: 'Direct debit' },
]
export const invoiceStatus = [
  { value: 'unpaid', label: 'Unpaid', color: 'var(--ui-blue)' },
  { value: 'overdue', label: 'Overdue', color: 'var(--ui-red)' },
  { value: 'paid', label: 'Paid', color: 'var(--ui-green)' },
]
export const ticketStatus = [
  { value: 'open', label: 'Open', color: 'var(--ui-blue)' },
  { value: 'waiting', label: 'Waiting on you', color: 'var(--ui-amber)' },
  { value: 'resolved', label: 'Resolved', color: 'var(--ui-green)' },
  { value: 'closed', label: 'Closed', color: 'var(--ui-muted)' },
]
export const ticketCategories = [
  { value: 'technical', label: 'Technical issue' },
  { value: 'billing', label: 'Billing' },
  { value: 'account', label: 'Account and seats' },
  { value: 'request', label: 'Feature request' },
]
export const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]
export const announcementTypes = [
  { value: 'maintenance', label: 'Maintenance', color: 'var(--ui-amber)' },
  { value: 'release', label: 'New feature', color: 'var(--ui-blue)' },
  { value: 'incident', label: 'Incident', color: 'var(--ui-red)' },
  { value: 'notice', label: 'Notice', color: 'var(--ui-muted)' },
]

export const contracts: KitObject = {
  id: 'contracts',
  title: 'Contracts',
  singular: 'Contract',
  nameLabel: 'Contract',
  icon: <FileTextIcon {...icon} />,
  readOnly: true,
  fields: [
    { key: 'number', label: 'Contract no.', type: 'text', width: 130, readOnly: true },
    { key: 'status', label: 'Status', type: 'choice', options: contractStatus, width: 140, readOnly: true },
    { key: 'plan', label: 'Plan', type: 'choice', options: plans, width: 120, readOnly: true },
    { key: 'monthlyFee', label: 'Monthly fee', type: 'money', width: 130, readOnly: true },
    { key: 'seats', label: 'Seats', type: 'number', width: 90, readOnly: true },
    { key: 'startAt', label: 'Started', type: 'date', width: 130, readOnly: true },
    { key: 'renewsAt', label: 'Renews on', type: 'date', width: 130, readOnly: true },
    { key: 'autoRenew', label: 'Renews automatically', type: 'boolean', hideInList: true, readOnly: true },
    { key: 'payment', label: 'Payment method', type: 'choice', options: paymentMethods, width: 150, readOnly: true },
    { key: 'manager', label: 'Account manager', type: 'member', options: users, width: 160, readOnly: true },
    { key: 'billingEmail', label: 'Billing email', type: 'email', hideInList: true, readOnly: true },
  ],
}
export const invoices: KitObject = {
  id: 'invoices',
  title: 'Invoices',
  singular: 'Invoice',
  nameLabel: 'Invoice',
  icon: <ReceiptIcon {...icon} />,
  readOnly: true,
  views: [
    {
      id: 'to-pay',
      name: 'To pay',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'status', field: 'status', operator: 'in', value: ['Unpaid', 'Overdue'] }],
      },
      sorts: [{ field: 'dueAt', direction: 'asc' }],
    },
    {
      id: 'paid',
      name: 'Paid',
      filter: { conjunction: 'and', conditions: [{ id: 'status', field: 'status', operator: 'in', value: ['Paid'] }] },
      sorts: [{ field: 'issuedAt', direction: 'desc' }],
    },
    { id: 'all', name: 'All invoices', sorts: [{ field: 'issuedAt', direction: 'desc' }] },
  ],
  fields: [
    { key: 'status', label: 'Status', type: 'choice', options: invoiceStatus, width: 120, readOnly: true },
    { key: 'period', label: 'Billing period', type: 'text', width: 140, readOnly: true },
    { key: 'amount', label: 'Amount (incl. tax)', type: 'money', width: 150, readOnly: true },
    { key: 'tax', label: 'Consumption tax', type: 'money', hideInList: true, readOnly: true },
    { key: 'issuedAt', label: 'Issued', type: 'date', width: 120, readOnly: true },
    { key: 'dueAt', label: 'Due', type: 'date', width: 120, readOnly: true },
    { key: 'paidAt', label: 'Paid', type: 'date', width: 120, readOnly: true },
    { key: 'contract', label: 'Contract', type: 'reference', reference: 'contracts', width: 220, readOnly: true },
  ],
}
export const tickets: KitObject = {
  id: 'tickets',
  title: 'Support',
  singular: 'Ticket',
  nameLabel: 'Subject',
  icon: <LifeBuoyIcon {...icon} />,
  createPath: '/contact',
  views: [
    {
      id: 'open',
      name: 'Open',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'status', field: 'status', operator: 'in', value: ['Open', 'Waiting on you'] }],
      },
    },
    {
      id: 'waiting',
      name: 'Waiting on you',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'status', field: 'status', operator: 'in', value: ['Waiting on you'] }],
      },
    },
    {
      id: 'closed',
      name: 'Closed',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'status', field: 'status', operator: 'in', value: ['Resolved', 'Closed'] }],
      },
    },
    { id: 'all', name: 'All tickets' },
  ],
  fields: [
    { key: 'status', label: 'Status', type: 'choice', options: ticketStatus, width: 140 },
    { key: 'category', label: 'Category', type: 'choice', options: ticketCategories, width: 160 },
    { key: 'priority', label: 'Priority', type: 'choice', options: priorities, width: 110 },
    { key: 'requester', label: 'Requested by', type: 'member', options: users, width: 150 },
    { key: 'assignee', label: 'Support agent', type: 'member', options: users, width: 150, readOnly: true },
    { key: 'contract', label: 'Contract', type: 'reference', reference: 'contracts', width: 220 },
    { key: 'invoice', label: 'Invoice', type: 'reference', reference: 'invoices', width: 150, hideInList: true },
    { key: 'description', label: 'Description', type: 'longtext', hideInList: true, required: true },
    { key: 'attachments', label: 'Attachments', type: 'text', hideInList: true, readOnly: true },
  ],
}
export const announcements: KitObject = {
  id: 'announcements',
  title: 'Announcements',
  singular: 'Announcement',
  nameLabel: 'Title',
  icon: <MegaphoneIcon {...icon} />,
  readOnly: true,
  views: [{ id: 'latest', name: 'Latest', sorts: [{ field: 'publishedAt', direction: 'desc' }] }],
  fields: [
    { key: 'type', label: 'Type', type: 'choice', options: announcementTypes, width: 140, readOnly: true },
    { key: 'publishedAt', label: 'Published', type: 'date', width: 130, readOnly: true },
    { key: 'body', label: 'Details', type: 'longtext', hideInList: true, readOnly: true },
  ],
}

const services = [
  ['Kumo Cloud Business', 'business', 180000, 60],
  ['Priority support add-on', 'business', 45000, 60],
  ['Data backup · Tokyo region', 'starter', 28000, 10],
  ['Kumo Cloud Enterprise · Osaka hub', 'enterprise', 320000, 120],
  ['Analytics workspace', 'business', 64000, 25],
  ['Fleet tracking API', 'starter', 36000, 15],
] as const
const subjects = [
  ['Cannot sign in with SSO from the Osaka office', 'technical'],
  ['Question about the October invoice', 'billing'],
  ['Add five seats for the new warehouse team', 'account'],
  ['CSV export times out for large shipments', 'technical'],
  ['Change the billing contact to the finance team', 'billing'],
  ['Webhook deliveries failing since this morning', 'technical'],
  ['Request a copy of the service level agreement', 'account'],
  ['Allow filtering deliveries by driver', 'request'],
  ['Two-factor codes arrive several minutes late', 'technical'],
  ['Invoice needs our new registered address', 'billing'],
  ['Remove access for a former employee', 'account'],
  ['Dashboard loads slowly at the start of the day', 'technical'],
  ['Schedule reports to arrive every Monday', 'request'],
  ['Mobile app closes when uploading delivery photos', 'technical'],
] as const
const news = [
  ['Scheduled maintenance on Sunday 8 November', 'maintenance', 'The service is unavailable from 2:00 to 4:00 JST.'],
  ['Year-end support hours', 'notice', 'Support answers by email only from 29 December to 3 January.'],
  [
    'Delayed notifications on 6 October (resolved)',
    'incident',
    'Email notifications were delayed by up to 40 minutes.',
  ],
  ['Updated invoice format from December', 'notice', 'Invoices will show the qualified invoice registration number.'],
  ['Route planning now supports toll roads', 'release', 'Set a toll preference per vehicle in Fleet settings.'],
  ['New data center region in Osaka', 'release', 'Choose Osaka as a backup region from your workspace settings.'],
  ['Database upgrade on Saturday 22 August', 'maintenance', 'Reports may be slower for about an hour.'],
  ['Sign-in issues for some SSO users (resolved)', 'incident', 'A certificate renewal blocked SSO for 25 minutes.'],
] as const
const months = (offset: number) => new Date(Date.UTC(2026, 10 - offset, 1))
const iso = (date: Date) => date.toISOString().slice(0, 10)
const addDays = (value: string, days: number) => iso(new Date(Date.parse(`${value}T00:00:00Z`) + days * 86400000))
const age = (value: string) => Math.max(0, Math.round((Date.parse(day(0)) - Date.parse(value)) / 86400000))

/** About `count` invoices and tickets; contracts and announcements grow slowly; 0 leaves every list empty. */
export function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 31)
  const contractCount = count ? Math.min(16, 2 + Math.floor(Math.sqrt(count) / 2)) : 0
  const contractRecords = Array.from({ length: contractCount }, (_, index) => {
    const [name, plan, fee, seats] = services[index % services.length]!
    const round = Math.floor(index / services.length)
    const startAt = iso(months(31 - index * 2 + r.int(0, 1)))
    const ended = index >= 3 && index % 5 === 4
    const renewsAt = ended ? addDays(day(0), -r.int(20, 200)) : addDays(day(0), index === 1 ? 24 : r.int(60, 330))
    return record(`c${index + 1}`, round ? `${name} · ${round + 1}` : name, {
      number: `CT-${startAt.slice(0, 4)}-${String(412 + index * 17).padStart(4, '0')}`,
      status: ended ? 'ended' : Date.parse(renewsAt) - Date.parse(day(0)) < 45 * 86400000 ? 'renewal' : 'active',
      plan,
      monthlyFee: fee,
      seats,
      startAt,
      renewsAt,
      autoRenew: !ended && index !== 1,
      payment: index % 3 === 2 ? 'card' : 'transfer',
      manager: 's3',
      billingEmail: 'accounts@sakura-logistics.example',
    }, age(startAt))
  })
  const active = contractRecords.filter((contract) => contract.values.status !== 'ended')
  const invoiceRecords = Array.from({ length: active.length ? count : 0 }, (_, index) => {
    const contract = active[index % active.length]!
    const offset = Math.floor(index / active.length)
    const issued = months(offset), issuedAt = iso(issued)
    const dueAt = addDays(iso(months(offset - 1)), -1)
    const status = offset === 0 ? 'unpaid' : offset === 1 && index % active.length === 1 ? 'overdue' : 'paid'
    const subtotal = Math.round(Number(contract.values.monthlyFee) * (1 + r.int(0, 12) / 100) / 100) * 100
    return record(
      `v${index + 1}`,
      `INV-${issuedAt.slice(0, 7).replace('-', '')}-${String(index + 1).padStart(4, '0')}`,
      {
        status,
        period: issued.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
        amount: Math.round(subtotal * 1.1),
        tax: Math.round(subtotal * 0.1),
        issuedAt,
        dueAt,
        paidAt: status === 'paid' ? addDays(dueAt, -r.int(1, 12)) : '',
        contract: contract.id,
      },
      age(issuedAt),
    )
  })
  const span = Math.min(720, 30 + count * 2)
  const ticketRecords = Array.from({ length: count }, (_, index) => {
    const [subject, category] = subjects[index % subjects.length]!
    const round = Math.floor(index / subjects.length)
    const days = Math.floor(index / count * span) + r.int(0, 2)
    const status = days < 3
      ? r.pick(['open', 'open', 'waiting'])
      : days < 14
      ? r.pick(['open', 'waiting', 'resolved'])
      : r.pick(['resolved', 'closed', 'closed'])
    const contract = contractRecords.length ? r.pick(contractRecords) : null
    const invoice = category === 'billing' && invoiceRecords.length ? r.pick(invoiceRecords.slice(0, 12)) : null
    return record(`t${index + 1}`, round ? `${subject} (${round + 1})` : subject, {
      status,
      category,
      priority: r.pick(['normal', 'normal', 'low', 'high', category === 'technical' ? 'urgent' : 'normal']),
      requester: r.pick(staff).value,
      assignee: days < 1 && index % 2 ? '' : r.pick(support).value,
      contract: contract?.id ?? '',
      invoice: invoice?.id ?? '',
      description: `${subject}. Reported by our team at the Kawasaki distribution center.`,
      attachments: index % 4 === 0 ? 'screenshot.png' : '',
    }, days)
  })
  const newsCount = count ? Math.min(news.length, Math.max(3, Math.round(count / 4))) : 0
  const announcementRecords = Array.from({ length: newsCount }, (_, index) => {
    const [title, type, body] = news[index]!
    const publishedAt = day(-index * 11 - r.int(0, 3))
    return record(`a${index + 1}`, title, {
      type,
      publishedAt,
      body,
    }, age(publishedAt))
  })
  return {
    contracts: contractRecords,
    invoices: invoiceRecords,
    tickets: ticketRecords,
    announcements: announcementRecords,
  }
}
