import type { Dispatch, SetStateAction } from 'react'
import type { RecordFilter, RecordSort } from '@/lib/query.ts'
import type { TableColumnState } from '@/lib/record-table-model.ts'
import type { Note } from '@/components/ui/rich-text.tsx'
import type { DetailContext, DetailField } from '@/components/crm/screens/detail-page.tsx'

export type ExampleKind = 'companies' | 'people' | 'deals'
export type ExampleNote = { id: string; title: string; body: Note; text: string; createdAt: string; updatedAt: string }
export type ExampleRecord = {
  id: string
  name: string
  domain: string
  email: string
  company: string
  status: string
  owner: string
  value: number
  industry?: string
  employees?: number
  revenue?: number
  city?: string
  country?: string
  jobTitle?: string
  department?: string
  phone?: string
  probability?: number
  closeDate?: string
  source?: string
  priority?: string
  recurring?: boolean
  tags?: string[]
  lastContact?: string
  createdAt?: string
  notes: ExampleNote[]
  activity: { id: string; title: string; time: string }[]
}

export type RecordDraft =
  & Pick<ExampleRecord, 'name' | 'status' | 'owner'>
  & Partial<Pick<ExampleRecord, 'domain' | 'company' | 'email' | 'value'>>
export type RecordChange = Partial<Omit<ExampleRecord, 'id' | 'activity'>>
export type RecordContext = DetailContext<ExampleRecord, RecordChange>
export type RecordField = DetailField<ExampleRecord, RecordChange>
export type ListRouteProps = ListViewProps & {
  records: readonly ExampleRecord[]
  onCreate: (values: RecordDraft) => void
  onOpenDetail: (record: ExampleRecord) => void
  onOpenPreview: (record: ExampleRecord, rows: readonly ExampleRecord[]) => void
}
export type DetailRouteProps = RecordContext & { onDelete: () => void }

export type ListView = {
  id: string
  name: string
  sorts: RecordSort[]
  filter: RecordFilter
  columns: TableColumnState[]
}
export type ListViews = { activeId: string; views: ListView[] }
export type ListViewProps = { views: ListViews; onViewsChange: Dispatch<SetStateAction<ListViews>> }
