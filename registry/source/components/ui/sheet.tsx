import '@/components/ui/dir-theme.css'
// shadcn Base UI Sheet composition, with an inline mode for desktop inspectors.
import { Dialog } from '@base-ui/react/dialog'
import { type ComponentProps, type ReactNode, useState } from 'react'
export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close
export const SheetTitle = Dialog.Title
export const SheetDescription = Dialog.Description
export function SheetContent(
  { children, side = 'right', inline = false, backdrop = true, className = '', ...props }:
    & ComponentProps<typeof Dialog.Popup>
    & {
      side?: 'left' | 'right'
      backdrop?: boolean
      inline?: boolean
    },
) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const popup = (
    <Dialog.Popup
      {...props}
      className={`fixed inset-[48px_0_0_auto] w-[min(440px,_100vw)] flex flex-col min-w-0 min-h-0 [background:var(--ui-raised)] text-foreground [border-left:1px_solid_var(--ui-border)] [box-shadow:-8px_0_28px_#0000000a] z-2147483110 [outline:none] overflow-hidden in-data-[preview-runtime=true]:top-0 [&[data-side='left']]:inset-[48px_auto_0_0] [&[data-side='left']]:w-[min(288px,_calc(100vw_-_40px))] [&[data-side='left']]:[border-left:0] [&[data-side='left']]:[border-right:1px_solid_var(--ui-border)] [&[data-inline]]:relative [&[data-inline]]:inset-auto [&[data-inline]]:w-auto [&[data-inline]]:h-full [&[data-inline]]:z-auto [&[data-inline]]:[box-shadow:none] [&[class~='group/screen-record-sheet']]:w-[min(820px,_100vw)] in-data-[preview-runtime=true]:[&[data-side='left']]:top-0 [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:top-[8px] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:right-[8px] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:bottom-[8px] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:w-[min(500px,_calc(100vw_-_16px))] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:[border:1px_solid_var(--ui-border)] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:rounded-[10px] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:[background:var(--ui-surface)] [&[class~='group/screen-record-sheet'][class~='group/record-preview']]:[box-shadow:-8px_0_32px_#00000012] [@media(max-width:_480px)]:[&[class~='group/screen-record-sheet'][class~='group/record-preview']]:inset-0 [@media(max-width:_480px)]:[&[class~='group/screen-record-sheet'][class~='group/record-preview']]:w-full [@media(max-width:_480px)]:[&[class~='group/screen-record-sheet'][class~='group/record-preview']]:rounded-none ${className}`}
      data-side={side}
      data-inline={inline || undefined}
    >
      {children}
    </Dialog.Popup>
  )
  return inline
    ? (
      <div ref={setContainer} className='group/crm-sheet-inline-host h-full min-h-0 min-w-0'>
        {container && <Dialog.Portal container={container} className='h-full min-h-0 min-w-0'>{popup}</Dialog.Portal>}
      </div>
    )
    : (
      <Dialog.Portal>
        {backdrop && (
          <Dialog.Backdrop className='fixed inset-[48px_0_0] [background:#10182840] z-2147483105 in-data-[preview-runtime=true]:top-0' />
        )}
        {popup}
      </Dialog.Portal>
    )
}
export function SheetHeader({ children }: { children: ReactNode }) {
  return (
    <header className='group/crm-sheet-header flex items-center gap-[8px] min-h-[48px] p-[12px_16px] shrink-0 [border-bottom:1px_solid_var(--ui-border)]'>
      {children}
    </header>
  )
}
export function SheetBody({ children }: { children: ReactNode }) {
  return <div className='flex-1 min-h-0 min-w-0 overflow-auto'>{children}</div>
}
export function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <footer className='flex items-center gap-[8px] min-h-[48px] p-[12px_16px] shrink-0 [border-top:1px_solid_var(--ui-border)] mt-auto'>
      {children}
    </footer>
  )
}
