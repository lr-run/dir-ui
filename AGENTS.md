# dir/ui

This repository contains reusable React components, a GitHub shadcn registry, and a static documentation site.

- Run `deno task check`, `deno task test`, and `deno task build` for changes.
- Components must not depend on landing or internal deployment code.
- CRM is one example under `examples/crm/`; it uses in-memory data and browser-only loaders.
- Source registry entries are generated with `deno task registry:generate`. Keep them current.
- Deployment and OSS export configuration live only in the private development repository.
- Preserve unrelated work. Never publish private Git history or credentials.
