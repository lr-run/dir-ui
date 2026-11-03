// Search, sort and nested filters over table rows, the same semantics as the CRM example.
import type { FilterCondition, FilterGroup, QueryField, RecordFilter, RecordSort } from '@/lib/query.ts'
import type { KitField, KitObject, KitRow } from '@/components/systems/kit/types.ts'

export const rowValue = (row: KitRow, field: string): unknown => Reflect.get(row, field)
const queryType = (field: KitField): QueryField['type'] =>
  field.type === 'number' || field.type === 'money' || field.type === 'percent'
    ? 'number'
    : field.type === 'date'
    ? 'date'
    : field.type === 'datetime'
    ? 'datetime'
    : field.type === 'choice'
    ? 'select'
    : 'text'
/** Filterable and sortable fields of an object, with choice options for the filter value picker. */
export function queryFields(object: KitObject): QueryField[] {
  return [
    { id: 'name', label: object.nameLabel ?? 'Name', type: 'text' },
    ...object.fields.filter((field) => field.type !== 'longtext' && field.type !== 'boolean').map((field) => ({
      id: field.key,
      label: field.label,
      type: queryType(field),
      ...field.type === 'choice'
        ? { options: field.options!.map((option) => ({ value: option.label, label: option.label })) }
        : {},
    })),
    { id: 'createdAt', label: 'Created', type: 'datetime' },
    { id: 'updatedAt', label: 'Updated', type: 'datetime' },
  ]
}
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
const text = (value: unknown) => String(value ?? '').toLowerCase()
function matches(row: KitRow, condition: FilterCondition): boolean {
  const value = rowValue(row, condition.field), expected = condition.value
  const values = Array.isArray(value) ? value : [value], wanted = Array.isArray(expected) ? expected : [expected]
  const eq = (a: unknown, b: unknown) => text(a) === text(b)
  const comparable = (v: unknown) => typeof value === 'number' ? Number(v) : text(v)
  switch (condition.operator) {
    case 'empty':
      return value == null || value === '' || (Array.isArray(value) && !value.length)
    case 'notEmpty':
      return !matches(row, { ...condition, operator: 'empty' })
    case 'eq':
      return eq(value, expected)
    case 'neq':
      return !eq(value, expected)
    case 'contains':
      return text(value).includes(text(expected))
    case 'notContains':
      return !text(value).includes(text(expected))
    case 'startsWith':
      return text(value).startsWith(text(expected))
    case 'endsWith':
      return text(value).endsWith(text(expected))
    case 'in':
      return values.some((v) => wanted.some((w) => eq(v, w)))
    case 'notIn':
      return !values.some((v) => wanted.some((w) => eq(v, w)))
    case 'all':
      return wanted.every((w) => values.some((v) => eq(v, w)))
    case 'gt':
    case 'after':
      return value != null && comparable(value) > comparable(expected)
    case 'gte':
      return value != null && comparable(value) >= comparable(expected)
    case 'lt':
    case 'before':
      return value != null && comparable(value) < comparable(expected)
    case 'lte':
      return value != null && comparable(value) <= comparable(expected)
    case 'between':
      return value != null && Array.isArray(expected) && comparable(value) >= comparable(expected[0]) &&
        comparable(value) <= comparable(expected[1])
    case 'relative': {
      if (!expected || typeof expected !== 'object' || Array.isArray(expected)) return false
      const now = Date.now(),
        range = expected.amount * (expected.unit === 'day' ? 1 : expected.unit === 'week' ? 7 : 30) * 86400000,
        date = Date.parse(String(value))
      return expected.direction === 'past' ? date <= now && date >= now - range : date >= now && date <= now + range
    }
    default:
      return false
  }
}
export function queryKitRows(
  rows: readonly KitRow[],
  fields: readonly QueryField[],
  { search = '', filter, sorts = [] }: { search?: string; filter?: RecordFilter; sorts?: readonly RecordSort[] },
) {
  const allowed = new Set(fields.map((field) => field.id))
  const matchGroup = (row: KitRow, group: FilterGroup): boolean =>
    !group.conditions.length ||
    (group.conjunction === 'and'
      ? group.conditions.every((node) =>
        'conditions' in node ? matchGroup(row, node) : allowed.has(node.field) && matches(row, node)
      )
      : group.conditions.some((node) =>
        'conditions' in node ? matchGroup(row, node) : allowed.has(node.field) && matches(row, node)
      ))
  const query = search.trim().toLowerCase()
  return rows.filter((row) =>
    (!query || fields.some((field) => text(rowValue(row, field.id)).includes(query))) &&
    (!filter || matchGroup(row, filter))
  ).sort((a, b) => {
    for (const sort of sorts) {
      if (!allowed.has(sort.field)) continue
      const left = rowValue(a, sort.field), right = rowValue(b, sort.field)
      if (left == null || right == null) {
        if (left !== right) return left == null ? 1 : -1
        continue
      }
      const compared = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : collator.compare(String(left), String(right))
      if (compared) return compared * (sort.direction === 'asc' ? 1 : -1)
    }
    return 0
  })
}
