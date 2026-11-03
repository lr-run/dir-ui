// In-memory store for the system examples. Records, notes and history survive client-side navigation and reset on
// reload; replace it with API calls in a real application.
import { useMemo, useState } from 'react'
import type { KitConfig, KitField, KitObject, KitRecord, KitRow } from '@/components/systems/kit/types.ts'

export type KitChange = {
  id: string
  objectId: string
  recordId: string
  actor: string
  at: string
  operation: 'create' | 'update' | 'archive' | 'restore'
  changes: Record<string, { before: string; after: string }>
}
export type KitNote = { id: string; objectId: string; recordId: string; author: string; at: string; body: string }
type State = { records: Record<string, KitRecord[]>; history: KitChange[]; notes: KitNote[] }

const now = () => new Date().toISOString()
export const createId = () => crypto.randomUUID().slice(0, 8)

/** Display text of a raw value: choice, member and reference fields show labels, numbers stay numbers. */
export function displayValue(field: KitField, value: unknown, lookup: (objectId: string, id: string) => string) {
  if (value == null || value === '') return field.type === 'number' || field.type === 'money' ? null : ''
  if (field.type === 'choice') return field.options?.find((option) => option.value === value)?.label ?? String(value)
  if (field.type === 'reference') return lookup(field.reference!, String(value))
  return value
}

export function useKitStore(config: KitConfig, count: number) {
  const [state, setState] = useState<State>(() => ({ records: config.seed(count), history: [], notes: [] }))
  const object = (id: string) => config.objects.find((item) => item.id === id)!
  const memberName = (id: unknown) => config.users.find((user) => user.value === id)?.label ?? ''
  const recordName = (objectId: string, id: string) =>
    state.records[objectId]?.find((record) => record.id === id)?.name ?? ''
  const label = (field: KitField, value: unknown) =>
    field.type === 'member' ? memberName(value) : displayValue(field, value, recordName)
  const toRow = (item: KitObject, record: KitRecord): KitRow => {
    const { values, ...base } = record
    return {
      ...base,
      record,
      ...Object.fromEntries(item.fields.map((field) => [field.key, label(field, values[field.key])])),
    }
  }
  const rows = useMemo(
    () =>
      Object.fromEntries(
        config.objects.map((item) => [item.id, (state.records[item.id] ?? []).map((record) => toRow(item, record))]),
      ) as Record<string, KitRow[]>,
    [state.records],
  )
  const commit = (
    objectId: string,
    recordId: string,
    operation: KitChange['operation'],
    changes: KitChange['changes'],
  ) => ({ id: createId(), objectId, recordId, actor: memberName(config.me), at: now(), operation, changes })
  const describe = (item: KitObject, before: Record<string, unknown>, after: Record<string, unknown>) =>
    Object.fromEntries(
      Object.keys(after).filter((key) => before[key] !== after[key]).map((key) => {
        const field = item.fields.find((f) => f.key === key)
        const show = (value: unknown) => field ? String(label(field, value) ?? '—') || '—' : String(value ?? '—')
        return [field?.label ?? 'Name', { before: show(before[key]), after: show(after[key]) }]
      }),
    )
  return {
    state,
    rows,
    object,
    memberName,
    recordName,
    label,
    find: (objectId: string, id: string) => state.records[objectId]?.find((record) => record.id === id),
    /** Records of another object whose reference field points at this record. */
    related: (objectId: string, id: string) =>
      config.objects.flatMap((item) =>
        item.fields.filter((field) => field.type === 'reference' && field.reference === objectId).map((field) => ({
          object: item,
          field,
          rows: rows[item.id]!.filter((row) => row.record.values[field.key] === id && !row.archivedAt),
        }))
      ).filter((group) => group.rows.length),
    create: (objectId: string, name: string, values: Record<string, unknown>) => {
      const at = now()
      const record: KitRecord = { id: createId(), name, createdAt: at, updatedAt: at, archivedAt: null, values }
      setState((previous) => ({
        ...previous,
        records: { ...previous.records, [objectId]: [record, ...(previous.records[objectId] ?? [])] },
        history: [commit(objectId, record.id, 'create', {}), ...previous.history],
      }))
      return record
    },
    update: (objectId: string, id: string, change: { name?: string; values?: Record<string, unknown> }) => {
      setState((previous) => {
        const current = previous.records[objectId]?.find((record) => record.id === id)
        if (!current || current.archivedAt) return previous
        const values = { ...current.values, ...change.values }
        const next = { ...current, name: change.name ?? current.name, values, updatedAt: now() }
        const changes = {
          ...change.name !== undefined && change.name !== current.name
            ? { Name: { before: current.name, after: change.name } }
            : {},
          ...describe(object(objectId), current.values, change.values ?? {}),
        }
        if (!Object.keys(changes).length) return previous
        return {
          ...previous,
          records: {
            ...previous.records,
            [objectId]: previous.records[objectId]!.map((record) => record.id === id ? next : record),
          },
          history: [commit(objectId, id, 'update', changes), ...previous.history],
        }
      })
    },
    setArchived: (objectId: string, id: string, archived: boolean) =>
      setState((previous) => ({
        ...previous,
        records: {
          ...previous.records,
          [objectId]: previous.records[objectId]!.map((record) =>
            record.id === id ? { ...record, archivedAt: archived ? now() : null, updatedAt: now() } : record
          ),
        },
        history: [commit(objectId, id, archived ? 'archive' : 'restore', {}), ...previous.history],
      })),
    addNote: (objectId: string, recordId: string, body: string) =>
      setState((previous) => ({
        ...previous,
        notes: [
          { id: createId(), objectId, recordId, author: memberName(config.me), at: now(), body },
          ...previous.notes,
        ],
      })),
  }
}
export type KitStore = ReturnType<typeof useKitStore>
