import { useState } from 'react'
import { InlineInput, InlineRichText, InlineTextarea } from '@dir/ui/components/ui/inline-field.tsx'
import type { ComponentDoc } from './index.ts'

export function InlineFieldDemo() {
  const [amount, setAmount] = useState('12000000')
  const [date, setDate] = useState('2026-11-14')
  return (
    <dl className='m-0 grid w-full max-w-sm grid-cols-[96px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-[13px] [&_dt]:text-muted-foreground [&_dd]:m-0'>
      <dt>Amount</dt>
      <dd>
        <InlineInput label='Amount' type='money' currency='JPY' value={amount} onValueChange={(v) => setAmount(v)} />
      </dd>
      <dt>Close date</dt>
      <dd>
        <InlineInput label='Close date' type='date' value={date} onValueChange={(v) => setDate(v)} />
      </dd>
    </dl>
  )
}
export function InlineFieldRichText() {
  const [memo, setMemo] = useState<{ notes: string }>({ notes: '' })
  return (
    <div className='w-full max-w-sm'>
      <InlineRichText label='Memo' value={memo} onValueChange={(v) => setMemo({ notes: v.notes })} />
    </div>
  )
}
export function InlineFieldSaveStates() {
  const [value, setValue] = useState('Hokuto Manufacturing')
  const save = (next: string) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setValue(next)
        resolve()
      }, 1500)
    )
  return (
    <dl className='m-0 grid w-full max-w-sm grid-cols-[96px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-[13px] [&_dt]:text-muted-foreground [&_dd]:m-0'>
      <dt>Company</dt>
      <dd>
        <InlineInput label='Company' value={value} onValueChange={save} />
      </dd>
      <dt>Amount</dt>
      <dd>
        <InlineInput
          label='Amount'
          type='money'
          currency='JPY'
          value='12000000'
          onValueChange={() => Promise.reject(new Error('Value is out of range'))}
        />
      </dd>
    </dl>
  )
}
export function InlineFieldTypes() {
  const [notes, setNotes] = useState('Expand the PoC to two lines.')
  return (
    <dl className='m-0 grid w-full max-w-sm grid-cols-[96px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-[13px] [&_dt]:text-muted-foreground [&_dd]:m-0'>
      <dt>Notes</dt>
      <dd>
        <InlineTextarea label='Notes' value={notes} onValueChange={(v) => setNotes(v)} />
      </dd>
      <dt>Margin</dt>
      <dd>
        <InlineInput label='Margin' type='percent' value='12.5' onValueChange={() => {}} />
      </dd>
      <dt>Next call</dt>
      <dd>
        <InlineInput label='Next call' type='datetime-local' value='2026-11-14T10:00' onValueChange={() => {}} />
      </dd>
    </dl>
  )
}
export const doc: ComponentDoc = {
  hero: InlineFieldDemo,
  sections: [
    {
      id: 'save-states',
      title: 'Saving and Errors',
      description:
        'Return a promise from `onValueChange`. While it is pending the value dims; a rejection keeps the unsaved value, and `InlineSaveFeedback` shows the error with Cancel and Retry.',
      example: InlineFieldSaveStates,
    },
    {
      id: 'types',
      title: 'Types',
      description: 'The same `type` values as `Input`. `InlineTextarea` saves with ⌘Enter.',
      example: InlineFieldTypes,
    },
    {
      id: 'rich-text',
      title: 'Rich Text',
      description: '`InlineRichText` shows a toolbar on selection and saves on blur or ⌘Enter.',
      example: InlineFieldRichText,
    },
  ],
}
