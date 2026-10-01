import { taskStatusValues } from '../examples/crm/src/types.ts'
import assert from 'node:assert/strict'
import { createExampleState, saveRecord } from '../examples/crm/src/example/store.ts'
import { createRecordChoiceLoader } from '../examples/crm/src/example/query.ts'
import { recordEditField, recordFieldChange } from '../examples/crm/src/components/record-editing.ts'

Deno.test('CRM cell edits map display fields, preserve zero and reject invalid edits atomically', () => {
  const state = createExampleState(3)
  assert.equal(recordEditField('companies', 'domain'), 'website')
  assert.equal(recordEditField('tasks', 'owner'), 'assigneeId')
  assert.equal(recordEditField('tasks', 'completedAt'), undefined)
  assert.equal(recordEditField('deals', 'updatedAt'), undefined)
  const zero = saveRecord(state, 'deals', { amount: '0' }, 'deals-1')
  assert.equal(zero.record.kind === 'deals' && zero.record.amount, '0')
  const cleared = saveRecord(zero.state, 'deals', { amount: null }, 'deals-1')
  assert.equal(cleared.record.kind === 'deals' && cleared.record.amount, null)
  for (const draft of [{ name: '' }, { amount: '-1' }, { amount: '1.234' }]) {
    assert.throws(() => saveRecord(state, 'deals', draft, 'deals-1'))
  }
  assert.equal(state.history.length, 0)
})

Deno.test('Task company changes clear scoped references and preserve other data', () => {
  const state = createExampleState(3), task = state.records.find((r) => r.kind === 'tasks')!
  assert.equal(task.kind, 'tasks')
  if (task.kind !== 'tasks') throw new Error('Missing task fixture')
  assert.deepEqual(recordFieldChange(task, 'companyId', task.companyId), { companyId: task.companyId })
  const other = state.records.find((r) => r.kind === 'companies' && r.id !== task.companyId)!
  const result = saveRecord(state, 'tasks', recordFieldChange(task, 'companyId', other.id), task.id)
  assert.equal(result.record.kind, 'tasks')
  if (result.record.kind !== 'tasks') throw new Error('Incorrect record type')
  assert.equal(result.record.companyId, other.id)
  assert.equal(result.record.dealId, '')
  assert.equal(result.record.personId, '')
  assert.equal(result.record.assigneeId, task.assigneeId)
  assert.equal(result.record.dueAt, task.dueAt)
})

Deno.test('Example relation loader paginates beyond 100, searches, excludes disabled and honors cancellation', async () => {
  const items = Array.from(
    { length: 125 },
    (_, index) => ({ value: String(index), label: `Record ${String(index + 1).padStart(3, '0')}` }),
  )
  const load = createRecordChoiceLoader([...items, { value: 'archived', label: 'Archived', disabled: true }])
  const signal = new AbortController().signal
  const first = await load('', { signal })
  const second = await load('', { signal, cursor: first.cursor })
  const third = await load('', { signal, cursor: second.cursor })
  assert.deepEqual([first.items.length, second.items.length, third.items.length], [50, 50, 25])
  assert.equal(third.items.at(-1)?.label, 'Record 125')
  assert.equal(third.cursor, undefined)
  assert.deepEqual((await load('125', { signal })).items, [items[124]])
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(() => load('', { signal: controller.signal }), { name: 'AbortError' })
})

Deno.test('related task filters treat Done and Cancelled as completed while preserving exact statuses', () => {
  assert.deepEqual(taskStatusValues('all'), ['todo', 'in_progress', 'done', 'cancelled'])
  assert.deepEqual(taskStatusValues('completed'), ['done', 'cancelled'])
  assert.deepEqual(taskStatusValues('not_completed'), ['todo', 'in_progress'])
  for (const status of ['todo', 'in_progress', 'done', 'cancelled'] as const) {
    assert.deepEqual(taskStatusValues(status), [status])
  }
})
