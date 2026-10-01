import { reorderColumn } from '../src/components/data-grid/internal/column-settings.tsx'
import {
  conditionError,
  countConditions,
  filterErrors,
  moveItem,
  newCondition,
  operatorsFor,
  type QueryField,
  type RecordFilter,
} from '../src/lib/query.ts'
import { queryTextRecords } from '../src/lib/record-list-query.ts'
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}
const fields: QueryField[] = [
  { id: 'custom.amount', label: 'Budget', type: 'number' },
  { id: 'checked', label: 'Active', type: 'boolean' },
  { id: 'tags', label: 'Tags', type: 'multiSelect' },
  { id: 'date', label: 'Date', type: 'date' },
]
Deno.test('query model supports caller IDs and type-specific defaults without CRM definitions', () => {
  assert(newCondition(fields[0]!).field === 'custom.amount', 'Caller IDs must survive')
  assert(operatorsFor(fields[2]!).some((o) => o.id === 'all'), 'Multi select supports contains all')
  assert(newCondition(fields[1]!).value === true, 'Boolean default remains boolean')
  assert(
    !conditionError({ id: 'a', field: 'checked', operator: 'eq', value: false }, fields),
    'False is a valid filter value',
  )
  assert(!conditionError({ id: 'a', field: 'custom.amount', operator: 'eq', value: 0 }, fields), 'Zero is valid')
  assert(
    !!conditionError({ id: 'a', field: 'custom.amount', operator: 'between', value: [10, 2] }, fields),
    'Reject reversed range',
  )
  assert(
    !!conditionError({
      id: 'a',
      field: 'date',
      operator: 'relative',
      value: { direction: 'past', amount: 0, unit: 'day' },
    }, fields),
    'Reject invalid relative amount',
  )
})
Deno.test('nested drafts are counted and validated at any depth', () => {
  const filter: RecordFilter = {
    conjunction: 'and',
    conditions: [{
      id: 'g1',
      conjunction: 'or',
      conditions: [{
        id: 'g2',
        conjunction: 'and',
        conditions: [{ id: 'c', field: 'tags', operator: 'in', value: [] }],
      }],
    }],
  }
  assert(countConditions(filter) === 1, 'Count recursively')
  assert(filterErrors(filter, fields).length === 1, 'Incomplete drafts stay invalid')
  assert(filterErrors({ conjunction: 'and', conditions: [] }, fields).length === 0, 'An empty root clears filtering')
})
Deno.test('sort reordering preserves entries and protects out-of-bounds operations', () => {
  const original = ['a', 'b', 'c']
  assert(moveItem(original, 0, 2).join('') === 'bca', 'Reorders priority')
  assert(original.join('') === 'abc', 'Does not mutate caller state')
  assert(moveItem(original, -1, 2).join('') === 'abc', 'Invalid indices are ignored')
})
Deno.test('text demo evaluates deeply nested conditions and arbitrary field IDs', () => {
  const rows = [{ label: 'Acme' }, { label: 'Beta' }]
  const result = queryTextRecords(rows, { 'company.name': (r) => r.label }, {
    filter: {
      conjunction: 'and',
      conditions: [{
        id: 'g',
        conjunction: 'or',
        conditions: [{
          id: 'g2',
          conjunction: 'and',
          conditions: [{ id: 'c', field: 'company.name', operator: 'startsWith', value: 'a' }],
        }],
      }],
    },
  })
  assert(result.length === 1 && result[0]?.label === 'Acme', 'Arbitrary nested field matches')
})

Deno.test('column drops use insertion edges, stable IDs and avoid no-op updates', () => {
  const columns = ['a', 'b', 'c', 'd'].map((id) => ({ id, visible: id !== 'b', frozen: id === 'a' }))
  const ids = (value: { id: string }[]) => value.map((column) => column.id).join('')
  assert(ids(reorderColumn(columns, 'a', 'c', false)) === 'bacd', 'Drop before a lower row')
  assert(ids(reorderColumn(columns, 'a', 'c', true)) === 'bcad', 'Drop after a lower row')
  assert(ids(reorderColumn(columns, 'd', 'b', false)) === 'adbc', 'Drop before an upper row')
  assert(ids(reorderColumn(columns, 'd', 'b', true)) === 'abdc', 'Drop after an upper row')
  assert(reorderColumn(columns, 'a', 'b', false) === columns, 'Adjacent no-op keeps identity')
  assert(reorderColumn(columns, 'b', 'a', true) === columns, 'Adjacent reverse no-op keeps identity')
  assert(reorderColumn(columns, 'c', 'c', true) === columns, 'Self-drop keeps identity')
  assert(reorderColumn(columns, 'removed', 'c', true) === columns, 'Stale drag ignored')
  const result = reorderColumn(columns, 'a', 'd', true)
  assert(result[3] === columns[0] && result[0] === columns[1], 'Preserve visibility, freeze and object identity')
  assert(ids(columns) === 'abcd', 'Never mutate the input')
})
