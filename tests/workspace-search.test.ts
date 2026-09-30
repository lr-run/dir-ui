import { searchRecords } from '../examples/crm/src/example/query.ts'
import { sampleRecords } from '../examples/crm/src/example/data.ts'

Deno.test('workspace search includes unvisited routes and respects edited and deleted records', () => {
  const companies = sampleRecords('companies', 2)
  const edited = { ...companies[0]!, name: 'Renamed company', tags: ['Priority'] }
  const results = searchRecords({ companies: [edited], people: [] }, 2)
  if (results.length !== 3 || results.some((item) => item.kind === 'people')) {
    throw new Error('Deleted records returned')
  }
  const company = results.find((item) => item.kind === 'companies')
  if (company?.label !== 'Renamed company' || !company.keywords.includes('Priority')) {
    throw new Error('Stale search data')
  }
  if (company.recordId !== edited.id || company.group !== 'Companies') throw new Error('Invalid navigation target')
  if (results.filter((item) => item.kind === 'deals').length !== 2) throw new Error('Unvisited route missing')
})
Deno.test('workspace search namespaces overlapping record IDs across routes', () => {
  const company = sampleRecords('companies', 1)[0]!
  const person = { ...sampleRecords('people', 1)[0]!, id: company.id }
  const results = searchRecords({ companies: [company], people: [person], deals: [] }, 0)
  if (new Set(results.map((item) => item.id)).size !== 2) throw new Error('Search result IDs collide')
  if (searchRecords({}, 0).length) throw new Error('Empty sample count should be empty')
})

Deno.test('workspace search only indexes fields belonging to the record type', () => {
  const results = searchRecords({}, 2)
  const emailMatches = results.filter((item) =>
    [item.label, item.description, ...item.keywords].join(' ').includes('contact2@example.com')
  )
  if (emailMatches.length !== 1 || emailMatches[0]?.kind !== 'people') {
    throw new Error('Unrelated fixture fields leaked into search')
  }
})
