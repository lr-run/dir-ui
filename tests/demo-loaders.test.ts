import { createDemoSearchLoader, demoRecordLoader } from '../landing/src/demo/loaders.ts'
import { makeDemoRecords } from '../landing/src/demo/records.ts'
import { queryDemoRecords } from '../landing/src/demo/query.ts'
import type { RecordFilter, RecordSort } from '../lib/query.ts'

const signal = () => new AbortController().signal
const emptyFilter: RecordFilter = { conjunction: 'and', conditions: [] }
Deno.test('browser record loader filters and sorts the full collection before paging without network', async () => {
  const filter: RecordFilter = {
    conjunction: 'and',
    conditions: [{ id: 'active', field: 'active', operator: 'eq', value: true }],
  }
  const sorts: RecordSort[] = [{ field: 'revenue', direction: 'desc' }]
  const load = demoRecordLoader({ count: 125, pageSize: 7, search: '', filter, sorts, delayMs: 0 })
  const expected = queryDemoRecords(makeDemoRecords(125), { filter, sorts })
  const ids: number[] = []
  let cursor: string | null = null
  do {
    const page = await load({ cursor, signal: signal() })
    if (page.total !== expected.length || page.rows.length > 7) throw new Error('Invalid page metadata')
    ids.push(...page.rows.map((row) => row.id))
    cursor = page.nextCursor
  } while (cursor !== null)
  if (JSON.stringify(ids) !== JSON.stringify(expected.map((row) => row.id))) {
    throw new Error('Pagination lost query order')
  }
})

Deno.test('browser loaders handle empty datasets, end cursors, and keyword search without network', async () => {
  const load = demoRecordLoader({ count: 0, pageSize: 10, search: '', filter: emptyFilter, sorts: [], delayMs: 0 })
  const page = await load({ cursor: null, signal: signal() })
  if (page.rows.length || page.nextCursor !== null || page.total !== 0) throw new Error('Bad empty page')
  const search = createDemoSearchLoader(0)
  const matches = await search('  SETUP ', { signal: signal() })
  if (matches.length !== 1 || matches[0]?.id !== 'start') throw new Error('Keyword matching failed')
  if ((await search('nomatchxyz', { signal: signal() })).length) throw new Error('Empty search failed')
})

Deno.test('browser demo loads cancel during latency and when already aborted, without leaving timers', async () => {
  for (const alreadyAborted of [false, true]) {
    for (const kind of ['records', 'search']) {
      const controller = new AbortController()
      if (alreadyAborted) controller.abort()
      const pending = kind === 'records'
        ? demoRecordLoader({ count: 10000, pageSize: 50, search: '', filter: emptyFilter, sorts: [], delayMs: 10000 })({
          cursor: null,
          signal: controller.signal,
        })
        : createDemoSearchLoader(10000)('setup', { signal: controller.signal })
      controller.abort()
      try {
        await pending
        throw new Error('Canceled load resolved')
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== 'AbortError') throw error
      }
    }
  }
})
