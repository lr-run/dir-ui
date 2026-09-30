import { Building2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { ChoiceField, TextField, userChoices } from '@/components/crm/components/record-fields.tsx'
import { examples, queryFields } from '@/components/crm/example/data.ts'
import { queryExampleRecords } from '@/components/crm/example/query.ts'
import { WorkspaceSidebarTrigger } from '@/components/crm/layout.tsx'
import { ListPage, type ListPageDefinition } from '@/components/crm/screens/list-page.tsx'
import type { ExampleRecord, ListRouteProps } from '@/components/crm/types.ts'

const fields = queryFields('companies')
const definition: ListPageDefinition<ExampleRecord> = {
  title: examples.companies.title,
  singular: 'Company',
  icon: <Building2Icon size={16} aria-hidden />,
  rowKey: (r) => r.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Company', type: 'record', width: 235, required: true },
    { key: 'owner', name: 'Owner', type: 'member', width: 175 },
    { key: 'industry', name: 'Industry', type: 'text', width: 175 },
    { key: 'domain', name: 'Website', type: 'url', width: 175 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 170 },
    { key: 'updatedAt', name: 'Updated', type: 'date', width: 170 },
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
      {creating && <CreateCompanyForm {...props} onClose={() => setCreating(false)} />}
    </>
  )
}
export const companiesFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  ownerId: z.string().trim().min(1, 'Owner is required.'),
  industry: z.string().trim(),
  website: z.string().trim(),
})
type Values = z.infer<typeof companiesFormSchema>
function CreateCompanyForm(
  { state, onCreate, onClose }: Pick<ListRouteProps, 'state' | 'onCreate'> & { onClose: () => void },
) {
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(companiesFormSchema),
    defaultValues: { name: '', ownerId: state.users.find((u) => u.isActive)?.id ?? '', industry: '', website: '' },
  })
  return (
    <Dialog
      open
      title='Create Company'
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='default' disabled={isSubmitting} type='submit' form='create-companies'>
            Create company
          </Button>
        </div>
      }
    >
      <form
        id='create-companies'
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
        <ChoiceField name='ownerId' label='Owner' control={control} items={userChoices(state)} required />
        <TextField
          name='industry'
          label='Industry'
          register={register}
          type='text'
          required={false}
          error={errors.industry?.message}
        />
        <TextField
          name='website'
          label='Website'
          register={register}
          type='url'
          required={false}
          error={errors.website?.message}
        />
        {errors.root && <p role='alert' className='text-sm text-destructive'>{errors.root.message}</p>}
      </form>
    </Dialog>
  )
}
