import { renderToStaticMarkup } from 'react-dom/server'
import { DetailPage } from '../examples/crm/screens/detail-page.tsx'
import type { DetailField } from '../examples/crm/screens/detail-page.tsx'
import { resolveRoute } from '../examples/crm/app.tsx'
import { FileTree } from '../landing/src/pages/studio/file-tree.tsx'

Deno.test('detail screen accepts unrelated record shapes and arbitrary route content', () => {
  type Ticket = { reference: string; subject: string; priority: number }
  type Change = { priority: number }
  const ticket: Ticket = { reference: 'T-42', subject: 'Service request', priority: 3 }
  const change = (_change: Change, _label: string) => {}
  const fields: DetailField<Ticket, Change>[] = [{
    id: 'priority',
    label: 'Priority',
    render: (context) => {
      if (context.record !== ticket || context.onChange !== change) throw new Error('Field context lost')
      return <output>{context.record.priority}</output>
    },
  }]
  const html = renderToStaticMarkup(
    <DetailPage title={ticket.subject} fields={fields} record={ticket} onChange={change} onDelete={() => {}}>
      <article aria-label='Custom workflow'>
        <h2>{ticket.reference}</h2>
        <p>Approval queue</p>
      </article>
    </DetailPage>,
  )
  for (const expected of ['Service request', '<dt>Priority</dt>', '<output>3</output>', 'Custom workflow', 'T-42']) {
    if (!html.includes(expected)) throw new Error(`Missing caller-defined content: ${expected}`)
  }
  if (html.includes('tablist') || html.includes('Recent activity') || html.includes('Notes')) {
    throw new Error('Common screen imposes route-specific content')
  }
})

Deno.test('source tree groups nested folders while keeping exact file paths', () => {
  const html = renderToStaticMarkup(
    <FileTree
      files={[
        'components/crm/app.tsx',
        'components/crm/routes/companies.tsx',
        'components/crm/routes/report/report-route.tsx',
        'components/crm/screens/list-page.tsx',
      ]}
      selected='components/crm/routes/report/report-route.tsx'
      onSelect={() => {}}
    />,
  )
  if ((html.match(/aria-current="page"/g) ?? []).length !== 1) throw new Error('Invalid selected file')
  for (
    const path of [
      'components/crm/app.tsx',
      'components/crm/routes/companies.tsx',
      'components/crm/routes/report/report-route.tsx',
      'components/crm/screens/list-page.tsx',
    ]
  ) {
    if (!html.includes(`title="${path}"`)) throw new Error(`Missing source path: ${path}`)
  }
  if ((html.match(/<summary>/g) ?? []).length !== 5) throw new Error('Directory hierarchy was flattened')
})

Deno.test('app URL routing supports direct record pages, mount paths, and invalid URLs', () => {
  for (const kind of ['companies', 'people', 'deals'] as const) {
    const list = resolveRoute(`/${kind}`)
    const detail = resolveRoute(`/preview/${kind}/record%20one`, '/preview')
    if (list.page !== 'list' || list.kind !== kind) throw new Error('Wrong list route')
    if (detail.page !== 'detail' || detail.kind !== kind || detail.id !== 'record one') {
      throw new Error('Wrong detail route')
    }
  }
  if (resolveRoute('/preview/report', '/preview').page !== 'report') throw new Error('Missing report route')
  if (resolveRoute('/preview/', '/preview').page !== 'list') throw new Error('Missing default route')
  for (const path of ['/other', '/preview/people/id/extra', '/preview/companies/%E0%A4', '/preview-other/companies']) {
    if (resolveRoute(path, '/preview').page !== 'not-found') throw new Error(`Invalid route matched: ${path}`)
  }
})
