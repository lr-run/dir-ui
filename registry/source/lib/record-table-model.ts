export type RecordCellType =
  | 'text'
  | 'record'
  | 'email'
  | 'url'
  | 'number'
  | 'money'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'status'
  | 'tags'
  | 'member'
export type ColumnFormat = {
  grouping?: boolean
  decimals?: number
  dateStyle?: 'medium' | 'short' | 'long'
  currency?: string
}
export type TableColumnState = {
  key: string
  hidden?: boolean
  frozen?: boolean
  label?: string
  width?: number
  format?: ColumnFormat
}
export function reorderTableColumns<T extends { key: string }>(
  columns: readonly T[],
  source: string,
  target: string,
  locked: ReadonlySet<string>,
): T[] {
  const from = columns.findIndex((c) => c.key === source), to = columns.findIndex((c) => c.key === target)
  if (from < 0 || to < 0 || from === to || locked.has(source) || locked.has(target)) return [...columns]
  const result = [...columns]
  result.splice(to, 0, result.splice(from, 1)[0]!)
  return result
}
export function cellText(value: unknown, type: RecordCellType = 'text', format: ColumnFormat = {}): string {
  if (value === null || value === undefined || value === '') return ''
  if (Array.isArray(value)) return value.join(', ')
  if (type === 'boolean') return value ? 'Yes' : 'No'
  if (['number', 'money', 'percent'].includes(type)) {
    const number = Number(value)
    if (!Number.isFinite(number)) return ''
    return new Intl.NumberFormat('en-US', {
      useGrouping: format.grouping ?? true,
      minimumFractionDigits: format.decimals ?? (type === 'money' ? 2 : 0),
      maximumFractionDigits: format.decimals ?? 2,
      style: type === 'money' ? 'currency' : type === 'percent' ? 'percent' : 'decimal',
      ...(type === 'money' ? { currency: format.currency ?? 'USD' } : {}),
    }).format(type === 'percent' ? number / 100 : number)
  }
  if (type === 'date' || type === 'datetime') {
    const date = new Date(String(value))
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {
      dateStyle: format.dateStyle ?? 'medium',
      ...(type === 'datetime' ? { timeStyle: 'short' as const } : {}),
      timeZone: 'UTC',
    }).format(date)
  }
  return String(value)
}
