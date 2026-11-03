import { Button } from '@dir/ui/components/ui/button.tsx'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { List, ListItem } from '@dir/ui/components/ui/list.tsx'
import { NumberValue } from '@dir/ui/components/ui/value.tsx'
import { stage } from './data.ts'
import type { ComponentDoc } from './index.ts'

export function ListDemo() {
  return (
    <List className='w-full rounded-lg border border-border [&_li]:px-3'>
      <ListItem
        leading={
          <span className='mt-0.5 size-4 rounded-sm border-[1.5px] border-muted-foreground/70' aria-hidden='true' />
        }
        title='Hokuto Manufacturing — Production management PoC'
        description='10:00–11:30 · Visit'
        meta='Negotiation → Proposed'
        trailing={<ChoiceContent item={stage('proposed')} compact />}
        actions={<Button>Edit</Button>}
      />
      <ListItem
        title='ABC Trading — Core system renewal'
        description='14:00 · Call'
        trailing={
          <span className='text-[13px] font-medium tabular-nums'>
            <NumberValue value={12000000} format='currency' currency='JPY' locale='ja-JP' maximumFractionDigits={0} />
          </span>
        }
      />
    </List>
  )
}
export function ListSelected() {
  return (
    <List className='w-full rounded-lg border border-border [&_li]:px-3'>
      <ListItem
        title='Aluminum frame 40×40 L2000'
        description='SKU-20871 · B-11-4'
        meta='48 / reorder point 50'
        selected
        trailing={<ChoiceContent item={{ value: 'reorder', label: 'Reorder', color: 'var(--ui-amber)' }} compact />}
      />
      <ListItem
        title='Linear guide SHS15'
        description='SKU-30119 · B-02-1'
        meta='212 / reorder point 80'
        trailing={<ChoiceContent item={{ value: 'ok', label: 'Healthy', color: 'var(--ui-green)' }} compact />}
      />
    </List>
  )
}
export function ListEmpty() {
  return <List className='w-full rounded-lg border border-border text-[13px]' empty='No items yet.' />
}
export function ListActions() {
  return (
    <List className='w-full rounded-lg border border-border [&_li]:px-3'>
      <ListItem
        title='#4821 Report export fails'
        meta='2026/10/28 · Customer success'
        actions={
          <>
            <Button>Reply</Button>
            <Button>Resolve</Button>
          </>
        }
      />
    </List>
  )
}
export const doc: ComponentDoc = {
  hero: ListDemo,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'selected',
      title: 'Selected',
      description: 'Use `selected` for the current item; it sets `data-selected` and the hover background.',
      example: ListSelected,
      align: 'stretch',
    },
    {
      id: 'empty',
      title: 'Empty',
      description: 'Pass `empty` for the text shown when there are no children.',
      example: ListEmpty,
      align: 'stretch',
    },
    {
      id: 'actions',
      title: 'Actions',
      description: '`actions` renders buttons at the end of the item; they wrap into a column under 700px.',
      example: ListActions,
      align: 'stretch',
    },
  ],
}
