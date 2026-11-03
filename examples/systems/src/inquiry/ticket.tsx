// The ticket record page: the conversation with the customer, a reply box filled from macros, and the header actions
// that move a ticket along (assign, resolve, close, reopen).
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { Field } from '@/components/ui/field.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import type { KitDetailContext } from '@/components/systems/kit/types.ts'
import { channels, replyPrefix, shortDate, today, unresolved, users } from '@/components/systems/inquiry/objects.tsx'

const me = users[0]!
const time = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
const Avatar = ({ name }: { name: string }) => (
  <span className='inline-grid size-7 shrink-0 place-items-center rounded-full bg-(--ui-hover) text-[12px] font-medium text-foreground'>
    {name[0] ?? '?'}
  </span>
)

/** Header buttons; the one primary action is the next step in the ticket's life. */
export function TicketActions({ store, record }: KitDetailContext) {
  if (record.archivedAt) return null
  const status = String(record.values.status)
  const set = (values: Record<string, unknown>) => store.update('tickets', record.id, { values })
  if (unresolved.has(status)) {
    return (
      <>
        {record.values.assignee !== me.value && (
          <Button onClick={() => set({ assignee: me.value })}>Assign to me</Button>
        )}
        <Button variant='default' onClick={() => set({ status: 'resolved', resolvedAt: today })}>Resolve</Button>
      </>
    )
  }
  if (status === 'resolved') {
    return (
      <>
        <Button onClick={() => set({ status: 'open', resolvedAt: '' })}>Reopen</Button>
        <Button variant='default' onClick={() => set({ status: 'closed' })}>Close ticket</Button>
      </>
    )
  }
  return <Button variant='default' onClick={() => set({ status: 'open', resolvedAt: '' })}>Reopen</Button>
}

/** The customer's message and every reply sent, oldest first, with the reply box below. */
export function Conversation({ store, record }: KitDetailContext) {
  const notifyError = useErrorNotification()
  const [macro, setMacro] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const values = record.values
  const customer = store.find('customers', String(values.customer ?? ''))
  const contact = String(customer?.values.contact ?? '') || customer?.name || 'Customer'
  const channel = channels.find((item) => item.value === values.channel)?.label
  const replies = store.state.notes
    .filter((note) => note.objectId === 'tickets' && note.recordId === record.id && note.body.startsWith(replyPrefix))
    .reverse()
  const macroChoices = store.rows.macros!.filter((row) => !row.archivedAt).map((row) => ({
    value: row.id,
    label: row.name,
    description: String(row.category ?? ''),
  }))
  const applyMacro = (id: string | null) => {
    setMacro(id)
    const body = id ? String(store.find('macros', id)?.values.body ?? '') : ''
    if (!body) return
    setDraft(`Hello ${contact.split(' ')[0]},\n\n${body}\n\nBest regards,\n${me.label}`)
    setError('')
  }
  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) {
      setError('Write a reply or choose a macro before sending.')
      return
    }
    setSending(true)
    try {
      // The in-memory store answers at once; sending through a mail API would be awaited here.
      await Promise.resolve(store.addNote('tickets', record.id, `${replyPrefix}${draft.trim()}`))
      store.update('tickets', record.id, {
        values: { status: 'waiting', ...values.assignee ? {} : { assignee: me.value } },
      })
      setDraft('')
      setMacro(null)
    } catch (caught) {
      notifyError?.(caught, 'Unable to send the reply.')
    } finally {
      setSending(false)
    }
  }
  return (
    <div className='flex flex-col gap-5'>
      <List aria-label='Conversation' className='rounded-lg border border-border'>
        <ListItem
          className='px-3'
          leading={<Avatar name={contact} />}
          title={customer ? `${contact} · ${customer.name}` : contact}
          meta={[channel && `via ${channel}`, values.receivedAt && shortDate(String(values.receivedAt))]
            .filter(Boolean).join(' · ')}
        >
          <p className='m-0 mt-1 whitespace-pre-wrap leading-5'>
            {String(values.description ?? '') || 'No message was recorded with this ticket.'}
          </p>
        </ListItem>
        {replies.map((reply) => (
          <ListItem
            key={reply.id}
            className='px-3'
            leading={<Avatar name={reply.author} />}
            title={reply.author}
            meta={`Reply sent ${time(reply.at)}`}
          >
            <p className='m-0 mt-1 whitespace-pre-wrap leading-5'>{reply.body.slice(replyPrefix.length)}</p>
          </ListItem>
        ))}
      </List>
      {!record.archivedAt && (
        <form noValidate aria-busy={sending} className='flex flex-col gap-4' onSubmit={send}>
          <Field label='Macro' description='Fills the reply with a canned answer you can edit.'>
            {(props) => (
              <SingleCombobox
                id={props.id}
                label='Macro'
                disabled={sending}
                items={macroChoices}
                value={macro}
                onValueChange={applyMacro}
              />
            )}
          </Field>
          <Field
            label={`Reply to ${contact}`}
            description='Sending sets the status to Waiting on customer.'
            error={error || undefined}
          >
            {(props) => (
              <Textarea
                {...props}
                rows={7}
                disabled={sending}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  if (error) setError('')
                }}
              />
            )}
          </Field>
          <div className='flex justify-end'>
            <Button type='submit' disabled={sending} className='min-w-[120px]'>
              {sending ? 'Sending…' : 'Send reply'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
