import type { CSSProperties } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@dir/ui/components/ui/chart.tsx'
import type { ChartPoint } from '@dir/ui/components/charts/index.tsx'
import { bool, num, type PreviewProps, str } from './model.ts'
import { expression, jsx, literal, source } from './code.ts'
import { Surface } from './surface.tsx'

export default function ChartPreview({ values: v }: PreviewProps) {
  const values = v.values as ChartPoint[]
  const config = v.config as ChartConfig
  const type = str(v, 'type')
  const horizontal = type === 'Horizontal bar'
  const line = type === 'Line' || type === 'Sparkline'
  const spark = type === 'Sparkline'
  const height = num(v, 'height')
  const label = str(v, 'label')
  const indicator = str(v, 'indicator') as 'dot' | 'line' | 'dashed'
  const showTooltip = bool(v, 'showTooltip'), showLegend = bool(v, 'showLegend')
  const Chart = line ? LineChart : BarChart
  const keys = ['value', ...(values.some((point) => point.secondary !== undefined) ? ['secondary'] : [])]
  const xAxis = {
    dataKey: horizontal ? undefined : 'label',
    type: horizontal ? 'number' as const : 'category' as const,
    tickLine: false,
    axisLine: false,
    tickMargin: 10,
  }
  const yAxis = {
    dataKey: horizontal ? 'label' : undefined,
    type: horizontal ? 'category' as const : 'number' as const,
    tickLine: false,
    axisLine: false,
    width: horizontal ? 72 : 64,
  }
  const margin = { top: 12, right: 12, bottom: 8, left: 0 }
  const children = [
    ...(!spark
      ? [
        jsx('CartesianGrid', { vertical: horizontal, horizontal: !horizontal }),
        jsx('XAxis', xAxis),
        jsx('YAxis', yAxis),
      ]
      : []),
    ...(showTooltip ? [jsx('ChartTooltip', { content: expression(jsx('ChartTooltipContent', { indicator })) })] : []),
    ...(showLegend ? [jsx('ChartLegend', { content: expression('<ChartLegendContent />') })] : []),
    ...keys.map((key) =>
      line
        ? jsx('Line', {
          dataKey: key,
          type: 'monotone',
          stroke: `var(--color-${key})`,
          strokeWidth: 2,
          dot: !spark,
          isAnimationActive: false,
        })
        : jsx('Bar', { dataKey: key, fill: `var(--color-${key})`, radius: 4, maxBarSize: 48, isAnimationActive: false })
    ),
  ].join('\n')
  const code = source(
    `import { ${line ? 'Line, LineChart' : 'Bar, BarChart'}${
      spark ? '' : ', CartesianGrid, XAxis, YAxis'
    } } from 'recharts'\n` +
      `import { ChartContainer, type ChartConfig${showTooltip ? ', ChartTooltip, ChartTooltipContent' : ''}${
        showLegend ? ', ChartLegend, ChartLegendContent' : ''
      } } from './components/ui/chart.tsx'`,
    jsx(
      'ChartContainer',
      { config: expression('config'), className: 'w-full aspect-auto', style: { height }, 'aria-label': label },
      jsx(line ? 'LineChart' : 'BarChart', {
        accessibilityLayer: true,
        data: expression('data'),
        layout: horizontal ? 'vertical' : 'horizontal',
        margin,
      }, children),
    ),
    `const data = ${literal(values)}\nconst config = ${literal(config)} satisfies ChartConfig`,
  )
  return (
    <Surface code={code}>
      <ChartContainer
        config={config}
        className='w-full aspect-auto h-(--chart-height)'
        style={{ '--chart-height': `${height}px` } as CSSProperties}
        aria-label={label}
      >
        <Chart accessibilityLayer data={values} layout={horizontal ? 'vertical' : 'horizontal'} margin={margin}>
          {!spark && <CartesianGrid vertical={horizontal} horizontal={!horizontal} />}
          {!spark && <XAxis {...xAxis} />}
          {!spark && <YAxis {...yAxis} />}
          {showTooltip && <ChartTooltip content={<ChartTooltipContent indicator={indicator} />} />}
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {keys.map((key) =>
            line
              ? (
                <Line
                  key={key}
                  dataKey={key}
                  type='monotone'
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  dot={!spark}
                  isAnimationActive={false}
                />
              )
              : (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`var(--color-${key})`}
                  radius={4}
                  maxBarSize={48}
                  isAnimationActive={false}
                />
              )
          )}
        </Chart>
      </ChartContainer>
    </Surface>
  )
}
