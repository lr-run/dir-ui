import type { ComponentDoc } from './index.ts'
import { useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { List, ListItem } from '@dir/ui/components/ui/list.tsx'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@dir/ui/components/ui/sheet.tsx'

const skus = ['Aluminum frame 40×40 L2000', 'Linear guide SHS15', 'PLC input unit']

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button>Open record</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle className='text-[14px] font-semibold'>Core system renewal</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div className='p-4 text-[13px] text-muted-foreground'>SheetBody scrolls on its own.</div>
        </SheetBody>
        <SheetFooter>
          <Button>Archive</Button>
          <SheetClose render={<Button variant='default'>Open</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
export function SheetLeft() {
  return (
    <Sheet>
      <SheetTrigger render={<Button>Open navigation</Button>} />
      <SheetContent side='left'>
        <SheetHeader>
          <SheetTitle className='text-[13px] font-medium'>Sales workspace</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <List className='p-2 [&_li]:border-0 [&_li]:p-2'>
            {['Companies', 'Deals', 'People', 'Report'].map((label) => (
              <ListItem key={label} title={label} selected={label === 'Deals'} className='rounded-md' />
            ))}
          </List>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
export function SheetInline() {
  const [selected, setSelected] = useState(0)
  return (
    <div className='flex h-[220px] w-full overflow-hidden rounded-lg border border-border bg-(--ui-surface)'>
      <List className='w-[38%] shrink-0 border-r border-border'>
        {skus.map((label, index) => (
          <ListItem
            key={label}
            title={
              <button type='button' className='text-left font-medium' onClick={() => setSelected(index)}>
                {label}
              </button>
            }
            selected={selected === index}
            className='p-[10px_12px]'
          />
        ))}
      </List>
      <div className='min-w-0 flex-1'>
        <Sheet open modal={false} disablePointerDismissal onOpenChange={() => {}}>
          <SheetContent inline backdrop={false} className='border-l-0'>
            <SheetHeader>
              <SheetTitle className='text-[14px] font-semibold'>{skus[selected]}</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <div className='p-4 text-[13px] text-muted-foreground'>No shadow, width auto, height 100%.</div>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: SheetDemo,
  sections: [
    {
      id: 'left',
      title: 'Left',
      description: 'Use `side="left"`; this is how the `Sidebar` renders on phones.',
      example: SheetLeft,
    },
    {
      id: 'inline',
      title: 'Inline',
      description:
        'Use `inline` to render the sheet in flow beside a list, as the detail pane of the master-detail pattern. Selecting another row swaps the content.',
      example: SheetInline,
      align: 'stretch',
    },
  ],
}
