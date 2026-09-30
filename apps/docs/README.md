# Landing

The existing interactive catalog and CRM playground live here. Both import the public library directly.

`src/main.tsx` uses the Dir AppShell. `src/standalone.tsx` is the separate local/CI entry. `vite.config.ts` is always
the Dir build; `vite.standalone.ts` never writes to `dist/client`, so it cannot replace the deployment by accident.

The server supplies bounded demo search/record endpoints and the isolated CRM preview document. It has no business
mutations or database. Generated shadcn items are copied to `public/r/` during builds.
