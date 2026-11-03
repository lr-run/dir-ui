import { type ComponentType, lazy, Suspense } from 'react'
import { exampleModules } from '../examples/index.ts'
import { isTheme, setThemeAttributes } from '../theme-presets.ts'

/** Renders one example alone and full screen; the frame previews load this inside an iframe. */
export function embeddedExample(): { id: string; name: string } | undefined {
  const params = new URLSearchParams(location.search)
  const name = params.get('embed')
  const id = location.pathname.split('/').filter(Boolean).at(-1)
  if (!name || !id || !exampleModules[id]) return undefined
  const theme = params.get('theme')
  if (isTheme(theme)) setThemeAttributes(theme)
  return { id, name }
}
const cache = new Map<string, ComponentType>()
function load(id: string, name: string) {
  const key = `${id}/${name}`
  if (!cache.has(key)) {
    cache.set(
      key,
      lazy(() =>
        exampleModules[id]!().then(({ doc }) => {
          const example = [doc.hero, ...doc.sections.map((section) => section.example)].find((item) =>
            item.name === name
          )
          return {
            default: example ?? (() => <p className='p-4 text-[13px] text-muted-foreground'>Example not found.</p>),
          }
        })
      ),
    )
  }
  return cache.get(key)!
}
export function EmbeddedExample({ id, name }: { id: string; name: string }) {
  const Example = load(id, name)
  return (
    <div className='h-dvh w-full overflow-hidden bg-(--ui-surface) [&>div]:h-full! [&>div]:rounded-none! [&>div]:border-0!'>
      <Suspense fallback={null}>
        <Example />
      </Suspense>
    </div>
  )
}
