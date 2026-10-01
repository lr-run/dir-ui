import { Select } from '@/components/ui/select.tsx'
import { useState } from 'react'
import { type TaskStatusFilter, taskStatusValues } from '@/components/crm/types.ts'
import { ArrowUpRightIcon, Building2Icon, CheckSquareIcon, HandshakeIcon, UsersIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { DetailPage } from '@/components/crm/screens/detail-page.tsx'
import { Activities, History } from '@/components/crm/components/record-activity.tsx'
import { examples, taskStatuses, taskStatusFilters } from '@/components/crm/example/data.ts'
import type { CrmRecord, CrmStore, DetailRouteProps, ExampleKind, RecordField } from '@/components/crm/types.ts'

const icons = { companies: Building2Icon, people: UsersIcon, deals: HandshakeIcon, tasks: CheckSquareIcon }

// Only explicit links are relationships: sharing a company does not link a person to every deal.
export function relatedRecordGroups(record: CrmRecord, records: readonly CrmRecord[]) {
  const kinds: ExampleKind[] = record.kind === 'companies'
    ? ['people', 'deals', 'tasks']
    : record.kind === 'tasks'
    ? ['companies', 'deals', 'people']
    : ['companies', 'tasks']
  const matches = (candidate: CrmRecord) => {
    if (record.kind === 'companies') {
      return !candidate.archivedAt && 'companyId' in candidate && candidate.companyId === record.id
    }
    if (candidate.kind === 'companies') return candidate.id === record.companyId
    if (record.kind === 'tasks') {
      return candidate.kind === 'deals'
        ? candidate.id === record.dealId
        : candidate.kind === 'people' && candidate.id === record.personId
    }
    return candidate.kind === 'tasks' && !candidate.archivedAt &&
      (record.kind === 'deals' ? candidate.dealId === record.id : candidate.personId === record.id)
  }
  return kinds.map((kind) => ({ kind, records: records.filter((r) => r.kind === kind && matches(r)) }))
}

export function RecordDetail(
  { record, store, onChange, onArchive, onOpenRecord, fields }: DetailRouteProps & { fields: RecordField[] },
) {
  const [taskFilter, setTaskFilter] = useState<{ recordId: string; value: TaskStatusFilter }>({
    recordId: record.id,
    value: 'not_completed',
  })
  const taskStatus = taskFilter.recordId === record.id ? taskFilter.value : 'not_completed'
  const data = record.data
  const changes = store.state.history.filter((h) => h.entity === data.kind && h.recordId === record.id)
  const related = relatedRecordGroups(data, store.state.records)
  const timestamp = (id: string, label: string, value: string | null): RecordField => ({
    id,
    label,
    render: () =>
      value
        ? (
          <time dateTime={value} className='block px-2 py-1 text-xs text-muted-foreground'>
            {new Date(value).toLocaleString()}
          </time>
        )
        : <span className='px-2 text-muted-foreground'>—</span>,
  })
  const detailFields = [
    ...fields,
    ...(data.kind === 'deals' ? [timestamp('closedAt', 'Closed', data.closedAt)] : []),
    ...(data.kind === 'tasks' ? [timestamp('completedAt', 'Completed', data.completedAt)] : []),
    timestamp('createdAt', 'Created', record.createdAt),
    timestamp('updatedAt', 'Updated', record.updatedAt),
  ]
  return (
    <div className='flex-1 min-h-0 overflow-auto'>
      <DetailPage
        title={record.name}
        fields={detailFields}
        record={record}
        onChange={onChange}
        onArchive={onArchive}
        archived={!!record.archivedAt}
      >
        <Tabs defaultValue={related[0]?.kind} key={record.id}>
          <TabsList aria-label='Record sections'>
            {related.map(({ kind, records }) => (
              <TabsTrigger key={kind} value={kind} aria-label={examples[kind].title}>
                {examples[kind].title}
                <span className='ml-1 text-xs text-muted-foreground'>{records.length}</span>
              </TabsTrigger>
            ))}
            {data.kind !== 'tasks' && <TabsTrigger value='activities'>Activities</TabsTrigger>}
            <TabsTrigger value='history'>History</TabsTrigger>
          </TabsList>
          {related.map(({ kind, records: allRecords }) => {
            const records = kind === 'tasks'
              ? allRecords.filter((r) => r.kind === 'tasks' && taskStatusValues(taskStatus).includes(r.status))
              : allRecords
            return (
              <TabsContent key={kind} value={kind}>
                <section aria-label={`Related ${examples[kind].title.toLowerCase()}`}>
                  <header className='mb-4 flex min-h-7 items-center gap-2'>
                    <h3 className='text-sm font-medium'>{examples[kind].title}</h3>
                    <span className='text-xs text-muted-foreground'>{records.length}</span>
                    {kind === 'tasks' && (
                      <div className='ml-auto w-40 shrink-0'>
                        <Select
                          label='Filter tasks by status'
                          value={taskStatus}
                          items={[...taskStatusFilters]}
                          onChange={(value) => setTaskFilter({ recordId: record.id, value: value as TaskStatusFilter })}
                        />
                      </div>
                    )}
                  </header>
                  {records.length
                    ? (
                      <ul className='grid gap-3'>
                        {records.map((r) => (
                          <li key={r.id}>
                            <RelatedRecordCard
                              record={r}
                              state={store.state}
                              onOpen={() => onOpenRecord(r.kind, r.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    )
                    : (
                      <p className='rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'>
                        {kind === 'tasks' && taskStatus !== 'all'
                          ? 'No tasks match this status.'
                          : `No related ${examples[kind].title.toLowerCase()}.`}
                      </p>
                    )}
                </section>
              </TabsContent>
            )
          })}
          {data.kind !== 'tasks' && (
            <TabsContent value='activities'>
              <Activities record={record} store={store} />
            </TabsContent>
          )}
          <TabsContent value='history'>
            <History entries={changes} />
          </TabsContent>
        </Tabs>
      </DetailPage>
    </div>
  )
}

function RelatedRecordCard(
  { record: r, state, onOpen }: { record: CrmRecord; state: CrmStore['state']; onOpen: () => void },
) {
  const Icon = icons[r.kind]
  const user = (id: string) => state.users.find((u) => u.id === id)?.name ?? 'Unassigned'
  const company = 'companyId' in r
    ? state.records.find((c) => c.kind === 'companies' && c.id === r.companyId)?.name
    : undefined
  const date = (value: string) => new Date(value).toLocaleDateString()
  let subtitle: string | undefined
  let status: string | undefined
  let details: string[]
  switch (r.kind) {
    case 'companies':
      subtitle = r.industry || 'Company'
      details = [r.website, `Owner: ${user(r.ownerId)}`].filter(Boolean)
      break
    case 'people':
      subtitle = [r.title, r.department, company].filter(Boolean).join(' · ')
      details = [r.email, r.phone].filter(Boolean)
      break
    case 'deals':
      subtitle = company
      status = state.stages.find((s) => s.id === r.stageId)?.name
      details = [
        r.amount === null
          ? 'Amount not set'
          : new Intl.NumberFormat(undefined, { style: 'currency', currency: r.currency }).format(Number(r.amount)),
        `Owner: ${user(r.ownerId)}`,
        ...(r.expectedCloseDate ? [`Expected close: ${date(r.expectedCloseDate + 'T00:00:00')}`] : []),
      ]
      break
    case 'tasks':
      subtitle = company
      status = taskStatuses.find((s) => s.value === r.status)?.label
      details = [`Assignee: ${user(r.assigneeId)}`, r.dueAt ? `Due: ${date(r.dueAt)}` : 'No due date']
      break
  }
  return (
    <button
      type='button'
      aria-label={`Open ${r.name}`}
      onClick={onOpen}
      className='group flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
    >
      <span className='grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground'>
        <Icon size={16} strokeWidth={1.5} aria-hidden />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
          <span className='text-sm font-medium break-words'>{r.name}</span>
          {status && <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>{status}</span>}
          {r.archivedAt && (
            <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>Archived</span>
          )}
        </span>
        {subtitle && <span className='mt-1 block text-xs text-muted-foreground break-words'>{subtitle}</span>}
        {details.length > 0 && (
          <span className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
            {details.map((detail, i) => <span key={i} className='break-words'>{detail}</span>)}
          </span>
        )}
      </span>
      <ArrowUpRightIcon size={14} strokeWidth={1.5} aria-hidden className='mt-1 shrink-0 text-muted-foreground' />
    </button>
  )
}
