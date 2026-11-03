// Building blocks for dashboard and report pages: a scrolling page body, a stat strip and titled panels.
import type { ReactNode } from 'react'
import { List, ListItem } from '@/components/ui/list.tsx'

export function DashboardBody({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-0 flex-1 overflow-auto [container-type:inline-size]'>
      <div className='mx-auto grid max-w-[1280px] gap-5 p-6 @max-[740px]:gap-4 @max-[740px]:p-4'>{children}</div>
    </div>
  )
}

/** Up to four headline numbers; two per row in narrow containers. */
export function StatGrid({ stats }: { stats: [label: string, value: string, note?: string][] }) {
  return (
    <dl className='m-0 grid grid-cols-4 overflow-hidden rounded-lg border border-border bg-(--ui-surface) @max-[740px]:grid-cols-2'>
      {stats.map(([label, value, note], index) => (
        <div
          key={label}
          className={`px-5 py-4 ${
            index ? 'border-l border-border' : ''
          } @max-[740px]:px-4 @max-[740px]:nth-3:border-l-0 @max-[740px]:nth-[n+3]:border-t`}
        >
          <dt className='text-[12px] text-muted-foreground'>{label}</dt>
          <dd className='m-0 mt-2 text-[24px] leading-7 font-[550] tracking-[-0.6px] tabular-nums @max-[740px]:text-[22px]'>
            {value}
          </dd>
          {note && <dd className='m-0 mt-1 text-[12px] text-muted-foreground'>{note}</dd>}
        </div>
      ))}
    </dl>
  )
}

export function DashboardPanel({ title, description, action, children, className = '' }: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-lg border border-border bg-(--ui-surface) ${className}`}>
      <header className='flex items-start justify-between gap-3 px-5 pt-4 pb-3'>
        <div>
          <h2 className='m-0 text-[13px] font-[550]'>{title}</h2>
          {description && <p className='m-0 mt-1 text-[12px] text-muted-foreground'>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

/** Two panels side by side, stacked in narrow containers. */
export function DashboardColumns({ children }: { children: ReactNode }) {
  return <div className='grid grid-cols-2 gap-4 @max-[740px]:grid-cols-1'>{children}</div>
}

/** Rows that open a record; used for "needs attention" lists on dashboards. */
export function DashboardList({ rows, empty }: {
  rows: { id: string; title: string; detail?: string; trailing?: ReactNode; onOpen: () => void }[]
  empty: string
}) {
  if (!rows.length) return <p className='m-0 px-5 pb-5 text-[13px] text-muted-foreground'>{empty}</p>
  return (
    <List>
      {rows.map((row) => (
        <ListItem
          key={row.id}
          className='min-h-11 border-t border-border px-5 py-2.5 [border-bottom:0]'
          onOpen={row.onOpen}
          title={<span className='block truncate'>{row.title}</span>}
          description={row.detail && <span className='block truncate text-[12px]'>{row.detail}</span>}
          trailing={row.trailing}
        />
      ))}
    </List>
  )
}
