/** Build the source registry and self-contained items from the same files used by the landing. */
import { dirname, relative, resolve } from 'node:path'
import { projectName, siteUrl } from '../registry/catalog.ts'
import { templates } from '../examples/catalog.ts'
import { specs } from '../landing/src/pages/catalog/playground/specs.ts'
import { componentApi } from '../landing/src/pages/catalog/api-data.ts'

export const root = resolve(import.meta.dirname!, '..')
const allowed = ['components/', 'lib/', 'styles/', 'examples/']
export function imports(source: string): string[] {
  return [...source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)].map((match) => match[1]!)
}
export async function closure(entries: string[]) {
  const files = new Set<string>(), packages = new Set<string>()
  async function visit(path: string) {
    if (files.has(path)) return
    if (!allowed.some((prefix) => path.startsWith(prefix))) {
      throw new Error(`Library dependency escapes public source: ${path}`)
    }
    const content = await Deno.readTextFile(resolve(root, path))
    files.add(path)
    if (/\.jsx?$/.test(path)) {
      const declaration = path.replace(/\.jsx?$/, '.d.ts')
      try {
        await Deno.stat(resolve(root, declaration))
        await visit(declaration)
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) throw error
      }
    }
    for (const specifier of imports(content)) {
      if (specifier.startsWith('.')) {
        await visit(relative(root, resolve(root, dirname(path), specifier)).replaceAll('\\', '/'))
      } else {
        if (specifier.startsWith('@dir/') || specifier.startsWith('node:')) {
          throw new Error(`Host dependency: ${specifier}`)
        }
        packages.add(specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!)
      }
    }
  }
  for (const entry of entries) await visit(entry)
  if (packages.has('react-data-grid')) await visit('styles/data-grid.css')
  await visit('styles/tailwind.css')
  return { files: [...files].sort(), packages: [...packages].sort() }
}

export async function makeRegistry() {
  const entries: Record<string, { title: string; files: string[]; type?: string; dependencies?: string[] }> = JSON
    .parse(
      await Deno.readTextFile(resolve(root, 'registry/entries.json')),
    )
  for (const spec of specs) {
    const api = componentApi[spec.id as keyof typeof componentApi]
    if (!api) throw new Error(`Missing API for ${spec.id}`)
    const existing = entries[spec.id]
    if (existing) {
      if (api.path.startsWith('components/') && !existing.files.includes(api.path)) existing.files.push(api.path)
      continue
    }
    entries[spec.id] = {
      title: spec.title,
      files: api.path.startsWith('components/') ? [api.path] : ['styles/tailwind.css'],
      dependencies: spec.id === 'radio' ? ['@base-ui/react'] : [],
    }
  }
  for (const template of templates) {
    const entry = entries[template.registryItem]
    if (!entry?.files.includes(template.entry) || entry.type !== 'registry:block') {
      throw new Error(`Invalid template: ${template.id}`)
    }
  }
  const { imports: dependencies } = JSON.parse(await Deno.readTextFile(resolve(root, 'deno.json')))
  const items = []
  for (const [name, entry] of Object.entries(entries)) {
    const included = await closure(entry.files)
    const deps = [...new Set([...included.packages, ...entry.dependencies ?? [], 'tw-animate-css'])].map((name) => {
      if (name === 'react-dom') return 'react-dom@^19'
      const mapped = dependencies[name] ?? dependencies[`${name}/client`]
      if (!mapped?.startsWith('npm:')) throw new Error(`Missing public dependency: ${name}`)
      return mapped.slice(4)
    })
    items.push({
      name,
      title: entry.title,
      type: entry.type ?? 'registry:ui',
      description: `${entry.title} from ${projectName}. React 19, Base UI and Tailwind CSS 4.`,
      dependencies: deps,
      files: [...included.files, 'THIRD_PARTY_LICENSES/shadcn-ui.txt', 'LICENSE'].map((path) => ({
        path,
        type: 'registry:file',
        target: `~/lib/dir-components/${path}`,
      })),
    })
  }
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'dir-ui',
    homepage: siteUrl,
    items,
  }
}

if (import.meta.main) {
  const registry = await makeRegistry()
  const content = JSON.stringify(registry, null, 2) + '\n'
  if (Deno.args.includes('--check')) {
    if (await Deno.readTextFile(resolve(root, 'registry.json')) !== content) {
      throw new Error('registry.json is stale. Run deno task registry:generate.')
    }
  } else {
    await Deno.writeTextFile(resolve(root, 'registry.json'), content)
  }
  console.log(`${registry.items.length} registry items validated; all local dependencies are included.`)
}
