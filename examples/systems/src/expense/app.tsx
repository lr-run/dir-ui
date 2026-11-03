// Expense claims (経費精算): a claim form with line items and receipts, the submitter's history and the approver's
// inbox. Claims, their line items and the approval decisions are kit objects, so every claim also has a detail page.
import { ClipboardCheckIcon, FilePlusIcon, HistoryIcon, WalletIcon } from 'lucide-react'
import { KitApp } from '@/components/systems/kit/app.tsx'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitConfig, KitRecord } from '@/components/systems/kit/types.ts'
import { NewClaimAction, NewClaimPage } from '@/components/systems/expense/new-claim.tsx'
import { ClaimActions, ClaimLines } from '@/components/systems/expense/actions.tsx'
import { ApprovalsPage, MyClaimsPage } from '@/components/systems/expense/queues.tsx'
import { approvals, claims, icon, lines, me, periodOf, users } from '@/components/systems/expense/model.tsx'

// Typical claims: a title, the cost center it is charged to, and the line items it usually holds.
const templates = [
  ['Osaka client visit', 'sales', ['shinkansen', 'hotel', 'taxi', 'lunch']],
  ['Dinner with Hokuto Metals', 'sales', ['dinner', 'taxi']],
  ['Nagoya trade show', 'marketing', ['shinkansen', 'hotel', 'booth', 'lunch']],
  ['Fukuoka site survey', 'operations', ['flight', 'hotel', 'taxi']],
  ['Taxi fares for client meetings', 'sales', ['taxi', 'taxi', 'train']],
  ['Engineering books', 'engineering', ['book', 'book']],
  ['Developer conference ticket', 'engineering', ['conference', 'train']],
  ['Sapporo partner meeting', 'sales', ['flight', 'hotel', 'dinner']],
  ['Team offsite supplies', 'operations', ['supplies', 'lunch']],
  ['Kyoto customer workshop', 'marketing', ['shinkansen', 'lunch', 'supplies']],
  ['Year-end gifts for clients', 'sales', ['gifts']],
  ['Sendai plant inspection', 'operations', ['shinkansen', 'hotel', 'train']],
] as const
const items: Record<string, [description: string, category: string, min: number, max: number]> = {
  shinkansen: ['Shinkansen Tokyo–Shin-Osaka, return', 'travel', 27000, 29440],
  flight: ['Flight Haneda–Fukuoka, return', 'travel', 28000, 52000],
  train: ['Train fares', 'travel', 400, 2400],
  taxi: ['Taxi to client office', 'travel', 1300, 5200],
  hotel: ['Hotel, 1 night', 'lodging', 8800, 18000],
  lunch: ['Lunch with client', 'meals', 2400, 7800],
  dinner: ['Client dinner, 4 people', 'entertainment', 24000, 68000],
  gifts: ['Gift boxes for 6 clients', 'entertainment', 18000, 36000],
  booth: ['Booth printing', 'supplies', 12000, 38000],
  supplies: ['Stationery and USB-C adapters', 'supplies', 2200, 9800],
  book: ['Technical book', 'training', 2800, 5600],
  conference: ['Conference ticket', 'training', 25000, 66000],
}
const reasons = [
  'The receipt for the dinner is missing. Attach it and submit again.',
  'Taxi fares need the start and end points in the note.',
  'Charge this to the Marketing cost center instead.',
  'Hotel is above the ¥15,000 per night limit without a note.',
]
// The first five claims cover the statuses, so even a small preview has a claim to approve, a draft and a payment.
const opening = [
  { status: 'submitted', mine: false },
  { status: 'approved', mine: true },
  { status: 'submitted', mine: false },
  { status: 'draft', mine: true },
  { status: 'paid', mine: false },
]

function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 31)
  const claimRecords: KitRecord[] = [], lineRecords: KitRecord[] = [], approvalRecords: KitRecord[] = []
  for (let index = 0; index < count; index++) {
    const [title, costCenter, kinds] = r.pick(templates)
    const fixed = opening[index]
    const roll = r.next()
    const status = fixed?.status ??
      (roll < 0.1 ? 'draft' : roll < 0.32 ? 'submitted' : roll < 0.5 ? 'approved' : roll < 0.58 ? 'rejected' : 'paid')
    const mine = fixed?.mine ?? r.next() < 0.3
    const submitter = mine ? me : r.pick(users.filter((user) => user.value !== me)).value
    // Mika approves her team's claims; Daichi approves hers and the rest.
    const approver = submitter === me ? 'u4' : submitter === 'u4' || fixed || r.next() < 0.8 ? me : 'u4'
    const age = status === 'draft' || status === 'submitted' ? r.int(0, 9) : r.int(4, 120)
    const submittedAt = day(-age)
    const id = `c${index + 1}`
    let total = 0
    kinds.slice(0, r.int(1, kinds.length)).forEach((kind, position) => {
      const [description, category, min, max] = items[kind]!
      const amount = Math.round(r.int(min, max) / 10) * 10
      total += amount
      lineRecords.push(record(`${id}-l${position + 1}`, description, {
        claim: id,
        amount,
        date: day(-age - r.int(1, 6)),
        category,
        receipt: r.next() > 0.12,
      }, age + 2))
    })
    claimRecords.push(record(id, title, {
      status,
      total,
      submitter,
      approver,
      costCenter,
      period: periodOf(day(-age - 3)),
      submittedAt: status === 'draft' ? null : submittedAt,
      receiptNote: r.next() < 0.3 ? 'Paper receipts handed to accounting in the monthly envelope.' : '',
    }, age))
    if (status === 'approved' || status === 'rejected' || status === 'paid') {
      const decidedAt = day(-Math.max(0, age - r.int(1, 3)))
      approvalRecords.push(record(
        `${id}-a`,
        `${status === 'rejected' ? 'Rejected' : 'Approved'} · ${title}`,
        {
          claim: id,
          decision: status === 'rejected' ? 'rejected' : 'approved',
          approver,
          decidedAt,
          reason: status === 'rejected' ? r.pick(reasons) : '',
        },
        Math.max(0, age - 2),
      ))
    }
  }
  return { claims: claimRecords, lines: lineRecords, approvals: approvalRecords }
}

export const expense: KitConfig = {
  id: 'expense',
  brand: { name: 'Expenses', mark: <WalletIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [
    {
      ...claims,
      detail: {
        actions: (context) => <ClaimActions key={context.record.id} {...context} />,
        tabs: [{ id: 'lines', label: 'Line items', render: (context) => <ClaimLines {...context} /> }],
      },
    },
    lines,
    approvals,
  ],
  pages: [
    {
      id: 'new',
      label: 'New claim',
      icon: <FilePlusIcon {...icon} />,
      render: (context) => <NewClaimPage {...context} />,
    },
    {
      id: 'mine',
      label: 'My claims',
      icon: <HistoryIcon {...icon} />,
      actions: (context) => <NewClaimAction {...context} />,
      render: (context) => <MyClaimsPage {...context} />,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: <ClipboardCheckIcon {...icon} />,
      render: (context) => <ApprovalsPage {...context} />,
    },
  ],
  navigation: [{ items: ['new', 'mine', 'approvals', 'claims'] }],
  home: '/mine',
  users,
  me,
  seed,
}
export function ExpenseApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={expense} layout='page' count={count} basePath={basePath} />
}
