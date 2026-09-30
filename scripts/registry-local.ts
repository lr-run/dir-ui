/** Materialize a disposable local registry; public GitHub dependency addresses remain unchanged. */
import { resolve } from 'node:path'
import { makeRegistry, registrySources } from './registry.ts'
import { registryRepository } from '../registry/catalog.ts'
const destination = Deno.args[0]
if (!destination) throw new Error('Usage: deno task registry:local /absolute/tmp/registry')
const registry = await makeRegistry(), sources = await registrySources(registry)
await Deno.mkdir(destination, { recursive: true })
for (const item of registry.items) {
  const output = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...item,
    registryDependencies: item.registryDependencies.map((dependency) =>
      dependency.startsWith(`${registryRepository}/`)
        ? resolve(destination, `${dependency.slice(registryRepository.length + 1).split('#')[0]}.json`)
        : dependency
    ),
    files: item.files.map((file) => ({ ...file, content: sources.get(file.path)! })),
  }
  await Deno.writeTextFile(resolve(destination, `${item.name}.json`), JSON.stringify(output, null, 2) + '\n')
}
console.log(`Built ${registry.items.length} local items in ${destination}. No publication performed.`)
