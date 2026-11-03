import { Badge } from '@dir/ui/components/ui/badge.tsx'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { ChoiceValue, DateValue, NumberValue } from '@dir/ui/components/ui/value.tsx'
import { stage, tags } from './data.ts'
import type { ComponentDoc } from './index.ts'

export function BadgeDemo() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Badge>Manufacturing</Badge>
      <Badge>12</Badge>
      <Badge>
        <span className='tabular-nums'>SKU-20871</span>
      </Badge>
    </div>
  )
}
export function ChoiceValueDemo() {
  return (
    <div className='flex flex-wrap items-center gap-6'>
      <ChoiceValue items={[tags[0]!, tags[1]!, { ...tags[2]!, color: 'var(--ui-green)' }]} />
      <ChoiceValue items={[tags[0]!, tags[1]!]} onSelect={() => {}} />
      <ChoiceValue items={[]} />
    </div>
  )
}
export function ChoiceContentDemo() {
  const avatar = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#ececee"/><text x="10" y="14" font-size="9" text-anchor="middle" fill="#3f3f46" font-family="system-ui" font-weight="600">MS</text></svg>',
  )
  return (
    <div className='flex flex-wrap items-center gap-6'>
      <ChoiceContent item={stage('won')} compact />
      <ChoiceContent item={stage('lost')} compact />
      <ChoiceContent item={stage('negotiation')} />
      <ChoiceContent item={{ value: 'sato', label: 'Misaki Sato', avatar }} compact />
    </div>
  )
}
export function ValueDemo() {
  return (
    <div className='flex flex-wrap items-center gap-6 text-[13px] tabular-nums'>
      <NumberValue value={12000000} format='currency' currency='JPY' locale='ja-JP' maximumFractionDigits={0} />
      <NumberValue value={12.5} format='percent' maximumFractionDigits={1} />
      <DateValue value='2026-11-14' locale='ja-JP' />
      <DateValue value='2026-11-02T00:12:00Z' locale='ja-JP' timeZone='Asia/Tokyo' includeTime />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: BadgeDemo,
  sections: [
    {
      id: 'choice-content',
      title: 'Choice Content',
      description:
        'A 7px dot in the choice `color` with its label. Without `compact` the `description` shows; an `avatar` replaces the dot.',
      example: ChoiceContentDemo,
    },
    {
      id: 'choice-value',
      title: 'Choice Value',
      description: '`ChoiceValue` lists choices as chips; `onSelect` makes them buttons. An empty list renders a dash.',
      example: ChoiceValueDemo,
    },
    {
      id: 'values',
      title: 'Number and Date',
      description: '`NumberValue` and `DateValue` format with `Intl` and tabular numerals.',
      example: ValueDemo,
    },
  ],
}
