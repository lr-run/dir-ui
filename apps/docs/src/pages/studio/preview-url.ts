import { landingBaseUrl } from '../../routes.ts'

/** The preview app's URL; the toolbar's Full screen link opens the same page in a new tab. */
export function examplePreviewUrl(example: string, count: number, theme: string) {
  const url = new URL(example === 'crm' ? 'preview/crm/companies' : `preview/${example}/`, landingBaseUrl())
  url.searchParams.set('count', String(count))
  url.searchParams.set('theme', theme)
  return url.href
}
