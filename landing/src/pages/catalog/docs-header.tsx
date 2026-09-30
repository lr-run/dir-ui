import { MoonIcon, SunIcon } from 'lucide-react'
import { landingHref } from '../../routes.ts'
import type { ReactNode } from 'react'
import { IconButton } from '../../../../components/ui/icon-button.tsx'

export function DocsHeader({ isStudio, isHome, dark, onNavigate, onToggleTheme, controls, actions }: {
  isStudio: boolean
  isHome: boolean
  controls?: ReactNode
  actions?: ReactNode
  dark: boolean
  onNavigate: (id: string) => void
  onToggleTheme: () => void
}) {
  return (
    <header
      className={`sticky top-0 z-20 grid h-(--docs-header-height) shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-6 border-b border-border bg-background px-6 max-[1100px]:grid-cols-[minmax(0,1fr)_auto] max-[700px]:gap-x-2 max-[700px]:px-4 ${
        controls ? 'max-[1100px]:grid-rows-[55px_44px]' : ''
      }`}
    >
      <div className='flex min-w-0 items-center gap-6 max-[700px]:gap-3'>
        <a
          href={landingHref('home')}
          className='inline-flex shrink-0 items-center gap-2.5 rounded-sm text-base leading-none font-semibold tracking-tight text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
          aria-label='dir/ui'
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            onNavigate('home')
          }}
        >
          <svg className='block size-5 shrink-0' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
            <rect x='3' y='3' width='18' height='18' rx='2' stroke='currentColor' strokeWidth='1.75' />
            <path d='M4 20 20 4v14a2 2 0 0 1-2 2H4Z' fill='currentColor' />
          </svg>
          <span className='max-[600px]:hidden'>dir/ui</span>
        </a>
        <nav className='flex h-8 items-center gap-1' aria-label='Documentation sections'>
          {[{
            label: 'Components',
            id: 'button',
            href: landingHref('button'),
            selected: !isStudio && !isHome,
          }, { label: 'CRM', id: 'studio', href: landingHref('studio'), selected: isStudio }].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className='inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-[700px]:px-2'
              aria-current={item.selected ? 'page' : undefined}
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                onNavigate(item.id)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      {controls && (
        <div className='min-w-0 max-[1100px]:col-span-2 max-[1100px]:col-start-1 max-[1100px]:row-start-2 max-[1100px]:flex max-[1100px]:h-11 max-[1100px]:items-center max-[1100px]:justify-center max-[1100px]:border-t max-[1100px]:border-border'>
          {controls}
        </div>
      )}
      <div className='col-start-3 row-start-1 flex items-center justify-end gap-3 max-[1100px]:col-start-2 max-[700px]:gap-2'>
        {actions}
        <div className={actions ? 'flex border-l border-border pl-3 max-[700px]:pl-2' : 'flex'}>
          <IconButton
            variant='ghost'
            label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggleTheme}
          >
            {dark
              ? <SunIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
              : <MoonIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
          </IconButton>
        </div>
      </div>
    </header>
  )
}
