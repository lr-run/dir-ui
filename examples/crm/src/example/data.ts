import type { CrmRecord, ExampleKind, ExampleRecord, Stage, User } from '@/components/crm/types.ts'
import type { QueryField } from '@/lib/query.ts'
export const owners = ['Alex Morgan', 'Jordan Lee', 'Sam Taylor']
export const users: User[] = owners.map((name, i) => ({
  id: `user-${i + 1}`,
  name,
  email: `member${i + 1}@example.com`,
  isActive: true,
}))
export const stages: Stage[] = ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map((name, i) => ({
  id: `stage-${i + 1}`,
  name,
  sortOrder: i,
  status: i === 3 ? 'won' : i === 4 ? 'lost' : 'open',
}))
export const taskStatuses = [{ value: 'todo', label: 'To do' }, { value: 'in_progress', label: 'In progress' }, {
  value: 'done',
  label: 'Done',
}, { value: 'cancelled', label: 'Cancelled' }] as const
export const examples = {
  companies: { title: 'Companies', singular: 'Company', statuses: [] },
  people: { title: 'People', singular: 'Person', statuses: [] },
  deals: { title: 'Deals', singular: 'Deal', statuses: stages.map((s) => s.name) },
  tasks: { title: 'Tasks', singular: 'Task', statuses: taskStatuses.map((s) => s.label) },
} as const
export const fieldLabels: Record<string, string> = {
  name: 'Name',
  ownerId: 'Owner',
  companyId: 'Company',
  stageId: 'Stage',
  amount: 'Amount',
  currency: 'Currency',
  expectedCloseDate: 'Expected close',
  closedAt: 'Closed at',
  nextAction: 'Next action',
  assigneeId: 'Assignee',
  dueAt: 'Due',
  completedAt: 'Completed at',
  dealId: 'Deal',
  personId: 'Person',
  archivedAt: 'Archived',
  occurredAt: 'Occurred at',
  createdBy: 'Created by',
  isActive: 'Active',
  sortOrder: 'Order',
  body: 'Body',
  type: 'Type',
  status: 'Status',
  email: 'Email',
  website: 'Website',
  industry: 'Industry',
  department: 'Department',
  title: 'Title',
  phone: 'Phone',
}
export function sampleEntities(kind: ExampleKind, count = 5): CrmRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const base = {
      id: `${kind}-${i + 1}`,
      name: '',
      createdAt: '2026-09-28T10:00:00Z',
      updatedAt: '2026-09-28T10:00:00Z',
      version: 1,
      archivedAt: null,
    }
    const companyName = ['Acme Studio', 'Northstar', 'Linear Labs', 'Summit', 'Orbit'][i % 5]! +
      (i >= 5 ? ` ${Math.floor(i / 5) + 1}` : '')
    if (kind === 'companies') {
      return {
        ...base,
        kind,
        name: companyName,
        ownerId: users[i % 3]!.id,
        industry: ['Software', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'][i % 5]!,
        website: `https://company${i + 1}.example`,
      }
    }
    if (kind === 'people') {
      return {
        ...base,
        kind,
        name: ['Alex Morgan', 'Jordan Lee', 'Sam Taylor', 'Riley Chen', 'Casey Kim'][i % 5]! +
          (i >= 5 ? ` ${Math.floor(i / 5) + 1}` : ''),
        companyId: `companies-${i + 1}`,
        department: ['Sales', 'Product', 'Engineering'][i % 3]!,
        title: ['Director', 'Manager', 'Lead'][i % 3]!,
        email: `contact${i + 1}@example.com`,
        phone: `+1 415 555 ${String(100 + i).padStart(4, '0')}`,
      }
    }
    if (kind === 'deals') {
      return {
        ...base,
        kind,
        name: `${companyName} · Enterprise`,
        companyId: `companies-${i + 1}`,
        ownerId: users[i % 3]!.id,
        stageId: stages[i % 5]!.id,
        amount: i % 7 === 6 ? null : String([24000, 48000, 12000, 8000, 36000][i % 5]) + '.00',
        currency: 'USD',
        expectedCloseDate: `2026-${10 + i % 3}-${String(1 + i % 28).padStart(2, '0')}`,
        closedAt: i % 5 >= 3 ? '2026-09-28T10:00:00Z' : null,
        nextAction: 'Schedule a follow-up',
      }
    }
    return {
      ...base,
      kind,
      name: `Follow up with ${companyName}`,
      companyId: `companies-${i + 1}`,
      dealId: `deals-${i + 1}`,
      personId: `people-${i + 1}`,
      assigneeId: users[i % 3]!.id,
      dueAt: `2026-10-${String(1 + i % 28).padStart(2, '0')}T15:00:00Z`,
      status: taskStatuses[i % 4]!.value,
      completedAt: i % 4 === 2 ? '2026-09-28T10:00:00Z' : null,
    }
  })
}
export function projectRecord(
  record: CrmRecord,
  records: readonly CrmRecord[],
  members: readonly User[] = users,
  dealStages: readonly Stage[] = stages,
  labels?: ReadonlyMap<string, string>,
): ExampleRecord {
  const find = (id: string) => labels?.get(id) ?? records.find((r) => r.id === id)?.name ?? id
  const member = (id: string) => members.find((u) => u.id === id)?.name ?? id
  const stage = record.kind === 'deals' ? dealStages.find((s) => s.id === record.stageId) : undefined
  return {
    ...record,
    data: record,
    domain: record.kind === 'companies' ? record.website : '',
    company: 'companyId' in record ? find(record.companyId) : '',
    owner: 'ownerId' in record ? member(record.ownerId) : record.kind === 'tasks' ? member(record.assigneeId) : '',
    status: stage?.name ?? (record.kind === 'tasks' ? taskStatuses.find((s) => s.value === record.status)!.label : ''),
    email: record.kind === 'people' ? record.email : '',
    value: record.kind === 'deals' ? Number(record.amount ?? 0) : 0,
    amount: record.kind === 'deals' && record.amount !== null ? Number(record.amount) : null,
    currency: record.kind === 'deals' ? record.currency : 'USD',
    closeDate: record.kind === 'deals' ? record.expectedCloseDate : undefined,
    stageCategory: stage?.status,
    probability: stage?.status === 'won' ? 100 : 0,
    deal: record.kind === 'tasks' && record.dealId ? find(record.dealId) : '',
    person: record.kind === 'tasks' && record.personId ? find(record.personId) : '',
  }
}
export function sampleRecords(kind: ExampleKind, count = 5): ExampleRecord[] {
  const all = (Object.keys(examples) as ExampleKind[]).flatMap((k) => sampleEntities(k, count))
  const labels = new Map(all.map((r) => [r.id, r.name]))
  return all.filter((r) => r.kind === kind).map((r) => projectRecord(r, all, users, stages, labels))
}
export function queryFields(kind: ExampleKind): QueryField[] {
  const text = (id: string, label: string): QueryField => ({ id, label, type: 'text' })
  return [
    text('name', kind === 'tasks' ? 'Title' : 'Name'),
    ...kind === 'companies'
      ? [text('owner', 'Owner'), text('industry', 'Industry'), text('domain', 'Website')]
      : kind === 'people'
      ? [
        text('company', 'Company'),
        text('department', 'Department'),
        text('title', 'Title'),
        text('email', 'Email'),
        text('phone', 'Phone'),
      ]
      : kind === 'deals'
      ? [
        text('company', 'Company'),
        text('owner', 'Owner'),
        text('status', 'Stage'),
        { id: 'amount', label: 'Amount', type: 'number' as const },
        text('currency', 'Currency'),
        { id: 'closeDate', label: 'Expected close', type: 'date' as const },
        text('nextAction', 'Next action'),
      ]
      : [text('company', 'Company'), text('deal', 'Deal'), text('person', 'Person'), text('owner', 'Assignee'), {
        id: 'status',
        label: 'Status',
        type: 'select' as const,
        options: taskStatuses.map((s) => ({ value: s.label, label: s.label })),
      }, { id: 'dueAt', label: 'Due', type: 'datetime' as const }],
    { id: 'createdAt', label: 'Created', type: 'datetime' },
    { id: 'updatedAt', label: 'Updated', type: 'datetime' },
  ]
}
