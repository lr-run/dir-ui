// A system example as one app: URL routing, the layout shell, record lists and details, the preview sheet and archive
// confirmation. Each example passes its objects, pages and seed data through `KitConfig`.
import { ArrowLeftIcon } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/shells/app-shell.tsx'
import { PageShell } from '@/components/shells/page-shell.tsx'
import { ShellMenuTrigger } from '@/components/shells/shell-parts.tsx'
import { ConfirmDialog } from '@/components/ui/alert-dialog.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Sheet } from '@/components/ui/sheet.tsx'
import { Button } from '@/components/ui/button.tsx'
import { KitDetail, KitPreview } from '@/components/systems/kit/detail.tsx'
import { defaultViews, KitList } from '@/components/systems/kit/list.tsx'
import { useKitStore } from '@/components/systems/kit/store.ts'
import type { KitConfig, KitPageContext, ListViews } from '@/components/systems/kit/types.ts'

type Route = { kind: 'list'; objectId: string } | { kind: 'detail'; objectId: string; id: string } | {
  kind: 'page'
  pageId: string
} | { kind: 'not-found' }
function resolve(config: KitConfig, pathname: string, basePath: string): Route {
  const path = (pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname).replace(/\/$/, '') ||
    config.home
  const [first = '', second] = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (config.pages?.some((page) => page.id === first)) return { kind: 'page', pageId: first }
  if (config.objects.some((object) => object.id === first)) {
    return second ? { kind: 'detail', objectId: first, id: second } : { kind: 'list', objectId: first }
  }
  return { kind: 'not-found' }
}

export function KitApp({ config, count = 60, basePath = '', layout = 'app' }: {
  config: KitConfig
  count?: number
  basePath?: string
  /** `app` puts the navigation in a sidebar, `page` puts it in header tabs. */
  layout?: 'app' | 'page'
}) {
  const store = useKitStore(config, count)
  const [pathname, setPathname] = useState(() => location.pathname)
  const [views, setViews] = useState<Record<string, ListViews>>({})
  const [preview, setPreview] = useState<{ objectId: string; id: string; order: string[] } | null>(null)
  const [archiving, setArchiving] = useState<{ objectId: string; id: string } | null>(null)
  const route = resolve(config, pathname, basePath)
  const navigate = (path: string) => {
    history.pushState(null, '', `${basePath}${path}${location.search}`)
    setPathname(location.pathname)
  }
  useEffect(() => {
    const pop = () => setPathname(location.pathname)
    addEventListener('popstate', pop)
    return () => removeEventListener('popstate', pop)
  }, [])
  useEffect(() => setPreview(null), [pathname])
  const openRecord = (objectId: string, id: string) => navigate(`/${objectId}/${encodeURIComponent(id)}`)
  const active = route.kind === 'page' ? route.pageId : 'objectId' in route ? route.objectId : ''
  const items = useMemo(() =>
    new Map([
      ...config.objects.map((object) => [object.id, { label: object.title, icon: object.icon }] as const),
      ...(config.pages ?? []).map((page) => [page.id, { label: page.label, icon: page.icon }] as const),
    ]), [config])
  const leading = layout === 'app' ? <ShellMenuTrigger /> : null
  const context: KitPageContext = { store, leading, navigate, openRecord }

  let title: ReactNode, back: ReactNode, actions: ReactNode, content: ReactNode
  if (route.kind === 'list') {
    const object = store.object(route.objectId)
    content = (
      <KitList
        object={object}
        store={store}
        users={config.users}
        leading={leading}
        views={views[object.id] ?? defaultViews(object)}
        onViewsChange={(next) =>
          setViews((previous) => ({
            ...previous,
            [object.id]: typeof next === 'function' ? next(previous[object.id] ?? defaultViews(object)) : next,
          }))}
        onOpen={(id) => openRecord(object.id, id)}
        onNavigate={navigate}
        onOpenPreview={(row, rows) => setPreview({ objectId: object.id, id: row.id, order: rows.map((r) => r.id) })}
      />
    )
  } else if (route.kind === 'detail') {
    const object = store.object(route.objectId), record = store.find(route.objectId, route.id)
    title = record?.name ?? object.singular
    if (record) actions = object.detail?.actions?.({ ...context, object, record })
    back = (
      <IconButton label={`Back to ${object.title.toLowerCase()}`} onClick={() => navigate(`/${object.id}`)}>
        <ArrowLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' />
      </IconButton>
    )
    content = record
      ? (
        <KitDetail
          object={object}
          record={record}
          store={store}
          users={config.users}
          context={{ ...context, object, record }}
          onArchive={() =>
            record.archivedAt
              ? store.setArchived(object.id, record.id, false)
              : setArchiving({ objectId: object.id, id: record.id })}
          onOpenRecord={openRecord}
        />
      )
      : (
        <EmptyState title={`This ${object.singular.toLowerCase()} does not exist`}>
          <Button onClick={() => navigate(`/${object.id}`)}>Back to {object.title.toLowerCase()}</Button>
        </EmptyState>
      )
  } else if (route.kind === 'page') {
    const page = config.pages!.find((item) => item.id === route.pageId)!
    title = page.title ?? page.label
    actions = page.actions?.(context)
    content = page.render(context)
  } else {
    title = 'Page not found'
    content = (
      <EmptyState title='This page does not exist'>
        <Button onClick={() => navigate(config.home)}>Go to the first page</Button>
      </EmptyState>
    )
  }
  const page = {
    title,
    leading: back,
    actions,
    children: <div className='flex h-full min-h-0 flex-col'>{content}</div>,
  }
  const previewObject = preview && store.object(preview.objectId)
  const previewRecord = preview && store.find(preview.objectId, preview.id)
  const position = preview ? preview.order.indexOf(preview.id) : -1
  const archiveRecord = archiving && store.find(archiving.objectId, archiving.id)
  return (
    <>
      {layout === 'app'
        ? (
          <AppShell
            workspace={
              <span className='flex min-w-0 items-center gap-2'>
                <span className='inline-grid size-7 shrink-0 place-items-center rounded-lg bg-foreground text-background'>
                  {config.brand.mark}
                </span>
                <span className='truncate text-[15px] font-medium tracking-tight'>{config.brand.name}</span>
              </span>
            }
            navigation={config.navigation.map((group) => ({
              label: group.label,
              items: group.items.map((id) => ({ id, label: items.get(id)!.label, icon: items.get(id)!.icon })),
            }))}
            active={active}
            onNavigate={(id) => navigate(`/${id}`)}
            sidebarFooter={<Account config={config} />}
            {...page}
          />
        )
        : (
          <PageShell
            brand={
              <>
                <span className='inline-grid size-7 shrink-0 place-items-center rounded-lg bg-foreground text-background'>
                  {config.brand.mark}
                </span>
                {config.brand.name}
              </>
            }
            tabs={config.navigation.flatMap((group) => group.items).map((id) => ({ id, label: items.get(id)!.label }))}
            tab={active}
            onTabChange={(id) => navigate(`/${id}`)}
            trailing={<Account config={config} compact />}
            {...page}
          />
        )}
      <Sheet
        open={!!previewRecord}
        modal={false}
        disablePointerDismissal
        onOpenChange={(open) => !open && setPreview(null)}
      >
        {previewRecord && previewObject && preview && (
          <KitPreview
            object={previewObject}
            record={previewRecord}
            store={store}
            users={config.users}
            position={position + 1}
            total={preview.order.length}
            onPrevious={position > 0 ? () => setPreview({ ...preview, id: preview.order[position - 1]! }) : undefined}
            onNext={position < preview.order.length - 1
              ? () => setPreview({ ...preview, id: preview.order[position + 1]! })
              : undefined}
            onOpen={() => openRecord(preview.objectId, preview.id)}
            onArchive={() =>
              previewRecord.archivedAt
                ? store.setArchived(preview.objectId, preview.id, false)
                : setArchiving({ objectId: preview.objectId, id: preview.id })}
          />
        )}
      </Sheet>
      {archiveRecord && archiving && (
        <ConfirmDialog
          open
          title={`Archive ${archiveRecord.name}?`}
          description={`It leaves every list and search. You can restore it from the archived ${
            store.object(archiving.objectId).title.toLowerCase()
          }.`}
          action={`Archive ${store.object(archiving.objectId).singular.toLowerCase()}`}
          onOpenChange={(open) => !open && setArchiving(null)}
          onConfirm={() => {
            store.setArchived(archiving.objectId, archiving.id, true)
            setArchiving(null)
            setPreview(null)
          }}
        />
      )}
    </>
  )
}

function Account({ config, compact = false }: { config: KitConfig; compact?: boolean }) {
  const name = config.users.find((user) => user.value === config.me)?.label ?? ''
  const avatar = (
    <span className='inline-grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-[12px] font-medium text-background'>
      {name[0]}
    </span>
  )
  if (compact) return avatar
  return (
    <span className='flex min-w-0 items-center gap-2.5 px-1 py-1.5'>
      {avatar}
      <span className='min-w-0 truncate text-[13px] text-foreground'>{name}</span>
    </span>
  )
}
