/** Canonical paths describe the default shadcn layout, never a fixed host source root. */
export function installPath(path: string): string {
  if (/^(components|hooks|lib)\//.test(path)) return path
  if (path.startsWith('examples/')) return `components/${path.slice('examples/'.length)}`
  if (path === 'LICENSE' || path.startsWith('THIRD_PARTY_LICENSES/')) return `licenses/dir-ui/${path}`
  throw new Error(`No installation path for ${path}`)
}
export function targetPath(path: string): string {
  const installed = installPath(path)
  if (installed.startsWith('components/ui/')) return `@ui/${installed.slice('components/ui/'.length)}`
  for (const kind of ['components', 'hooks', 'lib']) {
    if (installed.startsWith(`${kind}/`)) return `@${kind}/${installed.slice(kind.length + 1)}`
  }
  return `~/${installed}`
}
export function originalPath(path: string): string {
  if (path.startsWith('components/crm/')) return `examples/${path.slice('components/'.length)}`
  if (path.startsWith('licenses/dir-ui/')) return path.slice('licenses/dir-ui/'.length)
  return path
}
export const registrySourcePath = (path: string) => `registry/source/${installPath(path)}`
function normalize(path: string): string {
  const parts: string[] = []
  for (const part of path.split('/')) {
    if (part === '..') {
      if (!parts.length) throw new Error(`Escaping source: ${path}`)
      parts.pop()
    } else if (part !== '.' && part) parts.push(part)
  }
  return parts.join('/')
}
/** The CLI transforms canonical shadcn imports to the consumer's configured aliases. */
export function installSource(path: string, source: string): string {
  const style = path.startsWith('components/ui/') && path.endsWith('.tsx')
    ? '@/components/ui/dir-theme.css'
    : path === 'components/record-list/record-table.tsx'
    ? '@/components/ui/data-grid.css'
    : undefined
  if (style) {
    const statement = `import '${style}'\n`
    source = source.startsWith("'use client'\n")
      ? source.replace("'use client'\n", "'use client'\n" + statement)
      : statement + source
  }

  return source.replace(
    /((?:\bfrom\s*|\bimport\s*(?:\(\s*)?)['"])(\.[^'"]+)(['"])/g,
    (_match, prefix: string, specifier: string, quote: string) => {
      const dependency = normalize([...path.split('/').slice(0, -1), specifier].join('/'))
      // Relative CSS imports stay colocated; TS imports use canonical shadcn prefixes.
      if (path.endsWith('.css')) return prefix + specifier + quote
      return prefix + '@/' + installPath(dependency) + quote
    },
  )
}
export const installSnippet = (source: string) =>
  source.replace(
    /(['"])\.\/(components|hooks|lib|examples)\/([^'"]+)\1/g,
    (_match, quote, directory, rest) => `${quote}@/${installPath(`${directory}/${rest}`)}${quote}`,
  )
