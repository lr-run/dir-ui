# Sales CRM

Live preview: https://ui.usedir.com/examples/crm (its source is in the Code view).

Layout: `AppShell`. The whole app installs as one template: https://ui.usedir.com/examples/crm.md.

## Entities

Company, Person, Deal (stage, amount, close date, owner), Task, Activity.

## Screens

| Screen         | Composition                                                                                                                                                                     | Primary action           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Deals list     | header row 1: saved-view buttons, archive toggle; row 2: `ToolbarButton` search / sort / filter / columns; `DataGrid` 40px rows, stage as `ChoiceContent`, amount right-aligned | New deal (`Dialog` form) |
| Deal detail    | `Header` with back `IconButton`; property column of `InlineInput` / `InlineSelect` / `InlineMultiCombobox`; `Tabs` activity / history / related                                 | none (inline save)       |
| Company detail | same anatomy; related deals and people as `List`                                                                                                                                | New deal                 |
| People list    | `DataGrid`, owner as `ChoiceContent` with avatar                                                                                                                                | New person               |

## Rules most at risk

5 (the deal grid loads as skeleton rows), 8 (detail fields edit in place with the inline controls), 9 (stage as dot +
label).
