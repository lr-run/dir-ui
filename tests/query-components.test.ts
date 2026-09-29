import {
  conditionError,
  countConditions,
  filterErrors,
  moveItem,
  newCondition,
  operatorsFor,
  type QueryField,
  type RecordFilter,
} from '../components/query/model.ts'
import { queryTextRecords } from '../components/record-list/record-list-query.ts'
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
