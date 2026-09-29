import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Dialog, I, Select } from '../../../components/ui/index.tsx'
import { Field, Input } from '../../../components/ui/input.tsx'
import { examples, owners, queryFields } from '../example/data.ts'
import { queryExampleRecords } from '../example/query.ts'
import { WorkspaceSidebarTrigger } from '../layout.tsx'
import { ListPage, type ListPageDefinition } from '../screens/list-page.tsx'
import type { ExampleRecord, ListRouteProps } from '../types.ts'

const fields = queryFields('deals')
const definition: ListPageDefinition<ExampleRecord> = {
  title: 'Deals',
  singular: 'Deal',
  icon: <I name='target' />,
  rowKey: (record) => record.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Deal', type: 'record', width: 235, required: true },
    { key: 'company', name: 'Company', type: 'text', width: 180 },
    { key: 'status', name: 'Status', type: 'status', width: 150 },
    { key: 'owner', name: 'Owner', type: 'member', width: 180 },
    { key: 'value', name: 'Value', type: 'money', width: 150 },
    { key: 'probability', name: 'Probability', type: 'percent', width: 135 },
    { key: 'closeDate', name: 'Close date', type: 'date', width: 155 },
    { key: 'source', name: 'Source', type: 'text', width: 140 },
    { key: 'priority', name: 'Priority', type: 'status', width: 130 },
    { key: 'recurring', name: 'Recurring', type: 'boolean', width: 130 },
    { key: 'tags', name: 'Tags', type: 'tags', width: 210 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 155 },
  ],
}

export function DealsList(props: ListRouteProps) {
  const [creating, setCreating] = useState(false)
  return (
    <>
      <ListPage
        definition={definition}
        leading={<WorkspaceSidebarTrigger />}
        {...props}
        onCreate={() => setCreating(true)}
      />
      {creating && <CreateDealForm onClose={() => setCreating(false)} onCreate={props.onCreate} />}
    </>
  )
}

export const dealsFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(120, 'Use 120 characters or fewer.'),
  company: z.string().trim(),
  status: z.enum(examples.deals.statuses),
  owner: z.string().min(1),
  value: z.number().finite().min(0, 'Enter a positive value or zero.'),
})
type FormValues = z.infer<typeof dealsFormSchema>

function CreateDealForm({ onClose, onCreate }: { onClose: () => void; onCreate: (values: FormValues) => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(dealsFormSchema),
    defaultValues: { name: '', company: '', value: 0, status: examples.deals.statuses[0], owner: owners[0] },
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title='Create Deal'
      footer={
        <div className='flex items-center justify-end gap-2'>
          <Button type='button' onClick={onClose}>Cancel</Button>
          <Button variant='primary' type='submit' form='create-deals'>Create record</Button>
        </div>
      }
    >
      <form
        id='create-deals'
        className="grid gap-5 p-6 [&_[role='combobox']]:w-full"
        noValidate
        onSubmit={handleSubmit((values) => {
          onCreate(values)
          onClose()
        })}
      >
        <Field label='Name' required error={errors.name?.message}>
          {(props) => <Input {...props} {...register('name')} placeholder='Enter deal name' />}
        </Field>
        <Field label='Company'>
          {(props) => <Input {...props} {...register('company')} placeholder='Company name' />}
        </Field>
        <Controller
          name='status'
          control={control}
          render={({ field }) => (
            <Field label='Status' required error={errors.status?.message}>
              {(props) => (
                <Select
                  {...props}
                  label='Status'
                  value={field.value}
                  onChange={field.onChange}
                  items={examples.deals.statuses.map((value) => ({ value, label: value }))}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name='owner'
          control={control}
          render={({ field }) => (
            <Field label='Owner' required error={errors.owner?.message}>
              {(props) => (
                <Select
                  {...props}
                  label='Owner'
                  value={field.value}
                  onChange={field.onChange}
                  items={owners.map((value) => ({ value, label: value }))}
                />
              )}
            </Field>
          )}
        />
        <Field label='Value' error={errors.value?.message}>
          {(props) => (
            <Input {...props} type='money' min={0} step='0.01' {...register('value', { valueAsNumber: true })} />
          )}
        </Field>
      </form>
    </Dialog>
  )
}
