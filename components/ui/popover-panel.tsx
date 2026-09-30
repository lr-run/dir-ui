import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from './popover.tsx'

export type PopoverPanelProps = {
  trigger: ReactElement
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  width?: number | string
}
/** Generic button-triggered panel; the caller owns the content and commit behavior. */
export function PopoverPanel(
  {
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange,
    align = 'start',
    side = 'bottom',
    width = 320,
    className,
  }: PopoverPanelProps,
) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        className={`w-(--panel-width) max-w-[calc(100vw-24px)] max-h-(--available-height) overflow-y-auto ${
          className ?? ''
        }`}
        align={align}
        side={side}
        sideOffset={6}
        style={{ '--panel-width': typeof width === 'number' ? `${width}px` : width } as CSSProperties}
      >
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
          {description && <PopoverDescription>{description}</PopoverDescription>}
        </PopoverHeader>
        {children}
      </PopoverContent>
    </Popover>
  )
}
