import { queryExampleRecords } from '../examples/crm/src/example/query.ts'
import { queryFields, sampleRecords } from '../examples/crm/src/example/data.ts'
import { companiesFormSchema } from '../examples/crm/src/routes/companies-list.tsx'
import { peopleFormSchema } from '../examples/crm/src/routes/people-list.tsx'
import { dealsFormSchema } from '../examples/crm/src/routes/deals-list.tsx'

Deno.test('screen fixture counts have stable distinct identities for every dataset', () => {
  for (const kind of ['companies', 'people', 'deals'] as const) {
    for (const count of [0, 5, 25, 100, 1000]) {
      const rows = sampleRecords(kind, count)
      if (rows.length !== count || new Set(rows.map((row) => row.id)).size !== count) {
        throw new Error('Invalid row identities')
      }
      if (rows.some((row) => !row.name || !row.status || !row.owner || !Number.isFinite(row.value))) {
        throw new Error('Missing fixture fields')
      }
    }
  }
})
Deno.test('each route validates only its own creation fields', () => {
  const company = companiesFormSchema.parse({ name: ' New company ', domain: '', status: 'Prospect', owner: 'Alex' })
  if (company.name !== 'New company' || 'email' in company || 'value' in company) {
    throw new Error('Company form requires unrelated fields')
  }
  const person = { name: ' New contact ', company: '', email: '', status: 'New', owner: 'Alex' }
  if (peopleFormSchema.parse(person).name !== 'New contact') throw new Error('Name was not trimmed')
  for (const change of [{ name: '  ' }, { name: 'a'.repeat(121) }, { email: 'invalid' }, { status: 'Won' }]) {
    if (peopleFormSchema.safeParse({ ...person, ...change }).success) throw new Error('Accepted invalid person input')
  }
  const deal = { name: 'New deal', company: '', status: 'Qualified', owner: 'Alex', value: 0 }
  if (dealsFormSchema.parse(deal).value !== 0) throw new Error('Zero value rejected')
  for (const value of [-1, NaN]) {
    if (dealsFormSchema.safeParse({ ...deal, value }).success) throw new Error('Accepted invalid deal value')
  }
})

Deno.test('expanded examples combine number, date, tag and boolean filters', () => {
  const rows = sampleRecords('deals', 5)
  const result = queryExampleRecords(rows, queryFields('deals'), {
    filter: {
      conjunction: 'and',
      conditions: [
        { id: 'value', field: 'value', operator: 'gte', value: 24000 },
        { id: 'date', field: 'closeDate', operator: 'between', value: ['2026-10-01', '2026-12-31'] },
        { id: 'tags', field: 'tags', operator: 'all', value: ['Enterprise', 'Strategic'] },
        { id: 'recurring', field: 'recurring', operator: 'eq', value: true },
      ],
    },
  })
  if (result.map((row) => row.id).join(',') !== 'deals-1,deals-5') throw new Error('Typed filters do not compose')
  const sorted = queryExampleRecords(rows, queryFields('deals'), { sorts: [{ field: 'value', direction: 'desc' }] })
  if (sorted[0]?.value !== 48000 || rows[0]?.value !== 24000) throw new Error('Invalid numeric sort or mutated fixture')
})
Deno.test('expanded examples search visible fields and handle missing optional values', () => {
  const rows = sampleRecords('companies', 10)
  if (queryExampleRecords(rows, queryFields('companies'), { search: 'software' }).length !== 2) {
    throw new Error('New column not searchable')
  }
  const missing = { ...rows[0]!, id: 'new', employees: undefined }
  const sorted = queryExampleRecords([missing, ...rows], queryFields('companies'), {
    sorts: [{ field: 'employees', direction: 'desc' }],
  })
  if (sorted.at(-1)?.id !== 'new') throw new Error('Empty values must sort last')
  const empty = queryExampleRecords([missing, ...rows], queryFields('companies'), {
    filter: { conjunction: 'and', conditions: [{ id: 'empty', field: 'employees', operator: 'empty' }] },
  })
  if (empty.length !== 1 || empty[0]?.id !== 'new') throw new Error('Empty numeric filter failed')
})
