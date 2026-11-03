import { RefreshCcwDotIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { PageShell, type PageShellProps } from '@dir/ui/components/shells/page-shell.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Field, FieldGroup } from '@dir/ui/components/ui/field.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { Textarea } from '@dir/ui/components/ui/textarea.tsx'
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

function Page({ children, ...props }: Omit<PageShellProps, 'brand' | 'trailing'> & { children: ReactNode }) {
  return (
    <div className='h-[420px] w-full overflow-hidden rounded-lg border border-border'>
      <PageShell brand={brand} trailing={avatar} {...props}>{children}</PageShell>
    </div>
  )
}

export function PageShellDashboard() {
  return (
    <Page title='Dashboard' actions={newClientButton}>
      <DashboardBody />
    </Page>
  )
}
export function PageShellRecordList() {
  return (
    <Page title='Clients' actions={clientListActions}>
      <ClientListBody />
    </Page>
  )
}
export function PageShellRecordDetail() {
  return (
    <Page title='Chris and Ada Okafor' leading={backToClients} actions={clientDetailActions}>
      <ClientDetailBody />
    </Page>
  )
}
const views = [{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'lead', label: 'Leads' }, {
  id: 'paused',
  label: 'Paused',
}]
export function PageShellTabs() {
  const [view, setView] = useState('all')
  return (
    <Page tabs={views} tab={view} onTabChange={setView} title='Clients' actions={clientListActions}>
      <ClientListBody key={view} status={view} />
    </Page>
  )
}
export function PageShellForm() {
  const [status, setStatus] = useState('lead')
  return (
    <Page
      title='New client'
      leading={backToClients}
      width='narrow'
      bottomBar={
        <>
          <Button>Cancel</Button>
          <Button variant='default'>Create client</Button>
        </>
      }
    >
      <FieldGroup>
        <Field label='Name' required>{(props) => <Input {...props} defaultValue='Chris and Ada Okafor' />}</Field>
        <div className='grid grid-cols-2 gap-3.5 max-[600px]:grid-cols-1'>
          <Field label='Email'>{(props) => <Input {...props} type='email' placeholder='name@example.com' />}</Field>
          <Field label='Phone'>{(props) => <Input {...props} type='tel' placeholder='(555) 000-0000' />}</Field>
        </div>
        <Field label='Status'>
          {(props) => (
            <Select
              id={props.id}
              label='Status'
              items={[{ value: 'lead', label: 'Lead' }, { value: 'active', label: 'Active' }, {
                value: 'paused',
                label: 'Paused',
              }]}
              value={status}
              onChange={setStatus}
            />
          )}
        </Field>
        <Field label='Notes'>
          {(props) => <Textarea {...props} rows={3} placeholder='How we met, what they need' />}
        </Field>
      </FieldGroup>
    </Page>
  )
}
export const doc: ComponentDoc = {
  hero: PageShellDashboard,
  heroAlign: 'stretch',
  frames: true,
  sections: [
    {
      id: 'record-list',
      title: 'Record list',
      description: 'Search and one filter above a table; each row opens the record.',
      example: PageShellRecordList,
      align: 'stretch',
    },
    {
      id: 'header-tabs',
      title: 'Header tabs',
      description:
        'Up to five views of one tool in the header, such as list filters people switch between all day. On phones the tabs move to a row under the header.',
      example: PageShellTabs,
      align: 'stretch',
    },
    {
      id: 'record-detail',
      title: 'Record detail',
      description: 'With no navigation, a back button in `leading` returns to the list.',
      example: PageShellRecordDetail,
      align: 'stretch',
    },
    {
      id: 'form',
      title: 'Form',
      description:
        '`width="narrow"` keeps the content in a 640px column; `bottomBar` pins the submit button to the bottom.',
      example: PageShellForm,
      align: 'stretch',
    },
  ],
  api: {
    usage: "import { PageShell } from '@/components/shells/page-shell.tsx'",
    props: [
      {
        name: 'brand',
        type: 'ReactNode',
        default: 'Required',
        description: 'Product mark and name at the left of the header.',
      },
      {
        name: 'tabs',
        type: '{ id: string; label: string }[]',
        description: 'Up to five views in the header; on phones they move to a row under it.',
      },
      { name: 'tab', type: 'string', description: 'Id of the current tab.' },
      { name: 'onTabChange', type: '(id: string) => void' },
      { name: 'title', type: 'ReactNode', description: 'Page title in the page header.' },
      { name: 'leading', type: 'ReactNode', description: 'Back button for nested screens.' },
      { name: 'actions', type: 'ReactNode', description: 'Secondary buttons, then one primary action.' },
      { name: 'trailing', type: 'ReactNode', description: 'Account menu or avatar at the right.' },
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
