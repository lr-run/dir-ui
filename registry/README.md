# Registry source

Edit `components/`, `hooks/`, `lib/`, and `examples/`. UI recipes live in `components/ui/`; composed elements live in
`components/`. `components/shadcn/` and the shared UI barrel no longer exist.

`registry/entries.json` assigns each source file to one item. `scripts/registry.ts` discovers imports, adds npm and
registry dependencies, rejects unowned imports and duplicate file ownership, and generates `registry.json`. Bare
dependency names refer to official shadcn items; dir/ui dependencies are full, version-pinned GitHub addresses.

`registry/source/` contains generated source with canonical shadcn imports. GitHub installations read these files
directly. Do not edit them manually. Target placeholders (`@ui/`, `@components/`, `@hooks/`, `@lib/`) resolve against
the consumer's `components.json`; the CLI also rewrites import aliases. License files intentionally target the project
root.

CRM is a `registry:block`. It owns only files from `examples/crm/`, installed under `@components/crm/`. Shared UI is
linked through dependencies. The consumer mounts `CrmTemplate` in its existing Vite entry/router; no framework-specific
`app/` tree is created.

```sh
deno task registry:generate
deno task registry:check
deno task registry:local /tmp/dir-ui-registry
# In a fresh shadcn Base UI project, without --overwrite:
npx shadcn@4.21.0 add /tmp/dir-ui-registry/input.json
npx shadcn@4.21.0 add /tmp/dir-ui-registry/crm-example.json
```

The local builder emits self-contained JSON files with absolute **local dependency addresses**. It does not rewrite the
checked-in GitHub registry or contact the public repository. Runtime code is identical between local payloads and
generated GitHub source.

Tests verify unique ownership, complete and acyclic dependencies, official-item reuse, API availability, icon imports
and framework-neutral targets. Installation checks must cover custom aliases, existing component preservation, strict
TypeScript and production builds.
