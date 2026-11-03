// Layout 2: a global sidebar and a page header. For one app with up to two levels of navigation.
import { type ReactNode, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar.tsx'
import {
  shellCanvasClass,
  ShellMenuTrigger,
  type ShellNavGroup,
  ShellNavigation,
  ShellPage,
  type ShellPageProps,
  sidebarGridClass,
} from '@/components/shells/shell-parts.tsx'

export type AppShellProps = ShellPageProps & {
  /** Workspace mark and name at the top of the sidebar. */
  workspace: ReactNode
  /** Groups of items; a group label is the first level, its items the second. */
  navigation: ShellNavGroup[]
  /** Id of the current item. */
  active?: string
  onNavigate?: (id: string) => void
  /** Account or settings at the bottom of the sidebar. */
  sidebarFooter?: ReactNode
  className?: string
}

export function AppShell(
  { workspace, navigation, active, onNavigate, sidebarFooter, className = '', ...page }: AppShellProps,
) {
  const [openMobile, setOpenMobile] = useState(false)
  return (
    <SidebarProvider
      className={`group/shell-app h-full min-h-0 min-w-0 ${shellCanvasClass} ${sidebarGridClass} ${className}`}
      openMobile={openMobile}
      setOpenMobile={setOpenMobile}
      collapsible={false}
    >
      <Sidebar>
        <SidebarHeader className='px-3 pt-3 pb-2'>
          <div className='flex min-h-9 w-full min-w-0 items-center gap-2 px-1 text-[14px] font-semibold tracking-tight'>
            {workspace}
          </div>
        </SidebarHeader>
        <SidebarContent className='px-3 pt-2'>
          <ShellNavigation groups={navigation} active={active} onNavigate={onNavigate} />
        </SidebarContent>
        {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}
      </Sidebar>
      <ShellPage {...page} trigger={<ShellMenuTrigger />} className='my-3 mr-3 max-[800px]:m-0' />
    </SidebarProvider>
  )
}
