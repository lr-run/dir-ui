import { renderToStaticMarkup } from 'react-dom/server'
import { NoteContent } from '../examples/crm/components/record-notes.tsx'

Deno.test('saved notes keep formatting while escaping text and refusing unsafe links', () => {
  const html = renderToStaticMarkup(
    <NoteContent
      body={{
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Meeting' }] },
          {
            type: 'paragraph',
            content: [{
              type: 'text',
              text: '<script>alert(1)</script>',
              marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            }],
          },
          {
            type: 'paragraph',
            content: [{
              type: 'text',
              text: 'Reference',
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            }],
          },
          {
            type: 'bulletList',
            content: [{
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Next step' }] }],
            }],
          },
        ],
      }}
    />,
  )
  for (const expected of ['<h2>', '<strong>', '&lt;script&gt;', '<ul>', '<li>', 'href="https://example.com"']) {
    if (!html.includes(expected)) throw new Error(`Missing rendered content: ${expected}`)
  }
  if (html.includes('<script>') || html.includes('javascript:') || html.includes('contenteditable')) {
    throw new Error('Unsafe or editable output')
  }
})
