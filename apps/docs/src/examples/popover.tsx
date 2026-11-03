import { CopyIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@dir/ui/components/ui/dropdown-menu.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { PopoverPanel } from '@dir/ui/components/ui/popover-panel.tsx'
import { Hint, Tooltip, TooltipContent, TooltipTrigger } from '@dir/ui/components/ui/tooltip.tsx'
import type { ComponentDoc } from './index.ts'

export function PopoverDemo() {
  return (
    <PopoverPanel
      title='View name'
      trigger={
        <Button>
          <PlusIcon aria-hidden='true' />Save view
        </Button>
      }
      width={280}
    >
      <div className='grid gap-3'>
        <Input defaultValue='My open deals' aria-label='View name' />
        <div className='flex justify-end gap-1.5'>
          <Button>Cancel</Button>
          <Button variant='default'>Save</Button>
        </div>
      </div>
    </PopoverPanel>
  )
}
export function HintDemo() {
  return (
    <Hint label='Archived records cannot be edited'>
      <span className='inline-flex'>
        <Button disabled>Edit</Button>
      </span>
    </Hint>
  )
}
export function DropdownMenuDemo() {
  const [sort, setSort] = useState('updated')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button>More</Button>} />
      <DropdownMenuContent align='start'>
        <DropdownMenuItem>
          <PencilIcon aria-hidden='true' />Rename<DropdownMenuShortcut>⏎</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon aria-hidden='true' />Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={(next) => setSort(String(next))}>
            <DropdownMenuRadioItem value='updated'>Updated</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='amount'>Amount</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Show columns</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem checked>Deal</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Currency</DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive'>Delete…</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export function TooltipDemo() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Tooltip>
        <TooltipTrigger render={<IconButton label='Duplicate deal' />}>
          <CopyIcon aria-hidden='true' />
        </TooltipTrigger>
        <TooltipContent>
          Duplicate deal <kbd className='ml-1 opacity-70'>⌘D</kbd>
        </TooltipContent>
      </Tooltip>
      {(['right', 'bottom'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button size='sm' />}>{side}</TooltipTrigger>
          <TooltipContent side={side}>{side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: PopoverDemo,
  sections: [
    {
      id: 'dropdown-menu',
      title: 'Dropdown Menu',
      description: 'Actions with icons and shortcuts, radio and checkbox groups, submenus, and a `destructive` item.',
      example: DropdownMenuDemo,
    },
    {
      id: 'tooltip',
      title: 'Tooltip',
      description: 'For icon-only buttons; opens with no delay on hover and focus. `side` sets the placement.',
      example: TooltipDemo,
    },
    {
      id: 'hint',
      title: 'Hint',
      description: 'A smaller tooltip that explains why a control is disabled.',
      example: HintDemo,
    },
  ],
}
