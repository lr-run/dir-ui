// What people do to a claim — submit, withdraw, approve, reject — shared by the queues and the claim's page header,
// and the claim's Line items tab.
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { ConfirmDialog } from '@/components/ui/confirm-dialog.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { Field } from '@/components/ui/field.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Toast } from '@/components/ui/toast.tsx'
import { formatDate } from '@/components/ui/value.tsx'
import type { KitStore } from '@/components/systems/kit/store.ts'
import type { KitDetailContext, KitRecord } from '@/components/systems/kit/types.ts'
import { categories, claimTotal, me, today, userName, yen } from '@/components/systems/expense/model.tsx'

const pause = () => new Promise((resolve) => setTimeout(resolve, 600))
const receiptStatus = [
  { value: 'yes', label: 'Receipt', color: 'var(--ui-green)' },
  { value: 'no', label: 'No receipt', color: 'var(--ui-amber)' },
]

/** Claim actions and the dialogs they open; render `dialogs` once on the screen that uses them. */
export function useClaimFlows(store: KitStore) {
  const toast = Toast.useToastManager()
  const [withdrawing, setWithdrawing] = useState<KitRecord | null>(null)
  const [rejecting, setRejecting] = useState<KitRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const decide = (claim: KitRecord, decision: 'approved' | 'rejected', reason = '') => {
    store.update('claims', claim.id, { values: { status: decision } })
    return store.create('approvals', `${decision === 'approved' ? 'Approved' : 'Rejected'} · ${claim.name}`, {
      claim: claim.id,
      decision,
      approver: me,
      decidedAt: today(),
      reason,
    })
  }
  const submit = (claim: KitRecord) => {
    store.update('claims', claim.id, { values: { status: 'submitted', submittedAt: today() } })
    toast.add({
      title: 'Claim submitted',
      description: `${claim.name} went to ${userName(claim.values.approver)} for approval.`,
    })
  }
  const approve = (claim: KitRecord) => {
    const approval = decide(claim, 'approved')
    toast.add({
      title: `Approved ${claim.name}`,
      description: `${yen(claimTotal(claim))} goes to ${userName(claim.values.submitter)} with the next payment run.`,
      actionProps: {
        children: 'Undo',
        onClick: () => {
          store.update('claims', claim.id, { values: { status: 'submitted' } })
          store.setArchived('approvals', approval.id, true)
        },
      },
    })
  }
  const dialogs = (
    <>
      {withdrawing && (
        <ConfirmDialog
          open
          title={`Withdraw ${withdrawing.name}?`}
          description={`It goes back to your drafts and leaves ${
            userName(withdrawing.values.approver)
          }'s approvals. Submit it again when it is ready.`}
          action='Withdraw claim'
          busy={busy}
          onOpenChange={(open) => !open && setWithdrawing(null)}
          onConfirm={async () => {
            setBusy(true)
            await pause()
            store.update('claims', withdrawing.id, { values: { status: 'draft', submittedAt: null } })
            toast.add({ title: 'Claim withdrawn', description: `${withdrawing.name} is a draft again.` })
            setBusy(false)
            setWithdrawing(null)
          }}
        />
      )}
      {rejecting && (
        <RejectDialog
          claim={rejecting}
          onClose={() => setRejecting(null)}
          onReject={async (reason) => {
            await pause()
            decide(rejecting, 'rejected', reason)
            toast.add({
              title: `Rejected ${rejecting.name}`,
              description: `${userName(rejecting.values.submitter)} can fix it and submit it again.`,
            })
            setRejecting(null)
          }}
        />
      )}
    </>
  )
  return { submit, approve, withdraw: setWithdrawing, reject: setRejecting, dialogs }
}

/** Header buttons of a claim's page, by its status and whether you filed it or approve it. */
export function ClaimActions({ store, record }: KitDetailContext) {
  const flows = useClaimFlows(store)
  const status = record.values.status
  const mine = record.values.submitter === me, approving = record.values.approver === me
  if (record.archivedAt) return null
  let buttons: ReactNode = null
  if (status === 'draft' && mine) {
    buttons = (
      <Button
        type='button'
        variant='default'
        disabled={!claimTotal(record)}
        onClick={() => flows.submit(record)}
      >
        Submit claim
      </Button>
    )
  } else if (status === 'submitted' && mine) {
    buttons = <Button type='button' onClick={() => flows.withdraw(record)}>Withdraw</Button>
  } else if (status === 'submitted' && approving) {
    buttons = (
      <>
        <Button type='button' onClick={() => flows.reject(record)}>Reject</Button>
        <Button type='button' variant='default' onClick={() => flows.approve(record)}>Approve</Button>
      </>
    )
  }
  return (
    <>
      {buttons}
      {flows.dialogs}
    </>
  )
}

/** The claim's line items with the total, and the approver's reason when it was rejected. */
export function ClaimLines({ store, record, openRecord }: KitDetailContext) {
  const lines = (store.state.records.lines ?? []).filter((line) => !line.archivedAt && line.values.claim === record.id)
    .sort((a, b) => String(a.values.date).localeCompare(String(b.values.date)))
  const rejection = record.values.status === 'rejected'
    ? (store.state.records.approvals ?? []).filter((approval) =>
      !approval.archivedAt && approval.values.claim === record.id && approval.values.decision === 'rejected'
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : undefined
  return (
    <div className='flex flex-col gap-4'>
      {rejection && (
        <p className='m-0 rounded-lg border border-border bg-(--ui-subtle) p-3 text-[13px] leading-5'>
          <span className='mb-1 block text-[12px] text-muted-foreground'>
            Rejected by {userName(rejection.values.approver)} · {formatDate(String(rejection.values.decidedAt))}
          </span>
          {String(rejection.values.reason || 'No reason given.')}
        </p>
      )}
      {lines.length
        ? (
          <div className='overflow-hidden rounded-lg border border-border'>
            <List aria-label='Line items'>
              {lines.map((line) => (
                <ListItem
                  key={line.id}
                  className='px-3!'
                  onOpen={() => openRecord('lines', line.id)}
                  title={line.name}
                  description={`${categories.find((item) => item.value === line.values.category)?.label ?? ''} · ${
                    formatDate(String(line.values.date))
                  }`}
                  trailing={
                    <span className='flex shrink-0 flex-col items-end gap-1'>
                      <span className='font-medium tabular-nums'>{yen(Number(line.values.amount ?? 0))}</span>
                      <ChoiceContent item={receiptStatus[line.values.receipt ? 0 : 1]!} compact />
                    </span>
                  }
                />
              ))}
            </List>
            <div className='flex items-center justify-between border-t border-border px-3 py-3 text-[13px]'>
              <span className='text-muted-foreground'>{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span>
              <span className='font-semibold tabular-nums'>Total {yen(claimTotal(record))}</span>
            </div>
          </div>
        )
        : <EmptyState title='This claim has no line items' />}
    </div>
  )
}

/** Confirms a rejection; the reason is required because the submitter has to act on it. */
function RejectDialog({ claim, onClose, onReject }: {
  claim: KitRecord
  onClose: () => void
  onReject: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState('')
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const submitter = userName(claim.values.submitter)
  const error = checked && !reason.trim() ? `Tell ${submitter.split(' ')[0]} what to fix.` : undefined
  const formId = `reject-${claim.id}`
  return (
    <Dialog
      open
      title={`Reject ${claim.name}?`}
      onOpenChange={(open) => !open && !busy && onClose()}
      footer={
        <div className='flex justify-end gap-2'>
          <Button type='button' disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type='submit' form={formId} variant='destructive' disabled={busy} className='min-w-[112px]'>
            {busy ? 'Rejecting…' : 'Reject claim'}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        noValidate
        aria-busy={busy}
        className='flex flex-col gap-4 p-5'
        onSubmit={async (event) => {
          event.preventDefault()
          setChecked(true)
          if (!reason.trim()) return
          setBusy(true)
          await onReject(reason.trim())
        }}
      >
        <p className='m-0 text-[13px] leading-6 text-muted-foreground'>
          {submitter}'s claim for {yen(claimTotal(claim))}{' '}
          goes back to them with your reason. It is not paid until they submit it again and you approve it.
        </p>
        <Field label='Reason' required error={error}>
          {(props) => (
            <Textarea
              {...props}
              autoFocus
              rows={3}
              disabled={busy}
              placeholder='e.g. The receipt for the client dinner is missing.'
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          )}
        </Field>
      </form>
    </Dialog>
  )
}
