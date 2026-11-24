# Expense claims

Live preview: https://ui.usedir.com/examples/expense (its source is in the Code view).

Layout: `PageShell` with header `tabs` New claim / History / Approvals; the claim form uses `width="narrow"`.

## Entities

Claim (title, period, total, status), Line item (date, category, amount, receipt), Approval.

## Screens

| Screen         | Composition                                                                                                                                    | Primary action         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| New claim      | `FieldGroup` sections: summary, line items (repeatable rows of `Input type="date"`, `Select`, `Input type="money"`), receipts via `FileUpload` | Submit (sticky footer) |
| History        | `DataGrid` or `List`; status as `ChoiceContent`; row opens the claim                                                                           | New claim              |
| Approval inbox | `List` with approve / reject `Button`s per item; reject opens `ConfirmDialog` with a reason `Textarea`                                         | Approve                |

## Rules most at risk

6 (the claim form locks while it submits), 7 (every line item control sits in a `Field`), 11 (withdrawing a claim is
confirmed).
