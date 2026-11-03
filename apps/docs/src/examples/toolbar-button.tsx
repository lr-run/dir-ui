import { Columns3Icon, ListFilterIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react'
import { ToolbarButton } from '@dir/ui/components/ui/toolbar-button.tsx'
import type { ComponentDoc } from './index.ts'

export function ToolbarButtonToolbar() {
  return (
    <div className='flex w-full flex-wrap items-center gap-1.5 border-y border-border py-2'>
      <ToolbarButton
        icon={<SearchIcon size={14} strokeWidth={1.5} aria-hidden='true' />}
        active
        className='w-[200px] justify-start text-muted-foreground'
      >
        Search
      </ToolbarButton>
      <ToolbarButton icon={<ListFilterIcon size={14} strokeWidth={1.5} aria-hidden='true' />} active chevron>
        Sort: Updated ↓
      </ToolbarButton>
      <ToolbarButton icon={<SlidersHorizontalIcon size={14} strokeWidth={1.5} aria-hidden='true' />} active chevron>
        Filter 2
      </ToolbarButton>
      <ToolbarButton icon={<Columns3Icon size={14} strokeWidth={1.5} aria-hidden='true' />}>Columns</ToolbarButton>
      <span className='ml-auto text-[12px] text-muted-foreground'>42 records</span>
    </div>
  )
}
export function ToolbarButtonStates() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <ToolbarButton icon={<SlidersHorizontalIcon size={14} strokeWidth={1.5} aria-hidden='true' />}>
        Filter
      </ToolbarButton>
      <ToolbarButton icon={<ListFilterIcon size={14} strokeWidth={1.5} aria-hidden='true' />} chevron>
        Sort
      </ToolbarButton>
      <ToolbarButton icon={<SlidersHorizontalIcon size={14} strokeWidth={1.5} aria-hidden='true' />} active disabled>
        Stage
      </ToolbarButton>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: ToolbarButtonToolbar,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'states',
      title: 'States',
      description:
        'Without `active` an unset filter shows the dashed placeholder. `chevron` marks a menu trigger. `disabled` renders at 45%.',
      example: ToolbarButtonStates,
    },
  ],
}
