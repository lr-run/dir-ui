import { sourcePath } from '../registry/paths.ts'
import { documentationFiles } from '../apps/docs/documentation.ts'
import { specs } from '../apps/docs/src/pages/catalog/playground/specs.ts'
import { componentApi } from '../apps/docs/src/pages/catalog/api-data.ts'
import { templates } from '../registry/templates.ts'
import { installCommand, registryAddress } from '../registry/catalog.ts'
import { makeRegistry } from '../scripts/registry.ts'

Deno.test('every component command installs its documented API source', async () => {
  const registry = await makeRegistry()
  const docs = documentationFiles()
  for (const spec of specs) {
    const item = registry.items.find((item) => item.name === spec.id)
    if (!item) throw new Error(`Missing install item: ${spec.id}`)
    const api = componentApi[spec.id as keyof typeof componentApi]
    const installed = new Set<string>()
    const collect = (current: (typeof registry.items)[number] | undefined) => {
      if (!current || installed.has(current.name)) return
      installed.add(current.name)
      for (const dep of current.registryDependencies) {
        collect(registry.items.find((i) => registryAddress(i.name) === dep))
      }
    }
    collect(item)
    if (
      api.path.startsWith('components/') && api.path !== 'components/ui/skeleton.tsx' &&
      !registry.items.filter((i) => installed.has(i.name)).some((i) =>
        i.files.some((f) => f.path === sourcePath(api.path))
      )
    ) {
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
    if (
      item?.type !== 'registry:block' || !item.files.some((file) => file.path === sourcePath(template.entry))
    ) {
      throw new Error(`Uninstallable template: ${template.id}`)
    }
    if (!docs.get(`examples/${template.id}.md`)?.includes(template.exportName)) throw new Error('Missing entry')
  }
})
