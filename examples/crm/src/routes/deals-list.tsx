import { TargetIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { ChoiceField, recordChoices, TextField, userChoices } from '@/components/crm/components/record-fields.tsx'
import { examples, queryFields } from '@/components/crm/example/data.ts'
import { queryExampleRecords } from '@/components/crm/example/query.ts'
import { WorkspaceSidebarTrigger } from '@/components/crm/layout.tsx'
import { ListPage, type ListPageDefinition } from '@/components/crm/screens/list-page.tsx'
import type { ExampleRecord, ListRouteProps } from '@/components/crm/types.ts'

const fields = queryFields('deals')
const definition: ListPageDefinition<ExampleRecord> = {
  title: examples.deals.title,
  singular: 'Deal',
  icon: <TargetIcon size={16} aria-hidden />,
  rowKey: (r) => r.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Deal', type: 'record', width: 235, required: true },
    { key: 'company', name: 'Company', type: 'text', width: 175 },
    { key: 'owner', name: 'Owner', type: 'member', width: 175 },
    { key: 'status', name: 'Stage', type: 'status', width: 175 },
    { key: 'amount', name: 'Amount', type: 'number', width: 175 },
    { key: 'currency', name: 'Currency', type: 'text', width: 175 },
    { key: 'closeDate', name: 'Expected close', type: 'date', width: 175 },
    { key: 'nextAction', name: 'Next action', type: 'text', width: 175 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 170 },
    { key: 'updatedAt', name: 'Updated', type: 'date', width: 170 },
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
      {creating && <CreateDealForm {...props} onClose={() => setCreating(false)} />}
    </>
  )
}
export const dealsFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  companyId: z.string().trim().min(1, 'Company is required.'),
  ownerId: z.string().trim().min(1, 'Owner is required.'),
  stageId: z.string().trim().min(1, 'Stage is required.'),
  amount: z.string().trim().refine(
    (v) => !v || /^\d+(\.\d{1,2})?$/.test(v),
    'Enter a nonnegative amount with up to two decimals.',
  ),
  currency: z.string().trim().min(1, 'Currency is required.'),
  expectedCloseDate: z.string().trim(),
  nextAction: z.string().trim(),
})
type Values = z.infer<typeof dealsFormSchema>
function CreateDealForm(
  { state, onCreate, onClose }: Pick<ListRouteProps, 'state' | 'onCreate'> & { onClose: () => void },
) {
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(dealsFormSchema),
    defaultValues: {
      name: '',
      companyId: '',
      ownerId: state.users.find((u) => u.isActive)?.id ?? '',
      stageId: [...state.stages].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.id ?? '',
      amount: '',
      currency: 'USD',
      expectedCloseDate: '',
      nextAction: '',
    },
  })
  return (
    <Dialog
      open
      title='Create Deal'
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='default' disabled={isSubmitting} type='submit' form='create-deals'>Create deal</Button>
        </div>
      }
    >
      <form
        id='create-deals'
        className='grid gap-4 p-5'
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await onCreate({ ...values, amount: values.amount || null })
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
        <ChoiceField name='ownerId' label='Owner' control={control} items={userChoices(state)} required />
        <ChoiceField
          name='stageId'
          label='Stage'
          control={control}
          items={[...state.stages].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          required
        />
        <TextField
          name='amount'
          label='Amount'
          register={register}
          type='money'
          required={false}
          error={errors.amount?.message}
        />
        <ChoiceField
          name='currency'
          label='Currency'
          control={control}
          items={Intl.supportedValuesOf('currency').map((value) => ({ value, label: value }))}
          required
        />
        <TextField
          name='expectedCloseDate'
          label='Expected close'
          register={register}
          type='date'
          required={false}
          error={errors.expectedCloseDate?.message}
        />
        <TextField
          name='nextAction'
          label='Next action'
          register={register}
          type='text'
          required={false}
          error={errors.nextAction?.message}
        />
        {errors.root && <p role='alert' className='text-sm text-destructive'>{errors.root.message}</p>}
      </form>
    </Dialog>
  )
}
