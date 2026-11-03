import { type ReactNode, useEffect, useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { foundationPages } from '../navigation.ts'
import { type Theme, themes } from '../theme-presets.ts'
import { Page } from './showcase.tsx'
import { ThemeCard } from './theme-card.tsx'

/** Semantic colors are Tailwind names; the library maps them to --ui-* tokens in tailwind.css. */
const colorGroups: { title: string; note: string; colors: [name: string, token: string, use: string][] }[] = [
  {
    title: 'Surfaces',
    note: 'From the canvas behind everything to the raised surface of a popover.',
    colors: [
      ['bg-(--ui-canvas)', '--ui-canvas', 'Page background, behind the layout panel'],
      ['bg-(--ui-sidebar)', '--ui-sidebar', 'Sidebar and the canvas of the layouts'],
      ['bg-background', '--ui-surface', 'Panels, tables and forms'],
      ['bg-(--ui-raised)', '--ui-raised', 'Popovers, dialogs and menus'],
      ['bg-muted', '--ui-subtle', 'Code, chips and quiet fills'],
      ['bg-accent', '--ui-hover', 'Hover and selected rows'],
    ],
  },
  {
    title: 'Text and lines',
    note: 'Two text colors and one line color cover almost every screen.',
    colors: [
      ['text-foreground', '--ui-text', 'Body text and values'],
      ['text-muted-foreground', '--ui-muted', 'Labels, captions and secondary text'],
      ['border-border', '--ui-border', 'Dividers, table lines and panel borders'],
      ['ring-ring', '--ui-ring', 'Focus ring'],
    ],
  },
  {
    title: 'Actions',
    note: 'One filled color, used by the one primary action of a screen.',
    colors: [
      ['bg-primary', '--ui-primary', 'Primary button'],
      ['text-primary-foreground', '--ui-on-primary', 'Text on the primary button'],
      ['text-destructive', '--ui-red', 'Destructive actions and errors'],
    ],
  },
  {
    title: 'Status',
    note: 'Always a dot and a label, never color alone. Each has a tinted background for banners.',
    colors: [
      ['--ui-green', '--ui-green', 'Done, healthy, paid'],
      ['--ui-blue', '--ui-blue', 'Information, in progress'],
      ['--ui-amber', '--ui-amber', 'Needs attention, waiting'],
      ['--ui-red', '--ui-red', 'Failed, overdue, rejected'],
      ['--ui-violet', '--ui-violet', 'A fifth category when needed'],
    ],
  },
  {
    title: 'Charts',
    note: 'Series colors are separate from status colors.',
    colors: [
      ['--chart-primary', '--chart-primary', 'First series'],
      ['--chart-secondary', '--chart-secondary', 'Second series, comparisons and targets'],
    ],
  },
]
const type = [
  ['text-xs', '12px / 16px', 'text-xs', 'Labels, captions, table headers'],
  ['text-sm', '14px / 20px', 'text-sm', 'Body text and form controls'],
  ['text-base', '16px / 24px', 'text-base', 'Page titles in the layout header'],
  ['text-lg', '18px / 28px', 'text-lg', 'Section titles on long pages'],
  ['text-xl', '20px / 28px', 'text-xl', 'Dashboard figures'],
  ['text-2xl', '24px / 32px', 'text-2xl', 'Headline numbers'],
  ['font-medium · font-semibold', '500 · 600', 'text-sm font-semibold', 'Emphasis and titles; never bold body text'],
  ['tabular-nums', '¥12,480,000 · 2026/11/02', 'text-sm tabular-nums', 'Every number in a table or a stat'],
]
const spacing = [
  [1, 'Icon to its label'],
  [2, 'Buttons in a group, chips'],
  [3, 'Inside a toolbar'],
  [4, 'Between form fields, page gutter on phones'],
  [6, 'Page gutter on desktop, between panels'],
  [8, 'Between page sections'],
  [12, 'Around empty states'],
] as const
const radii = [
  ['rounded-sm', 4, 'Badges and chips'],
  ['rounded-md', 6, 'Buttons, inputs and selects'],
  ['rounded-lg', 8, 'Panels, cards and previews'],
  ['rounded-xl', 12, 'The layout page panel and dialogs'],
  ['rounded-2xl', 16, 'Large marketing surfaces only'],
  ['rounded-full', 999, 'Avatars, status dots and pill tabs'],
] as const
const shadows = [
  ['shadow-sm', 'The layout page panel and selected segments'],
  ['shadow-md', 'Popovers and menus'],
  ['shadow-lg', 'Dialogs and sheets'],
] as const
const breakpoints = [['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280], ['2xl', 1536]] as const
const libraryBreakpoints = [
  [600, 'Dialogs go full width; page gutters drop to 16px'],
  [800, 'Sidebars open as a sheet; SuiteShell tabs move to the bottom'],
  [1000, 'The sidebar narrows to 200px'],
] as const
/** Company colors change these tokens only; everything else comes from the theme. */
const customization = [
  '--ui-primary',
  '--ui-on-primary',
  '--ui-primary-top',
  '--ui-primary-hover',
  '--ui-ring',
  '--dir-radius',
]

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className='flex flex-col gap-3'>
      <div>
        <h2 className='m-0 text-[16px] font-semibold tracking-tight'>{title}</h2>
        {note && <p className='m-0 mt-1 text-[13px] leading-5 text-muted-foreground'>{note}</p>}
      </div>
      {children}
    </section>
  )
}
const rows =
  'm-0 overflow-hidden rounded-lg border border-border p-0 [&>li]:list-none [&>li+li]:border-t [&>li+li]:border-border'

function useTokenValues(tokens: string[]) {
  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement)
      setValues(Object.fromEntries(tokens.map((token) => [token, style.getPropertyValue(token).trim()])))
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-ui-theme'] })
    return () => observer.disconnect()
  }, [tokens])
  return values
}

function Colors() {
  const values = useTokenValues(colorGroups.flatMap((group) => group.colors.map(([, token]) => token)))
  return colorGroups.map((group) => (
    <Section key={group.title} title={group.title} note={group.note}>
      <ul className={rows}>
        {group.colors.map(([name, token, use]) => (
          <li
            key={name}
            className='grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-4 px-4 py-3 max-[600px]:grid-cols-[44px_minmax(0,1fr)]'
          >
            <i
              className='block size-11 rounded-lg border border-border bg-(--swatch)'
              style={{ '--swatch': `var(${token})` } as React.CSSProperties}
            />
            <span className='flex min-w-0 flex-col gap-0.5'>
              <code className='truncate text-[12px] font-medium'>{name}</code>
              <code className='truncate text-[11px] text-muted-foreground' title={values[token]}>
                {token} · {values[token]?.replace(/^light-dark\(/, '').replace(/\)$/, '') || '—'}
              </code>
            </span>
            <span className='text-[13px] text-muted-foreground max-[600px]:col-span-2'>{use}</span>
          </li>
        ))}
      </ul>
    </Section>
  ))
}
function Typography() {
  return (
    <Section title='Scale' note='System UI with Noto Sans JP for Japanese. Most screens use only xs, sm and base.'>
      <ul className={rows}>
        {type.map(([name, spec, className, use]) => (
          <li key={name} className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3'>
            <span className={`${className} min-w-0`}>{name}</span>
            <span className='flex items-baseline gap-4'>
              <span className='text-[13px] text-muted-foreground'>{use}</span>
              <code className='text-[11px] whitespace-nowrap text-muted-foreground'>{spec}</code>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
function Spacing() {
  return (
    <Section title='Scale' note='Tailwind’s 4px steps. Increase spacing on phones, never control size.'>
      <ul className={rows}>
        {spacing.map(([step, use]) => (
          <li
            key={step}
            className='grid grid-cols-[48px_minmax(0,200px)_minmax(0,1fr)] items-center gap-4 px-4 py-3 text-[13px] max-[600px]:grid-cols-[48px_minmax(0,1fr)]'
          >
            <code className='text-[12px] text-muted-foreground'>{step} · {step * 4}px</code>
            <span className='h-3 rounded-[2px] bg-primary' style={{ width: step * 4 }} aria-hidden='true' />
            <span className='text-muted-foreground max-[600px]:col-span-2'>{use}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
function Radius() {
  return (
    <Section title='Scale' note='Smaller elements get smaller corners; the page panel is the roundest surface.'>
      <div className='grid grid-cols-3 gap-4 max-[800px]:grid-cols-2'>
        {radii.map(([name, px, use]) => (
          <div key={name} className='flex flex-col gap-3 rounded-lg border border-border p-4'>
            <span className='h-16 border border-border bg-(--ui-subtle)' style={{ borderRadius: Math.min(px, 32) }} />
            <span>
              <code className='block text-[12px] font-medium'>{name} · {px === 999 ? '9999px' : `${px}px`}</code>
              <span className='block text-[13px] text-muted-foreground'>{use}</span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
function Shadow() {
  return (
    <Section title='Elevation' note='Most surfaces are flat with a border. Shadows mark what floats above the page.'>
      <div className='grid grid-cols-3 gap-6 rounded-lg border border-border bg-(--ui-sidebar) p-8 max-[700px]:grid-cols-1'>
        {shadows.map(([name, use]) => (
          <div key={name} className='flex flex-col gap-3'>
            <span className={`block h-24 rounded-lg bg-(--ui-raised) ${name}`} aria-hidden='true' />
            <span>
              <code className='block text-[12px] font-medium'>{name}</code>
              <span className='block text-[13px] text-muted-foreground'>{use}</span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
function Breakpoints() {
  return (
    <>
      <Section title='Tailwind' note='The default breakpoints, for page content.'>
        <ul className={rows}>
          {breakpoints.map(([name, px]) => (
            <li key={name} className='flex items-center gap-4 px-4 py-3 text-[13px]'>
              <code className='w-8 font-medium'>{name}</code>
              <span className='h-2 rounded-[2px] bg-(--ui-hover)' style={{ width: `${(px / 1536) * 70}%` }} />
              <code className='ml-auto text-muted-foreground'>{px}px</code>
            </li>
          ))}
        </ul>
      </Section>
      <Section title='Library' note='Where the layouts and components change; do not introduce others.'>
        <ul className={rows}>
          {libraryBreakpoints.map(([px, use]) => (
            <li key={px} className='flex items-center gap-4 px-4 py-3 text-[13px]'>
              <code className='w-14 font-medium'>{px}px</code>
              <span className='text-muted-foreground'>{use}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
function Themes({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return (
    <>
      <Section
        title='Light, Black and Paper'
        note='theme.css is Light, and its light-dark() dark side is Black. black.css forces that side and paper.css swaps in warm paper tokens; copy either after theme.css. They are plain CSS files, not shadcn items, and components never branch on the theme name.'
      >
        <div className='grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1'>
          {themes.map((item) => (
            <ThemeCard
              key={item.id}
              theme={item.id}
              label={item.label}
              note={item.note}
              action={
                <Button
                  size='sm'
                  variant={theme === item.id ? 'default' : 'outline'}
                  onClick={() => onThemeChange(item.id)}
                  aria-pressed={theme === item.id}
                >
                  {theme === item.id ? 'Applied' : 'Apply to site'}
                </Button>
              }
            />
          ))}
        </div>
      </Section>
      <Section
        title='Company colors'
        note='A customer’s color changes these tokens only. Test every screen in Light, Black and Paper.'
      >
        <ul className='m-0 flex flex-wrap gap-2 p-0 [&_li]:list-none'>
          {customization.map((token) => (
            <li key={token}>
              <code className='rounded bg-muted px-1.5 py-0.5 text-[12px]'>{token}</code>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

export default function FoundationPage(
  { slug, theme, onThemeChange }: { slug: string; theme: Theme; onThemeChange: (theme: Theme) => void },
) {
  const page = foundationPages.find((item) => item.slug === slug)!
  return (
    <Page title={page.title} lead={page.summary}>
      {slug === 'color'
        ? <Colors />
        : slug === 'typography'
        ? <Typography />
        : slug === 'spacing'
        ? <Spacing />
        : slug === 'radius'
        ? <Radius />
        : slug === 'shadow'
        ? <Shadow />
        : slug === 'breakpoints'
        ? <Breakpoints />
        : <Themes theme={theme} onThemeChange={onThemeChange} />}
    </Page>
  )
}
