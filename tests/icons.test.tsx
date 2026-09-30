import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { SearchIcon } from 'lucide-react'
import { IconButton } from '../packages/ui/src/components/ui/icon-button.tsx'
import { makeRegistry, registrySources } from '../scripts/registry.ts'
import { documentationFiles } from '../apps/docs/documentation.ts'
import { source } from '../apps/docs/src/pages/catalog/playground/code.ts'

Deno.test('icon-only controls retain their accessible label with decorative Lucide SVGs', () => {
  const html = renderToStaticMarkup(
    <IconButton label='Search records'>
      <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' />
    </IconButton>,
  )
  assert.match(html, /aria-label="Search records"/)
  assert.match(html, /<svg[^>]*aria-hidden="true"/)
  assert.match(html, /width="16"/)
  assert.match(html, /stroke-width="1.5"/)
  assert.match(html, /lucide-search/)
  assert.ok(!html.includes('svg-wrap'))
})

Deno.test('registry uses only direct Lucide imports and excludes obsolete icon files', async () => {
  const registry = await makeRegistry()
  const sources = await registrySources(registry)
  for (const item of registry.items) {
    if (item.name === 'icons' || item.files.some((file) => sources.get(file.path)?.includes("from 'lucide-react'"))) {
      assert.ok(item.dependencies.includes('lucide-react@1.48.0'), `Missing icon dependency: ${item.name}`)
    }
    for (const file of item.files) {
      assert.ok(!/\/icons\/|icon-placeholder|table-icon/.test(file.path), `Legacy file: ${file.path}`)
      const content = sources.get(file.path)!
      assert.ok(!/<I\s|IconPlaceholder|svg-wrap|icons\/index/.test(content), `Legacy usage: ${file.path}`)
      // The chart recipe injects CSS variables into a style element; it is not icon rendering.
      if (!file.path.endsWith('/ui/chart.tsx')) assert.ok(!content.includes('dangerouslySetInnerHTML'), file.path)
      assert.ok(!/<svg\b/.test(content), `Hand-authored icon in library: ${file.path}`)
    }
  }
  const icons = registry.items.find((item) => item.name === 'icons')!
  assert.ok(icons.files.every((file) => /styles\/|licenses\//.test(file.path)))
})

Deno.test('icon documentation and copyable snippets use direct external imports', () => {
  const markdown = documentationFiles().get('components/icons.md')!
  assert.ok(markdown.includes("import { SearchIcon } from 'lucide-react'"))
  assert.ok(markdown.includes('strokeWidth'))
  assert.ok(markdown.includes('aria-hidden'))
  const snippet = source(
    "import { Button } from './components/ui/button.tsx'",
    '<Button aria-label="Search"><SearchIcon size={16} strokeWidth={1.5} aria-hidden /></Button>',
  )
  assert.ok(snippet.includes("import { SearchIcon } from 'lucide-react'"))
  assert.ok(!snippet.includes('import { I }'))
})
