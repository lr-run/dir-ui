import {
  ChartNoAxesColumnIcon,
  CircleHelpIcon,
  FileTextIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  RefreshCcwDotIcon,
  SettingsIcon,
  ShieldIcon,
  UserCogIcon,
  UsersRoundIcon,
  WalletIcon,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { type ShellSection, SuiteShell } from '@dir/ui/components/shells/suite-shell.tsx'
import { EmptyState } from '@dir/ui/components/ui/empty-state.tsx'
import type { ComponentDoc } from './index.ts'
import {
  backToClients,
  clientDetailActions,
  ClientDetailBody,
  clientListActions,
  ClientListBody,
  DashboardBody,
  newClientButton,
} from './crud-pages.tsx'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const sections: ShellSection[] = [
  {
    id: 'lending',
    label: 'Lending',
    icon: <WalletIcon {...icon} />,
    navigation: [
      {
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon {...icon} /> },
          { id: 'clients', label: 'Clients', icon: <UsersRoundIcon {...icon} /> },
          { id: 'loans', label: 'Loans', icon: <FileTextIcon {...icon} /> },
        ],
      },
      { label: 'Insights', items: [{ id: 'reports', label: 'Reports', icon: <ChartNoAxesColumnIcon {...icon} /> }] },
    ],
  },
  {
    id: 'partners',
    label: 'Partners',
    icon: <HandshakeIcon {...icon} />,
    navigation: [{
      items: [
        { id: 'partners', label: 'Partners', icon: <HandshakeIcon {...icon} /> },
        { id: 'referrals', label: 'Referrals', icon: <UsersRoundIcon {...icon} /> },
      ],
    }],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: <ShieldIcon {...icon} />,
    navigation: [{
      items: [
        { id: 'users', label: 'Users', icon: <UserCogIcon {...icon} /> },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon {...icon} /> },
      ],
    }],
  },
  { id: 'help', label: 'Help', icon: <CircleHelpIcon {...icon} /> },
]
const brand = (
  <span className='flex items-center gap-2'>
    <span className='inline-grid size-7 shrink-0 place-items-center rounded-lg bg-foreground text-background'>
      <RefreshCcwDotIcon size={16} strokeWidth={2} aria-hidden='true' />
    </span>
    <span className='text-[16px] font-medium tracking-tight'>pastclient</span>
  </span>
)
const avatar = (
  <span className='inline-grid size-8 place-items-center rounded-full bg-foreground text-[12px] font-medium text-background'>
    N
  </span>
)
const firstPage = (section: string) => sections.find((item) => item.id === section)?.navigation?.[0]?.items[0]?.id

/** The demo page stays on screen while its section is open; other sections show a placeholder. */
function Suite({ page, title, leading, actions, children }: {
  page: string
  title: string
  leading?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  const [section, setSection] = useState('lending')
  const [active, setActive] = useState<string | undefined>(page)
  const home = section === 'lending'
  return (
    <div className='h-[420px] w-full overflow-hidden rounded-lg border border-border'>
      <SuiteShell
        brand={brand}
        sections={sections}
        section={section}
        onSectionChange={(next) => {
          setSection(next)
          setActive(next === 'lending' ? page : firstPage(next))
        }}
        active={active}
        onNavigate={setActive}
        title={home ? title : sections.find((item) => item.id === section)?.label}
        leading={home ? leading : undefined}
        actions={home ? actions : undefined}
        trailing={avatar}
      >
        {home ? children : <EmptyState title='Nothing here in this demo' />}
      </SuiteShell>
    </div>
  )
}

export function SuiteShellDashboard() {
  return (
    <Suite page='dashboard' title='Dashboard' actions={newClientButton}>
      <DashboardBody />
    </Suite>
  )
}
export function SuiteShellRecordList() {
  return (
    <Suite page='clients' title='Clients' actions={clientListActions}>
      <ClientListBody />
    </Suite>
  )
}
export function SuiteShellRecordDetail() {
  return (
    <Suite page='clients' title='Chris and Ada Okafor' leading={backToClients} actions={clientDetailActions}>
      <ClientDetailBody />
    </Suite>
  )
}
export const doc: ComponentDoc = {
  hero: SuiteShellDashboard,
  heroAlign: 'stretch',
  frames: true,
  sections: [
    {
      id: 'record-list',
      title: 'Record list',
      description: 'The section sidebar keeps its item selected while the list fills the page.',
      example: SuiteShellRecordList,
      align: 'stretch',
    },
    {
      id: 'record-detail',
      title: 'Record detail',
      description: 'A record is not a navigation level: the tab and sidebar item stay selected, `leading` goes back.',
      example: SuiteShellRecordDetail,
      align: 'stretch',
    },
  ],
  api: {
    usage: "import { SuiteShell } from '@/components/shells/suite-shell.tsx'",
    props: [
      {
        name: 'brand',
        type: 'ReactNode',
        default: 'Required',
        description: 'Mark and name at the left of the header.',
      },
      {
        name: 'sections',
        type: '{ id; label; icon?; navigation?: ShellNavGroup[] }[]',
        default: 'Required',
        description:
          'Up to six header tabs. `navigation` adds a sidebar of two levels at most; on phones the tabs move to the bottom.',
      },
      { name: 'section', type: 'string', default: 'Required', description: 'Id of the current section.' },
      { name: 'onSectionChange', type: '(id: string) => void', default: 'Required' },
      { name: 'active', type: 'string', description: 'Id of the current item in the section sidebar.' },
      { name: 'onNavigate', type: '(id: string) => void' },
      { name: 'trailing', type: 'ReactNode', description: 'Account menu or a contact button at the right.' },
      { name: 'title', type: 'ReactNode', description: 'Page title in the header below the tabs.' },
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
