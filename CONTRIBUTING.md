# Development

Use Deno 2 and Node.js 22 or newer. Deno's import map/lockfile is the dependency source for the landing and examples.
The library package lists its own runtime and peer dependencies. The shadcn CLI version is pinned in the registry task.

## Structure

- `packages/ui/src/`: shared components, hooks, helpers and styles. No imports from docs, CRM or private operations.
- `examples/crm/src/`: CRM Block source; routes, reusable screens, CRM-specific parts, and in-memory data adapters.
- `examples/crm/main.tsx` and Vite configuration: a standalone development host, not installed by the Block.
- `apps/docs/`: documentation, interactive previews, code viewer and the CRM preview host.
- `registry/entries.json`: file ownership, item dependencies and stylesheet inputs.
- `registry.json`: generated metadata pointing directly to the authored files above.

Deno workspaces resolve `@dir/ui` and `@dir/crm` for the docs app using the packages' source exports. Inside distributed
source, canonical `@/components`, `@/hooks`, and `@/lib` imports resolve through the root Deno import map and host Vite
aliases. shadcn rewrites these same imports to consumer aliases. CRM-specific imports use `@/components/crm`. Do not
introduce local workspace package imports into distributed files.

The generator reads the same source used by previews, infers shared registry dependencies and npm requirements, and maps
repository paths to consumer targets. It does not copy or rewrite TypeScript. Workspace apps import the shared
stylesheets; the registry derives standard `css` metadata from those stylesheets using PostCSS. Never maintain a second
set of theme tokens in registry definitions. Preserve upstream license/source notices.

## Commands

```sh
deno task registry:generate
deno task check
deno task test
deno task build
deno task build:crm
deno task dev
```

`deno task registry:validate` runs the official shadcn schema validator. `deno task check` also checks that the
generated manifest is current. Tests enforce dependency boundaries, complete registry dependency graphs and independent
example state.

## Static site

`deno task dev` starts the documentation and CRM preview. `deno task build` produces `dist/`, including static route
HTML, Markdown, llms.txt and the CRM iframe entry. `deno task preview` previews that build. No hosting credentials or
backend are needed. All example persistence and simulated API requests run in browser memory.

Public CI checks types, tests, registry validity and the static production build. Hosting and release operations are
managed separately from this public source repository.
