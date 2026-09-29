import { addListView, removeListView } from '../examples/crm/screens/list-page.tsx'
import { defaultListViews } from '../examples/crm/example/store.ts'
function assert(value: unknown, message: string) {
  if (!value) throw new Error(message)
}
Deno.test('deleting views selects an adjacent view and preserves the final view', () => {
  let state = defaultListViews()
  state = addListView(state, state.views[0]!, 'Second')
  const second = state.activeId
  state = addListView(state, state.views[0]!, 'Third')
  state = removeListView(state, second)
  assert(state.views.some((view) => view.id === state.activeId), 'Inactive removal lost selection')
  state = removeListView(state, state.activeId)
  assert(state.activeId === 'all', 'Active deletion did not select adjacent view')
  assert(removeListView(state, 'all').views.length === 1, 'Deleted final view')
})
Deno.test('unnamed views and duplicates get unique default names without a form', () => {
  let state = defaultListViews()
  state = addListView(state, state.views[0]!)
  state = addListView(state, state.views[0]!, '  ')
  assert(state.views.map((view) => view.name).join(',') === 'Default,View 1,View 2', 'Default names collide')
  state = addListView(state, state.views[1]!, 'View 2 copy')
  state = addListView(state, state.views[1]!, 'View 2 copy')
  assert(state.views.at(-1)!.name === 'View 2 copy 2', 'Duplicate names collide')
  const source = state.views[0]!
  const selected = state.activeId
  state = removeListView(state, source.id)
  assert(
    state.activeId === selected && !state.views.some((view) => view.id === source.id),
    'Inactive view deletion changed selection',
  )
})
