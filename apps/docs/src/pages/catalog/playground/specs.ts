import { examplesFor } from './examples.ts'
import type { Control, Spec, Values } from './model.ts'
const text = (key: string): Control => ({ key, type: 'text' })
const toggle = (key: string): Control => ({ key, type: 'boolean' })
const select = (key: string, options: string[]): Control => ({ key, type: 'select', options })
const number = (key: string, min = 0, max = 1000): Control => ({ key, type: 'number', min, max })
const json = (key: string, schema: Control['schema']): Control => ({ key, type: 'json', schema })
const states = [toggle('disabled'), toggle('invalid')]
const inputTypes = [
  'text',
  'email',
  'tel',
  'url',
  'password',
  'search',
  'number',
  'money',
  'percent',
  'date',
  'datetime-local',
]
const inputTypeControls = [
  select('type', inputTypes),
  text('currency'),
  number('min', -1000000),
  number('max', 0, 10000000),
  number('step', 0.01),
]
export const teams = [{ value: 'sales', label: 'Sales' }, { value: 'support', label: 'Support' }, {
  value: 'product',
  label: 'Product',
}]
export const rows = [{ id: 1, name: 'Alex Morgan', team: 'Sales', email: 'alex@example.com' }, {
  id: 2,
  name: 'Jordan Lee',
  team: 'Support',
  email: 'jordan@example.com',
}, { id: 3, name: 'Sam Taylor', team: 'Product', email: 'sam@example.com' }]
const points = [{ label: 'Apr', value: 1400000, secondary: 900000 }, {
  label: 'May',
  value: 1800000,
  secondary: 1200000,
}, { label: 'Jun', value: 2400000, secondary: 1600000 }]
const all: Spec[] = []
// Documentation framing only; reusable components retain caller-owned widths.
const previewSizes: Partial<Record<string, Spec['previewSize']>> = {
  button: 'natural',
  checkbox: 'natural',
  switch: 'natural',
  radio: 'natural',
  icons: 'natural',
  skeleton: 'natural',
  tooltip: 'natural',
  toast: 'natural',
  popover: 'natural',
  'dropdown-menu': 'natural',
  dialog: 'natural',
  sheet: 'natural',
  'alert-dialog': 'natural',
  'search-dialog': 'control',
  'number-value': 'natural',
  'date-value': 'natural',
  'choice-value': 'natural',
  tabs: 'panel',
  'empty-state': 'panel',
  'error-state': 'panel',
  list: 'panel',
  'list-item': 'panel',
  'file-upload': 'panel',
  'rich-text': 'wide',
  'inline-rich-text': 'wide',
  table: 'full',
  'data-grid': 'full',
  header: 'full',
  sidebar: 'full',
  chart: 'full',
}
function add(
  id: string,
  title: string,
  description: string,
  defaults: Values,
  controls: Control[],
  group: Spec['group'] = 'basic',
) {
  all.push({ id, title, description, defaults, controls, group, previewSize: previewSizes[id] ?? 'control' })
}
add('button', 'Button', 'A button with emphasis, size, and disabled states.', {
  children: 'Add company',
  variant: 'default',
  size: 'default',
  disabled: false,
}, [
  text('children'),
  select('variant', ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link']),
  select('size', ['xs', 'sm', 'default', 'lg']),
  toggle('disabled'),
])
add('input', 'Input', 'A single input for text, numeric, money, percentage, date, and time values.', {
  value: 'Acme Studio',
  placeholder: 'Enter a value',
  type: 'text',
  currency: 'USD',
  min: 0,
  max: 1000000,
  step: 1,
  disabled: false,
  invalid: false,
}, [text('value'), text('placeholder'), ...inputTypeControls, ...states])
add('textarea', 'Textarea', 'A multiline text input with validation and disabled states.', {
  value: 'Discuss the next steps with the team.',
  placeholder: 'Add notes',
  rows: 4,
  disabled: false,
  invalid: false,
}, [text('value'), text('placeholder'), number('rows', 2, 12), ...states])
add('rich-text', 'Rich text', 'A document editor for formatted text, lists, tables, and references.', {
  label: 'Notes',
  initialText: 'Discuss the next steps with the team.',
  disabled: false,
}, [text('label'), { key: 'initialText', type: 'textarea' }, toggle('disabled')])
for (
  const [id, title, description] of [
    ['select', 'Select', 'Select one value from a fixed list of options.'],
    ['combobox', 'Combobox', 'Search a list of options and select a single value.'],
    ['multi-select', 'Multi select', 'Select multiple values from a fixed list of options.'],
    ['multi-combobox', 'Multi combobox', 'Search and select multiple values with removable chips.'],
  ]
) {
  const multi = id!.startsWith('multi-')
  add(id!, title!, description!, {
    label: 'Team',
    remoteSearch: false,
    failSearch: false,
    placeholder: 'Search to select…',
    maxVisible: 100,
    items: teams,
    value: multi ? ['sales'] : 'sales',
    disabled: false,
    invalid: false,
  }, [
    text('label'),
    ...(id!.includes('combobox')
      ? [text('placeholder'), toggle('remoteSearch'), toggle('failSearch'), number('maxVisible', 1, 1000)]
      : []),
    json('items', 'choices'),
    multi ? json('value', 'strings') : text('value'),
    toggle('disabled'),
    toggle('invalid'),
  ])
}
add('checkbox', 'Checkbox', 'A checkbox with checked, mixed, and disabled states.', {
  label: 'Receive updates',
  checked: true,
  disabled: false,
  indeterminate: false,
}, [text('label'), toggle('checked'), toggle('indeterminate'), toggle('disabled')])
add('switch', 'Switch', 'A two-state control for turning a setting on or off.', {
  label: 'Automatic notifications',
  checked: true,
  disabled: false,
}, [text('label'), toggle('checked'), toggle('disabled')])
add('radio', 'Radio', 'A group of mutually exclusive options with keyboard navigation.', {
  label: 'Contact method',
  value: 'email',
  items: [{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }],
  disabled: false,
}, [text('label'), text('value'), json('items', 'choices'), toggle('disabled')])
add('field', 'Field', 'Associate an input with its label, description, and validation error.', {
  label: 'Company name',
  description: 'Use the legal company name.',
  error: '',
  required: false,
  value: 'Acme Studio',
}, [text('label'), text('description'), text('error'), toggle('required'), text('value')])
add('inline-edit', 'Inline input', 'Edit typed values in place with the same type options as Input.', {
  label: 'Company',
  value: 'Acme Studio',
  placeholder: 'Add a value',
  type: 'text',
  currency: 'USD',
  min: 0,
  max: 1000000,
  step: 1,
  disabled: false,
}, [text('label'), text('value'), text('placeholder'), ...inputTypeControls, toggle('disabled')])
add('inline-textarea', 'Inline textarea', 'Edit multiline text in place with save and cancel controls.', {
  label: 'Notes',
  value: 'Discuss the next steps with the team.',
  placeholder: 'Add notes',
  rows: 4,
  disabled: false,
}, [text('label'), text('value'), text('placeholder'), number('rows', 2, 12), toggle('disabled')])
for (const [id, title] of [['inline-select', 'Inline select'], ['inline-multi-select', 'Inline multi select']]) {
  const multi = id === 'inline-multi-select'
  add(id!, title!, 'Select and save choices directly in a record property.', {
    label: 'Team',
    value: multi ? ['sales'] : 'sales',
    items: teams,
    disabled: false,
  }, [text('label'), multi ? json('value', 'strings') : text('value'), json('items', 'choices'), toggle('disabled')])
}
add('inline-rich-text', 'Inline rich text', 'Edit a formatted document directly in a record property.', {
  label: 'Notes',
  value: 'Discuss the next steps with the team.',
  disabled: false,
}, [text('label'), text('value'), toggle('disabled')])
add('table', 'Table', 'A semantic table for compact, read-only collections.', { caption: 'Team members', rows }, [
  text('caption'),
  json('rows', 'rows'),
], 'advanced')
add(
  'data-grid',
  'DataGrid',
  'A virtualized grid with search, sorting, filters, column menus, and optional editing.',
  {
    rows,
    search: '',
    columnMenus: true,
    rowHeight: 40,
    headerRowHeight: 40,
    editable: false,
    sorts: [],
    filter: { conjunction: 'and', conditions: [] },
    columnSettings: true,
  },
  [
    json('rows', 'rows'),
    text('search'),
    toggle('columnMenus'),
    json('sorts', 'sorts'),
    json('filter', 'filter'),
    toggle('columnSettings'),
    number('rowHeight', 24, 80),
    number('headerRowHeight', 24, 80),
    toggle('editable'),
  ],
  'advanced',
)
add('tabs', 'Tabs', 'Organize content into underlined horizontal or vertical tabs.', {
  value: 'overview',
  orientation: 'horizontal',
  activateOnFocus: false,
  disabled: false,
}, [
  select('value', ['overview', 'activity']),
  select('orientation', ['horizontal', 'vertical']),
  toggle('activateOnFocus'),
  toggle('disabled'),
], 'advanced')
add(
  'header',
  'Header',
  'Align a page title, leading content, and actions in one row.',
  { title: 'Companies', leading: true, actions: true },
  [text('title'), toggle('leading'), toggle('actions')],
  'advanced',
)
add(
  'sidebar',
  'Sidebar',
  'Compose workspace navigation with groups, links, and a mobile sheet.',
  { label: 'Workspace', group: 'CRM', active: 'companies', openMobile: false },
  [text('label'), text('group'), select('active', ['companies', 'people']), toggle('openMobile')],
  'advanced',
)
add(
  'chart',
  'Chart',
  'Compose responsive Recharts charts with shared colors, tooltips, and legends.',
  {
    type: 'Bar',
    values: points,
    height: 280,
    label: 'Revenue and cost',
    config: { value: { label: 'Revenue', color: '#2563eb' }, secondary: { label: 'Cost', color: '#60a5fa' } },
    showTooltip: true,
    showLegend: true,
    indicator: 'dot',
  },
  [
    select('type', ['Bar', 'Line', 'Horizontal bar', 'Sparkline']),
    number('height', 80, 500),
    text('label'),
    toggle('showTooltip'),
    toggle('showLegend'),
    select('indicator', ['dot', 'line', 'dashed']),
    json('config', 'chartConfig'),
    json('values', 'points'),
  ],
  'charts',
)
add('icons', 'Icons', 'Import Lucide React components directly for actions and navigation.', {
  example: 'SearchIcon',
  size: 16,
  strokeWidth: 1.5,
}, [
  select('example', [
    'Building2Icon',
    'UserRoundIcon',
    'TargetIcon',
    'DatabaseIcon',
    'SearchIcon',
    'SlidersHorizontalIcon',
    'ChartNoAxesColumnIcon',
    'CheckIcon',
    'PlusIcon',
    'ArchiveIcon',
    'ArrowUpRightIcon',
    'EllipsisIcon',
    'PencilIcon',
    'InfoIcon',
    'AlignLeftIcon',
    'RefreshCwIcon',
  ]),
  number('size', 12, 48),
  number('strokeWidth', 1, 3),
])
add('popover', 'Popover', 'Open arbitrary content in a panel anchored to a trigger button.', {
  title: 'Display settings',
  description: 'Configure this preview.',
  children: 'Any form or editor can go here.',
  width: 320,
  side: 'bottom',
  align: 'start',
  open: false,
}, [
  text('title'),
  text('description'),
  text('children'),
  number('width', 180, 600),
  select('side', ['top', 'bottom', 'left', 'right']),
  select('align', ['start', 'center', 'end']),
  toggle('open'),
], 'advanced')
add(
  'dropdown-menu',
  'Dropdown menu',
  'Present actions and checkable items in a button-triggered menu.',
  { label: 'Actions', checked: true, disabled: false, open: false },
  [text('label'), toggle('checked'), toggle('disabled'), toggle('open')],
  'advanced',
)
add(
  'dialog',
  'Dialog',
  'Present focused content with a modal backdrop and managed focus.',
  { title: 'Share with your team', children: 'Review the company details before continuing.', open: false },
  [text('title'), text('children'), toggle('open')],
  'advanced',
)
add(
  'sheet',
  'Sheet',
  'Present contextual content in a panel from either side of the screen.',
  { title: 'Record details', children: 'Context stays close to the current record.', side: 'right', open: false },
  [text('title'), text('children'), select('side', ['left', 'right']), toggle('open')],
  'advanced',
)
add(
  'alert-dialog',
  'Alert dialog',
  'Confirm an important action before applying it.',
  {
    title: 'Archive this record?',
    description: 'You can restore it later.',
    action: 'Archive',
    busy: false,
    error: '',
    open: false,
  },
  [text('title'), text('description'), text('action'), toggle('busy'), text('error'), toggle('open')],
  'advanced',
)
add(
  'tooltip',
  'Tooltip',
  'Show a short explanation on hover or keyboard focus.',
  { children: 'Visible to everyone on your team.', side: 'top' },
  [text('children'), select('side', ['top', 'bottom', 'left', 'right'])],
  'advanced',
)
add(
  'toast',
  'Toast',
  'Announce action results without interrupting the current task.',
  { title: 'Changes saved', description: 'The record is up to date.', type: 'success' },
  [text('title'), text('description'), select('type', ['success', 'error', 'info'])],
  'advanced',
)
add('empty-state', 'Empty state', 'Explain an empty collection and the next available action.', {
  title: 'No companies yet',
  children: 'Add your first company to get started.',
}, [text('title'), text('children')])
add('error-state', 'Error state', 'Display an error message with an optional retry action.', {
  message: 'Unable to load this record.',
  retry: true,
}, [text('message'), toggle('retry')])
add('skeleton', 'Skeleton', 'Reserve space while a small part of the interface loads.', {
  className: 'h-10 w-40 rounded-md',
}, [text('className')])
add('number-value', 'Number value', 'Format numbers, money, and percentage points without an editing control.', {
  value: 12000,
  format: 'currency',
  currency: 'USD',
  locale: 'en-US',
  maximumFractionDigits: 2,
}, [
  number('value', -1000000, 100000000),
  select('format', ['number', 'currency', 'percent']),
  select('currency', ['USD', 'JPY', 'EUR']),
  select('locale', ['en-US', 'ja-JP', 'de-DE']),
  number('maximumFractionDigits', 0, 6),
], 'extensions')
add('date-value', 'Date value', 'Format dates and timestamps with an explicit locale and timezone.', {
  value: '2026-10-01T15:00:00Z',
  locale: 'en-US',
  timeZone: 'America/Los_Angeles',
  includeTime: true,
}, [
  text('value'),
  select('locale', ['en-US', 'ja-JP', 'de-DE']),
  select('timeZone', ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']),
  toggle('includeTime'),
], 'extensions')
add(
  'choice-value',
  'Choice value',
  'Display record, member, status, and tag labels without edit affordances.',
  { items: [{ value: 'active', label: 'Active', color: '#16a34a' }, { value: 'vip', label: 'VIP', color: '#a855f7' }] },
  [json('items', 'choices')],
  'extensions',
)
for (
  const [id, title] of [['inline-combobox', 'Inline combobox'], ['inline-multi-combobox', 'Inline multi combobox']]
) {
  add(id!, title!, 'Search and save record, member, status, or tag choices in place.', {
    label: 'Assignee',
    value: id === 'inline-combobox' ? 'alex' : ['alex'],
    items: [{ value: 'alex', label: 'Alex Morgan', description: 'Sales' }, {
      value: 'jordan',
      label: 'Jordan Lee',
      description: 'Support',
    }],
    disabled: false,
  }, [
    text('label'),
    id === 'inline-combobox' ? text('value') : json('value', 'strings'),
    json('items', 'choices'),
    toggle('disabled'),
  ], 'extensions')
}
add(
  'list',
  'List',
  'Display items with optional icons, descriptions, metadata, and actions.',
  {
    variant: 'Notes',
    items: [{
      id: 'one',
      title: 'Discovery call',
      description: 'Discuss the next steps and requirements.',
      meta: 'Alex Morgan · Today',
      done: false,
    }, {
      id: 'two',
      title: 'Follow up',
      description: 'Send the proposal to the team.',
      meta: 'Jordan Lee · Tomorrow',
      done: false,
    }],
  },
  [select('variant', ['Notes', 'Activity', 'Tasks', 'Icons']), json('items', 'listItems')],
  'extensions',
)
add(
  'list-item',
  'List item',
  'Arrange a title, description, metadata, and optional leading or trailing content.',
  {
    title: 'Discovery call',
    description: 'Discuss the next steps.',
    meta: 'Alex Morgan · Today',
    selected: false,
    showIcon: false,
  },
  [text('title'), text('description'), text('meta'), toggle('selected'), toggle('showIcon')],
  'extensions',
)
const searchItems = [
  {
    id: 'guide',
    label: 'Getting started',
    description: 'Set up your first project.',
    group: 'Documentation',
    meta: 'Guide',
    keywords: ['setup', 'onboarding'],
  },
  {
    id: 'api',
    label: 'API reference',
    description: 'Endpoints and authentication.',
    group: 'Documentation',
    meta: 'API',
  },
  { id: 'release', label: 'Release notes', description: 'Recent improvements.', group: 'Updates', meta: 'Article' },
]
add(
  'search-dialog',
  'Search dialog',
  'Search caller-provided results in a dialog with keyboard navigation and custom content.',
  {
    items: searchItems,
    query: '',
    open: false,
    shortcut: true,
    triggerPlaceholder: 'Search…',
    remote: false,
    debounceMs: 250,
    minQueryLength: 0,
    title: 'Search documentation',
    placeholder: 'Search…',
    inputLabel: 'Search',
    emptyMessage: 'No results found.',
    filter: true,
    loading: false,
    error: '',
    maxVisible: 100,
    emptyQueryLabel: 'Suggestions',
    selectLabel: 'Open result',
    showPreview: false,
  },
  [
    json('items', 'searchItems'),
    text('query'),
    toggle('open'),
    toggle('shortcut'),
    text('triggerPlaceholder'),
    toggle('remote'),
    number('debounceMs', 0, 2000),
    number('minQueryLength', 0, 10),
    text('title'),
    text('placeholder'),
    text('inputLabel'),
    text('emptyMessage'),
    toggle('filter'),
    toggle('loading'),
    text('error'),
    number('maxVisible', 1, 1000),
    text('emptyQueryLabel'),
    text('selectLabel'),
    toggle('showPreview'),
  ],
  'extensions',
)
add(
  'file-upload',
  'File upload',
  'Select or drop files with validation, progress, cancellation, and retry.',
  {
    label: 'Attach files',
    accept: '.pdf,.txt,.png,.jpg',
    maxSize: 20971520,
    multiple: true,
    disabled: false,
    failUpload: false,
  },
  [
    text('label'),
    text('accept'),
    number('maxSize', 1, 104857600),
    toggle('multiple'),
    toggle('disabled'),
    toggle('failUpload'),
  ],
  'extensions',
)
export const specs = all.map((spec) => ({ ...spec, examples: examplesFor(spec.id) }))
