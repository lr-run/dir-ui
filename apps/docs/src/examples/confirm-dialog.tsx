import { useState } from 'react'
import { ConfirmDialog } from '@dir/ui/components/ui/confirm-dialog.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import type { ComponentDoc } from './index.ts'

export function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <Button variant='destructive' onClick={() => setOpen(true)}>Delete deal</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Delete deal'
        description='"ABC Trading — Core system renewal" and 3 activities will be deleted. This cannot be undone.'
        action='Delete'
        busy={busy}
        onConfirm={() => {
          setBusy(true)
          setTimeout(() => {
            setBusy(false)
            setOpen(false)
          }, 1200)
        }}
      />
    </>
  )
}
export const doc: ComponentDoc = {
  hero: ConfirmDialogDemo,
  sections: [],
}
