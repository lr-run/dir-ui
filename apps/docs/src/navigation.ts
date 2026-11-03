import { specs } from './pages/catalog/playground/specs.ts'

/** v2 information architecture: concept, foundations, one page per component (grouped), layouts, rules, recipes. */
export const componentGroups = [
  { slug: 'buttons', title: 'Buttons', members: ['button', 'toolbar-button'] },
  { slug: 'inputs', title: 'Inputs', members: ['input', 'date-input'] },
  { slug: 'selection', title: 'Selection', members: ['checkbox', 'select', 'combobox'] },
  { slug: 'labels', title: 'Labels', members: ['field', 'tabs', 'tab-bar', 'badge'] },
  { slug: 'overlays', title: 'Overlays', members: ['dialog', 'sheet', 'popover'] },
  { slug: 'feedback', title: 'Feedback', members: ['toast', 'skeleton'] },
  { slug: 'shell', title: 'Shell', members: ['sidebar', 'header'] },
  { slug: 'records', title: 'Records', members: ['data-grid', 'list', 'inline-edit'] },
  { slug: 'content', title: 'Content', members: ['chart', 'search-dialog', 'file-upload'] },
] as const
export type ComponentGroup = (typeof componentGroups)[number]
/** Component page titles are the component names only. */
export const componentTitles: Record<string, string> = {
  button: 'Button',
  'toolbar-button': 'ToolbarButton',
  input: 'Input',
  'date-input': 'DateInput · Calendar',
  checkbox: 'Checkbox',
  select: 'Select',
  combobox: 'Combobox',
  field: 'Field',
  tabs: 'Tabs',
  'tab-bar': 'TabBar',
  badge: 'Badge · ChoiceContent · Value',
  dialog: 'Dialog · Drawer · ConfirmDialog',
  sheet: 'Sheet',
  popover: 'Popover · DropdownMenu · Tooltip',
  toast: 'Toast',
  skeleton: 'Skeleton · LoadingState · EmptyState · ErrorState',
  sidebar: 'Sidebar',
  header: 'Header',
  'data-grid': 'DataGrid',
  list: 'List · ListItem',
  'inline-edit': 'InlineEdit',
  chart: 'Charts',
  'search-dialog': 'SearchDialog',
  'file-upload': 'FileUpload · RichText',
}
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
  'date-input': 'A date or date-time input with a calendar popover.',
  checkbox: 'Turns one option on or off. Use it for booleans that are committed with Save.',
  select: 'Picks one value from a short, fixed list of 2–7 options.',
  combobox: 'Searches a long or remote list and picks one value, or several shown as chips.',
  field: 'Associates a control with its label, description and validation error.',
  tabs: 'A set of layered sections of content, displayed one at a time.',
  'tab-bar': 'Tabs inside the page content: a full-width band of line tabs with counts and actions.',
  badge: 'Displays a badge, a colored choice, or a formatted value.',
  dialog: 'A window overlaid on the page: a form, a wide drawer, or a confirmation.',
  sheet: 'A panel that slides in from the side, or stays beside a list.',
  popover: 'Rich content, menus and tooltips anchored to a trigger.',
  toast: 'A succinct message that is displayed temporarily.',
  skeleton: 'Placeholders for loading, empty and failed content.',
  sidebar: 'A composable, collapsible workspace sidebar.',
  header: 'A page header with a leading slot, a title and actions.',
  'data-grid': 'A virtualized grid with search, sorting, filters and column settings.',
  list: 'A vertical list of items with slots for leading, trailing and actions.',
  'inline-edit': 'Edits a record value in place and saves it on commit.',
  chart: 'Responsive Recharts charts with shared colors, tooltips and legends.',
  'search-dialog': 'A command-style search dialog opened with ⌘K.',
  'file-upload': 'File selection with progress and retry, and a rich text editor.',
  'page-shell': 'A header only, for single-purpose tools and forms; up to five header tabs switch between views.',
  'app-shell': 'A global sidebar and a page header, for one app with up to two levels of navigation.',
  'suite-shell': 'Section tabs in a global header, each section with its own sidebar of up to two levels.',
}

export const recipes = [
  { slug: 'crm', title: 'Sales CRM', short: 'CRM', system: '営業CRM', shell: 'App' },
  { slug: 'sales-report', title: 'Sales report', short: 'Sales', system: '売上集計', shell: 'App' },
  { slug: 'customer-portal', title: 'Customer portal', short: 'Portal', system: '顧客ポータル', shell: 'Page' },
  { slug: 'inventory', title: 'Inventory', short: 'Inventory', system: '在庫管理', shell: 'App' },
  { slug: 'expense', title: 'Expense claims', short: 'Expenses', system: '経費精算', shell: 'Page' },
  { slug: 'daily-report', title: 'Daily reports', short: 'Daily reports', system: '日報・週報', shell: 'Page' },
  { slug: 'recruiting', title: 'Recruiting', short: 'Recruiting', system: '採用管理', shell: 'App' },
  { slug: 'inquiry', title: 'Inquiry management', short: 'Inquiries', system: '問合せ管理', shell: 'App' },
  { slug: 'contract', title: 'Contract management', short: 'Contracts', system: '契約管理', shell: 'App' },
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
    summary: 'Light, Black and Paper, as in the dir console, and what a company color may change.',
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
/** The header tab a route belongs to; component playground pages stay under Components. */
export function tabOf(id: string): DocTab | undefined {
  const tab = id === 'layouts' || layoutIds.includes(id)
    ? 'layouts'
    : id.startsWith('rules/')
    ? 'rules'
    : id.startsWith('foundations/')
    ? 'foundations'
    : exampleOf(id)
    ? 'examples'
    : componentIds.includes(id) || specById.has(id)
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
/** Playground pages remain for components without a v2 page; the API tables are shared. */
export const specById = new Map(specs.map((spec) => [spec.id, spec]))
export const groupBySpec = new Map<string, ComponentGroup>(
  componentGroups.flatMap((group) => group.members.map((member) => [member, group] as const)),
)
