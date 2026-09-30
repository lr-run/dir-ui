import assert from 'node:assert/strict'
import { groupHistoryEntries, History } from '../examples/crm/src/components/record-activity.tsx'
import type { ChangeEntry } from '../examples/crm/src/types.ts'
import { renderToStaticMarkup } from 'react-dom/server'
import { DetailPage } from '../examples/crm/src/screens/detail-page.tsx'
import type { DetailField } from '../examples/crm/src/screens/detail-page.tsx'
import { resolveRoute } from '../examples/crm/src/app.tsx'
import { FileTree } from '../apps/docs/src/pages/studio/file-tree.tsx'

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
    <DetailPage title={ticket.subject} fields={fields} record={ticket} onChange={change} onArchive={() => {}}>
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
  for (const kind of ['companies', 'people', 'deals', 'tasks'] as const) {
    const list = resolveRoute(`/${kind}`)
    const detail = resolveRoute(`/preview/${kind}/record%20one`, '/preview')
    if (list.page !== 'list' || list.kind !== kind) throw new Error('Wrong list route')
    if (detail.page !== 'detail' || detail.kind !== kind || detail.id !== 'record one') {
      throw new Error('Wrong detail route')
    }
  }
  if (resolveRoute('/preview/settings', '/preview').page !== 'settings') throw new Error('Missing settings route')
  if (resolveRoute('/preview/report', '/preview').page !== 'report') throw new Error('Missing report route')
  if (resolveRoute('/preview/', '/preview').page !== 'list') throw new Error('Missing default route')
  for (const path of ['/other', '/preview/people/id/extra', '/preview/companies/%E0%A4', '/preview-other/companies']) {
    if (resolveRoute(path, '/preview').page !== 'not-found') throw new Error(`Invalid route matched: ${path}`)
  }
})

function audit(id: string, minute: number, patch: Partial<ChangeEntry> = {}): ChangeEntry {
  return {
    id,
    entity: 'companies',
    recordId: 'company-1',
    actor: 'Alex Morgan',
    actorId: 'user-1',
    createdAt: new Date(Date.UTC(2026, 8, 30, 10) + minute * 60_000).toISOString(),
    operation: 'update',
    changes: { name: { before: 'Original', after: id } },
    ...patch,
  }
}

Deno.test('history groups fixed five-minute windows instead of extending after every edit', () => {
  const groups = groupHistoryEntries([audit('d', 8), audit('c', 5), audit('b', 4), audit('a', 0)])
  assert.deepEqual(groups.map((g) => g.entryIds), [['d'], ['a', 'b', 'c']])
  assert.equal(groups[1]!.startedAt, audit('a', 0).createdAt)
  assert.equal(groups[1]!.createdAt, audit('c', 5).createdAt)
  assert.equal(groupHistoryEntries([audit('b', 5 + 1 / 60), audit('a', 0)]).length, 2)
})

Deno.test('grouped history keeps first and last values and labels without mutating original audit entries', () => {
  const first = audit('first', 0, {
    changes: {
      ownerId: { before: 'a', beforeLabel: 'First owner', after: 'b', afterLabel: 'Middle owner' },
      name: { before: 'Original', after: 'Temporary' },
    },
  })
  const last = audit('last', 2, {
    actor: 'Alex Renamed',
    changes: {
      ownerId: { before: 'b', beforeLabel: 'Middle owner', after: 'c', afterLabel: 'Last owner' },
      name: { before: 'Temporary', after: 'Original' },
      industry: { before: null, after: 'Software' },
    },
  })
  const entries = [last, first], original = structuredClone(entries)
  for (const entry of entries) {
    for (const value of Object.values(entry.changes)) Object.freeze(value)
    Object.freeze(entry.changes)
    Object.freeze(entry)
  }
  const group = groupHistoryEntries(Object.freeze(entries))[0]!
  assert.equal(group.actor, 'Alex Renamed')
  assert.deepEqual(group.changes.ownerId, {
    before: 'a',
    beforeLabel: 'First owner',
    after: 'c',
    afterLabel: 'Last owner',
  })
  assert.equal(group.changes.name!.before, 'Original')
  assert.equal(group.changes.name!.after, 'Original')
  assert.deepEqual(group.changes.industry, { before: null, after: 'Software' })
  assert.deepEqual(entries, original)
})

Deno.test('history respects operation, record, actor and invalid-date boundaries', () => {
  const boundaries: Partial<ChangeEntry>[] = [
    { operation: 'create' },
    { operation: 'archive' },
    { operation: 'restore' },
    { operation: 'delete' },
    { actorId: 'user-2', actor: 'Alex Morgan' },
    { actorId: null },
    { recordId: 'company-2' },
    { entity: 'deals' },
    { createdAt: 'invalid' },
  ]
  for (const boundary of boundaries) {
    const groups = groupHistoryEntries([audit('after', 2), audit('boundary', 1, boundary), audit('before', 0)])
    assert.equal(groups.length, 3, JSON.stringify(boundary))
  }
  assert.equal(groupHistoryEntries([audit('b', 1, { actorId: null }), audit('a', 0, { actorId: null })]).length, 2)
  assert.deepEqual(groupHistoryEntries([]), [])
})

Deno.test('equal history timestamps preserve original insertion order and render one grouped card', () => {
  const entries = [audit('last', 0), audit('first', 0)]
  const groups = groupHistoryEntries(entries)
  assert.deepEqual(groups[0]!.entryIds, ['first', 'last'])
  assert.equal(groups[0]!.changes.name!.after, 'last')
  const html = renderToStaticMarkup(<History entries={entries} />)
  assert.equal((html.match(/<article/g) ?? []).length, 1)
  assert.equal((html.match(/<time /g) ?? []).length, 1)
  assert.ok(html.includes('2') && html.includes('updates'))
  const range = renderToStaticMarkup(<History entries={[audit('last', 2), audit('first', 0)]} />)
  assert.equal((range.match(/<time /g) ?? []).length, 2)
})
