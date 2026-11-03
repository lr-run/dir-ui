import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { MultiCombobox } from '../packages/ui/src/components/ui/combobox.tsx'

const items = [{ value: 'new', label: 'New' }, { value: 'west', label: 'West' }]
const placeholderOf = (html: string) => html.match(/<input[^>]*placeholder="([^"]*)"/)?.[1]

Deno.test('multi combobox shows its placeholder only while nothing is selected', () => {
  const empty = renderToStaticMarkup(<MultiCombobox label='Tags' items={items} value={[]} onValueChange={() => {}} />)
  assert.equal(placeholderOf(empty), 'Search to add…')
  const selected = renderToStaticMarkup(
    <MultiCombobox label='Tags' items={items} value={['new']} onValueChange={() => {}} placeholder='Add tags' />,
  )
  assert.equal(placeholderOf(selected) ?? '', '')
})
