import { Button } from './button.tsx'

export function InlineSaveFeedback({ saving, error, retry, cancel, disabled = false }: {
  saving: boolean
  error: string
  retry: () => void
  cancel: () => void
  disabled?: boolean
}) {
  return (
    <>
      {saving && (
        <span role='status' className='inline-save-status block text-muted-foreground text-xs px-2 py-1.5'>
          Saving…
        </span>
      )}
      {error && (
        <div className='inline-save-error p-2 text-xs [&>p]:text-[var(--ui-danger,#b42318)] [&>p]:mb-2'>
          <p role='alert'>{error}</p>
          <div className='inline-save-actions flex gap-2 justify-end'>
            <Button disabled={saving} onClick={cancel}>Cancel</Button>
            <Button disabled={saving || disabled} onClick={retry}>Retry</Button>
          </div>
        </div>
      )}
    </>
  )
}
