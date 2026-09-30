import {
  ArrowLeftIcon,
  CodeXmlIcon,
  RectangleEllipsisIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TabletIcon,
} from 'lucide-react'
import { TemplateInstall } from './install-command.tsx'
import { Button } from '../../../../components/ui/button.tsx'
import { IconButton } from '../../../../components/ui/icon-button.tsx'
import { Select } from '../../../../components/ui/select.tsx'
import { Hint } from '../../../../components/ui/tooltip.tsx'

const viewports = [
  { value: 'responsive', label: 'Responsive width', Icon: RectangleEllipsisIcon },
  { value: '768', label: 'Tablet · 768 px', Icon: TabletIcon },
  { value: '390', label: 'Mobile · 390 px', Icon: SmartphoneIcon },
]

export function StudioControls({ count, viewport, onCountChange, onViewportChange, onReset }: {
  count: number
  viewport: string
  onCountChange: (count: number) => void
  onViewportChange: (viewport: string) => void
  onReset: () => void
}) {
  return (
    <div className='flex items-center gap-3' role='group' aria-label='Preview settings'>
      <div
        className='flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5'
        role='group'
        aria-label='Preview width'
      >
        {viewports.map((item) => (
          <Hint key={item.value} label={item.label}>
            <Button
              variant='ghost'
              size='icon-sm'
              aria-label={item.label}
              aria-pressed={viewport === item.value}
              onClick={() => onViewportChange(item.value)}
              className='text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm'
            >
              <item.Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </Button>
          </Hint>
        ))}
      </div>
      <span className='h-4 w-px bg-border' aria-hidden='true' />
      <div className='[&_[role=combobox]]:h-7 [&_[role=combobox]]:w-28 [&_[role=combobox]]:border-transparent [&_[role=combobox]]:bg-transparent [&_[role=combobox]]:text-xs [&_[role=combobox]]:shadow-none [&_[role=combobox]:hover]:bg-muted'>
        <Select
          label='Records'
          value={String(count)}
          onChange={(value) => onCountChange(Number(value))}
          items={[0, 5, 25, 100, 1000].map((value) => ({
            value: String(value),
            label: value ? `${value.toLocaleString('en-US')} records` : 'Empty',
          }))}
        />
      </div>
      <Hint label='Reset preview'>
        <IconButton
          label='Reset preview'
          variant='ghost'
          onClick={onReset}
          className='text-muted-foreground hover:text-foreground'
        >
          <RefreshCwIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        </IconButton>
      </Hint>
    </div>
  )
}

export function StudioActions({ codeView, onToggleCode }: { codeView: boolean; onToggleCode: () => void }) {
  return (
    <div className='flex items-center gap-1.5' role='group' aria-label='Example actions'>
      <Button
        variant='ghost'
        aria-label={codeView ? 'Back to preview' : 'View code'}
        title={codeView ? 'Back to preview' : 'View code'}
        onClick={onToggleCode}
        className='gap-1.5 max-[700px]:w-7 max-[700px]:px-0'
      >
        {codeView
          ? <ArrowLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          : <CodeXmlIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
        <span className='max-[700px]:hidden'>{codeView ? 'Preview' : 'Code'}</span>
      </Button>
      <TemplateInstall />
    </div>
  )
}
