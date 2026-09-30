import { Button } from './button.tsx'
import { useI18n } from '../../lib/i18n.tsx'

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  const { t } = useI18n()
  return (
    <div
      className='group/crm-error text-destructive text-[length:var(--dir-text-label)] leading-[1.6] flex gap-[12px] items-center [background:var(--ui-hover)] p-[12px] rounded-[6px] m-[12px]'
      role='alert'
    >
      {message}
      {retry && <Button onClick={retry}>{t('再試行')}</Button>}
    </div>
  )
}
