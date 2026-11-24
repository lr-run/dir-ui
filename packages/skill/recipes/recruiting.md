# Recruiting

Live preview: https://ui.usedir.com/examples/recruiting (its source is in the Code view).

Layout: `AppShell`.

## Entities

Position, Candidate (stage, source, owner), Interview (date, interviewers, result), Note.

## Screens

| Screen           | Composition                                                                                                           | Primary action                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Candidates       | `DataGrid` with stage as `Select` in-cell editing, source as `Badge`, owner as `ChoiceContent`; saved views per stage | Add candidate                 |
| Candidate detail | property column (`InlineSelect` stage, `InlineCombobox` owner); `Tabs` interviews / notes / documents (`FileUpload`)  | Schedule interview (`Dialog`) |
| Schedule         | `List` grouped by day; `DateValue includeTime`                                                                        | none                          |

## Rules most at risk

Kanban is out of scope: stages are a column and saved views, not a board. 8 (stage is a `Select` of 2–7 options), 11
(rejecting a candidate is confirmed), 9 (stage as dot + label).
