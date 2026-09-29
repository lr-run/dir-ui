import { TemplateInstall } from './install-command.tsx'
import { Button, I, IconButton, Select } from '../../../../components/ui/index.tsx'
import { Hint } from '../../../../components/icons/index.jsx'

const viewports = [
  { value: 'responsive', label: 'Responsive width', path: 'M8 4H4v16h4m8-16h4v16h-4M7 12h10m-8-2-2 2 2 2m6-4 2 2-2 2' },
  {
    value: '768',
    label: 'Tablet · 768 px',
    path: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm6 14v.01',
  },
  {
    value: '390',
    label: 'Mobile · 390 px',
    path: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 3h2m-1 12v.01',
  },
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
              <svg
                className='size-3.5'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.6'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d={item.path} />
              </svg>
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
          <I name='refresh' />
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
        <svg
          className='size-3.5'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <path d={codeView ? 'M9 5 2 12l7 7M2 12h20' : 'm7 6-6 6 6 6m10-12 6 6-6 6M14 3l-4 18'} />
        </svg>
        <span className='max-[700px]:hidden'>{codeView ? 'Preview' : 'Code'}</span>
      </Button>
      <TemplateInstall />
    </div>
  )
}
