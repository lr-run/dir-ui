import { buildReport } from '../examples/crm/src/routes/report.tsx'
import { sampleRecords } from '../examples/crm/src/example/data.ts'

Deno.test('report totals reconcile across stages, months and owners after combined filtering', () => {
  const rows = sampleRecords('deals', 100)
  const report = buildReport(rows, 'Alex Morgan', '2026-10')
  const expected = rows.filter((row) => row.owner === 'Alex Morgan' && row.closeDate?.startsWith('2026-10'))
  const value = expected.reduce((sum, row) => sum + row.value, 0)
  if (report.total.count !== expected.length || report.total.value !== value) throw new Error('Filtering mismatch')
  for (const groups of [report.stages, report.months, report.owners]) {
    for (const key of ['count', 'value', 'weighted', 'won'] as const) {
      if (groups.reduce((sum, group) => sum + group[key], 0) !== report.total[key]) {
        throw new Error(`Totals differ: ${key}`)
      }
    }
  }
})
Deno.test('report uses won probability, handles missing values and empty data without NaN', () => {
  const base = sampleRecords('deals', 1)[0]!
  const report = buildReport([
    { ...base, status: 'Signed', stageCategory: 'won', value: 100, probability: 25, closeDate: undefined },
    { ...base, value: 80, probability: 50 },
    { ...base, value: 20, probability: undefined },
  ])
  if (report.total.value !== 200 || report.total.weighted !== 140 || report.total.won !== 100) {
    throw new Error('Weighting mismatch')
  }
  if (report.months.find((row) => row.name === 'Unscheduled')?.value !== 100) throw new Error('Missing date lost')
  if (buildReport([base], 'Nobody').total.count !== 0 || buildReport([]).total.weighted !== 0) {
    throw new Error('Empty report mismatch')
  }
})
