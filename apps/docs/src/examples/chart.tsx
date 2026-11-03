import { HorizontalBars, RevenueBars, TrendChart } from '@dir/ui/components/charts/index.tsx'
import { LoadingState } from '@dir/ui/components/ui/loading-state.tsx'
import type { ComponentDoc } from './index.ts'

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const revenue = [70, 58, 82, 96, 64, 92].map((v, i) => ({ label: months[i]!, value: v * 1000000 }))
const trend = months.map((label, i) => ({ label, value: (30 + i * 9) * 1000000, secondary: (40 + i * 4) * 1000000 }))
const departments = [
  { label: 'Sales 1', value: 78 },
  { label: 'Sales 2', value: 63 },
  { label: 'Partners', value: 67 },
  { label: 'Inside', value: 56 },
]

export function ChartDemo() {
  return (
    <div className='w-full'>
      <p className='mb-2 text-[13px] font-semibold'>Monthly revenue</p>
      <RevenueBars values={revenue} />
    </div>
  )
}
export function TrendChartDemo() {
  return (
    <div className='w-full'>
      <p className='mb-2 text-[13px] font-semibold'>Won vs target</p>
      <TrendChart values={trend} names={['Won', 'Target']} />
    </div>
  )
}
export function HorizontalBarsDemo() {
  return (
    <div className='w-full'>
      <p className='mb-2 text-[13px] font-semibold'>Attainment by department</p>
      <HorizontalBars values={departments} />
    </div>
  )
}
export function ChartEmpty() {
  return (
    <div className='grid w-full grid-cols-2 gap-3 max-[600px]:grid-cols-1'>
      <RevenueBars values={[]} />
      <LoadingState label='Loading chart' />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: ChartDemo,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'trend',
      title: 'Trend Chart',
      description: '`TrendChart` draws up to two series; pass their `names` for the legend.',
      example: TrendChartDemo,
      align: 'stretch',
    },
    {
      id: 'horizontal-bars',
      title: 'Horizontal Bars',
      description: 'A label column, a track and the value right-aligned with tabular numerals.',
      example: HorizontalBarsDemo,
      align: 'stretch',
    },
    {
      id: 'empty',
      title: 'Empty and Loading',
      description: 'With no values `ChartFrame` shows the empty state; show `LoadingState` while data loads.',
      example: ChartEmpty,
      align: 'stretch',
    },
  ],
}
