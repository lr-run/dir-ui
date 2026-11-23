import { readPreference, writePreference } from './preferences.ts'

// Primary and primary-foreground pairs from shadcn/create's theme registry, light then dark.
export const themeColors = [
  ['neutral', 'Neutral', 'oklch(0.205 0 0)', 'oklch(0.985 0 0)', 'oklch(0.922 0 0)', 'oklch(0.205 0 0)'],
  [
    'amber',
    'Amber',
    'oklch(0.555 0.163 48.998)',
    'oklch(0.987 0.022 95.277)',
    'oklch(0.473 0.137 46.201)',
    'oklch(0.987 0.022 95.277)',
  ],
  [
    'blue',
    'Blue',
    'oklch(0.488 0.243 264.376)',
    'oklch(0.97 0.014 254.604)',
    'oklch(0.424 0.199 265.638)',
    'oklch(0.97 0.014 254.604)',
  ],
  [
    'cyan',
    'Cyan',
    'oklch(0.52 0.105 223.128)',
    'oklch(0.984 0.019 200.873)',
    'oklch(0.45 0.085 224.283)',
    'oklch(0.984 0.019 200.873)',
  ],
  [
    'emerald',
    'Emerald',
    'oklch(0.508 0.118 165.612)',
    'oklch(0.979 0.021 166.113)',
    'oklch(0.432 0.095 166.913)',
    'oklch(0.979 0.021 166.113)',
  ],
  [
    'fuchsia',
    'Fuchsia',
    'oklch(0.518 0.253 323.949)',
    'oklch(0.977 0.017 320.058)',
    'oklch(0.452 0.211 324.591)',
    'oklch(0.977 0.017 320.058)',
  ],
  [
    'green',
    'Green',
    'oklch(0.527 0.154 150.069)',
    'oklch(0.982 0.018 155.826)',
    'oklch(0.448 0.119 151.328)',
    'oklch(0.982 0.018 155.826)',
  ],
  [
    'indigo',
    'Indigo',
    'oklch(0.457 0.24 277.023)',
    'oklch(0.962 0.018 272.314)',
    'oklch(0.398 0.195 277.366)',
    'oklch(0.962 0.018 272.314)',
  ],
  [
    'lime',
    'Lime',
    'oklch(0.841 0.238 128.85)',
    'oklch(0.405 0.101 131.063)',
    'oklch(0.768 0.233 130.85)',
    'oklch(0.405 0.101 131.063)',
  ],
  [
    'orange',
    'Orange',
    'oklch(0.553 0.195 38.402)',
    'oklch(0.98 0.016 73.684)',
    'oklch(0.47 0.157 37.304)',
    'oklch(0.98 0.016 73.684)',
  ],
  [
    'pink',
    'Pink',
    'oklch(0.525 0.223 3.958)',
    'oklch(0.971 0.014 343.198)',
    'oklch(0.459 0.187 3.815)',
    'oklch(0.971 0.014 343.198)',
  ],
  [
    'purple',
    'Purple',
    'oklch(0.496 0.265 301.924)',
    'oklch(0.977 0.014 308.299)',
    'oklch(0.438 0.218 303.724)',
    'oklch(0.977 0.014 308.299)',
  ],
  [
    'red',
    'Red',
    'oklch(0.505 0.213 27.518)',
    'oklch(0.971 0.013 17.38)',
    'oklch(0.444 0.177 26.899)',
    'oklch(0.971 0.013 17.38)',
  ],
  [
    'rose',
    'Rose',
    'oklch(0.514 0.222 16.935)',
    'oklch(0.969 0.015 12.422)',
    'oklch(0.455 0.188 13.697)',
    'oklch(0.969 0.015 12.422)',
  ],
  [
    'sky',
    'Sky',
    'oklch(0.5 0.134 242.749)',
    'oklch(0.977 0.013 236.62)',
    'oklch(0.443 0.11 240.79)',
    'oklch(0.977 0.013 236.62)',
  ],
  [
    'teal',
    'Teal',
    'oklch(0.511 0.096 186.391)',
    'oklch(0.984 0.014 180.72)',
    'oklch(0.437 0.078 188.216)',
    'oklch(0.984 0.014 180.72)',
  ],
  [
    'violet',
    'Violet',
    'oklch(0.491 0.27 292.581)',
    'oklch(0.969 0.016 293.756)',
    'oklch(0.432 0.232 292.759)',
    'oklch(0.969 0.016 293.756)',
  ],
  [
    'yellow',
    'Yellow',
    'oklch(0.852 0.199 91.936)',
    'oklch(0.421 0.095 57.708)',
    'oklch(0.795 0.184 86.047)',
    'oklch(0.421 0.095 57.708)',
  ],
] as const

export type ThemeColor = (typeof themeColors)[number][0]
const key = 'ui-theme-color'

export function readThemeColor(): ThemeColor {
  const stored = readPreference(key)
  return themeColors.find(([id]) => id === stored)?.[0] ?? 'neutral'
}

export function setThemeColor(value: unknown, doc = document) {
  doc.documentElement.dataset.uiThemeColor = themeColors.find(([id]) => id === value)?.[0] ?? 'neutral'
}

export function applyThemeColor(color: ThemeColor, doc = document) {
  setThemeColor(color, doc)
  writePreference(key, color)
}

export const themeColorStyles = themeColors.map(([id, , light, lightText, dark, darkText]) => `
  :root[data-ui-theme-color='${id}'] {
    --ui-primary: light-dark(${light}, ${dark});
    --ui-on-primary: light-dark(${lightText}, ${darkText});
    --ui-primary-top: var(--ui-primary);
    --ui-primary-hover: color-mix(in oklab, var(--ui-primary) 85%, var(--ui-text));
    --ui-selected: color-mix(in oklab, var(--ui-primary) 14%, transparent);
    --ui-focus: color-mix(in oklab, var(--ui-primary) 45%, transparent);
    --ui-ring: var(--ui-focus);
    --ui-accent: var(--ui-primary);
  }
`).join('\n')
