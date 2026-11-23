import {
  ArrowLeftIcon,
  Building2Icon,
  ChartNoAxesColumnIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SquareCheckIcon,
  SunIcon,
  TargetIcon,
  UserRoundIcon,
} from 'lucide-react'
import { SearchDialog } from '@/components/collections/search-dialog.tsx'
import type { ExampleRecord } from '@/components/crm/types.ts'
import { searchRecords } from '@/components/crm/example/query.ts'
import { type ReactNode, useId, useLayoutEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/shells/app-shell.tsx'
import { ShellMenuTrigger, type ShellNavGroup } from '@/components/shells/shell-parts.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { useSidebar } from '@/components/ui/sidebar.tsx'
import { examples } from '@/components/crm/example/data.ts'
import type { ExampleKind } from '@/components/crm/types.ts'
const recordIcons = {
  tasks: <SquareCheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />,
  companies: <Building2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />,
  people: <UserRoundIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />,
  deals: <TargetIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />,
}
export function Layout(
  {
    kind,
    report = false,
    settings = false,
    onSettings,
    onReport,
    recordName,
    onBack,
    onNavigate,
    onSearch,
    href,
    children,
  }: {
    kind: ExampleKind
    settings?: boolean
    onSettings: () => void
    report?: boolean
    onReport: () => void
    onNavigate: (kind: ExampleKind) => void
    recordName?: string
    onBack?: () => void
    href: (path: string) => string
    searchOpen: boolean
    onSearch: () => void
    children: ReactNode
  },
) {
  const [colorMode, setColorMode] = useColorMode()
  const navigation: ShellNavGroup[] = [
    {
      items: [{
        id: 'search',
        label: 'Search records',
        icon: <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />,
        shortcut: '⌘K',
      }],
    },
    {
      label: 'Records',
      items: (Object.keys(examples) as ExampleKind[]).map((key) => ({
        id: key,
        label: examples[key].title,
        icon: recordIcons[key],
        href: href('/' + key),
      })),
    },
    {
      label: 'Insights',
      items: [{
        id: 'report',
        label: 'Report',
        icon: <ChartNoAxesColumnIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />,
        href: href('/report'),
      }],
    },
    {
      label: 'Workspace',
      items: [{
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon size={16} aria-hidden />,
        href: href('/settings'),
      }],
    },
  ]
  return (
    <AppShell
      workspace={
        <span className='flex min-w-0 items-center gap-2'>
          <span className='inline-grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-[13px] text-primary-foreground'>
            S
          </span>
          <span className='truncate text-[15px] font-medium tracking-tight'>Studio workspace</span>
        </span>
      }
      navigation={navigation}
      active={report ? 'report' : settings ? 'settings' : kind}
      onNavigate={(id) =>
        id === 'search'
          ? onSearch()
          : id === 'report'
          ? onReport()
          : id === 'settings'
          ? onSettings()
          : onNavigate(id as ExampleKind)}
      sidebarFooter={<ColorModeSwitcher mode={colorMode} onChange={setColorMode} />}
      title={recordName}
      compactHeader={Boolean(recordName)}
      leading={recordName && (
        <IconButton label={`Back to ${examples[kind].title.toLowerCase()}`} onClick={onBack}>
          <ArrowLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' />
        </IconButton>
      )}
    >
      <div className='flex h-full min-h-0 flex-col'>{children}</div>
    </AppShell>
  )
}

/** Opens the sidebar sheet on phones; on wide screens the sidebar is always open. */
export function WorkspaceSidebarTrigger() {
  return <ShellMenuTrigger />
}

export function WorkspaceSearch({ open, onOpenChange, collections, count, onOpenRecord }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: Partial<Record<ExampleKind, readonly ExampleRecord[]>>
  count: number
  onOpenRecord: (kind: ExampleKind, recordId: string) => void
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => open ? searchRecords(collections, count) : [], [open, collections, count])
  const byId = useMemo(() => new Map(results.map((item) => [item.id, item])), [results])
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const rank = (item: typeof results[number]) =>
      item.label.toLowerCase().includes(needle) ? 0 : item.description.toLowerCase().includes(needle) ? 1 : 2
    const ordered = needle
      ? [...results].sort((a, b) => rank(a) - rank(b))
      : (Object.keys(examples) as ExampleKind[]).flatMap((kind) =>
        results.filter((item) => item.kind === kind).slice(0, 5)
      )
    return ordered.map((item) => ({ ...item, icon: recordIcons[item.kind] }))
  }, [results, query])
  return (
    <SearchDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('')
        onOpenChange(next)
      }}
      query={query}
      onQueryChange={setQuery}
      shortcut
      title='Search records'
      inputLabel='Search records'
      placeholder='Search companies, people, deals, and tasks…'
      emptyMessage='No matching records. Try a different name, company, or email.'
      selectLabel='Open record'
      items={items}
      onSelect={(item) => {
        const result = byId.get(item.id)
        if (result) onOpenRecord(result.kind, result.recordId)
      }}
    />
  )
}

type ColorMode = 'dark' | 'light' | 'auto'
const colorModeStorageKey = 'dir-crm:color-mode'
const colorModes = [
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'auto', label: 'Auto', icon: MonitorIcon },
] as const

function useColorMode() {
  const [mode, setMode] = useState<ColorMode>(() => {
    if (typeof document === 'undefined') return 'auto'
    // The isolated documentation preview inherits the catalog's chosen theme.
    const inherited = document.documentElement.dataset.previewRuntime === 'true'
      ? document.documentElement.dataset.theme
      : undefined
    if (inherited === 'light' || inherited === 'dark') return inherited
    try {
      const saved = localStorage.getItem(colorModeStorageKey)
      if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved
    } catch {
      // Theme switching also works when browser storage is unavailable.
    }
    return 'auto'
  })
  useLayoutEffect(() => {
    const system = globalThis.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'auto' && system.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    if (mode !== 'auto') return
    system.addEventListener('change', apply)
    return () => system.removeEventListener('change', apply)
  }, [mode])
  const changeMode = (next: ColorMode) => {
    setMode(next)
    try {
      localStorage.setItem(colorModeStorageKey, next)
    } catch {
      // Keep the selection for this session if storage is blocked.
    }
  }
  return [mode, changeMode] as const
}

function ColorModeSwitcher({ mode, onChange }: { mode: ColorMode; onChange: (mode: ColorMode) => void }) {
  const { open, isMobile } = useSidebar()
  const name = useId()
  const collapsed = !open && !isMobile
  return (
    <div
      role='radiogroup'
      aria-label='Color mode'
      className={`grid w-full gap-0.5 rounded-md bg-muted p-0.5 ${collapsed ? 'grid-cols-1' : 'grid-cols-3'}`}
    >
      {colorModes.map(({ value, label, icon: Icon }) => (
        <label
          key={value}
          title={value === 'auto' ? 'Auto — follow system appearance' : `${label} mode`}
          className='relative min-w-0 cursor-pointer'
        >
          <input
            className='peer sr-only'
            type='radio'
            name={name}
            value={value}
            checked={mode === value}
            onChange={() => onChange(value)}
            aria-label={`${label} mode`}
          />
          <span className='flex h-7 items-center justify-center gap-1 rounded px-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-ring'>
            <Icon size={13} strokeWidth={1.5} aria-hidden className='shrink-0' />
            {!collapsed && <span>{label}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}
