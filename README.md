# dir/ui

Reusable React components built with Base UI and Tailwind CSS, distributed as a shadcn source registry.

Browse interactive previews, edit props, inspect generated code and read each component's API in the landing site. The
CRM is one example of composing the library into an application: lists, record details, notes, search and reports.

- `components/`, `lib/`, `styles/`: the reusable library, independent of Dir and the CRM.
- `examples/crm/`: a complete CRM example with an in-memory data store.
- `landing/`: the static documentation and playground.
- `registry.json`: the GitHub-compatible shadcn registry generated from the library source.

[Browse the site](https://ui.usedir.com/) · [GitHub repository](https://github.com/lr-run/dir-ui)

See [installation](docs/installation.md), [development](CONTRIBUTING.md) and [licensing](LICENSE). Copied upstream
components retain their original [shadcn/ui license](THIRD_PARTY_LICENSES/shadcn-ui.txt).

## Install

```sh
npx shadcn@4.21.0 add lr-run/dir-ui/button#v0.1.1
npx shadcn@4.21.0 add lr-run/dir-ui/crm-example#v0.1.1
```

## Develop

Requires Deno 2 and Node.js 22. Run `deno task dev` to start the site. `deno task check`, `deno task test`, and
`deno task build` validate and build the static site into `dist/`. No Firebase account or Dir runtime is needed to build
or run the public source.
