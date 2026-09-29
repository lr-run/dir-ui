import { isDeepStrictEqual } from 'node:util'
import { createExampleState, exampleReducer } from '../examples/crm/example/store.ts'
import { addListView } from '../examples/crm/screens/list-page.tsx'

function assert(value: unknown, message: string) {
  if (!value) throw new Error(message)
}

Deno.test('example views retain query and column settings independently per collection', () => {
  const initial = createExampleState(3)
  let state = exampleReducer(initial, {
    type: 'views',
    kind: 'companies',
    value: (previous) => addListView(previous, previous.views[0]!, 'Customers'),
  })
  state = exampleReducer(state, {
    type: 'views',
    kind: 'companies',
    value: (previous) => ({
      ...previous,
      views: previous.views.map((view) =>
        view.id !== previous.activeId ? view : {
          ...view,
          sorts: [{ field: 'name', direction: 'desc' }],
          filter: {
            conjunction: 'and',
            conditions: [{ id: 'status', field: 'status', operator: 'eq', value: 'Customer' }],
          },
          columns: [{ key: 'domain', hidden: true, frozen: true, width: 200 }],
        }
      ),
    }),
  })
  const companyViews = state.views.companies
  state = exampleReducer(state, {
    type: 'views',
    kind: 'people',
    value: (previous) => addListView(previous, previous.views[0]!),
  })
  assert(state.views.companies === companyViews, 'Other route lost company views')
  assert(
    companyViews.views[1]!.columns[0]!.width === 200 && companyViews.views[1]!.filter.conditions.length === 1,
    'View settings lost',
  )
  assert(
    initial.views.companies.views.length === 1 && !initial.views.companies.views[0]!.columns.length,
    'Previous state mutated',
  )
  assert(companyViews.views[0]!.filter.conditions.length === 0, 'Duplicate shares filter state')
  assert(state.collections === initial.collections, 'View edits recreated record collections')
})

Deno.test('example CRUD preserves unrelated records, notes, activities and views', () => {
  const initial = createExampleState(3)
  const record = { ...initial.collections.companies[0]!, id: 'new-record', name: 'New company' }
  let state = exampleReducer(initial, { type: 'create', kind: 'companies', record })
  const activity = { id: 'update-1', title: 'Name updated', time: 'Just now' }
  state = exampleReducer(state, {
    type: 'update',
    kind: 'companies',
    id: record.id,
    change: { name: 'Updated' },
    activity,
  })
  assert(state.collections.companies[0]!.name === 'Updated', 'Update lost')
  assert(state.collections.companies[0]!.activity[0] === activity, 'Activity not added')
  assert(state.collections.companies[0]!.notes === record.notes, 'Unchanged notes replaced')
  assert(state.collections.companies[1] === initial.collections.companies[0], 'Unchanged row recreated')
  state = exampleReducer(state, { type: 'remove', kind: 'companies', id: record.id })
  assert(
    isDeepStrictEqual(state.collections.companies, initial.collections.companies),
    'Remove changed existing records',
  )
  assert(
    state.collections.people === initial.collections.people && state.views === initial.views,
    'Unrelated state changed',
  )
  assert(record.name === 'New company', 'Original record mutated')
})

Deno.test('new App instances and resets start with independent sample records and Default views', () => {
  const initial = createExampleState(2)
  const changed = exampleReducer(initial, {
    type: 'views',
    kind: 'companies',
    value: (previous) => addListView(previous, previous.views[0]!),
  })
  const fresh = createExampleState(2)
  assert(changed.views.companies.views.length === 2, 'View creation failed')
  assert(isDeepStrictEqual(fresh, initial), 'New instance retained old changes')
  assert(fresh.collections.companies !== initial.collections.companies, 'Instances share records')
  assert(fresh.views.companies !== initial.views.companies, 'Instances share views')
  assert(fresh.views.companies.views[0]!.filter !== fresh.views.people.views[0]!.filter, 'Routes share mutable filters')
  assert(createExampleState(0).collections.companies.length === 0, 'Empty dataset not respected')
  assert(createExampleState(100).collections.people.length === 100, 'Dataset reset count not respected')
})
