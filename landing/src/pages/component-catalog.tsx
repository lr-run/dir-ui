import { pageMetadata } from '../../documentation.ts'
import { landingBaseUrl } from '../routes.ts'
import { InstallCommand, MarkdownLink } from './catalog/install-command.tsx'
import { Home } from './home.tsx'
import { landingHref, readLandingRoute } from '../routes.ts'
import { StudioActions, StudioControls } from './catalog/studio-controls.tsx'
import { DocsHeader } from './catalog/docs-header.tsx'
import { ApiReference, Usage } from './catalog/api-reference.tsx'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/button.tsx'
import { Select } from '../../../components/ui/select.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { Playground } from './catalog/playground/index.tsx'
import { specs as sections } from './catalog/playground/specs.ts'
import { categoryById, navigationGroups } from './catalog/navigation.ts'
const PreviewStudio = lazy(() =>
  import('./studio/studio-page.tsx').then((module) => ({ default: module.PreviewStudio }))
)

export function ComponentCatalog() {
  const appRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(100),
    [viewport, setViewport] = useState('responsive'),
    [previewRevision, setPreviewRevision] = useState(0)
  const [active, setActive] = useState(readLandingRoute),
    [search, setSearch] = useState(''),
    [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  useEffect(() => {
    const listener = () => setActive(readLandingRoute())
    addEventListener('popstate', listener)
    return () => removeEventListener('popstate', listener)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])
  useEffect(() => {
    const scroller = appRef.current?.closest<HTMLElement>('[data-dir-app-content="1"]')
    if (!location.hash) (scroller ?? document.scrollingElement)?.scrollTo({ top: 0 })
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
      href: new URL(
        metadata.markdown,
        landingBaseUrl(),
      ).href,
    })
  }, [active])
  const isStudio = active === 'studio' || active === 'studio-code'
  const section = sections.find((s) => s.id === active)
  const navigate = (id: string) => {
    history.pushState(null, '', landingHref(id))
    setActive(id)
  }
  const query = search.trim().toLowerCase()
  const visibleGroups = navigationGroups.map((group) => ({
    ...group,
    items: group.items.filter((spec) =>
      `${group.label} ${spec.title} ${spec.description}`.toLowerCase().includes(query)
    ),
  })).filter((group) => group.items.length)
  return (
    <div
      ref={appRef}
      className={`flex min-h-full flex-col bg-(--ui-canvas) text-foreground [--docs-header-height:56px] ${
        isStudio ? 'h-[calc(100dvh_-_var(--dir-app-shell-height,0px))] min-h-0' : ''
      } ${active === 'studio' ? 'max-[1100px]:[--docs-header-height:100px]' : ''}`}
    >
      <DocsHeader
        isStudio={isStudio}
        isHome={active === 'home'}
        dark={dark}
        onNavigate={navigate}
        onToggleTheme={() => setDark(!dark)}
        controls={active === 'studio'
          ? (
            <StudioControls
              count={count}
              viewport={viewport}
              onCountChange={setCount}
              onViewportChange={setViewport}
              onReset={() => setPreviewRevision((value) => value + 1)}
            />
          )
          : undefined}
        actions={isStudio
          ? (
            <StudioActions
              codeView={active === 'studio-code'}
              onToggleCode={() => navigate(active === 'studio-code' ? 'studio' : 'studio-code')}
            />
          )
          : undefined}
      />
      {active === 'home' ? <Home onNavigate={navigate} /> : isStudio
        ? (
          <Suspense fallback={null}>
            <PreviewStudio
              dark={dark}
              codeView={active === 'studio-code'}
              count={count}
              viewport={viewport}
              revision={previewRevision}
            />
          </Suspense>
        )
        : (
          <div className='mx-auto grid w-full max-w-[1536px] flex-1 grid-cols-[232px_minmax(0,1fr)_176px] items-start text-[13px] max-[1200px]:grid-cols-[208px_minmax(0,1fr)] max-[700px]:grid-cols-1 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-ring'>
            <aside
              className='sticky top-(--docs-header-height) max-h-[calc(100dvh_-_var(--dir-app-shell-height,0px)_-_var(--docs-header-height))] overflow-y-auto overscroll-contain px-5 pt-8 pb-12 max-[700px]:hidden [&>[data-slot=input]]:h-8 [&>[data-slot=input]]:text-xs'
              aria-label='Component navigation'
            >
              <Input
                aria-label='Search components'
                placeholder='Search components…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {visibleGroups.map((group) => (
                <nav
                  key={group.label}
                  className='mt-7 space-y-0.5'
                  aria-label={group.label}
                >
                  <h3 className='mb-2 px-2.5 text-xs leading-5 font-medium text-foreground'>{group.label}</h3>
                  {group.items.map((s) => (
                    <a
                      key={s.id}
                      className='block rounded-md px-2.5 py-1.5 text-[13px] leading-5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground'
                      href={landingHref(s.id)}
                      aria-current={active === s.id ? 'page' : undefined}
                      onClick={(event) => {
                        if (
                          event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey
                        ) return
                        event.preventDefault()
                        navigate(s.id)
                      }}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              ))}
              {!visibleGroups.length && (
                <p className='text-muted-foreground text-[12px] leading-[1.6] m-0'>No components found.</p>
              )}
            </aside>
            <div className='hidden [@media(max-width:_700px)]:block [@media(max-width:_700px)]:p-[10px_16px] [@media(max-width:_700px)]:[border-bottom:1px_solid_var(--ui-border)] [@media(max-width:_700px)]:[&>button]:w-full'>
              <Select
                label='Component'
                items={navigationGroups.flatMap((group) =>
                  group.items.map((s) => ({
                    value: s.id,
                    label: `${group.label} · ${s.title}`,
                  }))
                )}
                value={active}
                onChange={navigate}
              />
            </div>
            <main
              className='mx-auto w-full min-w-0 max-w-[880px] px-10 pt-10 pb-0 max-[1200px]:px-8 max-[700px]:px-5 max-[700px]:pt-7'
              key={active}
            >
              {section
                ? (
                  <>
                    <header className='mb-8 [&_h1]:mt-3 [&_h1]:mb-3 [&_h1]:text-[32px] [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:tracking-tight [&_p]:m-0 [&_p]:max-w-[680px] [&_p]:text-[15px] [&_p]:leading-7 [&_p]:text-muted-foreground max-[700px]:[&_h1]:text-[28px]'>
                      <div>
                        <div className='text-xs font-medium text-muted-foreground'>
                          {categoryById.get(section.id)}
                        </div>
                        <div className='flex items-center justify-between gap-4'>
                          <h1>{section.title}</h1>
                          <MarkdownLink markdown={landingHref(section.id) + '.md'} />
                        </div>
                        <p>{section.description}</p>
                      </div>
                    </header>
                    <Playground key={active} spec={section} />
                    <section id='installation' className='mt-12 scroll-mt-[calc(var(--docs-header-height)+24px)]'>
                      <h2 className='mb-5 text-xl font-semibold tracking-tight'>Installation</h2>
                      <InstallCommand item={section.id} />
                    </section>
                    <Usage id={active} />
                    <ApiReference id={active} />
                    <footer className='flex justify-between gap-[16px] p-[24px_0_30px] [border-top:1px_solid_var(--ui-border)] text-[11px] text-muted-foreground [@media(max-width:700px)]:flex-col [@media(max-width:700px)]:gap-[6px]'>
                      <span>dir/ui</span>
                      <span>Base UI · React Hook Form · Recharts</span>
                    </footer>
                  </>
                )
                : (
                  <div className='m-[44px_0] pt-[24px] [border-top:1px_solid_var(--ui-border)] [scroll-margin-top:24px] [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:mb-[14px] [&_p]:text-[13px] [&_p]:text-muted-foreground [&_p]:leading-[1.9] [&_p]:m-[8px_0]'>
                    <h1>Component not found</h1>
                    <Button onClick={() => navigate('input')}>Back to Input</Button>
                  </div>
                )}
            </main>
            <aside
              aria-label='On this page'
              className='sticky top-(--docs-header-height) flex flex-col items-start gap-3 px-4 pt-11 text-xs leading-5 text-muted-foreground max-[1200px]:hidden [&_a]:no-underline [&_a:hover]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground'
            >
              <strong>On this page</strong>
              <a href={`${landingHref(active)}#preview`}>Preview</a>
              <a href={`${landingHref(active)}#props`}>Props</a>
              <a href={`${landingHref(active)}#installation`}>Installation</a>
              <a href={`${landingHref(active)}#usage`}>Usage</a>
              <a href={`${landingHref(active)}#api`}>API Reference</a>
            </aside>
          </div>
        )}
    </div>
  )
}
