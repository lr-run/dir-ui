# dir/ui

Reusable React components built with Base UI and Tailwind CSS, distributed as a shadcn source registry.

Browse interactive previews, edit props, inspect generated code and read each component's API in the landing site. The
CRM is one example of composing the library into an application: lists, record details, notes, search and reports.

- `packages/ui/src/`: reusable components, hooks, helpers and styles; independent of docs and CRM.
- `examples/crm/`: a runnable Vite CRM example and installable Block with in-memory data.
- `examples/systems/`: one example app per page recipe (recruiting, task board, sales report and more) on a shared kit
  of lists, details and dashboards, shown on the site's Examples tab.
- `examples/workflow/`: the shared find, inspect, update and decide workflow shown on the Concept page.
- `apps/docs/`: the static documentation and playground, consuming the workspace source.
- `registry.json`: the GitHub-compatible shadcn registry generated from the library source.

[Browse the site](https://ui.usedir.com/) · [GitHub repository](https://github.com/lr-run/dir-ui)

See [the site](https://ui.usedir.com/) and its [llms.txt](https://ui.usedir.com/llms.txt) for installation,
[development](CONTRIBUTING.md) and [licensing](LICENSE). Copied upstream components retain their original
[shadcn/ui license](THIRD_PARTY_LICENSES/shadcn-ui.txt).

## Install

In a shadcn Base UI application, install individual components or the CRM Block:

```sh
npx shadcn@4.21.0 add lr-run/dir-ui/input#v0.4.0
npx shadcn@4.21.0 add lr-run/dir-ui/crm-example#v0.4.0
```

Review existing-file conflicts without `--overwrite` to preserve your customizations.

UI, components, hooks and shared helpers install into the aliases configured in `components.json`. CRM is a Block that
depends on those shared items and installs no framework-specific root pages. Each component page on the site lists its
imports, props and integration constraints.

## Develop

Requires Deno 2 and Node.js 22. Run `deno task dev` to start the site. `deno task check`, `deno task test`, and
`deno task build` validate and build the static site into `dist/`. No hosting account or backend is needed to build or
run the source.

## Workspace

Deno manages `packages/ui`, `examples/crm`, and `apps/docs` as workspace members. There is one dependency lockfile. The
UI package exports TypeScript source for local consumers; npm publication is not required. The registry references that
same authored source directly and does not keep a second component tree.

Run `deno task dev` for docs or `deno task dev:crm` for the CRM on its own. `deno task build` writes the docs site to
root `dist/`; `deno task build:crm` writes the CRM app to `examples/crm/dist/`.
