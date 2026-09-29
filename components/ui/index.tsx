import type { ComponentProps, ReactNode } from 'react'
import { Button as BaseButton } from '../shadcn/button.tsx'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Menu } from '@base-ui/react/menu'
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select.tsx'
import { useI18n } from '../../lib/i18n.tsx'
import { I } from '../icons/index.jsx'
export { I }
export { Tabs } from '@base-ui/react/tabs'
export { Popover } from '@base-ui/react/popover'
export { Tooltip } from '@base-ui/react/tooltip'
export { Toast } from '@base-ui/react/toast'
export { Combobox } from '@base-ui/react/combobox'
export { Switch } from '@base-ui/react/switch'
export { Avatar } from '@base-ui/react/avatar'
export { Menu as DropdownMenu }
export function Button(
  { variant = 'secondary', className = '', ...props }: Omit<ComponentProps<typeof BaseButton>, 'variant'> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  },
) {
  return (
    <BaseButton
      {...props}
      variant={variant === 'primary'
        ? 'default'
        : variant === 'danger'
        ? 'destructive'
        : variant === 'secondary'
        ? 'outline'
        : 'ghost'}
      className={`${className}`}
    />
  )
}
export function IconButton(
  { label, children, className = '', title, ...props }: ComponentProps<typeof Button> & { label: string },
) {
  return (
    <Button
      {...props}
      aria-label={label}
      title={title ?? label}
      className={`group/crm-icon-button w-[28px] p-0 [&_[class~='group/svg-wrap']]:w-[15px] [&_[class~='group/svg-wrap']]:h-[15px] [&_[class~='group/svg-wrap']]:shrink-0 ${className}`}
    >
      {children}
    </Button>
  )
}
export function Checkbox(
  { label, disabled, readOnly, ...props }: ComponentProps<typeof BaseCheckbox.Root> & { label: string },
) {
  return (
    <BaseCheckbox.Root
      {...props}
      disabled={disabled || readOnly}
      aria-label={label}
      className="w-[15px] h-[15px] shrink-0 p-0 inline-flex items-center justify-center [border:1px_solid_var(--ui-border)] rounded-[4px] [background:var(--ui-raised)] align-middle cursor-pointer [&:focus-visible]:[outline:2px_solid_var(--dir-focus)] [&:focus-visible]:outline-offset-[2px] [&[data-checked]]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)] [&[data-checked]]:text-white [&[data-indeterminate]]:[background:var(--ui-primary)] [&[data-indeterminate]]:[border-color:var(--ui-primary)] [&[data-indeterminate]]:text-white [&_[class~='group/svg-wrap']]:w-[12px] [&_[class~='group/svg-wrap']]:h-[12px]"
    >
      <BaseCheckbox.Indicator>
        <I name='check' />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}
export function Select({ value, onChange, items, label, disabled, id, invalid }: {
  value: string
  onChange: (value: string) => void
  items: { value: string; label: string }[]
  label: string
  disabled?: boolean
  id?: string
  invalid?: boolean
}) {
  return (
    <SelectRoot value={value} onValueChange={(v) => v !== null && onChange(v)} items={items} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-label={label}
        aria-invalid={invalid}
        className="group/crm-select flex items-center justify-between gap-[12px] text-left [&_[class~='group/svg-wrap']]:w-[14px] [&_[class~='group/svg-wrap']]:h-[14px] [&_[class~='group/svg-wrap']]:shrink-0 [&>span:first-child]:overflow-hidden [&>span:first-child]:text-ellipsis [&>span:first-child]:whitespace-nowrap w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
      </SelectContent>
    </SelectRoot>
  )
}

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
                  <I name='x' />
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
            <Button variant='danger' disabled={busy} onClick={onConfirm}>
              {busy ? t('処理中…', 'Working…') : action}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
export function MenuPopup({ children }: { children: ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        className="z-2147483140 [&_[class~='group/query-action-menu']]:min-w-[240px]"
        sideOffset={5}
        align='end'
      >
        <Menu.Popup className='min-w-[190px] max-h-[min(var(--available-height,70vh),70vh)] max-w-[calc(100vw_-_20px)] overflow-y-auto [background:var(--ui-raised)] text-foreground p-[5px] [border:1px_solid_var(--ui-border)] rounded-[8px] [box-shadow:var(--ui-shadow)] [outline:none] [@media(max-width:_600px)]:[&_input]:text-[length:var(--dir-text-section)]'>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="group/crm-empty flex flex-col items-center justify-center gap-[12px] p-[32px_16px] text-muted-foreground text-[length:var(--dir-text-label)] text-center [&>[class~='group/svg-wrap']]:w-[24px] [&>[class~='group/svg-wrap']]:h-[24px] [&>[class~='group/svg-wrap']]:opacity-50">
      <I name='database' />
      <p>{title}</p>
      {children}
    </div>
  )
}
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
export function Skeleton({ label }: { label: string }) {
  return (
    <div
      role='status'
      aria-label={label}
      className='grid gap-[14px] p-[24px] [&_span]:h-[16px] [&_span]:w-[85%] [&_span]:[background:var(--ui-hover)] [&_span]:rounded-[4px] [&_span:nth-child(2)]:w-[65%] [&_span:nth-child(3)]:w-[75%]'
    >
      <span />
      <span />
      <span />
    </div>
  )
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className='inline-flex items-center p-[2px_6px] [border:1px_solid_var(--ui-border)] rounded-[4px] text-[length:var(--dir-text-caption)] text-muted-foreground font-normal'>
      {children}
    </span>
  )
}
