import { useRef, useState } from 'react'
import { DataGrid } from '@/components/data-grid/data-grid.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ConfirmDialog } from '@/components/ui/confirm-dialog.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { ErrorState } from '@/components/ui/error-state.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import {
  createSaveGate,
  type NextAction,
  validateNextAction,
  type Workflow,
  workflows,
  type WorkRecord,
} from './model.ts'

/** Documentation prototype: all writes stay in memory; planning never sends an email or review request. */
export function WorkflowDemo() {
  const [workflow, setWorkflow] = useState(workflows[0]!)
  return (
    <section className='flex min-w-0 flex-col gap-4' aria-label='Business workflow prototype'>
      <h2 className='text-base font-semibold tracking-tight'>One purpose, one pattern</h2>
      <p className='text-sm text-muted-foreground'>
        Find a record, open its details, record an update, then plan the next action. This prototype saves in memory;
        switching business or reloading resets it. Planning does not send messages or submit evaluations.
      </p>
      <Field label='Business'>
        {(props) => (
          <Select
            {...props}
            label='Business'
            items={workflows.map(({ id, label }) => ({ value: id, label }))}
            value={workflow.id}
            onChange={(id) => setWorkflow(workflows.find((item) => item.id === id)!)}
          />
        )}
      </Field>
      <WorkflowExample key={workflow.id} workflow={workflow} />
    </section>
  )
}
function WorkflowExample({ workflow }: { workflow: Workflow }) {
  const [records, setRecords] = useState(workflow.records)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [mode, setMode] = useState('ready')
  const [notice, setNotice] = useState('')
  const record = records.find((item) => item.id === selected)
  const rows = records.filter((item) =>
    `${item.name} ${item.status} ${item.next.action}`.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <Field label='Preview data state'>
        {(props) => (
          <Select
            {...props}
            label='Preview data state'
            value={mode}
            onChange={setMode}
            items={[
              { value: 'ready', label: 'Ready' },
              { value: 'loading', label: 'Loading' },
              { value: 'empty', label: 'No data' },
              { value: 'error', label: 'Load failed' },
            ]}
          />
        )}
      </Field>
      <Field label='Search records'>
        {(props) => (
          <Input
            {...props}
            type='search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}
      </Field>
      <p role='status' className='text-sm text-muted-foreground'>{notice}</p>
      {mode === 'loading'
        ? (
          <div role='status' aria-label='Loading records' className='flex flex-col gap-3'>
            {[0, 1, 2].map((key) => <Skeleton key={key} className='h-10 w-full' />)}
          </div>
        )
        : mode === 'error'
        ? <ErrorState message='Unable to load records.' retry={() => setMode('ready')} />
        : mode === 'empty'
        ? (
          <EmptyState title='No records yet'>
            <Button type='button' onClick={() => setMode('ready')}>Load sample records</Button>
          </EmptyState>
        )
        : rows.length === 0
        ? (
          <EmptyState title='No matching records'>
            <Button type='button' onClick={() => setSearch('')}>Clear search</Button>
          </EmptyState>
        )
        : (
          <>
            <div className='hidden min-w-0 md:block'>
              <DataGrid
                rows={rows}
                rowKeyGetter={(row) => row.id}
                columnMenus={false}
                columns={[
                  {
                    key: 'name',
                    name: 'Record',
                    renderCell: ({ row }) => (
                      <Button
                        type='button'
                        variant='link'
                        onClick={() => setSelected(row.id)}
                      >
                        {row.name}
                      </Button>
                    ),
                  },
                  {
                    key: 'status',
                    name: 'Status',
                    renderCell: ({ row }) => (
                      <ChoiceContent item={{ value: row.status, label: row.status, color: 'var(--ui-muted)' }} />
                    ),
                  },
                  { key: 'next', name: 'Next action', renderCell: ({ row }) => row.next.action },
                  {
                    key: 'owner',
                    name: 'Action owner',
                    renderCell: ({ row }) => row.next.owner,
                  },
                ]}
              />
            </div>
            <List className='md:hidden'>
              {rows.map((row) => (
                <ListItem
                  key={row.id}
                  title={row.name}
                  description={`${row.status} · ${row.next.action}`}
                  onOpen={() => setSelected(row.id)}
                />
              ))}
            </List>
          </>
        )}
      {record && (
        <RecordForm
          key={record.id}
          record={record}
          actionLabel={workflow.action}
          onClose={() => setSelected(null)}
          onSave={(note, next) => {
            setRecords((current) =>
              current.map((item) =>
                item.id === record.id
                  ? {
                    ...item,
                    note,
                    next,
                    history: [...item.history, `Planned: ${next.action} · ${next.owner} · ${next.due}`],
                  }
                  : item
              )
            )
            setNotice('Update and next action saved. No message was sent.')
            return Promise.resolve()
          }}
        />
      )}
    </div>
  )
}
function RecordForm({ record, actionLabel, onClose, onSave }: {
  record: WorkRecord
  actionLabel: string
  onClose: () => void
  onSave: (note: string, next: NextAction) => Promise<void>
}) {
  const [note, setNote] = useState(record.note)
  const [next, setNext] = useState(record.next)
  const [errors, setErrors] = useState<Partial<Record<keyof NextAction, string>>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [failOnce, setFailOnce] = useState(false)
  const [discard, setDiscard] = useState(false)
  const gate = useRef(createSaveGate())
  const dirty = note !== record.note || JSON.stringify(next) !== JSON.stringify(record.next)
  const close = () => {
    if (!saving) {
      if (dirty) setDiscard(true)
      else onClose()
    }
  }
  const save = () =>
    gate.current(async () => {
      const validation = validateNextAction(next)
      setErrors(validation)
      if (Object.keys(validation).length) return
      setSaving(true)
      setSaved(false)
      setError('')
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (failOnce) {
          setFailOnce(false)
          throw new Error('Sample save failed. Your input is kept; retry to save.')
        }
        await onSave(note, next)
        setSaved(true)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to save. Try again.')
      } finally {
        setSaving(false)
      }
    })
  return (
    <Dialog
      open
      title={record.name}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      footer={
        <div className='flex flex-wrap justify-end gap-2'>
          <Button type='button' onClick={close} disabled={saving}>Close</Button>
          <Button type='submit' form={`workflow-${record.id}`} variant='default' disabled={saving}>
            <span className='grid'>
              <span className={saving ? 'invisible col-start-1 row-start-1' : 'col-start-1 row-start-1'}>
                Save update and plan
              </span>
              <span
                aria-hidden={!saving}
                className={saving ? 'col-start-1 row-start-1' : 'invisible col-start-1 row-start-1'}
              >
                Saving…
              </span>
            </span>
          </Button>
        </div>
      }
    >
      <form
        id={`workflow-${record.id}`}
        noValidate
        aria-busy={saving}
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        className='flex flex-col gap-4 p-4'
      >
        <p className='text-sm text-muted-foreground'>
          {record.status} · {actionLabel}. Saving a plan does not send it.
        </p>
        <fieldset disabled={saving} className='flex min-w-0 flex-col gap-4'>
          <Field label='Update'>
            {(props) => <Textarea {...props} value={note} onChange={(event) => setNote(event.target.value)} />}
          </Field>
          {(['action', 'owner', 'due', 'completion'] as const).map((key) => (
            <Field
              key={key}
              label={{
                action: 'Next action',
                owner: 'Action owner',
                due: 'Due date',
                completion: 'Completion condition',
              }[key]}
              required
              error={errors[key]}
            >
              {(props) => (
                <Input
                  {...props}
                  type={key === 'due' ? 'date' : 'text'}
                  value={next[key]}
                  onChange={(event) => setNext({ ...next, [key]: event.target.value })}
                />
              )}
            </Field>
          ))}
          <Button type='button' onClick={() => setFailOnce(true)} disabled={failOnce}>
            {failOnce ? 'Next save will fail once' : 'Test a save failure'}
          </Button>
        </fieldset>
        {error && (
          <ErrorState
            message={error}
            retry={saving ? undefined : () => {
              void save()
            }}
          />
        )}
        {saved && <p role='status' className='text-sm'>Saved. The list and history now include this plan.</p>}
        <ConfirmDialog
          open={discard}
          onOpenChange={setDiscard}
          title='Discard changes?'
          description={`Your unsaved update to ${record.name} will be lost.`}
          action='Discard changes'
          onConfirm={onClose}
          busy={saving}
        />
        <h3 className='text-sm font-semibold'>History</h3>
        {record.history.length
          ? <List>{record.history.map((entry, index) => <ListItem key={index} title={entry} />)}</List>
          : <p className='text-sm text-muted-foreground'>No updates yet.</p>}
      </form>
    </Dialog>
  )
}
