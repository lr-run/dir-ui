# dir/ui

Reusable React components built with Base UI and Tailwind CSS, distributed as a shadcn source registry.

Browse interactive previews, edit props, inspect generated code and read each component's API in the landing site. The
CRM is one example of composing the library into an application: lists, record details, notes, search and reports.

- `packages/ui/src/`: reusable components, hooks, helpers and styles; independent of docs and CRM.
- `examples/crm/`: a runnable Vite CRM example and installable Block with in-memory data.
- `apps/docs/`: the static documentation and playground, consuming the workspace source.
- `registry.json`: the GitHub-compatible shadcn registry generated from the library source.

[Browse the site](https://ui.usedir.com/) · [GitHub repository](https://github.com/lr-run/dir-ui)

See [installation](docs/installation.md), [development](CONTRIBUTING.md) and [licensing](LICENSE). Copied upstream
components retain their original [shadcn/ui license](THIRD_PARTY_LICENSES/shadcn-ui.txt).

## Install

In a shadcn Base UI application, install individual components or the CRM Block:

```sh
npx shadcn@4.21.0 add lr-run/dir-ui/input#v0.1.6
npx shadcn@4.21.0 add lr-run/dir-ui/crm-example#v0.1.6
```

Review existing-file conflicts without `--overwrite` to preserve your customizations.

UI, components, hooks and shared helpers install into the aliases configured in `components.json`. CRM is a Block that
depends on those shared items and installs no framework-specific root pages. See the installation guide for custom
aliases and migration of existing customizations.

## Develop

Requires Deno 2 and Node.js 22. Run `deno task dev` to start the site. `deno task check`, `deno task test`, and
`deno task build` validate and build the static site into `dist/`. No Firebase account or Dir runtime is needed to build
or run the public source.

## Workspace

Deno manages `packages/ui`, `examples/crm`, and `apps/docs` as workspace members. There is one dependency lockfile. The
UI package exports TypeScript source for local consumers; npm publication is not required. The registry references that
same authored source directly and does not keep a second component tree.

Run `deno task dev` for docs or `deno task dev:crm` for the standalone CRM. `deno task build` writes the docs site to
root `dist/`; `deno task build:crm` writes the standalone CRM to `examples/crm/dist/`.
