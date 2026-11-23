// A small tooltip that explains why a control is disabled. Built on the shadcn Tooltip.
import type { ReactElement, ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'

export function Hint({ label, children }: { label: ReactNode; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent sideOffset={7} className='max-w-[220px] px-2 py-[5px] text-[11px]'>{label}</TooltipContent>
    </Tooltip>
  )
}
