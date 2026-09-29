import { queryTextRecords } from '../components/record-list/record-list-query.ts'
import type { RecordFilter } from '../components/query/model.ts'
const rows = [{ name: 'Beta', department: 'Sales', email: '' }, {
  name: 'Alpha',
  department: 'Sales',
  email: 'A@EXAMPLE.COM',
}, { name: 'Alpha', department: 'Support', email: 'b@example.com' }]
const fields = {
  title: (row: typeof rows[number]) => row.name,
  department: (row: typeof rows[number]) => row.department,
  email: (row: typeof rows[number]) => row.email,
}
function assert(condition: unknown) {
  if (!condition) throw new Error('Assertion failed')
}
Deno.test('record list combines search with grouped AND/OR filters', () => {
  const filter: RecordFilter = {
    conjunction: 'and',
    conditions: [{
      id: 'group',
      conjunction: 'or',
      conditions: [{ id: 'one', field: 'title', operator: 'eq', value: 'beta' }, {
        id: 'two',
        field: 'email',
        operator: 'endsWith',
        value: 'example.com',
      }],
    }, { id: 'three', field: 'department', operator: 'eq', value: 'sales' }],
  }
  const result = queryTextRecords(rows, fields, { filter, search: ' EXAMPLE ' })
  assert(result.length === 1 && result[0] === rows[1])
})
Deno.test('record list sorting applies secondary priority and preserves input and stable ties', () => {
  const result = queryTextRecords(rows, fields, {
    sorts: [{ field: 'title', direction: 'asc' }, { field: 'department', direction: 'desc' }],
  })
  assert(result[0] === rows[2] && result[1] === rows[1] && result[2] === rows[0])
  assert(rows[0]?.name === 'Beta')
  const stable = queryTextRecords(rows, fields, { sorts: [{ field: 'title', direction: 'asc' }] })
  assert(stable[0] === rows[1] && stable[1] === rows[2])
})
Deno.test('record list handles empty results, empty values, and cleared OR filters', () => {
  assert(queryTextRecords(rows, fields, { search: 'missing' }).length === 0)
  assert(queryTextRecords(rows, fields, { filter: { conjunction: 'or', conditions: [] } }).length === 3)
  const result = queryTextRecords(rows, fields, {
    filter: { conjunction: 'and', conditions: [{ id: 'empty', field: 'email', operator: 'empty' }] },
  })
  assert(result.length === 1 && result[0] === rows[0])
})

Deno.test('record list evaluates choice inclusion and exclusion with search and groups', () => {
  const filter: RecordFilter = {
    conjunction: 'and',
    conditions: [{ id: 'choice', field: 'department', operator: 'in', value: ['SALES', 'Other'] }],
  }
  const selected = queryTextRecords(rows, fields, { filter, search: 'alpha' })
  assert(selected.length === 1 && selected[0] === rows[1])
  const excluded = queryTextRecords(rows, fields, {
    filter: {
      conjunction: 'or',
      conditions: [{
        id: 'nested',
        conjunction: 'and',
        conditions: [{ id: 'choice', field: 'department', operator: 'notIn', value: ['sales'] }],
      }],
    },
  })
  assert(excluded.length === 1 && excluded[0] === rows[2])
  assert(
    queryTextRecords(rows, fields, {
      filter: { conjunction: 'and', conditions: [{ id: 'choice', field: 'department', operator: 'in', value: [] }] },
    }).length === 0,
  )
})
