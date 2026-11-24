import { ArrowLeftIcon, CodeXmlIcon, RectangleEllipsisIcon, SmartphoneIcon, TabletIcon } from 'lucide-react'
import { TemplateInstall } from './install-command.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Hint } from '@dir/ui/components/ui/hint.tsx'

type ViewportItem = { value: string; label: string; Icon: typeof TabletIcon }
const viewports: ViewportItem[] = [
  { value: 'responsive', label: 'Responsive width', Icon: RectangleEllipsisIcon },
  { value: '768', label: 'Tablet · 768 px', Icon: TabletIcon },
  { value: '390', label: 'Mobile · 390 px', Icon: SmartphoneIcon },
]
/** Desktop, tablet and phone widths for framed previews; the icons match the CRM preview. */
export const frameViewports: (ViewportItem & { width: number })[] = [
  { value: 'desktop', label: 'Desktop · 1280 px', Icon: RectangleEllipsisIcon, width: 1280 },
  { value: 'tablet', label: 'Tablet · 768 px', Icon: TabletIcon, width: 768 },
  { value: 'phone', label: 'Mobile · 390 px', Icon: SmartphoneIcon, width: 390 },
]
export function ViewportSwitcher(
  { value, onChange, items = viewports }: { value: string; onChange: (value: string) => void; items?: ViewportItem[] },
) {
  return (
    <div
      // A phone already shows the phone layout, so the width switch only appears on wider screens.
      className='flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 max-[800px]:hidden'
      role='group'
      aria-label='Preview width'
    >
      {items.map((item) => (
        <Hint key={item.value} label={item.label}>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={item.label}
            aria-pressed={value === item.value}
            onClick={() => onChange(item.value)}
            className='text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm'
          >
            <item.Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </Button>
        </Hint>
      ))}
    </div>
  )
}

export function StudioActions(
  { codeView, install, onToggleCode }: { codeView: boolean; install: boolean; onToggleCode: () => void },
) {
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
      {install && <TemplateInstall />}
    </div>
  )
}
