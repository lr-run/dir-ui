import { resolve } from 'node:path'
import { documentationFiles } from '../apps/docs/documentation.ts'
const destination = resolve(import.meta.dirname!, '../apps/docs/public')
for (const [path, content] of documentationFiles()) {
  const file = resolve(destination, path)
  await Deno.mkdir(resolve(file, '..'), { recursive: true })
  await Deno.writeTextFile(file, content)
}
console.log('Generated Markdown, llms.txt, sitemap.xml, and robots.txt.')
