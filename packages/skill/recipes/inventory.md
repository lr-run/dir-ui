# Inventory (在庫管理)

Layout: `AppShell`; a dashboard of what to reorder, the items list and each item's detail page.

## Entities

SKU (code, name, location, quantity, reorder point), Movement (in / out / adjust), Purchase order.

## Screens

| Screen                      | Composition                                                                                                            | Primary action           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| SKU list                    | `List` of `ListItem`s (code and location as description, stock level as `ChoiceContent`); search `ToolbarButton` above | Receive stock (`Dialog`) |
| SKU detail (inline `Sheet`) | properties with `InlineInput type="number"`; `Tabs` movements / orders                                                 | Adjust (`Dialog`)        |
| Movements                   | `DataGrid` with date, quantity right-aligned, reason                                                                   | none                     |
| Purchase order              | form with `width="narrow"` with line items and `DateInput`                                                             | Submit                   |

## Rules most at risk

9 (stock status as dot + label), 12 (on phones the detail is its own screen with a back `IconButton`), 5 (the SKU list
loads as skeleton rows).
