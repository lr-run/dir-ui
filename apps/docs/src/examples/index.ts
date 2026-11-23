import type { ComponentType } from 'react'
export type ComponentSection = {
  id: string
  title: string
  description?: string
  example: ComponentType
  align?: 'center' | 'stretch'
  /** Guides such as the selection table have no code to show. */
  code?: false
}
export type ComponentProp = { name: string; type: string; default?: string; description?: string }
/** Pages without a generated API table (the layouts) describe their import and props here. */
export type ComponentApi = { usage: string; props: ComponentProp[] }
export type ComponentDoc = {
  hero: ComponentType
  heroAlign?: 'center' | 'stretch'
  sections: ComponentSection[]
  api?: ComponentApi
  /** Layout pages preview their examples in an iframe at desktop, tablet and phone widths. */
  frames?: true
}
type Module = { doc: ComponentDoc }
/** One examples module per component page; the page shows each example beside its own source. */
export const exampleModules: Record<string, () => Promise<Module>> = {
  button: () => import('./button.tsx'),
  'toolbar-button': () => import('./toolbar-button.tsx'),
  input: () => import('./input.tsx'),
  'date-input': () => import('./date-input.tsx'),
  checkbox: () => import('./checkbox.tsx'),
  select: () => import('./select.tsx'),
  combobox: () => import('./combobox.tsx'),
  field: () => import('./field.tsx'),
  tabs: () => import('./tabs.tsx'),
  textarea: () => import('./textarea.tsx'),
  value: () => import('./value.tsx'),
  'confirm-dialog': () => import('./confirm-dialog.tsx'),
  'dropdown-menu': () => import('./dropdown-menu.tsx'),
  tooltip: () => import('./tooltip.tsx'),
  'empty-state': () => import('./empty-state.tsx'),
  'error-state': () => import('./error-state.tsx'),
  'rich-text': () => import('./rich-text.tsx'),
  'tab-bar': () => import('./tab-bar.tsx'),
  badge: () => import('./badge.tsx'),
  dialog: () => import('./dialog.tsx'),
  sheet: () => import('./sheet.tsx'),
  popover: () => import('./popover.tsx'),
  toast: () => import('./toast.tsx'),
  skeleton: () => import('./skeleton.tsx'),
  sidebar: () => import('./sidebar.tsx'),
  header: () => import('./header.tsx'),
  'data-grid': () => import('./data-grid.tsx'),
  list: () => import('./list.tsx'),
  'inline-field': () => import('./inline-field.tsx'),
  chart: () => import('./chart.tsx'),
  'search-dialog': () => import('./search-dialog.tsx'),
  'file-upload': () => import('./file-upload.tsx'),
  'page-shell': () => import('./page-shell.tsx'),
  'app-shell': () => import('./app-shell.tsx'),
  'suite-shell': () => import('./suite-shell.tsx'),
}
