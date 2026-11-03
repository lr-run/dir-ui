// Expense claims: the objects, choices and helpers shared by the form, the queues and the seed.
import { ClipboardCheckIcon, ReceiptIcon, ReceiptTextIcon } from 'lucide-react'
import { formatNumber } from '@/components/ui/value.tsx'
import type { RecordFilter } from '@/lib/query.ts'
import type { KitObject, KitRecord } from '@/components/systems/kit/types.ts'

export const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
export const me = 'u1'
export const users = [
  { value: 'u1', label: 'Mika Sato' },
  { value: 'u2', label: 'Ken Ito' },
  { value: 'u3', label: 'Aya Mori' },
  { value: 'u4', label: 'Daichi Kato' },
  { value: 'u5', label: 'Yui Tanaka' },
  { value: 'u6', label: 'Haruto Suzuki' },
]
export const claimStatus = [
  { value: 'draft', label: 'Draft', color: 'var(--ui-muted)' },
  { value: 'submitted', label: 'Submitted', color: 'var(--ui-amber)' },
  { value: 'approved', label: 'Approved', color: 'var(--ui-blue)' },
  { value: 'rejected', label: 'Rejected', color: 'var(--ui-red)' },
  { value: 'paid', label: 'Paid', color: 'var(--ui-green)' },
]
export const decisions = [
  { value: 'approved', label: 'Approved', color: 'var(--ui-green)' },
  { value: 'rejected', label: 'Rejected', color: 'var(--ui-red)' },
]
export const categories = [
  { value: 'travel', label: 'Travel' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'meals', label: 'Meals' },
  { value: 'entertainment', label: 'Client entertainment' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'training', label: 'Books and training' },
]
export const costCenters = [
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
]

const inStatus = (label: string): RecordFilter => ({
  conjunction: 'and',
  conditions: [{ id: 'status', field: 'status', operator: 'in', value: [label] }],
})
export const claims: KitObject = {
  id: 'claims',
  title: 'All claims',
  singular: 'Claim',
  nameLabel: 'Claim',
  icon: <ReceiptIcon {...icon} />,
  // Claims are filed on the New claim page, with their line items and receipts.
  createPath: '/new',
  views: [
    { id: 'all', name: 'All claims', sorts: [{ field: 'createdAt', direction: 'desc' }] },
    {
      id: 'waiting',
      name: 'Waiting for approval',
      filter: inStatus('Submitted'),
      sorts: [{ field: 'submittedAt', direction: 'asc' }],
    },
    { id: 'rejected', name: 'Rejected', filter: inStatus('Rejected') },
    { id: 'paid', name: 'Paid', filter: inStatus('Paid'), sorts: [{ field: 'submittedAt', direction: 'desc' }] },
  ],
  fields: [
    {
      key: 'status',
      label: 'Status',
      type: 'choice',
      options: claimStatus,
      width: 130,
      confirm: {
        rejected: {
          title: 'Reject this claim?',
          description:
            'It goes back to the submitter, who has to fix it and submit it again. To tell them why, use Reject at the top of the claim instead.',
          action: 'Reject claim',
        },
      },
    },
    { key: 'total', label: 'Total', type: 'money', width: 120, readOnly: true },
    { key: 'submitter', label: 'Submitter', type: 'member', options: users, width: 150, required: true },
    { key: 'approver', label: 'Approver', type: 'member', options: users, width: 150 },
    { key: 'costCenter', label: 'Cost center', type: 'choice', options: costCenters, width: 130 },
    { key: 'period', label: 'Period', type: 'text', width: 110 },
    { key: 'submittedAt', label: 'Submitted', type: 'date', width: 130 },
    { key: 'receiptNote', label: 'Receipt note', type: 'longtext', hideInList: true },
  ],
}
export const lines: KitObject = {
  id: 'lines',
  title: 'Line items',
  singular: 'Line item',
  nameLabel: 'Description',
  icon: <ReceiptTextIcon {...icon} />,
  // Line items change only through the claim form, so a claim total always matches its lines.
  readOnly: true,
  fields: [
    { key: 'claim', label: 'Claim', type: 'reference', reference: 'claims', width: 200, required: true },
    { key: 'amount', label: 'Amount', type: 'money', width: 120 },
    { key: 'date', label: 'Date', type: 'date', width: 130 },
    { key: 'category', label: 'Category', type: 'choice', options: categories, width: 170 },
    { key: 'receipt', label: 'Receipt attached', type: 'boolean', width: 140 },
  ],
}
export const approvals: KitObject = {
  id: 'approvals',
  title: 'Decisions',
  singular: 'Decision',
  nameLabel: 'Decision',
  icon: <ClipboardCheckIcon {...icon} />,
  // Decisions are a record of what an approver did; they are made with Approve and Reject.
  readOnly: true,
  fields: [
    { key: 'claim', label: 'Claim', type: 'reference', reference: 'claims', width: 200, required: true },
    { key: 'decision', label: 'Decision', type: 'choice', options: decisions, width: 120 },
    { key: 'approver', label: 'Approver', type: 'member', options: users, width: 150 },
    { key: 'decidedAt', label: 'Decided', type: 'date', width: 130 },
    { key: 'reason', label: 'Reason', type: 'longtext', hideInList: true },
  ],
}

export const yen = (value: number) => formatNumber(value, { format: 'currency', currency: 'JPY' })
/** Today's date as `YYYY-MM-DD`, for new claims and decisions. */
export const today = () => new Date().toISOString().slice(0, 10)
/** The claim period a date falls in, such as `Oct 2026`. */
export const periodOf = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const statusOf = (value: unknown) => claimStatus.find((item) => item.value === value) ?? claimStatus[0]!
export const userName = (id: unknown) => users.find((user) => user.value === id)?.label ?? '—'
export const claimTotal = (claim: KitRecord) => Number(claim.values.total ?? 0)
