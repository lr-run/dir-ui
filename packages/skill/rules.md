# dir/ui — UI Rules

Version 3.0, 2026-11-03. These are the rules section of the dir/ui skill system prompt: twelve rules, each checkable on
the rendered screen or in code. They assume the dir/ui library (lr-run/dir-ui): Base UI + Tailwind 4, shadcn source
registry, React 19.

You are building an internal business tool with dir/ui. Use only what the library provides, in the way described below.
When a rule and a user request conflict, follow the user and say which rule you broke.

## Layouts

Choose the layout by how much navigation the app needs. All three take the same page props: `title`, `leading`,
`actions`, `width` and `bottomBar`.

- `PageShell` — header only. Single-purpose tools and one-off forms; `tabs` adds up to five views to the header.
  Preview: https://ui.usedir.com/layouts/page-shell
- `AppShell` — an always-open sidebar of two levels at most (group label, then items; about 5 groups and 15 items) and a
  page header. One app with many screens: a dashboard, record lists and record details. Preview:
  https://ui.usedir.com/layouts/app-shell
- `SuiteShell` — up to six section tabs in the header, each section with its own sidebar. Several apps in one product.
  Preview: https://ui.usedir.com/layouts/suite-shell

Page patterns inside any layout: a form uses `width="narrow"` with the submit button in `bottomBar`; a record list puts
search and one filter above a table; a record detail is not a navigation level and shows a back `IconButton` in
`leading`; a long record splits into `Tabs` under the header.

## Rules

1. **Use the library's components.** Never hand-roll an input, select, dialog, sheet, table, toast or sidebar when one
   exists in `@/components`; never edit the library source. Do and don't: https://ui.usedir.com/rules/components
2. **Style with tokens only.** Tailwind semantic classes (`bg-background`, `text-muted-foreground`, `border-border`,
   `bg-primary`) or `var(--ui-*)`. No raw hex or palette classes such as `bg-blue-500`; themes work only if this holds.
   Do and don't: https://ui.usedir.com/rules/tokens
3. **One layout per screen.** `PageShell`, `AppShell` or `SuiteShell`; never a custom frame. Do and don't:
   https://ui.usedir.com/rules/one-layout
4. **One primary action.** The header's `actions` end with ONE `variant="default"` button labelled with a verb;
   secondary buttons come before it. On phones it is pinned at the bottom. Do and don't:
   https://ui.usedir.com/rules/primary-action
5. **Load with skeletons.** `Skeleton` rows or `LoadingState` in the final shape and height, so nothing moves when data
   arrives. Never a spinner. Do and don't: https://ui.usedir.com/rules/skeletons
6. **Lock the form while it submits.** Disable every input and button, keep the button's width and show the progressive
   label ("Saving…"). Validation errors go under the fields; the result goes to a `Toast`. Do and don't:
   https://ui.usedir.com/rules/submitting
7. **Every control sits in a `Field`.** The label is above, the error below; a placeholder is an example, never the
   label. Do and don't: https://ui.usedir.com/rules/fields
8. **Pick the control by the choice.** `Select` for one of 2–7 options, `SingleCombobox` for one of many or from search,
   `MultiCombobox` for several, `Checkbox` for yes/no. Detail screens edit in place with the `inline` controls. Do and
   don't: https://ui.usedir.com/rules/choosing-controls
9. **Status is a dot and a label.** `ChoiceContent` shows both; never color alone. Status colors are not chart series.
   Do and don't: https://ui.usedir.com/rules/status
10. **Empty and failed regions offer one way forward.** `EmptyState` with one action, `ErrorState` with retry. Never
    `alert()` or `confirm()`. Do and don't: https://ui.usedir.com/rules/empty-and-error
11. **Confirm destructive actions.** `ConfirmDialog` names the object and the consequence; the confirm button is
    `variant="destructive"` with a verb. Do and don't: https://ui.usedir.com/rules/destructive-actions
12. **On phones, tables become lists.** At 375px a table turns into a `List` of `ListItem`s (title, description,
    trailing status), rows at least 40px tall. No horizontal page scroll, nothing reachable only on hover. Do and don't:
    https://ui.usedir.com/rules/phones

Also: a UI that ships in Japanese and English routes strings through `useI18n().t(japanese, english)`, passing the
Japanese text first and the English text second (the English-only examples do not); numbers and dates through
`NumberValue` / `DateValue`; icons are lucide at `size={16} strokeWidth={1.5}`.

## Themes

`theme.css` holds Light, the default, and Dark, its `light-dark()` side that `class="dark"` or `data-theme="dark"` on
the root element turns on. A company color changes only `--ui-primary`, `--ui-on-primary`, `--ui-ring` and
`--dir-radius`. Check every screen in both.

## Page recipes shipped with the skill

| Recipe                                                                    | Layout    | Core screens                                                         | Rules most at risk |
| ------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------- | ------------------ |
| [Sales CRM](https://ui.usedir.com/skill/recipes/crm.md)                   | AppShell  | deals `DataGrid` + saved views, deal detail with `Tabs`              | 5, 8, 9            |
| [Sales report](https://ui.usedir.com/skill/recipes/sales-report.md)       | AppShell  | KPI cards, `RevenueBars`, `HorizontalBars`, product `DataGrid`       | 2, 5, 9            |
| [Customer portal](https://ui.usedir.com/skill/recipes/customer-portal.md) | PageShell | home, contract, invoices, support tickets (header `tabs`)            | 2, 4, 12           |
| [Inventory](https://ui.usedir.com/skill/recipes/inventory.md)             | AppShell  | dashboard, items list → item detail, purchase orders                 | 5, 9, 12           |
| [Expense claims](https://ui.usedir.com/skill/recipes/expense.md)          | PageShell | expense form with line items and `FileUpload`, history, approvals    | 6, 7, 11           |
| [Daily reports](https://ui.usedir.com/skill/recipes/daily-report.md)      | PageShell | daily report form, team feed (`List`), weekly summary                | 4, 6, 12           |
| [Recruiting](https://ui.usedir.com/skill/recipes/recruiting.md)           | AppShell  | candidate `DataGrid` with stage `Select`, candidate detail, schedule | 8, 9, 11           |
| [Inquiry management](https://ui.usedir.com/skill/recipes/inquiry.md)      | AppShell  | inbox, tickets → ticket with conversation, macros                    | 5, 9, 10           |
| [Contract management](https://ui.usedir.com/skill/recipes/contract.md)    | AppShell  | contract `DataGrid`, detail with `Tabs`, renewals, documents         | 9, 10, 11          |
| [Task Board](https://ui.usedir.com/skill/recipes/task-board.md)           | AppShell  | status columns of issue cards, issue `Sheet`, create `Dialog`        | 6, 11, 12          |

Each recipe names the layout, the data entities, the primary action per screen and which components to use. The Sales
CRM template (https://ui.usedir.com/examples/crm.md) is the complete reference implementation.
