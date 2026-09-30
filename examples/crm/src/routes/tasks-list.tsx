import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { SquareCheckIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { ChoiceField, recordChoices, TextField, userChoices } from '@/components/crm/components/record-fields.tsx'
import { examples, queryFields, taskStatuses } from '@/components/crm/example/data.ts'
import { queryExampleRecords } from '@/components/crm/example/query.ts'
import { WorkspaceSidebarTrigger } from '@/components/crm/layout.tsx'
import { ListPage, type ListPageDefinition } from '@/components/crm/screens/list-page.tsx'
import type { ExampleRecord, ListRouteProps } from '@/components/crm/types.ts'

const fields = queryFields('tasks')
const definition: ListPageDefinition<ExampleRecord> = {
  title: examples.tasks.title,
  singular: 'Task',
  icon: <SquareCheckIcon size={16} aria-hidden />,
  rowKey: (r) => r.id,
  queryFields: fields,
  query: (records, query) => queryExampleRecords(records, fields, query),
  columns: [
    { key: 'name', name: 'Task', type: 'record', width: 235, required: true },
    { key: 'company', name: 'Company', type: 'text', width: 175 },
    { key: 'deal', name: 'Deal', type: 'text', width: 175 },
    { key: 'person', name: 'Person', type: 'text', width: 175 },
    { key: 'owner', name: 'Assignee', type: 'member', width: 175 },
    { key: 'dueAt', name: 'Due', type: 'date', width: 175 },
    { key: 'status', name: 'Status', type: 'status', width: 175 },
    { key: 'completedAt', name: 'Completed', type: 'date', width: 175 },
    { key: 'createdAt', name: 'Created', type: 'date', width: 170 },
    { key: 'updatedAt', name: 'Updated', type: 'date', width: 170 },
  ],
}
export function TasksList(props: ListRouteProps) {
  const [creating, setCreating] = useState(false)
  return (
    <>
      <ListPage
        definition={definition}
        leading={<WorkspaceSidebarTrigger />}
        {...props}
        onCreate={() => setCreating(true)}
      />
      {creating && <CreateTaskForm {...props} onClose={() => setCreating(false)} />}
    </>
  )
}
export const tasksFormSchema = z.object({
  name: z.string().trim().min(1, 'Title is required.').max(120),
  companyId: z.string().trim().min(1, 'Company is required.'),
  dealId: z.string().trim(),
  personId: z.string().trim(),
  assigneeId: z.string().trim().min(1, 'Assignee is required.'),
  dueAt: z.string().trim(),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
})
type Values = z.infer<typeof tasksFormSchema>
function CreateTaskForm(
  { state, onCreate, onClose }: Pick<ListRouteProps, 'state' | 'onCreate'> & { onClose: () => void },
) {
  const notifyError = useErrorNotification()
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(tasksFormSchema),
    defaultValues: {
      name: '',
      companyId: '',
      dealId: '',
      personId: '',
      assigneeId: state.users.find((u) => u.isActive)?.id ?? '',
      dueAt: '',
      status: 'todo',
    },
  })
  return (
    <Dialog
      open
      title='Create Task'
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='default' disabled={isSubmitting} type='submit' form='create-tasks'>Create task</Button>
        </div>
      }
    >
      <form
        id='create-tasks'
        className='grid gap-4 p-5'
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await onCreate({ ...values, dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : '' })
            onClose()
          } catch (error) {
            notifyError?.(error, 'Unable to save.')
          }
        })}
      >
        <TextField
          name='name'
          label='Title'
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
        <ChoiceField
          name='dealId'
          label='Deal'
          control={control}
          items={recordChoices(state, 'deals', watch('companyId'))}
          required={false}
        />
        <ChoiceField
          name='personId'
          label='Person'
          control={control}
          items={recordChoices(state, 'people', watch('companyId'))}
          required={false}
        />
        <ChoiceField name='assigneeId' label='Assignee' control={control} items={userChoices(state)} required />
        <TextField
          name='dueAt'
          label='Due'
          register={register}
          type='datetime-local'
          required={false}
          error={errors.dueAt?.message}
        />
        <ChoiceField name='status' label='Status' control={control} items={[...taskStatuses]} required />
      </form>
    </Dialog>
  )
}
