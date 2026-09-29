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

const fields = queryFields('people')
const definition: ListPageDefinition<ExampleRecord> = {
  title: 'People',
  singular: 'Person',
  icon: <I name='user' />,
  rowKey: (record) => record.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Person', type: 'record', width: 235, required: true },
    { key: 'company', name: 'Company', type: 'text', width: 180 },
    { key: 'status', name: 'Status', type: 'status', width: 150 },
    { key: 'owner', name: 'Owner', type: 'member', width: 180 },
    { key: 'email', name: 'Email', type: 'email', width: 230 },
    { key: 'jobTitle', name: 'Job title', type: 'text', width: 180 },
    { key: 'department', name: 'Department', type: 'text', width: 165 },
    { key: 'phone', name: 'Phone', type: 'text', width: 180 },
    { key: 'country', name: 'Country', type: 'text', width: 175 },
    { key: 'tags', name: 'Tags', type: 'tags', width: 210 },
    { key: 'lastContact', name: 'Last contact', type: 'date', width: 155 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 155 },
  ],
}

export function PeopleList(props: ListRouteProps) {
  const [creating, setCreating] = useState(false)
  return (
    <>
      <ListPage
        definition={definition}
        leading={<WorkspaceSidebarTrigger />}
        {...props}
        onCreate={() => setCreating(true)}
      />
      {creating && <CreatePersonForm onClose={() => setCreating(false)} onCreate={props.onCreate} />}
    </>
  )
}

export const peopleFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(120, 'Use 120 characters or fewer.'),
  company: z.string().trim(),
  email: z.union([z.literal(''), z.email('Enter a valid email address.')]),
  status: z.enum(examples.people.statuses),
  owner: z.string().min(1),
})
type FormValues = z.infer<typeof peopleFormSchema>

function CreatePersonForm({ onClose, onCreate }: { onClose: () => void; onCreate: (values: FormValues) => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(peopleFormSchema),
    defaultValues: { name: '', company: '', email: '', status: examples.people.statuses[0], owner: owners[0] },
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title='Create Person'
      footer={
        <div className='flex items-center justify-end gap-2'>
          <Button type='button' onClick={onClose}>Cancel</Button>
          <Button variant='primary' type='submit' form='create-people'>Create record</Button>
        </div>
      }
    >
      <form
        id='create-people'
        className="grid gap-5 p-6 [&_[role='combobox']]:w-full"
        noValidate
        onSubmit={handleSubmit((values) => {
          onCreate(values)
          onClose()
        })}
      >
        <Field label='Name' required error={errors.name?.message}>
          {(props) => <Input {...props} {...register('name')} placeholder='Enter person name' />}
        </Field>
        <Field label='Company'>
          {(props) => <Input {...props} {...register('company')} placeholder='Company name' />}
        </Field>
        <Field label='Email' error={errors.email?.message}>
          {(props) => <Input {...props} type='email' {...register('email')} placeholder='person@example.com' />}
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
                  items={examples.people.statuses.map((value) => ({ value, label: value }))}
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
      </form>
    </Dialog>
  )
}
