import { lazy, Suspense } from 'react'
import { RefreshCwIcon } from 'lucide-react'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { TabBar } from '@dir/ui/components/ui/tab-bar.tsx'
import { exampleRoute, recipes } from '../navigation.ts'
import { StudioActions, ViewportSwitcher } from './catalog/studio-controls.tsx'
import { FullScreenLink } from './component-page.tsx'
import { examplePreviewUrl } from './studio/preview-url.ts'
const PreviewStudio = lazy(() => import('./studio/studio-page.tsx').then((m) => ({ default: m.PreviewStudio })))

/** Examples tab, arranged like Layouts: example tabs on the left, preview controls on the right, the app below. */
export function ExampleWorkspace(
  { example, code, theme, count, viewport, revision, onNavigate, onCountChange, onViewportChange, onReset }: {
    example: string
    code: boolean
    theme: string
    count: number
    viewport: string
    revision: number
    onNavigate: (id: string) => void
    onCountChange: (count: number) => void
    onViewportChange: (viewport: string) => void
    onReset: () => void
  },
) {
  return (
    <div className='flex h-full min-h-0 w-full flex-1 flex-col'>
      <TabBar
        label='Examples'
        items={recipes.map((recipe) => ({ value: recipe.slug, label: recipe.short }))}
        value={example}
        onValueChange={(next) => onNavigate(exampleRoute(next, code))}
        className='max-[1100px]:flex-wrap max-[1100px]:pb-2'
        actions={
          <div className='flex items-center gap-2'>
            {!code && (
              <>
                <div className='w-[128px] [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=select-trigger]]:w-full'>
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
                <ViewportSwitcher value={viewport} onChange={onViewportChange} />
                <IconButton label='Reset preview' variant='ghost' onClick={onReset}>
                  <RefreshCwIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                </IconButton>
                <FullScreenLink href={examplePreviewUrl(example, count, theme)} />
              </>
            )}
            <StudioActions
              codeView={code}
              install={example === 'crm'}
              onToggleCode={() => onNavigate(exampleRoute(example, !code))}
            />
          </div>
        }
      />
      <Suspense fallback={null}>
        <PreviewStudio
          key={example}
          example={example}
          theme={theme}
          codeView={code}
          count={count}
          viewport={viewport}
          revision={revision}
        />
      </Suspense>
    </div>
  )
}
