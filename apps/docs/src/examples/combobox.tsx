import { useState } from 'react'
import { MultiCombobox, SingleCombobox } from '@dir/ui/components/ui/combobox.tsx'
import { InlineCombobox, InlineMultiCombobox } from '@dir/ui/components/ui/inline-inputs.tsx'
import { people, tags } from './data.ts'
import type { ComponentDoc } from './index.ts'
import { SelectionGuide } from './selection-guide.tsx'

export function ComboboxDemo() {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div className='w-[240px]'>
      <SingleCombobox label='Owner' items={people} placeholder='Search people' value={value} onValueChange={setValue} />
    </div>
  )
}
export function ComboboxWhenToUse() {
  return <SelectionGuide current='Combobox' />
}
export function ComboboxMultiple() {
  const [value, setValue] = useState<string[]>(['new', 'manufacturing'])
  return (
    <div className='w-[280px]'>
      <MultiCombobox label='Tags' items={tags} value={value} onValueChange={setValue} />
    </div>
  )
}
export function ComboboxRemote() {
  const [value, setValue] = useState<string | null>(null)
  const loadOptions = async (query: string, { signal }: { signal: AbortSignal }) => {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 600)
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new Error('Canceled'))
      }, { once: true })
    })
    return { items: people.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())) }
  }
  return (
    <div className='w-[240px]'>
      <SingleCombobox
        label='Owner'
        items={[]}
        loadOptions={loadOptions}
        placeholder='Search people'
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}
export function ComboboxClearable() {
  const [value, setValue] = useState<string | null>('sato')
  return (
    <div className='w-[240px]'>
      <SingleCombobox label='Owner' items={people} value={value} onValueChange={setValue} clearable />
    </div>
  )
}
export function ComboboxInline() {
  const [owner, setOwner] = useState<string | null>('sato')
  const [chosen, setChosen] = useState<string[]>(['new', 'manufacturing'])
  return (
    <dl className='m-0 grid w-full max-w-sm grid-cols-[96px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-[13px] [&_dt]:text-muted-foreground [&_dd]:m-0'>
      <dt>Owner</dt>
      <dd>
        <InlineCombobox label='Owner' items={people} value={owner} onValueChange={(next) => setOwner(next)} />
      </dd>
      <dt>Tags</dt>
      <dd>
        <InlineMultiCombobox label='Tags' items={tags} value={chosen} onValueChange={(next) => setChosen(next)} />
      </dd>
    </dl>
  )
}
export function ComboboxStates() {
  return (
    <div className='grid w-[240px] gap-3'>
      <SingleCombobox
        label='Owner'
        items={people}
        value={null}
        onValueChange={() => {}}
        placeholder='Search people'
        invalid
      />
      <SingleCombobox label='Owner' items={people} value='sato' onValueChange={() => {}} disabled />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: ComboboxDemo,
  sections: [
    {
      id: 'when-to-use',
      title: 'When to Use',
      description: 'Use `SingleCombobox` for a long or remote list and `MultiCombobox` for every multiple selection.',
      example: ComboboxWhenToUse,
      align: 'stretch',
      code: false,
    },
    {
      id: 'multiple',
      title: 'Multiple',
      description:
        '`MultiCombobox` shows the selection as chips; they wrap and the control grows. Backspace removes the last chip.',
      example: ComboboxMultiple,
    },
    {
      id: 'remote',
      title: 'Remote Search',
      description:
        'Pass `loadOptions` to search on the server. The popup shows a loading state, then "No results" when nothing matches.',
      example: ComboboxRemote,
    },
    {
      id: 'clearable',
      title: 'Clearable',
      description: 'Use `clearable` for a clear button.',
      example: ComboboxClearable,
    },
    { id: 'states', title: 'States', description: 'Use `invalid` and `disabled`.', example: ComboboxStates },
    {
      id: 'inline',
      title: 'Inline',
      description: '`InlineCombobox` and `InlineMultiCombobox` edit a record property in place and save on change.',
      example: ComboboxInline,
    },
  ],
}
