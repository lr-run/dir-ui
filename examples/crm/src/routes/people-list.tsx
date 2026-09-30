import { UserRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { ChoiceField, recordChoices, TextField } from '@/components/crm/components/record-fields.tsx'
import { examples, queryFields } from '@/components/crm/example/data.ts'
import { queryExampleRecords } from '@/components/crm/example/query.ts'
import { WorkspaceSidebarTrigger } from '@/components/crm/layout.tsx'
import { ListPage, type ListPageDefinition } from '@/components/crm/screens/list-page.tsx'
import type { ExampleRecord, ListRouteProps } from '@/components/crm/types.ts'

const fields = queryFields('people')
const definition: ListPageDefinition<ExampleRecord> = {
  title: examples.people.title,
  singular: 'Person',
  icon: <UserRoundIcon size={16} aria-hidden />,
  rowKey: (r) => r.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Person', type: 'record', width: 235, required: true },
    { key: 'company', name: 'Company', type: 'text', width: 175 },
    { key: 'department', name: 'Department', type: 'text', width: 175 },
    { key: 'title', name: 'Title', type: 'text', width: 175 },
    { key: 'email', name: 'Email', type: 'email', width: 175 },
    { key: 'phone', name: 'Phone', type: 'text', width: 175 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 170 },
    { key: 'updatedAt', name: 'Updated', type: 'date', width: 170 },
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
      {creating && <CreatePersonForm {...props} onClose={() => setCreating(false)} />}
    </>
  )
}
export const peopleFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  companyId: z.string().trim().min(1, 'Company is required.'),
  department: z.string().trim(),
  title: z.string().trim(),
  email: z.string().trim().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email.'),
  phone: z.string().trim(),
})
type Values = z.infer<typeof peopleFormSchema>
function CreatePersonForm(
  { state, onCreate, onClose }: Pick<ListRouteProps, 'state' | 'onCreate'> & { onClose: () => void },
) {
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(peopleFormSchema),
    defaultValues: { name: '', companyId: '', department: '', title: '', email: '', phone: '' },
  })
  return (
    <Dialog
      open
      title='Create Person'
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='default' disabled={isSubmitting} type='submit' form='create-people'>Create person</Button>
        </div>
      }
    >
      <form
        id='create-people'
        className='grid gap-4 p-5'
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await onCreate(values)
            onClose()
          } catch (error) {
            setError('root', { message: error instanceof Error ? error.message : 'Unable to save.' })
          }
        })}
      >
        <TextField
          name='name'
          label='Name'
          register={register}
          type='text'
          required
          error={errors.name?.message}
        />
        <ChoiceField
          name='companyId'
          label='Company'
          control={control}
          items={recordChoices(state, 'companies')}
          required
        />
        <TextField
          name='department'
          label='Department'
          register={register}
          type='text'
          required={false}
          error={errors.department?.message}
        />
        <TextField
          name='title'
          label='Title'
          register={register}
          type='text'
          required={false}
          error={errors.title?.message}
        />
        <TextField
          name='email'
          label='Email'
          register={register}
          type='email'
          required={false}
          error={errors.email?.message}
        />
        <TextField
          name='phone'
          label='Phone'
          register={register}
          type='tel'
          required={false}
          error={errors.phone?.message}
        />
        {errors.root && <p role='alert' className='text-sm text-destructive'>{errors.root.message}</p>}
      </form>
    </Dialog>
  )
}
