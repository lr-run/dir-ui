import { lazy, Suspense, useEffect, useState } from 'react'
import { BookOpenIcon, MonitorIcon } from 'lucide-react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { LoadingState } from '@dir/ui/components/ui/loading-state.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { TabBar } from '@dir/ui/components/ui/tab-bar.tsx'
import { componentTitles, layoutIds } from '../navigation.ts'
import { exampleModules } from '../examples/index.ts'
import { frameViewports, ViewportSwitcher } from './catalog/studio-controls.tsx'
import { ComponentDocPage, embedHref, FrameCanvas, FullScreenLink, useDocumentTheme } from './component-page.tsx'
const LayoutsPage = lazy(() => import('./layouts.tsx'))

/** Examples a layout can preview: the hero first, then each section. */
function useExamples(id: string) {
  const [examples, setExamples] = useState<{ value: string; label: string }[]>([])
  useEffect(() => {
    let current = true
    exampleModules[id]?.().then(({ doc }) => {
      if (!current) return
      setExamples([
        { value: doc.hero.name, label: 'Default' },
        ...doc.sections.map((section) => ({ value: section.example.name, label: section.title })),
      ])
    })
    return () => {
      current = false
    }
  }, [id])
  return examples
}

/** Layouts tab: full-width preview with tabs per layout; the documentation is one button away. */
export function LayoutWorkspace({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const isLayout = layoutIds.includes(active)
  const [docs, setDocs] = useState(false), [viewport, setViewport] = useState('desktop')
  const examples = useExamples(active)
  const [example, setExample] = useState('')
  const name = examples.some((item) => item.value === example) ? example : examples[0]?.value
  const preview = isLayout && !docs
  const theme = useDocumentTheme()
  return (
    <div
      // The preview fills the layout's panel and never grows with its frame, so only the frame scrolls.
      className={`flex w-full flex-col ${preview ? 'h-full min-h-[480px] flex-none overflow-hidden' : 'flex-1'}`}
    >
      <TabBar
        label='Layouts'
        items={['layouts', ...layoutIds].map((id) => ({
          value: id,
          label: id === 'layouts' ? 'Overview' : componentTitles[id],
        }))}
        value={active}
        onValueChange={onNavigate}
        className={`max-[900px]:flex-wrap max-[900px]:pb-2 ${preview ? '' : 'sticky top-0 z-10 bg-(--ui-surface)'}`}
        actions={isLayout && (
          <div className='flex items-center gap-2'>
            {preview && examples.length > 1 && (
              <div className='w-[160px] [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=select-trigger]]:w-full'>
                <Select label='Example' items={examples} value={name ?? ''} onChange={setExample} />
              </div>
            )}
            {preview && <ViewportSwitcher value={viewport} onChange={setViewport} items={frameViewports} />}
            {preview && name && <FullScreenLink href={embedHref(active, name, theme)} />}
            <Button
              variant='outline'
              size='sm'
              aria-pressed={docs}
              onClick={() => setDocs(!docs)}
              className='gap-1.5'
            >
              {docs
                ? <MonitorIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                : <BookOpenIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
              {docs ? 'Preview' : 'Docs'}
            </Button>
          </div>
        )}
      />
      {preview
        ? name
          ? <FrameCanvas key={active} id={active} name={name} viewport={viewport} fill />
          : <LoadingState label='Loading preview' />
        : (
          <main
            className={`mx-auto w-full ${
              isLayout ? 'max-w-[880px]' : 'max-w-[1120px]'
            } min-w-0 px-10 pt-10 text-[13px] max-[1200px]:px-8 max-[700px]:px-5 max-[700px]:pt-7`}
          >
            <Suspense fallback={<LoadingState label='Loading page' />}>
              {isLayout
                ? <ComponentDocPage key={active} id={active} docsOnly />
                : <LayoutsPage onNavigate={onNavigate} />}
            </Suspense>
          </main>
        )}
    </div>
  )
}
