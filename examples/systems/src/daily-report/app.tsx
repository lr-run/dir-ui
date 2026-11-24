// Daily and weekly reports: members write a short report each day, the team reads the feed and leads
// check the weekly summary. Reports belong to projects, projects to teams.
import {
  BarChart3Icon,
  FileTextIcon,
  FolderKanbanIcon,
  NotebookPenIcon,
  PenLineIcon,
  RssIcon,
  UsersIcon,
} from 'lucide-react'
import { KitApp } from '@/components/systems/kit/app.tsx'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitConfig, KitObject, KitRecord } from '@/components/systems/kit/types.ts'
import { FeedPage, WriteAction } from '@/components/systems/daily-report/feed.tsx'
import { WeeklyPage } from '@/components/systems/daily-report/weekly.tsx'
import { WritePage } from '@/components/systems/daily-report/write.tsx'
import { ReviewActions } from '@/components/systems/daily-report/review.tsx'
import {
  isWeekend,
  me,
  memberName,
  moods,
  projectStatus,
  reviews,
  shortDate,
  users,
} from '@/components/systems/daily-report/data.ts'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const newest = { field: 'date', direction: 'desc' } as const
const reports: KitObject = {
  id: 'reports',
  title: 'Reports',
  singular: 'Report',
  nameLabel: 'Report',
  icon: <FileTextIcon {...icon} />,
  // New opens the Write page, so a report is always written with its validation and locked submit.
  createPath: '/write',
  // Filters compare display labels: the author's name and the review option's label.
  views: [
    { id: 'all', name: 'All reports', sorts: [newest] },
    {
      id: 'mine',
      name: 'Mine',
      sorts: [newest],
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'mine', field: 'author', operator: 'eq', value: memberName(me) }],
      },
    },
    {
      id: 'follow-up',
      name: 'Needs follow-up',
      sorts: [newest],
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'follow-up', field: 'status', operator: 'in', value: ['Needs follow-up'] }],
      },
    },
    {
      id: 'recent',
      name: 'Last 7 days',
      sorts: [newest],
      filter: {
        conjunction: 'and',
        conditions: [{
          id: 'recent',
          field: 'date',
          operator: 'relative',
          value: { direction: 'past', amount: 1, unit: 'week' },
        }],
      },
    },
  ],
  detail: { actions: (context) => <ReviewActions {...context} /> },
  fields: [
    { key: 'date', label: 'Date', type: 'date', width: 130, required: true },
    { key: 'author', label: 'Author', type: 'member', options: users, width: 160, required: true },
    { key: 'project', label: 'Project', type: 'reference', reference: 'projects', width: 200 },
    { key: 'status', label: 'Review', type: 'choice', options: reviews, width: 160 },
    { key: 'mood', label: 'Condition', type: 'choice', options: moods, width: 130 },
    { key: 'hours', label: 'Hours', type: 'number', width: 90 },
    { key: 'done', label: 'What I did', type: 'longtext', hideInList: true },
    { key: 'plans', label: 'Plans for tomorrow', type: 'longtext', hideInList: true },
    { key: 'blockers', label: 'Blockers', type: 'longtext', hideInList: true },
  ],
}
const projects: KitObject = {
  id: 'projects',
  title: 'Projects',
  singular: 'Project',
  icon: <FolderKanbanIcon {...icon} />,
  fields: [
    { key: 'status', label: 'Status', type: 'choice', options: projectStatus, width: 120 },
    { key: 'team', label: 'Team', type: 'reference', reference: 'teams', width: 170 },
    { key: 'client', label: 'Client', type: 'text', width: 190 },
    { key: 'lead', label: 'Lead', type: 'member', options: users, width: 160 },
    { key: 'due', label: 'Due', type: 'date', width: 130 },
    { key: 'budgetHours', label: 'Budget (hours)', type: 'number', width: 130 },
    { key: 'summary', label: 'Summary', type: 'longtext', hideInList: true },
  ],
}
const teams: KitObject = {
  id: 'teams',
  title: 'Teams',
  singular: 'Team',
  icon: <UsersIcon {...icon} />,
  fields: [
    { key: 'manager', label: 'Manager', type: 'member', options: users, width: 160 },
    { key: 'location', label: 'Office', type: 'text', width: 150 },
    { key: 'channel', label: 'Channel', type: 'text', width: 170 },
  ],
}

const teamSeed = [
  { id: 't1', name: 'Product', manager: 'u1', location: 'Tokyo · Shibuya', channel: '#product-daily' },
  { id: 't2', name: 'Field sales', manager: 'u4', location: 'Osaka · Umeda', channel: '#sales-daily' },
  { id: 't3', name: 'Customer success', manager: 'u6', location: 'Tokyo · Shibuya', channel: '#cs-daily' },
]
const memberTeam: Record<string, string> = {
  u1: 't1',
  u2: 't1',
  u3: 't1',
  u8: 't1',
  u4: 't2',
  u5: 't2',
  u6: 't3',
  u7: 't3',
}
const projectSeed = [
  ['p1', 'Order portal renewal', 't1', 'Hokuto Logistics', 'u1', 'active', 'Rebuild the B2B ordering portal'],
  ['p2', 'Mobile check-in app', 't1', 'Sakura Hotels', 'u2', 'active', 'Guest check-in on iOS and Android'],
  ['p3', 'Billing migration', 't1', 'Internal', 'u8', 'paused', 'Move invoicing to the new billing service'],
  ['p4', 'Kansai territory push', 't2', 'Internal', 'u4', 'active', 'New accounts in Osaka, Kyoto and Kobe'],
  ['p5', 'Interop Tokyo booth', 't2', 'Internal', 'u5', 'active', 'Trade show leads and follow-up'],
  ['p6', 'Retail chain rollout', 't3', 'Minato Retail', 'u6', 'active', 'Roll out to 48 stores in three waves'],
  ['p7', 'Onboarding playbook', 't3', 'Internal', 'u7', 'done', 'A standard first 30 days for new customers'],
  ['p8', 'Support backlog cleanup', 't3', 'Internal', 'u6', 'active', 'Close tickets older than 30 days'],
] as const
const work: Record<string, { done: string[]; plans: string[]; blockers: string[] }> = {
  t1: {
    done: [
      'Finished the order history screen and opened a pull request.',
      'Paired with Aya on the date picker bug; the fix is in review.',
      'Ran the sprint review and collected feedback from the client.',
      'Wrote API tests for the cart endpoints; coverage is now 82%.',
      'Cleaned up the design tokens and removed three unused colors.',
      'Reviewed four pull requests and merged two.',
      'Investigated slow search queries; an index on SKU cut it to 40 ms.',
    ],
    plans: [
      'Start the checkout flow and agree the edge cases with QA.',
      'Address review comments and merge the order history screen.',
      'Demo the check-in flow to Sakura Hotels on Thursday.',
      'Write the release notes for version 2.4.',
      'Pair with Riku on the billing data export.',
    ],
    blockers: [
      'Waiting for staging credentials from the client since Tuesday.',
      'The payment sandbox is down; cannot test refunds.',
      'Design for the empty states is not final yet.',
    ],
  },
  t2: {
    done: [
      'Visited three prospects in Umeda; two asked for a quote.',
      'Sent proposals to Kobe Marine and Kyoto Textiles.',
      'Called back twelve trade show leads; booked four meetings.',
      'Updated the pipeline and closed one deal worth ¥1,200,000.',
      'Prepared the booth layout and ordered brochures.',
    ],
    plans: [
      'Follow up on the Kobe Marine proposal.',
      'Book demos for the four trade show leads.',
      'Prepare the monthly forecast for the sales meeting.',
      'Visit Namba Foods with Yuna.',
    ],
    blockers: [
      'Pricing for the enterprise plan is still not approved.',
      'The demo account expired; need a new one from Product.',
    ],
  },
  t3: {
    done: [
      'Onboarded wave 2 stores; 14 of 16 are live.',
      'Closed 23 support tickets, nine of them older than 30 days.',
      'Held the monthly check-in with Minato Retail.',
      'Recorded two how-to videos for the onboarding playbook.',
      'Triaged the morning queue and escalated one outage.',
    ],
    plans: [
      'Schedule wave 3 training with the store managers.',
      'Close the remaining backlog tickets from September.',
      'Draft the quarterly health report for Minato Retail.',
      'Review the new macros with Hana.',
    ],
    blockers: [
      'Two stores still have no network access for the terminals.',
      'The ticket export keeps timing out for large date ranges.',
    ],
  },
}

/** About `count` reports on past weekdays, newest first; each member writes most days. */
function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 11)
  const teamRecords = teamSeed.map(({ id, name, ...values }) => record(id, name, values, 600))
  const projectRecords = projectSeed.map(([id, name, team, client, lead, status, summary]) =>
    record(id, name, {
      team,
      client,
      lead,
      status,
      summary,
      due: day(r.int(10, 120)),
      budgetHours: r.int(8, 60) * 10,
    }, r.int(60, 240))
  )
  const reportRecords: KitRecord[] = []
  // Monday 2 November 2026 has just started, so the newest reports are from Friday 30 October.
  for (let offset = 1; reportRecords.length < count; offset++) {
    const date = day(-offset)
    if (isWeekend(date)) continue
    for (const user of users) {
      if (reportRecords.length >= count) break
      if (r.next() < 0.1) continue
      const team = memberTeam[user.value]!
      const options = projectRecords.filter((project) => project.values.team === team)
      const project = r.pick(options)
      const lines = work[team]!
      const first = r.pick(lines.done)
      const second = r.pick(lines.done.filter((line) => line !== first))
      const blocked = r.next() < 0.22
      const moodRoll = r.next()
      const mood = blocked
        ? r.pick(['okay', 'tired', 'struggling'])
        : moodRoll < 0.3
        ? 'great'
        : moodRoll < 0.75
        ? 'good'
        : moodRoll < 0.92
        ? 'okay'
        : 'tired'
      const posted = `${date}T${String(r.int(8, 11)).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}:00.000Z`
      reportRecords.push({
        id: `r${reportRecords.length + 1}`,
        name: `${user.label} · ${shortDate(date)}`,
        createdAt: posted,
        updatedAt: posted,
        archivedAt: null,
        values: {
          date,
          author: user.value,
          project: project.id,
          status: offset <= 3 ? 'submitted' : blocked && r.next() < 0.4 ? 'follow-up' : 'reviewed',
          mood,
          hours: r.int(12, 20) / 2,
          done: `${first} ${second}`,
          plans: r.pick(lines.plans),
          blockers: blocked ? r.pick(lines.blockers) : '',
        },
      })
    }
  }
  return { reports: reportRecords, projects: projectRecords, teams: teamRecords }
}

export const dailyReport: KitConfig = {
  id: 'daily-report',
  brand: { name: 'Daily reports', mark: <NotebookPenIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [reports, projects, teams],
  pages: [
    {
      id: 'write',
      label: 'Write',
      title: 'Daily report',
      icon: <PenLineIcon {...icon} />,
      render: (context) => <WritePage {...context} />,
    },
    {
      id: 'feed',
      label: 'Team feed',
      icon: <RssIcon {...icon} />,
      actions: (context) => <WriteAction {...context} />,
      render: (context) => <FeedPage {...context} />,
    },
    {
      id: 'weekly',
      label: 'Weekly',
      title: 'Weekly summary',
      icon: <BarChart3Icon {...icon} />,
      render: (context) => <WeeklyPage {...context} />,
    },
  ],
  navigation: [{ items: ['write', 'feed', 'weekly', 'reports', 'projects'] }],
  home: '/feed',
  users,
  me,
  seed,
}
export function DailyReportApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={dailyReport} layout='page' count={count} basePath={basePath} />
}
