// Team feed: recent reports as a readable list grouped by day, newest first, filtered by member. Each report opens
// its record; the one primary action goes to Write.
import { PenLineIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { Field } from '@/components/ui/field.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import type { KitPageContext, KitRow } from '@/components/systems/kit/types.ts'
import {
  blockerChoice,
  choice,
  initials,
  longDate,
  memberName,
  moods,
  newestFirst,
  reviews,
  timeAgo,
  users,
  values,
} from '@/components/systems/daily-report/data.ts'

const pageSize = 30
const everyone = { value: 'everyone', label: 'Everyone' }

export function WriteAction({ navigate }: KitPageContext) {
  return (
    <Button variant='default' onClick={() => navigate('/write')}>
      <PenLineIcon size={16} strokeWidth={1.5} aria-hidden='true' />Write report
    </Button>
  )
}

export function FeedPage({ store, navigate, openRecord }: KitPageContext) {
  const [member, setMember] = useState('everyone')
  const [shown, setShown] = useState(pageSize)
  const all = useMemo(() => newestFirst(store.rows.reports!), [store.rows])
  const rows = member === 'everyone' ? all : all.filter((row) => values(row).author === member)
  const visible = rows.slice(0, shown)
  const groups = new Map<string, KitRow[]>()
  for (const row of visible) {
    const date = String(values(row).date)
    groups.set(date, [...groups.get(date) ?? [], row])
  }
  const days = [...groups]

  if (!all.length) {
    return (
      <div className='grid min-h-0 flex-1 place-items-center'>
        <EmptyState title='No reports yet. Reports your team posts show up here, newest first.'>
          <Button variant='default' onClick={() => navigate('/write')}>Write the first report</Button>
        </EmptyState>
      </div>
    )
  }
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <div className='mx-auto grid w-full max-w-[720px] gap-5 p-6 max-[600px]:gap-4 max-[600px]:p-4'>
        <div className='flex items-end justify-between gap-4'>
          <div className='w-[240px] max-[600px]:min-w-0 max-[600px]:flex-1'>
            <Field label='Member'>
              {(props) => (
                <SingleCombobox
                  id={props.id}
                  label='Member'
                  items={[everyone, ...users]}
                  value={member}
                  onValueChange={(next) => {
                    setMember(next ?? 'everyone')
                    setShown(pageSize)
                  }}
                />
              )}
            </Field>
          </div>
          <p className='m-0 pb-1.5 text-[12px] whitespace-nowrap text-muted-foreground tabular-nums'>
            {rows.length.toLocaleString('en-US')} {rows.length === 1 ? 'report' : 'reports'}
          </p>
        </div>
        {!rows.length && (
          <EmptyState title={`${memberName(member)} has not posted a report yet.`}>
            <Button onClick={() => setMember('everyone')}>Show everyone</Button>
          </EmptyState>
        )}
        {days.map(([date, items]) => (
          <section key={date} aria-labelledby={`day-${date}`}>
            <h2 id={`day-${date}`} className='m-0 mb-2 text-[12px] font-medium text-muted-foreground'>
              {longDate(date)}
            </h2>
            <List className='rounded-lg border border-border bg-(--ui-surface) px-2'>
              {items.map((row) => <Report key={row.id} row={row} onOpen={() => openRecord('reports', row.id)} />)}
            </List>
          </section>
        ))}
        {rows.length > shown && (
          <div className='flex justify-center'>
            <Button onClick={() => setShown((count) => count + pageSize)}>
              Show {Math.min(pageSize, rows.length - shown)} more
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Report({ row, onOpen }: { row: KitRow; onOpen: () => void }) {
  const report = values(row)
  const author = memberName(report.author)
  const mood = choice(moods, report.mood)
  const review = choice(reviews, report.status)
  const blockers = String(report.blockers ?? '')
  return (
    <ListItem
      className='min-h-11'
      onOpen={onOpen}
      leading={
        <span className='inline-grid size-8 shrink-0 place-items-center rounded-full bg-(--ui-subtle) text-[11px] font-medium text-foreground'>
          {initials(author)}
        </span>
      }
      title={author}
      description={<span className='line-clamp-2 text-foreground'>{String(report.done ?? '')}</span>}
      meta={[
        String(row.project || ''),
        report.hours != null ? `${report.hours} h` : '',
        review?.label,
        timeAgo(row.createdAt),
      ]
        .filter(Boolean).join(' · ')}
      trailing={mood && (
        <span className='shrink-0 pt-0.5 text-[12px]'>
          <ChoiceContent item={mood} compact />
        </span>
      )}
    >
      <p className='m-0 mt-1.5 text-muted-foreground'>
        <span className='text-foreground'>Next:</span> {String(report.plans ?? '')}
      </p>
      {blockers && (
        <p className='m-0 mt-1.5 flex items-start gap-2 text-muted-foreground'>
          <span className='shrink-0 text-foreground'>
            <ChoiceContent item={blockerChoice} compact />
          </span>
          <span className='min-w-0'>{blockers}</span>
        </p>
      )}
    </ListItem>
  )
}
