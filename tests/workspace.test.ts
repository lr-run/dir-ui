import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { imports, root } from '../scripts/registry.ts'
import { sourcePath } from '../registry/paths.ts'

async function* files(path: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(resolve(root, path))) {
    const name = `${path}/${entry.name}`
    if (entry.isDirectory) yield* files(name)
    else if (/\.tsx?$/.test(name)) yield name
  }
}

Deno.test('workspace library and CRM source never depend on docs or registry machinery', async () => {
  for (const directory of ['packages/ui/src', 'examples/crm/src']) {
    for await (const file of files(directory)) {
      for (const specifier of imports(await Deno.readTextFile(resolve(root, file)))) {
        assert.ok(!specifier.startsWith('@dir/'), `Workspace-only import in distributed source: ${file}`)
        if (specifier.startsWith('@/')) {
          const dependency = sourcePath(specifier)
          assert.ok(
            dependency.startsWith('packages/ui/src/') ||
              directory === 'examples/crm/src' && dependency.startsWith('examples/crm/src/'),
            `${file} -> ${dependency}`,
          )
          await Deno.stat(resolve(root, dependency))
        } else if (specifier.startsWith('.')) {
          assert.ok(
            resolve(root, file, '..', specifier).startsWith(resolve(root, directory) + '/'),
            `${file} -> ${specifier}`,
          )
        }
      }
    }
  }
})

Deno.test('docs consumes workspace packages while root remains a tooling workspace', async () => {
  const read = async (path: string) => JSON.parse(await Deno.readTextFile(resolve(root, path)))
  const config = await read('deno.json'),
    ui = await read('packages/ui/package.json'),
    docs = await read('apps/docs/package.json')
  assert.deepEqual(config.workspace, ['packages/ui', 'examples/crm', 'apps/docs'])
  assert.equal(ui.name, '@dir/ui')
  assert.equal(ui.private, true)
  assert.equal(docs.dependencies['@dir/ui'], 'workspace:*')
  assert.equal(docs.dependencies['@dir/crm'], 'workspace:*')
  await assert.rejects(() => Deno.stat(resolve(root, 'registry/source')), Deno.errors.NotFound)
})
