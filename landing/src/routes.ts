/** Landing routes are relative to the hosting base, independently of CRM iframe routes. */
const aliases: Record<string, string> = {
  examples: 'studio',
  typography: 'input',
  'record-detail': 'studio',
  'record-form': 'studio',
  'app-shell': 'studio',
  'sort-editor': 'data-grid',
  'filter-editor': 'data-grid',
  'column-settings': 'data-grid',
  'number-input': 'input',
  'money-input': 'input',
  'percent-input': 'input',
  'date-input': 'input',
  'datetime-input': 'input',
  'inline-number': 'inline-edit',
  'inline-money': 'inline-edit',
  'inline-percent': 'inline-edit',
  'inline-date': 'inline-edit',
  'inline-datetime': 'inline-edit',
  'line-chart': 'chart',
  'horizontal-bars': 'chart',
  'spark-chart': 'chart',
  'chart-frame': 'chart',
  'chart-tooltip': 'chart',
  'chart-legend': 'chart',
}
export function landingBaseUrl() {
  return document.querySelector<HTMLBaseElement>('base[href]')?.href ?? new URL('/', location.href).href
}
export function landingHref(id: string, base = landingBaseUrl()) {
  return new URL(
    id === 'home'
      ? './'
      : id === 'studio'
      ? 'examples/crm'
      : id === 'studio-code'
      ? 'examples/crm/code'
      : id === 'examples'
      ? 'examples/crm'
      : `components/${encodeURIComponent(id)}`,
    base,
  ).href
}
export function resolveLandingRoute(href: string, base: string): { id: string; canonical?: string } {
  const url = new URL(href), root = new URL(base).pathname
  if (!url.pathname.startsWith(root)) return { id: 'not-found' }
  const path = url.pathname.slice(root.length).replace(/^\/+|\/+$/g, '')
  const legacy = url.searchParams.get('component')
  let id: string
  if (legacy) id = legacy
  else if (url.searchParams.get('panel') === 'code' && !path) id = 'studio-code'
  else if (!path) id = 'home'
  else if (path === 'examples') id = 'studio'
  else if (path === 'examples/crm') id = 'studio'
  else if ((path === 'examples/code' || path === 'examples/crm/code')) id = 'studio-code'
  else if (path === 'components') id = 'button'
  else if (/^components\/[^/]+$/.test(path)) {
    try {
      id = decodeURIComponent(path.slice('components/'.length))
    } catch {
      return { id: 'not-found' }
    }
  } else return { id: 'not-found' }
  id = aliases[id] ?? id
  const canonical = new URL(landingHref(id, base))
  for (const key of ['component', 'panel', 'screen']) url.searchParams.delete(key)
  canonical.search = url.search
  canonical.hash = url.hash
  return { id, canonical: canonical.href }
}
export function readLandingRoute() {
  const route = resolveLandingRoute(location.href, landingBaseUrl())
  if (route.canonical && route.canonical !== location.href) history.replaceState(null, '', route.canonical)
  return route.id
}
