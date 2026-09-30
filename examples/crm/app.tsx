import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/button.tsx'
import { ConfirmDialog } from '../../components/ui/alert-dialog.tsx'
import { Sheet } from '../../components/ui/sheet.tsx'
import { Layout, WorkspaceSearch } from './layout.tsx'
import { RecordPreview } from './components/record-preview.tsx'
import { examples } from './example/data.ts'
import { useExampleStore } from './example/store.ts'
import { CompaniesList } from './routes/companies-list.tsx'
import { CompaniesDetail, companiesFields } from './routes/companies-detail.tsx'
import { PeopleList } from './routes/people-list.tsx'
import { PeopleDetail, peopleFields } from './routes/people-detail.tsx'
import { DealsList } from './routes/deals-list.tsx'
import { DealsDetail, dealsFields } from './routes/deals-detail.tsx'
import type { ExampleKind, RecordChange, RecordDraft } from './types.ts'

const Report = lazy(() => import('./routes/report.tsx'))
const pages = {
  companies: { List: CompaniesList, Detail: CompaniesDetail, fields: companiesFields },
  people: { List: PeopleList, Detail: PeopleDetail, fields: peopleFields },
  deals: { List: DealsList, Detail: DealsDetail, fields: dealsFields },
}
export type AppRoute = { page: 'list' | 'detail'; kind: ExampleKind; id?: string } | { page: 'report' | 'not-found' }
export function resolveRoute(pathname: string, basePath = ''): AppRoute {
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return { page: 'not-found' }
  const path = pathname.slice(basePath.length).replace(/\/$/, '') || '/'
  if (path === '/') return { page: 'list', kind: 'companies' }
  if (path === '/report') return { page: 'report' }
  const match = /^\/(companies|people|deals)(?:\/([^/]+))?$/.exec(path)
  if (!match) return { page: 'not-found' }
  const kind = match[1] as ExampleKind
  try {
    return match[2] ? { page: 'detail', kind, id: decodeURIComponent(match[2]) } : { page: 'list', kind }
  } catch {
    return { page: 'not-found' }
  }
}

// The app works at /companies, /companies/:id, etc. The studio mounts it under /api/preview.
// The example store owns sample records and views; this component owns navigation and overlays.
export function CrmApp({ count = 100, basePath = '' }: { count?: number; basePath?: string }) {
  const [pathname, setPathname] = useState(() => location.pathname)
  const route = resolveRoute(pathname, basePath)
  const kind = 'kind' in route ? route.kind : 'companies'
  const href = (path: string) => `${basePath}${path}${location.search}`
  const navigate = (path: string, replace = false) => {
    const target = href(path)
    if (`${location.pathname}${location.search}` !== target) {
      if (replace) history.replaceState(null, '', target)
      else history.pushState(null, '', target)
      setPathname(location.pathname)
    }
  }
  useEffect(() => {
    const onPopState = () => setPathname(location.pathname)
    addEventListener('popstate', onPopState)
    if (location.pathname === basePath || location.pathname === `${basePath}/`) {
      history.replaceState(null, '', `${basePath}/companies${location.search}`)
      setPathname(location.pathname)
    }
    return () => removeEventListener('popstate', onPopState)
  }, [basePath])
  const store = useExampleStore(count)
  const { collections } = store
  const records = collections[kind]
  const [searchOpen, setSearchOpen] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewOrder, setPreviewOrder] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    setPreviewId(null)
    setDeleting(false)
    setNotice('')
  }, [pathname])
  const previewRows = useMemo(() => {
    const ids = new Set(records.map((record) => record.id))
    return previewOrder.filter((id) => ids.has(id))
  }, [records, previewOrder])
  const previewIndex = previewRows.indexOf(previewId ?? '')
  const record = route.page === 'detail' ? records.find((record) => record.id === route.id) : undefined
  const selected = previewId ? records.find((record) => record.id === previewId) : record
  const patch = (change: RecordChange, label: string) => {
    if (!selected) return
    store.update(kind, selected.id, change, label)
    setNotice(change.notes ? label : `${label} saved`)
  }
  const openRecord = (next: ExampleKind, id: string) => {
    setPreviewId(null)
    navigate(`/${next}/${encodeURIComponent(id)}`)
  }
  const create = (values: RecordDraft) => {
    const record = store.create(kind, values)
    openRecord(kind, record.id)
  }
  const remove = () => {
    if (!selected) return
    store.remove(kind, selected.id)
    setPreviewId(null)
    setDeleting(false)
    if (route.page === 'detail') navigate(`/${kind}`)
    else setNotice('Record deleted')
  }
  const { List, Detail, fields } = pages[kind]
  return (
    <>
      <Layout
        kind={kind}
        report={route.page === 'report'}
        href={href}
        onReport={() => navigate('/report')}
        onNavigate={(next) => navigate(`/${next}`)}
        recordName={record?.name}
        onBack={() => navigate(`/${kind}`)}
        searchOpen={searchOpen}
        onSearch={() => setSearchOpen(true)}
      >
        {route.page === 'report'
          ? (
            <Suspense fallback={null}>
              <Report records={collections.deals} />
            </Suspense>
          )
          : route.page === 'not-found' || (route.page === 'detail' && !record)
          ? (
            <section className='flex-1 p-8'>
              <h1 className='mb-2 text-lg font-semibold'>
                {route.page === 'detail' ? 'Record not found' : 'Page not found'}
              </h1>
              <p className='mb-4 text-sm text-muted-foreground'>This demo resets its sample data when reloaded.</p>
              <Button onClick={() => navigate(`/${kind}`)}>Back to {examples[kind].title}</Button>
            </section>
          )
          : record
          ? <Detail key={record.id} record={record} onChange={patch} onDelete={() => setDeleting(true)} />
          : (
            <List
              key={kind}
              records={records}
              views={store.views[kind]}
              onViewsChange={(value) => store.setViews(kind, value)}
              onCreate={create}
              onOpenDetail={(row) => openRecord(kind, row.id)}
              onOpenPreview={(row, rows) => {
                setPreviewOrder(rows.map((item) => item.id))
                setPreviewId(row.id)
              }}
            />
          )}
        <div
          className='shrink-0 border-t border-border px-3.5 py-1.5 text-[11px] text-muted-foreground empty:hidden'
          role='status'
        >
          {notice}
        </div>
      </Layout>
      <WorkspaceSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        collections={collections}
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
        {previewId && selected && (
          <RecordPreview
            kind={kind}
            record={selected}
            fields={fields.filter((field) => field.id !== 'status' && field.id !== 'owner')}
            position={previewIndex + 1}
            total={previewRows.length}
            onPrevious={previewIndex > 0 ? () => setPreviewId(previewRows[previewIndex - 1]!) : undefined}
            onNext={previewIndex >= 0 && previewIndex < previewRows.length - 1
              ? () => setPreviewId(previewRows[previewIndex + 1]!)
              : undefined}
            onOpen={() => openRecord(kind, selected.id)}
            onDelete={() => setDeleting(true)}
            onChange={patch}
          />
        )}
      </Sheet>
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${selected?.name ?? 'record'}?`}
        description='This removes the record from this demo. Reset preview to restore the sample data.'
        action='Delete record'
        onConfirm={remove}
      />
    </>
  )
}
