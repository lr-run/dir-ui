import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  FileTextIcon,
  HistoryIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  VideoIcon,
} from 'lucide-react'
import { type ReactNode, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { type Note, RichText, type RichTextValue } from '@/components/ui/rich-text.tsx'
import { ConfirmDialog } from '@/components/ui/alert-dialog.tsx'
import { NoteContent } from '@/components/crm/components/record-notes.tsx'
import {
  ChoiceField,
  localDateTime,
  recordChoices,
  TextField,
  utcDateTime,
} from '@/components/crm/components/record-fields.tsx'
import { fieldLabels } from '@/components/crm/example/data.ts'
import type { Activity, ChangeEntry, CrmStore, ExampleRecord } from '@/components/crm/types.ts'
import type { ActivityDraft } from '@/components/crm/example/store.ts'
const types = [{ value: 'call', label: 'Call' }, { value: 'email', label: 'Email' }, {
  value: 'meeting',
  label: 'Meeting',
}, { value: 'note', label: 'Note' }]
const icons = { call: PhoneIcon, email: MailIcon, meeting: VideoIcon, note: FileTextIcon }
function document(body: string): Note {
  try {
    const value = JSON.parse(body)
    if (value && value.type === 'doc' && Array.isArray(value.content)) return value
  } catch { /* Plain-text activities remain readable. */ }
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }] }
}
function FeedHeader({ title, count, actions }: { title: string; count: number; actions?: ReactNode }) {
  return (
    <header className='mb-4 flex min-h-7 flex-wrap items-center gap-2'>
      <h3 className='text-sm font-medium'>{title}</h3>
      <span className='text-xs text-muted-foreground'>{count}</span>
      {actions && <div className='ml-auto flex items-center gap-2'>{actions}</div>}
    </header>
  )
}
function FeedEntry({ icon, title, actor, date, endDate, updateCount, actions, children }: {
  icon: ReactNode
  title: string
  actor: string
  date: string
  endDate?: string
  updateCount?: number
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <article className='rounded-lg border border-border p-4'>
      <header className='flex items-start gap-3'>
        <span className='grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground'>
          {icon}
        </span>
        <div className='min-w-0 flex-1'>
          <h4 className='text-sm font-medium break-words'>{title}</h4>
          <p className='mt-1 text-xs text-muted-foreground'>
            {actor} · <time dateTime={date}>{new Date(date).toLocaleString()}</time>
            {endDate && endDate !== date && (
              <>
                {' – '}
                <time dateTime={endDate}>
                  {new Date(date).toDateString() === new Date(endDate).toDateString()
                    ? new Date(endDate).toLocaleTimeString()
                    : new Date(endDate).toLocaleString()}
                </time>
              </>
            )}
            {updateCount && updateCount > 1 ? <span>· {updateCount} updates</span> : null}
          </p>
        </div>
        {actions && <div className='flex shrink-0 items-center gap-1'>{actions}</div>}
      </header>
      <div className='mt-4 text-sm'>{children}</div>
    </article>
  )
}
function FeedEmpty({ children }: { children: ReactNode }) {
  return (
    <p className='rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'>
      {children}
    </p>
  )
}
function HistoryValue({ field, value, label }: { field: string; value: unknown; label?: string }) {
  if (field === 'body' && value) return <NoteContent body={document(String(value))} />
  if (label) return <>{label}</>
  if (value === null || value === undefined || value === '') return <>—</>
  if (field.endsWith('At') && typeof value === 'string') {
    return <time dateTime={value}>{new Date(value).toLocaleString()}</time>
  }
  if (field === 'status') {
    const labels: Record<string, string> = {
      todo: 'To do',
      in_progress: 'In progress',
      done: 'Done',
      cancelled: 'Cancelled',
    }
    return <>{labels[String(value)] ?? String(value)}</>
  }
  return <>{String(value)}</>
}
export type HistoryGroup = ChangeEntry & { startedAt: string; entryIds: string[] }
const historyWindowMs = 5 * 60 * 1000

/** Presentation only. Input is newest-first, including insertion order when timestamps tie. */
export function groupHistoryEntries(entries: readonly ChangeEntry[]): HistoryGroup[] {
  const groups: HistoryGroup[] = []
  const chronological = [...entries].reverse().sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
  for (const entry of chronological) {
    const previous = groups.at(-1)
    const elapsed = previous ? Date.parse(entry.createdAt) - Date.parse(previous.startedAt) : NaN
    if (
      previous && previous.operation === 'update' && entry.operation === 'update' &&
      previous.entity === entry.entity && previous.recordId === entry.recordId &&
      entry.actorId && previous.actorId === entry.actorId && elapsed >= 0 && elapsed <= historyWindowMs
    ) {
      for (const [field, change] of Object.entries(entry.changes)) {
        const first = previous.changes[field]
        previous.changes[field] = first
          ? { before: first.before, beforeLabel: first.beforeLabel, after: change.after, afterLabel: change.afterLabel }
          : { ...change }
      }
      previous.createdAt = entry.createdAt
      previous.actor = entry.actor
      previous.entryIds.push(entry.id)
    } else {
      groups.push({
        ...entry,
        startedAt: entry.createdAt,
        entryIds: [entry.id],
        changes: Object.fromEntries(Object.entries(entry.changes).map(([field, change]) => [field, { ...change }])),
      })
    }
  }
  return groups.reverse()
}

export function History({ entries }: { entries: ChangeEntry[] }) {
  const groups = useMemo(() => groupHistoryEntries(entries), [entries])
  const titles = {
    create: 'Record created',
    update: 'Record updated',
    archive: 'Record archived',
    restore: 'Record restored',
    delete: 'Record deleted',
  }
  return (
    <section aria-label='Record history'>
      <FeedHeader title='History' count={groups.length} />
      {!entries.length && <FeedEmpty>No changes yet.</FeedEmpty>}
      <div className='grid gap-3'>
        {groups.map((e) => (
          <FeedEntry
            key={e.id}
            icon={<HistoryIcon size={16} strokeWidth={1.5} aria-hidden />}
            title={titles[e.operation]}
            actor={e.actor}
            date={e.startedAt}
            endDate={e.createdAt}
            updateCount={e.entryIds.length}
          >
            <dl className='grid gap-3 text-xs'>
              {Object.entries(e.changes).map(([key, v]) => (
                <div
                  key={key}
                  className='grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3 max-[500px]:grid-cols-1 max-[500px]:gap-1'
                >
                  <dt className='text-muted-foreground'>{fieldLabels[key] ?? key}</dt>
                  <dd className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 break-words'>
                    <div className='min-w-0 text-muted-foreground'>
                      <HistoryValue field={key} value={v.before} label={v.beforeLabel} />
                    </div>
                    <span aria-label='changed to' className='text-muted-foreground'>→</span>
                    <div className='min-w-0'>
                      <HistoryValue field={key} value={v.after} label={v.afterLabel} />
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </FeedEntry>
        ))}
      </div>
    </section>
  )
}
export function Activities({ record, store }: { record: ExampleRecord; store: CrmStore }) {
  const [editing, setEditing] = useState<Activity | 'new' | null>(null),
    [archived, setArchived] = useState(false),
    [target, setTarget] = useState<Activity | null>(null),
    [error, setError] = useState('')
  const data = record.data, companyId = data.kind === 'companies' ? data.id : data.companyId
  const all = useMemo(
    () =>
      store.state.activities.filter((a) =>
        data.kind === 'companies'
          ? a.companyId === data.id
          : data.kind === 'deals'
          ? a.dealId === data.id
          : a.personId === data.id
      ).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id)),
    [store.state.activities, data.kind, data.id],
  )
  const items = all.filter((a) => !!a.archivedAt === archived)
  return (
    <section aria-label='Activities'>
      <FeedHeader
        title='Activities'
        count={items.length}
        actions={
          <>
            <Button aria-pressed={archived} onClick={() => setArchived(!archived)} className='h-7 text-xs'>
              <ArchiveIcon size={14} strokeWidth={1.5} aria-hidden />
              {archived ? 'Archived' : 'Archive'}
            </Button>
            <Button
              disabled={!!record.archivedAt}
              onClick={() => setEditing('new')}
              className='h-7 text-xs'
            >
              <PlusIcon size={14} strokeWidth={1.5} aria-hidden />Add activity
            </Button>
          </>
        }
      />
      {error && <p role='alert' className='mb-3 text-xs text-destructive'>{error}</p>}
      {!items.length && (
        <FeedEmpty>
          {archived ? 'No archived activities.' : 'No activities yet. Record a call, email, meeting, or note.'}
        </FeedEmpty>
      )}
      <div className='grid gap-3'>
        {items.map((a) => {
          const Icon = icons[a.type]
          return (
            <FeedEntry
              key={a.id}
              icon={<Icon size={16} strokeWidth={1.5} aria-hidden />}
              title={a.name}
              actor={`${types.find((t) => t.value === a.type)?.label} · ${
                store.state.users.find((u) => u.id === a.createdBy)?.name ?? 'System'
              }`}
              date={a.occurredAt}
              actions={
                <>
                  {!a.archivedAt && (
                    <IconButton
                      label={`Edit ${a.name}`}
                      disabled={!!record.archivedAt}
                      variant='ghost'
                      onClick={() => setEditing(a)}
                    >
                      <PencilIcon size={14} />
                    </IconButton>
                  )}
                  <IconButton
                    label={`${a.archivedAt ? 'Restore' : 'Archive'} ${a.name}`}
                    variant='ghost'
                    disabled={!!record.archivedAt}
                    onClick={() => setTarget(a)}
                  >
                    {a.archivedAt ? <ArchiveRestoreIcon size={14} /> : <ArchiveIcon size={14} />}
                  </IconButton>
                </>
              }
            >
              <div>
                <NoteContent body={document(a.body)} />
              </div>
              <p className='mt-3 text-xs text-muted-foreground'>
                {[a.dealId, a.personId].filter(Boolean).map((id) =>
                  store.state.records.find((r) => r.id === id)?.name ?? id
                ).join(' · ')}
              </p>
            </FeedEntry>
          )
        })}
      </div>
      {editing && (
        <ActivityForm
          key={editing === 'new' ? 'new' : editing.id}
          activity={editing === 'new' ? undefined : editing}
          companyId={companyId}
          dealId={data.kind === 'deals' ? data.id : ''}
          personId={data.kind === 'people' ? data.id : ''}
          store={store}
          onClose={() => setEditing(null)}
        />
      )}
      {target && (
        <ConfirmDialog
          open
          title={`${target.archivedAt ? 'Restore' : 'Archive'} activity?`}
          description='The activity and its history are retained.'
          action={target.archivedAt ? 'Restore' : 'Archive'}
          onOpenChange={(open) => {
            if (!open) setTarget(null)
          }}
          onConfirm={async () => {
            try {
              await store.archiveActivity(target.id, !!target.archivedAt)
              setError('')
              setTarget(null)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Unable to update.')
              setTarget(null)
            }
          }}
        />
      )}
    </section>
  )
}
function ActivityForm(
  { activity, companyId, dealId, personId, store, onClose }: {
    activity?: Activity
    companyId: string
    dealId: string
    personId: string
    store: CrmStore
    onClose: () => void
  },
) {
  const body = useRef<RichTextValue>({ notesDoc: document(activity?.body ?? ''), notes: '' })
  const { register, control, watch, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<
    ActivityDraft
  >({
    defaultValues: {
      name: activity?.name ?? '',
      type: activity?.type ?? 'note',
      companyId: activity?.companyId ?? companyId,
      dealId: activity?.dealId ?? dealId,
      personId: activity?.personId ?? personId,
      occurredAt: localDateTime(activity?.occurredAt ?? new Date().toISOString()),
      body: activity?.body ?? '',
    },
  })
  const company = watch('companyId')
  return (
    <Dialog
      open
      title={activity ? 'Edit activity' : 'Add activity'}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='default' disabled={isSubmitting} form='activity-form' type='submit'>Save activity</Button>
        </div>
      }
    >
      <form
        id='activity-form'
        className='grid gap-4 p-5'
        onSubmit={handleSubmit(async (values) => {
          try {
            await store.saveActivity({
              ...values,
              body: JSON.stringify(body.current.notesDoc),
              occurredAt: utcDateTime(values.occurredAt),
            }, activity?.id)
            onClose()
          } catch (e) {
            setError('root', { message: e instanceof Error ? e.message : 'Unable to save.' })
          }
        })}
      >
        <TextField name='name' label='Subject' register={register} required />
        <ChoiceField name='type' label='Type' control={control} items={types} required />
        <TextField name='occurredAt' label='Occurred at' register={register} type='datetime-local' required />
        <ChoiceField
          name='companyId'
          label='Company'
          control={control}
          items={recordChoices(store.state, 'companies')}
          required
        />
        <ChoiceField
          name='dealId'
          label='Deal'
          control={control}
          items={recordChoices(store.state, 'deals', company, activity?.dealId)}
        />
        <ChoiceField
          name='personId'
          label='Person'
          control={control}
          items={recordChoices(store.state, 'people', company, activity?.personId)}
        />
        <RichText
          label='Activity content'
          initialContent={body.current.notesDoc}
          onUpdate={(value) => {
            body.current = value
          }}
        />
        {errors.root && <p role='alert' className='text-sm text-destructive'>{errors.root.message}</p>}
      </form>
    </Dialog>
  )
}
