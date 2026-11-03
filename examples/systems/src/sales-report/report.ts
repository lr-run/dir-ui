// Report figures computed from the order rows in the store, and the report period shared by the header and the page.
import { useSyncExternalStore } from 'react'
import type { ChartPoint } from '@/components/charts/index.tsx'
import type { KitStore } from '@/components/systems/kit/store.ts'
import type { KitRow } from '@/components/systems/kit/types.ts'

/** The last closed month of the fixtures (they run to 2 November 2026). */
const lastMonth = '2026-10'
const shift = (key: string, months: number) => {
  const [year, month] = key.split('-').map(Number) as [number, number]
  return new Date(Date.UTC(year, month - 1 + months, 1)).toISOString().slice(0, 7)
}
const back = (months: number) => Array.from({ length: months }, (_, index) => shift(lastMonth, index - months + 1))
export const periods = [
  { value: '3m', label: 'Last 3 months', months: back(3) },
  { value: '6m', label: 'Last 6 months', months: back(6) },
  { value: 'fy', label: 'FY2026 to date', months: back(7) },
  { value: '12m', label: 'Last 12 months', months: back(12) },
]

// The header actions and the page body render separately inside the kit app, so the period lives outside both.
let period = '6m'
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const setPeriod = (value: string) => {
  period = value
  for (const listener of listeners) listener()
}
export function usePeriod(): [string, (value: string) => void] {
  return [useSyncExternalStore(subscribe, () => period, () => period), setPeriod]
}

const monthLabel = (key: string, year = false) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    ...year ? { year: 'numeric' } : {},
    timeZone: 'UTC',
  })
/** Fiscal quarters start in April, as in most Japanese companies. */
const quarterLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number) as [number, number]
  const fiscalYear = month >= 4 ? year : year - 1
  return `Q${Math.floor(((month + 8) % 12) / 3) + 1} FY${String(fiscalYear).slice(2)}`
}
const amount = (row: KitRow) => Number(row.record.values.amount) || 0
const monthOf = (row: KitRow) => String(row.record.values.orderedAt ?? '').slice(0, 7)
const sum = (rows: KitRow[]) => rows.reduce((total, row) => total + amount(row), 0)
function totals(rows: KitRow[], key: (row: KitRow) => string) {
  const map = new Map<string, number>()
  for (const row of rows) map.set(key(row), (map.get(key(row)) ?? 0) + amount(row))
  return map
}
const top = (map: Map<string, number>, limit: number): ChartPoint[] =>
  [...map].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, value]) => ({ label, value }))

export type Report = ReturnType<typeof buildReport>
export function buildReport(store: KitStore, periodId: string, grain: 'month' | 'quarter') {
  const months = (periods.find((item) => item.value === periodId) ?? periods[1]!).months
  const previousMonths = months.map((key) => shift(key, -12))
  const live = store.rows.orders!.filter((row) => !row.archivedAt && row.record.values.status !== 'cancelled')
  const byMonth = totals(live, monthOf)
  const orders = live.filter((row) => months.includes(monthOf(row)))
  const previous = live.filter((row) => previousMonths.includes(monthOf(row)))
  // Target: the same month a year earlier plus 10%, rounded to ¥100,000.
  const targetOf = (key: string) => Math.round((byMonth.get(shift(key, -12)) ?? 0) * 1.1 / 100000) * 100000
  const buckets = new Map<string, { value: number; secondary: number }>()
  for (const key of months) {
    const label = grain === 'month' ? monthLabel(key) : quarterLabel(key)
    const bucket = buckets.get(label) ?? { value: 0, secondary: 0 }
    bucket.value += byMonth.get(key) ?? 0
    bucket.secondary += targetOf(key)
    buckets.set(label, bucket)
  }
  const current = totals(orders, (row) => String(row.record.values.customer))
  const before = totals(previous, (row) => String(row.record.values.customer))
  const atRisk = store.rows.customers!.filter((row) => !row.archivedAt)
    .map((row) => ({ row, current: current.get(row.id) ?? 0, previous: before.get(row.id) ?? 0 }))
    .filter((item) => item.previous > 0 && item.current < item.previous * 0.7)
    .sort((a, b) => (b.previous - b.current) - (a.previous - a.current))
  const first = months[0]!, last = months.at(-1)!
  return {
    months,
    range: first.slice(0, 4) === last.slice(0, 4)
      ? `${monthLabel(first)}–${monthLabel(last, true)}`
      : `${monthLabel(first, true)}–${monthLabel(last, true)}`,
    orders,
    revenue: sum(orders),
    previousRevenue: sum(previous),
    target: months.reduce((total, key) => total + targetOf(key), 0),
    trend: [...buckets].map(([label, values]): ChartPoint => ({ label, ...values })),
    byProduct: top(totals(orders, (row) => String(row.product)), 6),
    byCustomer: top(totals(orders, (row) => String(row.customer)), 6),
    byDepartment: top(totals(orders, (row) => String(row.department || 'Unassigned')), 6),
    customers: [...current.keys()],
    atRisk,
    largest: [...orders].sort((a, b) => amount(b) - amount(a)),
  }
}

/** The period's orders as CSV, one row per order with labels rather than ids. */
export function csvFor(report: Report) {
  const cell = (value: unknown) => {
    const text = String(value ?? '')
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  const lines = [
    ['Order', 'Ordered', 'Customer', 'Product', 'Department', 'Status', 'Quantity', 'Amount (JPY)'],
    ...report.orders.map((row) => [
      row.name,
      row.record.values.orderedAt,
      row.customer,
      row.product,
      row.department,
      row.status,
      row.record.values.quantity,
      amount(row),
    ]),
  ]
  return {
    name: `sales-${report.months[0]}-to-${report.months.at(-1)}.csv`,
    body: lines.map((line) => line.map(cell).join(',')).join('\n'),
  }
}
