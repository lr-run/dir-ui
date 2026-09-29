export type DemoRecord = {
  id: number
  name: string
  team: string
  email: string
  website: string
  revenue: number | null
  score: number
  probability: number
  joined: string
  updated: string
  active: boolean
  status: string
  tags: string[]
  owner: string
  description: string
}
export function makeDemoRecords(count: number): DemoRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `${['Acme Studio', 'Northstar', 'Linear Labs', 'Summit', 'Orbit'][index % 5]}${
      index >= 5 ? ` ${index + 1}` : ''
    }`,
    team: ['Sales', 'Support', 'Product'][index % 3]!,
    email: `hello${index + 1}@example.com`,
    website: `https://company${index + 1}.example.com`,
    revenue: index % 11 === 10 ? null : (index + 1) * 1234.56,
    score: (index * 17) % 100,
    probability: (index * 13 + 40) % 101,
    joined: `2026-${String(index % 9 + 1).padStart(2, '0')}-${String(index % 27 + 1).padStart(2, '0')}`,
    updated: `2026-09-${String(index % 27 + 1).padStart(2, '0')}T14:30:00Z`,
    active: index % 3 !== 0,
    status: ['Active', 'Prospect', 'Customer'][index % 3]!,
    tags: index % 2 ? ['Partner', 'Priority'] : ['New'],
    owner: ['Alex Morgan', 'Jordan Lee', 'Sam Taylor'][index % 3]!,
    description: 'A growing team building thoughtful products and lasting customer relationships.',
  }))
}
