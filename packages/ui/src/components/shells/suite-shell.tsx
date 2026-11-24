// Layout 3: section tabs in a global header, each section with its own optional sidebar.
import { type ReactNode, useState } from 'react'
import { Sidebar, SidebarContent, SidebarProvider } from '@/components/ui/sidebar.tsx'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import {
  shellCanvasClass,
  ShellMenuTrigger,
  type ShellNavGroup,
  ShellNavigation,
  ShellPage,
  type ShellPageProps,
  shellPillTabsClass,
  ShellTopBar,
  sidebarGridClass,
} from '@/components/shells/shell-parts.tsx'

/** A top-level section. Keep to six; a section with one page has no `navigation`. */
export type ShellSection = { id: string; label: string; icon?: ReactNode; navigation?: ShellNavGroup[] }
export type SuiteShellProps = ShellPageProps & {
  brand: ReactNode
  sections: ShellSection[]
  /** Id of the current section. */
  section: string
  onSectionChange: (id: string) => void
  /** Id of the current item in the section sidebar. */
  active?: string
  onNavigate?: (id: string) => void
  trailing?: ReactNode
  className?: string
}

export function SuiteShell(
  { brand, sections, section, onSectionChange, active, onNavigate, trailing, className = '', ...page }: SuiteShellProps,
) {
  const [openMobile, setOpenMobile] = useState(false)
  const current = sections.find((item) => item.id === section)
  const change = (next: string | number | null) => onSectionChange(String(next))
  const tabs = (mobile: boolean) => (
    <TabsList
      aria-label='Sections'
      className={mobile
        ? 'w-full p-0 group-data-[orientation=horizontal]/tabs:h-14 [&_[data-slot=tabs-trigger]]:h-full [&_[data-slot=tabs-trigger]]:flex-1! [&_[data-slot=tabs-trigger]]:min-w-0 [&_[data-slot=tabs-trigger]]:px-0 [&_[data-slot=tabs-trigger]]:flex-col [&_[data-slot=tabs-trigger]]:gap-1 [&_[data-slot=tabs-trigger]]:text-[10px] [&_[data-slot=tabs-trigger]]:after:top-0 [&_[data-slot=tabs-trigger]]:after:bottom-auto'
        : shellPillTabsClass}
      data-variant={mobile ? 'line' : 'pill'}
    >
      {sections.map((item) => (
        <TabsTrigger key={item.id} value={item.id}>
          {mobile && item.icon}
          {mobile ? <span className='max-w-full truncate'>{item.label}</span> : item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  )
  return (
    <div className={`group/shell-suite flex h-full min-h-0 min-w-0 flex-col ${shellCanvasClass} ${className}`}>
      <ShellTopBar brand={brand} trailing={trailing}>
        <Tabs value={section} onValueChange={change} className='min-w-0 max-[800px]:hidden'>
          {tabs(false)}
        </Tabs>
      </ShellTopBar>
      {current?.navigation?.length
        ? (
          <SidebarProvider
            key={current.id}
            className={`min-h-0 flex-1 ${sidebarGridClass}`}
            openMobile={openMobile}
            setOpenMobile={setOpenMobile}
            collapsible={false}
          >
            <Sidebar>
              <SidebarContent className='px-3 pt-1'>
                <ShellNavigation groups={current.navigation} active={active} onNavigate={onNavigate} />
              </SidebarContent>
            </Sidebar>
            <ShellPage {...page} trigger={<ShellMenuTrigger />} className='mr-3 mb-3 max-[800px]:m-0' />
          </SidebarProvider>
        )
        : <ShellPage {...page} className='mx-3 mb-3 max-[800px]:m-0' />}
      <Tabs
        value={section}
        onValueChange={change}
        className='hidden shrink-0 border-t border-border bg-(--ui-surface) pb-[env(safe-area-inset-bottom)] max-[800px]:flex'
      >
        {tabs(true)}
      </Tabs>
    </div>
  )
}
