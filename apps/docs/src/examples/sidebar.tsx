import type { ComponentDoc } from './index.ts'
import {
  Building2Icon,
  ChartNoAxesColumnIcon,
  MoonIcon,
  SquareCheckIcon,
  TargetIcon,
  UserRoundIcon,
} from 'lucide-react'
import { useLayoutEffect, useState } from 'react'
import { SearchDialogTrigger } from '@dir/ui/components/collections/search-dialog.tsx'
import { Header } from '@dir/ui/components/header.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@dir/ui/components/ui/sidebar.tsx'

const records = [
  { id: 'companies', label: 'Companies', icon: <Building2Icon size={16} strokeWidth={1.5} aria-hidden='true' /> },
  { id: 'deals', label: 'Deals', icon: <TargetIcon size={16} strokeWidth={1.5} aria-hidden='true' />, shortcut: '⌘1' },
  { id: 'people', label: 'People', icon: <UserRoundIcon size={16} strokeWidth={1.5} aria-hidden='true' /> },
  { id: 'tasks', label: 'Tasks', icon: <SquareCheckIcon size={16} strokeWidth={1.5} aria-hidden='true' /> },
]

export function SidebarDemo() {
  const [active, setActive] = useState('deals')
  const [openMobile, setOpenMobile] = useState(false)
  return (
    <div className='h-[360px] w-full overflow-hidden rounded-lg border border-border'>
      <SidebarProvider
        className="grid h-full min-h-0 grid-cols-[208px_minmax(0,1fr)] [&[data-sidebar-state='collapsed']]:grid-cols-[56px_minmax(0,1fr)] [&_[class~='group/crm-sidebar-menu-button']]:h-[30px] [&_[class~='group/crm-sidebar-menu-button']]:text-[12px]"
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
      >
        <Sidebar>
          <SidebarHeader className='min-h-12 justify-center px-3.5 py-2.5'>
            <div className='flex w-full min-w-0 items-center gap-2 text-[13px] font-medium'>
              <span className='inline-grid size-[23px] shrink-0 place-items-center rounded-[6px] bg-primary text-[12px] font-semibold text-primary-foreground'>
                S
              </span>
              <span className='group/screen-workspace-label min-w-0 flex-1 truncate'>Sales workspace</span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <div className='px-3 pb-1 [&_button]:h-7 [&_button]:text-xs'>
            <SearchDialogTrigger placeholder='Search' shortcut className='group/crm-sidebar-label' />
          </div>
          <SidebarContent className='pt-2'>
            <SidebarGroup label='Records'>
              <SidebarMenu>
                {records.map((record) => (
                  <SidebarMenuItem key={record.id}>
                    <SidebarMenuButton
                      label={record.label}
                      icon={record.icon}
                      active={active === record.id}
                      shortcut={record.shortcut}
                      onClick={() => setActive(record.id)}
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
                    icon={<ChartNoAxesColumnIcon size={16} strokeWidth={1.5} aria-hidden='true' />}
                    active={active === 'report'}
                    onClick={() => setActive('report')}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <span className='size-4 rounded-full bg-muted' aria-hidden='true' />
            <span className='group/crm-sidebar-label text-xs'>Misaki Sato</span>
            <IconButton variant='ghost' label='Dark mode' className='ml-auto'>
              <MoonIcon size={16} strokeWidth={1.5} aria-hidden='true' />
            </IconButton>
          </SidebarFooter>
        </Sidebar>
        <div className='flex min-h-0 min-w-0 flex-col'>
          <Header
            className='min-h-12 px-3.5'
            leading={<HeaderTrigger />}
            title={records.find((r) => r.id === active)?.label ?? 'Report'}
          />
          <MobileOpener />
        </div>
      </SidebarProvider>
    </div>
  )
}
export function SidebarCollapsed() {
  const [openMobile, setOpenMobile] = useState(false)
  return (
    <div className='h-[300px] w-full overflow-hidden rounded-lg border border-border'>
      <SidebarProvider
        className="grid h-full min-h-0 grid-cols-[208px_minmax(0,1fr)] [&[data-sidebar-state='collapsed']]:grid-cols-[56px_minmax(0,1fr)]"
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
      >
        <CollapseOnMount />
        <Sidebar>
          <SidebarHeader className='min-h-12 items-center justify-center'>
            <span className='inline-grid size-[23px] place-items-center rounded-[6px] bg-primary text-[12px] font-semibold text-primary-foreground'>
              S
            </span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup label='Records'>
              <SidebarMenu>
                {records.map((record) => (
                  <SidebarMenuItem key={record.id}>
                    <SidebarMenuButton
                      label={record.label}
                      icon={record.icon}
                      active={record.id === 'deals'}
                      onClick={() => {}}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className='flex min-h-0 min-w-0 flex-col'>
          <Header className='min-h-12 px-3.5' leading={<HeaderTrigger />} title='Deals' />
        </div>
      </SidebarProvider>
    </div>
  )
}
function HeaderTrigger() {
  const { open } = useSidebar()
  return open ? null : <SidebarTrigger />
}
function MobileOpener() {
  const { setOpenMobile } = useSidebar()
  return (
    <div className='p-3.5 text-[12px] text-muted-foreground'>
      Under 800px the sidebar becomes a left Sheet.{' '}
      <Button size='sm' onClick={() => setOpenMobile(true)}>Open as Sheet</Button>
    </div>
  )
}
function CollapseOnMount() {
  const { open, toggleSidebar } = useSidebar()
  const [done, setDone] = useState(false)
  useLayoutEffect(() => {
    if (!done && open) toggleSidebar()
    setDone(true)
  }, [done, open, toggleSidebar])
  return null
}
export const doc: ComponentDoc = {
  hero: SidebarDemo,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'collapsed',
      title: 'Collapsed',
      description:
        'Toggle with `SidebarTrigger` or ⌘B. Collapsed, the sidebar is 56px, menu buttons show icons only and their labels as tooltips, and the trigger moves to `Header.leading`.',
      example: SidebarCollapsed,
      align: 'stretch',
    },
  ],
}
