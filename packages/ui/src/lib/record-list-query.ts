import type { FilterCondition, FilterGroup, RecordFilter, RecordSort } from '@/lib/query.ts'

export type TextQueryFields<R> = Partial<Record<string, (row: R) => string>>
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

/** Small, in-memory text datasets. Server-backed lists should pass queried rows to the grid. */
export function queryTextRecords<R>(
  rows: readonly R[],
  fields: TextQueryFields<R>,
  { search = '', filter, sorts = [] }: { search?: string; filter?: RecordFilter; sorts?: readonly RecordSort[] },
): R[] {
  const query = search.trim().toLocaleLowerCase('en')
  const match = (row: R, condition: FilterCondition): boolean => {
    const read = fields[condition.field]
    if (!read) return false
    const actual = read(row).toLocaleLowerCase('en'), expected = String(condition.value ?? '').toLocaleLowerCase('en')
    switch (condition.operator) {
      case 'contains':
        return actual.includes(expected)
      case 'notContains':
        return !actual.includes(expected)
      case 'startsWith':
        return actual.startsWith(expected)
      case 'endsWith':
        return actual.endsWith(expected)
      case 'eq':
        return actual === expected
      case 'neq':
        return actual !== expected
      case 'in':
      case 'notIn': {
        if (!Array.isArray(condition.value)) return false
        const included = condition.value.some((value) => String(value).toLocaleLowerCase('en') === actual)
        return condition.operator === 'in' ? included : !included
      }
      case 'empty':
        return actual === ''
      case 'notEmpty':
        return actual !== ''
      default:
        return false
    }
  }
  const combine = (values: boolean[], conjunction: 'and' | 'or') =>
    !values.length || (conjunction === 'and' ? values.every(Boolean) : values.some(Boolean))
  const matchesGroup = (row: R, group: FilterGroup): boolean =>
    combine(
      group.conditions.map((node) => 'conditions' in node ? matchesGroup(row, node) : match(row, node)),
      group.conjunction,
    )
  return rows.filter((row) =>
    (!query ||
      Object.values(fields).some((read) => read?.(row).toLocaleLowerCase('en').includes(query))) &&
    (!filter ||
      matchesGroup(row, filter))
  ).sort((a, b) => {
    for (const sort of sorts) {
      const read = fields[sort.field]
      if (!read) continue
      const compared = collator.compare(read(a), read(b))
      if (compared) return compared * (sort.direction === 'asc' ? 1 : -1)
    }
    return 0
  })
}
