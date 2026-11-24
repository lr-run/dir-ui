import { themeColorStyles } from './theme-colors.ts'
import { readPreference, writePreference } from './preferences.ts'
// @deno-types="./pages/studio/source-text.d.ts"
import light from '../../../packages/ui/src/styles/theme.css?raw'
// @deno-types="./pages/studio/source-text.d.ts"
import black from '../../../packages/ui/src/styles/black.css?raw'
// @deno-types="./pages/studio/source-text.d.ts"
import paper from '../../../packages/ui/src/styles/paper.css?raw'

/** Site themes. Dark is the dark side of theme.css; Paper is a site-only preset that overrides the tokens. */
export const themes = [
  { id: 'light', label: 'Light', note: 'theme.css · default', css: '', scheme: 'light' },
  { id: 'black', label: 'Dark', note: 'theme.css · data-theme="dark"', css: black, scheme: 'dark' },
  { id: 'paper', label: 'Paper', note: 'site preset · warm', css: paper, scheme: 'light' },
] as const
export type Theme = (typeof themes)[number]['id']
const key = 'ui-theme'
export const isTheme = (value: unknown): value is Theme => themes.some((theme) => theme.id === value)

/** Themes override `--ui-*` on `:root`; the site scopes each file to `[data-ui-theme]` so they can switch live. */
export function installThemes(doc: Document = document) {
  if (doc.getElementById('ui-themes')) return
  const style = doc.createElement('style')
  style.id = 'ui-themes'
  // Scoped copies also theme a nested `[data-ui-theme]` element, which the theme previews rely on.
  const scoped = (id: string, css: string) =>
    css.replaceAll(':root', `:root[data-ui-theme='${id}'], [data-ui-theme='${id}']`)
  // Each scope restates the theme.css tokens first, so a card keeps its theme inside a page using another one.
  const lightTokens = light.match(/:root \{[^}]*\}/)?.[0] ?? ''
  style.textContent = themes.map((theme) =>
    scoped(theme.id, `${lightTokens}\n${theme.css || ':root { color-scheme: light; }'}`)
  ).join('\n')
  style.textContent += themeColorStyles
  doc.head.appendChild(style)
}
export function readTheme(): Theme {
  const stored = readPreference(key)
  return isTheme(stored) ? stored : 'light'
}
/** Sets `data-theme` (light or dark, for `dark:` styles) and `data-ui-theme` for the non-default themes. */
export function setThemeAttributes(theme: Theme, doc: Document = document) {
  const root = doc.documentElement
  root.dataset.theme = themes.find((item) => item.id === theme)!.scheme
  if (theme === 'light') delete root.dataset.uiTheme
  else root.dataset.uiTheme = theme
}
/** The site's choice: applied and remembered. Previews in frames only call `setThemeAttributes`. */
export function applyTheme(theme: Theme, doc: Document = document) {
  setThemeAttributes(theme, doc)
  writePreference(key, theme)
}
