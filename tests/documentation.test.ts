import { sourcePath } from '../registry/paths.ts'
import { documentationFiles } from '../apps/docs/documentation.ts'
import { componentApi } from '../apps/docs/src/pages/catalog/api-data.ts'
import { templates } from '../registry/templates.ts'
import { installCommand, registryAddress } from '../registry/catalog.ts'
import { makeRegistry, official } from '../scripts/registry.ts'
import {
  apiIdsFor,
  componentDescriptions,
  componentIds,
  componentTitles,
  recipes,
} from '../apps/docs/src/navigation.ts'
import { sitePages } from '../apps/docs/documentation.ts'
import { pageMetadata } from '../apps/docs/documentation.ts'

Deno.test('every component command installs its documented API source', async () => {
  const registry = await makeRegistry()
  const docs = documentationFiles()
  for (const id of componentIds) {
    if (!componentTitles[id] || !componentDescriptions[id]) throw new Error(`Missing title or description: ${id}`)
    const item = registry.items.find((item) => item.name === id)
    if (!item) throw new Error(`Missing install item: ${id}`)
    const installed = new Set<string>()
    const collect = (current: (typeof registry.items)[number] | undefined) => {
      if (!current || installed.has(current.name)) return
      installed.add(current.name)
      for (const dep of current.registryDependencies) {
        collect(registry.items.find((i) => registryAddress(i.name) === dep))
      }
    }
    collect(item)
    const markdown = docs.get(`components/${id}.md`)
    if (!markdown?.includes(installCommand(id))) throw new Error(`Missing install command: ${id}`)
    for (const key of apiIdsFor(id)) {
      const api = componentApi[key as keyof typeof componentApi]
      if (!api) throw new Error(`Missing API reference: ${id} -> ${key}`)
      if (
        api.path.startsWith('components/') && !official[sourcePath(api.path)] &&
        !registry.items.filter((i) => installed.has(i.name)).some((i) =>
          i.files.some((f) => f.path === sourcePath(api.path))
        )
      ) {
        throw new Error(`Missing API source: ${id}: ${api.path}`)
      }
      if (!markdown.includes(api.names)) throw new Error(`Missing API in Markdown: ${id} -> ${key}`)
    }
    if (!docs.get('llms.txt')?.includes(`/components/${id}.md`)) throw new Error(`Unindexed: ${id}`)
  }
  if (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(JSON.stringify(componentApi))) {
    throw new Error('Documentation must be English')
  }
  const documented = new Set(componentIds.flatMap(apiIdsFor))
  const orphans = Object.keys(componentApi).filter((key) => !documented.has(key))
  if (orphans.length) throw new Error(`API references without a page: ${orphans.join(', ')}`)
  for (const template of templates) {
    const item = registry.items.find((item) => item.name === template.registryItem)
    if (
      item?.type !== 'registry:block' || !item.files.some((file) => file.path === sourcePath(template.entry))
    ) {
      throw new Error(`Uninstallable template: ${template.id}`)
    }
    if (!docs.get(`examples/${template.id}.md`)?.includes(template.exportName)) throw new Error('Missing entry')
  }
})

Deno.test('skill documents are served from the site and indexed for agents', async () => {
  const registry = await makeRegistry(), docs = documentationFiles()
  const skill = registry.items.find((item) => item.name === 'skill')!
  for (const file of ['SKILL.md', 'rules.md', 'api-digest.md', ...recipes.map((r) => `recipes/${r.slug}.md`)]) {
    const text = docs.get(`skill/${file}`)
    if (!text?.startsWith('#') && !text?.startsWith('---')) throw new Error(`Missing skill document: ${file}`)
    if (!skill.files.some((f) => f.path === `packages/skill/${file}` && f.target === `~/skills/dir-ui/${file}`)) {
      throw new Error(`Skill item does not install ${file}`)
    }
  }
  if (!docs.get('skill/rules.md')?.includes('12. **On phones, tables become lists.**')) {
    throw new Error('Rules lost their sections')
  }
  if (!docs.get('llms.txt')?.includes('skill/rules.md')) throw new Error('Rules are not indexed')
  if (!docs.get('sitemap.xml')?.includes('/components/toolbar-button</loc>')) {
    throw new Error('Component pages are not in the sitemap')
  }
  for (const page of sitePages) {
    const meta = pageMetadata(`/${page}`)
    if (meta.title.startsWith('dir/ui —')) throw new Error(`Generic metadata for ${page}`)
  }
  if (pageMetadata('/rules/components').markdown !== 'skill/rules.md') {
    throw new Error('Rules page does not link its Markdown')
  }
  for (const name of ['page-shell', 'app-shell', 'suite-shell']) {
    const item = registry.items.find((i) => i.name === name)
    if (item?.type !== 'registry:component' || !item.files[0]?.path.startsWith('packages/ui/src/components/shells/')) {
      throw new Error(`Shell item missing: ${name}`)
    }
  }
  if (registry.items.some((i) => i.name.startsWith('theme-'))) throw new Error('Themes are not registry items')
})
