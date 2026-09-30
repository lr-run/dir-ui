import type { Key, ReactNode } from 'react'
import { cn } from 'cn'
import { RecordTable, type RecordTableProps } from '@/components/record-list/record-table.tsx'
type ListChrome = {
  title: ReactNode
  gridKey?: Key
  actions?: ReactNode
  selection?: ReactNode
  footer?: ReactNode
  className?: string
  classNames?: { header?: string; title?: string; content?: string; footer?: string }
}
export type RecordListProps<R = unknown, SR = unknown, K extends Key = Key> =
  & ListChrome
  & (
    | { grid: RecordTableProps<R, SR, K>; children?: never }
    | { grid?: never; children: ReactNode }
  )

export function RecordList<R = unknown, SR = unknown, K extends Key = Key>(
  { title, actions, selection, grid, gridKey, children, footer, className = '', classNames }: RecordListProps<
    R,
    SR,
    K
  >,
) {
  return (
    <section className={cn('min-w-0', className)}>
      <header
        className={cn(
          "flex items-center flex-wrap gap-[10px] p-[12px_0] [&>strong]:mr-auto [&>[data-slot='input']]:flex-1 [&>[data-slot='input']]:w-[140px] [&>[data-slot='input']]:min-w-[100px]",
          classNames?.header,
        )}
      >
        <strong className={cn('mr-auto', classNames?.title)}>{title}</strong>
        {actions}
      </header>
      {selection}
      <div className={cn('min-w-0 flex flex-col min-h-0', classNames?.content)}>
        {grid
          ? (
            <RecordTable
              key={gridKey}
              {...grid}
              className={grid.className}
            />
          )
          : children}
      </div>
      {footer && (
        <footer className={cn('flex items-center flex-wrap gap-[10px] p-[12px_0] justify-between', classNames?.footer)}>
          {footer}
        </footer>
      )}
    </section>
  )
}
