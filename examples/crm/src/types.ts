import type { Dispatch, SetStateAction } from 'react'
import type { RecordFilter, RecordSort } from '@/lib/query.ts'
import type { TableColumnState } from '@/components/crm/components/record-table-model.ts'
import type { DetailContext, DetailField } from '@/components/crm/screens/detail-page.tsx'
import type { ExampleState, useExampleStore } from '@/components/crm/example/store.ts'
export type ExampleKind = 'companies' | 'people' | 'deals' | 'tasks'
export type BaseRecord = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  version: number
  archivedAt: string | null
}
export type Company = BaseRecord & { kind: 'companies'; ownerId: string; industry: string; website: string }
export type Person = BaseRecord & {
  kind: 'people'
  companyId: string
  department: string
  title: string
  email: string
  phone: string
}
export type Deal = BaseRecord & {
  kind: 'deals'
  companyId: string
  ownerId: string
  stageId: string
  amount: string | null
  currency: string
  expectedCloseDate: string
  closedAt: string | null
  nextAction: string
}
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type Task = BaseRecord & {
  kind: 'tasks'
  companyId: string
  dealId: string
  personId: string
  assigneeId: string
  dueAt: string
  status: TaskStatus
  completedAt: string | null
}
export type CrmRecord = Company | Person | Deal | Task
export type Activity = BaseRecord & {
  companyId: string
  dealId: string
  personId: string
  createdBy: string
  type: 'call' | 'email' | 'meeting' | 'note'
  body: string
  occurredAt: string
}
export type User = { id: string; name: string; email: string; isActive: boolean }
export type Stage = { id: string; name: string; status: 'open' | 'won' | 'lost'; sortOrder: number }
export type ChangeEntry = {
  id: string
  entity: string
  recordId: string
  actor: string
  actorId: string | null
  createdAt: string
  operation: 'create' | 'update' | 'archive' | 'restore' | 'delete'
  changes: Record<string, { before: unknown; after: unknown; beforeLabel?: string; afterLabel?: string }>
}
// Read model for tables/search/report. References are resolved from IDs, never saved as labels.
export type ExampleRecord = BaseRecord & {
  data: CrmRecord
  domain: string
  company: string
  owner: string
  status: string
  email: string
  value: number
  amount: number | null
  currency: string
  closeDate?: string
  stageCategory?: Stage['status']
  probability?: number
  industry?: string
  department?: string
  title?: string
  phone?: string
  nextAction?: string
  dueAt?: string
  deal?: string
  person?: string
  completedAt?: string | null
}
export type RecordChange = Partial<RecordDraft>
export type RecordDraft = {
  name: string
  ownerId?: string
  industry?: string
  website?: string
  companyId?: string
  department?: string
  title?: string
  email?: string
  phone?: string
  stageId?: string
  amount?: string | null
  currency?: string
  expectedCloseDate?: string
  nextAction?: string
  dealId?: string
  personId?: string
  assigneeId?: string
  dueAt?: string
  status?: TaskStatus
}
export type CrmStore = ReturnType<typeof useExampleStore>
export type RecordContext = DetailContext<ExampleRecord, Partial<RecordDraft>>
export type RecordField = DetailField<ExampleRecord, Partial<RecordDraft>>
export type ListRouteProps = ListViewProps & {
  records: readonly ExampleRecord[]
  state: ExampleState
  archived: boolean
  onArchivedChange: (value: boolean) => void
  onCreate: (values: RecordDraft) => void | Promise<void>
  onOpenDetail: (record: ExampleRecord) => void
  onOpenPreview: (record: ExampleRecord, rows: readonly ExampleRecord[]) => void
}
export type DetailRouteProps = {
  onOpenRecord: (kind: ExampleKind, id: string) => void
  record: ExampleRecord
  store: CrmStore
  onChange: (change: Partial<RecordDraft>, label: string) => void | Promise<void>
  onArchive: () => void
}
export type ListView = {
  id: string
  name: string
  sorts: RecordSort[]
  filter: RecordFilter
  columns: TableColumnState[]
}
export type ListViews = { activeId: string; views: ListView[] }
export type ListViewProps = { views: ListViews; onViewsChange: Dispatch<SetStateAction<ListViews>> }
