import { inputApi } from './input-api.ts'
import { extendedApi } from './extended-api.ts'
export const componentApi = {
  'button': {
    'names': 'Button, IconButton',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'variant',
        'type': "'primary' | 'secondary' | 'ghost' | 'danger'",
        'default': "'secondary'",
        'detail': '',
      },
      {
        'name': 'size',
        'type': "'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'",
        'default': "'default'",
        'detail': '',
      },
      {
        'name': 'children',
        'type': 'ReactNode',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'type',
        'type': "'button' | 'submit' | 'reset'",
        'default': "'button'",
        'detail': '',
      },
      {
        'name': 'onClick',
        'type': 'MouseEventHandler',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': 'Accessible name for IconButton.',
      },
    ],
    'notes': 'Inherits shadcn Button props, including ref, className, and aria-* attributes.',
    'types': '',
  },
  'rich-text': {
    'names': 'RichText, type RichTextValue',
    'path': 'components/ui/rich-text.tsx',
    'rows': [
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'initialContent',
        'type': 'Note',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'initialText',
        'type': 'string',
        'default': "''",
        'detail': '',
      },
      {
        'name': 'onUpdate',
        'type': '(value: RichTextValue) => void',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'references',
        'type': '{ kind: string; id: string; title: string }[]',
        'default': '[]',
        'detail': '',
      },
      {
        'name': 'className',
        'type': 'string',
        'default': "''",
        'detail': '',
      },
    ],
    'notes':
      'An uncontrolled editor that accepts initial content. Change its key to load another document or reset it externally. The caller owns persistence.',
    'types': 'type RichTextValue = { notesDoc: Note; notes: string }',
  },
  'select': {
    'names': 'Select',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'items',
        'type': 'Choice[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onChange',
        'type': '(value: string) => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': 'Accessible input name.',
      },
      {
        'name': 'id',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'disabled / invalid',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
    ],
    'notes': '',
    'types': 'type Choice = { value: string; label: string }',
  },
  'field': {
    'names': 'Field',
    'path': 'components/ui/input.tsx',
    'rows': [
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'children',
        'type': '(props: FieldControlProps) => ReactNode',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'description / error',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'required',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
    ],
    'notes':
      'Spread the supplied id, aria-describedby, and invalid props onto the input. The caller owns values and validation.',
    'types':
      'type FieldControlProps = { id: string; "aria-describedby"?: string; "aria-required"?: boolean; invalid: boolean }',
  },
  'table': {
    'names': 'table',
    'path': 'HTML',
    'rows': [
      {
        'name': 'children',
        'type': 'caption / thead / tbody / tfoot',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'className',
        'type': 'string',
        'default': "''",
        'detail': '',
      },
      {
        'name': 'scope',
        'type': "'col' | 'row'",
        'default': '—',
        'detail': 'Set on th elements.',
      },
    ],
    'notes': 'Uses a native HTML table. Use DataGrid for row selection, virtualization, or editing.',
    'types': '',
  },
  'data-grid': {
    'names': 'DataGrid, type Column, renderTextEditor',
    'path': 'react-data-grid',
    'rows': [
      {
        'name': 'columns',
        'type': 'Column<Row>[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'rows',
        'type': 'Row[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'rowKeyGetter',
        'type': '(row: Row) => Key',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'onRowsChange',
        'type': '(rows: Row[], data) => void',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'selectedRows / onSelectedRowsChange',
        'type': 'ReadonlySet<Key> / callback',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'sortColumns / onSortColumnsChange',
        'type': 'SortColumn[] / callback',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'columns[].renderEditCell',
        'type': 'ComponentType<RenderEditCellProps>',
        'default': '—',
        'detail': 'Set only on editable columns.',
      },
    ],
    'notes': 'Uses react-data-grid props directly. Editable columns require renderEditCell and onRowsChange.',
    'types': '',
  },
  'popover': {
    'names': 'PopoverPanel',
    'path': 'components/ui/popover-panel.tsx',
    'rows': [
      {
        'name': 'trigger',
        'type': 'ReactElement',
        'default': 'Required',
        'detail': 'A button or other element; render merges its events and ref.',
      },
      {
        'name': 'title / children',
        'type': 'ReactNode',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'description',
        'type': 'ReactNode',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'open / onOpenChange',
        'type': 'boolean / (open: boolean) => void',
        'default': 'Uncontrolled',
        'detail': '',
      },
      {
        'name': 'align',
        'type': "'start' | 'center' | 'end'",
        'default': "'start'",
        'detail': '',
      },
      {
        'name': 'side',
        'type': "'top' | 'bottom' | 'left' | 'right'",
        'default': "'bottom'",
        'detail': '',
      },
      {
        'name': 'width',
        'type': 'number | string',
        'default': '320',
        'detail': '',
      },
    ],
    'notes':
      'Escape or an outside click closes the panel and restores trigger focus. Lower-level Popover, Trigger, and Content exports are available from components/ui/popover.ts.',
    'types': '',
  },
  'dropdown-menu': {
    'names': 'DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem',
    'path': 'components/ui/dropdown-menu.ts',
    'rows': [
      {
        'name': 'DropdownMenu.open / defaultOpen',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'DropdownMenu.onOpenChange',
        'type': '(open, details) => void',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'DropdownMenuTrigger.render',
        'type': 'ReactElement',
        'default': '—',
        'detail': 'Pass a Button element.',
      },
      {
        'name': 'DropdownMenuContent.align',
        'type': "'start' | 'center' | 'end'",
        'default': "'start'",
        'detail': '',
      },
      {
        'name': 'DropdownMenuItem.onClick',
        'type': 'MouseEventHandler',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'DropdownMenuItem.disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'DropdownMenuCheckboxItem.checked / onCheckedChange',
        'type': 'boolean / callback',
        'default': '—',
        'detail': '',
      },
    ],
    'notes':
      'Compose items, checkbox items, radio items, separators, and submenus. Use PopoverPanel for arbitrary forms and editors.',
    'types': '',
  },
  'header': {
    'names': 'Header',
    'path': 'components/ui/header.tsx',
    'rows': [
      {
        'name': 'title',
        'type': 'ReactNode',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'leading / actions',
        'type': 'ReactNode',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  'sidebar': {
    'names':
      'SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenuButton, SidebarTrigger',
    'path': 'components/ui/sidebar.tsx',
    'rows': [
      {
        'name': 'children',
        'type': 'ReactNode',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'className',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'openMobile',
        'type': 'boolean',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'setOpenMobile',
        'type': '(open: boolean) => void',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes':
      'Place all sidebar parts inside SidebarProvider. SidebarMenuButton requires label, icon, and onClick; active, href, and shortcut are optional.',
    'types': '',
  },
  'chart': {
    'names': 'ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig',
    'path': 'components/shadcn/chart.tsx',
    'rows': [
      {
        'name': 'ChartContainer.config',
        'type': 'ChartConfig',
        'default': 'Required',
        'detail': 'Labels, icons, and colors keyed by series dataKey.',
      },
      {
        'name': 'ChartContainer.children',
        'type': 'ReactElement',
        'default': 'Required',
        'detail': 'A Recharts chart such as BarChart or LineChart.',
      },
      {
        'name': 'ChartContainer.className / style',
        'type': 'string / CSSProperties',
        'default': 'aspect-video',
        'detail': 'Set an explicit height or aspect ratio; the chart fills its container.',
      },
      {
        'name': 'ChartContainer.initialDimension',
        'type': '{ width: number; height: number }',
        'default': '{ width: 320, height: 200 }',
        'detail': 'Initial size before measurement.',
      },
      {
        'name': 'ChartContainer.id / aria-label',
        'type': 'string',
        'default': '\u2014',
        'detail': 'Optional unique chart ID and accessible description.',
      },
      {
        'name': 'ChartTooltip.content',
        'type': 'ReactElement',
        'default': '\u2014',
        'detail': 'Pass <ChartTooltipContent />. Other props match Recharts Tooltip.',
      },
      {
        'name': 'ChartTooltipContent.indicator',
        'type': "'dot' | 'line' | 'dashed'",
        'default': "'dot'",
        'detail': '',
      },
      {
        'name': 'ChartTooltipContent.hideLabel / hideIndicator',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'ChartTooltipContent.nameKey / labelKey',
        'type': 'string',
        'default': '\u2014',
        'detail': 'Resolve series names or the title from a payload key.',
      },
      {
        'name': 'ChartTooltipContent.formatter',
        'type': 'Recharts Tooltip formatter',
        'default': '\u2014',
        'detail': 'Custom rendering of a series row.',
      },
      {
        'name': 'ChartTooltipContent.labelFormatter',
        'type': 'Recharts Tooltip labelFormatter',
        'default': '\u2014',
        'detail': 'Custom title rendering.',
      },
      {
        'name': 'ChartTooltipContent.color',
        'type': 'string',
        'default': '\u2014',
        'detail': 'Override the indicator color.',
      },
      {
        'name': 'ChartTooltipContent.className / labelClassName',
        'type': 'string',
        'default': '\u2014',
        'detail': '',
      },
      {
        'name': 'ChartLegend.content',
        'type': 'ReactElement',
        'default': '\u2014',
        'detail': 'Pass <ChartLegendContent />. Other props match Recharts Legend.',
      },
      {
        'name': 'ChartLegendContent.hideIcon',
        'type': 'boolean',
        'default': 'false',
        'detail': 'Use a color swatch instead of a configured icon.',
      },
      {
        'name': 'ChartLegendContent.nameKey',
        'type': 'string',
        'default': '\u2014',
        'detail': 'Resolve series configuration from a payload key.',
      },
      {
        'name': 'ChartLegendContent.verticalAlign',
        'type': "'top' | 'middle' | 'bottom'",
        'default': "'bottom'",
        'detail': 'Adjust legend spacing; set position on ChartLegend.',
      },
      {
        'name': 'ChartLegendContent.className',
        'type': 'string',
        'default': '\u2014',
        'detail': '',
      },
    ],
    'notes':
      'Tooltip and legend content must be rendered inside ChartContainer. Data, axes, series, and accessibilityLayer use Recharts props.',
    'types':
      'type ChartConfig = Record<string, {\n  label?: React.ReactNode\n  icon?: React.ComponentType\n} & (\n  | { color?: string; theme?: never }\n  | { color?: never; theme: { light: string; dark: string } }\n)>',
  },
  'revenue-bars': {
    names: 'RevenueBars',
    path: 'components/charts/index.tsx',
    rows: [{
      name: 'values',
      type: 'ChartPoint[]',
      default: 'Required',
      detail: 'An empty array displays the empty state.',
    }],
    notes: 'Amounts use JPY.',
    types: 'type ChartPoint = { label: string; value: number; secondary?: number }',
  },
  'icons': {
    'names': 'I',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'name',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes': 'Choose a supported icon name in the preview props.',
    'types': '',
  },

  'dialog': {
    'names': 'Dialog',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'open',
        'type': 'boolean',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onOpenChange',
        'type': '(open: boolean) => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'title',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'children',
        'type': 'ReactNode',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'footer',
        'type': 'ReactNode',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'drawer',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'hideHeading',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'className',
        'type': 'string',
        'default': "''",
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  'sheet': {
    'names': 'Sheet, SheetTrigger, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle',
    'path': 'components/ui/sheet.tsx',
    'rows': [
      {
        'name': 'Sheet.open / onOpenChange',
        'type': 'boolean / callback',
        'default': 'Uncontrolled',
        'detail': '',
      },
      {
        'name': 'SheetContent.side',
        'type': "'left' | 'right'",
        'default': "'right'",
        'detail': '',
      },
      {
        'name': 'SheetContent.inline',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'SheetContent.children',
        'type': 'ReactNode',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes': 'Sheet inherits Base UI Dialog.Root props; SheetContent inherits Dialog.Popup props.',
    'types': '',
  },
  'alert-dialog': {
    'names': 'ConfirmDialog',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'open / onOpenChange',
        'type': 'boolean / (open: boolean) => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'title / description / action',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onConfirm',
        'type': '() => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'busy',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'error',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  'tooltip': {
    'names': 'Tooltip, TooltipTrigger, TooltipContent, TooltipProvider',
    'path': 'components/shadcn/tooltip.tsx',
    'rows': [
      {
        'name': 'TooltipProvider.delay',
        'type': 'number',
        'default': '0',
        'detail': '',
      },
      {
        'name': 'Tooltip.open / onOpenChange',
        'type': 'boolean / callback',
        'default': 'Uncontrolled',
        'detail': '',
      },
      {
        'name': 'TooltipTrigger.render',
        'type': 'ReactElement',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'TooltipContent.children',
        'type': 'ReactNode',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'TooltipContent.side',
        'type': "'top' | 'bottom' | 'left' | 'right'",
        'default': "'top'",
        'detail': '',
      },
      {
        'name': 'TooltipContent.sideOffset',
        'type': 'number',
        'default': '4',
        'detail': '',
      },
    ],
    'notes': 'Mount TooltipProvider above the trigger. Each part inherits the corresponding Base UI Tooltip props.',
    'types': '',
  },
  'toast': {
    'names': 'Toast',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'toast.add.title / description',
        'type': 'ReactNode',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'toast.add.type',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'toast.add.timeout',
        'type': 'number',
        'default': 'Provider configuration.',
        'detail': '',
      },
      {
        'name': 'toast.add.actionProps',
        'type': 'ButtonHTMLAttributes',
        'default': '—',
        'detail': '',
      },
    ],
    'notes':
      'Call Toast.useToastManager() inside Toast.Provider. Import the Toasts renderer from components/icons/index.jsx.',
    'types': '',
  },
  'empty-state': {
    'names': 'EmptyState',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'title',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'children',
        'type': 'ReactNode',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  'error-state': {
    'names': 'ErrorState',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'message',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'retry',
        'type': '() => void',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  'skeleton': {
    'names': 'Skeleton',
    'path': 'components/shadcn/skeleton.tsx',
    'rows': [
      {
        'name': 'className',
        'type': 'string',
        'default': '—',
        'detail': 'Set width and height.',
      },
      {
        'name': '...props',
        'type': "ComponentProps<'div'>",
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  'record-list': {
    'names':
      'RecordList, useInfiniteRecords, type RecordListProps, type RecordColumn, type TableColumnState, type LoadRecordPage',
    'path': 'components/record-list/record-list.tsx',
    'rows': [
      {
        'name': 'grid.columns',
        'type': 'readonly RecordColumn<R, SR>[]',
        'default': 'Required',
        'detail':
          'Flat column definitions. Extends react-data-grid Column with type, getValue, icon, required, and format. getValue defaults to row[column.key].',
      },
      {
        'name': 'grid.columnState / onColumnStateChange',
        'type': 'readonly TableColumnState[] / (state: TableColumnState[]) => void',
        'default': 'Uncontrolled',
        'detail':
          'Array order defines column order; each item can override hidden, frozen, label, width, and format. Supply both props for controlled layout or persistence.',
      },
      {
        'name': 'grid.sortColumns / onSortColumnsChange',
        'type': 'SortColumn[] / (sorts: SortColumn[]) => void',
        'default': '\u2014',
        'detail':
          'Controlled query sorting. Apply sorting to local rows or request a new remote dataset. The grid does not sort loaded pages independently.',
      },
      {
        'name': 'grid.onOpenRecord',
        'type': '(row: R) => void',
        'default': '\u2014',
        'detail':
          'Clicking a record name or record cell, double-clicking a row, or pressing Enter opens the detail page. The icon also calls this unless onPreviewRecord is supplied. Other cells retain selection behavior.',
      },
      {
        'name': 'grid.onPreviewRecord',
        'type': '(row: R) => void',
        'default': 'onOpenRecord',
        'detail': 'Opens the record-cell preview icon separately from name navigation. Use this for a side panel.',
      },
      {
        'name': 'grid.pagination',
        'type': 'RecordPagination',
        'default': '\u2014',
        'detail':
          'Set hasMore, loading, error, onLoadMore, and optional total/threshold. Loads within 240px of the end; also fills a short viewport. Error stops automatic requests and exposes Retry.',
      },
      {
        'name': 'useInfiniteRecords',
        'type': '({ loadPage, queryKey, rowKeyGetter }) => InfiniteRecordState & { loadMore, retry }',
        'default': '\u2014',
        'detail':
          'Keep loader and rowKeyGetter stable. Include every server query parameter in queryKey. The hook aborts and discards old queries, deduplicates IDs and requests, and retries the same cursor. Loaded rows accumulate; react-data-grid virtualizes DOM rendering.',
      },
      {
        'name': 'loadPage',
        'type': '({ cursor: string | null, signal: AbortSignal }) => Promise<RecordPage<R>>',
        'default': '\u2014',
        'detail':
          'Return rows, nextCursor (null at the end), and optional total. Pass signal to fetch. Repeated cursors are rejected. Errors preserve loaded rows. The hook loads the first page on mount.',
      },
      { 'name': 'title', 'type': 'ReactNode', 'default': 'Required', 'detail': 'List heading.' },
      {
        'name': 'grid',
        'type': 'RecordTableProps<R, SR, K>',
        'default': 'Required unless children is provided',
        'detail':
          'react-data-grid props plus typed columns, column layout, record opening, and cursor pagination. Rows are 36px; headers are 40px. Pass either grid or children.',
      },
      {
        'name': 'grid.sort',
        'type': 'GridSortOptions',
        'default': '—',
        'detail': 'Controlled Sort menu: fields, value, onChange, and optional maxSorts.',
      },
      {
        'name': 'grid.filter',
        'type': 'GridFilterOptions',
        'default': '—',
        'detail':
          'Controlled Filter menu: fields, value, onChange, and optional limits. Groups have at most 3 levels including the root (maxDepth defaults to 2 and is capped at 2). Valid changes apply immediately. Incomplete edits stay in the local draft until completed.',
      },
      {
        'name': 'grid.toolbar',
        'type': 'ReactNode',
        'default': '—',
        'detail': 'Additional toolbar content, such as a search input or custom query controls.',
      },
      {
        'name': 'actions',
        'type': 'ReactNode',
        'default': '—',
        'detail': 'Header actions such as record creation. Configure column settings through grid.columnSettings.',
      },
      {
        'name': 'grid.columnSettings',
        'type': 'boolean | GridColumnSettings',
        'default': '—',
        'detail':
          'true enables built-in column settings backed by grid.columnState, including required-column protection. A GridColumnSettings object allows custom controlled settings.',
      },
      {
        'name': 'classNames',
        'type': '{ header?: string; title?: string; content?: string; footer?: string }',
        'default': '—',
        'detail':
          'Tailwind classes for list slots. Use grid.containerClassName and grid.toolbarClassName to compose the grid layout.',
      },
      { 'name': 'selection', 'type': 'ReactNode', 'default': '—', 'detail': 'Optional caller-owned selection status.' },
      {
        'name': 'footer',
        'type': 'ReactNode',
        'default': '—',
        'detail': 'Filtered record count, pagination, or custom footer content.',
      },
      {
        'name': 'children',
        'type': 'ReactNode',
        'default': 'Required unless grid is provided',
        'detail': 'Escape hatch for custom content. Cannot be combined with grid.',
      },
      {
        'name': 'className',
        'type': 'string',
        'default': "''",
        'detail': 'Set --record-list-height to customize the grid container height (default 320px).',
      },
    ],
    'notes':
      'Every default column header, including the first record column, opens a menu on click. Column label editing is not offered. Selecting the active direction removes that sort. Other sorts keep their priority after the selected column. Record columns are frozen by default; columnState.frozen overrides that default, including false. Frozen columns appear on the left in their relative order; unfreezing restores their layout order. Header movement stays within the same frozen group; required columns cannot be hidden or moved. renderCell and renderHeaderCell override the defaults. Inline editing is disabled. Formatting affects display and clipboard output, never stored values. Async examples simulate loading entirely in browser JavaScript; sample data/query adapters are separate from the component. The local example evaluates typed comparisons, choice membership, nested groups, and stable sorting. Relative month filters in this sample use 30-day intervals; production adapters define their own calendar semantics.',
    'types':
      "type RecordListProps<R = unknown, SR = unknown, K extends Key = Key> = {\n  title: ReactNode\n  actions?: ReactNode\n  selection?: ReactNode\n  footer?: ReactNode\n  className?: string\n  classNames?: { header?: string; title?: string; content?: string; footer?: string }\n} & (\n  | { grid: RecordTableProps<R, SR, K>; children?: never }\n  | { grid?: never; children: ReactNode }\n)\ntype RecordColumn<R, SR = unknown> = Column<R, SR> & { type?: 'text' | 'record' | 'email' | 'url' | 'number' | 'money' | 'percent' | 'date' | 'datetime' | 'boolean' | 'status' | 'tags' | 'member'; getValue?: (row: R) => unknown; icon?: ReactNode; required?: boolean; format?: ColumnFormat }\ntype ColumnFormat = { grouping?: boolean; decimals?: number; dateStyle?: 'short' | 'medium' | 'long'; currency?: string }\ntype TableColumnState = { key: string; hidden?: boolean; frozen?: boolean; label?: string; width?: number; format?: ColumnFormat }\ntype RecordPagination = { hasMore: boolean; loading: boolean; error?: string | null; onLoadMore: () => void | Promise<void>; total?: number; threshold?: number }\ntype RecordPage<R> = { rows: readonly R[]; nextCursor: string | null; total?: number }",
  },
  'tabs': {
    'names': 'Tabs, TabsList, TabsTrigger, TabsContent',
    'path': 'components/ui/tabs.ts',
    'rows': [
      {
        'name': 'Tabs.value / defaultValue',
        'type': 'TabsPrimitive.Root.Props["value"]',
        'default': '—',
        'detail': 'Use value for controlled state or defaultValue for an initial selection.',
      },
      {
        'name': 'Tabs.onValueChange',
        'type': '(value, eventDetails) => void',
        'default': '—',
        'detail': 'Called when the selected value changes.',
      },
      {
        'name': 'Tabs.orientation',
        'type': '"horizontal" | "vertical"',
        'default': '"horizontal"',
        'detail': 'Controls layout and arrow-key navigation direction.',
      },
      {
        'name': 'TabsList.activateOnFocus',
        'type': 'boolean',
        'default': 'false',
        'detail': 'When false, press Enter or Space to activate a focused tab.',
      },
      {
        'name': 'TabsList.aria-label',
        'type': 'string',
        'default': '—',
        'detail': 'Accessible name of the tab list.',
      },
      {
        'name': 'TabsTrigger.value',
        'type': 'TabsPrimitive.Tab.Props["value"]',
        'default': 'Required',
        'detail': 'Must match the associated TabsContent value.',
      },
      {
        'name': 'TabsTrigger.disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': 'Disables selection and interaction.',
      },
      {
        'name': 'TabsContent.value',
        'type': 'TabsPrimitive.Panel.Props["value"]',
        'default': 'Required',
        'detail': 'Value of the associated tab.',
      },
      {
        'name': 'TabsContent.keepMounted',
        'type': 'boolean',
        'default': 'false',
        'detail': 'Keeps hidden content mounted to preserve local input state.',
      },
      {
        'name': 'children / className',
        'type': 'ReactNode / string',
        'default': '—',
        'detail': 'Content and additional styles for each part.',
      },
    ],
    'notes': 'Tabs use the line appearance. Each part inherits the corresponding Base UI Tabs props.',
    'types':
      "import type { ComponentProps } from 'react'\n\ntype TabsProps = ComponentProps<typeof Tabs>\ntype TabsListProps = ComponentProps<typeof TabsList>\ntype TabsTriggerProps = ComponentProps<typeof TabsTrigger>\ntype TabsContentProps = ComponentProps<typeof TabsContent>",
  },
  'combobox': {
    'names': 'SingleCombobox',
    'path': 'components/ui/multi-select.tsx',
    'rows': [
      {
        'name': 'items',
        'type': 'Choice[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': 'string | null',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onValueChange',
        'type': '(value: string | null) => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': 'Accessible input name.',
      },
      {
        'name': 'id',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': 'Clearing the selection returns null.',
    'types': 'type Choice = { value: string; label: string }',
  },
  'multi-select': {
    'names': 'MultiSelect',
    'path': 'components/ui/multi-select.tsx',
    'rows': [
      {
        'name': 'items',
        'type': 'Choice[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': 'string[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onValueChange',
        'type': '(value: string[]) => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': 'Accessible input name.',
      },
      {
        'name': 'id',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'disabled / invalid',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'aria-describedby',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'open',
        'type': 'boolean',
        'default': 'Internal state',
        'detail': 'Control whether the option menu is open.',
      },
      {
        'name': 'onOpenChange',
        'type': '(open: boolean) => void',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': 'type Choice = { value: string; label: string }',
  },
  'multi-combobox': {
    'names': 'MultiCombobox',
    'path': 'components/ui/multi-select.tsx',
    'rows': [
      {
        'name': 'items',
        'type': 'Choice[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': 'string[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onValueChange',
        'type': '(value: string[]) => void',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': 'Accessible input name.',
      },
      {
        'name': 'id',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'disabled / invalid',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'aria-describedby',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'ref',
        'type': 'Ref<HTMLInputElement>',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'onBlur',
        'type': 'FocusEventHandler<HTMLInputElement>',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': 'type Choice = { value: string; label: string }',
  },
  'checkbox': {
    'names': 'Checkbox',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'checked / defaultChecked',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'onCheckedChange',
        'type': '(checked: boolean, details) => void',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'disabled / indeterminate',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'name / value',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'required',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
    ],
    'notes': 'Inherits Base UI Checkbox.Root props.',
    'types': '',
  },
  'switch': {
    'names': 'Switch',
    'path': 'components/ui/index.tsx',
    'rows': [
      {
        'name': 'Root.checked / Root.defaultChecked',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'Root.onCheckedChange',
        'type': '(checked: boolean, details) => void',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'Root.disabled / Root.required',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'Root.name / Root.value',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'Root.aria-label',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'Root.className / Thumb.className',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': 'Uses Base UI Switch.Root and Switch.Thumb.',
    'types': '',
  },
  'radio': {
    'names': 'Radio',
    'path': '@base-ui/react/radio',
    'rows': [
      {
        'name': 'RadioGroup.value / defaultValue',
        'type': 'unknown',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'RadioGroup.onValueChange',
        'type': '(value, details) => void',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'RadioGroup.name',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'RadioGroup.disabled / required',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'Radio.Root.value',
        'type': 'unknown',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'Radio.Root.disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'Radio.Root.className / Radio.Indicator.className',
        'type': 'string',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': '',
    'types': "import { RadioGroup } from '@base-ui/react/radio-group'\n// RadioGroup > Radio.Root > Radio.Indicator",
  },
  'inline-select': {
    'names': 'InlineSelect',
    'path': 'components/ui/inline-choice.tsx',
    'rows': [
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onValueChange',
        'type': 'InlineSaveHandler<string>',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'items',
        'type': 'Choice[]',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes':
      'Update the parent value only after persistence succeeds; throw or reject on failure. Pending saves prevent duplicate requests. Failed saves preserve the draft and offer retry or cancel. Selecting an option saves immediately. Cancel discards the pending selection.',
    'types':
      'type InlineSaveHandler<T> = (value: T) => void | Promise<void>\ntype Choice = { value: string; label: string }',
  },
  'inline-multi-select': {
    'names': 'InlineMultiSelect',
    'path': 'components/ui/inline-choice.tsx',
    'rows': [
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': 'string[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onValueChange',
        'type': 'InlineSaveHandler<string[]>',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'items',
        'type': 'Choice[]',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes':
      'Update the parent value only after persistence succeeds; throw or reject on failure. Pending saves prevent duplicate requests. Failed saves preserve the draft and offer retry or cancel. Selecting an option saves immediately. Cancel discards the pending selection.',
    'types':
      'type InlineSaveHandler<T> = (value: T) => void | Promise<void>\ntype Choice = { value: string; label: string }',
  },
  'inline-rich-text': {
    'names': 'InlineRichText',
    'path': 'components/ui/inline-rich-text.tsx',
    'rows': [
      {
        'name': 'label',
        'type': 'string',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'value',
        'type': '{ notes: string; notesDoc?: Note }',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'onValueChange',
        'type': 'InlineSaveHandler<RichTextValue>',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'disabled',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
    ],
    'notes':
      'Update the parent value only after persistence succeeds; throw or reject on failure. Pending saves prevent duplicate requests. Failed saves preserve the draft and offer retry or cancel. Use Save or Cmd/Ctrl+Enter to save and Escape to cancel.',
    'types':
      "type InlineSaveHandler<T> = (value: T) => void | Promise<void>\nimport type { Note } from './components/ui/rich-text.tsx'\ntype RichTextValue = { notes: string; notesDoc: Note }",
  },
  'chart-frame': {
    'names': 'ChartFrame',
    'path': 'components/charts/chart-frame.tsx',
    'rows': [{
      name: 'config',
      type: 'ChartConfig',
      default: '{}',
      detail: 'Shared series configuration passed to ChartContainer.',
    }, {
      'name': 'label',
      'type': 'string',
      'default': 'Required',
      'detail': '',
    }, {
      'name': 'children',
      'type': 'ReactElement',
      'default': 'Required',
      'detail': 'A Recharts chart element.',
    }, {
      'name': 'height',
      'type': 'number',
      'default': '230',
      'detail': '',
    }, {
      'name': 'empty / loading',
      'type': 'boolean',
      'default': 'false',
      'detail': '',
    }, {
      'name': 'error',
      'type': 'string',
      'default': '—',
      'detail': '',
    }],
    'notes': 'Pass a Recharts chart as children. State priority is error, loading, then empty.',
    'types': '',
  },
  'line-chart': {
    'names': 'TrendChart',
    'path': 'components/charts/index.tsx',
    'rows': [
      {
        'name': 'values',
        'type': 'ChartPoint[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'names',
        'type': '[string, string?]',
        'default': 'Required',
        'detail': 'Provide a second name to display the secondary series.',
      },
      {
        'name': 'height',
        'type': 'number',
        'default': '230',
        'detail': '',
      },
    ],
    'notes': 'Amounts use JPY. An empty array displays the empty state.',
    'types': 'type ChartPoint = { label: string; value: number; secondary?: number }',
  },
  'horizontal-bars': {
    'names': 'HorizontalBars',
    'path': 'components/charts/index.tsx',
    'rows': [
      {
        'name': 'values',
        'type': 'ChartPoint[]',
        'default': 'Required',
        'detail': '',
      },
      {
        'name': 'height',
        'type': 'number',
        'default': '220',
        'detail': '',
      },
      {
        'name': 'labelWidth',
        'type': 'number',
        'default': '80',
        'detail': '',
      },
    ],
    'notes': 'Amounts use JPY. An empty array displays the empty state.',
    'types': 'type ChartPoint = { label: string; value: number; secondary?: number }',
  },
  'spark-chart': {
    'names': 'SparkChart',
    'path': 'components/charts/index.tsx',
    'rows': [
      {
        'name': 'values',
        'type': 'ChartPoint[]',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes': 'Amounts use JPY. The chart is 80×24 pixels; an empty array renders no bars.',
    'types': 'type ChartPoint = { label: string; value: number; secondary?: number }',
  },
  'chart-tooltip': {
    'names': 'ChartTooltip',
    'path': 'components/charts/chart-frame.tsx',
    'rows': [
      {
        'name': 'active',
        'type': 'boolean',
        'default': 'false',
        'detail': '',
      },
      {
        'name': 'label',
        'type': 'string | number',
        'default': '—',
        'detail': '',
      },
      {
        'name': 'payload',
        'type': 'readonly { name?: string | number; value?: string | number; color?: string }[]',
        'default': '—',
        'detail': '',
      },
    ],
    'notes': 'Renders nothing when active is false or payload is empty.',
    'types': '',
  },
  'chart-legend': {
    'names': 'ChartLegend',
    'path': 'components/charts/chart-frame.tsx',
    'rows': [
      {
        'name': 'items',
        'type': '{ name: string; color: string }[]',
        'default': 'Required',
        'detail': '',
      },
    ],
    'notes': '',
    'types': '',
  },
  ...extendedApi,
  ...inputApi,
} as const
