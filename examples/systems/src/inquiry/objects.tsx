// Inquiry objects: tickets from customers, the customers themselves and the canned replies agents send.
import { Building2Icon, MessageSquareTextIcon, TicketIcon } from 'lucide-react'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitObject, KitRecord } from '@/components/systems/kit/types.ts'

export const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
export const users = [
  { value: 'u1', label: 'Yuna Fujita' },
  { value: 'u2', label: 'Shota Ishikawa' },
  { value: 'u3', label: 'Nanami Ogawa' },
  { value: 'u4', label: 'Hayato Kimura' },
]
export const ticketStatus = [
  { value: 'new', label: 'New', color: 'var(--ui-blue)' },
  { value: 'open', label: 'Open', color: 'var(--ui-amber)' },
  { value: 'waiting', label: 'Waiting on customer', color: 'var(--ui-muted)' },
  { value: 'resolved', label: 'Resolved', color: 'var(--ui-green)' },
  { value: 'closed', label: 'Closed', color: 'var(--ui-muted)' },
]
/** Statuses an agent still has to act on. */
export const unresolved = new Set(['new', 'open', 'waiting'])
export const priorities = [
  { value: 'low', label: 'Low', color: 'var(--ui-muted)' },
  { value: 'normal', label: 'Normal', color: 'var(--ui-blue)' },
  { value: 'high', label: 'High', color: 'var(--ui-amber)' },
  { value: 'urgent', label: 'Urgent', color: 'var(--ui-red)' },
]
/** Days from receipt to the SLA due date, by priority. */
export const slaDays: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }
export const slaStatus = [
  { value: 'on-track', label: 'On track', color: 'var(--ui-green)' },
  { value: 'at-risk', label: 'At risk', color: 'var(--ui-amber)' },
  { value: 'breached', label: 'Breached', color: 'var(--ui-red)' },
]
export const channels = [
  { value: 'email', label: 'Email' },
  { value: 'form', label: 'Web form' },
  { value: 'phone', label: 'Phone' },
  { value: 'chat', label: 'Chat' },
]
/** The first day of the fixtures, used as today so seeded and new tickets agree. */
export const today = day(0)
export const shortDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
/** Ticket notes that start with this line are replies sent to the customer, shown in the conversation. */
export const replyPrefix = 'Reply sent to the customer\n'
/** The next free ticket number, such as `#10512`. */
export const nextTicketRef = (records: KitRecord[]) =>
  `#${Math.max(10479, ...records.map((ticket) => Number(String(ticket.values.ref).slice(1)) || 0)) + 1}`

const openLabels = ticketStatus.filter((status) => unresolved.has(status.value)).map((status) => status.label)
const isOpen = { id: 'open', field: 'status', operator: 'in', value: openLabels }
const bySlaDue = [{ field: 'slaDue', direction: 'asc' as const }, { field: 'receivedAt', direction: 'asc' as const }]
const plans = ['Standard', 'Business', 'Enterprise'].map((label) => ({ value: label.toLowerCase(), label }))
const macroCategories = ['Account', 'Billing', 'Technical', 'Shipping', 'General'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))

export const tickets: KitObject = {
  id: 'tickets',
  title: 'Tickets',
  singular: 'Ticket',
  nameLabel: 'Subject',
  icon: <TicketIcon {...icon} />,
  views: [
    { id: 'open', name: 'Open', filter: { conjunction: 'and', conditions: [isOpen] }, sorts: bySlaDue },
    {
      id: 'mine',
      name: 'Mine',
      filter: {
        conjunction: 'and',
        conditions: [isOpen, { id: 'mine', field: 'assignee', operator: 'eq', value: users[0]!.label }],
      },
      sorts: bySlaDue,
    },
    {
      id: 'at-risk',
      name: 'At risk',
      filter: {
        conjunction: 'and',
        conditions: [isOpen, { id: 'sla', field: 'sla', operator: 'in', value: ['At risk'] }],
      },
      sorts: bySlaDue,
    },
    {
      id: 'breached',
      name: 'Breached',
      filter: {
        conjunction: 'and',
        conditions: [isOpen, { id: 'sla', field: 'sla', operator: 'in', value: ['Breached'] }],
      },
      sorts: bySlaDue,
    },
    {
      id: 'resolved',
      name: 'Resolved',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'done', field: 'status', operator: 'in', value: ['Resolved', 'Closed'] }],
      },
      sorts: [{ field: 'resolvedAt', direction: 'desc' }],
    },
    { id: 'all', name: 'All tickets', sorts: [{ field: 'receivedAt', direction: 'desc' }] },
  ],
  fields: [
    { key: 'ref', label: 'Ticket', type: 'text', width: 100, readOnly: true },
    { key: 'status', label: 'Status', type: 'choice', options: ticketStatus, width: 180 },
    { key: 'sla', label: 'SLA', type: 'choice', options: slaStatus, width: 120 },
    { key: 'priority', label: 'Priority', type: 'choice', options: priorities, width: 110 },
    { key: 'customer', label: 'Customer', type: 'reference', reference: 'customers', width: 200, required: true },
    { key: 'channel', label: 'Channel', type: 'choice', options: channels, width: 120 },
    { key: 'assignee', label: 'Assignee', type: 'member', options: users, width: 160 },
    { key: 'receivedAt', label: 'Received', type: 'date', width: 120 },
    { key: 'slaDue', label: 'SLA due', type: 'date', width: 120 },
    { key: 'resolvedAt', label: 'Resolved on', type: 'date', hideInList: true },
    { key: 'description', label: 'Customer message', type: 'longtext', hideInList: true },
  ],
}
export const customers: KitObject = {
  id: 'customers',
  title: 'Customers',
  singular: 'Customer',
  nameLabel: 'Company',
  icon: <Building2Icon {...icon} />,
  defaults: () => ({ plan: 'business', owner: users[0]!.value }),
  fields: [
    { key: 'contact', label: 'Contact', type: 'text', width: 160 },
    { key: 'email', label: 'Email', type: 'email', width: 240 },
    { key: 'phone', label: 'Phone', type: 'tel', width: 140 },
    { key: 'plan', label: 'Plan', type: 'choice', options: plans, width: 130 },
    { key: 'owner', label: 'Account owner', type: 'member', options: users, width: 160 },
  ],
}
export const macros: KitObject = {
  id: 'macros',
  title: 'Macros',
  singular: 'Macro',
  nameLabel: 'Macro',
  icon: <MessageSquareTextIcon {...icon} />,
  defaults: () => ({ category: 'general', uses: 0, owner: users[0]!.value }),
  fields: [
    { key: 'category', label: 'Category', type: 'choice', options: macroCategories, width: 130 },
    { key: 'body', label: 'Reply', type: 'longtext', width: 420, required: true },
    { key: 'uses', label: 'Used (30 days)', type: 'number', width: 130 },
    { key: 'owner', label: 'Maintainer', type: 'member', options: users, width: 160 },
  ],
}

const subjects = [
  'Invoice shows the old billing address',
  'Cannot sign in after a password reset',
  'Add five more seats to our plan',
  'CSV export stops at 10,000 rows',
  'Delivery arrived with a damaged box',
  'How do we change the account owner?',
  'Two-factor codes are not arriving',
  'Refund for a duplicate charge in October',
  'API returns 429 during the nightly sync',
  'Company name change on the contract',
  'Tracking has not updated for three days',
  'Webhook signature check fails',
  'Receipt needed with our registration number',
  'Dashboard is slow in the afternoon',
  "Remove a former employee's access",
  'Questions about the Enterprise plan',
  'Single sign-on setup with Okta',
  'Order placed twice by mistake',
  'Mobile app closes when uploading a photo',
  'Quote for annual billing',
]
const messages = [
  'We noticed this this morning and several people on our team are affected. Could you take a look?',
  'This started after the update last week. Screenshots are attached to the original email.',
  'We need this resolved before our month-end close. Please let us know the next step.',
  'Not urgent, but we would like to understand how this works before we roll it out further.',
]
const prefixes = [
  'Hokuto',
  'Asahi',
  'Minato',
  'Seiryu',
  'Kawasemi',
  'Tokai',
  'Sakura',
  'Kanto',
  'Shirokane',
  'Yamabuki',
  'Aoba',
  'Hinode',
  'Kirin',
  'Midori',
  'Fuji',
  'Nishiki',
]
const suffixes = ['Logistics', 'Foods', 'Clinic', 'Design', 'Trading', 'Systems', 'Pharmacy', 'Realty']
const cities = ['Osaka', 'Nagoya', 'Fukuoka', 'Sapporo', 'Sendai']
const people = [
  ['Haruka', 'Tanaka'],
  ['Takumi', 'Suzuki'],
  ['Yui', 'Takahashi'],
  ['Ren', 'Watanabe'],
  ['Sakura', 'Yamamoto'],
  ['Sota', 'Nakamura'],
  ['Mei', 'Kobayashi'],
  ['Riku', 'Yoshida'],
  ['Hina', 'Yamada'],
  ['Kaito', 'Sasaki'],
] as const
const macroSeed = [
  [
    'Password reset steps',
    'account',
    'You can reset your password from Settings › Security. The link in the email is valid for 30 minutes; if it has expired, request a new one from the sign-in page.',
  ],
  [
    'Two-factor codes not arriving',
    'account',
    'Please check that the phone number under Settings › Security is current and that your carrier accepts short-code messages. You can also switch to an authenticator app.',
  ],
  [
    'Change the account owner',
    'account',
    'The current owner can transfer ownership from Settings › Members › Transfer ownership. If they have left the company, reply with a letter on company letterhead and we will make the change.',
  ],
  [
    'Duplicate charge refund',
    'billing',
    'Sorry for the duplicate charge. We have issued a refund for the second payment; it reaches your card within 5–10 business days depending on your bank.',
  ],
  [
    'Update the billing address',
    'billing',
    'You can update the billing address under Billing › Company details. The change applies from the next invoice; we can reissue the current one on request.',
  ],
  [
    'Qualified invoice details',
    'billing',
    'Our invoices include our qualified invoice issuer registration number. Download them any time from Billing › Invoices.',
  ],
  [
    'API rate limits',
    'technical',
    'The API allows 600 requests per minute per workspace. For nightly syncs we recommend the bulk endpoints, which count as one request per 1,000 records.',
  ],
  [
    'Collect browser details',
    'technical',
    'To help us reproduce this, could you send the browser and version you use, the time it happened and a screenshot of the error?',
  ],
  [
    'Damaged delivery',
    'shipping',
    'We are sorry the package arrived damaged. Please reply with a photo of the box and the item; we will ship a replacement the same day we receive it.',
  ],
  [
    'Tracking not updating',
    'shipping',
    'Carrier tracking can pause for up to 72 hours between depots. We have asked the carrier for an update and will write again as soon as we hear back.',
  ],
  [
    'Closing a resolved ticket',
    'general',
    'We are glad this is working again. We will close this ticket now; replying to this email reopens it at any time.',
  ],
  [
    'Holiday support hours',
    'general',
    'Our support desk is closed from 29 December to 3 January. Urgent issues reported through the status page are still handled within four hours.',
  ],
] as const

/** Customers scale with the ticket count; macros are a fixed library. */
export function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 11)
  const customerRecords = Array.from({ length: Math.max(8, Math.ceil(count / 5)) }, (_, index) => {
    const prefix = prefixes[index % prefixes.length]!
    const suffix = suffixes[(Math.floor(index / prefixes.length) + index) % suffixes.length]!
    const city = index >= prefixes.length * suffixes.length
      ? ` ${cities[Math.floor(index / (prefixes.length * suffixes.length)) - 1]}`
      : ''
    const [first, last] = r.pick(people)
    const domain = `${prefix}-${suffix}`.toLowerCase()
    return record(`c${index + 1}`, `${prefix} ${suffix}${city}`, {
      contact: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}.example`,
      phone: `${r.pick(['03', '06', '052', '092'])}-${r.int(1000, 9999)}-${r.int(1000, 9999)}`,
      plan: r.pick(plans).value,
      owner: r.pick(users).value,
    }, r.int(120, 900))
  })
  const ticketRecords = Array.from({ length: count }, (_, index) => {
    const roll = r.next()
    const status = roll < 0.12
      ? 'new'
      : roll < 0.4
      ? 'open'
      : roll < 0.55
      ? 'waiting'
      : roll < 0.85
      ? 'resolved'
      : 'closed'
    const priority = r.pick(['low', 'normal', 'normal', 'normal', 'high', 'high', 'urgent'])
    const age = status === 'new' ? r.int(0, 2) : unresolved.has(status) ? r.int(0, 6) : r.int(0, 29)
    const due = slaDays[priority]! - age
    const sla = status === 'waiting'
      ? 'on-track'
      : unresolved.has(status)
      ? due < 0 ? 'breached' : due === 0 ? 'at-risk' : 'on-track'
      : r.next() < 0.12
      ? 'breached'
      : 'on-track'
    return record(`t${index + 1}`, subjects[(index * 7 + r.int(0, 3)) % subjects.length]!, {
      ref: `#${10480 + index}`,
      status,
      sla,
      priority,
      customer: r.pick(customerRecords).id,
      channel: r.pick(['email', 'email', 'form', 'form', 'phone', 'chat']),
      assignee: status === 'new' && r.next() < 0.6 ? '' : r.pick(users).value,
      receivedAt: day(-age),
      slaDue: day(due),
      resolvedAt: unresolved.has(status) ? '' : day(-r.int(0, age)),
      description: r.pick(messages),
    }, age)
  })
  const macroRecords = macroSeed.map(([name, category, body], index) =>
    record(`m${index + 1}`, name, { category, body, uses: r.int(2, 140), owner: r.pick(users).value }, 200)
  )
  return { tickets: ticketRecords, customers: customerRecords, macros: macroRecords }
}
