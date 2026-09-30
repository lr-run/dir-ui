import '@/components/ui/dir-theme.css'
import type { CSSProperties } from 'react'
import type { Choice } from '@/lib/choice-types.ts'
export function ChoiceContent({ item, compact = false }: { item: Choice; compact?: boolean }) {
  return (
    <span className='inline-flex items-center gap-[7px] min-w-0 [&_small]:block [&_small]:text-muted-foreground [&_small]:text-[11px]'>
      {item.avatar && <img src={item.avatar} alt='' className='w-[20px] h-[20px] object-cover rounded-[50%]' />}
      {item.color && (
        <span
          className='w-[7px] h-[7px] rounded-[50%] flex-none bg-(--choice-color)'
          style={{ '--choice-color': item.color } as CSSProperties}
        />
      )}
      <span>{item.label}{!compact && item.description && <small>{item.description}</small>}</span>
    </span>
  )
}
