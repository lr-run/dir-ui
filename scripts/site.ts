import { resolve } from 'node:path'
import { documentationFiles, pageMetadata } from '../landing/documentation.ts'
import { specs } from '../landing/src/pages/catalog/playground/specs.ts'
import { templates } from '../examples/catalog.ts'
import { siteUrl } from '../registry/catalog.ts'

export const siteRoutes = [
  '/',
  ...specs.map((s) => `/components/${s.id}`),
  ...templates.flatMap((t) => [`/examples/${t.id}`, `/examples/${t.id}/code`]),
]
export const escapeHtml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
export function staticPage(html: string, route: string, production: boolean) {
  const meta = pageMetadata(route)
  const markdown = documentationFiles().get(meta.markdown) ?? ''
  const description = escapeHtml(meta.description), title = escapeHtml(meta.title)
  const head =
    `<title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${siteUrl}${
      route.slice(1)
    }"><link rel="alternate" type="text/markdown" href="/${meta.markdown}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${siteUrl}${
      route.slice(1)
    }"><meta name="robots" content="${production ? 'index,follow' : 'noindex,nofollow'}">`
  const fallback =
    `<main><h1>${title}</h1><p>${description}</p><nav><a href="/components/button">Components</a> <a href="/examples/crm">CRM Example</a> <a href="/${meta.markdown}">Markdown</a></nav><pre style="white-space:pre-wrap">${
      escapeHtml(markdown)
    }</pre></main>`
  return html.replace(/<title>.*?<\/title>/s, '').replace(/<meta\s+(?:name="description"|name="robots")[^>]*>/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>/g, '').replace('</head>', head + '</head>').replace(
      '<div id="root"></div>',
      `<div id="root">${fallback}</div>`,
    )
}
if (import.meta.main) {
  const production = Deno.env.get('SITE_ENV') === 'prd'
  const base = await Deno.readTextFile('dist/index.html')
  for (const route of siteRoutes) {
    const path = resolve('dist', route === '/' ? 'index.html' : route.slice(1) + '.html')
    await Deno.mkdir(resolve(path, '..'), { recursive: true })
    await Deno.writeTextFile(path, staticPage(base, route, production))
  }
  await Deno.writeTextFile(
    'dist/404.html',
    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — dir/ui</title><h1>Page not found</h1><a href="/components/button">Browse components</a></html>',
  )
  if (!production) await Deno.writeTextFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n')
  console.log(`Generated ${siteRoutes.length} static pages (${production ? 'production' : 'noindex'}).`)
}
