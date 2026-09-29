import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { ChartFrame } from '../../../components/charts/chart-frame.tsx'
import { ChartTooltip, ChartTooltipContent } from '../../../components/shadcn/chart.tsx'
import { Header } from '../../../components/ui/header.tsx'
import { I, Select } from '../../../components/ui/index.tsx'
import { WorkspaceSidebarTrigger } from '../layout.tsx'
import type { ExampleRecord } from '../types.ts'
import { examples } from '../example/data.ts'

const money = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const compact = (value: number) =>
  `$${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`
const monthName = (value: string) =>
  /^\d{4}-\d{2}$/.test(value)
    ? new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    : value
const config = {
  value: { label: 'Deal value', color: '#6875d9' },
  weighted: { label: 'Weighted value', color: '#3a9d8a' },
}
const axis = { fontSize: 11, fill: 'var(--ui-muted)' }

export default function ReportRoute({ records }: { records: readonly ExampleRecord[] }) {
  const [owner, setOwner] = useState('')
  const [month, setMonth] = useState('')
  const report = useMemo(() => buildReport(records, owner, month), [records, owner, month])
  const options = useMemo(() => ({
    owners: [...new Set(records.map((row) => row.owner).filter(Boolean))].sort(),
    months: [...new Set(records.flatMap((row) => row.closeDate ? [row.closeDate.slice(0, 7)] : []))].sort(),
  }), [records])
  const empty = report.total.count === 0
  const tooltip = (
    <ChartTooltipContent
      formatter={(value, name) => (
        <>
          <span>{name === 'weighted' ? 'Weighted value' : 'Deal value'}</span>
          <strong>{money(Number(value))}</strong>
        </>
      )}
    />
  )
  return (
    <>
      <Header
        leading={<WorkspaceSidebarTrigger />}
        title={
          <span className='flex items-center gap-[8px] text-[14px] font-semibold'>
            <I name='chart' />Report
          </span>
        }
        actions={<span className='text-[11px] text-muted-foreground'>Deals · USD</span>}
      />
      <div className='flex-1 min-h-0 overflow-auto [container-type:inline-size]'>
        <div className='max-w-[1280px] m-[0_auto] p-[24px] grid gap-[20px] [@container(max-width:_740px)]:p-[16px] [@container(max-width:_740px)]:gap-[16px]'>
          <div className='flex items-center justify-between gap-[16px] flex-wrap [&_h1]:text-[21px] [&_h1]:font-semibold [&_h1]:tracking-[-.4px] [&_h1]:m-0 [&_p]:text-muted-foreground [&_p]:text-[12px] [&_p]:m-[6px_0_0]'>
            <div>
              <h1>Sales overview</h1>
              <p>Deal performance across your workspace.</p>
            </div>
            <div
              className="flex gap-[8px] [@container(max-width:_740px)]:w-full [&_[class~='group/crm-select']]:w-[158px] [&_[class~='group/crm-select']]:h-[30px] [&_[class~='group/crm-select']]:text-[12px] [@container(max-width:_740px)]:[&_[class~='group/crm-select']]:w-full [@container(max-width:_740px)]:[&_[class~='group/crm-select']]:min-w-0"
              role='group'
              aria-label='Report filters'
            >
              <Select
                label='Report owner'
                value={owner}
                onChange={setOwner}
                items={[
                  { value: '', label: 'All owners' },
                  ...options.owners.map((value) => ({ value, label: value })),
                ]}
              />
              <Select
                label='Close month'
                value={month}
                onChange={setMonth}
                items={[
                  { value: '', label: 'All close dates' },
                  ...options.months.map((value) => ({ value, label: monthName(value) })),
                ]}
              />
            </div>
          </div>
          <dl className='m-0 grid grid-cols-[repeat(4,_minmax(0,_1fr))] [border:1px_solid_var(--ui-border)] rounded-[8px] [background:var(--ui-surface)] [&>div]:p-[18px_20px] [&>div+div]:[border-left:1px_solid_var(--ui-border)] [&_dt]:text-[12px] [&_dt]:text-muted-foreground [&_dd]:m-[10px_0_0] [&_dd]:text-[24px] [&_dd]:[font-weight:550] [&_dd]:tracking-[-.6px] [&_dd]:[font-variant-numeric:tabular-nums] [@container(max-width:_740px)]:grid-cols-[repeat(2,_minmax(0,_1fr))] [@container(max-width:_740px)]:[&>div]:p-[16px] [@container(max-width:_740px)]:[&_dd]:text-[22px] [@container(max-width:_740px)]:[&>div:nth-child(3)]:[border-left:0] [@container(max-width:_740px)]:[&>div:nth-child(n+3)]:[border-top:1px_solid_var(--ui-border)]'>
            {[['Total deal value', money(report.total.value)], ['Weighted value', money(report.total.weighted)], [
              'Won revenue',
              money(report.total.won),
            ], ['Deals', report.total.count.toLocaleString('en-US')]].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className='grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[16px] [@container(max-width:_740px)]:grid-cols-[minmax(0,_1fr)]'>
            <section
              className="[&_header_p]:text-muted-foreground [&_header_p]:text-[12px] [&_header_p]:m-[6px_0_0] min-w-0 [border:1px_solid_var(--ui-border)] rounded-[8px] [background:var(--ui-surface)] overflow-hidden [&_header]:p-[18px_20px_14px] [&_h2]:text-[13px] [&_h2]:[font-weight:550] [&_h2]:m-0 [&_[class~='group/crm-chart-frame']]:m-[0_12px_12px_4px]"
              aria-labelledby='report-stage-title'
            >
              <header>
                <h2 id='report-stage-title'>Value by stage</h2>
                <p>Total deal value by current stage</p>
              </header>
              <ChartFrame
                height={220}
                config={config}
                empty={empty}
                label={`Deal value by stage: ${
                  report.stages.map((row) => `${row.name} ${money(row.value)}`).join(', ')
                }`}
              >
                <BarChart data={report.stages} margin={{ top: 12, right: 12, left: 0, bottom: 4 }} accessibilityLayer>
                  <CartesianGrid vertical={false} stroke='var(--ui-border)' />
                  <XAxis
                    dataKey='name'
                    tick={{ ...axis, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis tick={axis} tickFormatter={compact} tickLine={false} axisLine={false} width={56} />
                  <ChartTooltip content={tooltip} cursor={{ fill: 'var(--ui-hover)' }} />
                  <Bar
                    dataKey='value'
                    fill='var(--color-value)'
                    radius={[4, 4, 0, 0]}
                    maxBarSize={42}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartFrame>
            </section>
            <section
              className="[&_header_p]:text-muted-foreground [&_header_p]:text-[12px] [&_header_p]:m-[6px_0_0] min-w-0 [border:1px_solid_var(--ui-border)] rounded-[8px] [background:var(--ui-surface)] overflow-hidden [&_header]:p-[18px_20px_14px] [&_h2]:text-[13px] [&_h2]:[font-weight:550] [&_h2]:m-0 [&_[class~='group/crm-chart-frame']]:m-[0_12px_12px_4px]"
              aria-labelledby='report-month-title'
            >
              <header>
                <h2 id='report-month-title'>Expected close</h2>
                <p>Weighted value by scheduled close month</p>
              </header>
              <ChartFrame
                height={220}
                config={config}
                empty={empty}
                label={`Weighted value by close month: ${
                  report.months.map((row) => `${monthName(row.name)} ${money(row.weighted)}`).join(', ')
                }`}
              >
                <LineChart data={report.months} margin={{ top: 12, right: 20, left: 0, bottom: 4 }} accessibilityLayer>
                  <CartesianGrid vertical={false} stroke='var(--ui-border)' />
                  <XAxis dataKey='name' tickFormatter={monthName} tick={axis} tickLine={false} axisLine={false} />
                  <YAxis tick={axis} tickFormatter={compact} tickLine={false} axisLine={false} width={56} />
                  <ChartTooltip content={tooltip} labelFormatter={(label) => monthName(String(label))} />
                  <Line
                    dataKey='weighted'
                    type='linear'
                    stroke='var(--color-weighted)'
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ChartFrame>
            </section>
          </div>
          <section
            className="[&_header_p]:text-muted-foreground [&_header_p]:text-[12px] [&_header_p]:m-[6px_0_0] min-w-0 [border:1px_solid_var(--ui-border)] rounded-[8px] [background:var(--ui-surface)] overflow-hidden [&_header]:p-[18px_20px_14px] [&_h2]:text-[13px] [&_h2]:[font-weight:550] [&_h2]:m-0 [&_[class~='group/crm-chart-frame']]:m-[0_12px_12px_4px] report-table-card"
            aria-labelledby='report-owner-title'
          >
            <header>
              <h2 id='report-owner-title'>Performance by owner</h2>
              <p>The same filtered deals, grouped by owner</p>
            </header>
            <div className='overflow-x-auto' role='region' aria-label='Owner performance table' tabIndex={0}>
              <table className="[&_th]:[border-bottom:1px_solid_var(--ui-border)] [&_td]:[border-bottom:1px_solid_var(--ui-border)] [&_th]:text-muted-foreground [&_th]:text-[12px] [&_th]:font-medium [&_tbody_tr:last-child_td]:[border:0] w-full [border-collapse:collapse] text-[12px] whitespace-nowrap [&_th]:p-[12px_20px] [&_th]:[border-top:1px_solid_var(--ui-border)] [&_th]:text-right [&_th]:[font-variant-numeric:tabular-nums] [&_td]:p-[12px_20px] [&_td]:[border-top:1px_solid_var(--ui-border)] [&_td]:text-right [&_td]:[font-variant-numeric:tabular-nums] [&_thead_th]:text-[11px] [&_thead_th]:text-muted-foreground [&_thead_th]:[background:var(--ui-raised)] [&_thead_th]:font-medium [&_tbody_th]:font-medium [&_tfoot]:[font-weight:550] [&_tfoot]:[background:var(--ui-raised)] [&_th:first-child]:text-left [&_tbody_tr:hover]:[background:var(--ui-hover)] [&_[class~='group/report-empty']]:text-center [&_[class~='group/report-empty']]:p-[36px_20px] [&_[class~='group/report-empty']]:text-muted-foreground">
                <caption className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
                  Deal count, total value, weighted value and won revenue by owner in USD
                </caption>
                <thead>
                  <tr>
                    <th scope='col'>Owner</th>
                    <th scope='col'>Deals</th>
                    <th scope='col'>Deal value</th>
                    <th scope='col'>Weighted value</th>
                    <th scope='col'>Won revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {empty
                    ? (
                      <tr>
                        <td colSpan={5} className='group/report-empty'>No deals match these filters.</td>
                      </tr>
                    )
                    : report.owners.map((row) => (
                      <tr key={row.name}>
                        <th scope='row'>
                          <span className='inline-grid [place-items:center] w-[23px] h-[23px] mr-[9px] rounded-[50%] text-[10px] [background:var(--ui-hover)] text-muted-foreground'>
                            {row.name.slice(0, 1)}
                          </span>
                          {row.name}
                        </th>
                        <td>{row.count}</td>
                        <td>{money(row.value)}</td>
                        <td>{money(row.weighted)}</td>
                        <td>{money(row.won)}</td>
                      </tr>
                    ))}
                </tbody>
                {!empty && (
                  <tfoot>
                    <tr>
                      <th scope='row'>Total</th>
                      <td>{report.total.count}</td>
                      <td>{money(report.total.value)}</td>
                      <td>{money(report.total.weighted)}</td>
                      <td>{money(report.total.won)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <p className='text-[11px] text-muted-foreground m-0 p-[12px_20px] [border-top:1px_solid_var(--ui-border)]'>
              Weighted value = deal value × probability. Won deals use 100%.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}

export type ReportSummary = { name: string; count: number; value: number; weighted: number; won: number }
const summary = (name: string): ReportSummary => ({ name, count: 0, value: 0, weighted: 0, won: 0 })
const add = (total: ReportSummary, row: ExampleRecord) => {
  const value = Number.isFinite(row.value) ? Math.max(0, row.value) : 0
  const probability = row.status === 'Won' ? 100 : Math.min(100, Math.max(0, row.probability ?? 0))
  total.count++
  total.value += value
  total.weighted += value * probability / 100
  if (row.status === 'Won') total.won += value
}

// All views share one filtered collection; missing close dates remain in the all-dates report.
export function buildReport(records: readonly ExampleRecord[], owner = '', month = '') {
  const stages = new Map<string, ReportSummary>(examples.deals.statuses.map((name) => [name, summary(name)]))
  const months = new Map<string, ReportSummary>()
  const owners = new Map<string, ReportSummary>()
  const total = summary('Total')
  for (const row of records) {
    if ((owner && row.owner !== owner) || (month && row.closeDate?.slice(0, 7) !== month)) continue
    add(total, row)
    for (
      const [map, name] of [
        [stages, row.status || 'No stage'],
        [months, row.closeDate?.slice(0, 7) || 'Unscheduled'],
        [owners, row.owner || 'Unassigned'],
      ] as const
    ) {
      const group = map.get(name) ?? summary(name)
      add(group, row)
      map.set(name, group)
    }
  }
  return {
    total,
    stages: [...stages.values()],
    months: [...months.values()].sort((a, b) => a.name.localeCompare(b.name)),
    owners: [...owners.values()].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)),
  }
}
