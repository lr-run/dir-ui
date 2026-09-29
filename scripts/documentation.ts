import { resolve } from 'node:path'
import { documentationFiles } from '../landing/documentation.ts'
const destination = resolve(import.meta.dirname!, '../landing/public')
for (const [path, content] of documentationFiles()) {
  const file = resolve(destination, path)
  await Deno.mkdir(resolve(file, '..'), { recursive: true })
  await Deno.writeTextFile(file, content)
}
console.log('Generated Markdown, llms.txt, sitemap.xml, and robots.txt.')
