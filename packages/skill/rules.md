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
- `AppShell` — an always-open sidebar of two levels at most (group label, then items; about 5 groups and 15 items) and a
  page header. One app with many screens: a dashboard, record lists and record details.
- `SuiteShell` — up to six section tabs in the header, each section with its own sidebar. Several apps in one product.

Page patterns inside any layout: a form uses `width="narrow"` with the submit button in `bottomBar`; a record list puts
search and one filter above a table; a record detail is not a navigation level and shows a back `IconButton` in
`leading`; a long record splits into `Tabs` under the header.

## Rules

1. **Use the library's components.** Never hand-roll an input, select, dialog, sheet, table, toast or sidebar when one
   exists in `@/components`; never edit the library source.
2. **Style with tokens only.** Tailwind semantic classes (`bg-background`, `text-muted-foreground`, `border-border`,
   `bg-primary`) or `var(--ui-*)`. No raw hex or palette classes such as `bg-blue-500`; themes work only if this holds.
3. **One layout per screen.** `PageShell`, `AppShell` or `SuiteShell`; never a custom frame.
4. **One primary action.** The header's `actions` end with ONE `variant="default"` button labelled with a verb;
   secondary buttons come before it. On phones it is pinned at the bottom.
5. **Load with skeletons.** `Skeleton` rows or `LoadingState` in the final shape and height, so nothing moves when data
   arrives. Never a spinner.
6. **Lock the form while it submits.** Disable every input and button, keep the button's width and show the progressive
   label ("Saving…"). Validation errors go under the fields; the result goes to a `Toast`.
7. **Every control sits in a `Field`.** The label is above, the error below; a placeholder is an example, never the
   label.
8. **Pick the control by the choice.** `Select` for one of 2–7 options, `SingleCombobox` for one of many or from search,
   `MultiCombobox` for several, `Checkbox` for yes/no. Detail screens edit in place with the `inline` controls.
9. **Status is a dot and a label.** `ChoiceContent` shows both; never color alone. Status colors are not chart series.
10. **Empty and failed regions offer one way forward.** `EmptyState` with one action, `ErrorState` with retry. Never
    `alert()` or `confirm()`.
11. **Confirm destructive actions.** `ConfirmDialog` names the object and the consequence; the confirm button is
    `variant="destructive"` with a verb.
12. **On phones, tables become lists.** At 375px a table turns into a `List` of `ListItem`s (title, description,
    trailing status), rows at least 40px tall. No horizontal page scroll, nothing reachable only on hover.

Also: a UI that ships in Japanese and English routes strings through `useI18n().t('日本語', 'English')` (the
English-only examples do not); numbers and dates through `NumberValue` / `DateValue`; icons are lucide at
`size={16} strokeWidth={1.5}`.

## Themes

Light (`theme.css`), Black (its `light-dark()` dark side, `[data-theme=dark]` or `black.css`) and Paper (`paper.css`),
as in the dir console. A company color changes only `--ui-primary`, `--ui-on-primary`, `--ui-ring` and `--dir-radius`.
Check every screen in all three.

## Page recipes shipped with the skill

| System       | Layout    | Core screens                                                         | Rules most at risk |
| ------------ | --------- | -------------------------------------------------------------------- | ------------------ |
| 営業CRM      | AppShell  | deals `DataGrid` + saved views, deal detail with `Tabs`              | 5, 8, 9            |
| 売上集計     | AppShell  | KPI cards, `RevenueBars`, `HorizontalBars`, product `DataGrid`       | 2, 5, 9            |
| 顧客ポータル | PageShell | home, contract, invoices, support tickets (header `tabs`)            | 2, 4, 12           |
| 在庫管理     | AppShell  | dashboard, items list → item detail, purchase orders                 | 5, 9, 12           |
| 経費精算     | PageShell | expense form with line items and `FileUpload`, history, approvals    | 6, 7, 11           |
| 日報・週報   | PageShell | daily report form, team feed (`List`), weekly summary                | 4, 6, 12           |
| 採用管理     | AppShell  | candidate `DataGrid` with stage `Select`, candidate detail, schedule | 8, 9, 11           |
| 問合せ管理   | AppShell  | inbox, tickets → ticket with conversation, macros                    | 5, 9, 10           |
| 契約管理     | AppShell  | contract `DataGrid`, detail with `Tabs`, renewals, documents         | 9, 10, 11          |

Each recipe names the layout, the data entities, the primary action per screen and which components to use;
`examples/crm` is the reference implementation.
