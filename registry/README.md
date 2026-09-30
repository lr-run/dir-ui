# Registry

The authored source lives in `packages/ui/src` and `examples/crm/src`. `registry.json` points directly at those files.
There is no generated TypeScript source tree. The docs and CRM workspace use the exact same implementation.

`entries.json` assigns each file to one item. Shared code is linked through `registryDependencies`. Unchanged upstream
items use official shadcn dependencies. UI item targets use `@ui`, composed parts use `@components`, hooks use `@hooks`,
and helpers use `@lib`. CRM source installs under `@components/crm`; Vite host files are excluded from the Block.

Distributed source uses canonical shadcn import slots. The CLI rewrites them to the consumer's `components.json`
aliases; local Deno and Vite configuration resolve them to the workspace. GitHub reads authored files directly. Local
test JSON embeds their exact bytes, without import or CSS injection.

Theme and grid CSS live in `packages/ui/src/styles`. Workspace apps import them directly. The generator reads the same
stylesheets with PostCSS to produce standard shadcn `css` metadata, which the installer adds to the consumer's
configured stylesheet. Existing source conflicts must be reviewed without `--overwrite`.

```sh
deno task registry:generate
deno task registry:check
deno task registry:local /tmp/dir-ui-registry
# In a fresh shadcn Base UI project:
npx shadcn@4.21.0 add /tmp/dir-ui-registry/input.json
npx shadcn@4.21.0 add /tmp/dir-ui-registry/crm-example.json
```

Tests verify exact source identity, dependency boundaries, complete/acyclic registry dependencies, unique ownership, CSS
metadata, and installation paths. Fresh-app verification covers independent Input and CRM installs, custom aliases, CSS,
preservation of existing components, TypeScript, builds and browser interaction.
