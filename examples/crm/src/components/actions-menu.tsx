import { Menu } from '@base-ui/react/menu'
import { EllipsisVerticalIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { MenuPopup } from '@/components/ui/menu-popup.tsx'

export function ActionsMenu({ label, items, disabled = false }: {
  label: string
  items: { label: string; icon: ReactNode; onClick: () => void }[]
  disabled?: boolean
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <IconButton
            label={label}
            variant='ghost'
            disabled={disabled}
            className='h-7 shrink-0 text-muted-foreground'
          />
        }
      >
        <EllipsisVerticalIcon size={16} strokeWidth={1.5} aria-hidden />
      </Menu.Trigger>
      <MenuPopup>
        {items.map((item) => (
          <Menu.Item
            key={item.label}
            onClick={item.onClick}
            className='flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-xs outline-none data-highlighted:bg-accent'
          >
            {item.icon}
            {item.label}
          </Menu.Item>
        ))}
      </MenuPopup>
    </Menu.Root>
  )
}
