import '@/components/ui/dir-theme.css'
import type { ComponentProps, ReactNode } from 'react'
export function List({ children, empty, ...props }: ComponentProps<'ul'> & { empty?: ReactNode }) {
  return (
    <ul {...props} className={`group/ui-list list-none m-0 p-0 w-full ${props.className ?? ''}`}>
      {children || <li className='p-[24px] text-muted-foreground text-center'>{empty ?? 'No items yet.'}</li>}
    </ul>
  )
}
export function ListItem({
  title,
  description,
  meta,
  leading,
  trailing,
  actions,
  selected,
  children,
  ...props
}: Omit<ComponentProps<'li'>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  actions?: ReactNode
  selected?: boolean
}) {
  return (
    <li
      {...props}
      className={`flex items-start gap-[12px] p-[14px_8px] [border-bottom:1px_solid_var(--ui-border)] text-[13px] [&:last-child]:[border-bottom:0] [&[data-selected]]:[background:var(--ui-hover)] ${
        props.className ?? ''
      }`}
      data-selected={selected || undefined}
    >
      {leading && <div className='ui-list-leading'>{leading}</div>}
      <div className='flex-1 min-w-0'>
        <div className='font-medium [overflow-wrap:anywhere]'>{title}</div>
        {description && <div className='mt-[4px] text-muted-foreground'>{description}</div>}
        {children}
        {meta && <div className='text-[11px] text-muted-foreground mt-[6px]'>{meta}</div>}
      </div>
      {trailing}
      {actions && (
        <div className='flex items-center gap-[6px] flex-wrap [@media(max-width:700px)]:flex-col'>{actions}</div>
      )}
    </li>
  )
}
