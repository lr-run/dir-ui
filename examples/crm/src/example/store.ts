import { useReducer } from 'react'
import type { SetStateAction } from 'react'
import type { ExampleKind, ExampleRecord, ListViews, RecordChange, RecordDraft } from '@/components/crm/types.ts'
import { examples, sampleRecords } from '@/components/crm/example/data.ts'

export type ExampleState = {
  collections: Record<ExampleKind, ExampleRecord[]>
  views: Record<ExampleKind, ListViews>
}
export function defaultListViews(): ListViews {
  return {
    activeId: 'all',
    views: [{ id: 'all', name: 'Default', sorts: [], filter: { conjunction: 'and', conditions: [] }, columns: [] }],
  }
}
export function createExampleState(count = 100): ExampleState {
  return {
    collections: {
      companies: sampleRecords('companies', count),
      people: sampleRecords('people', count),
      deals: sampleRecords('deals', count),
    },
    views: { companies: defaultListViews(), people: defaultListViews(), deals: defaultListViews() },
  }
}
type Action =
  | { type: 'create'; kind: ExampleKind; record: ExampleRecord }
  | { type: 'update'; kind: ExampleKind; id: string; change: RecordChange; activity: ExampleRecord['activity'][number] }
  | { type: 'remove'; kind: ExampleKind; id: string }
  | { type: 'views'; kind: ExampleKind; value: SetStateAction<ListViews> }

export function exampleReducer(state: ExampleState, action: Action): ExampleState {
  const { kind } = action
  if (action.type === 'views') {
    const next = typeof action.value === 'function' ? action.value(state.views[kind]) : action.value
    return { ...state, views: { ...state.views, [kind]: next } }
  }
  const records = state.collections[kind]
  const next = action.type === 'create'
    ? [action.record, ...records]
    : action.type === 'remove'
    ? records.filter((record) => record.id !== action.id)
    : records.map((record) =>
      record.id === action.id
        ? { ...record, ...action.change, activity: [action.activity, ...record.activity] }
        : record
    )
  return { ...state, collections: { ...state.collections, [kind]: next } }
}

// One store per mounted App. URL navigation preserves it; reload/reset starts fresh.
// Replace these operations with API calls when connecting a backend.
export function useExampleStore(count = 100) {
  const [state, dispatch] = useReducer(exampleReducer, count, createExampleState)
  return {
    ...state,
    create(kind: ExampleKind, values: RecordDraft) {
      const record: ExampleRecord = {
        domain: '',
        email: '',
        company: '',
        value: 0,
        ...values,
        id: crypto.randomUUID(),
        notes: [],
        activity: [{ id: crypto.randomUUID(), title: `${examples[kind].singular} created`, time: 'Just now' }],
      }
      dispatch({ type: 'create', kind, record })
      return record
    },
    update(kind: ExampleKind, id: string, change: RecordChange, label: string) {
      dispatch({
        type: 'update',
        kind,
        id,
        change,
        activity: { id: crypto.randomUUID(), title: change.notes ? label : `${label} updated`, time: 'Just now' },
      })
    },
    remove(kind: ExampleKind, id: string) {
      dispatch({ type: 'remove', kind, id })
    },
    setViews(kind: ExampleKind, value: SetStateAction<ListViews>) {
      dispatch({ type: 'views', kind, value })
    },
  }
}
