export type Status = 'backlog' | 'todo' | 'progress' | 'review' | 'done' | 'canceled'
export type Task = {
  id: string
  title: string
  description: string
  status: Status
  priority: string
  owner: string
  project: string
  due: string
  label: string
  activity: string[]
  comments: { author: string; text: string }[]
}
export const statuses: { value: Status; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'var(--ui-muted)' },
  { value: 'todo', label: 'Todo', color: 'var(--ui-muted)' },
  { value: 'progress', label: 'In progress', color: 'var(--ui-amber)' },
  { value: 'review', label: 'In review', color: 'var(--ui-violet)' },
  { value: 'done', label: 'Done', color: 'var(--ui-blue)' },
  { value: 'canceled', label: 'Canceled', color: 'var(--ui-muted)' },
]
export const owners = ['Unassigned', 'Alex Morgan', 'Jordan Lee', 'Sam Taylor']
export const priorities = ['No priority', 'Urgent', 'High', 'Medium', 'Low']
export const projects = ['Website launch', 'Platform', 'Mobile app']
const titles = [
  'Design the new onboarding experience',
  'Create empty states for every workspace',
  'Polish the issue detail panel',
  'Review the first-run experience',
  'Ship keyboard navigation for boards',
  'Update the component documentation',
  'Build the project overview page',
  'Improve search and filter performance',
  'Add loading skeletons to the dashboard',
  'Prepare the launch announcement',
  'Audit mobile navigation and touch targets',
  'Review accessibility of form controls',
  'Unify button labels across the product',
  'Add activity history to issues',
  'Finalize the illustration library',
  'Fix the invite flow on mobile',
]
export function seedTasks(count: number): Task[] {
  const sequence: Status[] = [
    'todo',
    'todo',
    'progress',
    'review',
    'done',
    'todo',
    'progress',
    'done',
    'review',
    'backlog',
  ]
  return Array.from({ length: Math.max(0, Math.min(1000, count)) }, (_, index) => ({
    id: `TASK-${index + 12}`,
    title: titles[index % titles.length]! +
      (index >= titles.length ? ` · ${Math.floor(index / titles.length) + 1}` : ''),
    description:
      'Make the experience clear, consistent, and easy to use.\n\nScope\n• Follow the existing design system and semantic tokens.\n• Include loading, empty, and error states.\n• Verify the experience on desktop and mobile.\n\nDone when the implementation has been reviewed and the acceptance checks pass.',
    status: sequence[index % sequence.length]!,
    priority: priorities[1 + index % 4]!,
    owner: owners[1 + index % (owners.length - 1)]!,
    project: projects[Math.floor(index / 6) % projects.length]!,
    due: `2026-11-${String(13 + index % 15).padStart(2, '0')}`,
    label: ['Design', 'Product', 'Engineering'][index % 3]!,
    activity: ['Sam Taylor created this issue.', 'Added to the November product cycle.'],
    comments: index % 3 === 0
      ? [{
        author: 'Sam Taylor',
        text: 'The first pass is ready. Please check the empty and error states as part of the review.',
      }]
      : [],
  }))
}
export function filterTasks(tasks: Task[], search: string, view: string, owner: string, project: string): Task[] {
  const query = search.trim().toLowerCase()
  return tasks.filter((task) =>
    (!query || `${task.id} ${task.title} ${task.label}`.toLowerCase().includes(query)) &&
    (!owner || task.owner === owner) && (!project || task.project === project) &&
    (view === 'all' ||
      (view === 'backlog' ? task.status === 'backlog' : !['backlog', 'done', 'canceled'].includes(task.status)))
  )
}
export function moveTask(tasks: Task[], id: string, status: Status): Task[] {
  return tasks.map((task) =>
    task.id === id && task.status !== status
      ? {
        ...task,
        status,
        activity: [
          ...task.activity,
          `Moved from ${statuses.find((item) => item.value === task.status)!.label} to ${
            statuses.find((item) => item.value === status)!.label
          }.`,
        ],
      }
      : task
  )
}
