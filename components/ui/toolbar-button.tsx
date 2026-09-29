import type { ComponentProps } from 'react'
const paths = {
  sort: 'M5 17V5M2 8l3-3 3 3M12 7h9M12 12h6M12 17h3',
  descending: 'M5 5v12M2 14l3 3 3-3M12 7h3M12 12h6M12 17h9',
  filter: 'M4 6h16M7 12h10M10 18h4',
  columns: 'M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6M7 14v6',
}
export function ToolbarButton(
  { icon, active, chevron, children, className = '', ...props }: ComponentProps<'button'> & {
    icon: keyof typeof paths
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
      <svg
        className='crm-toolbar-icon block flex-none text-muted-foreground'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden
      >
        <path d={paths[icon]} />
      </svg>
      {children}
      {chevron && (
        <svg
          className='crm-toolbar-chevron block flex-none'
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden
        >
          <path d='m7 10 5 5 5-5' />
        </svg>
      )}
    </button>
  )
}
