# Customer portal (顧客ポータル)

Layout: `PageShell` with header `tabs` (Home / Contract / Invoices / Support) and the Paper theme or the customer's
primary color.

## Entities

Account, Contract, Invoice (status paid / unpaid / overdue), Ticket, Announcement.

## Screens

| Screen   | Composition                                                                                       | Primary action  |
| -------- | ------------------------------------------------------------------------------------------------- | --------------- |
| Home     | announcement `List`, contract summary card, next invoice card                                     | Contact support |
| Contract | property grid (read-only `NumberValue` / `DateValue`), documents as `List` with download `Button` | none            |
| Invoices | `DataGrid` or card `List` on phones; status as `ChoiceContent`                                    | Pay (external)  |
| Support  | ticket `List`; new ticket form with `width="narrow"` with `FileUpload`                            | New ticket      |

## Rules most at risk

12 (customers open it on a phone first), 2 (the customer's color reaches the screen only through `--ui-primary`), 4 (one
primary action per screen, such as Contact us).
