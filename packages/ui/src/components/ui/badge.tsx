import type { ReactNode } from 'react'

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className='inline-flex items-center p-[2px_6px] [border:1px_solid_var(--ui-border)] rounded-[4px] text-[length:var(--dir-text-caption)] text-muted-foreground font-normal'>
      {children}
    </span>
  )
}
