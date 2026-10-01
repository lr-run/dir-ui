import type { CrmRecord, ExampleKind, RecordChange } from '@/components/crm/types.ts'

const fields: Record<ExampleKind, Record<string, string>> = {
  companies: { name: 'name', owner: 'ownerId', industry: 'industry', domain: 'website' },
  people: {
    name: 'name',
    company: 'companyId',
    department: 'department',
    title: 'title',
    email: 'email',
    phone: 'phone',
  },
  deals: {
    name: 'name',
    company: 'companyId',
    owner: 'ownerId',
    status: 'stageId',
    amount: 'amount',
    currency: 'currency',
    closeDate: 'expectedCloseDate',
    nextAction: 'nextAction',
  },
  tasks: {
    name: 'name',
    company: 'companyId',
    deal: 'dealId',
    person: 'personId',
    owner: 'assigneeId',
    dueAt: 'dueAt',
    status: 'status',
  },
}
export function recordEditField(kind: ExampleKind, column: string): string | undefined {
  return fields[kind][column]
}
export function recordFieldChange(record: CrmRecord, field: string, value: unknown): RecordChange {
  return {
    [field]: value,
    ...(field === 'companyId' && record.kind === 'tasks' && value !== record.companyId
      ? { dealId: '', personId: '' }
      : {}),
  }
}
