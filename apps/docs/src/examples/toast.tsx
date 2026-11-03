import { Toast } from '@base-ui/react/toast'
import { Button } from '@dir/ui/components/ui/button.tsx'
import type { ComponentDoc } from './index.ts'

export function ToastDemo() {
  const toast = Toast.useToastManager()
  return (
    <Button onClick={() => toast.add({ title: 'Expense claim submitted', description: 'Approver: Yamada' })}>
      Show toast
    </Button>
  )
}
export function ToastError() {
  const toast = Toast.useToastManager()
  return (
    <Button
      onClick={() =>
        toast.add({
          title: 'Request failed',
          description: 'The record could not be saved.',
          type: 'error',
          priority: 'high',
          timeout: 8000,
          actionProps: { children: 'Retry', onClick: () => {} },
        })}
    >
      Show error
    </Button>
  )
}
export function ToastUndo() {
  const toast = Toast.useToastManager()
  return (
    <Button onClick={() => toast.add({ title: 'Deal archived', actionProps: { children: 'Undo', onClick: () => {} } })}>
      Archive
    </Button>
  )
}
export function ToastProgress() {
  const toast = Toast.useToastManager()
  return (
    <Button
      onClick={() => {
        const id = toast.add({ title: 'Exporting CSV…', description: '124 / 980 records', timeout: 0 })
        setTimeout(
          () => toast.update(id, { title: 'Export complete', description: '980 records', timeout: 4000 }),
          1800,
        )
      }}
    >
      Export CSV
    </Button>
  )
}
export const doc: ComponentDoc = {
  hero: ToastDemo,
  sections: [
    {
      id: 'error',
      title: 'Error',
      description:
        '`type: "error"` with a retry action and an 8 second timeout. `ErrorToastProvider` does this for failed requests.',
      example: ToastError,
    },
    { id: 'undo', title: 'With Action', description: '`actionProps` adds an undo button.', example: ToastUndo },
    {
      id: 'progress',
      title: 'Progress',
      description: '`timeout: 0` keeps the toast open; `update` it when the work finishes.',
      example: ToastProgress,
    },
  ],
}
