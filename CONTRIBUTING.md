# Development

Use Deno 2 and Node.js 22 or newer. Deno's import map/lockfile is the dependency source for the landing and examples.
The library package lists its own runtime and peer dependencies. The shadcn CLI version is pinned in the registry task.

## Structure

The library lives in `components/`, `lib/` and `styles/`. It may not import from `landing/`, `examples/` or `@dir/sdk`.
The CRM in `examples/crm/` and the catalog in `landing/` both consume those exact source files. Internal helpers are not
separate registry products unless they are useful on their own. Keep lightweight items free of chart/editor deps.

`registry/entries.json` lists public item entrypoints. `scripts/registry.ts` computes their local dependency closure and
npm requirements and generates root `registry.json`. Do not edit generated registry files by hand. Keep upstream
copyright notices and provenance.

## Commands

```sh
deno task registry:generate
deno task check
deno task test
deno task build
deno task dev
```

`deno task registry:validate` runs the official shadcn schema validator. `deno task check` also checks that the
generated manifest is current. Tests enforce dependency boundaries, complete registry closures and independent example
state.

## Static site

`deno task dev` starts the documentation and CRM preview. `deno task build` produces `dist/`, including static route
HTML, Markdown, llms.txt and the CRM iframe entry. `deno task preview` previews that build. No hosting credentials or
backend are needed. All example persistence and simulated API requests run in browser memory.

Public CI checks types, tests, registry validity and the static production build. Hosting and release operations are
managed separately from this public source repository.
