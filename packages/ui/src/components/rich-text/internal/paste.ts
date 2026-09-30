import type { JSONContent } from '@tiptap/core'
/** Convert common Markdown blocks on plain-text paste. Rich HTML uses the editor schema. */
export function markdownDocument(text: string): JSONContent[] {
  const inline = (value: string): JSONContent[] =>
    value.split(/(\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).filter(Boolean).map(
      (part) => {
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
        if (link) return { type: 'text', text: link[1], marks: [{ type: 'link', attrs: { href: link[2] } }] }
        for (const [token, mark] of [['**', 'bold'], ['~~', 'strike'], ['`', 'code'], ['*', 'italic']] as const) {
          if (part.startsWith(token) && part.endsWith(token)) {
            return { type: 'text', text: part.slice(token.length, -token.length), marks: [{ type: mark }] }
          }
        }
        return { type: 'text', text: part }
      },
    )
  const paragraph = (value: string): JSONContent => ({
    type: 'paragraph',
    ...(value ? { content: inline(value) } : {}),
  })
  const blocks: JSONContent[] = []
  let code: string[] | null = null
  const codeBlock = (lines: string[]): JSONContent => ({
    type: 'codeBlock',
    content: lines.length ? [{ type: 'text', text: lines.join('\n') }] : [],
  })
  for (const line of text.split('\n')) {
    if (line.startsWith('```')) {
      if (code !== null) {
        blocks.push(codeBlock(code))
        code = null
      } else code = []
      continue
    }
    if (code !== null) {
      code.push(line)
      continue
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/),
      task = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/),
      list = line.match(/^([-*]|\d+\.)\s+(.*)$/)
    if (heading) blocks.push({ type: 'heading', attrs: { level: heading[1]!.length }, content: inline(heading[2]!) })
    else if (task || list) {
      const type = task ? 'taskList' : /\d/.test(list![1]!) ? 'orderedList' : 'bulletList'
      const node: JSONContent = task
        ? { type: 'taskItem', attrs: { checked: task[1] !== ' ' }, content: [paragraph(task[2]!)] }
        : { type: 'listItem', content: [paragraph(list![2]!)] }
      const previous = blocks.at(-1)
      if (previous?.type === type) (previous.content ??= []).push(node)
      else blocks.push({ type, content: [node] })
    } else if (line.startsWith('> ')) blocks.push({ type: 'blockquote', content: [paragraph(line.slice(2))] })
    else blocks.push(paragraph(line))
  }
  if (code !== null) blocks.push(codeBlock(code))
  return blocks
}
