import { PlusIcon } from 'lucide-react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { PopoverPanel } from '@dir/ui/components/ui/popover-panel.tsx'
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
export const doc: ComponentDoc = {
  hero: PopoverDemo,
  sections: [],
}
