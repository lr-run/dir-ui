// Review buttons in a report's header: a lead flags a report for follow-up or marks it reviewed.
import { CheckIcon } from 'lucide-react'
import { Toast } from '@base-ui/react/toast'
import { Button } from '@/components/ui/button.tsx'
import type { KitDetailContext } from '@/components/systems/kit/types.ts'

export function ReviewActions({ store, record }: KitDetailContext) {
  const toasts = Toast.useToastManager()
  const status = record.values.status
  if (record.archivedAt) return null
  const set = (next: string, title: string) => {
    store.update('reports', record.id, { values: { status: next } })
    toasts.add({ title, description: record.name })
  }
  return (
    <>
      {status !== 'follow-up' && (
        <Button onClick={() => set('follow-up', 'Flagged for follow-up')}>Needs follow-up</Button>
      )}
      {status !== 'reviewed' && (
        <Button variant='default' onClick={() => set('reviewed', 'Report reviewed')}>
          <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' />Mark reviewed
        </Button>
      )}
    </>
  )
}
