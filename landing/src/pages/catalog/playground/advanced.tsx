import { Building2Icon, UserRoundIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, useMemo, useState } from 'react'
import {
  type Column,
  DataGrid,
  renderTextEditor,
  SelectColumn,
} from '../../../../../components/data-grid/data-grid.tsx'
import { Button } from '../../../../../components/ui/button.tsx'
import { ConfirmDialog } from '../../../../../components/ui/alert-dialog.tsx'
import { Dialog } from '../../../../../components/ui/dialog.tsx'
import { Toast } from '@base-ui/react/toast'
import { Header } from '../../../../../components/header.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '../../../../../components/ui/sidebar.tsx'
import { PopoverPanel } from '../../../../../components/ui/popover-panel.tsx'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu.tsx'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../../../../components/ui/sheet.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../../../components/ui/tooltip.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs.tsx'
import type { QueryField, RecordFilter, RecordSort } from '../../../../../components/data-grid/data-grid.tsx'
import { queryTextRecords } from '../../../../../lib/record-list-query.ts'
import { bool, num, type PreviewProps, str } from './model.ts'
import { expression as e, jsx, literal, source, state } from './code.ts'
import { Surface } from './surface.tsx'
export type Row = { id: number; name: string; team: string; email: string }
export function SimpleTable({ rows, caption }: { rows: Row[]; caption?: string }) {
  return (
    <div className='overflow-auto'>
      <table className='w-full [border-collapse:collapse] text-[13px] whitespace-nowrap [&_th]:p-[12px_16px] [&_th]:text-left [&_th]:[border-bottom:1px_solid_var(--ui-border)] [&_td]:p-[12px_16px] [&_td]:text-left [&_td]:[border-bottom:1px_solid_var(--ui-border)] [&_th]:text-muted-foreground [&_th]:text-[12px] [&_th]:font-medium [&_tbody_tr:last-child_td]:[border:0]'>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope='col'>Name</th>
            <th scope='col'>Team</th>
            <th scope='col'>Email</th>
          </tr>
        </thead>
        <tbody>
          {!rows.length && (
            <tr>
              <td colSpan={3}>No records yet.</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.team}</td>
              <td>{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export const tableCode = (rows: Row[], caption: string) =>
  jsx(
    'table',
    {
      className:
        'w-full [border-collapse:collapse] text-[13px] whitespace-nowrap [&_th]:p-[12px_16px] [&_th]:text-left [&_th]:[border-bottom:1px_solid_var(--ui-border)] [&_td]:p-[12px_16px] [&_td]:text-left [&_td]:[border-bottom:1px_solid_var(--ui-border)] [&_th]:text-muted-foreground [&_th]:text-[12px] [&_th]:font-medium [&_tbody_tr:last-child_td]:[border:0]',
    },
    `<caption>{${
      literal(caption)
    }}</caption>\n<thead><tr><th scope="col">Name</th><th scope="col">Team</th><th scope="col">Email</th></tr></thead>\n<tbody>\n${
      rows.length ? '' : '<tr><td colSpan={3}>No records yet.</td></tr>'
    }\n{${
      literal(rows)
    }.map((row: { id: number; name: string; team: string; email: string }) => <tr key={row.id}><td>{row.name}</td><td>{row.team}</td><td>{row.email}</td></tr>)}\n</tbody>`,
  )
export function Navigation(
  { title, group = 'CRM', active, change }: {
    title: string
    group?: string
    active: string
    change: (value: string) => void
  },
) {
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar>
      <SidebarHeader>
        <strong>{title}</strong>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup label={group}>
          <SidebarMenu>
            {['companies', 'people'].map((value) => (
              <SidebarMenuItem key={value}>
                <SidebarMenuButton
                  label={value === 'companies' ? 'Companies' : 'People'}
                  icon={value === 'companies'
                    ? <Building2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                    : <UserRoundIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />}
                  active={active === value}
                  onClick={() => {
                    change(value)
                    setOpenMobile(false)
                  }}
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
const navigationCode = (title: string, group: string) =>
  jsx(
    'Sidebar',
    {},
    jsx('SidebarHeader', {}, `{${literal(title)}}`) + '\n' +
      jsx(
        'SidebarContent',
        {},
        jsx(
          'SidebarGroup',
          { label: group },
          jsx(
            'SidebarMenu',
            {},
            ['companies', 'people'].map((value) =>
              jsx(
                'SidebarMenuItem',
                {},
                jsx('SidebarMenuButton', {
                  label: value === 'companies' ? 'Companies' : 'People',
                  icon: e(
                    value === 'companies'
                      ? '<Building2Icon size={16} strokeWidth={1.5} aria-hidden="true" />'
                      : '<UserRoundIcon size={16} strokeWidth={1.5} aria-hidden="true" />',
                  ),
                  active: e(`active === ${literal(value)}`),
                  onClick: e(`() => { setActive(${literal(value)}); setOpenMobile(false) }`),
                }),
              )
            ).join('\n'),
          ),
        ),
      ),
  )
export default function AdvancedPreview({ id, values: v, update }: PreviewProps) {
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set()),
    [message, setMessage] = useState('')
  const toast = Toast.useToastManager()
  const columns = useMemo<Column<Row>[]>(
    () => [
      SelectColumn,
      ...['name', 'team', 'email'].map((key) => ({
        key,
        name: key[0]!.toUpperCase() + key.slice(1),
        minWidth: 120,
        resizable: true,
        sortable: true,
        frozen: key === 'name',
        editable: bool(v, 'editable'),
        renderEditCell: renderTextEditor,
      })),
    ],
    [v.editable],
  )
  const search = str(v, 'search')
  const rows = (v.rows ?? []) as Row[]
  const sorts = (v.sorts ?? []) as RecordSort[]
  const filter = (v.filter ?? { conjunction: 'and', conditions: [] }) as RecordFilter
  const fields: QueryField[] = ['name', 'team', 'email'].map((id) => ({
    id,
    label: id[0]!.toUpperCase() + id.slice(1),
    type: 'text',
  }))
  const ordered = useMemo(
    () =>
      queryTextRecords(rows, { name: (r) => r.name, team: (r) => r.team, email: (r) => r.email }, {
        search,
        sorts,
        filter,
      }),
    [rows, search, sorts, filter],
  )
  let preview: ReactNode, body = '', setup = '', imports = ''
  const from = (names: string, path: string) => `import { ${names} } from './components/${path}'`
  const setOpen = (next: boolean) => update('open', next)
  if (id === 'table') {
    preview = <SimpleTable rows={rows} caption={str(v, 'caption')} />
    body = tableCode(rows, str(v, 'caption'))
  } else if (id === 'data-grid') {
    preview = (
      <DataGrid
        className='h-[320px] w-full'
        aria-label='Team members'
        columns={columns}
        rows={ordered}
        rowKeyGetter={(row) => row.id}
        onRowsChange={(next) => update('rows', rows.map((row) => next.find((changed) => changed.id === row.id) ?? row))}
        selectedRows={selected}
        onSelectedRowsChange={setSelected}
        search={{ value: search, onChange: (next) => update('search', next) }}
        columnMenus={bool(v, 'columnMenus')}
        sort={{ fields, value: sorts, onChange: (next) => update('sorts', next) }}
        filter={{ fields, value: filter, onChange: (next) => update('filter', next) }}
        columnSettings={bool(v, 'columnSettings')}
        rowHeight={num(v, 'rowHeight')}
        headerRowHeight={num(v, 'headerRowHeight')}
        renderers={{
          noRowsFallback: (
            <div
              className='group/crm-record-list-empty [grid-column:1_/_-1] p-[32px] text-center text-muted-foreground'
              role='status'
            >
              {rows.length ? 'No matching records.' : 'No records yet.'}
            </div>
          ),
        }}
      />
    )
    imports = from(
      'DataGrid, SelectColumn, renderTextEditor, type Column, type QueryField, type RecordSort, type RecordFilter',
      'data-grid/data-grid.tsx',
    ) +
      "\nimport { queryTextRecords } from './lib/record-list-query.ts'\nimport './tailwind.css'\ntype Row = { id: number; name: string; team: string; email: string }"
    setup = state('rows', rows, 'Row[]') + '\n' + state('search', search) +
      `\nconst [selected, setSelected] = useState<ReadonlySet<number>>(new Set(${literal([...selected])}))\n` +
      state('sorts', sorts, 'RecordSort[]') + '\n' + state('filter', filter, 'RecordFilter') +
      `\nconst fields: QueryField[] = ${
        literal(fields)
      }\nconst columns: Column<Row>[] = [SelectColumn, ...["name", "team", "email"].map(key => ({
        key, name: key[0]!.toUpperCase() + key.slice(1), minWidth: 120, resizable: true, sortable: true, frozen: key === "name",
        editable: ${bool(v, 'editable')}, renderEditCell: renderTextEditor,
      }))]\nconst ordered = queryTextRecords(rows, { name: r => r.name, team: r => r.team, email: r => r.email }, { search, sorts, filter })`
    body = jsx('DataGrid', {
      className: 'h-[320px] w-full',
      'aria-label': 'Team members',
      columns: e('columns'),
      rows: e('ordered'),
      onRowsChange: e('next => setRows(rows.map(row => next.find(changed => changed.id === row.id) ?? row))'),
      rowKeyGetter: e('row => row.id'),
      selectedRows: e('selected'),
      onSelectedRowsChange: e('setSelected'),
      search: e('{ value: search, onChange: setSearch }'),
      columnMenus: bool(v, 'columnMenus'),
      sort: e('{ fields, value: sorts, onChange: setSorts }'),
      filter: e('{ fields, value: filter, onChange: setFilter }'),
      columnSettings: bool(v, 'columnSettings'),
      rowHeight: v.rowHeight,
      headerRowHeight: v.headerRowHeight,
      renderers: e(
        '{ noRowsFallback: <div className="group/crm-record-list-empty [grid-column:1_/_-1] p-[32px] text-center text-muted-foreground" role="status">{rows.length ? "No matching records." : "No records yet."}</div> }',
      ),
    })
  } else if (id === 'tabs') {
    const p = { value: str(v, 'value'), orientation: str(v, 'orientation') as 'horizontal' | 'vertical' }
    preview = (
      <Tabs {...p} onValueChange={(next) => update('value', String(next))}>
        <TabsList activateOnFocus={bool(v, 'activateOnFocus')} aria-label='Record sections'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='activity' disabled={bool(v, 'disabled')}>Activity</TabsTrigger>
        </TabsList>
        <TabsContent value='overview'>Company overview</TabsContent>
        <TabsContent value='activity'>Recent activity</TabsContent>
      </Tabs>
    )
    imports = from('Tabs, TabsList, TabsTrigger, TabsContent', 'ui/tabs.tsx')
    setup = state('value', p.value)
    body = jsx(
      'Tabs',
      { ...p, value: e('value'), onValueChange: e('setValue') },
      jsx(
        'TabsList',
        { activateOnFocus: bool(v, 'activateOnFocus'), 'aria-label': 'Record sections' },
        '<TabsTrigger value="overview">Overview</TabsTrigger>\n' +
          jsx('TabsTrigger', { value: 'activity', disabled: bool(v, 'disabled') }, 'Activity'),
      ) +
        '\n<TabsContent value="overview">Company overview</TabsContent>\n<TabsContent value="activity">Recent activity</TabsContent>',
    )
  } else if (id === 'header') {
    preview = (
      <Header
        title={str(v, 'title')}
        leading={bool(v, 'leading')
          ? <Building2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          : undefined}
        actions={bool(v, 'actions')
          ? <Button onClick={() => setMessage('Action triggered')}>Add company</Button>
          : undefined}
      />
    )
    imports = from('Header', 'header.tsx') + '\n' + from('Button', 'ui/button.tsx')
    setup = state('message', '')
    body = jsx('Header', {
      title: v.title,
      leading: bool(v, 'leading')
        ? e('<Building2Icon size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />')
        : undefined,
      actions: bool(v, 'actions')
        ? e('<Button onClick={() => setMessage("Action triggered")}>Add company</Button>')
        : undefined,
    })
  } else if (id === 'sidebar') {
    const title = str(v, 'label'), group = str(v, 'group')
    preview = (
      <div className='h-80'>
        <SidebarProvider
          className="grid grid-cols-[var(--app-sidebar-width,_220px)_minmax(0,_1fr)] h-full min-h-0 overflow-hidden [@media(max-width:_800px)]:grid-cols-[minmax(0,_1fr)] [&[data-sidebar-state=collapsed]]:grid-cols-[56px_minmax(0,_1fr)] [@media(max-width:_800px)]:[&>[class~='group/crm-sidebar-panel']]:hidden [@media(max-width:_800px)]:[&[data-sidebar-state=collapsed]]:grid-cols-[minmax(0,_1fr)]"
          openMobile={bool(v, 'openMobile')}
          setOpenMobile={(next) => update('openMobile', next)}
        >
          <Navigation title={title} group={group} active={str(v, 'active')} change={(next) => update('active', next)} />
          <div>
            <Header title='Workspace' leading={<SidebarTrigger />} />
            <p>{str(v, 'active') === 'companies' ? 'Companies' : 'People'}</p>
          </div>
        </SidebarProvider>
      </div>
    )
    imports = from(
      'Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger',
      'ui/sidebar.tsx',
    ) + '\n' + from('Header', 'header.tsx')
    setup = state('active', v.active) + '\n' + state('openMobile', v.openMobile)
    body = jsx(
      'div',
      { style: { height: 320 } },
      jsx(
        'SidebarProvider',
        {
          className:
            "grid grid-cols-[var(--app-sidebar-width,_220px)_minmax(0,_1fr)] h-full min-h-0 overflow-hidden [@media(max-width:_800px)]:grid-cols-[minmax(0,_1fr)] [&[data-sidebar-state=collapsed]]:grid-cols-[56px_minmax(0,_1fr)] [@media(max-width:_800px)]:[&>[class~='group/crm-sidebar-panel']]:hidden [@media(max-width:_800px)]:[&[data-sidebar-state=collapsed]]:grid-cols-[minmax(0,_1fr)]",
          openMobile: e('openMobile'),
          setOpenMobile: e('setOpenMobile'),
        },
        navigationCode(title, group) +
          '\n<div><Header title="Workspace" leading={<SidebarTrigger />} /><p>{active === "companies" ? "Companies" : "People"}</p></div>',
      ),
    )
  } else if (id === 'popover') {
    const p = {
      title: str(v, 'title'),
      description: str(v, 'description'),
      width: num(v, 'width'),
      side: str(v, 'side') as ComponentProps<typeof PopoverPanel>['side'],
      align: str(v, 'align') as ComponentProps<typeof PopoverPanel>['align'],
    }
    preview = (
      <PopoverPanel {...p} open={bool(v, 'open')} onOpenChange={setOpen} trigger={<Button>Open panel</Button>}>
        {str(v, 'children')}
      </PopoverPanel>
    )
    imports = from('PopoverPanel', 'ui/popover-panel.tsx') + '\n' + from('Button', 'ui/button.tsx')
    setup = state('open', v.open)
    body = jsx('PopoverPanel', {
      ...p,
      open: e('open'),
      onOpenChange: e('setOpen'),
      trigger: e('<Button>Open panel</Button>'),
    }, `{${literal(v.children)}}`)
  } else if (id === 'dropdown-menu') {
    preview = (
      <DropdownMenu open={bool(v, 'open')} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button>{str(v, 'label')}</Button>} />
        <DropdownMenuContent>
          <DropdownMenuItem disabled={bool(v, 'disabled')} onClick={() => setMessage('Edit selected')}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={bool(v, 'checked')} onCheckedChange={(next) => update('checked', next)}>
            Receive updates
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    imports = from(
      'DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem',
      'ui/dropdown-menu.tsx',
    ) + '\n' + from('Button', 'ui/button.tsx')
    setup = state('open', v.open) + '\n' + state('checked', v.checked) + '\n' + state('message', '')
    body = jsx(
      'DropdownMenu',
      { open: e('open'), onOpenChange: e('setOpen') },
      jsx('DropdownMenuTrigger', { render: e(`<Button>{${literal(v.label)}}</Button>`) }) + '\n' +
        jsx(
          'DropdownMenuContent',
          {},
          jsx('DropdownMenuItem', { disabled: v.disabled, onClick: e('() => setMessage("Edit selected")') }, 'Edit') +
            '\n<DropdownMenuSeparator />\n' +
            jsx(
              'DropdownMenuCheckboxItem',
              { checked: e('checked'), onCheckedChange: e('setChecked') },
              'Receive updates',
            ),
        ),
    )
  } else if (id === 'dialog' || id === 'alert-dialog') {
    const p = { title: str(v, 'title'), open: bool(v, 'open') }
    preview = (
      <>
        <Button onClick={() => setOpen(true)}>Open {id === 'dialog' ? 'dialog' : 'confirmation'}</Button>
        {id === 'dialog'
          ? (
            <Dialog {...p} onOpenChange={setOpen}>
              <div className='p-[24px] leading-[1.8] [&_p]:text-muted-foreground [&_p]:mt-[12px]'>
                {str(v, 'children')}
              </div>
            </Dialog>
          )
          : (
            <ConfirmDialog
              {...p}
              onOpenChange={setOpen}
              description={str(v, 'description')}
              action={str(v, 'action')}
              busy={bool(v, 'busy')}
              error={str(v, 'error')}
              onConfirm={() => {
                setMessage('Action confirmed')
                setOpen(false)
              }}
            />
          )}
      </>
    )
    const name = id === 'dialog' ? 'Dialog' : 'ConfirmDialog'
    imports = from('Button', 'ui/button.tsx') + '\n' +
      from(name, id === 'dialog' ? 'ui/dialog.tsx' : 'ui/alert-dialog.tsx')
    setup = state('open', v.open) + (id === 'alert-dialog' ? '\n' + state('message', '') : '')
    body = `<>\n<Button onClick={() => setOpen(true)}>Open ${id === 'dialog' ? 'dialog' : 'confirmation'}</Button>\n${
      jsx(
        name,
        {
          title: v.title,
          open: e('open'),
          onOpenChange: e('setOpen'),
          ...(id === 'alert-dialog'
            ? {
              description: v.description,
              action: v.action,
              busy: v.busy,
              error: v.error,
              onConfirm: e('() => { setMessage("Action confirmed"); setOpen(false) }'),
            }
            : {}),
        },
        id === 'dialog'
          ? jsx(
            'div',
            { className: 'p-[24px] leading-[1.8] [&_p]:text-muted-foreground [&_p]:mt-[12px]' },
            `{${literal(v.children)}}`,
          )
          : undefined,
      )
    }\n</>`
  } else if (id === 'sheet') {
    preview = (
      <Sheet open={bool(v, 'open')} onOpenChange={setOpen}>
        <SheetTrigger render={<Button>Open sheet</Button>} />
        <SheetContent side={str(v, 'side') as 'left' | 'right'}>
          <SheetHeader>
            <SheetTitle>{str(v, 'title')}</SheetTitle>
          </SheetHeader>
          <SheetBody>{str(v, 'children')}</SheetBody>
          <SheetFooter>
            <SheetClose render={<Button>Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
    imports = from(
      'Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose',
      'ui/sheet.tsx',
    ) + '\n' + from('Button', 'ui/button.tsx')
    setup = state('open', v.open)
    body = jsx(
      'Sheet',
      { open: e('open'), onOpenChange: e('setOpen') },
      '<SheetTrigger render={<Button>Open sheet</Button>} />\n' +
        jsx(
          'SheetContent',
          { side: v.side },
          `<SheetHeader><SheetTitle>{${literal(v.title)}}</SheetTitle></SheetHeader>\n<SheetBody>{${
            literal(v.children)
          }}</SheetBody>\n<SheetFooter><SheetClose render={<Button>Close</Button>} /></SheetFooter>`,
        ),
    )
  } else if (id === 'tooltip') {
    preview = (
      <Tooltip>
        <TooltipTrigger render={<Button>Hover or focus</Button>} />
        <TooltipContent side={str(v, 'side') as 'top' | 'bottom' | 'left' | 'right'}>
          {str(v, 'children')}
        </TooltipContent>
      </Tooltip>
    )
    imports = from('Tooltip, TooltipTrigger, TooltipContent', 'ui/tooltip.tsx') + '\n' +
      from('Button', 'ui/button.tsx')
    body = jsx(
      'Tooltip',
      {},
      '<TooltipTrigger render={<Button>Hover or focus</Button>} />\n' +
        jsx('TooltipContent', { side: v.side }, `{${literal(v.children)}}`),
    )
  } else if (id === 'toast') {
    const p = { title: str(v, 'title'), description: str(v, 'description'), type: str(v, 'type') }
    preview = <Button onClick={() => toast.add(p)}>Show toast</Button>
    imports = from('Button', 'ui/button.tsx') + '\n' + "import { Toast } from '@base-ui/react/toast'"
    setup = 'const toast = Toast.useToastManager()'
    body = jsx('Button', { onClick: e(`() => toast.add(${literal(p)})`) }, 'Show toast')
  }
  const showsMessage = ['header', 'dropdown-menu', 'alert-dialog'].includes(id)
  if (showsMessage) body = `<>\n${body}\n<output>{message}</output>\n</>`
  return <Surface code={source(imports, body, setup)}>{preview}{showsMessage && <output>{message}</output>}</Surface>
}
