import { cellText, reorderTableColumns } from '../components/record-list/record-table-model.ts'
Deno.test('typed table formatting preserves null, zero, false, percentages, and date-only values', () => {
  const results = [
    cellText(null, 'money'),
    cellText(0, 'money'),
    cellText(false, 'boolean'),
    cellText(25, 'percent'),
    cellText('2026-01-01', 'date'),
    cellText(1234.56, 'number', { grouping: false, decimals: 1 }),
  ]
  if (JSON.stringify(results) !== JSON.stringify(['', '$0.00', 'No', '25%', 'Jan 1, 2026', '1234.6'])) {
    throw new Error(JSON.stringify(results))
  }
})
Deno.test('column reordering retains hidden columns and protects primary columns', () => {
  const columns = [{ key: 'name' }, { key: 'hidden' }, { key: 'revenue' }, { key: 'email' }], locked = new Set(['name'])
  if (
    reorderTableColumns(columns, 'email', 'revenue', locked).map((c) => c.key).join() !== 'name,hidden,email,revenue'
  ) throw new Error('Wrong order')
  if (
    reorderTableColumns(columns, 'revenue', 'name', locked).map((c) => c.key).join() !== 'name,hidden,revenue,email'
  ) throw new Error('Primary column moved')
})
