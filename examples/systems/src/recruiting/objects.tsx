// Recruiting objects: candidates move through stages toward a position, and interviews record each round.
import { BriefcaseIcon, CalendarCheckIcon, UsersIcon } from 'lucide-react'
import type { RecordFilter } from '@/lib/query.ts'
import { day } from '@/components/systems/kit/seed.ts'
import type { KitObject } from '@/components/systems/kit/types.ts'

export const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
/** The signed-in recruiter; new candidates start assigned to them. */
export const me = 'u1'
/** The fixtures are dated from 2 November 2026, so "today" is that day rather than the clock. */
export const today = day(0)
export const users = [
  { value: 'u1', label: 'Mika Sato' },
  { value: 'u2', label: 'Ken Ito' },
  { value: 'u3', label: 'Aya Mori' },
  { value: 'u4', label: 'Daichi Kato' },
  { value: 'u5', label: 'Yuna Hayashi' },
  { value: 'u6', label: 'Sho Nakamura' },
]
export const stages = [
  { value: 'applied', label: 'Applied', color: 'var(--ui-muted)' },
  { value: 'screening', label: 'Screening', color: 'var(--ui-blue)' },
  { value: 'interview', label: 'Interview', color: 'var(--ui-violet)' },
  { value: 'offer', label: 'Offer', color: 'var(--ui-amber)' },
  { value: 'hired', label: 'Hired', color: 'var(--ui-green)' },
  { value: 'rejected', label: 'Rejected', color: 'var(--ui-red)' },
]
/** Stages a candidate is still moving through; hired and rejected are closed. */
export const activeStages = ['applied', 'screening', 'interview', 'offer']
const label = (value: string) => stages.find((stage) => stage.value === value)!.label
/** A saved view filter on stage; view filters compare option labels. */
const stageIn = (values: string[]): RecordFilter => ({
  conjunction: 'and',
  conditions: [{ id: 'stage', field: 'stage', operator: 'in', value: values.map(label) }],
})
export const sources = ['Referral', 'Careers site', 'LinkedIn', 'Job board', 'Agency', 'Event'].map((label) => ({
  value: label.toLowerCase().replace(/\s+/g, '-'),
  label,
}))
export const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Corporate'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))
export const positionStatus = [
  { value: 'open', label: 'Open', color: 'var(--ui-green)' },
  { value: 'hold', label: 'On hold', color: 'var(--ui-amber)' },
  { value: 'filled', label: 'Filled', color: 'var(--ui-blue)' },
  { value: 'closed', label: 'Closed', color: 'var(--ui-muted)' },
]
export const locations = ['Tokyo', 'Osaka', 'Fukuoka', 'Remote'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))
export const rounds = ['Phone screen', 'Technical', 'Team', 'Final'].map((label) => ({
  value: label.toLowerCase().replace(/\s+/g, '-'),
  label,
}))
export const results = [
  { value: 'scheduled', label: 'Scheduled', color: 'var(--ui-blue)' },
  { value: 'passed', label: 'Passed', color: 'var(--ui-green)' },
  { value: 'failed', label: 'Not passed', color: 'var(--ui-red)' },
  { value: 'no-show', label: 'No-show', color: 'var(--ui-amber)' },
  { value: 'cancelled', label: 'Cancelled', color: 'var(--ui-muted)' },
]

export const candidates: KitObject = {
  id: 'candidates',
  title: 'Candidates',
  singular: 'Candidate',
  nameLabel: 'Candidate',
  icon: <UsersIcon {...icon} />,
  fields: [
    {
      key: 'stage',
      label: 'Stage',
      type: 'choice',
      options: stages,
      width: 130,
      confirm: {
        rejected: {
          title: 'Reject this candidate?',
          description: 'They leave the active pipeline and the stalled list. You can move them back to a stage later.',
          action: 'Reject candidate',
        },
      },
    },
    { key: 'position', label: 'Position', type: 'reference', reference: 'positions', width: 210, required: true },
    { key: 'recruiter', label: 'Recruiter', type: 'member', options: users, width: 150 },
    { key: 'source', label: 'Source', type: 'choice', options: sources, width: 130 },
    { key: 'appliedAt', label: 'Applied', type: 'date', width: 130 },
    { key: 'lastContactAt', label: 'Last contact', type: 'date', width: 130 },
    { key: 'expectedSalary', label: 'Expected salary', type: 'money', width: 150 },
    { key: 'company', label: 'Current company', type: 'text', width: 180 },
    { key: 'email', label: 'Email', type: 'email', width: 220, hideInList: true },
    { key: 'phone', label: 'Phone', type: 'tel', width: 140, hideInList: true },
  ],
  views: [
    {
      id: 'active',
      name: 'Active pipeline',
      filter: stageIn(activeStages),
      sorts: [{ field: 'appliedAt', direction: 'desc' }],
    },
    {
      id: 'interviewing',
      name: 'Interviewing',
      filter: stageIn(['screening', 'interview']),
      sorts: [{ field: 'lastContactAt', direction: 'asc' }],
    },
    { id: 'offers', name: 'Offers', filter: stageIn(['offer']) },
    { id: 'hired', name: 'Hired', filter: stageIn(['hired']), sorts: [{ field: 'appliedAt', direction: 'desc' }] },
    { id: 'all', name: 'All candidates', sorts: [{ field: 'appliedAt', direction: 'desc' }] },
  ],
  defaults: () => ({ stage: 'applied', appliedAt: today, lastContactAt: today, recruiter: me }),
}
export const positions: KitObject = {
  id: 'positions',
  title: 'Positions',
  singular: 'Position',
  nameLabel: 'Position',
  icon: <BriefcaseIcon {...icon} />,
  fields: [
    { key: 'department', label: 'Department', type: 'choice', options: departments, width: 130 },
    { key: 'status', label: 'Status', type: 'choice', options: positionStatus, width: 120 },
    { key: 'manager', label: 'Hiring manager', type: 'member', options: users, width: 160 },
    { key: 'openings', label: 'Openings', type: 'number', width: 110 },
    { key: 'location', label: 'Location', type: 'choice', options: locations, width: 120 },
    { key: 'salaryMax', label: 'Salary up to', type: 'money', width: 140 },
    { key: 'openedAt', label: 'Opened', type: 'date', width: 130 },
    { key: 'description', label: 'Description', type: 'longtext', hideInList: true },
  ],
}
export const interviews: KitObject = {
  id: 'interviews',
  title: 'Interviews',
  singular: 'Interview',
  nameLabel: 'Interview',
  detail: { compactHeader: true },
  icon: <CalendarCheckIcon {...icon} />,
  fields: [
    { key: 'candidate', label: 'Candidate', type: 'reference', reference: 'candidates', width: 190, required: true },
    { key: 'round', label: 'Round', type: 'choice', options: rounds, width: 130 },
    { key: 'interviewer', label: 'Interviewer', type: 'member', options: users, width: 150 },
    { key: 'scheduledAt', label: 'Scheduled', type: 'datetime', width: 170 },
    { key: 'result', label: 'Result', type: 'choice', options: results, width: 130 },
    { key: 'feedback', label: 'Feedback', type: 'longtext', hideInList: true },
  ],
  views: [
    {
      id: 'upcoming',
      name: 'Upcoming',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'result', field: 'result', operator: 'in', value: ['Scheduled'] }],
      },
      sorts: [{ field: 'scheduledAt', direction: 'asc' }],
    },
    { id: 'all', name: 'All interviews', sorts: [{ field: 'scheduledAt', direction: 'desc' }] },
  ],
  defaults: () => ({ scheduledAt: `${day(1)}T10:00`, interviewer: me, result: 'scheduled' }),
}
