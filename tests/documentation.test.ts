import { documentationFiles } from '../landing/documentation.ts'
import { specs } from '../landing/src/pages/catalog/playground/specs.ts'
import { componentApi } from '../landing/src/pages/catalog/api-data.ts'
import { templates } from '../examples/catalog.ts'
import { installCommand } from '../registry/catalog.ts'
import { makeRegistry } from '../scripts/registry.ts'

Deno.test('every component command installs its documented API source', async () => {
  const registry = await makeRegistry()
  const docs = documentationFiles()
  for (const spec of specs) {
    const item = registry.items.find((item) => item.name === spec.id)
    if (!item) throw new Error(`Missing install item: ${spec.id}`)
    const api = componentApi[spec.id as keyof typeof componentApi]
    if (api.path.startsWith('components/') && !item.files.some((file) => file.path === api.path)) {
      throw new Error(`Missing API source: ${spec.id}: ${api.path}`)
    }
    const markdown = docs.get(`components/${spec.id}.md`)
    if (!markdown?.includes(installCommand(spec.id)) || !markdown.includes(api.names)) {
      throw new Error(`Missing install or API: ${spec.id}`)
    }
    if (!docs.get('llms.txt')?.includes(`/components/${spec.id}.md`)) throw new Error(`Unindexed: ${spec.id}`)
  }
  for (const template of templates) {
    const item = registry.items.find((item) => item.name === template.registryItem)
    if (item?.type !== 'registry:block' || !item.files.some((file) => file.path === template.entry)) {
      throw new Error(`Uninstallable template: ${template.id}`)
    }
    if (!docs.get(`examples/${template.id}.md`)?.includes(template.exportName)) throw new Error('Missing entry')
  }
})
