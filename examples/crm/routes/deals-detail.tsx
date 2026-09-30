import { ClockIcon } from 'lucide-react'
import { InlineEdit } from '../../../components/ui/inline-edit.tsx'
import { InlineCombobox, InlineMoney } from '../../../components/ui/inline-inputs.tsx'
import { List, ListItem } from '../../../components/ui/list.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs.tsx'
import { examples, owners } from '../example/data.ts'
import { DetailPage } from '../screens/detail-page.tsx'
import { RecordNotes } from '../components/record-notes.tsx'
import type { DetailRouteProps, RecordField } from '../types.ts'

export const dealsFields: readonly RecordField[] = [
  {
    id: 'name',
    label: 'Name',
    render: ({ record, onChange }) => (
      <InlineEdit
        label='Name'
        value={record.name}
        validate={(value) => !value.trim() ? 'Enter a name.' : undefined}
        onValueChange={(name) => onChange({ name }, 'Name')}
      />
    ),
  },
  {
    id: 'company',
    label: 'Company',
    render: ({ record, onChange }) => (
      <InlineEdit
        label='Company'
        value={record.company}
        onValueChange={(company) => onChange({ company }, 'Company')}
      />
    ),
  },
  {
    id: 'status',
    label: 'Status',
    render: ({ record, onChange }) => (
      <InlineCombobox
        label='Status'
        clearable={false}
        items={examples.deals.statuses.map((value) => ({ value, label: value }))}
        value={record.status}
        onValueChange={(status) => {
          if (status) onChange({ status }, 'Status')
        }}
      />
    ),
  },
  {
    id: 'owner',
    label: 'Owner',
    render: ({ record, onChange }) => (
      <InlineCombobox
        label='Owner'
        clearable={false}
        items={owners.map((value) => ({ value, label: value }))}
        value={record.owner}
        onValueChange={(owner) => {
          if (owner) onChange({ owner }, 'Owner')
        }}
      />
    ),
  },
  {
    id: 'value',
    label: 'Value',
    render: ({ record, onChange }) => (
      <InlineMoney
        label='Value'
        value={record.value}
        min={0}
        currency='USD'
        onValueChange={(value) => onChange({ value: value ?? 0 }, 'Value')}
      />
    ),
  },
]

export function DealsDetail({ record, onChange, onDelete }: DetailRouteProps) {
  return (
    <div className='flex-1 min-h-0 overflow-auto'>
      <DetailPage title={record.name} fields={dealsFields} record={record} onChange={onChange} onDelete={onDelete}>
        <Tabs defaultValue='overview'>
          <TabsList aria-label='Record sections'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
            <TabsTrigger value='notes'>Notes</TabsTrigger>
          </TabsList>
          <TabsContent value='overview'>
            <h3>Highlights</h3>
            <div className='grid grid-cols-2 gap-2.5 mb-7 [&>div]:grid [&>div]:gap-[9px] [&>div]:border [&>div]:border-border [&>div]:rounded-lg [&>div]:p-3.5 [&_span]:text-[11px] [&_span]:text-muted-foreground [&_strong]:text-[13px] [&_strong]:font-medium'>
              <div>
                <span>Status</span>
                <strong>{record.status}</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>{record.owner}</strong>
              </div>
              <div>
                <span>Value</span>
                <strong>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                    .format(
                      record.value,
                    )}
                </strong>
              </div>
            </div>
            <h3>Recent activity</h3>
            <List>
              {record.activity.slice(0, 3).map((event) => (
                <ListItem
                  key={event.id}
                  leading={<ClockIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
                  title={event.title}
                  meta={event.time}
                />
              ))}
            </List>
          </TabsContent>
          <TabsContent value='activity'>
            <List>
              {record.activity.map((event) => (
                <ListItem
                  key={event.id}
                  leading={<ClockIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
                  title={event.title}
                  meta={event.time}
                />
              ))}
            </List>
          </TabsContent>
          <TabsContent value='notes'>
            <RecordNotes key={record.id} notes={record.notes} onChange={(notes, label) => onChange({ notes }, label)} />
          </TabsContent>
        </Tabs>
      </DetailPage>
    </div>
  )
}
