// Weekly summary: one tab per recent week with headline numbers, reports and hours charts, the blockers raised and
// who has not posted yet.
import { HorizontalBars } from '@/components/charts/index.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import type { KitPageContext, KitRow } from '@/components/systems/kit/types.ts'
import {
  addDays,
  choice,
  mondayOf,
  newestFirst,
  reviews,
  shortDate,
  today,
  users,
  values,
  weekLabel,
} from '@/components/systems/daily-report/data.ts'

export function WeeklyPage(context: KitPageContext) {
  const reports = newestFirst(context.store.rows.reports!)
  // The newest week with a report, so the summary opens on real data; today when nothing is posted yet.
  const latest = String(reports[0] ? values(reports[0]).date : today())
  const anchor = mondayOf(latest)
  const weeks = [0, 1, 2, 3].map((index) => addDays(anchor, -7 * index))
  return (
    <Tabs key={anchor} defaultValue={anchor} className='flex min-h-0 flex-1 flex-col gap-0'>
      <div className='shrink-0 overflow-x-auto border-b border-border px-6 max-[600px]:px-2'>
        <TabsList
          aria-label='Week'
          className='h-10 p-0 [&_[data-slot=tabs-trigger]]:flex-none [&_[data-slot=tabs-trigger]]:px-2.5'
        >
          {weeks.map((week, index) => (
            <TabsTrigger key={week} value={week}>
              {index === 0 && anchor === mondayOf(today()) ? 'This week' : weekLabel(week)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {weeks.map((week) => (
        <TabsContent key={week} value={week} className='flex min-h-0 flex-1 flex-col'>
          <Week {...context} reports={reports} week={week} latest={latest} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function Week({ reports, week, latest, store, openRecord }: KitPageContext & {
  reports: KitRow[]
  week: string
  latest: string
}) {
  const friday = addDays(week, 4)
  const rows = reports.filter((row) => String(values(row).date) >= week && String(values(row).date) <= friday)
  // Working days that have already happened, so a week in progress is not counted as missing reports.
  const days = [0, 1, 2, 3, 4].map((index) => addDays(week, index)).filter((date) =>
    date <= (latest > today() ? latest : today())
  )
  const expected = users.length * days.length
  const hours = rows.reduce((sum, row) => sum + Number(values(row).hours ?? 0), 0)
  const blocked = rows.filter((row) => String(values(row).blockers ?? '').trim())
  const good = rows.filter((row) => ['great', 'good'].includes(String(values(row).mood))).length
  const perMember = users.map((user) => ({
    label: user.label,
    value: rows.filter((row) => values(row).author === user.value).length,
  }))
  const projects = (store.state.records.projects ?? []).map((project) => ({
    label: project.name,
    value: rows.filter((row) => values(row).project === project.id)
      .reduce((sum, row) => sum + Number(values(row).hours ?? 0), 0),
  })).filter((project) => project.value > 0).sort((a, b) => b.value - a.value)
  const missing = users.map((user) => ({
    user,
    dates: days.filter((date) => !rows.some((row) => values(row).author === user.value && values(row).date === date)),
  })).filter((entry) => entry.dates.length)
  return (
    <DashboardBody>
      <StatGrid
        stats={[
          ['Reports posted', String(rows.length), expected ? `of ${expected} expected` : 'week not started'],
          [
            'Hours logged',
            `${hours.toLocaleString('en-US')} h`,
            rows.length ? `${(hours / rows.length).toFixed(1)} h per report` : 'no reports yet',
          ],
          [
            'Blockers raised',
            String(blocked.length),
            `${blocked.filter((row) => values(row).status === 'follow-up').length} need follow-up`,
          ],
          ['Feeling good', rows.length ? `${Math.round((good / rows.length) * 100)}%` : '—', 'great or good'],
        ]}
      />
      <DashboardColumns>
        <DashboardPanel title='Reports per member' description={`${days.length} working days so far`}>
          <div className='px-3 pb-4'>
            <HorizontalBars values={rows.length ? perMember : []} format='number' height={264} labelWidth={128} />
          </div>
        </DashboardPanel>
        <DashboardPanel title='Blockers' description='Newest first; open a report to follow up'>
          <DashboardList
            empty='Nobody reported a blocker this week.'
            rows={blocked.slice(0, 6).map((row) => ({
              id: row.id,
              title: String(values(row).blockers),
              detail: `${row.author} · ${shortDate(String(values(row).date))} · ${row.project}`,
              trailing: choice(reviews, values(row).status) && (
                <ChoiceContent item={choice(reviews, values(row).status)!} compact />
              ),
              onOpen: () => openRecord('reports', row.id),
            }))}
          />
        </DashboardPanel>
      </DashboardColumns>
      <DashboardColumns>
        <DashboardPanel title='Hours by project' description='Hours from this week’s reports'>
          <div className='px-3 pb-4'>
            <HorizontalBars
              values={projects}
              format='number'
              height={Math.max(140, projects.length * 32 + 24)}
              labelWidth={150}
            />
          </div>
        </DashboardPanel>
        <DashboardPanel title='Missing reports' description='Working days without a report'>
          {missing.length
            ? (
              <List className='border-t border-border px-3'>
                {missing.map(({ user, dates }) => (
                  <ListItem
                    key={user.value}
                    title={user.label}
                    description={dates.map(shortDate).join(', ')}
                    trailing={
                      <span className='shrink-0 text-[12px] text-muted-foreground tabular-nums'>
                        {days.length - dates.length} of {days.length}
                      </span>
                    }
                  />
                ))}
              </List>
            )
            : <p className='m-0 px-5 pb-5 text-[13px] text-muted-foreground'>Everyone has posted every day.</p>}
        </DashboardPanel>
      </DashboardColumns>
    </DashboardBody>
  )
}
