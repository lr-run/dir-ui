import { CopyIcon, PencilIcon } from 'lucide-react'
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
import type { ComponentDoc } from './index.ts'

export function DropdownMenuDemo() {
  const [sort, setSort] = useState('updated')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button>More</Button>} />
      <DropdownMenuContent align='start' className='w-48'>
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
export const doc: ComponentDoc = {
  hero: DropdownMenuDemo,
  sections: [],
}
