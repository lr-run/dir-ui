# Installation

This guide describes v0.1.4. Existing v0.1.0 and v0.1.1 installations can migrate without replacing local
customizations; see the conflict and migration guidance below.

Initialize your application with shadcn, **Base UI**, React 19 and Tailwind CSS 4. The examples use the Nova style.
Individual components and the CRM Block use the same shared components.

## Local validation

Build an unpublished local registry from this checkout:

```sh
deno task registry:generate
deno task registry:local /tmp/dir-ui-registry
```

In a fresh, shadcn-initialized Vite application:

```sh
npx shadcn@4.21.0 add /tmp/dir-ui-registry/input.json
npx shadcn@4.21.0 add /tmp/dir-ui-registry/crm-example.json
```

Local item dependencies point to absolute paths in that temporary registry. They never resolve against an older public
release.

## Components and Blocks

| Registry target      | Configured directory                  | Content                                                                  |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `@ui/`               | `aliases.ui`                          | Basic UI, controls, inline editing and shared CSS                        |
| `@components/`       | `aliases.components`                  | Grids, collections, charts and composed screens                          |
| `@hooks/`            | `aliases.hooks`                       | Reusable React hooks                                                     |
| `@lib/`              | `aliases.lib`                         | Query models, formatting and async helpers                               |
| `@components/crm/`   | CRM folder under `aliases.components` | Vite-compatible example pages, layout, screen components and sample data |
| `~/licenses/dir-ui/` | Project root                          | License and source notices                                               |

No `src` directory or import alias is assumed. Registry code uses conventional `@/components/ui`, `@/components`,
`@/hooks`, and `@/lib` imports, which the shadcn CLI transforms to the aliases in the consumer's `components.json`.

Each file belongs to exactly one registry item. Shared code is referenced with `registryDependencies`; the CRM Block
contains only CRM files. Unmodified Label, Separator and Skeleton use official shadcn items. Customized recipes are
distributed by dir/ui. License attribution is kept in `THIRD_PARTY_LICENSES/shadcn-ui-source.md`.

## Use a component

For the default aliases:

```tsx
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

export function SearchField() {
  return (
    <div className='flex items-center gap-2'>
      <SearchIcon size={16} strokeWidth={1.5} aria-hidden />
      <Input type='search' aria-label='Search' />
    </div>
  )
}
```

Use your configured aliases if they differ. The installer merges shared theme rules and the grid import into the CSS
file configured in `components.json`. Keep Tailwind and `tw-animate-css` imports in the host stylesheet. The host's
Tailwind scan must include its configured component directories (for workspace packages, add an `@source` directive to
that package).

## Use the CRM Block in Vite

The block does not create or replace `App.tsx`, application configuration, an `app/` directory, or a router. Import its
entry into your existing route or entry point:

```tsx
import { CrmTemplate } from '@/components/crm/template'

export default function App() {
  return (
    <div className='h-dvh'>
      <CrmTemplate count={100} />
    </div>
  )
}
```

For a mounted example, pass `basePath="/crm"`. The CRM uses URL paths and the History API. Configure the host to serve
the application at all routes beneath that path, including direct navigation and reloads. Next.js integration should
mount this client-side example at an appropriate catch-all route; a Next.js-specific page tree is not installed.

`components/crm/routes/` contains route-specific pages and creation forms; `screens/` contains reusable list/detail
layouts; `layout.tsx` owns navigation and search. `example/` contains sample data, query helpers and an in-memory store.
Data resets on reload. Replace these adapters with application APIs for persistence.

## Existing applications and conflicts

Run the installer **without `--overwrite`**. When a target already exists, review the diff and answer No to preserve the
existing implementation. `--yes` does not grant overwrite permission. Shared dependencies resolve to one target rather
than copying a second implementation into a private directory.

The standard Button contract uses `default`, `outline`, `secondary`, `ghost`, `destructive`, and `link` variants.
`IconButton` is a separate accessible button composition in `components/ui/icon-button.tsx`; it does not wrap or select
icon libraries. Existing compatible shadcn buttons can therefore be retained.

Some dir/ui recipes have additional contracts (for example, Input accepts `money` and `percent`). If a customized
existing component does not implement the required API, merge those capabilities deliberately or adapt the block. The
installer does not silently replace it or migrate/delete old directories. For applications installed with v0.1.1, first
port local customizations and update imports; remove obsolete files only after validation.

## Install from GitHub

```sh
npx shadcn@4.21.0 add lr-run/dir-ui/input#v0.1.4
npx shadcn@4.21.0 add lr-run/dir-ui/crm-example#v0.1.4
```

Same-repository dependencies are pinned to v0.1.4. Local generation and installation remain available for testing
changes before a release; they do not publish a tag, push a repository, or deploy the site.
