import assert from 'node:assert/strict'
import { relatedRecordGroups } from '../examples/crm/src/components/record-detail.tsx'
import { createExampleState } from '../examples/crm/src/example/store.ts'
import { queryExampleRecords } from '../examples/crm/src/example/query.ts'
import { queryFields, sampleRecords } from '../examples/crm/src/example/data.ts'
import { companiesFormSchema } from '../examples/crm/src/routes/companies-list.tsx'
import { peopleFormSchema } from '../examples/crm/src/routes/people-list.tsx'
import { dealsFormSchema } from '../examples/crm/src/routes/deals-list.tsx'
import { tasksFormSchema } from '../examples/crm/src/routes/tasks-list.tsx'
Deno.test('typed CRM fixtures have stable IDs and only their own editable data', () => {
  for (const kind of ['companies', 'people', 'deals', 'tasks'] as const) {
    for (const count of [0, 5, 100, 1000]) {
      const rows = sampleRecords(kind, count)
      assert.equal(rows.length, count)
      assert.equal(new Set(rows.map((r) => r.id)).size, count)
      for (const row of rows) {
        assert.equal(row.data.kind, kind)
        assert.ok(row.name)
        if (kind === 'companies') assert.ok(!('email' in row.data))
      }
    }
  }
})
Deno.test('each record form validates its own required fields and decimal amounts', () => {
  assert.equal(
    companiesFormSchema.parse({ name: ' Company ', ownerId: 'user-1', industry: '', website: '' }).name,
    'Company',
  )
  const person = { name: 'Person', companyId: 'companies-1', department: '', title: '', email: '', phone: '' }
  assert.ok(peopleFormSchema.safeParse(person).success)
  for (const change of [{ name: ' ' }, { companyId: '' }, { email: 'invalid' }]) {
    assert.ok(!peopleFormSchema.safeParse({ ...person, ...change }).success)
  }
  const deal = {
    name: 'Deal',
    companyId: 'companies-1',
    ownerId: 'user-1',
    stageId: 'stage-1',
    amount: '',
    currency: 'USD',
    expectedCloseDate: '',
    nextAction: '',
  }
  assert.ok(dealsFormSchema.safeParse(deal).success)
  assert.ok(dealsFormSchema.safeParse({ ...deal, amount: '0' }).success)
  for (const amount of ['-1', 'NaN', '2.001']) assert.ok(!dealsFormSchema.safeParse({ ...deal, amount }).success)
  assert.ok(!tasksFormSchema.safeParse({ name: 'Task' }).success)
})
Deno.test('record list composes monetary and date filters and keeps unknown amounts last', () => {
  const rows = sampleRecords('deals', 10), fields = queryFields('deals')
  const filtered = queryExampleRecords(rows, fields, {
    filter: {
      conjunction: 'and',
      conditions: [{ id: 'a', field: 'amount', operator: 'gte', value: 24000 }, {
        id: 'd',
        field: 'closeDate',
        operator: 'between',
        value: ['2026-10-01', '2026-12-31'],
      }],
    },
  })
  assert.ok(filtered.length > 0)
  assert.ok(filtered.every((r) => r.amount !== null && r.amount >= 24000))
  const sorted = queryExampleRecords(rows, fields, { sorts: [{ field: 'amount', direction: 'desc' }] })
  assert.equal(sorted.at(-1)!.amount, null)
  assert.equal(
    queryExampleRecords(sampleRecords('companies', 10), queryFields('companies'), { search: 'software' }).length,
    2,
  )
})

Deno.test('related records follow explicit links and keep archived parents readable', () => {
  const state = createExampleState(2)
  const company = state.records.find((r) => r.id === 'companies-1')!
  const person = state.records.find((r) => r.id === 'people-1')!
  const task = state.records.find((r) => r.id === 'tasks-1')!
  assert.deepEqual(relatedRecordGroups(company, state.records).flatMap((g) => g.records.map((r) => r.id)), [
    'people-1',
    'deals-1',
    'tasks-1',
  ])
  assert.deepEqual(relatedRecordGroups(person, state.records).flatMap((g) => g.records.map((r) => r.id)), [
    'companies-1',
    'tasks-1',
  ])
  assert.deepEqual(relatedRecordGroups(task, state.records).flatMap((g) => g.records.map((r) => r.id)), [
    'companies-1',
    'deals-1',
    'people-1',
  ])
  const archived = state.records.map((r) =>
    ['companies-1', 'tasks-1'].includes(r.id) ? { ...r, archivedAt: '2026-09-30T00:00:00Z' } : r
  )
  assert.deepEqual(relatedRecordGroups(person, archived).flatMap((g) => g.records.map((r) => r.id)), ['companies-1'])
})
