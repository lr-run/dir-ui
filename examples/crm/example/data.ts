import type { ExampleKind, ExampleRecord } from '../types.ts'
import type { QueryField } from '../../../lib/query.ts'

export const owners = ['Alex Morgan', 'Jordan Lee', 'Sam Taylor']
export const examples = {
  companies: {
    title: 'Companies',
    singular: 'Company',
    statuses: ['Prospect', 'Active', 'Customer'],
  },
  people: { title: 'People', singular: 'Person', statuses: ['New', 'Contacted', 'Connected'] },
  deals: {
    title: 'Deals',
    singular: 'Deal',
    statuses: ['Qualified', 'Proposal', 'Negotiation', 'Won'],
  },
} as const
export function sampleRecords(kind: ExampleKind, count = 5): ExampleRecord[] {
  const names = kind === 'people'
    ? ['Alex Morgan', 'Jordan Lee', 'Sam Taylor', 'Riley Chen', 'Casey Kim']
    : kind === 'deals'
    ? ['Acme · Enterprise', 'Northstar · Expansion', 'Linear Labs · Renewal', 'Summit · Pilot', 'Orbit · Platform']
    : ['Acme Studio', 'Northstar', 'Linear Labs', 'Summit', 'Orbit']
  return Array.from({ length: count }, (_, index) => ({
    id: `${kind}-${index + 1}`,
    name: `${names[index % names.length]}${index >= names.length ? ` ${Math.floor(index / names.length) + 1}` : ''}`,
    domain: ['acme.example', 'northstar.example', 'linear.example', 'summit.example', 'orbit.example'][index % 5]!,
    email: `contact${index + 1}@example.com`,
    company: ['Acme Studio', 'Northstar', 'Linear Labs'][index % 3]!,
    status: examples[kind].statuses[index % examples[kind].statuses.length]!,
    owner: owners[index % owners.length]!,
    value: [24000, 48000, 12000, 8000, 36000][index % 5]!,
    industry: ['Software', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'][index % 5],
    employees: [24, 120, 850, 48, 320][index % 5],
    revenue: [2400000, 18000000, 96000000, 6800000, 42000000][index % 5],
    city: ['San Francisco', 'London', 'Tokyo', 'Berlin', 'Toronto'][index % 5],
    country: ['United States', 'United Kingdom', 'Japan', 'Germany', 'Canada'][index % 5],
    jobTitle: ['CEO', 'VP of Sales', 'Product Manager', 'CTO', 'Operations Lead'][index % 5],
    department: ['Leadership', 'Sales', 'Product', 'Engineering', 'Operations'][index % 5],
    phone: `+1 415 555 ${String(100 + index).padStart(4, '0')}`,
    probability: [25, 50, 75, 100][index % 4],
    closeDate: `2026-${String(10 + index % 3).padStart(2, '0')}-${String(1 + index % 28).padStart(2, '0')}`,
    source: ['Inbound', 'Referral', 'Outbound', 'Event'][index % 4],
    priority: ['High', 'Medium', 'Low'][index % 3],
    recurring: index % 2 === 0,
    tags: index % 2 ? ['Partner'] : ['Enterprise', 'Strategic'],
    lastContact: `2026-09-${String(1 + index % 28).padStart(2, '0')}`,
    createdAt: `2026-08-${String(1 + index % 28).padStart(2, '0')}`,
    notes: [],

    activity: [{ id: `created-${index}`, title: `${examples[kind].singular} created`, time: 'Sep 28, 2026' }],
  }))
}
export function queryFields(kind: ExampleKind): QueryField[] {
  return [
    { id: 'name', label: 'Name', type: 'text' },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: examples[kind].statuses.map((value) => ({ value, label: value })),
    },
    { id: 'owner', label: 'Owner', type: 'select', options: owners.map((value) => ({ value, label: value })) },
    {
      id: kind === 'companies' ? 'domain' : 'company',
      label: kind === 'companies' ? 'Domain' : 'Company',
      type: 'text',
    },
    ...(kind === 'companies'
      ? [
        { id: 'industry', label: 'Industry', type: 'text' as const },
        { id: 'employees', label: 'Employees', type: 'number' as const },
        { id: 'revenue', label: 'Annual revenue', type: 'number' as const },
        { id: 'city', label: 'City', type: 'text' as const },
        { id: 'country', label: 'Country', type: 'text' as const },
      ]
      : kind === 'people'
      ? [
        { id: 'email', label: 'Email', type: 'text' as const },
        { id: 'jobTitle', label: 'Job title', type: 'text' as const },
        { id: 'department', label: 'Department', type: 'text' as const },
        { id: 'phone', label: 'Phone', type: 'text' as const },
        { id: 'country', label: 'Country', type: 'text' as const },
      ]
      : [
        { id: 'value', label: 'Value', type: 'number' as const },
        { id: 'probability', label: 'Probability', type: 'number' as const },
        { id: 'closeDate', label: 'Close date', type: 'date' as const },
        { id: 'source', label: 'Source', type: 'text' as const },
        { id: 'priority', label: 'Priority', type: 'text' as const },
        { id: 'recurring', label: 'Recurring', type: 'boolean' as const },
      ]),
    {
      id: 'tags',
      label: 'Tags',
      type: 'multiSelect',
      options: ['Enterprise', 'Strategic', 'Partner'].map((value) => ({ value, label: value })),
    },
    ...(kind !== 'deals' ? [{ id: 'lastContact', label: 'Last contact', type: 'date' as const }] : []),
    { id: 'createdAt', label: 'Created', type: 'date' },
  ]
}
