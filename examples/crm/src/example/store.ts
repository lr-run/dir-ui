import { useMemo, useRef, useState } from 'react'
import type { SetStateAction } from 'react'
import type {
  Activity,
  ChangeEntry,
  CrmRecord,
  ExampleKind,
  ListViews,
  RecordDraft,
  Stage,
  User,
} from '@/components/crm/types.ts'
import { examples, projectRecord, sampleEntities, stages, taskStatuses, users } from '@/components/crm/example/data.ts'
export type ExampleState = {
  records: CrmRecord[]
  activities: Activity[]
  users: User[]
  stages: Stage[]
  history: ChangeEntry[]
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
    records: (Object.keys(examples) as ExampleKind[]).flatMap((k) => sampleEntities(k, count)),
    activities: [],
    users: structuredClone(users),
    stages: structuredClone(stages),
    history: [],
    views: {
      companies: defaultListViews(),
      people: defaultListViews(),
      deals: defaultListViews(),
      tasks: defaultListViews(),
    },
  }
}
const fields: Record<ExampleKind, string[]> = {
  companies: ['name', 'ownerId', 'industry', 'website'],
  people: ['name', 'companyId', 'department', 'title', 'email', 'phone'],
  deals: ['name', 'companyId', 'ownerId', 'stageId', 'amount', 'currency', 'expectedCloseDate', 'nextAction'],
  tasks: ['name', 'companyId', 'dealId', 'personId', 'assigneeId', 'dueAt', 'status'],
}
const required = (value: unknown, label: string) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`)
}
const active = (state: ExampleState, id: string, kind: ExampleKind) => {
  const r = state.records.find((r) => r.id === id && r.kind === kind)
  if (!r || r.archivedAt) throw new Error(`Choose an active ${examples[kind].singular.toLowerCase()}.`)
  return r
}
function member(state: ExampleState, id: string) {
  if (!state.users.some((u) => u.id === id && u.isActive)) throw new Error('Choose an active user.')
}
function date(value: string, label: string) {
  if (value && Number.isNaN(Date.parse(value))) throw new Error(`${label} is invalid.`)
}
export function validateLinks(
  state: ExampleState,
  next: { companyId: string; dealId?: string; personId?: string },
  previous?: { companyId: string; dealId?: string; personId?: string },
) {
  if (previous && ['companyId', 'dealId', 'personId'].every((k) => Reflect.get(next, k) === Reflect.get(previous, k))) {
    return
  }
  active(state, next.companyId, 'companies')
  for (const [id, kind] of [[next.dealId, 'deals'], [next.personId, 'people']] as const) {
    if (!id) continue
    const r = active(state, id, kind)
    if (!('companyId' in r) || r.companyId !== next.companyId) {
      throw new Error(`${examples[kind].singular} must belong to the selected company.`)
    }
  }
}
function validate(state: ExampleState, next: CrmRecord, previous?: CrmRecord) {
  required(next.name, 'Name')
  if ('companyId' in next && (!previous || !('companyId' in previous) || next.companyId !== previous.companyId)) {
    active(state, next.companyId, 'companies')
  }
  if ('ownerId' in next && (!previous || !('ownerId' in previous) || next.ownerId !== previous.ownerId)) {
    member(state, next.ownerId)
  }
  if (next.kind === 'companies' && next.website && !/^https?:\/\/[^\s]+$/i.test(next.website)) {
    throw new Error('Enter an http or https website URL.')
  }
  if (next.kind === 'people' && next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
    throw new Error('Enter a valid email address.')
  }
  if (next.kind === 'deals') {
    if (!state.stages.some((s) => s.id === next.stageId)) throw new Error('Choose an existing stage.')
    if (next.amount !== null && !/^\d+(\.\d{1,2})?$/.test(next.amount)) {
      throw new Error('Amount must be a nonnegative decimal with up to two decimal places.')
    }
    if (!Intl.supportedValuesOf('currency').includes(next.currency)) throw new Error('Choose a valid currency code.')
    date(next.expectedCloseDate, 'Expected close date')
    if (
      previous?.kind === 'deals' && previous.companyId !== next.companyId &&
      (state.activities.some((a) => a.dealId === next.id) ||
        state.records.some((r) => r.kind === 'tasks' && r.dealId === next.id))
    ) throw new Error('Remove linked activities and tasks before changing the company, including archived records.')
  }
  if (next.kind === 'tasks') {
    validateLinks(state, next, previous?.kind === 'tasks' ? previous : undefined)
    if (!previous || previous.kind !== 'tasks' || previous.assigneeId !== next.assigneeId) {
      member(state, next.assigneeId)
    }
    if (!taskStatuses.some((s) => s.value === next.status)) throw new Error('Choose a valid task status.')
    date(next.dueAt, 'Due date')
  }
}
function referenceLabel(state: ExampleState, key: string, value: unknown) {
  if (typeof value !== 'string' || !key.endsWith('Id') && !['createdBy'].includes(key)) return undefined
  return state.records.find((r) => r.id === value)?.name ?? state.users.find((u) => u.id === value)?.name ??
    state.stages.find((s) => s.id === value)?.name
}
function changed(
  state: ExampleState,
  entity: string,
  id: string,
  before: object | null,
  after: object | null,
  operation: ChangeEntry['operation'],
  now: string,
): ChangeEntry | null {
  const changes: ChangeEntry['changes'] = {}
  for (const key of new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])) {
    if (['id', 'kind', 'version', 'createdAt', 'updatedAt'].includes(key)) continue
    const a = before ? Reflect.get(before, key) ?? null : null, b = after ? Reflect.get(after, key) ?? null : null
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changes[key] = {
        before: a,
        after: b,
        beforeLabel: referenceLabel(state, key, a),
        afterLabel: referenceLabel(state, key, b),
      }
    }
  }
  return Object.keys(changes).length
    ? {
      id: crypto.randomUUID(),
      entity,
      recordId: id,
      actor: state.users[0]?.name ?? 'System',
      actorId: state.users[0]?.id ?? null,
      createdAt: now,
      operation,
      changes,
    }
    : null
}
function history(state: ExampleState, entry: ChangeEntry | null) {
  return entry ? [entry, ...state.history] : state.history
}
export function saveRecord(
  state: ExampleState,
  kind: ExampleKind,
  draft: Partial<RecordDraft>,
  id?: string,
  now = new Date().toISOString(),
): { state: ExampleState; record: CrmRecord } {
  const previous = id ? state.records.find((r) => r.id === id && r.kind === kind) : undefined
  if (id && !previous) throw new Error('Record not found.')
  if (previous?.archivedAt) throw new Error('Restore this record before editing.')
  for (const key of Object.keys(draft)) if (!fields[kind].includes(key)) throw new Error(`Cannot edit ${key}.`)
  const values = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
  const defaults = {
    companies: { ownerId: '', industry: '', website: '' },
    people: { companyId: '', department: '', title: '', email: '', phone: '' },
    deals: {
      companyId: '',
      ownerId: '',
      stageId: '',
      amount: null,
      currency: 'USD',
      expectedCloseDate: '',
      closedAt: null,
      nextAction: '',
    },
    tasks: { companyId: '', dealId: '', personId: '', assigneeId: '', dueAt: '', status: 'todo', completedAt: null },
  }
  let record = {
    id: crypto.randomUUID(),
    name: '',
    createdAt: now,
    updatedAt: now,
    version: 1,
    archivedAt: null,
    kind,
    ...defaults[kind],
    ...previous,
    ...values,
  } as CrmRecord
  if (record.kind === 'deals') {
    record = { ...record, currency: record.currency.toUpperCase() }
    const stageId = record.stageId
    const category = state.stages.find((s) => s.id === stageId)?.status
    const prior = previous?.kind === 'deals' ? state.stages.find((s) => s.id === previous.stageId)?.status : undefined
    if (category !== prior) record.closedAt = category === 'open' ? null : now
  }
  if (record.kind === 'tasks' && (!previous || previous.kind !== 'tasks' || previous.status !== record.status)) {
    record.completedAt = record.status === 'done' ? now : null
  }
  validate(state, record, previous)
  const entry = changed(state, kind, record.id, previous ?? null, record, previous ? 'update' : 'create', now)
  if (!entry) return { state, record: previous! }
  record = { ...record, updatedAt: now, version: (previous?.version ?? 0) + 1 }
  return {
    record,
    state: {
      ...state,
      records: previous ? state.records.map((r) => r.id === record.id ? record : r) : [record, ...state.records],
      history: history(state, entry),
    },
  }
}
export function archiveRecord(
  state: ExampleState,
  id: string,
  restore = false,
  now = new Date().toISOString(),
): ExampleState {
  const before = state.records.find((r) => r.id === id)
  if (!before) throw new Error('Record not found.')
  if (Boolean(before.archivedAt) !== restore) return state
  if (restore && 'companyId' in before) active(state, before.companyId, 'companies')
  if (!restore && before.kind === 'companies') {
    const records = state.records.filter((r) => 'companyId' in r && r.companyId === id && !r.archivedAt)
    const activities = state.activities.filter((a) => a.companyId === id && !a.archivedAt)
    if (records.length || activities.length) {
      throw new Error(`Archive the ${records.length} related records and ${activities.length} activities first.`)
    }
  }
  const after = { ...before, archivedAt: restore ? null : now, updatedAt: now, version: before.version + 1 }
  return {
    ...state,
    records: state.records.map((r) => r.id === id ? after : r),
    history: history(state, changed(state, before.kind, id, before, after, restore ? 'restore' : 'archive', now)),
  }
}
export type ActivityDraft = Pick<
  Activity,
  'name' | 'type' | 'body' | 'occurredAt' | 'companyId' | 'dealId' | 'personId'
>
export function saveActivity(
  state: ExampleState,
  draft: ActivityDraft,
  id?: string,
  now = new Date().toISOString(),
): ExampleState {
  const previous = id ? state.activities.find((a) => a.id === id) : undefined
  if (id && !previous) throw new Error('Activity not found.')
  if (previous?.archivedAt) throw new Error('Restore this activity before editing.')
  required(draft.name, 'Subject')
  required(draft.occurredAt, 'Occurrence time')
  date(draft.occurredAt, 'Occurrence time')
  if (!['call', 'email', 'meeting', 'note'].includes(draft.type)) throw new Error('Choose a valid activity type.')
  validateLinks(state, draft, previous)
  const activity: Activity = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    version: 1,
    archivedAt: null,
    createdBy: state.users[0]!.id,
    ...previous,
    ...draft,
    name: draft.name.trim(),
  }
  const entry = changed(
    state,
    'activities',
    activity.id,
    previous ?? null,
    activity,
    previous ? 'update' : 'create',
    now,
  )
  if (!entry) return state
  activity.version = (previous?.version ?? 0) + 1
  activity.updatedAt = now
  return {
    ...state,
    activities: previous ? state.activities.map((a) => a.id === id ? activity : a) : [activity, ...state.activities],
    history: history(state, entry),
  }
}
export function archiveActivity(
  state: ExampleState,
  id: string,
  restore = false,
  now = new Date().toISOString(),
): ExampleState {
  const before = state.activities.find((a) => a.id === id)
  if (!before) throw new Error('Activity not found.')
  if (Boolean(before.archivedAt) !== restore) return state
  if (restore) active(state, before.companyId, 'companies')
  const after = { ...before, archivedAt: restore ? null : now, updatedAt: now, version: before.version + 1 }
  return {
    ...state,
    activities: state.activities.map((a) => a.id === id ? after : a),
    history: history(state, changed(state, 'activities', id, before, after, restore ? 'restore' : 'archive', now)),
  }
}
export function saveUser(state: ExampleState, user: User): ExampleState {
  required(user.name, 'Name')
  const next = { ...user, name: user.name.trim(), email: user.email.trim().toLowerCase() }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) throw new Error('Enter a valid email address.')
  if (state.users.some((u) => u.id !== next.id && u.email === next.email)) throw new Error('Email is already in use.')
  const previous = state.users.find((u) => u.id === next.id)
  if (!previous) throw new Error('User not found.')
  return {
    ...state,
    users: state.users.map((u) => u.id === next.id ? next : u),
    history: history(state, changed(state, 'users', next.id, previous, next, 'update', new Date().toISOString())),
  }
}
export function saveStage(state: ExampleState, stage: Stage, remove = false): ExampleState {
  required(stage.name, 'Stage name')
  if (!['open', 'won', 'lost'].includes(stage.status)) throw new Error('Invalid stage category.')
  const before = state.stages.find((s) => s.id === stage.id)
  const used = state.records.some((r) => r.kind === 'deals' && r.stageId === stage.id)
  if (used && (remove || before?.status !== stage.status)) {
    throw new Error('Used stages cannot be deleted or change category, including archived deals.')
  }
  const next = { ...stage, name: stage.name.trim() }
  const now = new Date().toISOString()
  return {
    ...state,
    stages: remove
      ? state.stages.filter((s) => s.id !== stage.id)
      : before
      ? state.stages.map((s) => s.id === stage.id ? next : s)
      : [...state.stages, next],
    history: history(
      state,
      changed(
        state,
        'stages',
        stage.id,
        before ?? null,
        remove ? null : next,
        remove ? 'delete' : before ? 'update' : 'create',
        now,
      ),
    ),
  }
}
export function useExampleStore(count = 100) {
  const [state, setState] = useState(() => createExampleState(count))
  const current = useRef(state)
  const commit = (next: ExampleState) => {
    current.current = next
    setState(next)
  }
  const collections = useMemo(
    () => {
      const labels = new Map(state.records.map((r) => [r.id, r.name]))
      return Object.fromEntries((Object.keys(examples) as ExampleKind[]).map((kind) => [
        kind,
        state.records.filter((r) => r.kind === kind).map((r) =>
          projectRecord(r, state.records, state.users, state.stages, labels)
        ),
      ])) as Record<ExampleKind, ReturnType<typeof projectRecord>[]>
    },
    [state.records, state.users, state.stages],
  )
  return {
    state,
    collections,
    views: state.views,
    create(kind: ExampleKind, draft: RecordDraft) {
      const result = saveRecord(current.current, kind, draft)
      commit(result.state)
      return result.record
    },
    update(kind: ExampleKind, id: string, draft: Partial<RecordDraft>) {
      commit(saveRecord(current.current, kind, draft, id).state)
    },
    archive(id: string, restore = false) {
      commit(archiveRecord(current.current, id, restore))
    },
    saveActivity(draft: ActivityDraft, id?: string) {
      commit(saveActivity(current.current, draft, id))
    },
    archiveActivity(id: string, restore = false) {
      commit(archiveActivity(current.current, id, restore))
    },
    saveUser(user: User) {
      commit(saveUser(current.current, user))
    },
    saveStage(stage: Stage, remove = false) {
      commit(saveStage(current.current, stage, remove))
    },
    setViews(kind: ExampleKind, value: SetStateAction<ListViews>) {
      const prev = current.current
      commit({
        ...prev,
        views: { ...prev.views, [kind]: typeof value === 'function' ? value(prev.views[kind]) : value },
      })
    },
  }
}
