import type { LoadSearchResults } from '../../../components/collections/search-dialog.tsx'
import type { LoadRecordPage } from '../../../lib/infinite-records.ts'
import type { RecordFilter, RecordSort } from '../../../lib/query.ts'
import { type DemoRecord, makeDemoRecords } from './records.ts'
import { queryDemoRecords } from './query.ts'
import { searchDemoItems } from './search.ts'

/** Simulates network latency without making a request; cancellation also clears the timer. */
function wait(signal: AbortSignal, delayMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }
    const abort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, delayMs)
    signal.addEventListener('abort', abort, { once: true })
  })
}

let sample: { count: number; rows: DemoRecord[] } | undefined
function records(count: number) {
  if (sample?.count !== count) sample = { count, rows: makeDemoRecords(count) }
  return sample.rows
}

export function demoRecordLoader({ count, pageSize, search, sorts, filter, delayMs = 250 }: {
  count: number
  pageSize: number
  search: string
  sorts: readonly RecordSort[]
  filter: RecordFilter
  delayMs?: number
}): LoadRecordPage<DemoRecord> {
  // Reuse the complete query result for every page; never filter or sort only a page.
  let result: DemoRecord[] | undefined
  return async ({ cursor, signal }) => {
    await wait(signal, delayMs)
    signal.throwIfAborted()
    const offset = cursor == null ? 0 : Number(cursor)
    if (
      !Number.isInteger(count) || count < 0 || count > 10000 || !Number.isInteger(pageSize) || pageSize < 1 ||
      pageSize > 100 || !Number.isInteger(offset) || offset < 0 || offset > 10000
    ) throw new RangeError('Invalid demo page parameters')
    result ??= queryDemoRecords(records(count), { search, sorts, filter })
    const end = offset + pageSize
    return {
      rows: result.slice(offset, end),
      nextCursor: end < result.length ? String(end) : null,
      total: result.length,
    }
  }
}

export function createDemoSearchLoader(delayMs = 250): LoadSearchResults {
  return async (query, { signal }) => {
    await wait(signal, delayMs)
    signal.throwIfAborted()
    if (query.length > 200) throw new RangeError('Search is limited to 200 characters')
    const term = query.trim().toLowerCase()
    return searchDemoItems.filter((item) =>
      [item.label, item.description, ...item.keywords].join(' ').toLowerCase().includes(term)
    ).slice(0, 20)
  }
}
export const loadDemoSearchResults = createDemoSearchLoader()
