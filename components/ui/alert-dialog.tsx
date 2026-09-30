import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from './button.tsx'
import { ErrorState } from './error-state.tsx'
import { useI18n } from '../../lib/i18n.tsx'

export function ConfirmDialog({ open, onOpenChange, title, description, action, onConfirm, busy = false, error }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: string
  onConfirm: () => void
  busy?: boolean
  error?: string
}) {
  const { t } = useI18n()
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className='fixed inset-0 [background:#10182826] [backdrop-filter:blur(2px)] z-2147483120' />
        <AlertDialog.Popup className='fixed top-[50%] left-[50%] [transform:translate(-50%,-50%)] w-[min(430px,calc(100vw_-_32px))] p-[24px] [background:var(--ui-raised)] [border:1px_solid_var(--ui-border)] rounded-[12px] [box-shadow:var(--ui-shadow)] z-2147483130 [outline:none] [&_h2]:text-[length:var(--dir-text-section)] [&_h2]:m-[0_0_12px] [&_p]:leading-[1.7] [&_p]:text-muted-foreground [&_p]:mb-[20px]'>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
          {error && <ErrorState message={error} />}
          <div className='flex gap-[8px] justify-end items-center'>
            <AlertDialog.Close render={<Button disabled={busy} />}>{t('キャンセル', 'Cancel')}</AlertDialog.Close>
            <Button variant='destructive' disabled={busy} onClick={onConfirm}>
              {busy ? t('処理中…', 'Working…') : action}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
