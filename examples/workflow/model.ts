export type NextAction = { action: string; owner: string; due: string; completion: string }
export type WorkRecord = { id: string; name: string; status: string; note: string; next: NextAction; history: string[] }
export type Workflow = { id: string; label: string; action: string; records: WorkRecord[] }
const next = (action: string): NextAction => ({ action, owner: 'Alex', due: '2026-11-18', completion: '' })
export const workflows: Workflow[] = [
  {
    id: 'crm',
    label: 'CRM',
    action: 'Schedule follow-up',
    records: [
      {
        id: 'deal-1',
        name: 'Acme · Renewal',
        status: 'Proposal',
        note: 'Confirm the scope before sending the proposal.',
        next: next('Send proposal'),
        history: [],
      },
      {
        id: 'deal-2',
        name: 'North · Discovery',
        status: 'Discovery',
        note: 'Record the customer’s priorities.',
        next: next('Contact customer'),
        history: [],
      },
    ],
  },
  {
    id: 'recruiting',
    label: 'Recruiting',
    action: 'Schedule interview',
    records: [
      {
        id: 'candidate-1',
        name: 'Sample candidate · Product designer',
        status: 'Interview',
        note: 'Enter interview feedback before the next round.',
        next: next('Schedule next interview'),
        history: [],
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Task management',
    action: 'Plan review',
    records: [
      {
        id: 'task-1',
        name: 'Review onboarding copy',
        status: 'In progress',
        note: 'Attach the draft URL and record the changes.',
        next: next('Request review'),
        history: [],
      },
    ],
  },
]
export function validateNextAction(value: NextAction): Partial<Record<keyof NextAction, string>> {
  const errors: Partial<Record<keyof NextAction, string>> = {}
  for (const field of ['action', 'owner', 'due', 'completion'] as const) {
    if (!value[field].trim()) errors[field] = 'This field is required.'
  }
  if (value.due && !/^\d{4}-\d{2}-\d{2}$/.test(value.due)) errors.due = 'Choose a date.'
  return errors
}
/** One in-flight mutation per form, including submissions before React renders the disabled state. */
export function createSaveGate() {
  let pending = false
  return async (save: () => Promise<void>) => {
    if (pending) return false
    pending = true
    try {
      await save()
      return true
    } finally {
      pending = false
    }
  }
}
