import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { installPath, sourcePath, targetPath } from '../registry/paths.ts'
import { imports, makeRegistry, registrySources, root } from '../scripts/registry.ts'
import { registryAddress } from '../registry/catalog.ts'

Deno.test('registry gives every shared source exactly one owner and uses consumer alias targets', async () => {
  const registry = await makeRegistry(), owners = new Map<string, string>()
  for (const item of registry.items) {
    for (const file of item.files) {
      await Deno.stat(resolve(root, file.path))
      assert.ok(!owners.has(file.target), `Target collision: ${file.target}`)
      owners.set(file.target, item.name)
      assert.match(file.target, /^(@ui\/|@components\/|@hooks\/|@lib\/|~\/licenses\/)/)
      assert.ok(!/dir-components|components\/dir-ui|\/shadcn\//.test(file.path))
      if (item.name !== 'crm-example') assert.ok(!file.target.startsWith('@components/crm/'))
    }
  }
  for (const name of ['input', 'button', 'data-grid']) {
    assert.ok(!registry.items.find((i) => i.name === name)!.dependencies.some((d) => /recharts|tiptap/.test(d)))
  }
  const crm = registry.items.find((i) => i.name === 'crm-example')!
  assert.equal(crm.type, 'registry:block')
  assert.ok(crm.files.every((f) => f.target.startsWith('@components/crm/')))
  assert.ok(crm.registryDependencies.includes(registryAddress('button')))
  assert.ok(crm.files.some((f) => f.target === '@components/crm/routes/companies-list.tsx'))
})

Deno.test('registry dependency graph is complete and has no cycles', async () => {
  const registry = await makeRegistry(), sources = await registrySources(registry)
  const byAddress = new Map(registry.items.map((i) => [registryAddress(i.name), i]))
  const byFile = new Map(registry.items.flatMap((i) => i.files.map((f) => [f.path, i] as const)))
  const upstream = new Set(['components/ui/label.tsx', 'components/ui/separator.tsx', 'components/ui/skeleton.tsx'])
  function visit(item: typeof registry.items[number], stack: string[]) {
    assert.ok(!stack.includes(item.name), `Cycle: ${[...stack, item.name].join(' -> ')}`)
    for (const d of item.registryDependencies) if (byAddress.has(d)) visit(byAddress.get(d)!, [...stack, item.name])
  }
  for (const item of registry.items) {
    visit(item, [])
    for (const f of item.files) {
      for (const specifier of imports(sources.get(f.path)!)) {
        if (!specifier.startsWith('@/')) continue
        const canonical = specifier.slice(2)
        if (upstream.has(canonical)) {
          assert.ok(item.registryDependencies.includes(canonical.split('/').at(-1)!.replace('.tsx', '')))
          continue
        }
        const owner = byFile.get(sourcePath(canonical))
        assert.ok(owner, `Unresolved ${f.path} -> ${specifier}`)
        if (owner.name !== item.name) assert.ok(item.registryDependencies.includes(registryAddress(owner.name)))
      }
    }
  }
})

Deno.test('unchanged upstream components are dependencies, not copied registry files', async () => {
  const registry = await makeRegistry()
  for (const name of ['label', 'separator', 'skeleton']) {
    assert.ok(!registry.items.some((i) => i.files.some((f) => f.path.endsWith(`/ui/${name}.tsx`))))
    assert.ok(registry.items.some((i) => i.registryDependencies.includes(name)))
  }
  const editor = registry.items.find((i) => i.name === 'rich-text')!
  assert.ok(editor.files.some((f) => f.path.endsWith('/RichTextEditor.tsx')))
})

Deno.test('standard targets map authored workspace paths without copying source', async () => {
  assert.equal(targetPath('packages/ui/src/components/ui/button.tsx'), '@ui/button.tsx')
  assert.equal(targetPath('packages/ui/src/hooks/use-inline-save.ts'), '@hooks/use-inline-save.ts')
  assert.equal(targetPath('packages/ui/src/lib/query.ts'), '@lib/query.ts')
  assert.equal(targetPath('examples/crm/src/routes/companies-list.tsx'), '@components/crm/routes/companies-list.tsx')
  assert.equal(installPath('examples/another/src/app.tsx'), 'components/another/app.tsx')
  const registry = await makeRegistry(), sources = await registrySources(registry)
  for (const [path, content] of sources) {
    assert.ok(!path.startsWith('registry/'))
    assert.equal(content, await Deno.readTextFile(resolve(root, path)))
    assert.ok(!content.includes("from '@dir/ui"))
  }
  const theme = registry.items.find((item) => item.name === 'theme')!
  assert.equal(theme.files.length, 0)
  assert.equal((theme.css?.[':root'] as Record<string, string>)['--dir-text-inline'], '13px')
  assert.ok(
    Object.entries(theme.css ?? {}).some(([selector, rule]) =>
      selector.includes(':root.dark') && (rule as Record<string, string>)['color-scheme'] === 'dark'
    ),
  )
  assert.ok(theme.css?.['@media (prefers-reduced-motion: reduce)'])
  assert.ok(
    registry.items.find((item) => item.name === 'data-grid-styles')?.css
      ?.["@import 'react-data-grid/lib/styles.css' layer(components)"],
  )
})
