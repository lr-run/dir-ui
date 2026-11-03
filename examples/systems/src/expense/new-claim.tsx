// The claim form: a summary, repeatable line items with a running total, and receipts. It locks while it submits,
// creates the claim and its line items through the store, then opens the new claim.
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FileUpload, type UploadFile } from '@/components/collections/files.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Toast } from '@/components/ui/toast.tsx'
import { NumberValue } from '@/components/ui/value.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { createId } from '@/components/systems/kit/store.ts'
import type { KitPageContext } from '@/components/systems/kit/types.ts'
import {
  categories,
  costCenters,
  icon,
  me,
  periodOf,
  today,
  userName,
  users,
  yen,
} from '@/components/systems/expense/model.tsx'

type Line = { key: string; date: string; category: string; amount: string; note: string }
type Mode = 'submit' | 'draft'
type Values = { title: string; lines: Line[]; receiptNote: string; receipts: number }
const maxLines = 20
const blankLine = (date = today()): Line => ({ key: createId(), date, category: 'travel', amount: '', note: '' })
const approvers = users.filter((user) => user.value !== me)

/** Errors by field key; line fields are keyed `<line key>.<field>`. Drafts skip the receipt check. */
function validate({ title, lines, receiptNote, receipts }: Values, mode: Mode) {
  const errors: Record<string, string> = {}
  if (!title.trim()) errors.title = 'Enter a title, such as the trip or the event.'
  else if (title.trim().length > 80) errors.title = 'Keep the title under 80 characters.'
  for (const line of lines) {
    if (!line.date) errors[`${line.key}.date`] = 'Enter the date on the receipt.'
    else if (line.date > today()) errors[`${line.key}.date`] = 'The date cannot be in the future.'
    const amount = Number(line.amount)
    if (line.amount.trim() === '') errors[`${line.key}.amount`] = 'Enter the amount.'
    else if (!Number.isInteger(amount) || amount <= 0) {
      errors[`${line.key}.amount`] = 'Enter a whole yen amount above zero.'
    } else if (amount > 1_000_000) errors[`${line.key}.amount`] = 'Amounts over ¥1,000,000 need a purchase request.'
  }
  if (mode === 'submit' && !receipts && !receiptNote.trim()) {
    errors.receiptNote = 'Attach a receipt, or say here why there is none.'
  }
  return errors
}

// Stands in for a storage upload: reports progress, then returns the stored file.
const upload: UploadFile = (file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 20
      onProgress(progress)
      if (progress < 100) return
      clearInterval(timer)
      resolve({ id: createId(), name: file.name, size: file.size, type: file.type, status: 'complete' })
    }, 160)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new Error('Upload canceled.'))
    })
  })

export function NewClaimAction({ navigate }: KitPageContext) {
  return (
    <Button variant='default' onClick={() => navigate('/new')}>
      <PlusIcon aria-hidden='true' />New claim
    </Button>
  )
}

export function NewClaimPage({ store, openRecord }: KitPageContext) {
  const toast = Toast.useToastManager()
  const notifyError = useErrorNotification()
  const [title, setTitle] = useState('')
  const [costCenter, setCostCenter] = useState('sales')
  const [approver, setApprover] = useState('u4')
  const [lines, setLines] = useState<Line[]>(() => [blankLine()])
  const [receiptNote, setReceiptNote] = useState('')
  const [receipts, setReceipts] = useState<string[]>([])
  // Errors show after the first attempt and then follow every change.
  const [checked, setChecked] = useState<Mode | null>(null)
  const [busy, setBusy] = useState<Mode | null>(null)
  const [attempt, setAttempt] = useState(0)
  const form = useRef<HTMLFormElement>(null)
  const values: Values = { title, lines, receiptNote, receipts: receipts.length }
  const errors = checked ? validate(values, checked) : {}
  const total = lines.reduce((sum, line) => sum + (Number(line.amount) > 0 ? Number(line.amount) : 0), 0)
  const locked = !!busy
  useEffect(() => {
    if (attempt) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [attempt])

  const change = (key: string, patch: Partial<Line>) =>
    setLines((previous) => previous.map((line) => line.key === key ? { ...line, ...patch } : line))
  const save = async (mode: Mode) => {
    setChecked(mode)
    if (Object.keys(validate(values, mode)).length) return setAttempt((value) => value + 1)
    setBusy(mode)
    try {
      // The in-memory store answers at once; the pause stands in for the API call so the locked state shows.
      await new Promise((resolve) => setTimeout(resolve, 900))
      const first = lines.map((line) => line.date).sort()[0]!
      const claim = store.create('claims', title.trim(), {
        status: mode === 'submit' ? 'submitted' : 'draft',
        total,
        submitter: me,
        approver,
        costCenter,
        period: periodOf(first),
        submittedAt: mode === 'submit' ? today() : null,
        receiptNote: [receiptNote.trim(), receipts.length ? `Attached: ${receipts.join(', ')}` : '']
          .filter(Boolean).join('\n'),
      })
      for (const line of lines) {
        const category = categories.find((item) => item.value === line.category)!.label
        store.create('lines', line.note.trim() || `${category} on ${line.date}`, {
          claim: claim.id,
          amount: Number(line.amount),
          date: line.date,
          category: line.category,
          receipt: receipts.length > 0,
        })
      }
      toast.add(
        mode === 'submit'
          ? { title: 'Claim submitted', description: `${yen(total)} sent to ${userName(approver)} for approval.` }
          : { title: 'Draft saved', description: 'Submit it from My claims when it is ready.' },
      )
      openRecord('claims', claim.id)
    } catch (error) {
      notifyError?.(error, 'Unable to save the claim.')
      setBusy(null)
    }
  }

  return (
    <form
      ref={form}
      noValidate
      aria-busy={locked}
      aria-label='New claim'
      className='flex min-h-0 flex-1 flex-col'
      onSubmit={(event) => {
        event.preventDefault()
        void save('submit')
      }}
    >
      <div className='min-h-0 flex-1 overflow-auto'>
        <div className='mx-auto flex w-full max-w-[640px] flex-col gap-8 p-6 max-[600px]:gap-6 max-[600px]:p-4'>
          <FieldSet>
            <FieldLegend>Summary</FieldLegend>
            <FieldGroup>
              <Field label='Title' required error={errors.title}>
                {(props) => (
                  <Input
                    {...props}
                    autoFocus
                    disabled={locked}
                    placeholder='e.g. Osaka client visit'
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                )}
              </Field>
              <div className='grid grid-cols-2 gap-4 max-[600px]:grid-cols-1'>
                <Field label='Cost center'>
                  {(props) => (
                    <Select
                      id={props.id}
                      label='Cost center'
                      items={costCenters}
                      value={costCenter}
                      disabled={locked}
                      onChange={setCostCenter}
                    />
                  )}
                </Field>
                <Field label='Approver' description='Approves claims for this cost center.'>
                  {(props) => (
                    <Select
                      id={props.id}
                      label='Approver'
                      items={approvers}
                      value={approver}
                      disabled={locked}
                      onChange={setApprover}
                    />
                  )}
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Line items</FieldLegend>
            <FieldDescription>One line per receipt. Amounts are in yen, tax included.</FieldDescription>
            <ol className='m-0 flex flex-col gap-3 p-0 [&>li]:list-none'>
              {lines.map((line, index) => (
                <li key={line.key} className='rounded-lg border border-border p-4 max-[600px]:p-3'>
                  <div className='mb-3 flex h-7 items-center justify-between gap-2'>
                    <span className='text-[13px] font-medium'>Line {index + 1}</span>
                    <IconButton
                      type='button'
                      variant='ghost'
                      label={`Remove line ${index + 1}`}
                      disabled={locked || lines.length === 1}
                      onClick={() =>
                        setLines((previous) =>
                          previous.filter((item) => item.key !== line.key)
                        )}
                    >
                      <Trash2Icon {...icon} />
                    </IconButton>
                  </div>
                  <div className='grid grid-cols-[150px_minmax(0,1fr)_150px] gap-3 max-[600px]:grid-cols-2'>
                    <Field label='Date' required error={errors[`${line.key}.date`]}>
                      {(props) => (
                        <Input
                          {...props}
                          type='date'
                          max={today()}
                          disabled={locked}
                          value={line.date}
                          onChange={(event) => change(line.key, { date: event.target.value })}
                        />
                      )}
                    </Field>
                    <Field label='Category'>
                      {(props) => (
                        <Select
                          id={props.id}
                          label='Category'
                          items={categories}
                          value={line.category}
                          disabled={locked}
                          onChange={(category) => change(line.key, { category })}
                        />
                      )}
                    </Field>
                    <div className='max-[600px]:col-span-full'>
                      <Field label='Amount' required error={errors[`${line.key}.amount`]}>
                        {(props) => (
                          <Input
                            {...props}
                            type='money'
                            currency='JPY'
                            min={1}
                            step={1}
                            placeholder='0'
                            disabled={locked}
                            value={line.amount}
                            onChange={(event) => change(line.key, { amount: event.target.value })}
                          />
                        )}
                      </Field>
                    </div>
                    <div className='col-span-full'>
                      <Field label='Note'>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder='e.g. Taxi from Shinagawa Station to the client office'
                            disabled={locked}
                            value={line.note}
                            onChange={(event) => change(line.key, { note: event.target.value })}
                          />
                        )}
                      </Field>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <Button
                type='button'
                disabled={locked || lines.length >= maxLines}
                onClick={() => setLines((previous) => [...previous, blankLine(previous.at(-1)?.date)])}
              >
                <PlusIcon aria-hidden='true' />Add line
              </Button>
              <p className='m-0 text-[13px] text-muted-foreground' aria-live='polite'>
                {lines.length} {lines.length === 1 ? 'line' : 'lines'} · Total{' '}
                <span className='text-[15px] font-semibold text-foreground'>
                  <NumberValue value={total} format='currency' currency='JPY' />
                </span>
              </p>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Receipts</FieldLegend>
            <FieldDescription>Photos or PDFs, up to 10 MB each.</FieldDescription>
            <FileUpload
              label='Attach receipts'
              accept='image/*,.pdf'
              maxSize={10 * 1024 * 1024}
              disabled={locked}
              upload={upload}
              onComplete={(file) => setReceipts((previous) => [...previous, file.name])}
            />
            <Field
              label='Receipt note'
              description='Needed when a receipt is missing or was handed in on paper.'
              error={errors.receiptNote}
            >
              {(props) => (
                <Textarea
                  {...props}
                  rows={3}
                  placeholder='e.g. Paper receipts handed to accounting in the monthly envelope'
                  disabled={locked}
                  value={receiptNote}
                  onChange={(event) => setReceiptNote(event.target.value)}
                />
              )}
            </Field>
          </FieldSet>
        </div>
      </div>
      <div className='shrink-0 border-t border-border bg-(--ui-surface)'>
        <div className='mx-auto flex w-full max-w-[640px] items-center gap-2 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] max-[600px]:px-4'>
          <span className='mr-auto min-w-0 truncate text-[13px] text-muted-foreground'>
            Total{' '}
            <span className='font-semibold text-foreground'>
              <NumberValue value={total} format='currency' currency='JPY' />
            </span>
          </span>
          <Button
            type='button'
            size='lg'
            disabled={locked}
            className='min-w-[112px]'
            onClick={() => void save('draft')}
          >
            {busy === 'draft' ? 'Saving…' : 'Save as draft'}
          </Button>
          <Button size='lg' type='submit' variant='default' disabled={locked} className='min-w-[120px]'>
            {busy === 'submit' ? 'Submitting…' : 'Submit claim'}
          </Button>
        </div>
      </div>
    </form>
  )
}
