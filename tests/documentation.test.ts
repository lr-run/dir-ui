import { sourcePath } from '../registry/paths.ts'
import { documentationFiles } from '../apps/docs/documentation.ts'
import { componentApi } from '../apps/docs/src/pages/catalog/api-data.ts'
import { templates } from '../registry/templates.ts'
import { installCommand, registryAddress, releaseVersion, siteUrl } from '../registry/catalog.ts'
import { makeRegistry, official } from '../scripts/registry.ts'
import {
  apiIdsFor,
  componentDescriptions,
  componentIds,
  componentTitles,
  layoutIds,
  recipes,
  uiRules,
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

Deno.test('agent-facing Markdown and text contain no Japanese', () => {
  for (const [path, text] of documentationFiles()) {
    if (!/\.(md|txt)$/.test(path)) continue
    const match = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/u)
    if (match) throw new Error(`Japanese text "${match[0]}" in ${path}`)
  }
})

Deno.test('the skill works from its URL without installation', () => {
  const docs = documentationFiles()
  const skill = docs.get('skill/SKILL.md')!
  for (const [path, text] of docs) {
    if (!path.startsWith('skill/')) continue
    const relative = text.match(/\]\((?!https?:\/\/)[^)]*\)/)
    if (relative) throw new Error(`Relative link ${relative[0]} in ${path}`)
    for (const [url] of text.matchAll(/https:\/\/ui\.usedir\.com\/[^\s)`,]*[^\s)`,.:]/g)) {
      const target = url.slice(siteUrl.length)
      if (target.includes('<')) continue
      if (!docs.has(target) && !docs.get('sitemap.xml')!.includes(`<loc>${url}</loc>`)) {
        throw new Error(`Broken link ${url} in ${path}`)
      }
    }
  }
  for (const recipe of recipes) {
    const row = skill.split('\n').find((line) => line.includes(`${siteUrl}skill/recipes/${recipe.slug}.md`))
    if (!row) throw new Error(`Unlisted recipe: ${recipe.slug}`)
    if (!row.includes(`\`${recipe.shell}Shell\``) || !row.includes(`${siteUrl}examples/${recipe.slug}`)) {
      throw new Error(`SKILL.md row for ${recipe.slug} lacks its layout or live preview`)
    }
    if (!docs.get(`skill/recipes/${recipe.slug}.md`)!.includes(`Live preview: ${siteUrl}examples/${recipe.slug}`)) {
      throw new Error(`Recipe ${recipe.slug} lacks its live preview`)
    }
    if (!docs.get('skill/rules.md')!.includes(`${siteUrl}skill/recipes/${recipe.slug}.md`)) {
      throw new Error(`Recipe missing from rules: ${recipe.slug}`)
    }
  }
  for (const [version] of skill.matchAll(/#v[0-9][^\s`]*/g)) {
    if (version !== `#v${releaseVersion}`) throw new Error(`Stale version ${version} in SKILL.md`)
  }
  if (!skill.includes(`The current version is v${releaseVersion}.`)) {
    throw new Error('SKILL.md does not name the version')
  }
  const rules = docs.get('skill/rules.md')!
  for (const rule of uiRules) {
    if (!rules.includes(`${siteUrl}rules/${rule.slug}`)) throw new Error(`Rule ${rule.slug} lacks its preview`)
  }
  for (const id of layoutIds) {
    if (!rules.includes(`${siteUrl}layouts/${id}`) || !skill.includes(`${siteUrl}layouts/${id}`)) {
      throw new Error(`Layout ${id} lacks its preview`)
    }
  }
  for (const id of componentIds) {
    if (!docs.get(`components/${id}.md`)!.includes(`${siteUrl}components/${id}\n`)) {
      throw new Error(`components/${id}.md lacks its live preview`)
    }
  }
  if (!docs.get('llms.txt')!.split('\n## ')[0]!.includes(`${siteUrl}skill/SKILL.md`)) {
    throw new Error('llms.txt does not lead with the skill')
  }
})
