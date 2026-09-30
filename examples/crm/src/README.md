# CRM example

A single use case for Dir Components: Companies, People, Deals, Tasks, detail-only activities/history, record archiving
and Settings.

- `app.tsx` owns URL routing and overlays.
- `layout.tsx` composes navigation and workspace search.
- Each `routes/` file defines a page and its record-specific form or detail fields.
- `screens/` contains the reusable list/detail layouts used by these routes.
- `example/` supplies fixtures, query evaluation and a per-App in-memory store.

The library has no dependency on this folder. Records, activities, history, settings and saved views survive client-side
navigation, but reset when this app is remounted or reloaded. Replace the example store with backend operations for a
real application.

Activities store rich text as a serialized document string in `body`. The example owns rendering and validation; it
never renders raw HTML. Notes are activities of type `note`, not separate arrays on records. Activity audit entries
remain in the store but are not shown inside activity cards. Record History groups consecutive updates by record and
actor within five minutes of the first update; raw audit entries remain unchanged. Each card shows the first
before-value and final after-value for each changed field.

Companies, people, deals and tasks have distinct data types; table rows resolve reference labels from IDs.
`example/store.ts` validates relationships before committing data and change history together. Derived completion
timestamps are read-only. The store is a browser demonstration, not database transaction or multi-user concurrency
enforcement. Production adapters must enforce these rules server-side, with version checks and authorization.

Archive and restore operate on individual records. Normal lists and search exclude archived records. The report retains
its USD scope and excludes archived deals. Settings manages stage names and order, without a Category or deal-count
column; new stages default to open. Users is read-only. Inactive-assignee and used-stage restrictions remain enforced by
the example store. No backend, localStorage, or production deployment is required.

Record List, its table renderer/model and table skeleton are private CRM example compositions under `components/`. They
build on the shared DataGrid, but are not standalone library components or registry items. Installing the CRM Block
includes these files under the consumer's CRM directory.

Skeleton compositions are scoped to this demo. Report and Settings reserve their page layout while their code loads. The
in-memory store returns synchronously, so record pages do not introduce artificial loading delays. The CRM table can
show column-aligned row skeletons when supplied with a loading pagination state. Shared search and combobox components
keep their existing loading behavior.

Create callbacks and detail field saves accept promises. Create forms wait for completion, prevent duplicate submits and
keep validation errors visible. No Dir SDK or deployed API is required by this example.
