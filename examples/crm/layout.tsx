import { SearchDialog } from '../../components/collections/search-dialog.tsx'
import { I } from '../../components/ui/index.tsx'
import type { ExampleRecord } from './types.ts'
import { searchRecords } from './example/query.ts'
import { SearchDialogTrigger } from '../../components/collections/search-dialog.tsx'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Header } from '../../components/ui/header.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '../../components/ui/sidebar.tsx'
import { examples } from './example/data.ts'
import type { ExampleKind } from './types.ts'
export function Layout(
  { kind, report = false, onReport, recordName, onBack, onNavigate, searchOpen, onSearch, href, children }: {
    kind: ExampleKind
    report?: boolean
    onReport: () => void
    onNavigate: (kind: ExampleKind) => void
    recordName?: string
    onBack?: () => void
    href: (path: string) => string
    searchOpen: boolean
    onSearch: () => void
    children: ReactNode
  },
) {
  const [openMobile, setOpenMobile] = useState(false)
  useEffect(() => {
    if (searchOpen) setOpenMobile(false)
  }, [searchOpen])
  return (
    <SidebarProvider
      className="grid grid-cols-[208px_minmax(0,_1fr)] h-full min-w-0 [background:var(--ui-raised)] [@media(max-width:_1000px)]:grid-cols-[184px_minmax(0,_1fr)] [@media(max-width:_800px)]:grid-cols-[minmax(0,_1fr)] in-data-[preview-runtime=true]:h-full [&[data-sidebar-state='collapsed']]:grid-cols-[56px_minmax(0,_1fr)] [@media(max-width:_800px)]:[&[data-sidebar-state='collapsed']]:grid-cols-[minmax(0,_1fr)] [@media(max-width:_800px)]:[&>[class~='group/crm-sidebar-panel']]:hidden [&_[class~='group/crm-sidebar-menu-button']]:h-[30px] [&_[class~='group/crm-sidebar-menu-button']]:text-[12px]"
      openMobile={openMobile}
      setOpenMobile={setOpenMobile}
    >
      <Sidebar className='bg-[color-mix(in_srgb,var(--ui-raised)_97%,var(--ui-text))]'>
        <SidebarHeader className='min-h-12 justify-center px-3.5 py-2.5'>
          <div className="flex items-center gap-[8px] w-full min-w-0 [&_[class~='group/screen-workspace-name']]:flex-1 [&_[class~='group/screen-workspace-name']]:min-w-0 [&_[class~='group/crm-sidebar-trigger']]:shrink-0 [&_[class~='group/crm-sidebar-trigger']]:ml-auto">
            <span className='group/screen-workspace-name flex items-center gap-[8px] text-[13px] [font-weight:550] whitespace-nowrap overflow-hidden'>
              <span className='w-[23px] h-[23px] inline-grid [place-items:center] [background:#3b65e9] text-[white] rounded-[6px] shrink-0'>
                S
              </span>
              <span className='group/screen-workspace-label overflow-hidden text-ellipsis'>Studio workspace</span>
            </span>
            <WorkspaceSidebarTrigger inside />
          </div>
        </SidebarHeader>
        <div className='px-3 pb-1 [&_button]:h-7 [&_button]:text-xs'>
          <WorkspaceSearchTrigger
            open={searchOpen}
            onClick={() => {
              setOpenMobile(false)
              onSearch()
            }}
          />
        </div>
        <SidebarContent className='pt-3'>
          <SidebarGroup label='Records'>
            <SidebarMenu>
              {(Object.keys(examples) as ExampleKind[]).map((key) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    label={examples[key].title}
                    href={href('/' + key)}
                    icon={examples[key].icon}
                    active={!report && key === kind}
                    onClick={() => {
                      onNavigate(key)
                      setOpenMobile(false)
                    }}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup label='Insights'>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  label='Report'
                  href={href('/report')}
                  icon='chart'
                  active={report}
                  onClick={() => {
                    onReport()
                    setOpenMobile(false)
                  }}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className='flex flex-col min-w-0 min-h-0'>
        {recordName && (
          <Header
            className='h-12 min-h-12 flex-[0_0_48px] box-border border-b border-border px-4 py-2'
            leading={<WorkspaceSidebarTrigger />}
            title={
              <span className='flex items-center gap-[10px] min-w-0 text-[13px] [&_button]:[background:none] [&_button]:[border:none] [&_button]:p-0 [&_button]:cursor-pointer [&_button]:text-muted-foreground [&_strong]:overflow-hidden [&_strong]:whitespace-nowrap [&_strong]:text-ellipsis [&_strong]:font-medium'>
                <button type='button' onClick={onBack}>{examples[kind].title}</button>
                {recordName && (
                  <>
                    <span>/</span>
                    <strong>{recordName}</strong>
                  </>
                )}
              </span>
            }
          />
        )}
        {children}
      </div>
    </SidebarProvider>
  )
}

// Keep the collapse control in the sidebar, and the reopen control in the page header.
export function WorkspaceSidebarTrigger({ inside = false }: { inside?: boolean }) {
  const { open, openMobile, isMobile } = useSidebar()
  const expanded = isMobile ? openMobile : open
  return inside === expanded ? <SidebarTrigger /> : null
}

function WorkspaceSearchTrigger({ open, onClick }: { open: boolean; onClick: () => void }) {
  const sidebar = useSidebar()
  if (!sidebar.open && !sidebar.isMobile) {
    return <SidebarMenuButton label='Search records' icon='search' onClick={onClick} />
  }
  return <SearchDialogTrigger placeholder='Search records' shortcut aria-expanded={open} onClick={onClick} />
}

export function WorkspaceSearch({ open, onOpenChange, collections, count, onOpenRecord }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: Partial<Record<ExampleKind, readonly ExampleRecord[]>>
  count: number
  onOpenRecord: (kind: ExampleKind, recordId: string) => void
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => open ? searchRecords(collections, count) : [], [open, collections, count])
  const byId = useMemo(() => new Map(results.map((item) => [item.id, item])), [results])
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const rank = (item: typeof results[number]) =>
      item.label.toLowerCase().includes(needle) ? 0 : item.description.toLowerCase().includes(needle) ? 1 : 2
    const ordered = needle
      ? [...results].sort((a, b) => rank(a) - rank(b))
      : (Object.keys(examples) as ExampleKind[]).flatMap((kind) =>
        results.filter((item) => item.kind === kind).slice(0, 5)
      )
    return ordered.map((item) => ({ ...item, icon: <I name={examples[item.kind].icon} /> }))
  }, [results, query])
  return (
    <SearchDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('')
        onOpenChange(next)
      }}
      query={query}
      onQueryChange={setQuery}
      shortcut
      title='Search records'
      inputLabel='Search records'
      placeholder='Search companies, people, and deals…'
      emptyMessage='No matching records. Try a different name, company, or email.'
      selectLabel='Open record'
      items={items}
      onSelect={(item) => {
        const result = byId.get(item.id)
        if (result) onOpenRecord(result.kind, result.recordId)
      }}
    />
  )
}
