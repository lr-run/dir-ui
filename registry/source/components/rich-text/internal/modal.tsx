import { XIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n.tsx'
import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
export function Modal(
  { open, onOpenChange, title, children, wide = false }: {
    open: boolean
    onOpenChange: (v: boolean) => void
    title: string
    children: ReactNode
    wide?: boolean
  },
) {
  const { t } = useI18n()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className='[backdrop-filter:blur(2px)] [transition:opacity_160ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] fixed inset-0 [background:var(--ui-overlay)] z-2147483100 [&[data-starting-style]]:opacity-0 [&[data-ending-style]]:opacity-0' />
        <Dialog.Popup
          className={"m-0 [transition:opacity_140ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] fixed left-[50%] top-[50%] [transform:translate(-50%,-50%)] [background:var(--ui-surface)] [border:1px_solid_var(--ui-border)] rounded-[12px] [box-shadow:var(--ui-shadow)] max-h-[90dvh] overflow-auto [outline:none] z-2147483110 [&[data-starting-style]]:opacity-0 [&[data-ending-style]]:opacity-0 group/app-modal w-[min(520px,calc(100vw_-_32px))] [&>header]:p-[17px_20px] [&>header]:[border-bottom:1px_solid_var(--ui-border)] [&>header]:flex [&>header]:items-center [&>header]:justify-between [&>header_h2]:text-[length:var(--dir-text-body)] [&>header_h2]:[font-weight:550] [&[class~='group/wide']]:w-[min(720px,calc(100vw_-_32px))] " +
            (wide ? 'group/wide' : '')}
          initialFocus={() =>
            Array.from(document.querySelectorAll("[class~='group/app-modal']")).at(-1)?.querySelector(
              'input,textarea,button',
            ) as HTMLElement}
        >
          <header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close
              className='w-[28px] h-[28px] inline-grid [place-items:center] text-muted-foreground rounded-[5px] [&:hover]:[background:var(--ui-hover)]'
              aria-label={t('閉じる')}
            >
              <XIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </Dialog.Close>
          </header>
          <Dialog.Description className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
            {title}
          </Dialog.Description>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
