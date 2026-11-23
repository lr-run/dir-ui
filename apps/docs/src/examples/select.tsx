import { useState } from 'react'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { InlineSelect } from '@dir/ui/components/ui/inline-choice.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@dir/ui/components/ui/select.tsx'
import { people, stages } from './data.ts'
import type { ComponentDoc } from './index.ts'
import { SelectionGuide } from './selection-guide.tsx'

const priorities = ['Low', 'Medium', 'High', 'Urgent'].map((p) => ({ value: p.toLowerCase(), label: p }))

export function SelectDemo() {
  const [value, setValue] = useState('medium')
  return (
    <div className='w-[180px]'>
      <Select label='Priority' items={priorities} value={value} onChange={setValue} />
    </div>
  )
}
export function SelectWhenToUse() {
  return <SelectionGuide current='Select' />
}
export function SelectStatus() {
  const [value, setValue] = useState<string | null>('negotiation')
  const current = stages.find((item) => item.value === value)
  return (
    <SelectRoot items={stages} value={value} onValueChange={setValue}>
      <SelectTrigger aria-label='Stage' className='w-[180px]'>
        <SelectValue>{() => current ? <ChoiceContent item={current} compact /> : 'Select a stage'}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {stages.map((item) => (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            <ChoiceContent item={item} compact />
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
export function SelectGroups() {
  const [value, setValue] = useState<string | null>('sato')
  const groups = Map.groupBy(people, (item) => item.description ?? '')
  return (
    <SelectRoot items={people} value={value} onValueChange={setValue}>
      <SelectTrigger aria-label='Owner' className='w-[200px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {[...groups].map(([label, members]) => (
          <SelectGroup key={label}>
            <SelectLabel>{label}</SelectLabel>
            {members.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectGroup>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
export function SelectSmall() {
  const [value, setValue] = useState<string | null>('medium')
  return (
    <SelectRoot items={priorities} value={value} onValueChange={setValue}>
      <SelectTrigger size='sm' aria-label='Priority' className='w-[160px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {priorities.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
      </SelectContent>
    </SelectRoot>
  )
}
export function SelectInline() {
  const [value, setValue] = useState('negotiation')
  return (
    <div className='w-[220px]'>
      <InlineSelect label='Stage' items={stages} value={value} onValueChange={(next) => setValue(next)} />
    </div>
  )
}
export function SelectStates() {
  const [value, setValue] = useState('')
  return (
    <div className='grid w-[180px] gap-3'>
      <Select
        label='Priority'
        items={[{ value: '', label: 'Select a priority' }, ...priorities]}
        value={value}
        onChange={setValue}
        invalid
      />
      <Select label='Priority' items={priorities} value='medium' onChange={() => {}} disabled />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: SelectDemo,
  sections: [
    {
      id: 'when-to-use',
      title: 'When to Use',
      description:
        'Use `Select` when the user picks exactly one value from a short list they can scan without searching.',
      example: SelectWhenToUse,
      align: 'stretch',
      code: false,
    },
    {
      id: 'status',
      title: 'Status',
      description: 'Compose `SelectRoot` and render items with `ChoiceContent` for the status dot.',
      example: SelectStatus,
    },
    { id: 'groups', title: 'Groups', description: 'Use `SelectGroup` and `SelectLabel`.', example: SelectGroups },
    {
      id: 'size',
      title: 'Size',
      description: '`size="sm"` on `SelectTrigger` gives a 28px trigger for toolbars.',
      example: SelectSmall,
    },
    { id: 'states', title: 'States', description: 'Use `invalid` and `disabled`.', example: SelectStates },
    {
      id: 'inline',
      title: 'Inline',
      description: '`InlineSelect` edits a record property in place and saves on change. It installs with InlineField.',
      example: SelectInline,
    },
  ],
}
