import { cn } from 'cn'
import type { ReactNode } from 'react'
export function Header(
  { title, leading, actions, className }: {
    title: ReactNode
    leading?: ReactNode
    actions?: ReactNode
    className?: string
  },
) {
  return (
    <header
      className={cn(
        'group/component-header flex items-center gap-[12px] min-h-[52px] p-[10px_14px] [border-bottom:1px_solid_var(--ui-border)] [background:var(--ui-surface)] text-[14px]',
        className,
      )}
    >
      {leading}
      <div className='font-semibold min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'>{title}</div>
      <div className='ml-auto flex items-center gap-[8px]'>{actions}</div>
    </header>
  )
}
