// Tabs inside the page content, under the page header: a full-width band of line tabs with optional actions at the
// right. Put each tab's TabsContent in `children`.
import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'

export type TabBarItem = { value: string; label: ReactNode; count?: number; disabled?: boolean }

export function TabBar({ label, items, value, defaultValue, onValueChange, actions, children, className }: {
  /** Accessible name of the tab list, such as "Client sections". */
  label: string
  items: TabBarItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Controls for the current tab, such as a filter or a view switch, at the right of the band. */
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(next) => onValueChange?.(String(next))}
      className='min-w-0 gap-0'
    >
      <div
        data-slot='tab-bar'
        className={cn(
          'flex min-h-12 shrink-0 items-center gap-3 border-b border-border px-1.5 max-[600px]:px-0.5',
          className,
        )}
      >
        <TabsList
          aria-label={label}
          className='min-w-0 group-data-[orientation=horizontal]/tabs:h-[47px] max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        >
          {items.map((item) => (
            <TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
              {item.label}
              {item.count !== undefined && (
                <span className='text-[12px] text-muted-foreground tabular-nums'>{item.count.toLocaleString()}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {actions && <div className='ml-auto flex shrink-0 items-center gap-2 pr-2'>{actions}</div>}
      </div>
      {children}
    </Tabs>
  )
}
