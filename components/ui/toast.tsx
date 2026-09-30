import { CheckIcon, XIcon } from 'lucide-react'
import { Toast } from '@base-ui/react/toast'
export { Toast } from '@base-ui/react/toast'
export function Toasts() {
  const { toasts } = Toast.useToastManager()
  return (
    <Toast.Portal>
      <Toast.Viewport className='fixed bottom-[50px] right-[20px] w-[380px] max-w-[calc(100vw_-_32px)] flex flex-col gap-[8px] [outline:0] [@media(max-width:_680px)]:right-[16px] z-2147483160'>
        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            toast={t}
            className='flex items-center gap-[9px] [background:var(--ui-raised)] text-foreground [border:1px_solid_var(--ui-border)] [box-shadow:var(--ui-shadow)] rounded-[9px] p-[11px_12px] text-[0.75rem] [transition:opacity_140ms,_transform_140ms] [&>svg]:text-[var(--ui-green)] [&_h2]:[font-size:inherit] [&_h2]:font-normal [&_h2]:m-0 [&_p]:m-0 [@media(prefers-reduced-motion:_reduce)]:[transition:none] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(8px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(8px)] [&[data-limited]]:hidden'
          >
            <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            <Toast.Content>
              <Toast.Title>{t.title}</Toast.Title>
              <Toast.Description>{t.description}</Toast.Description>
            </Toast.Content>
            {t.actionProps && (
              <Toast.Action
                {...t.actionProps}
                className='text-[var(--ui-violet)] text-[0.6875rem] p-[2px_5px] ml-auto whitespace-nowrap'
              >
                {t.actionProps.children}
              </Toast.Action>
            )}
            <Toast.Close
              aria-label='Dismiss notification'
              className='ml-auto w-[24px] h-[24px] grid [place-items:center] text-muted-foreground [&_svg]:w-[12px] [&_svg]:h-[12px]'
            >
              <XIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  )
}
