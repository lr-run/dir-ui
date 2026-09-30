import {
  ChartLegend as Legend,
  ChartLegendContent,
  ChartTooltip as Tooltip,
  ChartTooltipContent,
} from '../ui/chart.tsx'
import { ChartFrame } from './chart-frame.tsx'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../lib/i18n.tsx'
const yen = (value: number) => '¥' + value.toLocaleString('ja-JP')

export type ChartPoint = { label: string; value: number; secondary?: number }
const axis = { fill: 'var(--chart-muted, var(--ui-muted))', fontSize: 12 }
const primary = 'var(--chart-primary, var(--ui-primary))'
const secondary = 'var(--chart-secondary, var(--ui-green))'
const grid = 'var(--chart-grid, var(--ui-border))'
export const chartTooltipStyle = {
  background: 'var(--ui-surface)',
  border: '1px solid var(--ui-border)',
  borderRadius: 6,
  fontSize: 12,
}
export function useCompactMoney() {
  const { language } = useI18n()
  return (value: number) =>
    language === 'ja'
      ? `${(value / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万`
      : `${(value / 1000000).toLocaleString('en-US', { maximumFractionDigits: 2 })}m`
}
export function RevenueBars({ values }: { values: ChartPoint[] }) {
  const compact = useCompactMoney()
  return (
    <ChartFrame
      config={{ value: { label: 'JPY', color: primary } }}
      label={values.map((v) => `${v.label}: ${yen(v.value)}`).join(', ')}
      empty={!values.length}
    >
      <BarChart data={values} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={grid} strokeDasharray='3 3' />
        <XAxis dataKey='label' tick={axis} axisLine={false} tickLine={false} dy={5} />
        <YAxis tick={axis} tickFormatter={compact} axisLine={false} tickLine={false} width={55} />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: 'var(--ui-hover)' }}
        />
        <ReferenceLine y={0} stroke={grid} />
        <Bar
          dataKey='value'
          fill={primary}
          maxBarSize={42}
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartFrame>
  )
}
export function TrendChart(
  { values, names, height = 230 }: { values: ChartPoint[]; names: [string, string?]; height?: number },
) {
  const compact = useCompactMoney()
  return (
    <ChartFrame
      config={{ value: { label: names[0], color: primary }, secondary: { label: names[1], color: secondary } }}
      height={height}
      empty={!values.length}
      label={values.map((v) =>
        `${v.label}: ${names[0]} ${yen(v.value)}${v.secondary === undefined ? '' : `, ${names[1]} ${yen(v.secondary)}`}`
      ).join('; ')}
    >
      <LineChart data={values} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={grid} />
        <XAxis dataKey='label' tick={axis} tickLine={false} axisLine={false} dy={4} />
        <YAxis tick={axis} tickFormatter={compact} tickLine={false} axisLine={false} width={56} />
        <Tooltip content={<ChartTooltipContent />} />
        {names[1] && <Legend content={<ChartLegendContent />} />}
        <ReferenceLine y={0} stroke={grid} />
        <Line
          dataKey='value'
          stroke={primary}
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 0, fill: primary }}
          isAnimationActive={false}
        />
        {names[1] && (
          <Line
            dataKey='secondary'
            stroke={secondary}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: secondary }}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ChartFrame>
  )
}
export function HorizontalBars(
  { values, height = 220, labelWidth = 80 }: { values: ChartPoint[]; height?: number; labelWidth?: number },
) {
  const compact = useCompactMoney()
  return (
    <ChartFrame
      config={{ value: { label: 'JPY', color: primary } }}
      height={height}
      empty={!values.length}
      label={values.map((v) => `${v.label}: ${yen(v.value)}`).join(', ')}
    >
      <BarChart
        data={values}
        layout='vertical'
        margin={{ top: 0, right: 30, bottom: 0, left: 0 }}
        barCategoryGap='32%'
      >
        <CartesianGrid horizontal={false} stroke={grid} />
        <XAxis type='number' tick={axis} tickFormatter={compact} tickLine={false} axisLine={false} />
        <YAxis
          type='category'
          dataKey='label'
          width={labelWidth}
          tick={{ ...axis, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: 'var(--ui-hover)' }}
        />
        <Bar
          dataKey='value'
          fill={primary}
          maxBarSize={28}
          radius={[0, 2, 2, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartFrame>
  )
}
export function SparkChart({ values }: { values: ChartPoint[] }) {
  return (
    <div
      className='w-[80px] h-[24px] block'
      role='img'
      aria-label={values.map((v) => `${v.label}: ${yen(v.value)}`).join(', ')}
    >
      <BarChart
        width={80}
        height={24}
        data={values}
        margin={{ top: 1, right: 0, bottom: 1, left: 0 }}
        barCategoryGap='15%'
      >
        <Bar dataKey='value' fill='var(--ui-green)' radius={[1, 1, 0, 0]} minPointSize={1} isAnimationActive={false} />
      </BarChart>
    </div>
  )
}

export { ChartFrame, ChartLegend, ChartTooltip } from './chart-frame.tsx'
