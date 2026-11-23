import { useRef, useState } from 'react'
import { ArrowUpIcon, MessageSquareIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { ConfirmDialog } from '@/components/ui/confirm-dialog.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Select } from '@/components/ui/select.tsx'
import { ErrorState } from '@/components/ui/error-state.tsx'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet.tsx'
import { owners, priorities, projects, type Status, statuses, type Task } from './model.ts'
import { icon, Person, Priority, SaveLabel, StatusIcon } from './parts.tsx'
export const items = (values: string[]) => values.map((value) => ({ value, label: value }))
const priorityItems = items(priorities).map((item) => ({
  ...item,
  icon: (
    <span aria-hidden='true' className='inline-flex'>
      <Priority value={item.value} />
    </span>
  ),
}))
export function TaskEditor(
  { task, onClose, onSave, busy }: {
    task: Task
    onClose: () => void
    onSave: (task: Task) => Promise<void>
    busy: boolean
  },
) {
  const [open, setOpen] = useState(true)
  const [draft, setDraft] = useState(task)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [discard, setDiscard] = useState(false)
  const [notice, setNotice] = useState('')
  const lock = useRef(false)
  const retryComment = useRef(false)
  const dirty = draft.title !== task.title || draft.description !== task.description || draft.status !== task.status ||
    draft.priority !== task.priority || draft.owner !== task.owner || draft.due !== task.due
  const close = () => {
    if (!busy) {
      if (dirty || comment.trim()) setDiscard(true)
      else setOpen(false)
    }
  }
  const save = async (withComment = false) => {
    if (lock.current || busy) return
    if (!draft.title.trim()) {
      setError('Enter an issue title.')
      return
    }
    lock.current = true
    retryComment.current = withComment
    setError('')
    try {
      await onSave({
        ...(withComment ? task : draft),
        title: withComment ? task.title : draft.title.trim(),
        comments: withComment ? [...task.comments, { author: 'You', text: comment.trim() }] : task.comments,
        activity: !withComment && dirty ? [...task.activity, 'You updated the issue properties.'] : task.activity,
      })
      if (withComment) setComment('')
      setNotice(withComment ? 'Comment added.' : 'Changes saved.')
    } catch {
      setError('Unable to save. Your changes are kept. Try again.')
    } finally {
      lock.current = false
    }
  }
  return (
    <Sheet
      open={open}
      onOpenChangeComplete={(open) => {
        if (!open) onClose()
      }}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <SheetContent
        backdrop={false}
        className='group/screen-record-sheet group/record-preview'
      >
        <SheetHeader>
          <SheetTitle className='flex-1 text-sm font-medium'>
            {task.project} <span className='text-muted-foreground'>/ {task.id}</span>
          </SheetTitle>
          <IconButton label='Close issue' onClick={close} disabled={busy}>
            <XIcon {...icon} />
          </IconButton>
        </SheetHeader>
        <SheetBody>
          <div className='flex flex-col gap-6 p-5'>
            <form
              id='task-board-edit'
              className='flex flex-col gap-4'
              aria-busy={busy}
              onSubmit={(event) => {
                event.preventDefault()
                void save()
              }}
            >
              <fieldset disabled={busy} className='flex min-w-0 flex-col gap-4'>
                <Field label='Title' required error={!draft.title.trim() ? 'Enter an issue title.' : undefined}>
                  {(props) => (
                    <Input
                      {...props}
                      value={draft.title}
                      onChange={(event) => {
                        setDraft({ ...draft, title: event.target.value })
                        setNotice('')
                      }}
                    />
                  )}
                </Field>
                <Field label='Description'>
                  {(props) => (
                    <Textarea
                      {...props}
                      rows={7}
                      value={draft.description}
                      onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                    />
                  )}
                </Field>
                <div className='grid grid-cols-2 gap-4'>
                  <Field label='Status'>
                    {(props) => (
                      <Select
                        {...props}
                        disabled={busy}
                        label='Status'
                        items={statuses.map((status) => ({ ...status, icon: <StatusIcon status={status.value} /> }))}
                        value={draft.status}
                        onChange={(status) => setDraft({ ...draft, status: status as Status })}
                      />
                    )}
                  </Field>
                  <Field label='Assignee'>
                    {(props) => (
                      <Select
                        {...props}
                        disabled={busy}
                        label='Assignee'
                        items={items(owners)}
                        value={draft.owner}
                        onChange={(owner) => setDraft({ ...draft, owner })}
                      />
                    )}
                  </Field>
                  <Field label='Priority'>
                    {(props) => (
                      <Select
                        {...props}
                        disabled={busy}
                        label='Priority'
                        items={priorityItems}
                        value={draft.priority}
                        onChange={(priority) => setDraft({ ...draft, priority })}
                      />
                    )}
                  </Field>
                  <Field label='Due date'>
                    {(props) => (
                      <Input
                        {...props}
                        type='date'
                        value={draft.due}
                        onChange={(event) => setDraft({ ...draft, due: event.target.value })}
                      />
                    )}
                  </Field>
                </div>
              </fieldset>
              {error && (
                <ErrorState
                  message={error}
                  retry={busy ? undefined : () => {
                    void save(retryComment.current)
                  }}
                />
              )}
              <div className='flex items-center justify-between gap-2'>
                <span role='status' className='text-xs text-muted-foreground'>
                  {notice || (dirty ? 'Unsaved changes' : 'Up to date')}
                </span>
                <Button type='submit' variant='default' disabled={busy || !dirty}>
                  <SaveLabel busy={busy} label='Save changes' />
                </Button>
              </div>
            </form>
            <section className='flex flex-col gap-4 border-t border-border pt-5' aria-label='Activity'>
              <h2 className='text-sm font-semibold'>Activity</h2>
              {task.activity.map((entry, index) => (
                <div key={index} className='flex items-start gap-3 text-xs leading-5 text-muted-foreground'>
                  <StatusIcon status={index === 0 ? 'backlog' : task.status} />
                  <span>{entry}</span>
                </div>
              ))}
              {task.comments.map((comment, index) => (
                <div key={index} className='flex flex-col gap-3 border-t border-border pt-4'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <Person name={comment.author === 'You' ? 'Alex Morgan' : comment.author} />
                    {comment.author}
                  </div>
                  <p className='whitespace-pre-wrap text-sm leading-6'>{comment.text}</p>
                </div>
              ))}
              <form
                className='flex flex-col gap-2'
                onSubmit={(event) => {
                  event.preventDefault()
                  if (comment.trim()) void save(true)
                }}
              >
                <Field label='Leave a comment'>
                  {(props) => (
                    <Textarea
                      {...props}
                      disabled={busy}
                      value={comment}
                      rows={3}
                      placeholder='Share an update or ask a question…'
                      onChange={(event) => setComment(event.target.value)}
                    />
                  )}
                </Field>
                <div className='flex justify-end'>
                  <Button type='submit' disabled={busy || !comment.trim()}>
                    <MessageSquareIcon {...icon} />Comment<ArrowUpIcon {...icon} />
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </SheetBody>
        <ConfirmDialog
          open={discard}
          onOpenChange={setDiscard}
          title='Discard unsaved changes?'
          description={`Your unsaved edits and comment on ${task.id} will be lost.`}
          action='Discard changes'
          onConfirm={() => {
            setDiscard(false)
            setOpen(false)
          }}
          busy={busy}
        />
      </SheetContent>
    </Sheet>
  )
}
export function NewIssue(
  { status, initialOwner = 'Unassigned', initialProject = projects[0]!, onClose, onCreate, busy }: {
    status: Status
    initialOwner?: string
    initialProject?: string
    onClose: () => void
    onCreate: (
      value: Pick<Task, 'title' | 'description' | 'status' | 'owner' | 'priority' | 'project'>,
    ) => Promise<void>
    busy: boolean
  },
) {
  const [title, setTitle] = useState(''),
    [description, setDescription] = useState(''),
    [owner, setOwner] = useState(initialOwner)
  const [nextStatus, setStatus] = useState(status),
    [project, setProject] = useState(initialProject),
    [priority, setPriority] = useState('No priority')
  const [error, setError] = useState(''), [discard, setDiscard] = useState(false)
  const lock = useRef(false)
  const close = () => {
    if (!busy) {
      if (title || description) setDiscard(true)
      else onClose()
    }
  }
  return (
    <Dialog
      open
      title='New issue'
      onOpenChange={(open) => {
        if (!open) close()
      }}
      footer={
        <div className='flex justify-end gap-2'>
          <Button type='button' onClick={close} disabled={busy}>Cancel</Button>
          <Button type='submit' form='task-board-create' variant='default' disabled={busy}>
            <SaveLabel busy={busy} label='Create issue' />
          </Button>
        </div>
      }
    >
      <form
        id='task-board-create'
        className='flex flex-col gap-4 p-5'
        aria-busy={busy}
        onSubmit={async (event) => {
          event.preventDefault()
          if (lock.current || busy) return
          if (!title.trim()) {
            setError('Enter an issue title.')
            return
          }
          lock.current = true
          setError('')
          try {
            await onCreate({ title: title.trim(), description, status: nextStatus, owner, priority, project })
            onClose()
          } catch {
            setError('Unable to create the issue. Your input is kept; try again.')
          } finally {
            lock.current = false
          }
        }}
      >
        <fieldset disabled={busy} className='flex min-w-0 flex-col gap-4'>
          <Field label='Title' required error={error && !title.trim() ? error : undefined}>
            {(props) => (
              <Input
                {...props}
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder='What needs to be done?'
              />
            )}
          </Field>
          <Field label='Description'>
            {(props) => (
              <Textarea
                {...props}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            )}
          </Field>
          <div className='grid grid-cols-2 gap-4'>
            <Field label='Status'>
              {(props) => (
                <Select
                  {...props}
                  disabled={busy}
                  label='Status'
                  items={statuses}
                  value={nextStatus}
                  onChange={(value) => setStatus(value as Status)}
                />
              )}
            </Field>
            <Field label='Assignee'>
              {(props) => (
                <Select
                  {...props}
                  disabled={busy}
                  label='Assignee'
                  items={items(owners)}
                  value={owner}
                  onChange={setOwner}
                />
              )}
            </Field>
            <Field label='Priority'>
              {(props) => (
                <Select
                  {...props}
                  disabled={busy}
                  label='Priority'
                  items={priorityItems}
                  value={priority}
                  onChange={setPriority}
                />
              )}
            </Field>
            <Field label='Project'>
              {(props) => (
                <Select
                  {...props}
                  disabled={busy}
                  label='Project'
                  items={items(projects)}
                  value={project}
                  onChange={setProject}
                />
              )}
            </Field>
          </div>
        </fieldset>
        {error && title.trim() && <p role='alert' className='text-sm text-destructive'>{error}</p>}
        <ConfirmDialog
          open={discard}
          onOpenChange={setDiscard}
          title='Discard new issue?'
          description='Your unsaved issue will be lost.'
          action='Discard issue'
          onConfirm={onClose}
        />
      </form>
    </Dialog>
  )
}
