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

const fields = queryFields('companies')
const definition: ListPageDefinition<ExampleRecord> = {
  title: 'Companies',
  singular: 'Company',
  icon: <I name='building' />,
  rowKey: (record) => record.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Company', type: 'record', width: 235, required: true },
    { key: 'domain', name: 'Domain', type: 'url', width: 210 },
    { key: 'status', name: 'Status', type: 'status', width: 150 },
    { key: 'owner', name: 'Owner', type: 'member', width: 180 },
    { key: 'industry', name: 'Industry', type: 'text', width: 170 },
    { key: 'employees', name: 'Employees', type: 'number', width: 150 },
    { key: 'revenue', name: 'Annual revenue', type: 'money', width: 165 },
    { key: 'city', name: 'City', type: 'text', width: 160 },
    { key: 'country', name: 'Country', type: 'text', width: 175 },
    { key: 'tags', name: 'Tags', type: 'tags', width: 210 },
    { key: 'lastContact', name: 'Last contact', type: 'date', width: 155 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 155 },
  ],
}

export function CompaniesList(props: ListRouteProps) {
  const [creating, setCreating] = useState(false)
  return (
    <>
      <ListPage
        definition={definition}
        leading={<WorkspaceSidebarTrigger />}
        {...props}
        onCreate={() => setCreating(true)}
      />
      {creating && <CreateCompanyForm onClose={() => setCreating(false)} onCreate={props.onCreate} />}
    </>
  )
}

export const companiesFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(120, 'Use 120 characters or fewer.'),
  domain: z.string().trim(),
  status: z.enum(examples.companies.statuses),
  owner: z.string().min(1),
})
type FormValues = z.infer<typeof companiesFormSchema>

function CreateCompanyForm({ onClose, onCreate }: { onClose: () => void; onCreate: (values: FormValues) => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(companiesFormSchema),
    defaultValues: { name: '', domain: '', status: examples.companies.statuses[0], owner: owners[0] },
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title='Create Company'
      footer={
        <div className='flex items-center justify-end gap-2'>
          <Button type='button' onClick={onClose}>Cancel</Button>
          <Button variant='primary' type='submit' form='create-companies'>Create record</Button>
        </div>
      }
    >
      <form
        id='create-companies'
        className="grid gap-5 p-6 [&_[role='combobox']]:w-full"
        noValidate
        onSubmit={handleSubmit((values) => {
          onCreate(values)
          onClose()
        })}
      >
        <Field label='Name' required error={errors.name?.message}>
          {(props) => <Input {...props} {...register('name')} placeholder='Enter company name' />}
        </Field>
        <Field label='Domain'>
          {(props) => <Input {...props} {...register('domain')} placeholder='company.example' />}
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
                  items={examples.companies.statuses.map((value) => ({ value, label: value }))}
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
