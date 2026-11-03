import type { Choice } from '@dir/ui/lib/choice-types.ts'

/** Sample data shared by the component pages. Colors are data, not theme tokens. */
export const stages: Choice[] = [
  { value: 'lead', label: 'Lead', color: 'var(--ui-muted)' },
  { value: 'negotiation', label: 'Negotiation', color: 'var(--ui-amber)', description: 'Preparing the proposal' },
  { value: 'proposed', label: 'Proposed', color: 'var(--ui-blue)' },
  { value: 'won', label: 'Won', color: 'var(--ui-green)' },
  { value: 'lost', label: 'Lost', color: 'var(--ui-red)', disabled: true },
]
export const stage = (value: string) => stages.find((s) => s.value === value)!
export const tags: Choice[] = [
  { value: 'new', label: 'New' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'referral', label: 'Referral' },
  { value: 'west', label: 'West' },
  { value: 'existing', label: 'Existing customer' },
  { value: 'event', label: 'Trade show' },
]
export const people: Choice[] = [
  { value: 'sato', label: 'Misaki Sato', description: 'Sales 1' },
  { value: 'tanaka', label: 'Ken Tanaka', description: 'Sales 1' },
  { value: 'suzuki', label: 'Haruka Suzuki', description: 'Sales 2' },
  { value: 'sato-k', label: 'Kenta Sato', description: 'Sales 2' },
  { value: 'sato-s', label: 'Shuhei Sato', description: 'Customer success' },
]
export const never = () => new Promise<never>(() => {})
export const fail = (message: string) => () => Promise.reject(new Error(message))
