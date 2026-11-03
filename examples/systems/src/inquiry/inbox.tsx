// The inbox overview: open work and SLA risk at a glance, the tickets to answer next and where volume comes from.
import { PlusIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartFrame } from '@/components/charts/chart-frame.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import type { KitPageContext, KitRow } from '@/components/systems/kit/types.ts'
import { channels, shortDate, slaStatus, today, unresolved } from '@/components/systems/inquiry/objects.tsx'

const daysFromToday = (date: string) => Math.round((Date.parse(date) - Date.parse(today)) / 86400000)
const dueText = (date: string) => {
  if (!date) return 'no SLA due date'
  const days = daysFromToday(date)
  return days === 0
    ? 'due today'
    : days < 0
    ? `${-days} ${days === -1 ? 'day' : 'days'} overdue`
    : `due ${shortDate(date)}`
}
const slaRank: Record<string, number> = { 'at-risk': 0, breached: 1, 'on-track': 2 }
const priorityRank: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }
const chartConfig = {
  open: { label: 'Open', color: 'var(--chart-primary, var(--ui-primary))' },
  done: { label: 'Resolved or closed', color: 'var(--chart-secondary, var(--ui-green))' },
}
const axis = { fill: 'var(--chart-muted, var(--ui-muted))', fontSize: 12 }

export function Inbox({ store, openRecord }: KitPageContext) {
  const live = store.rows.tickets!.filter((row) => !row.archivedAt)
  const values = (row: KitRow) => row.record.values
  const open = live.filter((row) => unresolved.has(String(values(row).status)))
  const atRisk = open.filter((row) => values(row).sla === 'at-risk')
  const breached = open.filter((row) => values(row).sla === 'breached')
  // Tickets resolved in this session count as resolved today, next to the fixtures resolved today.
  const resolvedNow = new Set(
    store.state.history.filter((change) => change.objectId === 'tickets' && change.changes.Status?.after === 'Resolved')
      .map((change) => change.recordId),
  )
  const resolved = live.filter((row) => values(row).status === 'resolved' || values(row).status === 'closed')
  const resolvedToday = resolved.filter((row) => values(row).resolvedAt === today || resolvedNow.has(row.id))
  const resolvedWeek = resolved.filter((row) =>
    resolvedNow.has(row.id) || (!!values(row).resolvedAt && daysFromToday(String(values(row).resolvedAt)) > -7)
  )
  const attention = open.filter((row) => values(row).sla !== 'on-track' || values(row).priority === 'urgent')
    .sort((a, b) =>
      slaRank[String(values(a).sla)]! - slaRank[String(values(b).sla)]! ||
      String(values(a).slaDue).localeCompare(String(values(b).slaDue)) ||
      priorityRank[String(values(a).priority)]! - priorityRank[String(values(b).priority)]!
    )
  const byChannel = channels.map((channel) => {
    const rows = live.filter((row) => values(row).channel === channel.value)
    const openCount = rows.filter((row) => unresolved.has(String(values(row).status))).length
    return { label: channel.label, open: openCount, done: rows.length - openCount }
  })
  const mine = open.filter((row) => values(row).assignee === 'u1').length
  return (
    <DashboardBody>
      <StatGrid
        stats={[
          [
            'Open',
            String(open.length),
            `${open.filter((row) => values(row).status === 'new').length} new · ${mine} assigned to you`,
          ],
          ['SLA at risk', String(atRisk.length), 'Due today'],
          ['SLA breached', String(breached.length), 'Past the SLA due date'],
          ['Resolved today', String(resolvedToday.length), `${resolvedWeek.length} in the last 7 days`],
        ]}
      />
      <DashboardColumns>
        <DashboardPanel title='Needs attention' description='SLA at risk first, then breached and urgent tickets'>
          <DashboardList
            empty={live.length ? 'Every open ticket is on track.' : 'No tickets have come in yet.'}
            rows={attention.slice(0, 7).map((row) => ({
              id: row.id,
              title: row.name,
              detail: [
                values(row).ref,
                row.customer,
                `${row.priority} priority`,
                dueText(String(values(row).slaDue ?? '')),
              ].filter(Boolean).join(' · '),
              trailing: <ChoiceContent item={slaStatus.find((s) => s.value === values(row).sla)!} compact />,
              onOpen: () => openRecord('tickets', row.id),
            }))}
          />
        </DashboardPanel>
        <DashboardPanel title='Volume by channel' description='Tickets received in the last 30 days'>
          <div className='px-3 pb-4'>
            <ChartFrame
              height={240}
              config={chartConfig}
              empty={!live.length}
              label={`Tickets by channel: ${
                byChannel.map((row) => `${row.label} ${row.open} open, ${row.done} resolved or closed`).join('; ')
              }`}
            >
              <BarChart data={byChannel} margin={{ top: 12, right: 12, bottom: 0, left: 0 }} accessibilityLayer>
                <CartesianGrid vertical={false} stroke='var(--chart-grid, var(--ui-border))' />
                <XAxis dataKey='label' tick={axis} tickLine={false} axisLine={false} dy={4} interval={0} />
                <YAxis tick={axis} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--ui-hover)' }} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey='open'
                  stackId='tickets'
                  fill='var(--color-open)'
                  maxBarSize={42}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey='done'
                  stackId='tickets'
                  fill='var(--color-done)'
                  maxBarSize={42}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartFrame>
          </div>
        </DashboardPanel>
      </DashboardColumns>
    </DashboardBody>
  )
}

/** The Inbox's primary action opens the same full-page form as the New button on the ticket list. */
export function NewTicket({ navigate }: KitPageContext) {
  return (
    <Button variant='default' onClick={() => navigate('/new-ticket')}>
      <PlusIcon aria-hidden='true' />New ticket
    </Button>
  )
}
