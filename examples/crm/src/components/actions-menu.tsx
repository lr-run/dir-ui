import { EllipsisVerticalIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'

export function ActionsMenu({ label, items, disabled = false }: {
  label: string
  items: { label: string; icon: ReactNode; onClick: () => void }[]
  disabled?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-auto min-w-[190px]'>
        {items.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onClick}>
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
