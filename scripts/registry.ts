/** Each source file has one owning item. Consumers compose items through registryDependencies. */
import { dirname, relative, resolve } from 'node:path'
import { sourcePath, targetPath } from '../registry/paths.ts'
import { projectName, registryAddress, siteUrl } from '../registry/catalog.ts'
import postcss, { type Container } from 'postcss'
export const root = resolve(import.meta.dirname!, '..')
export type Entry = {
  title: string
  files: string[]
  styles?: string[]
  type?: string
  dependencies?: string[]
  registryDependencies?: string[]
}
export function imports(source: string): string[] {
  return [...source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]!)
}
const official: Record<string, string> = {
  'packages/ui/src/components/ui/label.tsx': 'label',
  'packages/ui/src/components/ui/separator.tsx': 'separator',
  'packages/ui/src/components/ui/skeleton.tsx': 'skeleton',
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
        if (specifier.startsWith('.') || specifier.startsWith('@/')) {
          const dependency = specifier.startsWith('@/')
            ? sourcePath(specifier)
            : relative(root, resolve(root, dirname(path), specifier)).replaceAll('\\', '/')
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
      ...(entry.styles?.length ? { css: await registryCss(entry.styles) } : {}),
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
        path,
        type: path.startsWith('packages/ui/src/components/ui/') && !path.endsWith('.css')
          ? 'registry:ui'
          : path.startsWith('packages/ui/src/hooks/')
          ? 'registry:hook'
          : path.startsWith('packages/ui/src/lib/')
          ? 'registry:lib'
          : path.startsWith('packages/ui/src/components/') && !path.endsWith('.css') || path.startsWith('examples/')
          ? 'registry:component'
          : 'registry:file',
        target: targetPath(path),
      })),
    })
  }
  return { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'dir-ui', homepage: siteUrl, items }
}
/** Local test payloads embed the exact original bytes; GitHub reads these same files directly. */
export async function registrySources(registry: Awaited<ReturnType<typeof makeRegistry>>) {
  const output = new Map<string, string>()
  for (const file of registry.items.flatMap((item) => item.files)) {
    output.set(file.path, await Deno.readTextFile(resolve(root, file.path)))
  }
  return output
}

/** Derive shadcn CSS metadata from the stylesheet also consumed by workspace apps. */
export async function registryCss(paths: string[]) {
  const rules: Record<string, unknown> = {}
  function collect(container: Container, into: Record<string, unknown>) {
    for (const node of container.nodes ?? []) {
      if (node.type === 'decl') into[node.prop] = node.value + (node.important ? ' !important' : '')
      else if (node.type === 'rule' || node.type === 'atrule') {
        const key = node.type === 'rule' ? node.selector : `@${node.name}${node.params ? ' ' + node.params : ''}`
        const nested = (into[key] ??= {}) as Record<string, unknown>
        collect(node, nested)
      }
    }
  }
  for (const path of paths) collect(postcss.parse(await Deno.readTextFile(resolve(root, path))), rules)
  return rules
}

if (import.meta.main) {
  const registry = await makeRegistry(), content = JSON.stringify(registry, null, 2) + '\n'
  if (Deno.args.includes('--check')) {
    if (await Deno.readTextFile(resolve(root, 'registry.json')) !== content) throw new Error('Stale registry.json')
  } else await Deno.writeTextFile(resolve(root, 'registry.json'), content)
  console.log(`${registry.items.length} registry items reference authored workspace files directly.`)
}
