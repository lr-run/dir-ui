# CRM example

A single use case for Dir Components: Companies, People, Deals, record details, notes and reports.

- `app.tsx` owns URL routing and overlays.
- `layout.tsx` composes navigation and workspace search.
- Each `routes/` file defines a page and its record-specific form or detail fields.
- `screens/` contains the reusable list/detail layouts used by these routes.
- `example/` supplies fixtures, query evaluation and a per-App in-memory store.

The library has no dependency on this folder. Records and saved views survive client-side navigation, but reset when
this app is remounted or reloaded. Replace the example store with backend operations for a real application.
