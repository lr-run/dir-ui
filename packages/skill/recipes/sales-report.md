# Sales report (売上集計)

Layout: `AppShell` (or a section of a `SuiteShell` shared with the CRM).

## Entities

Order (date, amount, department, product), Target (period, amount).

## Screens

| Screen        | Composition                                                                                                                                    | Primary action                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Overview      | four KPI cards (`NumberValue`, label 12px muted); `RevenueBars` monthly revenue; `TrendChart` orders vs target; `HorizontalBars` by department | Export CSV (progress `Toast`) |
| By product    | `DataGrid` with sort and filter; amount and share right-aligned                                                                                | none                          |
| Period picker | `Select` for fiscal year, `Tabs` for month / quarter                                                                                           | none                          |

## Rules most at risk

5 (charts load as `LoadingState` at their final size), 9 (status colors are not series colors; use `--chart-primary` /
`--chart-secondary`), 2 (no raw colors in chart config).
