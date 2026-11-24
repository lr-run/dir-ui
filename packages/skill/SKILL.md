---
name: dir-ui
description: Build internal business tools with dir/ui (Base UI + Tailwind 4 + React 19). Use when generating screens, forms, lists, or layouts for a company tool; the rules, page recipes and API digest keep generated screens consistent with the library.
---

# dir/ui skill

dir/ui is a shadcn source registry of React components for internal tools. This file is the entry point: read it from
https://ui.usedir.com/skill/SKILL.md, then fetch the documents below by their full URLs. Nothing needs to be installed
to use the skill.

## Before you start

Your training data may describe an older dir/ui or plain shadcn/ui. For this skill, these facts take precedence:

- dir/ui is built on Base UI, not Radix. Use React 19 and Tailwind CSS 4 with shadcn initialized for Base UI.
- The current version is v0.4.0. Install items only as `lr-run/dir-ui/<item>#v0.4.0`.
- v0.3.0 merged many registry items. `value` provides number, date and choice formatting, and `inline-field` provides
  the in-place detail controls. Older item names such as `choice-content`, `number-value` and `inline-select` no longer
  exist; take item names only from https://ui.usedir.com/llms.txt.
- Since v0.4.0, `useI18n().t(japanese, english)` requires both strings; there is no built-in translation table.

## Flow

1. **Read the rules.** Fetch https://ui.usedir.com/skill/rules.md and read it in full: the three layouts, the page
   patterns and the twelve rules every screen follows.
2. **Choose the layout** by how much navigation the app needs. Every screen uses exactly one.

   | Layout       | Navigation                                      | Use for                                            | Preview                                   |
   | ------------ | ----------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
   | `PageShell`  | header only, up to five header tabs             | a single-purpose tool, a form, a customer portal   | https://ui.usedir.com/layouts/page-shell  |
   | `AppShell`   | sidebar of groups and items, two levels at most | one app with a dashboard, record lists and details | https://ui.usedir.com/layouts/app-shell   |
   | `SuiteShell` | up to six section tabs, each with its sidebar   | several apps in one product                        | https://ui.usedir.com/layouts/suite-shell |

3. **Check the page recipes.** If one below is the same kind of app as the request, read it and start from its entities,
   screens and primary actions. If none is close, compose the screens from the layout's page patterns in the rules.
4. **Pick the components.** Look them up in https://ui.usedir.com/skill/api-digest.md, then read
   https://ui.usedir.com/components/<item>.md for each one you use: install command, imports, full props and
   constraints. Never create a control the library already provides and never edit the library source.
5. **Install.** In a React 19 and Tailwind CSS 4 app, initialize shadcn once with
   `npx shadcn@4.21.0 init --base base --preset base-nova` (in Vite, set up the `@/*` path alias in `tsconfig.json` and
   `vite.config.ts` first). Then add each item with `npx shadcn@4.21.0 add lr-run/dir-ui/<item>#v0.4.0`. Shells are
   `page-shell`, `app-shell` and `suite-shell`. `theme` comes with any component and holds both Light and Dark: Light is
   the default, and `class="dark"` or `data-theme="dark"` on the root element switches to Dark.
6. **Check** the result against all twelve rules before handing it over. When a rule and the user's request conflict,
   follow the user and name the rule.

## Page recipes

A recipe is a worked plan for a whole app: its layout, data entities, screens, the primary action on each screen and the
rules that app breaks most often. Use one when the request is the same kind of app or shares its main screens, for
example a deal pipeline (Sales CRM) or a claim form with approvals (Expense claims). Do not use one for a single screen
or component; the layout's page patterns cover that. Each recipe also runs live as an example app.

| Recipe                                                                    | Layout      | Use when the app needs                                        | Live preview                                   |
| ------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------- | ---------------------------------------------- |
| [Sales CRM](https://ui.usedir.com/skill/recipes/crm.md)                   | `AppShell`  | companies, people and deals with saved views and inline edits | https://ui.usedir.com/examples/crm             |
| [Recruiting](https://ui.usedir.com/skill/recipes/recruiting.md)           | `AppShell`  | candidates by stage, candidate details, interview scheduling  | https://ui.usedir.com/examples/recruiting      |
| [Task Board](https://ui.usedir.com/skill/recipes/task-board.md)           | `AppShell`  | an issue board grouped by status, with an issue editor        | https://ui.usedir.com/examples/task-board      |
| [Sales report](https://ui.usedir.com/skill/recipes/sales-report.md)       | `AppShell`  | KPI cards, revenue charts and a product breakdown             | https://ui.usedir.com/examples/sales-report    |
| [Customer portal](https://ui.usedir.com/skill/recipes/customer-portal.md) | `PageShell` | customers viewing contracts, invoices and support tickets     | https://ui.usedir.com/examples/customer-portal |
| [Inventory](https://ui.usedir.com/skill/recipes/inventory.md)             | `AppShell`  | a reorder dashboard, item list and purchase orders            | https://ui.usedir.com/examples/inventory       |
| [Expense claims](https://ui.usedir.com/skill/recipes/expense.md)          | `PageShell` | a claim form with line items and receipts, and approvals      | https://ui.usedir.com/examples/expense         |
| [Daily reports](https://ui.usedir.com/skill/recipes/daily-report.md)      | `PageShell` | a mobile-first report form, team feed and weekly summary      | https://ui.usedir.com/examples/daily-report    |
| [Inquiry management](https://ui.usedir.com/skill/recipes/inquiry.md)      | `AppShell`  | a support inbox, ticket list and ticket conversations         | https://ui.usedir.com/examples/inquiry         |
| [Contract management](https://ui.usedir.com/skill/recipes/contract.md)    | `AppShell`  | a contract list, details with documents, and renewals         | https://ui.usedir.com/examples/contract        |
