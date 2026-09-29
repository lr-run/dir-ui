import type { ReactNode } from 'react'
import { Menu } from '@base-ui/react/menu'
import { I } from '../../ui/index.tsx'

export const columnMenuItem =
  'flex items-center gap-2 min-h-8 px-2 py-1.5 rounded cursor-default outline-none text-[13px] leading-5 data-highlighted:bg-accent data-disabled:opacity-40'

export function ColumnPopup({ children }: { children: ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Positioner className='z-2147483140' sideOffset={3} align='start'>
        <Menu.Popup className='min-w-[220px] max-w-[min(320px,calc(100vw_-_24px))] p-1 border border-border rounded-lg bg-popover text-popover-foreground shadow-md outline-none text-[13px]'>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

export function ColumnHeader({ label, icon, direction, tabIndex, children }: {
  label: string
  icon?: ReactNode
  direction?: 'ASC' | 'DESC'
  tabIndex: number
  children: ReactNode
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        tabIndex={tabIndex}
        aria-label={`${label} column menu`}
        className='group/column-header flex h-full w-full items-center gap-2 border-0 bg-transparent px-3 text-left text-inherit [font:inherit] hover:bg-accent focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1 data-popup-open:bg-accent'
      >
        <span aria-hidden className='inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground'>
          {icon ?? <I name='text' />}
        </span>
        <span className='min-w-0 flex-1 truncate'>{label}</span>
        {direction && (
          <span className='shrink-0 text-xs' aria-label={direction === 'ASC' ? 'Ascending' : 'Descending'}>
            {direction === 'ASC' ? '↑' : '↓'}
          </span>
        )}
        <span
          aria-hidden
          className='inline-flex size-3.5 shrink-0 items-center justify-center text-muted-foreground opacity-0 group-hover/column-header:opacity-100 group-focus-visible/column-header:opacity-100 group-data-popup-open/column-header:opacity-100'
        >
          <I name='chevron' />
        </span>
      </Menu.Trigger>
      <ColumnPopup>{children}</ColumnPopup>
    </Menu.Root>
  )
}
