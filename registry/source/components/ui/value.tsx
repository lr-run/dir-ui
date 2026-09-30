import '@/components/ui/dir-theme.css'
import type { ReactNode } from 'react'
import { type Choice } from '@/lib/choice-types.ts'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
export type NumberFormat = {
  locale?: string
  format?: 'number' | 'currency' | 'percent'
  currency?: string
  maximumFractionDigits?: number
}
export function formatNumber(
  value: number | null | undefined,
  { locale = 'en-US', format = 'number', currency = 'USD', maximumFractionDigits = 2 }: NumberFormat = {},
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(locale, {
    style: format === 'number' ? 'decimal' : format,
    ...(format === 'currency' ? { currency } : {}),
    maximumFractionDigits,
  }).format(format === 'percent' ? value / 100 : value)
}
export function NumberValue({ value, ...options }: NumberFormat & { value: number | null | undefined }) {
  return <span className='tabular-nums'>{formatNumber(value, options)}</span>
}
export function formatDate(
  value: string | null | undefined,
  { locale = 'en-US', timeZone = 'UTC', includeTime = false }: {
    locale?: string
    timeZone?: string
    includeTime?: boolean
  } = {},
): string {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  if (!Number.isFinite(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
    timeZone: value.length === 10 ? 'UTC' : timeZone,
  }).format(date)
}
export function DateValue(
  { value, ...options }: {
    value: string | null | undefined
    locale?: string
    timeZone?: string
    includeTime?: boolean
  },
) {
  return value ? <time dateTime={value}>{formatDate(value, options)}</time> : <span>—</span>
}
export function ChoiceValue(
  { items, empty = '—', onSelect }: { items: readonly Choice[]; empty?: ReactNode; onSelect?: (item: Choice) => void },
) {
  return (
    <span className='inline-flex flex-wrap gap-[4px]'>
      {items.length
        ? items.map((item) =>
          onSelect
            ? (
              <button
                type='button'
                className='inline-flex p-[2px_6px] rounded-[4px] [background:var(--ui-hover)] text-[12px]'
                key={item.value}
                onClick={() => onSelect(item)}
              >
                <ChoiceContent item={item} compact />
              </button>
            )
            : (
              <span
                className='inline-flex p-[2px_6px] rounded-[4px] [background:var(--ui-hover)] text-[12px]'
                key={item.value}
              >
                <ChoiceContent item={item} compact />
              </span>
            )
        )
        : empty}
    </span>
  )
}
