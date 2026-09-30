import type { ComponentProps } from 'react'
import { Button } from './button.tsx'
export function IconButton(
  { label, children, className = '', title, ...props }: ComponentProps<typeof Button> & { label: string },
) {
  return (
    <Button
      {...props}
      aria-label={label}
      title={title ?? label}
      className={`group/crm-icon-button w-[28px] p-0 [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:shrink-0 ${className}`}
    >
      {children}
    </Button>
  )
}
