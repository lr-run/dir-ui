import { DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { TabBar } from '@dir/ui/components/ui/tab-bar.tsx'
import { TabsContent } from '@dir/ui/components/ui/tabs.tsx'
import type { ComponentDoc } from './index.ts'

const panel = 'px-5 py-6 text-[13px] text-muted-foreground'

export function TabBarDemo() {
  return (
    <div className='w-full overflow-hidden rounded-lg border border-border bg-(--ui-surface)'>
      <TabBar
        label='Workspace sections'
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'users', label: 'Users' },
          { value: 'organizations', label: 'Organizations' },
          { value: 'billing', label: 'Billing' },
          { value: 'logs', label: 'Logs' },
          { value: 'configure', label: 'Configure' },
        ]}
      >
        <TabsContent value='overview' className={panel}>Sign-ups and active users this week</TabsContent>
        <TabsContent value='users' className={panel}>Everyone who can sign in</TabsContent>
        <TabsContent value='organizations' className={panel}>Teams and their members</TabsContent>
        <TabsContent value='billing' className={panel}>Plan, invoices and payment method</TabsContent>
        <TabsContent value='logs' className={panel}>Requests and errors</TabsContent>
        <TabsContent value='configure' className={panel}>Sign-in methods and settings</TabsContent>
      </TabBar>
    </div>
  )
}
export function TabBarCounts() {
  const [tab, setTab] = useState('open')
  return (
    <div className='w-full overflow-hidden rounded-lg border border-border bg-(--ui-surface)'>
      <TabBar
        label='Tickets'
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'open', label: 'Open', count: 42 },
          { value: 'mine', label: 'Assigned to me', count: 10 },
          { value: 'resolved', label: 'Resolved', count: 318 },
        ]}
      />
      <p className={`m-0 ${panel}`}>Showing {tab} tickets</p>
    </div>
  )
}
export function TabBarActions() {
  const [period, setPeriod] = useState('30')
  return (
    <div className='w-full overflow-hidden rounded-lg border border-border bg-(--ui-surface)'>
      <TabBar
        label='Report'
        items={[{ value: 'revenue', label: 'Revenue' }, { value: 'orders', label: 'Orders' }, {
          value: 'customers',
          label: 'Customers',
        }]}
        actions={
          <>
            <div className='w-[140px] [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=select-trigger]]:w-full'>
              <Select
                label='Period'
                value={period}
                onChange={setPeriod}
                items={[{ value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]}
              />
            </div>
            <Button size='sm'>
              <DownloadIcon aria-hidden='true' />Export
            </Button>
          </>
        }
      />
      <p className={`m-0 ${panel}`}>The actions belong to the current tab, not to the page.</p>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: TabBarDemo,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'counts',
      title: 'Counts',
      description:
        'Pass `count` to show how many records each view holds; control it with `value` and `onValueChange`.',
      example: TabBarCounts,
      align: 'stretch',
    },
    {
      id: 'actions',
      title: 'Actions',
      description: 'Filters or a period that apply to the current tab go in `actions`, at the right of the band.',
      example: TabBarActions,
      align: 'stretch',
    },
  ],
  api: {
    usage:
      "import { TabBar } from '@/components/ui/tab-bar.tsx'\nimport { TabsContent } from '@/components/ui/tabs.tsx'",
    props: [
      { name: 'label', type: 'string', default: 'Required', description: 'Accessible name of the tab list.' },
      {
        name: 'items',
        type: '{ value: string; label: ReactNode; count?: number; disabled?: boolean }[]',
        default: 'Required',
      },
      { name: 'value', type: 'string', description: 'Current tab when controlled.' },
      { name: 'defaultValue', type: 'string', default: 'first item' },
      { name: 'onValueChange', type: '(value: string) => void' },
      { name: 'actions', type: 'ReactNode', description: 'Controls for the current tab at the right of the band.' },
      { name: 'children', type: 'ReactNode', description: 'One `TabsContent` per item.' },
    ],
  },
}
