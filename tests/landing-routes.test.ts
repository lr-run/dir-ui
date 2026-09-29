import { landingHref, resolveLandingRoute } from '../landing/src/routes.ts'
const base = 'https://example.com/'
Deno.test('landing routes support direct entry, trailing slashes and legacy aliases', () => {
  for (
    const [path, id, canonical] of [
      ['/', 'home', '/'],
      ['/examples', 'studio', '/examples/crm'],
      ['/examples/', 'studio', '/examples/crm'],
      ['/examples/crm', 'studio', '/examples/crm'],
      ['/components', 'button', '/components/button'],
      ['/components/', 'button', '/components/button'],
      ['/components/input/', 'input', '/components/input'],
      ['/examples/code', 'studio-code', '/examples/crm/code'],
      ['/?panel=code', 'studio-code', '/examples/crm/code'],
      ['/?component=typography#api', 'input', '/components/input#api'],
      ['/?component=sort-editor', 'data-grid', '/components/data-grid'],
    ]
  ) {
    const result = resolveLandingRoute(new URL(path!, base).href, base)
    if (result.id !== id || result.canonical !== new URL(canonical!, base).href) throw new Error(path)
  }
})
Deno.test('landing links retain the supplied mount base, including code and component anchors', () => {
  const mount = 'https://example.com/mounted/app/'
  const href = landingHref('data-grid', mount)
  if (href !== mount + 'components/data-grid') throw new Error('Mount dropped')
  const result = resolveLandingRoute(href + '#props', mount)
  if (result.id !== 'data-grid' || result.canonical !== href + '#props') throw new Error('Nested route failed')
  if (landingHref('studio-code', mount) !== mount + 'examples/crm/code') throw new Error('Code route failed')
})
Deno.test('unrecognized landing paths are not silently redirected to examples', () => {
  for (const path of ['/api/preview/companies', '/examples/missing', '/components/input/missing', '/components/%zz']) {
    const result = resolveLandingRoute(new URL(path, base).href, base)
    if (result.id !== 'not-found' || result.canonical) throw new Error(path)
  }
})
