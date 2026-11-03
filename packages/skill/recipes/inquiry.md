# Inquiry management (問合せ管理)

Layout: `AppShell`; an inbox overview, the tickets list and each ticket's page with its conversation.

## Entities

Ticket (subject, customer, status, priority, SLA due), Message, Macro (canned reply).

## Screens

| Screen                  | Composition                                                                                                                                       | Primary action |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Inbox                   | `List` of `ListItem`s: subject, customer, SLA as `ChoiceContent` (green / amber / red + label); `Tabs` with `Badge` counts open / mine / resolved | none           |
| Thread (inline `Sheet`) | messages as `List`; reply `RichText` with macro `Combobox`; status `InlineSelect`                                                                 | Send reply     |
| Macros                  | `DataGrid` title / body; edit in `Drawer`                                                                                                         | New macro      |

## Rules most at risk

9 (SLA status always carries a label), 10 (a failed load offers retry), 5 (the inbox loads as skeleton rows).
