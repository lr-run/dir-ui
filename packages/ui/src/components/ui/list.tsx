import type { ComponentProps, ReactNode } from 'react'
export function List({
  children,
  empty,
  separators = 'between',
  className = '',
  ...props
}: ComponentProps<'ul'> & {
  empty?: ReactNode
  /** Include a separator before the first row when the list meets a panel header. */
  separators?: 'between' | 'start' | 'none'
}) {
  const separatorClass = separators === 'start'
    ? '[&>[data-list-item]]:[border-top:1px_solid_var(--ui-border)]'
    : separators === 'between'
    ? '[&>[data-list-item]:not(:last-child)]:[border-bottom:1px_solid_var(--ui-border)]'
    : ''
  return (
    <ul {...props} className={`group/ui-list list-none m-0 p-0 w-full ${separatorClass} ${className}`}>
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
  href,
  onOpen,
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
  /** Makes the whole row open a record; the title becomes the row's one link or button. */
  href?: string
  onOpen?: () => void
}) {
  const opens = !!(href || onOpen)
  const stretch =
    'text-left text-inherit no-underline [font:inherit] [overflow-wrap:anywhere] after:absolute after:inset-0 after:content-[""] focus-visible:outline-none focus-visible:after:[outline:2px_solid_var(--ui-focus)] focus-visible:after:outline-offset-[-2px]'
  const heading = !opens ? title : href
    ? (
      <a
        href={href}
        className={stretch}
        onClick={(event) => {
          if (!onOpen || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onOpen()
        }}
      >
        {title}
      </a>
    )
    : <button type='button' className={stretch} onClick={onOpen}>{title}</button>
  return (
    <li
      {...props}
      className={`${
        opens
          ? 'relative cursor-pointer [&:hover]:[background:var(--ui-hover)] [&_[data-list-actions]]:relative [&_[data-list-actions]]:z-1'
          : ''
      } flex items-start gap-[12px] p-[14px_8px] text-[13px] [&[data-selected]]:[background:var(--ui-hover)] ${
        props.className ?? ''
      }`}
      data-list-item=''
      data-selected={selected || undefined}
    >
      {leading && <div className='ui-list-leading'>{leading}</div>}
      <div className='flex-1 min-w-0'>
        <div className='font-medium [overflow-wrap:anywhere]'>{heading}</div>
        {description && <div className='mt-[4px] text-muted-foreground'>{description}</div>}
        {children}
        {meta && <div className='text-[11px] text-muted-foreground mt-[6px]'>{meta}</div>}
      </div>
      {trailing}
      {actions && (
        <div data-list-actions className='flex items-center gap-[6px] flex-wrap [@media(max-width:700px)]:flex-col'>
          {actions}
        </div>
      )}
    </li>
  )
}
