import {
  ChartNoAxesColumnIcon,
  FileTextIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  RefreshCcwDotIcon,
  SettingsIcon,
  UserCogIcon,
  UsersRoundIcon,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { AppShell } from '@dir/ui/components/shells/app-shell.tsx'
import type { ShellNavGroup } from '@dir/ui/components/shells/shell-parts.tsx'
import type { ComponentDoc } from './index.ts'
import {
  backToClients,
  clientDetailActions,
  ClientDetailBody,
  ClientDetailTabsBody,
  clientListActions,
  ClientListBody,
  DashboardBody,
  newClientButton,
} from './crud-pages.tsx'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const navigation: ShellNavGroup[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon {...icon} /> },
      { id: 'clients', label: 'Clients', icon: <UsersRoundIcon {...icon} /> },
      { id: 'loans', label: 'Loans', icon: <FileTextIcon {...icon} /> },
      { id: 'partners', label: 'Partners', icon: <HandshakeIcon {...icon} /> },
      { id: 'reports', label: 'Reports', icon: <ChartNoAxesColumnIcon {...icon} /> },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'users', label: 'Users', icon: <UserCogIcon {...icon} /> },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon {...icon} /> },
    ],
  },
]
const workspace = (
  <span className='flex min-w-0 items-center gap-2'>
    <span className='inline-grid size-7 shrink-0 place-items-center rounded-lg bg-foreground text-background'>
      <RefreshCcwDotIcon size={16} strokeWidth={2} aria-hidden='true' />
    </span>
    <span className='truncate text-[16px] font-medium tracking-tight'>pastclient</span>
  </span>
)
const account = (
  <span className='flex min-w-0 items-center gap-2.5 px-1 py-1.5'>
    <span className='inline-grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-[12px] font-medium text-background'>
      N
    </span>
    <span className='min-w-0 leading-tight'>
      <span className='block truncate text-[13px] text-foreground'>Nizam</span>
      <span className='block truncate text-[12px]'>Loan officer</span>
    </span>
  </span>
)
function Shell({ active, title, leading, actions, children }: {
  active: string
  title: string
  leading?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  const [current, setCurrent] = useState(active)
  return (
    <div className='h-[420px] w-full overflow-hidden rounded-lg border border-border'>
      <AppShell
        workspace={workspace}
        navigation={navigation}
        active={current}
        onNavigate={setCurrent}
        sidebarFooter={account}
        title={title}
        leading={leading}
        actions={actions}
      >
        {children}
      </AppShell>
    </div>
  )
}

export function AppShellDashboard() {
  return (
    <Shell active='dashboard' title='Dashboard' actions={newClientButton}>
      <DashboardBody />
    </Shell>
  )
}
export function AppShellRecordList() {
  return (
    <Shell active='clients' title='Clients' actions={clientListActions}>
      <ClientListBody />
    </Shell>
  )
}
export function AppShellRecordDetail() {
  return (
    <Shell active='clients' title='Chris and Ada Okafor' leading={backToClients} actions={clientDetailActions}>
      <ClientDetailBody />
    </Shell>
  )
}
export function AppShellContentTabs() {
  return (
    <Shell active='clients' title='Chris and Ada Okafor' leading={backToClients} actions={clientDetailActions}>
      <ClientDetailTabsBody />
    </Shell>
  )
}

export const doc: ComponentDoc = {
  hero: AppShellDashboard,
  heroAlign: 'stretch',
  frames: true,
  sections: [
    {
      id: 'record-list',
      title: 'Record list',
      description: 'Search and one filter above a table; each row opens the record. The primary action creates one.',
      example: AppShellRecordList,
      align: 'stretch',
    },
    {
      id: 'record-detail',
      title: 'Record detail',
      description:
        'Opening a record is not a navigation level: keep the sidebar item selected and put a back button in `leading`.',
      example: AppShellRecordDetail,
      align: 'stretch',
    },
    {
      id: 'content-tabs',
      title: 'Tabs in the content',
      description:
        'A record with more than fits on one screen splits into `Tabs` under the header. The tabs belong to the record, not the navigation: the sidebar item and URL stay the same.',
      example: AppShellContentTabs,
      align: 'stretch',
    },
  ],
  api: {
    usage: "import { AppShell } from '@/components/shells/app-shell.tsx'",
    props: [
      {
        name: 'workspace',
        type: 'ReactNode',
        default: 'Required',
        description: 'Mark and name at the top of the sidebar.',
      },
      {
        name: 'navigation',
        type: '{ label?: string; items: { id; label; icon?; href?; shortcut? }[] }[]',
        default: 'Required',
        description: 'Two levels at most: group label, then items. About 5 groups and 15 items.',
      },
      { name: 'active', type: 'string', description: 'Id of the current item.' },
      { name: 'onNavigate', type: '(id: string) => void' },
      { name: 'sidebarFooter', type: 'ReactNode', description: 'Account or settings at the bottom of the sidebar.' },
      { name: 'title', type: 'ReactNode', description: 'Page title in the header.' },
      { name: 'leading', type: 'ReactNode', description: 'Back button for record detail screens.' },
      { name: 'actions', type: 'ReactNode', description: 'Secondary buttons, then one primary action.' },
      {
        name: 'width',
        type: "'full' | 'narrow'",
        default: "'full'",
        description: '`narrow` is a 640px column for forms.',
      },
      { name: 'bottomBar', type: 'ReactNode', description: 'Sticky bar at the bottom.' },
      { name: 'children', type: 'ReactNode', default: 'Required' },
    ],
  },
}
