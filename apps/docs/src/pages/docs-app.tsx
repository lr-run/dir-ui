import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import {
  AppWindowIcon,
  BlocksIcon,
  LayoutTemplateIcon,
  LightbulbIcon,
  ListChecksIcon,
  MoonIcon,
  PaletteIcon,
  ScrollTextIcon,
  SunIcon,
} from 'lucide-react'
import { ShellMenuTrigger } from '@dir/ui/components/shells/shell-parts.tsx'
import { type ShellSection, SuiteShell } from '@dir/ui/components/shells/suite-shell.tsx'
import { LoadingState } from '@dir/ui/components/ui/loading-state.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { pageMetadata } from '../page-metadata.ts'
import { componentIds, docTabs, exampleOf, layoutIds, tabOf } from '../navigation.ts'
import { landingBaseUrl, landingHref, readLandingRoute } from '../routes.ts'
import { applyTheme, readTheme, type Theme, themes } from '../theme-presets.ts'
import { applyThemeColor, readThemeColor, themeColors } from '../theme-colors.ts'
import { NotFound } from './not-found.tsx'
import { ComponentDocPage } from './component-page.tsx'
import { Home } from './home.tsx'
import { ExampleWorkspace } from './example-workspace.tsx'
import { LayoutWorkspace } from './layout-workspace.tsx'
const ConceptPage = lazy(() => import('./concept.tsx'))
const FoundationPage = lazy(() => import('./foundations.tsx'))
const RulePage = lazy(() => import('./rules.tsx').then((m) => ({ default: m.RulePage })))

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const themeIcons: Record<Theme, ReactNode> = {
  light: <SunIcon {...icon} />,
  black: <MoonIcon {...icon} />,
  paper: <ScrollTextIcon {...icon} />,
}
const tabIcons: Record<string, ReactNode> = {
  concept: <LightbulbIcon {...icon} />,
  foundations: <PaletteIcon {...icon} />,
  components: <BlocksIcon {...icon} />,
  layouts: <LayoutTemplateIcon {...icon} />,
  rules: <ListChecksIcon {...icon} />,
  examples: <AppWindowIcon {...icon} />,
}
/** Header tabs of the site; Layouts and Examples switch views in their own toolbar, so they have no sidebar. */
const sections: ShellSection[] = docTabs.map((tab) => ({
  id: tab.id,
  label: tab.label,
  icon: tabIcons[tab.id],
  navigation: tab.id === 'layouts' || tab.id === 'examples' ? undefined : tab.sections?.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({ id: item.id, label: item.title, href: landingHref(item.id) })),
  })),
}))

const plainLink = (event: React.MouseEvent) =>
  !(event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)

export function DocsApp() {
  const appRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(100),
    [viewport, setViewport] = useState('responsive'),
    [previewRevision, setPreviewRevision] = useState(0)
  const [active, setActive] = useState(readLandingRoute)
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [color, setColor] = useState(readThemeColor)
  useEffect(() => {
    const listener = () => setActive(readLandingRoute())
    addEventListener('popstate', listener)
    return () => removeEventListener('popstate', listener)
  }, [])
  useEffect(() => applyTheme(theme), [theme])
  useEffect(() => applyThemeColor(color), [color])
  useEffect(() => {
    // Pages scroll inside the layout's panel; a new page starts at the top unless it links to an anchor.
    if (!location.hash) appRef.current?.parentElement?.scrollTo({ top: 0 })
  }, [active])
  useEffect(() => {
    const path = new URL(landingHref(active)).pathname.slice(new URL(landingBaseUrl()).pathname.length)
    const metadata = pageMetadata('/' + path)
    document.title = metadata.title
    const setMeta = (selector: string, tag: string, attributes: Record<string, string>) => {
      const element = document.querySelector(selector) ?? document.head.appendChild(document.createElement(tag))
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
    }
    setMeta('meta[name="description"]', 'meta', { name: 'description', content: metadata.description })
    setMeta('link[rel="canonical"]', 'link', { rel: 'canonical', href: landingHref(active) })
    setMeta('link[rel="alternate"][type="text/markdown"]', 'link', {
      rel: 'alternate',
      type: 'text/markdown',
      href: new URL(metadata.markdown, landingBaseUrl()).href,
    })
  }, [active])
  const example = exampleOf(active), isStudio = !!example
  const isComponent = componentIds.includes(active)
  const isLayouts = active === 'layouts' || layoutIds.includes(active)
  const navigate = (id: string) => {
    history.pushState(null, '', landingHref(id))
    setActive(id)
  }
  const tab = tabOf(active)
  let page: ReactNode
  if (isComponent) page = <ComponentDocPage key={active} id={active} />
  else if (active === 'concept') page = <ConceptPage />
  else if (active.startsWith('foundations/')) {
    page = (
      <FoundationPage
        key={active}
        slug={active.slice('foundations/'.length)}
        theme={theme}
        onThemeChange={setTheme}
      />
    )
  } else if (active.startsWith('rules/')) {
    page = <RulePage key={active} slug={active.slice('rules/'.length)} onNavigate={navigate} />
  } else page = <NotFound onNavigate={navigate} />
  const content = active === 'home'
    ? <Home onNavigate={navigate} />
    : isLayouts
    ? <LayoutWorkspace active={active} onNavigate={navigate} />
    : isStudio
    ? (
      <ExampleWorkspace
        example={example!.slug}
        code={example!.code}
        theme={theme}
        color={color}
        count={count}
        viewport={viewport}
        revision={previewRevision}
        onNavigate={navigate}
        onCountChange={setCount}
        onViewportChange={setViewport}
        onReset={() => setPreviewRevision((value) => value + 1)}
      />
    )
    : (
      <>
        {tab?.sections && (
          <div className='hidden h-12 items-center gap-2 border-b border-border px-4 max-[800px]:flex'>
            <ShellMenuTrigger />
            <span className='text-[13px] font-medium'>{tab.label}</span>
          </div>
        )}
        <main
          className='mx-auto w-full max-w-[1120px] min-w-0 px-10 pt-10 text-[13px] max-[1200px]:px-8 max-[700px]:px-5 max-[700px]:pt-7 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-ring'
          key={active}
        >
          <Suspense fallback={<LoadingState label='Loading page' />}>{page}</Suspense>
        </main>
      </>
    )
  return (
    // The site is built from its own layout: header tabs for each part, a sidebar per tab, the page in a panel.
    <div className='h-[calc(100dvh_-_var(--dir-app-shell-height,0px))] [--docs-header-height:0px]'>
      <SuiteShell
        brand={
          <a
            href={landingHref('home')}
            aria-label='dir/ui home'
            className='flex items-center gap-2.5 rounded-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
            onClick={(event) => {
              if (!plainLink(event)) return
              event.preventDefault()
              navigate('home')
            }}
          >
            <svg className='block size-5 shrink-0' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
              <rect x='3' y='3' width='18' height='18' rx='2' stroke='currentColor' strokeWidth='1.75' />
              <path d='M4 20 20 4v14a2 2 0 0 1-2 2H4Z' fill='currentColor' />
            </svg>
            dir/ui
          </a>
        }
        sections={sections}
        section={tab?.id ?? ''}
        onSectionChange={(id) => navigate(docTabs.find((item) => item.id === id)!.home)}
        active={active}
        onNavigate={navigate}
        trailing={
          <div className='flex items-center gap-2'>
            <Select
              label='Theme'
              items={themes.map((item) => ({ value: item.id, label: item.label, icon: themeIcons[item.id] }))}
              value={theme}
              onChange={(value) => setTheme(value as Theme)}
            />
            <Select
              label='Theme color'
              menuLabel='Theme colors'
              items={themeColors.map(([value, label, light]) => ({
                value,
                label,
                icon: (
                  <span
                    aria-hidden='true'
                    className='size-3 shrink-0 rounded-full'
                    style={{ backgroundColor: value === 'neutral' ? 'oklch(0.556 0 0)' : light }}
                  />
                ),
              }))}
              value={color}
              onChange={(value) => {
                const next = themeColors.find(([id]) => id === value)
                if (next) setColor(next[0])
              }}
            />
          </div>
        }
      >
        <div ref={appRef} className='flex h-full min-h-0 flex-col'>{content}</div>
      </SuiteShell>
    </div>
  )
}
