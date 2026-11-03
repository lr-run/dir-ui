# Contract management (契約管理)

Layout: `AppShell`.

## Entities

Contract (counterparty, type, start / end, amount, status), Renewal, Document.

## Screens

| Screen          | Composition                                                                                                                                   | Primary action          |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Contracts       | `DataGrid`: counterparty frozen first column, dates as `DateValue`, amount right-aligned, status `ChoiceContent`; truncated names with `Hint` | New contract (`Dialog`) |
| Contract detail | property column; `Tabs` renewals / documents / history; documents as `List` with `FileUpload`                                                 | Renew                   |
| Renewals        | `List` sorted by end date; `Badge` days remaining; filter `ToolbarButton`                                                                     | none                    |

## Rules most at risk

11 (terminating a contract is destructive: name it and the consequence), 10 (an empty renewal list offers one action), 9
(renewal status as dot + label).
