import { componentApi } from './pages/catalog/api-data.ts'

/** v2 information architecture: concept, foundations, one page per component (grouped), layouts, rules, recipes. */
export const componentGroups = [
  { slug: 'basic', title: 'Basic', members: ['button', 'badge', 'value'] },
  {
    slug: 'input',
    title: 'Input',
    members: [
      'input',
      'textarea',
      'date-input',
      'checkbox',
      'select',
      'combobox',
      'file-upload',
      'rich-text',
    ],
  },
  { slug: 'form', title: 'Form', members: ['field', 'inline-field'] },
  { slug: 'table', title: 'Table', members: ['data-grid', 'list', 'toolbar-button'] },
  {
    slug: 'overlay',
    title: 'Overlay',
    members: [
      'dialog',
      'confirm-dialog',
      'sheet',
      'popover',
      'dropdown-menu',
      'tooltip',
      'search-dialog',
    ],
  },
  { slug: 'feedback', title: 'Feedback', members: ['toast', 'skeleton', 'empty-state', 'error-state'] },
  { slug: 'navigation', title: 'Navigation', members: ['header', 'sidebar', 'tabs', 'tab-bar'] },
  { slug: 'chart', title: 'Chart', members: ['chart'] },
] as const
export type ComponentGroup = (typeof componentGroups)[number]
/** Component page titles are the component names only. */
export const componentTitles: Record<string, string> = {
  button: 'Button',
  'toolbar-button': 'ToolbarButton',
  input: 'Input',
  textarea: 'Textarea',
  'date-input': 'DateInput',
  checkbox: 'Checkbox',
  select: 'Select',
  combobox: 'Combobox',
  field: 'Field',
  tabs: 'Tabs',
  'tab-bar': 'TabBar',
  badge: 'Badge',
  value: 'Value',
  dialog: 'Dialog',
  'confirm-dialog': 'ConfirmDialog',
  sheet: 'Sheet',
  popover: 'Popover',
  'dropdown-menu': 'DropdownMenu',
  tooltip: 'Tooltip',
  toast: 'Toast',
  skeleton: 'Skeleton',
  'empty-state': 'EmptyState',
  'error-state': 'ErrorState',
  sidebar: 'Sidebar',
  header: 'Header',
  'data-grid': 'DataGrid',
  list: 'List',
  'inline-field': 'InlineField',
  chart: 'Chart',
  'search-dialog': 'SearchDialog',
  'file-upload': 'FileUpload',
  'rich-text': 'RichText',
}
/** API tables on a component page and in its Markdown, the page's main component first. */
const pageApis: Record<string, string[]> = {
  value: ['number-value', 'date-value', 'choice-value'],
  combobox: ['combobox', 'multi-combobox'],
  'inline-field': [
    'inline-field',
    'inline-textarea',
    'inline-number',
    'inline-money',
    'inline-percent',
    'inline-date',
    'inline-datetime',
    'inline-select',
    'inline-combobox',
    'inline-multi-combobox',
    'inline-rich-text',
  ],
  list: ['list', 'list-item'],
  chart: [
    'chart',
    'chart-frame',
    'revenue-bars',
    'line-chart',
    'horizontal-bars',
    'spark-chart',
    'chart-tooltip',
    'chart-legend',
  ],
}
export const apiIdsFor = (id: string): string[] => pageApis[id] ?? (id in componentApi ? [id] : [])
export const componentIds: readonly string[] = componentGroups.flatMap((group) => group.members)
/** One page per layout, ordered by how much navigation they carry. */
export const layoutIds: readonly string[] = ['page-shell', 'app-shell', 'suite-shell']
componentTitles['page-shell'] = 'PageShell'
componentTitles['app-shell'] = 'AppShell'
componentTitles['suite-shell'] = 'SuiteShell'
/** One sentence per component page, shown under the title and used as page metadata. */
export const componentDescriptions: Record<string, string> = {
  button: 'Displays a button or a component that looks like one.',
  'toolbar-button': 'A compact control for search, sort, filter and column settings above a list.',
  input: 'A single-line control for text, numbers, money, percentages, dates and times.',
  textarea: 'A multiline text input that grows with its content from 64px.',
  'date-input': 'A date or date-time input with a calendar popover.',
  checkbox: 'Turns one option on or off. Use it for booleans that are committed with Save.',
  select: 'Picks one value from a short, fixed list of 2–7 options.',
  combobox: 'Searches a long or remote list and picks one value, or several shown as chips.',
  field: 'Associates a control with its label, description and validation error.',
  tabs: 'A set of layered sections of content, displayed one at a time.',
  'tab-bar': 'Tabs inside the page content: a full-width band of line tabs with counts and actions.',
  badge: 'A small label for a category, a count or a code.',
  value: 'Numbers, dates and choices formatted the same way in every grid, list and detail.',
  dialog: 'A window overlaid on the page for a form, or a wide drawer docked to the right.',
  'confirm-dialog':
    'Confirms a destructive action; focus starts on Cancel and `busy` locks both buttons while it runs.',
  sheet: 'A panel that slides in from the side, or stays beside a list.',
  popover: 'Rich content anchored to a trigger, such as a small form.',
  'dropdown-menu': 'Actions and options opened from a button, with groups, shortcuts and submenus.',
  tooltip: 'A short label for an icon-only button, or why a control is disabled.',
  toast: 'A succinct message that is displayed temporarily.',
  skeleton: 'Placeholders that keep the shape of content while it loads.',
  'empty-state': 'Shown when there are no records yet or none match, with one action.',
  'error-state': 'Shown when content fails to load, with an optional retry.',
  sidebar: 'A composable, collapsible workspace sidebar.',
  header: 'A page header with a leading slot, a title and actions.',
  'data-grid': 'A virtualized grid with search, sorting, filters and column settings.',
  list: 'A vertical list of items with slots for leading, trailing and actions.',
  'inline-field': 'A labeled record value that is edited in place and saved on commit.',
  chart: 'Responsive Recharts charts with shared colors, tooltips and legends.',
  'search-dialog': 'A command-style search dialog opened with ⌘K.',
  'file-upload': 'File selection with progress, cancel and retry.',
  'rich-text': 'An editor for formatted notes; it loads lazily.',
  'page-shell': 'A header only, for single-purpose tools and forms; up to five header tabs switch between views.',
  'app-shell': 'A global sidebar and a page header, for one app with up to two levels of navigation.',
  'suite-shell': 'Section tabs in a global header, each section with its own sidebar of up to two levels.',
}

export const recipes = [
  {
    slug: 'crm',
    title: 'Sales CRM',
    short: 'CRM',
    summary: 'Companies, people and deals with a pipeline, saved views and inline-edited deal details',
    shell: 'App',
  },
  {
    slug: 'recruiting',
    title: 'Recruiting',
    short: 'Recruiting',
    summary: 'Candidates by stage, candidate details and interview scheduling',
    shell: 'App',
  },
  {
    slug: 'task-board',
    title: 'Task Board',
    short: 'Task Board',
    summary: 'A team issue board grouped by status, with an issue editor',
    shell: 'App',
  },
  {
    slug: 'sales-report',
    title: 'Sales report',
    short: 'Sales',
    summary: 'KPI cards, revenue charts and a product breakdown',
    shell: 'App',
  },
  {
    slug: 'customer-portal',
    title: 'Customer portal',
    short: 'Portal',
    summary: 'A customer-facing portal for contracts, invoices and support tickets',
    shell: 'Page',
  },
  {
    slug: 'inventory',
    title: 'Inventory',
    short: 'Inventory',
    summary: 'Reorder dashboard, item list and item details with purchase orders',
    shell: 'App',
  },
  {
    slug: 'expense',
    title: 'Expense claims',
    short: 'Expenses',
    summary: 'Expense claim form with line items and receipts, history and approvals',
    shell: 'Page',
  },
  {
    slug: 'daily-report',
    title: 'Daily reports',
    short: 'Daily reports',
    summary: 'Mobile-first daily report form, team feed and weekly summary',
    shell: 'Page',
  },
  {
    slug: 'inquiry',
    title: 'Inquiry management',
    short: 'Inquiries',
    summary: 'Support inbox, ticket list and ticket conversations with macros',
    shell: 'App',
  },
  {
    slug: 'contract',
    title: 'Contract management',
    short: 'Contracts',
    summary: 'Contract list, contract details with documents, and renewals',
    shell: 'App',
  },
] as const
export const recipeSlugs: readonly string[] = recipes.map((recipe) => recipe.slug)
/** One page per foundation topic, at foundations/<slug>. */
export const foundationPages = [
  {
    slug: 'color',
    title: 'Color',
    summary: 'Tailwind semantic names mapped to --ui-* tokens, so a theme changes every color at once.',
  },
  {
    slug: 'typography',
    title: 'Typography',
    summary: 'The Tailwind type scale, and which sizes a business screen uses.',
  },
  { slug: 'spacing', title: 'Spacing', summary: 'The 4px scale and where each step is used.' },
  { slug: 'radius', title: 'Radius', summary: 'Corner sizes from badges to the layout page panel.' },
  {
    slug: 'shadow',
    title: 'Shadow',
    summary: 'Flat surfaces with borders; shadows only for what floats above the page.',
  },
  {
    slug: 'breakpoints',
    title: 'Breakpoints',
    summary: 'Tailwind breakpoints for content, and where the layouts change.',
  },
  {
    slug: 'themes',
    title: 'Themes',
    summary: 'Light and Dark, and what a company color may change.',
  },
] as const
export const foundationSlugs: readonly string[] = foundationPages.map((page) => page.slug)
/** Route id of an example app; the CRM keeps its original studio route. */
export const exampleRoute = (slug: string, code = false) =>
  slug === 'crm' ? (code ? 'studio-code' : 'studio') : `examples/${slug}${code ? '/code' : ''}`
/** The example slug and view of a studio route, or undefined for any other page. */
export function exampleOf(id: string): { slug: string; code: boolean } | undefined {
  if (id === 'studio' || id === 'studio-code') return { slug: 'crm', code: id === 'studio-code' }
  const match = /^examples\/([^/]+)(\/code)?$/.exec(id)
  return match && recipeSlugs.includes(match[1]!) ? { slug: match[1]!, code: !!match[2] } : undefined
}

/** The twelve UI rules; each has a page at rules/<slug>, and skill/rules.md carries the same text for agents. */
export const uiRules = [
  {
    slug: 'components',
    title: 'Use the library’s components',
    short: 'Components',
    summary: 'Never hand-roll a control the library already has, and never edit its source.',
  },
  {
    slug: 'tokens',
    title: 'Style with tokens only',
    short: 'Tokens',
    summary: 'Semantic classes or var(--ui-*). Raw colors break every theme.',
  },
  {
    slug: 'one-layout',
    title: 'One layout per screen',
    short: 'One layout',
    summary: 'PageShell, AppShell or SuiteShell, picked by how much navigation the app needs.',
  },
  {
    slug: 'primary-action',
    title: 'One primary action',
    short: 'Primary action',
    summary: 'The header ends with one filled button labelled with a verb; secondary buttons come first.',
  },
  {
    slug: 'skeletons',
    title: 'Load with skeletons',
    short: 'Skeletons',
    summary: 'Show the final shape and height while data loads, so nothing moves when it arrives.',
  },
  {
    slug: 'submitting',
    title: 'Lock the form while it submits',
    short: 'Submitting',
    summary: 'Disable every field and button, keep the button’s width and say what is happening.',
  },
  {
    slug: 'fields',
    title: 'Every control sits in a Field',
    short: 'Fields',
    summary: 'Label above, error below. A placeholder is an example, never the label.',
  },
  {
    slug: 'choosing-controls',
    title: 'Pick the control by the choice',
    short: 'Choosing controls',
    summary: 'How many values, and from how many options, decides the control.',
  },
  {
    slug: 'status',
    title: 'Status is a dot and a label',
    short: 'Status',
    summary: 'Color alone is invisible to some people and in some themes.',
  },
  {
    slug: 'empty-and-error',
    title: 'Empty and failed regions offer a way forward',
    short: 'Empty and error',
    summary: 'EmptyState with one action, ErrorState with retry. Never alert().',
  },
  {
    slug: 'destructive-actions',
    title: 'Confirm destructive actions',
    short: 'Destructive actions',
    summary: 'Name the object and the consequence; the confirm button says what it does.',
  },
  {
    slug: 'phones',
    title: 'On phones, tables become lists',
    short: 'Phones',
    summary: 'At 375px a table turns into a List of 40px rows; nothing scrolls sideways or appears only on hover.',
  },
] as const
export const ruleSlugs: readonly string[] = uiRules.map((rule) => rule.slug)

export type NavItem = { id: string; title: string }
export type NavSection = { label: string; items: NavItem[] }
/** Header tabs. Only tabs with several pages carry `sections`, which become the sidebar. */
export type DocTab = { id: string; label: string; home: string; sections?: NavSection[] }
export const docTabs: DocTab[] = [
  { id: 'concept', label: 'Concept', home: 'concept' },
  {
    id: 'foundations',
    label: 'Foundations',
    home: 'foundations/color',
    sections: [{
      label: 'Foundations',
      items: foundationPages.map((page) => ({ id: `foundations/${page.slug}`, title: page.title })),
    }],
  },
  {
    id: 'components',
    label: 'Components',
    home: 'button',
    sections: componentGroups.map((group) => ({
      label: group.title,
      items: group.members.map((id) => ({ id, title: componentTitles[id]!.split(' · ')[0]! })),
    })),
  },
  {
    id: 'layouts',
    label: 'Layouts',
    home: 'layouts',
    sections: [{
      label: 'Layouts',
      items: [{ id: 'layouts', title: 'Overview' }, ...layoutIds.map((id) => ({ id, title: componentTitles[id]! }))],
    }],
  },
  {
    id: 'rules',
    label: 'Rules',
    home: 'rules/components',
    sections: [{
      label: 'Rules',
      items: [
        ...uiRules.map((rule) => ({ id: `rules/${rule.slug}`, title: rule.short })),
      ],
    }],
  },
  {
    id: 'examples',
    label: 'Examples',
    home: 'studio',
    sections: [{
      label: 'Examples',
      items: recipes.map((recipe) => ({ id: exampleRoute(recipe.slug), title: recipe.title })),
    }],
  },
]
/** The header tab a route belongs to. */
export function tabOf(id: string): DocTab | undefined {
  const tab = id === 'layouts' || layoutIds.includes(id)
    ? 'layouts'
    : id.startsWith('rules/')
    ? 'rules'
    : id.startsWith('foundations/')
    ? 'foundations'
    : exampleOf(id)
    ? 'examples'
    : componentIds.includes(id)
    ? 'components'
    : id
  return docTabs.find((item) => item.id === tab)
}
export const pageTitles = new Map<string, string>([
  ['concept', 'Concept'],
  ...foundationPages.map((page) => [`foundations/${page.slug}`, page.title] as [string, string]),
  ['layouts', 'Layouts'],
  ...[...componentIds, ...layoutIds].map((id) => [id, componentTitles[id]!] as [string, string]),
  ...recipes.filter((recipe) => recipe.slug !== 'crm').map((recipe) =>
    [`examples/${recipe.slug}`, recipe.title] as [string, string]
  ),
  ...uiRules.map((rule) => [`rules/${rule.slug}`, rule.title] as [string, string]),
])
