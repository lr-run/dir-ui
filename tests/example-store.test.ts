import assert from 'node:assert/strict'
import {
  archiveActivity,
  archiveRecord,
  createExampleState,
  saveActivity,
  saveRecord,
  saveStage,
  saveUser,
} from '../examples/crm/src/example/store.ts'
const stamp = '2026-10-01T10:00:00Z'
Deno.test('CRM updates are atomic, skip unchanged values and preserve unrelated records', () => {
  const initial = createExampleState(3), first = initial.records[0]!
  assert.equal(saveRecord(initial, 'companies', { name: first.name }, first.id).state, initial)
  const { state } = saveRecord(initial, 'companies', { name: 'Changed' }, first.id, stamp)
  assert.equal(initial.records[0]!.name, first.name)
  assert.equal(state.records[1], initial.records[1])
  assert.equal(state.records[0]!.version, 2)
  assert.deepEqual(state.history[0]!.changes.name, {
    before: first.name,
    after: 'Changed',
    beforeLabel: undefined,
    afterLabel: undefined,
  })
  assert.equal(state.activities, initial.activities)
  assert.throws(() => saveRecord(initial, 'people', { name: 'Invalid', companyId: 'missing' }), /active company/)
  assert.equal(initial.history.length, 0)
})
Deno.test('deal dates follow stage category and null amounts remain distinct from zero', () => {
  let state = createExampleState(2)
  let result = saveRecord(state, 'deals', { stageId: 'stage-4', amount: null }, 'deals-1', stamp)
  state = result.state
  assert.equal(result.record.kind === 'deals' && result.record.closedAt, stamp)
  result = saveRecord(state, 'deals', { amount: '0.00' }, 'deals-1', '2026-10-02T10:00:00Z')
  state = result.state
  assert.equal(result.record.kind === 'deals' && result.record.closedAt, stamp)
  result = saveRecord(state, 'deals', { stageId: 'stage-2' }, 'deals-1')
  assert.equal(result.record.kind === 'deals' && result.record.closedAt, null)
  for (const amount of ['-1', 'NaN', '1.001']) {
    assert.throws(() => saveRecord(state, 'deals', { amount }, 'deals-1'), /nonnegative/)
  }
  assert.throws(() => saveRecord(state, 'deals', { currency: 'XYZ' }, 'deals-1'), /currency/)
  assert.throws(() => saveRecord(state, 'deals', { companyId: 'companies-2' }, 'deals-1'), /linked/)
  assert.equal(state.history[0]!.changes.amount?.after, '0.00')
})
Deno.test('task completion records history without creating activities and preserves completion time', () => {
  let state = createExampleState(2)
  state = saveRecord(state, 'tasks', { status: 'done' }, 'tasks-1', stamp).state
  const done = state.records.find((r) => r.id === 'tasks-1')!
  assert.equal(done.kind === 'tasks' && done.completedAt, stamp)
  state = saveRecord(state, 'tasks', { name: 'Result recorded separately' }, 'tasks-1', '2026-10-02T00:00:00Z').state
  assert.equal(state.activities.length, 0)
  assert.equal((state.records.find((r) => r.id === 'tasks-1') as typeof done).kind, 'tasks')
  const task = state.records.find((r) => r.id === 'tasks-1')!
  assert.equal(task.kind === 'tasks' && task.completedAt, stamp)
  state = saveRecord(state, 'tasks', { status: 'todo' }, 'tasks-1').state
  const reopened = state.records.find((r) => r.id === 'tasks-1')!
  assert.equal(reopened.kind === 'tasks' && reopened.completedAt, null)
  assert.throws(() => saveRecord(state, 'tasks', { companyId: 'companies-2' }, 'tasks-1'), /belong/)
})
Deno.test('historical activity links survive employment changes while changed links are revalidated', () => {
  let state = createExampleState(2)
  const draft = {
    name: 'Call',
    type: 'call' as const,
    body: 'Discussed proposal',
    occurredAt: stamp,
    companyId: 'companies-1',
    dealId: 'deals-1',
    personId: 'people-1',
  }
  state = saveActivity(state, draft)
  const activity = state.activities[0]!
  state = saveRecord(state, 'people', { companyId: 'companies-2' }, 'people-1').state
  state = saveActivity(state, { ...draft, body: 'Updated content' }, activity.id)
  assert.equal(state.activities[0]!.companyId, 'companies-1')
  assert.throws(() => saveActivity(state, { ...draft, dealId: '' }, activity.id), /belong/)
  assert.throws(() => saveActivity(state, { ...draft, personId: 'people-2' }), /belong/)
  assert.throws(() => saveRecord(state, 'tasks', { personId: 'people-2' }, 'tasks-1'), /belong/)
})
Deno.test('archive preserves links and enforces active children and restore requirements', () => {
  let state = createExampleState(1)
  state = saveActivity(state, {
    name: 'Note',
    type: 'note',
    body: 'Context',
    occurredAt: stamp,
    companyId: 'companies-1',
    dealId: 'deals-1',
    personId: 'people-1',
  })
  const activity = state.activities[0]!
  assert.throws(() => archiveRecord(state, 'companies-1'), /related records/)
  for (const id of ['people-1', 'deals-1', 'tasks-1']) state = archiveRecord(state, id)
  assert.throws(() => archiveRecord(state, 'companies-1'), /activities/)
  state = archiveActivity(state, activity.id)
  state = archiveRecord(state, 'companies-1')
  assert.equal(state.records.length, 4)
  assert.equal(state.activities[0]!.dealId, 'deals-1')
  assert.equal(archiveRecord(state, 'companies-1'), state)
  assert.throws(() => saveRecord(state, 'people', { name: 'Edit' }, 'people-1'), /Restore/)
  assert.throws(() => archiveRecord(state, 'people-1', true), /active company/)
  assert.throws(() => archiveActivity(state, activity.id, true), /active company/)
  state = archiveRecord(state, 'companies-1', true)
  state = archiveRecord(state, 'people-1', true)
  assert.ok(state.records.find((r) => r.id === 'deals-1')!.archivedAt)
})
Deno.test('inactive users retain existing assignments and stage use includes archived deals', () => {
  let state = createExampleState(2)
  state = saveUser(state, { ...state.users[0]!, email: ' MEMBER1@EXAMPLE.COM ', isActive: false })
  assert.equal(state.users[0]!.email, 'member1@example.com')
  state = saveRecord(state, 'companies', { name: 'Still assigned' }, 'companies-1').state
  assert.throws(() => saveRecord(state, 'companies', { ownerId: state.users[0]!.id }, 'companies-2'), /active user/)
  assert.throws(() => saveUser(state, { ...state.users[1]!, email: state.users[0]!.email }), /already/)
  state = archiveRecord(state, 'deals-1')
  assert.throws(() => saveStage(state, state.stages[0]!, true), /Used stages/)
  assert.throws(() => saveStage(state, { ...state.stages[0]!, status: 'won' }), /Used stages/)
  state = saveStage(state, { ...state.stages[0]!, name: 'Renamed' })
  const unused = { id: 'new-stage', name: 'New', status: 'open' as const, sortOrder: 9 }
  state = saveStage(state, unused)
  state = saveStage(state, unused, true)
  assert.equal(state.history[0]!.operation, 'delete')
})
Deno.test('independent examples start with separate records, settings, activities and views', () => {
  const a = createExampleState(2), b = createExampleState(2)
  assert.deepEqual(a, b)
  assert.notEqual(a.records, b.records)
  assert.notEqual(a.stages, b.stages)
  assert.notEqual(a.views.tasks.views[0]!.filter, a.views.companies.views[0]!.filter)
  assert.equal(createExampleState(0).records.length, 0)
})

Deno.test('activities allow empty subjects without changing their content or links', () => {
  const initial = createExampleState(2)
  const draft = {
    name: '',
    type: 'note' as const,
    body: 'Agreed next steps.',
    occurredAt: stamp,
    companyId: 'companies-1',
    dealId: 'deals-1',
    personId: 'people-1',
  }
  const state = saveActivity(initial, draft)
  const activity = state.activities[0]!
  assert.equal(activity.name, '')
  assert.equal(activity.body, draft.body)
  assert.equal(activity.dealId, 'deals-1')
  const updated = saveActivity(state, { ...draft, name: '   ', body: 'Updated note' }, activity.id)
  assert.equal(updated.activities[0]!.name, '')
  assert.equal(updated.activities[0]!.body, 'Updated note')
})
