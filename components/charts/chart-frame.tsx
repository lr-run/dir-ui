import type { CSSProperties, ReactElement } from 'react'
import { type ChartConfig, ChartContainer } from '../ui/chart.tsx'
import { EmptyState } from '../ui/empty-state.tsx'
import { ErrorState } from '../ui/error-state.tsx'
import { LoadingState as Skeleton } from '../ui/loading-state.tsx'
import { useI18n } from '../../lib/i18n.tsx'
export function ChartFrame(
  { label, height = 230, empty = false, loading = false, error, config = {}, children }: {
    label: string
    config?: ChartConfig
    height?: number
    empty?: boolean
    loading?: boolean
    error?: string
    children: ReactElement
  },
) {
  const { t } = useI18n()
  return (
    <div
      className='group/crm-chart-frame min-w-0 h-(--chart-height)'
      style={{ '--chart-height': `${height}px` } as CSSProperties}
      role='img'
      aria-label={label}
    >
      {error
        ? <ErrorState message={error} />
        : loading
        ? <Skeleton label={t('読み込み中…')} />
        : empty
        ? <EmptyState title={t('表示するデータがありません')} />
        : (
          <ChartContainer
            config={config}
            className='h-full w-full aspect-auto'
            initialDimension={{ width: 600, height }}
          >
            {children}
          </ChartContainer>
        )}
    </div>
  )
}
export function ChartTooltip(
  { active, payload, label }: {
    active?: boolean
    label?: string | number
    payload?: readonly { name?: string | number; value?: string | number; color?: string }[]
  },
) {
  if (!active || !payload?.length) return null
  return (
    <div className='p-[10px_12px] [background:var(--ui-raised)] [border:1px_solid_var(--ui-border)] rounded-[6px] text-[length:var(--dir-text-label)] [&>div]:flex [&>div]:justify-between [&>div]:gap-[20px] [&>div]:pt-[6px]'>
      <strong>{label}</strong>
      {payload.map((item, index) => (
        <div key={index}>
          <span className='text-(--series-color)' style={{ '--series-color': item.color } as CSSProperties}>
            {item.name}
          </span>
          <span>{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
        </div>
      ))}
    </div>
  )
}
export function ChartLegend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <ul className='flex gap-[14px] list-none p-0 text-[length:var(--dir-text-caption)] [&_li]:flex [&_li]:items-center [&_li]:gap-[6px] [&_li_span]:w-[8px] [&_li_span]:h-[8px] [&_li_span]:rounded-[2px]'>
      {items.map((item) => (
        <li key={item.name}>
          <span className='bg-(--series-color)' style={{ '--series-color': item.color } as CSSProperties} />
          {item.name}
        </li>
      ))}
    </ul>
  )
}
