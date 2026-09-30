import '@/components/ui/dir-theme.css'
import type { ReactNode } from 'react'
import { DatabaseIcon } from 'lucide-react'

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className='group/crm-empty flex flex-col items-center justify-center gap-[12px] p-[32px_16px] text-muted-foreground text-[length:var(--dir-text-label)] text-center [&>svg]:w-[24px] [&>svg]:h-[24px] [&>svg]:opacity-50'>
      <DatabaseIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      <p>{title}</p>
      {children}
    </div>
  )
}
