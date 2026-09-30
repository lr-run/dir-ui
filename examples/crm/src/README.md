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
