// Contact support: the customer's one form. It creates a ticket and opens it, so the reply thread is one click away.
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FileUpload, type UploadFile } from '@/components/collections/files.tsx'
import { Button } from '@/components/ui/button.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { Field, FieldGroup } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Toast } from '@/components/ui/toast.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import type { KitPageContext } from '@/components/systems/kit/types.ts'
import { mainContract } from '@/components/systems/customer-portal/home.tsx'
import { priorities, ticketCategories } from '@/components/systems/customer-portal/objects.tsx'

type TicketValues = {
  subject: string
  category: string
  priority: string
  contract: string | null
  invoice: string | null
  description: string
}
/** Stands in for an upload endpoint: reports progress, then returns the stored file. */
const upload: UploadFile = (file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 20
      onProgress(progress)
      if (progress < 100) return
      clearInterval(timer)
      resolve({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, status: 'complete' })
    }, 120)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new Error('Upload canceled.'))
    })
  })

export function ContactForm({ store, navigate, openRecord }: KitPageContext) {
  const toast = Toast.useToastManager()
  const notifyError = useErrorNotification()
  const [attachments, setAttachments] = useState<string[]>([])
  const contracts = store.rows.contracts!.filter((row) => !row.archivedAt)
    .map((row) => ({ value: row.id, label: row.name }))
  const invoices = store.rows.invoices!.filter((row) => !row.archivedAt).slice(0, 60)
    .map((row) => ({ value: row.id, label: `${row.name} · ${row.period}` }))
  const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<TicketValues>({
    defaultValues: {
      subject: '',
      category: 'technical',
      priority: 'normal',
      contract: mainContract(store.rows.contracts)?.id ?? null,
      invoice: null,
      description: '',
    },
  })
  const locked = isSubmitting
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <form
        noValidate
        aria-busy={isSubmitting}
        className='mx-auto w-full max-w-[640px] p-6 max-[600px]:p-4'
        onSubmit={handleSubmit(async (values) => {
          try {
            // The in-memory store answers at once; the pause stands in for the request so the locked state shows.
            await new Promise((resolve) => setTimeout(resolve, 600))
            const ticket = store.create('tickets', values.subject.trim(), {
              status: 'open',
              category: values.category,
              priority: values.priority,
              requester: 'c1',
              assignee: '',
              contract: values.contract ?? '',
              invoice: values.category === 'billing' ? values.invoice ?? '' : '',
              description: values.description.trim(),
              attachments: attachments.join(', '),
            })
            toast.add({ title: 'Ticket sent', description: 'We reply within one business day.' })
            openRecord('tickets', ticket.id)
          } catch (error) {
            notifyError?.(error, 'Unable to send your ticket.')
          }
        })}
      >
        <p className='m-0 mb-6 text-[13px] text-muted-foreground'>
          Tell us what happened and we reply within one business day. You can follow the reply on the ticket.
        </p>
        <FieldGroup>
          <Controller
            name='subject'
            control={control}
            rules={{ validate: (value) => !!value.trim() || 'Enter a subject.' }}
            render={({ field, fieldState }) => (
              <Field label='Subject' required error={fieldState.error?.message}>
                {(props) => (
                  <Input
                    {...props}
                    autoFocus
                    disabled={locked}
                    placeholder='Webhook deliveries failing since this morning'
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              </Field>
            )}
          />
          <div className='grid grid-cols-2 gap-4 max-[600px]:grid-cols-1'>
            <Controller
              name='category'
              control={control}
              render={({ field }) => (
                <Field label='Category'>
                  {(props) => (
                    <Select
                      id={props.id}
                      label='Category'
                      items={ticketCategories}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={locked}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name='priority'
              control={control}
              render={({ field }) => (
                <Field label='Priority' description='Urgent means your team cannot work.'>
                  {(props) => (
                    <Select
                      id={props.id}
                      label='Priority'
                      items={priorities}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={locked}
                    />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name='contract'
            control={control}
            render={({ field }) => (
              <Field label='Contract'>
                {(props) => (
                  <SingleCombobox
                    id={props.id}
                    label='Contract'
                    items={contracts}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={locked}
                  />
                )}
              </Field>
            )}
          />
          {watch('category') === 'billing' && (
            <Controller
              name='invoice'
              control={control}
              rules={{ validate: (value) => !!value || 'Choose the invoice your question is about.' }}
              render={({ field, fieldState }) => (
                <Field label='Invoice' required error={fieldState.error?.message}>
                  {(props) => (
                    <SingleCombobox
                      id={props.id}
                      label='Invoice'
                      invalid={props.invalid}
                      items={invoices}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={locked}
                    />
                  )}
                </Field>
              )}
            />
          )}
          <Controller
            name='description'
            control={control}
            rules={{
              validate: (value) =>
                value.trim().length >= 20 || 'Describe the problem in at least 20 characters so we can help.',
            }}
            render={({ field, fieldState }) => (
              <Field
                label='What happened?'
                required
                description='Steps, what you expected and what you saw instead.'
                error={fieldState.error?.message}
              >
                {(props) => (
                  <Textarea
                    {...props}
                    rows={6}
                    disabled={locked}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              </Field>
            )}
          />
          <div className='flex flex-col gap-[7px]'>
            <span className='text-[length:var(--dir-text-label)] font-medium text-muted-foreground'>
              Screenshots or logs
            </span>
            <FileUpload
              upload={upload}
              accept='image/*,.pdf,.txt,.log,.csv'
              maxSize={10 * 1024 * 1024}
              disabled={locked}
              label='Attach screenshots or logs'
              onComplete={(file) => setAttachments((previous) => [...previous, file.name])}
            />
          </div>
        </FieldGroup>
        <div className='mt-6 flex justify-end gap-2 max-[600px]:flex-col-reverse'>
          <Button type='button' onClick={() => navigate('/tickets')} disabled={locked}>Cancel</Button>
          <Button variant='default' type='submit' disabled={locked} className='min-w-[120px]'>
            {isSubmitting ? 'Sending…' : 'Send ticket'}
          </Button>
        </div>
      </form>
    </div>
  )
}
