import { z } from 'zod'
import type { FilterCondition, RecordFilter } from '../../../../../lib/query.ts'
const filterValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number()])),
  z.object({ direction: z.enum(['past', 'next']), amount: z.number(), unit: z.enum(['day', 'week', 'month']) }),
])
const conditionSchema: z.ZodType<FilterCondition> = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.string(),
  value: filterValueSchema.optional(),
})
const filterSchema: z.ZodType<RecordFilter> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    conjunction: z.enum(['and', 'or']),
    conditions: z.array(z.union([conditionSchema, filterSchema.and(z.object({ id: z.string() }))])),
  })
)
const sortSchema = z.array(z.object({ field: z.string(), direction: z.enum(['asc', 'desc']) })).refine(
  (items) => new Set(items.map((i) => i.field)).size === items.length,
  'Sort fields must be unique.',
)

export type Values = Record<string, unknown>
export type Update = (key: string, value: unknown) => void
export type PreviewProps = { id: string; values: Values; update: Update }
export type Control = {
  key: string
  type: 'text' | 'textarea' | 'boolean' | 'number' | 'select' | 'json'
  options?: string[]
  min?: number
  max?: number
  schema?: keyof typeof schemas
}
export type Spec = {
  id: string
  title: string
  description: string
  group: 'basic' | 'advanced' | 'charts' | 'records' | 'extensions'
  previewSize: 'natural' | 'control' | 'panel' | 'wide' | 'full'
  defaults: Values
  controls: Control[]
  examples?: { label: string; values: Values }[]
}
export const str = (v: Values, k: string) => String(v[k] ?? '')
export const bool = (v: Values, k: string) => Boolean(v[k])
export const num = (v: Values, k: string) => Number(v[k])
const unique = <T extends { value: string }>(items: T[]) => new Set(items.map((i) => i.value)).size === items.length
const choice = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  avatar: z.string().optional(),
  disabled: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
})
export const schemas = {
  queryFields: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'boolean', 'date', 'datetime', 'select', 'multiSelect', 'relation']),
      path: z.array(z.string()).optional(),
      options: z.array(choice).optional(),
      sortable: z.boolean().optional(),
    }),
  ).min(1),
  columns: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      required: z.boolean().optional(),
      canFreeze: z.boolean().optional(),
    }),
  ),
  columnState: z.array(z.object({ id: z.string(), visible: z.boolean(), frozen: z.boolean().optional() })),
  searchItems: z.array(
    z.object({
      meta: z.string().optional(),
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      group: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      disabled: z.boolean().optional(),
    }),
  ),
  listItems: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      meta: z.string().optional(),
      done: z.boolean().optional(),
    }),
  ),
  choices: z.array(choice).max(50).refine(unique, 'Option values must be unique.'),
  strings: z.array(z.string()).max(50),
  names: z.array(z.string()).min(1).max(2),
  chartConfig: z.object({
    value: z.object({ label: z.string(), color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color.') }),
    secondary: z.object({
      label: z.string(),
      color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color.'),
    }),
  }),
  points: z.array(z.object({ label: z.string(), value: z.number(), secondary: z.number().optional() })).max(100),
  rows: z.array(z.object({ id: z.number(), name: z.string(), team: z.string(), email: z.string() })).max(100).refine(
    (rows) => new Set(rows.map((r) => r.id)).size === rows.length,
    'Row IDs must be unique.',
  ),
  listSorts: sortSchema.refine(
    (sorts) => sorts.every((sort) => ['title', 'department', 'email'].includes(sort.field)),
    'Use title, department, or email.',
  ),
  listFilter: filterSchema,
  sorts: sortSchema,
  filter: filterSchema,
  legend: z.array(z.object({ name: z.string(), color: z.string() })).max(20),
  payload: z.array(z.object({ name: z.string(), value: z.number(), color: z.string() })).max(20),
  fields: z.array(
    z.object({
      id: z.string().regex(/^[a-z][a-z0-9-]*$/i),
      label: z.string(),
      value: z.string(),
      required: z.boolean().optional(),
    }),
  ).max(20).refine((fields) => new Set(fields.map((f) => f.id)).size === fields.length, 'Field IDs must be unique.'),
  tabs: z.array(z.object({ id: z.string(), label: z.string(), content: z.string() })).max(10).refine(
    (tabs) => new Set(tabs.map((t) => t.id)).size === tabs.length,
    'Tab IDs must be unique.',
  ),
}
export function parseControl(
  control: Control,
  text: string,
): { value: unknown; error?: never } | { error: string; value?: never } {
  try {
    const value: unknown = JSON.parse(text)
    const result = schemas[control.schema!].safeParse(value)
    return result.success ? { value: result.data } : { error: result.error.issues[0]?.message ?? 'Invalid value.' }
  } catch {
    return { error: 'Enter valid JSON. The preview keeps the last valid value.' }
  }
}
