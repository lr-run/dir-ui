import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dir/ui/components/ui/tabs.tsx'
import type { ComponentDoc } from './index.ts'

export function TabsDemo() {
  return (
    <Tabs defaultValue='activity' className='w-[400px] max-w-full'>
      <TabsList className='border-b border-border' aria-label='Sections'>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
        <TabsTrigger value='history'>History</TabsTrigger>
        <TabsTrigger value='companies'>Related: Companies</TabsTrigger>
      </TabsList>
      <TabsContent value='activity' className='py-2 text-muted-foreground'>Recent activity</TabsContent>
      <TabsContent value='history' className='py-2 text-muted-foreground'>Change history</TabsContent>
      <TabsContent value='companies' className='py-2 text-muted-foreground'>Related companies</TabsContent>
    </Tabs>
  )
}
export function TabsDisabled() {
  return (
    <Tabs defaultValue='activity'>
      <TabsList className='border-b border-border' aria-label='Sections'>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
        <TabsTrigger value='history' disabled>History</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
export function TabsVertical() {
  return (
    <Tabs
      orientation='vertical'
      defaultValue='general'
      className='w-[400px] max-w-full rounded-lg border border-border p-2'
    >
      <TabsList className='w-[150px] border-r border-border' aria-label='Settings'>
        <TabsTrigger value='general'>General</TabsTrigger>
        <TabsTrigger value='notifications'>Notifications</TabsTrigger>
        <TabsTrigger value='stages'>Stages</TabsTrigger>
      </TabsList>
      <TabsContent value='general' className='px-3 py-1 text-muted-foreground'>General settings</TabsContent>
      <TabsContent value='notifications' className='px-3 py-1 text-muted-foreground'>Notification settings</TabsContent>
      <TabsContent value='stages' className='px-3 py-1 text-muted-foreground'>Stage settings</TabsContent>
    </Tabs>
  )
}
export const doc: ComponentDoc = {
  hero: TabsDemo,
  sections: [
    { id: 'disabled', title: 'Disabled', description: 'Use `disabled` on a `TabsTrigger`.', example: TabsDisabled },
    { id: 'vertical', title: 'Vertical', description: 'Use `orientation="vertical"`.', example: TabsVertical },
  ],
}
