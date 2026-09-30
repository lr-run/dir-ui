import type { ReactNode } from 'react'
import { Menu } from '@base-ui/react/menu'

export function MenuPopup({ children }: { children: ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        className="z-2147483140 [&_[class~='group/query-action-menu']]:min-w-[240px]"
        sideOffset={5}
        align='end'
      >
        <Menu.Popup className='min-w-[190px] max-h-[min(var(--available-height,70vh),70vh)] max-w-[calc(100vw_-_20px)] overflow-y-auto [background:var(--ui-raised)] text-foreground p-[5px] [border:1px_solid_var(--ui-border)] rounded-[8px] [box-shadow:var(--ui-shadow)] [outline:none] [@media(max-width:_600px)]:[&_input]:text-[length:var(--dir-text-section)]'>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}
