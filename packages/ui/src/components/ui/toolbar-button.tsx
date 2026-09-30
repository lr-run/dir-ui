import { ChevronDownIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
export function ToolbarButton(
  { icon, active, chevron, children, className = '', ...props }: ComponentProps<'button'> & {
    icon: ReactNode
    active?: boolean
    chevron?: boolean
  },
) {
  return (
    <button
      type='button'
      {...props}
      className={`group/crm-toolbar-button inline-flex items-center justify-center gap-1.5 flex-initial min-w-0 max-w-full h-7 px-2 border border-[color-mix(in_srgb,var(--ui-text)_10%,transparent)] rounded-lg bg-(--ui-raised) text-foreground text-xs font-normal leading-5 whitespace-nowrap cursor-pointer shadow-[0_1px_2px_#00000004] data-placeholder:text-muted-foreground data-placeholder:border-dashed data-placeholder:border-[color-mix(in_srgb,var(--ui-text)_7%,transparent)] data-placeholder:shadow-none enabled:hover:bg-accent enabled:hover:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground focus-visible:outline focus-visible:outline-(--ui-focus) focus-visible:outline-offset-2 disabled:opacity-45 disabled:cursor-default ${className}`}
      data-active={active || undefined}
      data-placeholder={!active && !chevron || undefined}
    >
      {icon}
      {children}
      {chevron && <ChevronDownIcon size={12} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
    </button>
  )
}
