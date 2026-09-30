import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { ReportSkeleton, SettingsSkeleton } from '@/components/crm/components/loading.tsx'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { ConfirmDialog } from '@/components/ui/alert-dialog.tsx'
import { Sheet } from '@/components/ui/sheet.tsx'
import { Layout, WorkspaceSearch } from '@/components/crm/layout.tsx'
import { RecordPreview } from '@/components/crm/components/record-preview.tsx'
import { examples } from '@/components/crm/example/data.ts'
import { useExampleStore } from '@/components/crm/example/store.ts'
import { CompaniesList } from '@/components/crm/routes/companies-list.tsx'
import { CompaniesDetail, companiesFields } from '@/components/crm/routes/companies-detail.tsx'
import { PeopleList } from '@/components/crm/routes/people-list.tsx'
import { PeopleDetail, peopleFields } from '@/components/crm/routes/people-detail.tsx'
import { DealsList } from '@/components/crm/routes/deals-list.tsx'
import { DealsDetail, dealsFields } from '@/components/crm/routes/deals-detail.tsx'
import { TasksList } from '@/components/crm/routes/tasks-list.tsx'
import { TasksDetail, tasksFields } from '@/components/crm/routes/tasks-detail.tsx'
import type { ExampleKind, ExampleRecord, RecordChange, RecordDraft } from '@/components/crm/types.ts'
const Report = lazy(() => import('@/components/crm/routes/report.tsx'))
const Settings = lazy(() => import('@/components/crm/routes/settings.tsx'))
const pages = {
  companies: { List: CompaniesList, Detail: CompaniesDetail, fields: companiesFields },
  people: { List: PeopleList, Detail: PeopleDetail, fields: peopleFields },
  deals: { List: DealsList, Detail: DealsDetail, fields: dealsFields },
  tasks: { List: TasksList, Detail: TasksDetail, fields: tasksFields },
}
export type AppRoute = { page: 'list' | 'detail'; kind: ExampleKind; id?: string } | {
  page: 'report' | 'settings' | 'not-found'
}
export function resolveRoute(pathname: string, basePath = ''): AppRoute {
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return { page: 'not-found' }
  const path = pathname.slice(basePath.length).replace(/\/$/, '') || '/'
  if (path === '/') return { page: 'list', kind: 'companies' }
  if (path === '/report' || path === '/settings') return { page: path === '/report' ? 'report' : 'settings' }
  const match = /^\/(companies|people|deals|tasks)(?:\/([^/]+))?$/.exec(path)
  if (!match) return { page: 'not-found' }
  try {
    return match[2]
      ? { page: 'detail', kind: match[1] as ExampleKind, id: decodeURIComponent(match[2]) }
      : { page: 'list', kind: match[1] as ExampleKind }
  } catch {
    return { page: 'not-found' }
  }
}
export function CrmApp({ count = 100, basePath = '' }: { count?: number; basePath?: string }) {
  const notifyError = useErrorNotification()
  const [pathname, setPathname] = useState(() => location.pathname),
    [archived, setArchived] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [previewId, setPreviewId] = useState<string | null>(null),
    [previewOrder, setPreviewOrder] = useState<string[]>([]),
    [archiveTarget, setArchiveTarget] = useState<ExampleRecord | null>(null)
  const route = resolveRoute(pathname, basePath), kind = 'kind' in route ? route.kind : 'companies'
  const href = (path: string) => `${basePath}${path}${location.search}`
  const navigate = (path: string) => {
    history.pushState(null, '', href(path))
    setPathname(location.pathname)
  }
  useEffect(() => {
    const pop = () => setPathname(location.pathname)
    addEventListener('popstate', pop)
    return () => removeEventListener('popstate', pop)
  }, [])
  useEffect(() => {
    setPreviewId(null)
    setArchiveTarget(null)
    setArchived(false)
  }, [pathname])
  const store = useExampleStore(count), records = store.collections[kind]
  const rows = useMemo(() => records.filter((r) => !!r.archivedAt === archived), [records, archived])
  const previewRows = useMemo(() => {
    const ids = new Set(rows.map((r) => r.id))
    return previewOrder.filter((id) => ids.has(id))
  }, [rows, previewOrder])
  const previewIndex = previewRows.indexOf(previewId ?? '')
  const record = route.page === 'detail' ? records.find((r) => r.id === route.id) : undefined
  const selected = previewId ? records.find((r) => r.id === previewId) : record
  const patch = (change: RecordChange, _label: string) => {
    if (selected) store.update(kind, selected.id, change)
  }
  const openRecord = (next: ExampleKind, id: string) => {
    setPreviewId(null)
    navigate(`/${next}/${encodeURIComponent(id)}`)
  }
  const create = (values: RecordDraft) => {
    const r = store.create(kind, values)
    openRecord(kind, r.id)
  }
  const { List, Detail, fields } = pages[kind]
  const detailProps = selected
    ? {
      record: selected,
      store,
      onChange: patch,
      onArchive: () => setArchiveTarget(selected),
      onOpenRecord: openRecord,
    }
    : null
  return (
    <>
      <Layout
        kind={kind}
        report={route.page === 'report'}
        settings={route.page === 'settings'}
        href={href}
        onSettings={() => navigate('/settings')}
        onReport={() => navigate('/report')}
        onNavigate={(next) => navigate(`/${next}`)}
        recordName={record?.name}
        onBack={() => navigate(`/${kind}`)}
        searchOpen={searchOpen}
        onSearch={() => setSearchOpen(true)}
      >
        {route.page === 'report'
          ? (
            <Suspense fallback={<ReportSkeleton />}>
              <Report records={store.collections.deals.filter((r) => !r.archivedAt && r.currency === 'USD')} />
            </Suspense>
          )
          : route.page === 'settings'
          ? (
            <Suspense fallback={<SettingsSkeleton />}>
              <Settings store={store} />
            </Suspense>
          )
          : route.page === 'not-found' || route.page === 'detail' && !record
          ? (
            <section className='p-8'>
              <h1 className='mb-3 text-lg font-semibold'>Record not found</h1>
              <p className='mb-4 text-sm text-muted-foreground'>Sample records reset when this example reloads.</p>
              <Button onClick={() => navigate(`/${kind}`)}>Back to {examples[kind].title}</Button>
            </section>
          )
          : record && detailProps
          ? <Detail {...detailProps} />
          : (
            <List
              key={kind}
              records={rows}
              state={store.state}
              archived={archived}
              onArchivedChange={(next) => {
                setArchived(next)
                setPreviewId(null)
              }}
              views={store.views[kind]}
              onViewsChange={(value) => store.setViews(kind, value)}
              onCreate={create}
              onOpenDetail={(row) => openRecord(kind, row.id)}
              onOpenPreview={(row, visible) => {
                setPreviewOrder(visible.map((r) => r.id))
                setPreviewId(row.id)
              }}
            />
          )}
      </Layout>
      <WorkspaceSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        collections={store.collections}
        count={count}
        onOpenRecord={openRecord}
      />
      <Sheet
        modal={false}
        disablePointerDismissal
        open={!!previewId}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null)
        }}
      >
        {previewId && detailProps && (
          <RecordPreview
            {...detailProps}
            fields={fields(detailProps)}
            position={previewIndex + 1}
            total={previewRows.length}
            onPrevious={previewIndex > 0 ? () => setPreviewId(previewRows[previewIndex - 1]!) : undefined}
            onNext={previewIndex < previewRows.length - 1
              ? () => setPreviewId(previewRows[previewIndex + 1]!)
              : undefined}
            onOpen={() => openRecord(kind, selected!.id)}
          />
        )}
      </Sheet>
      {archiveTarget && (
        <ConfirmDialog
          open
          title={`${archiveTarget.archivedAt ? 'Restore' : 'Archive'} ${archiveTarget.name}?`}
          description={archiveTarget.archivedAt
            ? 'Restore this record to edit it. Related records are not restored automatically.'
            : 'This record will be hidden from active lists. Its data, links and history are retained.'}
          action={archiveTarget.archivedAt ? 'Restore' : 'Archive'}
          onOpenChange={(open) => {
            if (!open) setArchiveTarget(null)
          }}
          onConfirm={() => {
            try {
              store.archive(archiveTarget.id, !!archiveTarget.archivedAt)
              setArchiveTarget(null)
              setPreviewId(null)
            } catch (e) {
              notifyError?.(e, 'Unable to update.')
            }
          }}
        />
      )}
    </>
  )
}
