import { Badge } from '@dir/ui/components/ui/badge.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import type { Theme } from '../theme-presets.ts'

/** A preview of one theme. Tokens are scoped by `data-ui-theme`, so the card ignores the site theme. */
export function ThemeCard(
  { theme, label, note, action }: { theme: Theme; label: string; note: string; action?: React.ReactNode },
) {
  return (
    <div className='flex flex-col overflow-hidden rounded-[10px] border border-border'>
      <div
        data-ui-theme={theme}
        className='flex h-[150px] flex-col gap-2.5 bg-(--ui-canvas) p-3.5 text-[12px] text-(--ui-text)'
      >
        <div className='flex items-center justify-between gap-2'>
          <b className='text-[14px] font-semibold'>Clients</b>
          <span className='flex gap-1.5'>
            <Button size='sm'>Export</Button>
            <Button size='sm' variant='default'>New client</Button>
          </span>
        </div>
        <Input placeholder='Search clients' aria-label='Search' className='h-8 bg-(--ui-raised)' />
        <div className='flex gap-1.5'>
          <Badge>
            <ChoiceContent item={{ value: 'a', label: 'Active', color: 'var(--ui-green)' }} compact />
          </Badge>
          <Badge>
            <ChoiceContent item={{ value: 'b', label: 'Overdue', color: 'var(--ui-red)' }} compact />
          </Badge>
        </div>
      </div>
      <div className='flex items-center justify-between gap-2 border-t border-border bg-(--ui-surface) px-3.5 py-3'>
        <span className='flex min-w-0 flex-col'>
          <b className='text-[14px] font-semibold'>{label}</b>
          <small className='text-[12px] text-muted-foreground'>{note}</small>
        </span>
        {action}
      </div>
    </div>
  )
}
