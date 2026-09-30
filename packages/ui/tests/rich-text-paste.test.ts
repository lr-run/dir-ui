import assert from 'node:assert/strict'
import { markdownDocument } from '../src/components/rich-text/internal/paste.ts'

Deno.test('Markdown paste retains heading, task state, grouped list items and links', () => {
  const blocks = markdownDocument(
    '# Notes\n- [x] Done\n- [ ] Pending\n1. First\n2. Second\n[Docs](https://example.com)',
  )
  assert.equal(blocks[0]?.type, 'heading')
  assert.equal(blocks[0]?.attrs?.level, 1)
  assert.deepEqual(blocks[1]?.content?.map((item) => item.attrs?.checked), [true, false])
  assert.equal(blocks[2]?.type, 'orderedList')
  assert.equal(blocks[2]?.content?.length, 2)
  assert.deepEqual(blocks[3]?.content?.[0]?.marks, [{ type: 'link', attrs: { href: 'https://example.com' } }])
})

Deno.test('Markdown paste keeps literal code content and inline emphasis', () => {
  const blocks = markdownDocument('**Bold** and *italic*\n```\nconst value = "**literal**"\n```')
  assert.equal(blocks[0]?.content?.[0]?.marks?.[0]?.type, 'bold')
  assert.equal(blocks[0]?.content?.[2]?.marks?.[0]?.type, 'italic')
  assert.deepEqual(blocks[1], { type: 'codeBlock', content: [{ type: 'text', text: 'const value = "**literal**"' }] })
})
