import assert from 'node:assert/strict'
import { siteRoutes, staticPage } from '../scripts/site.ts'
import { registryAddress, releaseVersion } from '../registry/catalog.ts'
Deno.test('static pages contain metadata and readable API content before JavaScript', () => {
  const html = staticPage(
    '<html><head><title>old</title></head><body><div id="root"></div></body></html>',
    '/components/button',
    true,
  )
  assert.ok(html.includes('https://ui.usedir.com/components/button'))
  assert.ok(html.includes('API') || html.includes('onClick'))
  assert.ok(html.includes('index,follow'))
  assert.ok(!html.includes('noindex'))
  assert.ok(!html.includes('/api/docs/'))
  assert.ok(staticPage('<head></head><div id="root"></div>', '/', false).includes('noindex,nofollow'))
  assert.ok(siteRoutes.includes('/examples/crm/code'))
  assert.ok(!siteRoutes.includes('/examples'))
})
Deno.test('published install addresses pin a release matching the package version', async () => {
  const pkg = JSON.parse(await Deno.readTextFile(new URL('../package.json', import.meta.url)))
  assert.equal(pkg.version, releaseVersion)
  assert.equal(registryAddress('button'), `lr-run/dir-ui/button#v${pkg.version}`)
})
