// The two queues: the submitter's own claims (submit a draft, withdraw a submitted claim) and the approver's inbox
// (approve, or reject with a reason). Rows open the claim's detail page.
import { type ReactNode, useMemo, useState } from 'react'
import { HorizontalBars } from '@/components/charts/index.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import { formatDate } from '@/components/ui/value.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import type { KitStore } from '@/components/systems/kit/store.ts'
import type { KitPageContext, KitRecord } from '@/components/systems/kit/types.ts'
import { useClaimFlows } from '@/components/systems/expense/actions.tsx'
import {
  categories,
  claimTotal,
  costCenters,
  decisions,
  me,
  statusOf,
  today,
  userName,
  yen,
} from '@/components/systems/expense/model.tsx'

const page = 30
const daysSince = (date: unknown) =>
  Math.max(0, Math.round((Date.parse(today()) - Date.parse(String(date ?? today()))) / 86400000))
const live = (store: KitStore, objectId: string) =>
  (store.state.records[objectId] ?? []).filter((record) => !record.archivedAt)
const sum = (records: KitRecord[]) => records.reduce((total, claim) => total + claimTotal(claim), 0)

/** Line items of every claim, by claim id. */
function useLines(store: KitStore) {
  const records = store.state.records.lines
  return useMemo(() => {
    const byClaim = new Map<string, KitRecord[]>()
    for (const line of records ?? []) {
      if (line.archivedAt) continue
      const id = String(line.values.claim)
      byClaim.set(id, [...byClaim.get(id) ?? [], line])
    }
    return byClaim
  }, [records])
}
const lineCount = (count: number) => `${count} ${count === 1 ? 'line' : 'lines'}`

/** A claim row: the title opens the claim, the total and the status sit at the right. */
function ClaimItem({ claim, description, meta, actions, onOpen }: {
  claim: KitRecord
  description: string
  meta: string
  actions?: ReactNode
  onOpen: () => void
}) {
  return (
    <ListItem
      className='min-h-14 px-5! max-[600px]:px-4!'
      onOpen={onOpen}
      title={claim.name}
      description={description}
      meta={meta}
      trailing={
        <span className='flex shrink-0 flex-col items-end gap-1'>
          <span className='font-medium tabular-nums'>{yen(claimTotal(claim))}</span>
          <ChoiceContent item={statusOf(claim.values.status)} compact />
        </span>
      }
      actions={actions}
    />
  )
}

function ShowMore({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  if (shown >= total) return null
  return (
    <div className='flex justify-center border-t border-border p-3'>
      <Button type='button' variant='ghost' onClick={onMore}>
        Show {Math.min(page, total - shown)} more of {total - shown}
      </Button>
    </div>
  )
}

export function MyClaimsPage({ store, navigate, openRecord }: KitPageContext) {
  const flows = useClaimFlows(store)
  const linesByClaim = useLines(store)
  const [shown, setShown] = useState(page)
  const mine = live(store, 'claims').filter((claim) => claim.values.submitter === me)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const decisionFor = (claim: KitRecord) =>
    live(store, 'approvals').find((approval) => approval.values.claim === claim.id)
  const withStatus = (status: string) => mine.filter((claim) => claim.values.status === status)
  const year = today().slice(0, 4)
  const paid = withStatus('paid').filter((claim) => String(claim.values.submittedAt ?? '').startsWith(year))
  if (!mine.length) {
    return (
      <DashboardBody>
        <EmptyState title='You have not filed a claim yet'>
          <Button type='button' onClick={() => navigate('/new')}>Start a claim</Button>
        </EmptyState>
      </DashboardBody>
    )
  }
  return (
    <DashboardBody>
      <StatGrid
        stats={[
          ['Drafts', String(withStatus('draft').length), 'not submitted yet'],
          ['Waiting for approval', String(withStatus('submitted').length), yen(sum(withStatus('submitted')))],
          ['Approved, to be paid', yen(sum(withStatus('approved'))), `${withStatus('approved').length} claims`],
          [`Paid in ${year}`, yen(sum(paid)), `${paid.length} claims`],
        ]}
      />
      <DashboardPanel title='My claims' description='Newest first. Paid claims arrive with the next salary payment.'>
        <List aria-label='My claims' className='border-t border-border'>
          {mine.slice(0, shown).map((claim) => {
            const status = String(claim.values.status)
            const decision = decisionFor(claim)
            const center = costCenters.find((item) => item.value === claim.values.costCenter)?.label ?? ''
            return (
              <ClaimItem
                key={claim.id}
                claim={claim}
                onOpen={() => openRecord('claims', claim.id)}
                description={status === 'rejected' && decision?.values.reason
                  ? `Rejected: ${decision.values.reason}`
                  : `${claim.values.period} · ${lineCount(linesByClaim.get(claim.id)?.length ?? 0)} · ${center}`}
                meta={`${
                  claim.values.submittedAt
                    ? `Submitted ${formatDate(String(claim.values.submittedAt))}`
                    : 'Not submitted'
                } · Approver ${userName(claim.values.approver)}`}
                actions={status === 'draft'
                  ? (
                    <Button type='button' disabled={!claimTotal(claim)} onClick={() => flows.submit(claim)}>
                      Submit
                    </Button>
                  )
                  : status === 'submitted'
                  ? <Button type='button' onClick={() => flows.withdraw(claim)}>Withdraw</Button>
                  : undefined}
              />
            )
          })}
        </List>
        <ShowMore shown={shown} total={mine.length} onMore={() => setShown((value) => value + page)} />
      </DashboardPanel>
      {flows.dialogs}
    </DashboardBody>
  )
}

export function ApprovalsPage({ store, navigate, openRecord }: KitPageContext) {
  const flows = useClaimFlows(store)
  const linesByClaim = useLines(store)
  const [shown, setShown] = useState(page)
  const claims = live(store, 'claims')
  const queue = claims.filter((claim) => claim.values.status === 'submitted' && claim.values.approver === me)
    .sort((a, b) => String(a.values.submittedAt).localeCompare(String(b.values.submittedAt)))
  const decided = live(store, 'approvals').filter((approval) => approval.values.approver === me)
    .sort((a, b) =>
      String(b.values.decidedAt).localeCompare(String(a.values.decidedAt)) || b.createdAt.localeCompare(a.createdAt)
    )
  const month = today().slice(0, 7)
  const thisMonth = decided.filter((approval) => String(approval.values.decidedAt).startsWith(month))
  const approvedThisMonth = thisMonth.filter((approval) => approval.values.decision === 'approved')
  const claimOf = (approval: KitRecord) => claims.find((claim) => claim.id === approval.values.claim)
  const oldest = queue[0]
  const byCategory = categories.map((category) => ({
    label: category.label,
    value: queue.flatMap((claim) => linesByClaim.get(claim.id) ?? [])
      .filter((line) => line.values.category === category.value)
      .reduce((total, line) => total + Number(line.values.amount ?? 0), 0),
  })).filter((point) => point.value > 0)

  return (
    <DashboardBody>
      <StatGrid
        stats={[
          ['Waiting for you', String(queue.length), yen(sum(queue))],
          [
            'Oldest waiting',
            oldest ? `${daysSince(oldest.values.submittedAt)} days` : '—',
            oldest ? `${userName(oldest.values.submitter)} · ${oldest.name}` : 'Nothing waiting',
          ],
          [
            'Approved this month',
            String(approvedThisMonth.length),
            yen(approvedThisMonth.reduce((total, approval) => total + claimTotal(claimOf(approval) ?? approval), 0)),
          ],
          ['Rejected this month', String(thisMonth.length - approvedThisMonth.length), 'sent back with a reason'],
        ]}
      />
      <DashboardPanel title='Waiting for your approval' description='Oldest first. Open a claim to see its lines.'>
        {queue.length
          ? (
            <>
              <List aria-label='Claims waiting for approval' className='border-t border-border'>
                {queue.slice(0, shown).map((claim) => {
                  const claimLines = linesByClaim.get(claim.id) ?? []
                  const missing = claimLines.filter((line) => !line.values.receipt).length
                  return (
                    <ClaimItem
                      key={claim.id}
                      claim={claim}
                      onOpen={() => openRecord('claims', claim.id)}
                      description={`${userName(claim.values.submitter)} · ${claim.values.period} · ${
                        lineCount(claimLines.length)
                      }${missing ? ` · ${missing} without receipt` : ''}`}
                      meta={`Submitted ${formatDate(String(claim.values.submittedAt))} · waiting ${
                        daysSince(claim.values.submittedAt)
                      } days`}
                      actions={
                        <>
                          <Button type='button' onClick={() => flows.reject(claim)}>Reject</Button>
                          <Button type='button' onClick={() => flows.approve(claim)}>Approve</Button>
                        </>
                      }
                    />
                  )
                })}
              </List>
              <ShowMore shown={shown} total={queue.length} onMore={() => setShown((value) => value + page)} />
            </>
          )
          : (
            <EmptyState title='Nothing is waiting for your approval'>
              <Button type='button' onClick={() => navigate('/claims')}>See all claims</Button>
            </EmptyState>
          )}
      </DashboardPanel>
      <DashboardColumns>
        <DashboardPanel title='Recently decided' description='Your last decisions'>
          <DashboardList
            empty='You have not decided on a claim yet.'
            rows={decided.slice(0, 6).map((approval) => {
              const claim = claimOf(approval)
              return {
                id: approval.id,
                title: claim?.name ?? approval.name,
                detail: `${userName(claim?.values.submitter)} · ${formatDate(String(approval.values.decidedAt))}${
                  claim ? ` · ${yen(claimTotal(claim))}` : ''
                }`,
                trailing: (
                  <ChoiceContent
                    item={decisions.find((item) => item.value === approval.values.decision)!}
                    compact
                  />
                ),
                onOpen: () => claim ? openRecord('claims', claim.id) : openRecord('approvals', approval.id),
              }
            })}
          />
        </DashboardPanel>
        <DashboardPanel title='Waiting by category' description='Line items in your queue, in yen'>
          {byCategory.length
            ? (
              <div className='px-3 pb-4'>
                <HorizontalBars values={byCategory} labelWidth={140} />
              </div>
            )
            : <p className='m-0 px-5 pb-5 text-[13px] text-muted-foreground'>Your queue is empty.</p>}
        </DashboardPanel>
      </DashboardColumns>
      {flows.dialogs}
    </DashboardBody>
  )
}
