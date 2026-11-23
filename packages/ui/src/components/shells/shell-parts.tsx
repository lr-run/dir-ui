// Shared parts of the layout shells: navigation data, the page header and the content area.
import type { ReactNode } from 'react'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar.tsx'

export type ShellNavItem = { id: string; label: string; icon?: ReactNode; href?: string; shortcut?: string }
/** A sidebar holds at most two levels: an optional group label and its items. */
export type ShellNavGroup = { label?: string; items: ShellNavItem[] }
export type ShellPageProps = {
  /** Page title in the header; omit for screens that carry their own heading. */
  title?: ReactNode
  /** Back button for nested screens. */
  leading?: ReactNode
  /** Secondary buttons followed by one primary action. */
  actions?: ReactNode
  /** `full` for lists and grids, `narrow` (640px) for forms. */
  width?: 'full' | 'narrow'
  /** Use the phone header inset at every width. */
  compactHeader?: boolean
  /** Sticky bar at the bottom, such as the submit button of a form. */
  bottomBar?: ReactNode
  children: ReactNode
}

export function ShellNavigation(
  { groups, active, onNavigate }: { groups: ShellNavGroup[]; active?: string; onNavigate?: (id: string) => void },
) {
  const { setOpenMobile } = useSidebar()
  return groups.map((group, index) => (
    <SidebarGroup key={group.label ?? index} label={group.label}>
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              label={item.label}
              icon={item.icon}
              href={item.href}
              shortcut={item.shortcut}
              active={active === item.id}
              onClick={() => {
                onNavigate?.(item.id)
                setOpenMobile(false)
              }}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  ))
}

/** Opens the sidebar sheet on phones; wide screens always show the sidebar. */
export function ShellMenuTrigger() {
  return useSidebar().isMobile ? <SidebarTrigger /> : null
}

/** Canvas behind the inset page panel: the light gray frame that white panels sit on. */
export const shellCanvasClass = 'bg-(--ui-canvas) text-foreground'

/** The sidebar sits on the canvas; the current item is a soft tint of the primary color. */
export const sidebarGridClass =
  "grid grid-cols-[232px_minmax(0,1fr)] max-[1000px]:grid-cols-[200px_minmax(0,1fr)] max-[800px]:grid-cols-[minmax(0,1fr)] [&[data-sidebar-state='collapsed']]:grid-cols-[60px_minmax(0,1fr)] max-[800px]:[&[data-sidebar-state='collapsed']]:grid-cols-[minmax(0,1fr)] max-[800px]:[&>[class~='group/crm-sidebar-panel']]:hidden [&>[class~='group/crm-sidebar-panel']]:[background:transparent] [&>[class~='group/crm-sidebar-panel']]:[border-right:0] [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button']]:h-[34px] [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button']]:text-[13px] [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button']:hover]:[background:color-mix(in_srgb,var(--ui-text)_4%,transparent)] [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button'][data-active]]:[background:var(--ui-selected)] [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button'][data-active]]:text-primary [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button'][data-active]>svg]:text-primary [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-menu-button'][data-active]]:[box-shadow:none] [&>[class~='group/crm-sidebar-panel']_[class~='group/crm-sidebar-footer']]:[border-top:0]"

/** Page header, scrolling content and the optional sticky bottom bar, in a rounded panel on the canvas. */
export function ShellPage(
  { title, leading, actions, width = 'full', compactHeader, bottomBar, children, trigger, className = '' }:
    & ShellPageProps
    & { trigger?: ReactNode; className?: string },
) {
  const narrow = width === 'narrow'
  const column = narrow ? 'mx-auto w-full max-w-[640px]' : ''
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-(--ui-surface) max-[800px]:rounded-none max-[800px]:border-0 max-[800px]:shadow-none ${className}`}
    >
      {/* The menu button alone does not make a header: screens with their own header place it themselves. */}
      {(title !== undefined || leading || actions) && (
        <header
          className={`flex h-14 shrink-0 items-center border-b border-border max-[600px]:h-12 ${
            compactHeader ? 'px-4' : 'px-6 max-[600px]:px-4'
          }`}
        >
          <div className={`flex min-w-0 flex-1 items-center gap-2 ${column}`}>
            {trigger}
            {leading}
            {title !== undefined && <h1 className='m-0 min-w-0 flex-1 truncate text-[16px] font-semibold'>{title}</h1>}
            {/* On phones the actions move to a bar pinned at the bottom (rule 4), unless the page has its own. */}
            {actions && (
              <div className={`ml-auto flex shrink-0 items-center gap-2 ${bottomBar ? '' : 'max-[600px]:hidden'}`}>
                {actions}
              </div>
            )}
          </div>
        </header>
      )}
      <div className='min-h-0 flex-1 overflow-auto'>
        {narrow ? <div className={`${column} p-6 max-[600px]:p-4`}>{children}</div> : children}
      </div>
      {actions && !bottomBar && (
        <div className='hidden shrink-0 gap-2 border-t border-border bg-(--ui-surface) px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] max-[600px]:flex [&_[data-slot=button]]:h-8 [&_[data-slot=button]]:flex-1'>
          {actions}
        </div>
      )}
      {bottomBar && (
        <div className='shrink-0 border-t border-border bg-(--ui-surface)'>
          <div
            className={`flex items-center justify-end gap-2 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] max-[600px]:px-4 max-[600px]:[&_[data-slot=button]]:h-8 max-[600px]:[&_[data-slot=button]]:flex-1 ${column}`}
          >
            {bottomBar}
          </div>
        </div>
      )}
    </div>
  )
}

/** Pill tabs in the top bar: the shell's top-level sections or a page tool's views. */
export const shellPillTabsClass =
  'group-data-[orientation=horizontal]/tabs:h-9 gap-0.5 rounded-full border border-border bg-(--ui-surface) p-[3px] [&_[data-slot=tabs-trigger]]:h-7 [&_[data-slot=tabs-trigger]]:rounded-full [&_[data-slot=tabs-trigger]]:border-0 [&_[data-slot=tabs-trigger]]:px-3.5 [&_[data-slot=tabs-trigger]]:text-[13px] [&_[data-slot=tabs-trigger]]:data-active:bg-primary [&_[data-slot=tabs-trigger]]:data-active:text-primary-foreground'

/** Brand at the left and account or actions at the right, on the canvas above the page panel. */
export function ShellTopBar(
  { brand, children, trailing }: { brand: ReactNode; children?: ReactNode; trailing?: ReactNode },
) {
  return (
    <div className='flex h-14 shrink-0 items-center gap-6 px-4 max-[800px]:h-12 max-[800px]:border-b max-[800px]:border-border max-[800px]:bg-(--ui-surface)'>
      <div className='flex shrink-0 items-center gap-2.5 text-[14px] font-semibold tracking-tight'>{brand}</div>
      {children}
      {trailing && <div className='ml-auto flex shrink-0 items-center gap-2'>{trailing}</div>}
    </div>
  )
}
