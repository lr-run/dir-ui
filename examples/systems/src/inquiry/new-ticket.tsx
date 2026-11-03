// Logs a ticket received by phone or email. The SLA due date follows from the priority, so agents never type it.
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { day } from '@/components/systems/kit/seed.ts'
import type { KitPageContext } from '@/components/systems/kit/types.ts'
import {
  channels,
  nextTicketRef,
  priorities,
  slaDays,
  ticketStatus,
  today,
  users,
} from '@/components/systems/inquiry/objects.tsx'

type TicketValues = {
  subject: string
  customer: string
  channel: string
  priority: string
  assignee: string
  description: string
}
const dueHint = (priority: string) => {
  const days = slaDays[priority] ?? 2
  return days === 0 ? 'SLA due today' : `SLA due in ${days} ${days === 1 ? 'day' : 'days'}`
}

export function NewTicketPage({ store, navigate, openRecord }: KitPageContext) {
  const notifyError = useErrorNotification()
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<TicketValues>({
    defaultValues: { subject: '', customer: '', channel: 'email', priority: 'normal', assignee: 'u1', description: '' },
  })
  const customerChoices = store.rows.customers!.filter((row) => !row.archivedAt).map((row) => ({
    value: row.id,
    label: row.name,
    description: String(row.contact ?? ''),
  }))
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <form
        noValidate
        aria-busy={isSubmitting}
        className='mx-auto grid w-full max-w-[640px] grid-cols-2 gap-5 p-6 max-[600px]:grid-cols-1 max-[600px]:p-4'
        onSubmit={handleSubmit(async ({ subject, description, ...values }) => {
          try {
            const due = slaDays[values.priority] ?? 2
            // The in-memory store answers at once; an API call would be awaited here the same way.
            const ticket = await Promise.resolve(store.create('tickets', subject.trim(), {
              ...values,
              ref: nextTicketRef(store.state.records.tickets ?? []),
              status: ticketStatus[0]!.value,
              sla: due === 0 ? 'at-risk' : 'on-track',
              receivedAt: today,
              slaDue: day(due),
              resolvedAt: '',
              description: description.trim(),
            }))
            openRecord('tickets', ticket.id)
          } catch (error) {
            notifyError?.(error, 'Unable to create the ticket.')
          }
        })}
      >
        <div className='col-span-full'>
          <Field label='Subject' required error={errors.subject?.message}>
            {(props) => (
              <Input
                {...props}
                autoFocus
                disabled={isSubmitting}
                placeholder='e.g. Cannot sign in after a password reset'
                {...register('subject', { validate: (value) => !!value.trim() || 'Subject is required.' })}
              />
            )}
          </Field>
        </div>
        <Controller
          name='customer'
          control={control}
          rules={{ required: 'Choose the customer who asked.' }}
          render={({ field, fieldState }) => (
            <Field label='Customer' required error={fieldState.error?.message}>
              {(props) => (
                <SingleCombobox
                  id={props.id}
                  label='Customer'
                  invalid={props.invalid}
                  disabled={isSubmitting}
                  items={customerChoices}
                  value={field.value || null}
                  onValueChange={(next) => field.onChange(next ?? '')}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name='channel'
          control={control}
          render={({ field }) => (
            <Field label='Channel'>
              {(props) => (
                <Select
                  id={props.id}
                  label='Channel'
                  disabled={isSubmitting}
                  items={channels}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name='priority'
          control={control}
          render={({ field }) => (
            <Field label='Priority' description={dueHint(field.value)}>
              {(props) => (
                <Select
                  id={props.id}
                  label='Priority'
                  disabled={isSubmitting}
                  items={priorities}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name='assignee'
          control={control}
          render={({ field }) => (
            <Field label='Assignee'>
              {(props) => (
                <Select
                  id={props.id}
                  label='Assignee'
                  disabled={isSubmitting}
                  items={users}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            </Field>
          )}
        />
        <div className='col-span-full'>
          <Field label='Customer message' required error={errors.description?.message}>
            {(props) => (
              <Textarea
                {...props}
                rows={6}
                disabled={isSubmitting}
                {...register('description', {
                  validate: (value) => !!value.trim() || 'Paste or summarize what the customer wrote.',
                })}
              />
            )}
          </Field>
        </div>
        <div className='col-span-full flex justify-end gap-2'>
          <Button onClick={() => navigate('/tickets')} disabled={isSubmitting}>Cancel</Button>
          <Button variant='default' type='submit' disabled={isSubmitting} className='min-w-[130px]'>
            {isSubmitting ? 'Creating…' : 'Create ticket'}
          </Button>
        </div>
      </form>
    </div>
  )
}
