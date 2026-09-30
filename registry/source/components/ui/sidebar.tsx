import '@/components/ui/dir-theme.css'
import { ChevronDownIcon, PanelLeftIcon } from 'lucide-react'
// Composition follows shadcn/ui's Base UI Sidebar recipe; scoped to the Dir app shell.
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'
import { Tooltip } from '@base-ui/react/tooltip'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { useI18n } from '@/lib/i18n.tsx'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet.tsx'
import { cn } from 'cn'
type SidebarState = {
  open: boolean
  openMobile: boolean
  isMobile: boolean
  setOpenMobile: (open: boolean) => void
  toggleSidebar: () => void
}
const SidebarContext = createContext<SidebarState | null>(null)
const MobileContext = createContext(false)
export function useSidebar() {
  const value = useContext(SidebarContext)
  if (!value) throw new Error('Sidebar components require SidebarProvider')
  return value
}
export function SidebarProvider({ children, className, openMobile, setOpenMobile }: {
  children: ReactNode
  className: string
  openMobile: boolean
  setOpenMobile: (value: boolean) => void
}) {
  const [isMobile, setIsMobile] = useState(() => matchMedia('(max-width: 800px)').matches)
  const [open, setOpen] = useState(true)
  const toggleSidebar = useCallback(() => {
    if (matchMedia('(max-width: 800px)').matches) setOpenMobile(!openMobile)
    else setOpen((previous) => !previous)
  }, [openMobile, setOpenMobile])
  useEffect(() => {
    const media = matchMedia('(max-width: 800px)')
    const resized = () => {
      setIsMobile(media.matches)
      if (!media.matches) setOpenMobile(false)
    }
    media.addEventListener('change', resized)
    return () => media.removeEventListener('change', resized)
  }, [setOpenMobile])
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggleSidebar()
      }
    }
    globalThis.addEventListener('keydown', handle)
    return () => globalThis.removeEventListener('keydown', handle)
  }, [toggleSidebar])
  const value = useMemo(() => ({ open, openMobile, isMobile, setOpenMobile, toggleSidebar }), [
    open,
    openMobile,
    isMobile,
    setOpenMobile,
    toggleSidebar,
  ])
  return (
    <SidebarContext.Provider value={value}>
      <div className={className} data-sidebar-state={open ? 'expanded' : 'collapsed'}>{children}</div>
    </SidebarContext.Provider>
  )
}
export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  const { t } = useI18n(), { open, openMobile, setOpenMobile } = useSidebar()
  return (
    <>
      <aside
        className={cn(
          "group/crm-sidebar-panel relative flex flex-col min-w-0 min-h-0 h-full [background:var(--ui-sidebar)] [border-right:1px_solid_var(--ui-border)] text-foreground [&_kbd]:ml-auto [&_kbd]:text-[length:var(--dir-text-caption)] [&_kbd]:text-muted-foreground [&_kbd]:[font-family:inherit] [&[data-state='collapsed']_kbd]:hidden [&[data-state='collapsed']_[class~='group/screen-workspace-label']]:hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-label']]:hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-group-label']]:hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-menu-button']]:justify-center [&[data-state='collapsed']_[class~='group/crm-sidebar-menu-button']]:p-0 [&[data-state='collapsed']_[class~='group/crm-sidebar-menu-button']]:h-[36px] [&[data-state='collapsed']_[class~='group/crm-sidebar-footer']]:justify-center [&[data-state='collapsed']_[class~='group/crm-sidebar-footer']]:p-[8px] [&[data-state='collapsed']_[class~='group/crm-sidebar-content']]:overflow-x-hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-group']+[class~='group/crm-sidebar-group']]:[border-top:1px_solid_var(--ui-border)] [&[data-state='collapsed']_[class~='group/crm-sidebar-group']+[class~='group/crm-sidebar-group']]:pt-[10px]",
          className,
        )}
        data-state={open ? 'expanded' : 'collapsed'}
        aria-label={t('ワークスペース')}
      >
        {children}
        <SidebarRail />
      </aside>
      {openMobile && (
        <Sheet open onOpenChange={setOpenMobile}>
          <SheetContent
            side='left'
            className="[&_[class~='group/crm-sidebar-panel']]:flex-1 [&_[class~='group/crm-sidebar-panel']]:[border:0]"
          >
            <SheetTitle className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
              {t('ワークスペース')}
            </SheetTitle>
            <MobileContext.Provider value>
              <aside
                className={cn(
                  "group/crm-sidebar-panel relative flex flex-col min-w-0 min-h-0 h-full [background:var(--ui-sidebar)] [border-right:1px_solid_var(--ui-border)] text-foreground [&_kbd]:ml-auto [&_kbd]:text-[length:var(--dir-text-caption)] [&_kbd]:text-muted-foreground [&_kbd]:[font-family:inherit] [&[data-state='collapsed']_kbd]:hidden [&[data-state='collapsed']_[class~='group/screen-workspace-label']]:hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-label']]:hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-group-label']]:hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-menu-button']]:justify-center [&[data-state='collapsed']_[class~='group/crm-sidebar-menu-button']]:p-0 [&[data-state='collapsed']_[class~='group/crm-sidebar-menu-button']]:h-[36px] [&[data-state='collapsed']_[class~='group/crm-sidebar-footer']]:justify-center [&[data-state='collapsed']_[class~='group/crm-sidebar-footer']]:p-[8px] [&[data-state='collapsed']_[class~='group/crm-sidebar-content']]:overflow-x-hidden [&[data-state='collapsed']_[class~='group/crm-sidebar-group']+[class~='group/crm-sidebar-group']]:[border-top:1px_solid_var(--ui-border)] [&[data-state='collapsed']_[class~='group/crm-sidebar-group']+[class~='group/crm-sidebar-group']]:pt-[10px]",
                  className,
                )}
                data-state='expanded'
                aria-label={t('ワークスペース')}
              >
                {children}
              </aside>
            </MobileContext.Provider>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
export function SidebarHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[6px] p-[8px] shrink-0 [&_[class~='group/crm-sidebar-menu-button']:has(kbd)]:[border-color:var(--ui-border)] [&_[class~='group/crm-sidebar-menu-button']:has(kbd)]:[background:var(--ui-raised)] [&_[class~='group/crm-sidebar-menu-button']:has(kbd)]:h-[32px]",
        className,
      )}
      data-slot='sidebar-header'
    >
      {children}
    </div>
  )
}
export function SidebarContent({ children, className }: { children: ReactNode; className?: string }) {
  const { t } = useI18n()
  return (
    <nav
      className={cn(
        'group/crm-sidebar-content flex-1 min-h-0 overflow-auto overscroll-contain p-[4px_8px] [scrollbar-width:thin]',
        className,
      )}
      aria-label={t('メインナビゲーション', 'Main navigation')}
    >
      {children}
    </nav>
  )
}
export function SidebarFooter({ children }: { children: ReactNode }) {
  return (
    <div className='group/crm-sidebar-footer flex items-center gap-[8px] p-[8px_10px] mt-auto [border-top:1px_solid_var(--ui-border)] text-muted-foreground text-[length:var(--dir-text-label)] min-h-[48px] shrink-0'>
      {children}
    </div>
  )
}
export function SidebarGroup({ label, children }: { label?: string; children: ReactNode }) {
  const { open } = useSidebar(), mobile = useContext(MobileContext), [expanded, setExpanded] = useState(true)
  if (!label) return <div className='group/crm-sidebar-group p-[4px_0_12px]'>{children}</div>
  return (
    <Collapsible.Root
      className='group/crm-sidebar-group p-[4px_0_12px]'
      open={!open && !mobile ? true : expanded}
      onOpenChange={setExpanded}
    >
      <Collapsible.Trigger className='group/crm-sidebar-group-label flex items-center justify-between w-full h-[32px] p-[0_8px] rounded-[6px] text-muted-foreground text-[length:var(--dir-text-caption)] font-medium [&:hover]:[background:var(--ui-hover)] [&:hover]:text-foreground [&_svg]:w-[12px] [&_svg]:h-[12px] [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[-2px] [&[data-panel-open]_svg]:[transform:rotate(0)] [&:not([data-panel-open])_svg]:[transform:rotate(-90deg)]'>
        <span>{label}</span>
        <ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      </Collapsible.Trigger>
      <Collapsible.Panel>{children}</Collapsible.Panel>
    </Collapsible.Root>
  )
}
export function SidebarMenu({ children }: { children: ReactNode }) {
  return <ul className='flex flex-col gap-[3px] list-none m-0 p-0'>{children}</ul>
}
export function SidebarMenuItem({ children }: { children: ReactNode }) {
  return <li className='min-w-0 m-0 p-0'>{children}</li>
}
export function SidebarMenuButton({ label, icon, active, href, onClick, shortcut }: {
  label: string
  icon: ReactNode
  active?: boolean
  href?: string
  onClick: () => void
  shortcut?: string
}) {
  const { open } = useSidebar(), mobile = useContext(MobileContext)
  const content = (
    <>
      {icon}
      <span className='group/crm-sidebar-label min-w-0 overflow-hidden text-ellipsis'>{label}</span>
      {shortcut && <kbd>{shortcut}</kbd>}
    </>
  )
  const props = {
    className:
      'group/crm-sidebar-menu-button flex items-center gap-[10px] w-full h-[34px] p-[0_10px] [border:1px_solid_transparent] rounded-[6px] no-underline text-foreground text-[length:var(--dir-text-body)] font-normal text-left whitespace-nowrap [background:transparent] [&:hover]:[background:var(--ui-hover)] [&[data-active]]:[background:var(--ui-hover)] [&[data-active]]:font-medium [&[data-active]]:[box-shadow:0_1px_2px_#00000005] [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[-2px] [&>svg]:[flex:0_0_16px] [&>svg]:w-[16px] [&>svg]:h-[16px] [&>svg]:text-muted-foreground [&[data-active]>svg]:text-foreground',
    'aria-label': label,
    'data-active': active || undefined,
  }
  const button = href
    ? (
      <a
        {...props}
        href={href}
        aria-current={active ? 'page' : undefined}
        onClick={(event) => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onClick()
        }}
      >
        {content}
      </a>
    )
    : <button {...props} type='button' onClick={onClick}>{content}</button>
  return (
    <Tooltip.Root disabled={open || mobile}>
      <Tooltip.Trigger render={button} />
      <Tooltip.Portal>
        <Tooltip.Positioner side='right' sideOffset={10} className='z-2147483140'>
          <Tooltip.Popup className='p-[6px_9px] [border:1px_solid_var(--ui-border)] rounded-[6px] [background:var(--ui-text)] text-[var(--ui-raised)] text-[length:var(--dir-text-label)] [box-shadow:0_4px_12px_#0002]'>
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
export function SidebarTrigger() {
  const { t } = useI18n(), { open, openMobile, isMobile, toggleSidebar } = useSidebar()
  return (
    <IconButton
      label={t('サイドバーを切り替え', 'Toggle sidebar')}
      title={t('サイドバーを切り替え', 'Toggle sidebar') + ' (⌘/Ctrl+B)'}
      className="group/crm-sidebar-trigger [&[data-slot='button']]:p-0 [&[data-slot='button']]:w-[28px] [&[data-slot='button']]:h-[28px] [&[data-slot='button']]:[border:0] [&[data-slot='button']]:[background:transparent] [&[data-slot='button']]:[box-shadow:none] [&:hover]:[background:var(--ui-hover)]"
      aria-expanded={isMobile ? openMobile : open}
      onClick={toggleSidebar}
    >
      <PanelLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
    </IconButton>
  )
}
export function SidebarRail() {
  const { t } = useI18n(), { toggleSidebar } = useSidebar()
  return (
    <button
      type='button'
      className='absolute top-0 bottom-0 right-[-3px] w-[6px] [cursor:col-resize] z-2 [&:hover]:[background:var(--ui-border)]'
      tabIndex={-1}
      onClick={toggleSidebar}
      aria-label={t('サイドバーを切り替え', 'Toggle sidebar')}
    />
  )
}

/** A complementary right sidebar; stays beside the list when there is room. */
export function SidebarPanel(
  { children, title, onClose }: { children: ReactNode; title: string; onClose: () => void },
) {
  const [overlay, setOverlay] = useState(() => matchMedia('(max-width: 1100px)').matches)
  useEffect(() => {
    const media = matchMedia('(max-width: 1100px)')
    const change = () => setOverlay(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return (
    <Sheet
      open
      modal={overlay}
      disablePointerDismissal={!overlay}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side='right'
        inline={!overlay}
        className="crm-sidebar-inspector [&_[class~='group/crm-properties']]:block [&_[class~='group/crm-property']]:grid-cols-[120px_minmax(0,_1fr)] [@media(max-width:_600px)]:[&_[class~='group/crm-property']]:grid-cols-[100px_minmax(0,_1fr)]"
      >
        <SheetTitle className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
          {title}
        </SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  )
}
