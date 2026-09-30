import type { ReactNode } from 'react'
import type { Choice } from './choice-types.ts'
export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'multiSelect' | 'relation'
export type FilterValue = string | number | boolean | null | (string | number)[] | {
  direction: 'past' | 'next'
  amount: number
  unit: 'day' | 'week' | 'month'
}
export type FilterCondition = { id: string; field: string; operator: string; value?: FilterValue }
export type FilterGroup = { id?: string; conjunction: 'and' | 'or'; conditions: FilterNode[] }
export type FilterNode = FilterCondition | (FilterGroup & { id: string })
export type RecordFilter = FilterGroup
export type RecordSort = { field: string; direction: 'asc' | 'desc' }
export type FilterOperator = {
  id: string
  label: string
  input?: 'none' | 'single' | 'multiple' | 'range' | 'relative'
}
export type QueryField = {
  id: string
  label: string
  type: FieldType
  path?: string[]
  options?: Choice[]
  sortable?: boolean
  operators?: FilterOperator[]
  renderValue?: (
    props: { condition: FilterCondition; onChange: (value: FilterValue) => void; disabled?: boolean },
  ) => ReactNode
}
const op = (id: string, label: string, input: FilterOperator['input'] = 'single'): FilterOperator => ({
  id,
  label,
  input,
})
const empty = [op('empty', 'Is empty', 'none'), op('notEmpty', 'Is not empty', 'none')]
export function operatorsFor(field: QueryField): FilterOperator[] {
  if (field.operators) return field.operators
  const equal = [op('eq', 'Is'), op('neq', 'Is not')]
  switch (field.type) {
    case 'text':
      return [
        op('contains', 'Contains'),
        op('notContains', 'Does not contain'),
        ...equal,
        op('startsWith', 'Starts with'),
        op('endsWith', 'Ends with'),
        ...empty,
      ]
    case 'number':
      return [
        ...equal,
        op('gt', 'Greater than'),
        op('gte', 'At least'),
        op('lt', 'Less than'),
        op('lte', 'At most'),
        op('between', 'Between', 'range'),
        ...empty,
      ]
    case 'date':
    case 'datetime':
      return [
        ...equal,
        op('before', 'Before'),
        op('after', 'After'),
        op('between', 'Between', 'range'),
        op('relative', 'Relative date', 'relative'),
        ...empty,
      ]
    case 'boolean':
      return [...equal, ...empty]
    case 'select':
    case 'relation':
      return [op('in', 'Is any of', 'multiple'), op('notIn', 'Is none of', 'multiple'), ...empty]
    case 'multiSelect':
      return [
        op('in', 'Contains any', 'multiple'),
        op('all', 'Contains all', 'multiple'),
        op('notIn', 'Contains none', 'multiple'),
        ...empty,
      ]
  }
}
export const fieldLabel = (f: QueryField) => [...(f.path ?? []), f.label].join(' / ')
export const emptyFilter = (): RecordFilter => ({ conjunction: 'and', conditions: [] })
export function countConditions(group: FilterGroup): number {
  return group.conditions.reduce((n, node) => n + ('conditions' in node ? countConditions(node) : 1), 0)
}
export function newCondition(field: QueryField): FilterCondition {
  const operator = operatorsFor(field)[0]
  return {
    id: crypto.randomUUID(),
    field: field.id,
    operator: operator?.id ?? 'eq',
    value: initialValue(field, operator),
  }
}
export function initialValue(field: QueryField, operator?: FilterOperator): FilterValue | undefined {
  switch (operator?.input) {
    case 'none':
      return undefined
    case 'range':
      return ['', '']
    case 'multiple':
      return []
    case 'relative':
      return { direction: 'past', amount: 7, unit: 'day' }
    default:
      return field.type === 'boolean' ? true : ''
  }
}
export function conditionError(condition: FilterCondition, fields: readonly QueryField[]): string | undefined {
  const field = fields.find((f) => f.id === condition.field)
  if (!field) return 'Choose an available field.'
  const operator = operatorsFor(field).find((o) => o.id === condition.operator)
  if (!operator) return 'Choose an available operator.'
  if (operator.input === 'none') return
  const v = condition.value
  if (operator.input === 'relative') {
    return typeof v === 'object' && v !== null && !Array.isArray(v) && Number.isInteger(v.amount) && v.amount > 0
      ? undefined
      : 'Enter a positive whole number.'
  }
  if (operator.input === 'multiple') return Array.isArray(v) && v.length > 0 ? undefined : 'Select at least one value.'
  const values = operator.input === 'range' ? Array.isArray(v) ? v : [] : [v]
  if (
    !values.length || (operator.input === 'range' && values.length !== 2) ||
    values.some((x) => x === '' || x === null || x === undefined)
  ) return 'Enter a value.'
  if (field.type === 'number' && values.some((x) => typeof x !== 'number' || !Number.isFinite(x))) {
    return 'Enter a valid number.'
  }
  if (field.type === 'boolean' && typeof v !== 'boolean') return 'Choose true or false.'
  if (
    (field.type === 'date' || field.type === 'datetime') &&
    values.some((x) => typeof x !== 'string' || !Number.isFinite(Date.parse(x)))
  ) return 'Enter a valid date.'
  if (operator.input === 'range' && values[0]! > values[1]!) return 'The start must not exceed the end.'
}
export function filterErrors(group: FilterGroup, fields: readonly QueryField[]): string[] {
  return group.conditions.flatMap((node) =>
    'conditions' in node
      ? (node.conditions.length ? filterErrors(node, fields) : ['Add a condition to the group.'])
      : conditionError(node, fields)
      ? [conditionError(node, fields)!]
      : []
  )
}
export function moveItem<T>(values: readonly T[], from: number, to: number): T[] {
  const next = [...values]
  if (from < 0 || to < 0 || from >= next.length || to >= next.length) return next
  next.splice(to, 0, next.splice(from, 1)[0]!)
  return next
}
