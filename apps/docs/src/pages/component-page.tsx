import { MaximizeIcon } from 'lucide-react'
import { type ComponentType, lazy, type ReactNode, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { LoadingState } from '@dir/ui/components/ui/loading-state.tsx'
import { apiIdsFor, componentDescriptions, componentTitles } from '../navigation.ts'
import { landingHref } from '../routes.ts'
import { type ComponentApi, type ComponentDoc, exampleModules } from '../examples/index.ts'
import { exampleSources } from '../examples/sources.ts'
import { ApiReference, Usage } from './catalog/api-reference.tsx'
import { CodeLines, CopyCodeButton, PreviewCode } from './catalog/code-block.tsx'
import { InstallCommand, MarkdownLink } from './catalog/install-command.tsx'
import { frameViewports, ViewportSwitcher } from './catalog/studio-controls.tsx'

/** Displayed code is the example function with the top-level declarations and imports it uses, in shadcn's `@/` form. */
export function exampleSource(source: string, name: string) {
  const blocks: { kind: string; name: string; text: string }[] = []
  for (const line of source.split('\n')) {
    const head = line.match(/^(import|export function|export const|const|function|type) (\w+)?/)
    if (head) blocks.push({ kind: head[1]!, name: head[2] ?? '', text: line })
    else if (blocks.length) blocks[blocks.length - 1]!.text += '\n' + line
  }
  const main = blocks.find((block) => block.kind === 'export function' && block.name === name)
  if (!main) return ''
  const uses = (text: string, word: string) => new RegExp(`\\b${word}\\b`).test(text)
  const picked = [main]
  for (const block of [...blocks].reverse()) {
    if (block.kind === 'const' || block.kind === 'type' || block.kind === 'function') {
      if (picked.some((other) => other !== block && uses(other.text, block.name))) picked.unshift(block)
    }
  }
  const code = picked.map((block) => (block === main ? block.text : block.text.replace(/^export /, '')).trimEnd())
    .join('\n\n')
  const imports = blocks.filter((block) => block.kind === 'import').map((block) =>
    block.text.replace(/'@dir\/ui\/(components|hooks|lib)\//, "'@/$1/").replace("'@dir/crm/", "'@/components/crm/")
      .trimEnd()
  ).filter((text) => {
    const names = text.match(/\{([^}]*)\}/s)?.[1]?.split(',').map((n) =>
      n.trim().replace(/^type /, '').split(' as ').pop()!
    ) ?? []
    const whole = text.match(/^import (\w+)(?:,| from)/)?.[1]
    return (whole && uses(code, whole)) || names.some((n) => n && uses(code, n))
  })
  return `${imports.join('\n')}\n\n${code}\n`
}
function Code({ children }: { children: ReactNode }) {
  return (
    <span>
      {String(children).split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith('`')
          ? <code key={i} className='rounded bg-muted px-1 py-0.5 text-[12.5px]'>{part.slice(1, -1)}</code>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}
/** Theme and dark mode of the docs page, so a framed example reloads with the same look. */
export function useDocumentTheme() {
  const read = () => {
    const { uiTheme = 'light', uiThemeColor = 'neutral' } = document.documentElement.dataset
    return { theme: uiTheme, color: uiThemeColor }
  }
  const [theme, setTheme] = useState(read)
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-ui-theme', 'data-ui-theme-color'],
    })
    return () => observer.disconnect()
  }, [])
  return theme
}
/** URL that renders one example alone at the full window size, in the given theme. */
export function embedHref(id: string, name: string, { theme, color }: { theme: string; color: string }) {
  const url = new URL(landingHref(id))
  url.searchParams.set('embed', name)
  url.searchParams.set('theme', theme)
  url.searchParams.set('color', color)
  return url.href
}
/** Renders the example in an iframe at a real viewport width, so phone breakpoints apply; `fill` stretches it to the stage height. */
export function FrameCanvas(
  { id, name, viewport, fill }: { id: string; name: string; viewport: string; fill?: boolean },
) {
  const stage = useRef<HTMLDivElement>(null), [available, setAvailable] = useState({ width: 800, height: 640 })
  const inset = 32
  const theme = useDocumentTheme()
  useLayoutEffect(() => {
    const element = stage.current
    if (!element) return
    const observer = new ResizeObserver(() =>
      setAvailable({ width: element.clientWidth - inset, height: element.clientHeight - inset })
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [inset])
  // A full-height desktop frame grows to the stage width so it fills the screen; phone and tablet keep their width.
  const preset = frameViewports.find((item) => item.value === viewport)!.width
  const width = fill && viewport === 'desktop' ? Math.max(preset, available.width) : preset
  const scale = Math.min(1, available.width / width)
  const height = fill ? Math.max(available.height, 320) / scale : viewport === 'phone' ? 760 : 640
  const src = embedHref(id, name, theme)
  return (
    <div
      ref={stage}
      className={`flex justify-center bg-background ${fill ? 'min-h-0 flex-1 overflow-hidden p-4' : 'p-4'}`}
    >
      <div style={{ width: width * scale, height: height * scale }}>
        <iframe
          key={src}
          title={`${name} at ${width}px`}
          src={src}
          className='origin-top-left rounded-lg border border-border bg-background'
          style={{ width, height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  )
}
/** Opens a preview alone at the full window size, in a new tab. */
export function FullScreenLink({ href }: { href: string }) {
  return (
    <Button
      variant='outline'
      size='sm'
      nativeButton={false}
      render={<a href={href} target='_blank' rel='noopener' />}
      className='gap-1.5 no-underline'
    >
      <MaximizeIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      <span className='max-[700px]:hidden'>Full screen</span>
    </Button>
  )
}
function FrameStage({ id, name }: { id: string; name: string }) {
  const [viewport, setViewport] = useState(() => matchMedia('(max-width: 800px)').matches ? 'phone' : 'desktop')
  const width = frameViewports.find((item) => item.value === viewport)!.width
  const theme = useDocumentTheme()
  return (
    <>
      <div className='flex h-11 items-center justify-between gap-2 border-b border-border bg-background px-3'>
        <ViewportSwitcher value={viewport} onChange={setViewport} items={frameViewports} />
        <span className='flex items-center gap-3'>
          <span className='text-[12px] text-muted-foreground tabular-nums'>{width}px</span>
          <FullScreenLink href={embedHref(id, name, theme)} />
        </span>
      </div>
      <FrameCanvas id={id} name={name} viewport={viewport} />
    </>
  )
}
function Preview(
  { children, code, align = 'center', frame }: {
    children: ReactNode
    code: string
    align?: 'center' | 'stretch'
    frame?: { id: string; name: string }
  },
) {
  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      {frame ? <FrameStage {...frame} /> : (
        <div
          className={`flex min-h-[280px] bg-background p-8 max-[600px]:p-4 ${
            align === 'center' ? 'items-center justify-center' : 'items-stretch [&>*]:w-full'
          }`}
        >
          {children}
        </div>
      )}
      {code && <PreviewCode code={code} />}
    </div>
  )
}
const pages: Record<string, ComponentType<{ id: string; docsOnly?: boolean }>> = {}
function pageFor(id: string) {
  pages[id] ??= lazy(() =>
    exampleModules[id]!().then((module) => ({
      default: ({ docsOnly }: { docsOnly?: boolean }) => (
        <Body id={id} doc={module.doc} source={exampleSources[id] ?? ''} docsOnly={docsOnly} />
      ),
    }))
  )
  return pages[id]!
}
/** `docsOnly` drops the hero preview and the page outline, for layouts whose preview has its own view. */
function Body({ id, doc, source, docsOnly }: { id: string; doc: ComponentDoc; source: string; docsOnly?: boolean }) {
  const Hero = doc.hero
  const apis = apiIdsFor(id)
  const sections = [
    { id: 'installation', title: 'Installation' },
    ...(apis.length || doc.api ? [{ id: 'usage', title: 'Usage' }] : []),
    ...doc.sections.map((section) => ({ id: section.id, title: section.title })),
    ...(apis.length || doc.api ? [{ id: 'api', title: 'API Reference' }] : []),
  ]
  return (
    <div
      className={`grid gap-10 ${docsOnly ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_180px] max-[1200px]:grid-cols-1'}`}
    >
      <article className='flex min-w-0 flex-col gap-10 pb-16 [&_h2]:m-0 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_section]:scroll-mt-[calc(var(--docs-header-height)+24px)]'>
        <header className='flex flex-col gap-2'>
          <div className='flex items-start justify-between gap-4'>
            <h1 className='m-0 text-[28px] leading-tight font-semibold tracking-tight max-[700px]:text-[24px]'>
              {componentTitles[id]}
            </h1>
            <MarkdownLink markdown={landingHref(id) + '.md'} />
          </div>
          <p className='m-0 text-[15px] leading-6 text-muted-foreground'>{componentDescriptions[id]}</p>
        </header>
        {!docsOnly && (
          <Preview
            code={exampleSource(source, doc.hero.name)}
            align={doc.heroAlign}
            frame={doc.frames ? { id, name: doc.hero.name } : undefined}
          >
            <Hero />
          </Preview>
        )}
        <section id='installation' className='flex flex-col gap-4'>
          <h2>Installation</h2>
          <InstallCommand item={id} />
        </section>
        {apis.length > 0 && (
          <div className='[&_section]:mt-0 [&_h2]:mb-4 [&_h2]:text-[18px]!'>
            <Usage id={apis[0]!} />
          </div>
        )}
        {doc.api && (
          <section id='usage' className='flex flex-col gap-4'>
            <h2>Usage</h2>
            <CodeLines
              code={doc.api.usage}
              numbers={false}
              className='overflow-auto rounded-lg border border-border bg-(--ui-hover)'
            />
          </section>
        )}
        {doc.sections.map((section) => {
          const Example = section.example
          return (
            <section key={section.id} id={section.id} className='flex flex-col gap-4'>
              <h2>{section.title}</h2>
              {section.description && (
                <p className='m-0 text-[14px] leading-6 text-muted-foreground'>
                  <Code>{section.description}</Code>
                </p>
              )}
              {section.code === false
                ? <Example />
                : docsOnly
                ? (
                  <div className='relative max-h-[480px] overflow-auto rounded-lg border border-border bg-(--ui-hover)'>
                    <CodeLines code={exampleSource(source, Example.name)} />
                    <CopyCodeButton
                      code={exampleSource(source, Example.name)}
                      className='absolute top-2.5 right-2.5 bg-(--ui-hover)'
                    />
                  </div>
                )
                : (
                  <Preview
                    code={exampleSource(source, Example.name)}
                    align={section.align}
                    frame={doc.frames ? { id, name: Example.name } : undefined}
                  >
                    <Example />
                  </Preview>
                )}
            </section>
          )
        })}
        {apis.length > 0 && (
          <div className='[&_section]:mt-0 [&_section]:border-t-0 [&_section]:pt-0 [&_h2]:mb-4 [&_h2]:text-[18px]!'>
            <ApiReference ids={apis} />
          </div>
        )}
        {doc.api && <PropsTable api={doc.api} />}
      </article>
      {!docsOnly && (
        <aside
          aria-label='On this page'
          className='sticky top-[calc(var(--docs-header-height)+40px)] flex flex-col gap-2 self-start text-[12px] leading-5 text-muted-foreground max-[1200px]:hidden [&_a]:no-underline [&_a:hover]:text-foreground'
        >
          <strong className='font-medium text-foreground'>On this page</strong>
          {sections.map((section) => <a key={section.id} href={`${landingHref(id)}#${section.id}`}>{section.title}</a>)}
        </aside>
      )}
    </div>
  )
}
function PropsTable({ api }: { api: ComponentApi }) {
  return (
    <section id='api' className='flex flex-col gap-4'>
      <h2>API Reference</h2>
      <div className='overflow-auto rounded-lg border border-border'>
        <table className='w-full border-collapse text-left text-[13px] leading-6 [&_td]:border-t [&_td]:border-border [&_td]:p-3 [&_td]:align-top [&_th]:p-3 [&_th]:font-medium [&_th]:text-muted-foreground'>
          <thead className='bg-muted/40'>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {api.props.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className='text-xs'>{prop.name}</code>
                </td>
                <td>
                  <code className='text-xs [overflow-wrap:anywhere]'>{prop.type}</code>
                </td>
                <td>
                  <code className='text-xs'>{prop.default ?? '—'}</code>
                </td>
                <td className='text-muted-foreground'>{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export function ComponentDocPage({ id, docsOnly }: { id: string; docsOnly?: boolean }) {
  const Page = pageFor(id)
  return (
    <Suspense fallback={<LoadingState label='Loading page' />}>
      <Page id={id} docsOnly={docsOnly} />
    </Suspense>
  )
}
