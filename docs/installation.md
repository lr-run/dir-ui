# Installation

Requirements: React 19, Tailwind CSS 4, and a project initialized for shadcn. Components use Base UI, not Radix UI.

## GitHub registry

Install directly from the public [lr-run/dir-ui](https://github.com/lr-run/dir-ui) GitHub registry:

```sh
npx shadcn@4.21.0 add lr-run/dir-ui/input#v0.1.0
npx shadcn@4.21.0 add lr-run/dir-ui/data-grid#v0.1.0
npx shadcn@4.21.0 add lr-run/dir-ui/crm-example#v0.1.0
```

The version ref pins an immutable release. No account or Firebase endpoint is required. The root registry.json and
source files are read from GitHub. Use a new release ref explicitly when updating copied components.

The CLI copies source into `lib/dir-components/` at your project root and installs the item's npm dependencies. Each
item includes its transitive local imports and preserves their relative paths. Shared files are identical across items.
Review the CLI's overwrite prompt when customizing copied files; updates are explicit, not automatic.

## Styles

Import the installed Tailwind extension from your application's CSS. Adjust relative paths to your stylesheet:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import '../lib/dir-components/styles/tailwind.css';
```

For DataGrid or Record List, also import:

```css
@import '../lib/dir-components/styles/data-grid.css';
```

The extension registers component source paths, utilities and the shared theme. It does not install a font or modify
body layout. Set the font on your application. Use `.dark` or `data-theme="dark"` on the document root for dark mode.
Theme tokens are optional defaults and can be overridden after the import.

## Imports and providers

```tsx
import { Input } from '../lib/dir-components/components/ui/input.tsx'
import { DataGrid } from '../lib/dir-components/components/data-grid/data-grid.tsx'
```

Most components work without a global provider. Tooltip, Toast and Sidebar use their corresponding Base UI or library
providers. `I18n` from `lib/i18n.tsx` is optional and defaults to English. It has no browser-storage or document
effects.

The `crm-example` registry item includes all of the CRM source and its library dependencies. Mount `CrmApp` within I18n,
Tooltip.Provider and Toast.Provider as shown in the landing Code view. The host owns URL routing/mount paths. Records
and views live only in memory and reset on reload. Register the example source directory in your host stylesheet:

```css
@source '../lib/dir-components/examples';
```

## Dir applications

Dir itself does not need a source change. Copy/install the same registry files into the app. Ensure its Deno import map
contains the npm dependencies listed on the item (the source `deno.json` provides versions). Keep the platform AppShell
in the app entry; it is not a library dependency. Include the shared CSS in the app's Tailwind build.

GitHub is the public source distribution. The documentation host serves HTML and Markdown, not installation endpoints.

## Package usage

The root package exposes TypeScript source through subpaths such as `@dir/ui/input` and `@dir/ui/data-grid`. It is
private and is not published to npm. It can be linked in a workspace using a TypeScript-aware bundler. The source
registry is the supported public distribution route.

## Templates and AI documentation

Template metadata lives in examples/catalog.ts; each template owns examples/<id>/ and a registry:block entry in
registry/entries.json. CRM installs with crm-example, including a CrmTemplate entry with its providers. Components and
templates include all local dependencies. The copied lib/dir-components path is stable.

/llms.txt indexes concise /components/<id>.md and /examples/<id>.md documents. Descriptions and API tables come from the
same data as the interactive website. Generated static documents are rebuilt by docs:build and served as plain-text
files.
