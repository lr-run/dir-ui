import { makeRegistry, root } from '../scripts/registry.ts'
import { resolve } from 'node:path'
Deno.test('registry includes every local dependency without Dir or landing code', async () => {
  const registry = await makeRegistry()
  const names = new Set(registry.items.map((item) => item.name))
  if (names.size !== registry.items.length) throw new Error('Duplicate item names')
  for (const item of registry.items) {
    if (!item.files.length) throw new Error(`Empty item: ${item.name}`)
    for (const file of item.files) {
      await Deno.stat(resolve(root, file.path))
      if (/^(landing|\.dir)\//.test(file.path)) throw new Error(`Host code leaked: ${file.path}`)
      if (item.name !== 'crm-example' && file.path.startsWith('examples/')) throw new Error(`CRM leaked: ${item.name}`)
    }
  }
  for (const name of ['input', 'button', 'data-grid']) {
    const item = registry.items.find((item) => item.name === name)!
    if (item.dependencies.some((dep) => /recharts|tiptap/.test(dep))) {
      throw new Error(`Heavy dependency leaked into ${name}`)
    }
  }
  if (
    !registry.items.find((item) => item.name === 'rich-text')!.dependencies.some((dep) =>
      dep.startsWith('@tiptap/core@')
    )
  ) throw new Error('Rich text missing editor')
  if (
    !registry.items.find((item) => item.name === 'data-grid')!.files.some((file) =>
      file.path === 'styles/data-grid.css'
    )
  ) throw new Error('Missing grid CSS')
})

Deno.test('TypeScript consumers receive declarations for public JSX boundaries', async () => {
  const registry = await makeRegistry()
  for (const name of ['icons', 'rich-text', 'crm-example']) {
    const item = registry.items.find((item) => item.name === name)!
    for (const file of item.files.filter((file) => /(?:icons\/index|RichTextEditor)\.jsx$/.test(file.path))) {
      if (!item.files.some((candidate) => candidate.path === file.path.replace(/\.jsx$/, '.d.ts'))) {
        throw new Error(`Missing TypeScript declaration for ${file.path}`)
      }
    }
  }
})
