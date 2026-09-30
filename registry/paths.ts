import { templates } from './templates.ts'

/** Repository source and consumer installation paths are intentionally independent. */
export function installPath(path: string): string {
  if (path.startsWith('packages/ui/src/')) return path.slice('packages/ui/src/'.length)
  const example = path.match(/^examples\/([^/]+)\/src(?:\/(.*))?$/)
  if (example) return `components/${example[1]}${example[2] ? '/' + example[2] : ''}`
  if (/^(components|hooks|lib)\//.test(path)) return path
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
/** Resolve the standard shadcn import slots back to authored workspace source. */
export function sourcePath(path: string): string {
  const canonical = path.replace(/^@\//, '')
  for (const template of templates) {
    const prefix = `components/${template.id}/`
    if (canonical.startsWith(prefix)) return `${template.sourceDirectory}/${canonical.slice(prefix.length)}`
  }
  if (/^(components|hooks|lib)\//.test(canonical)) return `packages/ui/src/${canonical}`
  return canonical
}
export const installSnippet = (source: string) =>
  source.replace(
    /(['"])\.\/(components|hooks|lib)\/([^'"]+)\1/g,
    (_match, quote, directory, rest) => `${quote}@/${directory}/${rest}${quote}`,
  )
