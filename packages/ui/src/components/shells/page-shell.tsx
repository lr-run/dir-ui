// Layout 1: a header only. For single-purpose tools and one-off forms; header tabs switch between a few views.
import type { ReactNode } from 'react'
import { TabBar } from '@/components/ui/tab-bar.tsx'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import {
  shellCanvasClass,
  ShellPage,
  type ShellPageProps,
  shellPillTabsClass,
  ShellTopBar,
} from '@/components/shells/shell-parts.tsx'

export type PageShellProps = ShellPageProps & {
  /** Product mark and name at the left of the header. */
  brand: ReactNode
  /** Up to five views in the header; on phones they move to a row under it. */
  tabs?: { id: string; label: string }[]
  /** Id of the current tab. */
  tab?: string
  onTabChange?: (id: string) => void
  /** Account menu or avatar at the right of the header. */
  trailing?: ReactNode
  className?: string
}

export function PageShell({ brand, tabs, tab, onTabChange, trailing, className = '', ...page }: PageShellProps) {
  const pill = tabs?.length
    ? (
      <Tabs value={tab} onValueChange={(next) => onTabChange?.(String(next))} className='min-w-0 max-[800px]:hidden'>
        <TabsList aria-label='Views' className={shellPillTabsClass} data-variant='pill'>
          {tabs.map((item) => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
    )
    : null
  return (
    <div className={`group/shell-page flex h-full min-h-0 min-w-0 flex-col ${shellCanvasClass} ${className}`}>
      <ShellTopBar brand={brand} trailing={trailing}>{pill}</ShellTopBar>
      {tabs?.length
        ? (
          <TabBar
            label='Views'
            items={tabs.map((item) => ({ value: item.id, label: item.label }))}
            value={tab}
            onValueChange={onTabChange}
            className='hidden max-[800px]:flex'
          />
        )
        : null}
      <ShellPage {...page} className='mx-3 mb-3 max-[800px]:m-0' />
    </div>
  )
}
