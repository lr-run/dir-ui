import { CopyIcon } from 'lucide-react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import { Hint } from '@dir/ui/components/ui/hint.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@dir/ui/components/ui/tooltip.tsx'
import type { ComponentDoc } from './index.ts'

export function TooltipDemo() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Tooltip>
        <TooltipTrigger render={<IconButton label='Duplicate deal' />}>
          <CopyIcon aria-hidden='true' />
        </TooltipTrigger>
        <TooltipContent>
          Duplicate deal <kbd className='ml-1 opacity-70'>⌘D</kbd>
        </TooltipContent>
      </Tooltip>
      {(['right', 'bottom'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button size='sm' />}>{side}</TooltipTrigger>
          <TooltipContent side={side}>{side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
export function HintDemo() {
  return (
    <Hint label='Archived records cannot be edited'>
      <span className='inline-flex'>
        <Button disabled>Edit</Button>
      </span>
    </Hint>
  )
}
export const doc: ComponentDoc = {
  hero: TooltipDemo,
  sections: [
    {
      id: 'hint',
      title: 'Hint',
      description: 'A smaller tooltip that explains why a control is disabled.',
      example: HintDemo,
    },
  ],
}
