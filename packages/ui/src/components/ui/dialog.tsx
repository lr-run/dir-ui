import type { ComponentProps, ReactNode } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { useI18n } from '@/lib/i18n.tsx'

export function Dialog(
  { open, onOpenChange, title, children, footer, drawer = false, hideHeading = false, className = '' }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    children: ReactNode
    footer?: ReactNode
    drawer?: boolean
    hideHeading?: boolean
    className?: string
  },
) {
  const { t } = useI18n()
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className='fixed inset-0 [background:#10182826] [backdrop-filter:blur(2px)] z-2147483105' />
        <BaseDialog.Popup
          className={`group/crm-dialog fixed top-[50%] left-[50%] [transform:translate(-50%,-50%)] w-[min(720px,calc(100vw_-_32px))] max-h-[calc(100dvh_-_60px)] flex flex-col [background:var(--ui-raised)] [border:1px_solid_var(--ui-border)] rounded-[12px] [box-shadow:0_18px_65px_#0002] z-2147483110 [outline:none] overflow-hidden [@media(max-width:600px)]:w-[calc(100vw_-_16px)] [@media(max-width:600px)]:max-h-[calc(100dvh_-_20px)] [&[data-nested-dialog-open]]:[filter:brightness(.97)] [@media(max-width:_600px)]:[&_[data-slot='input']]:text-[length:var(--dir-text-section)] [&[class~='group/search-dialog']]:w-[min(640px,_calc(100vw_-_32px))] [&[class~='group/search-dialog']]:top-[max(calc(var(--dir-app-shell-height,_48px)_+_16px),_14dvh)] [&[class~='group/search-dialog']]:[transform:translateX(-50%)] [&[class~='group/search-dialog']]:max-h-[calc(86dvh_-_24px)] [&[class~='group/search-dialog']]:rounded-[14px] [&[class~='group/search-dialog']]:[box-shadow:0_0_0_3px_var(--ui-surface),_0_24px_80px_#0002] [&[class~='group/search-dialog-wide']]:w-[min(860px,_calc(100vw_-_32px))] [@media(max-width:_600px)]:[&[class~='group/search-dialog']]:w-[calc(100vw_-_20px)] [@media(max-width:_600px)]:[&[class~='group/search-dialog']]:top-[calc(var(--dir-app-shell-height,_48px)_+_12px)] [@media(max-width:_600px)]:[&[class~='group/search-dialog']]:max-h-[calc(100dvh_-_var(--dir-app-shell-height,_48px)_-_24px)] [&[class~='group/screen-create-dialog']]:w-[min(680px,_calc(100vw_-_32px))] [&[class~='group/screen-create-dialog']_[class~='group/crm-dialog-footer']]:flex [&[class~='group/screen-create-dialog']_[class~='group/crm-dialog-footer']]:justify-end [&[class~='group/screen-create-dialog']_[class~='group/crm-dialog-footer']]:gap-[8px] ${
            drawer
              ? "inset-[48px_0_0_auto] [transform:none] w-[min(760px,94vw)] max-h-[none] rounded-[10px_0_0_0] [@media(max-width:600px)]:w-[100vw] [@media(max-width:600px)]:max-h-[none] [@media(max-width:600px)]:top-[48px] [@media(max-width:600px)]:rounded-none [&_[class~='group/crm-dialog-body']]:flex-1 [&_[class~='group/crm-dialog-body']]:flex [&_[class~='group/crm-dialog-body']]:overflow-hidden [&_[class~='group/crm-properties']]:grid [&_[class~='group/crm-properties']]:grid-cols-[1fr_1fr] [&_[class~='group/crm-properties']]:gap-[0_20px] [@media(max-width:600px)]:[&_[class~='group/crm-properties']]:block"
              : ''
          }  ${className}`}
          initialFocus={() => {
            const popup = Array.from(document.querySelectorAll("[class~='group/crm-dialog']")).at(-1)
            return (popup?.querySelector('input:not([type=hidden])') ?? popup?.querySelector('button')) as HTMLElement
          }}
        >
          {hideHeading
            ? (
              <BaseDialog.Title className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
                {title}
              </BaseDialog.Title>
            )
            : (
              <header className='flex items-center justify-between p-[12px_18px] [border-bottom:1px_solid_var(--ui-border)] shrink-0 [&_h2]:font-semibold [&_h2]:text-[length:var(--dir-text-section)] [&_h2]:leading-[1.4]'>
                <BaseDialog.Title>{title}</BaseDialog.Title>
                <BaseDialog.Close render={<IconButton label={t('閉じる')} />}>
                  <XIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                </BaseDialog.Close>
              </header>
            )}
          <BaseDialog.Description className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
            {title}
          </BaseDialog.Description>
          <div className='group/crm-dialog-body min-h-0 overflow-auto'>{children}</div>
          {footer && (
            <footer className='group/crm-dialog-footer p-[12px_18px] [border-top:1px_solid_var(--ui-border)]'>
              {footer}
            </footer>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

export function Drawer(props: Omit<ComponentProps<typeof Dialog>, 'drawer'>) {
  return <Dialog {...props} drawer />
}
