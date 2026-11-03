import type { CSSProperties, ReactNode } from 'react'
import { landingHref } from '../routes.ts'
import { specById } from '../navigation.ts'

/** One component: name, one line of dimensions, rows of variants, sizes and states. */
export function Section(
  { id, title, spec, children }: { id: string; title: string; spec: string; children: ReactNode },
) {
  const detail = specById.has(id) ? landingHref(id) : undefined
  return (
    <section
      id={id}
      className='flex flex-col gap-5 border-t border-border pt-6 scroll-mt-[calc(var(--docs-header-height)+24px)]'
    >
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <h2 className='m-0 flex items-baseline gap-3 text-[16px] font-semibold tracking-tight'>
          {title}
          {detail && (
            <a
              href={detail}
              className='text-[12px] font-normal text-muted-foreground no-underline hover:text-foreground'
            >
              API
            </a>
          )}
        </h2>
        <p className='m-0 max-w-[620px] text-right text-[11px] text-muted-foreground'>{spec}</p>
      </div>
      {children}
    </section>
  )
}
export function Row({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className='flex flex-col gap-2.5'>
      <div className='text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'>{label}</div>
      <div className={`flex flex-wrap items-end gap-x-5 gap-y-3 ${className}`}>{children}</div>
    </div>
  )
}
export function Grid(
  { label, columns = 4, children, className = '' }: {
    label: string
    columns?: number
    children: ReactNode
    className?: string
  },
) {
  return (
    <div className='flex flex-col gap-2.5'>
      <div className='text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'>{label}</div>
      <div
        className={`grid grid-cols-(--showcase-columns) items-start gap-x-4 gap-y-3 max-[800px]:grid-cols-2 max-[480px]:grid-cols-1 ${className}`}
        style={{ '--showcase-columns': `repeat(${columns}, minmax(0, 1fr))` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}
export function Item(
  { label, children, className = '', span }: {
    label: ReactNode
    children: ReactNode
    className?: string
    span?: number
  },
) {
  return (
    <div
      className={`flex min-w-0 flex-col items-start gap-1.5 ${className}`}
      style={span ? { gridColumn: `span ${span}` } : undefined}
    >
      <div className='flex w-full min-w-0 max-w-full flex-wrap items-center gap-2'>{children}</div>
      <small className='text-[10px] leading-4 text-muted-foreground'>{label}</small>
    </div>
  )
}
/** Bounded frame for panels, overlays and shells. */
export function Stage(
  { children, className = '', height = 300 }: { children: ReactNode; className?: string; height?: number },
) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-border bg-(--ui-canvas) ${className}`}
      style={{ height }}
    >
      {children}
    </div>
  )
}
export function Page({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <article className='flex flex-col gap-7 pb-16'>
      <header className='flex flex-col gap-2'>
        <h1 className='m-0 text-[28px] leading-tight font-semibold tracking-tight max-[700px]:text-[24px]'>{title}</h1>
        {lead && <p className='m-0 max-w-[680px] text-[14px] leading-6 text-muted-foreground'>{lead}</p>}
      </header>
      {children}
    </article>
  )
}
export const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true as const, className: 'shrink-0' }
