import type { Values } from './model.ts'

const manyPeople = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `Team member ${String(index + 1).padStart(2, '0')}`,
  team: ['Sales', 'Support', 'Product'][index % 3],
  email: `member${index + 1}@example.com`,
}))
const choices = {
  Records: [{ value: 'acme', label: 'Acme Studio', description: 'Company · acme.example' }, {
    value: 'north',
    label: 'Northstar',
    description: 'Company · northstar.example',
  }],
  Members: [{ value: 'alex', label: 'Alex Morgan', description: 'Sales' }, {
    value: 'jordan',
    label: 'Jordan Lee',
    description: 'Support',
  }],
  Statuses: [{ value: 'new', label: 'New', color: '#3b82f6' }, { value: 'active', label: 'Active', color: '#16a34a' }],
  Tags: [{ value: 'vip', label: 'VIP', color: '#a855f7' }, { value: 'partner', label: 'Partner', color: '#f59e0b' }],
}
type Example = { label: string; values: Values }
export function examplesFor(id: string): Example[] | undefined {
  const base: Example = { label: 'Default', values: {} }
  if (id === 'combobox' || id === 'multi-combobox') {
    return [
      { label: 'Teams', values: {} },
      ...Object.entries(choices).map(([label, items]) => ({
        label,
        values: { items, label, value: id === 'multi-combobox' ? [items[0]!.value] : items[0]!.value },
      })),
    ]
  }
  if (id === 'list') {
    return [
      { label: 'Notes', values: {} },
      {
        label: 'With icons',
        values: {
          variant: 'Icons',
          items: [
            { id: 'brief', title: 'Project brief.pdf', meta: 'PDF · 122 KB' },
            { id: 'notes', title: 'Meeting notes.txt', meta: 'Text · 2 KB' },
          ],
        },
      },
      { label: 'Activity', values: { variant: 'Activity' } },
      { label: 'Tasks', values: { variant: 'Tasks' } },
      { label: 'Empty', values: { items: [] } },
    ]
  }
  if (id === 'list-item') return [base, { label: 'With icon', values: { showIcon: true } }]
  if (id === 'table') {
    return [base, { label: 'Long collection', values: { rows: manyPeople, caption: 'All team members' } }, {
      label: 'Empty',
      values: { rows: [], caption: 'No team members yet' },
    }]
  }
  if (id === 'data-grid') {
    return [
      base,
      { label: 'Search results', values: { search: 'Alex' } },
      { label: 'No search results', values: { search: 'unmatched-query' } },
      {
        label: 'Filtered and sorted',
        values: {
          sorts: [{ field: 'name', direction: 'desc' }],
          filter: { conjunction: 'and', conditions: [{ id: 'team', field: 'team', operator: 'eq', value: 'Sales' }] },
        },
      },
      { label: 'Editable', values: { editable: true } },
      {
        label: 'Compact collection',
        values: { rows: manyPeople, rowHeight: 28, headerRowHeight: 32 },
      },
      { label: 'Empty', values: { rows: [] } },
    ]
  }
  if (id === 'tabs') {
    return [base, {
      label: 'Vertical',
      values: { orientation: 'vertical' },
    }, { label: 'Disabled tab', values: { disabled: true } }]
  }

  if (id === 'search-dialog') {
    return [
      { label: 'Documentation', values: {} },
      { label: 'With preview', values: { showPreview: true } },
      {
        label: 'Async search',
        values: { remote: true, minQueryLength: 2, showPreview: true, title: 'Search documentation' },
      },
      {
        label: 'Products',
        values: {
          title: 'Search products',
          items: [
            {
              id: 'keyboard',
              label: 'Wireless keyboard',
              description: 'Compact layout · $89',
              group: 'Accessories',
              keywords: ['bluetooth'],
            },
            { id: 'monitor', label: '27-inch display', description: '4K resolution · $399', group: 'Displays' },
          ],
        },
      },
      {
        label: 'People',
        values: {
          title: 'Find a person',
          items: [
            { id: 'alex', label: 'Alex Morgan', description: 'Design', group: 'Team' },
            { id: 'jordan', label: 'Jordan Lee', description: 'Engineering', group: 'Team' },
          ],
        },
      },
      { label: 'Empty', values: { items: [] } },
      { label: 'Loading', values: { items: [], loading: true } },
      { label: 'Error', values: { items: [], error: 'Search is unavailable. Please try again.' } },
    ]
  }
  return undefined
}

export const inputSampleValues: Record<string, string> = {
  text: 'Acme Studio',
  email: 'hello@example.com',
  tel: '+1 415 555 0100',
  url: 'https://example.com',
  password: 'example-password',
  search: 'Acme',
  number: '42',
  money: '12000',
  percent: '60',
  date: '2026-10-01',
  'datetime-local': '2026-10-01T10:00',
}
