# dir/ui

This repository contains reusable React components, a GitHub shadcn registry, and a static documentation site.

- Run `deno task check`, `deno task test`, and `deno task build` for changes.
- `packages/ui/src` must not depend on docs, examples, registry scripts, or internal deployment code.
- CRM is one runnable workspace example under `examples/crm/src/`; it uses in-memory data and browser-only loaders.
- `registry.json` is generated with `deno task registry:generate` and references authored workspace files directly. Do
  not duplicate source into registry/.
- Deno workspaces contain `packages/ui`, `examples/crm`, and `apps/docs`. Keep `deno.lock` as the shared dependency
  lockfile.
- Also run `deno task build:crm` after shared UI or CRM changes.
- Deployment and OSS export configuration live only in the private development repository.
- Preserve unrelated work. Never publish private Git history or credentials.

- Public repository pushes, release tags, publishing workflows, and production deployments require an explicit user
  instruction. Keep unreleased work local or in the private repository until then.
