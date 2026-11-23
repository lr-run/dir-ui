// Recruiting pages: the pipeline dashboard and the interview schedule grouped by day.
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { HorizontalBars } from '@/components/charts/index.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { formatDate } from '@/components/ui/value.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import { CreateForm } from '@/components/systems/kit/list.tsx'
import { day } from '@/components/systems/kit/seed.ts'
import type { KitDetailContext, KitPageContext, KitRow } from '@/components/systems/kit/types.ts'
import {
  activeStages,
  candidates,
  interviews,
  rounds,
  stages,
  today,
  users,
} from '@/components/systems/recruiting/objects.tsx'

const daysSince = (iso: unknown) => Math.round((Date.parse(today) - Date.parse(String(iso))) / 86400000)
const STALLED_DAYS = 14
const values = (row: KitRow) => row.record.values
const live = (rows: KitRow[] | undefined) => (rows ?? []).filter((row) => !row.archivedAt)
const stageOf = (row: KitRow) => stages.find((stage) => stage.value === values(row).stage) ?? stages[0]!
const count = (value: number, noun: string) => `${value.toLocaleString('en-US')} ${noun}${value === 1 ? '' : 's'}`
const scheduled = (row: KitRow) => String(values(row).scheduledAt ?? '')
/** Interview times are stored as `datetime-local` values, so the date and time are read without a time zone. */
const dateOf = (row: KitRow) => scheduled(row).slice(0, 10)
const timeOf = (row: KitRow) => scheduled(row).slice(11, 16)

function upcoming(rows: KitRow[] | undefined, until?: string) {
  return live(rows).filter((row) =>
    values(row).result === 'scheduled' && dateOf(row) >= today && (!until || dateOf(row) <= until)
  ).sort((a, b) => scheduled(a).localeCompare(scheduled(b)))
}

function Pipeline({ store, openRecord }: KitPageContext) {
  const people = live(store.rows.candidates)
  const active = people.filter((row) => activeStages.includes(String(values(row).stage)))
  const week = upcoming(store.rows.interviews, day(6))
  const next = upcoming(store.rows.interviews)
  const stalled = active.filter((row) => daysSince(values(row).lastContactAt) >= STALLED_DAYS)
    .sort((a, b) => String(values(a).lastContactAt).localeCompare(String(values(b).lastContactAt)))
  const openPositions = live(store.rows.positions).filter((row) => values(row).status === 'open')
  const byPosition = openPositions.map((row) => ({
    row,
    active: active.filter((candidate) => values(candidate).position === row.id).length,
  })).sort((a, b) => a.active - b.active)
  return (
    <DashboardBody>
      <StatGrid
        stats={[
          [
            'Active candidates',
            active.length.toLocaleString('en-US'),
            `${people.filter((row) => daysSince(values(row).appliedAt) <= 30).length} applied in 30 days`,
          ],
          [
            'Interviews this week',
            String(week.length),
            `${week.filter((row) => dateOf(row) === today).length} today`,
          ],
          [
            'Offers out',
            String(active.filter((row) => values(row).stage === 'offer').length),
            `${people.filter((row) => values(row).stage === 'hired').length} hired`,
          ],
          [
            'Open roles',
            String(openPositions.reduce((sum, row) => sum + Number(values(row).openings ?? 0), 0)),
            count(openPositions.length, 'position'),
          ],
        ]}
      />
      <DashboardColumns>
        <DashboardPanel title='Upcoming interviews' description='Booked rounds, soonest first'>
          <DashboardList
            empty='No interviews are booked.'
            rows={next.slice(0, 6).map((row) => ({
              id: row.id,
              title: String(row.candidate || row.name),
              detail: `${row.round} · ${row.interviewer}`,
              trailing: (
                <span className='shrink-0 text-right text-[12px] text-muted-foreground tabular-nums'>
                  {formatDate(dateOf(row))} · {timeOf(row)}
                </span>
              ),
              onOpen: () => openRecord('interviews', row.id),
            }))}
          />
        </DashboardPanel>
        <DashboardPanel
          title='Stalled candidates'
          description={`No contact for ${STALLED_DAYS} days or more, oldest first`}
        >
          <DashboardList
            empty='No candidates need follow-up.'
            rows={stalled.slice(0, 6).map((row) => ({
              id: row.id,
              title: row.name,
              detail: `Last contact ${
                daysSince(values(row).lastContactAt)
              } days ago · ${row.recruiter} · ${row.position}`,
              trailing: <ChoiceContent item={stageOf(row)} compact />,
              onOpen: () => openRecord('candidates', row.id),
            }))}
          />
        </DashboardPanel>
      </DashboardColumns>
      <DashboardColumns>
        <DashboardPanel title='Candidates by stage' description='Every candidate, including closed ones'>
          <div className='px-3 pb-4'>
            <HorizontalBars
              format='number'
              values={people.length
                ? stages.map((stage) => ({
                  label: stage.label,
                  value: people.filter((row) => values(row).stage === stage.value).length,
                }))
                : []}
            />
          </div>
        </DashboardPanel>
        <DashboardPanel title='Open positions' description='Fewest active candidates first'>
          <DashboardList
            empty='No positions are open.'
            rows={byPosition.slice(0, 6).map(({ row, active }) => ({
              id: row.id,
              title: row.name,
              detail: `${row.department} · ${row.location} · ${row.manager}`,
              trailing: (
                <span className='shrink-0 text-[12px] text-muted-foreground tabular-nums'>
                  {count(active, 'candidate')}
                </span>
              ),
              onOpen: () => openRecord('positions', row.id),
            }))}
          />
        </DashboardPanel>
      </DashboardColumns>
    </DashboardBody>
  )
}

function Schedule({ store, openRecord, navigate }: KitPageContext) {
  const booked = upcoming(store.rows.interviews)
  if (!booked.length) {
    return (
      <EmptyState title='No interviews are booked'>
        <Button onClick={() => navigate('/candidates')}>Open candidates</Button>
      </EmptyState>
    )
  }
  const days = [...new Set(booked.map(dateOf))]
  return (
    <DashboardBody>
      {days.map((date) => {
        const rows = booked.filter((row) => dateOf(row) === date)
        const offset = -daysSince(date)
        return (
          <DashboardPanel
            key={date}
            title={formatDate(date)}
            description={`${offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : `In ${offset} days`} · ${
              count(rows.length, 'interview')
            }`}
          >
            <DashboardList
              empty='No interviews.'
              rows={rows.map((row) => ({
                id: row.id,
                title: String(row.candidate || row.name),
                detail: `${row.round} · ${row.interviewer}`,
                trailing: (
                  <span className='shrink-0 text-[12px] text-muted-foreground tabular-nums'>
                    {timeOf(row)}
                  </span>
                ),
                onOpen: () => openRecord('interviews', row.id),
              }))}
            />
          </DashboardPanel>
        )
      })}
    </DashboardBody>
  )
}

function NewCandidate({ store, openRecord }: KitPageContext) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant='default' onClick={() => setOpen(true)}>
        <PlusIcon aria-hidden='true' />New candidate
      </Button>
      {open && (
        <CreateForm
          object={candidates}
          store={store}
          users={users}
          onClose={() => setOpen(false)}
          onCreated={(id) => openRecord('candidates', id)}
        />
      )}
    </>
  )
}

/** The candidate page's primary action: a new interview for this candidate, with the next round preset. */
function ScheduleInterview({ store, record, openRecord }: KitDetailContext) {
  const [open, setOpen] = useState(false)
  if (record.archivedAt) return null
  const held = live(store.rows.interviews).filter((row) => values(row).candidate === record.id)
  const round = rounds[Math.min(held.length, rounds.length - 1)]!
  const position = store.find('positions', String(record.values.position ?? ''))
  return (
    <>
      <Button variant='default' onClick={() => setOpen(true)}>
        <PlusIcon aria-hidden='true' />Schedule interview
      </Button>
      {open && (
        <CreateForm
          object={{
            ...interviews,
            defaults: (current) => ({
              ...interviews.defaults?.(current),
              name: `${record.name} · ${round.label}${round.value === 'phone-screen' ? '' : ' interview'}`,
              candidate: record.id,
              round: round.value,
              interviewer: round.value === 'phone-screen'
                ? record.values.recruiter
                : position?.values.manager ?? record.values.recruiter,
            }),
          }}
          store={store}
          users={users}
          onClose={() => setOpen(false)}
          onCreated={(id) => openRecord('interviews', id)}
        />
      )}
    </>
  )
}

export const scheduleInterviewAction = (context: KitDetailContext) => <ScheduleInterview {...context} />
export const pipelinePage = (context: KitPageContext) => <Pipeline {...context} />
export const pipelineActions = (context: KitPageContext) => <NewCandidate {...context} />
export const schedulePage = (context: KitPageContext) => <Schedule {...context} />
