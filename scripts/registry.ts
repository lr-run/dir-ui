/** Each source file has one owning item. Consumers compose items through registryDependencies. */
import { dirname, relative, resolve } from 'node:path'
import { installSource, originalPath, registrySourcePath, targetPath } from '../registry/paths.ts'
import { projectName, registryAddress, siteUrl } from '../registry/catalog.ts'
export const root = resolve(import.meta.dirname!, '..')
export type Entry = {
  title: string
  files: string[]
  type?: string
  dependencies?: string[]
  registryDependencies?: string[]
}
export function imports(source: string): string[] {
  return [...source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]!)
}
const official: Record<string, string> = {
  'components/ui/label.tsx': 'label',
  'components/ui/separator.tsx': 'separator',
  'components/ui/skeleton.tsx': 'skeleton',
}
export async function makeRegistry() {
  const entries: Record<string, Entry> = JSON.parse(await Deno.readTextFile(resolve(root, 'registry/entries.json')))
  const owners = new Map<string, string>()
  for (const [name, entry] of Object.entries(entries)) {
    for (const path of entry.files) {
      if (owners.has(path)) throw new Error(`Duplicate source ownership: ${path}`)
      owners.set(path, name)
    }
  }
  const { imports: versions } = JSON.parse(await Deno.readTextFile(resolve(root, 'deno.json')))
  const items = []
  for (const [name, entry] of Object.entries(entries)) {
    const packages = new Set(entry.dependencies ?? []), dependencies = new Set(entry.registryDependencies ?? [])
    for (const path of entry.files) {
      const content = await Deno.readTextFile(resolve(root, path))
      for (const specifier of imports(content)) {
        if (specifier.startsWith('.')) {
          const dependency = relative(root, resolve(root, dirname(path), specifier)).replaceAll('\\', '/')
          const owner = owners.get(dependency)
          if (official[dependency]) dependencies.add(official[dependency]!)
          else if (!owner) throw new Error(`Unowned dependency: ${path} -> ${dependency}`)
          else if (owner !== name) dependencies.add(`@dir/${owner}`)
        } else {
          if (/^(node:|@dir\/)/.test(specifier)) throw new Error(`Host dependency: ${specifier}`)
          packages.add(
            specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!,
          )
        }
      }
    }
    items.push({
      name,
      title: entry.title,
      type: entry.type ?? 'registry:ui',
      description: `${entry.title} from ${projectName}. React 19, Base UI and Tailwind CSS 4.`,
      dependencies: [...packages].sort().map((pkg) => {
        if (pkg === 'react-dom') return 'react-dom@^19'
        const mapped = versions[pkg] ?? versions[`${pkg}/client`]
        if (!mapped?.startsWith('npm:')) throw new Error(`Missing package version: ${pkg}`)
        return mapped.slice(4)
      }),
      registryDependencies: [...dependencies].sort().map((dependency) =>
        dependency.startsWith('@dir/') ? registryAddress(dependency.slice(5)) : dependency
      ),
      files: entry.files.map((path) => ({
        path: registrySourcePath(path),
        type: path.startsWith('components/ui/') && !path.endsWith('.css')
          ? 'registry:ui'
          : path.startsWith('hooks/')
          ? 'registry:hook'
          : path.startsWith('lib/')
          ? 'registry:lib'
          : path.startsWith('components/') && !path.endsWith('.css') || path.startsWith('examples/')
          ? 'registry:component'
          : 'registry:file',
        target: targetPath(path),
      })),
    })
  }
  return { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'dir-ui', homepage: siteUrl, items }
}
export async function registrySources(registry: Awaited<ReturnType<typeof makeRegistry>>) {
  const output = new Map<string, string>()
  for (const destination of new Set(registry.items.flatMap((item) => item.files.map((file) => file.path)))) {
    const path = originalPath(destination.slice('registry/source/'.length))
    output.set(destination, installSource(path, await Deno.readTextFile(resolve(root, path))))
  }
  return output
}
export async function* generatedFiles(directory: string): AsyncGenerator<string> {
  try {
    for await (const entry of Deno.readDir(resolve(root, directory))) {
      const path = `${directory}/${entry.name}`
      if (entry.isSymlink) throw new Error(`Unexpected symlink: ${path}`)
      if (entry.isDirectory) yield* generatedFiles(path)
      else yield path
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error
  }
}
if (import.meta.main) {
  const registry = await makeRegistry(), sources = await registrySources(registry)
  for await (const path of generatedFiles('registry/source')) {
    if (sources.has(path)) continue
    if (Deno.args.includes('--check')) throw new Error(`Obsolete generated source: ${path}`)
    await Deno.remove(resolve(root, path))
  }
  sources.set('registry.json', JSON.stringify(registry, null, 2) + '\n')
  for (const [path, content] of sources) {
    if (Deno.args.includes('--check')) {
      if (await Deno.readTextFile(resolve(root, path)) !== content) throw new Error(`Stale registry source: ${path}`)
    } else {
      if (path !== 'registry.json') await Deno.mkdir(dirname(resolve(root, path)), { recursive: true })
      await Deno.writeTextFile(resolve(root, path), content)
    }
  }
  console.log(`${registry.items.length} registry items validated; each source has one owner.`)
}
