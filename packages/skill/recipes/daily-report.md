# Daily and weekly reports (日報・週報)

Layout: `PageShell` with header `tabs` Write / Team feed / Weekly, mobile first.

## Entities

Report (date, author, body, mood), Comment, Weekly summary.

## Screens

| Screen         | Composition                                                                                                                | Primary action       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Write          | `width="narrow"` page: `Input type="date"`, `RichText` body, `Select` mood                                                 | Post (sticky footer) |
| Team feed      | `List` of `ListItem`s (author avatar `ChoiceContent`, excerpt, relative time in meta); a Show more button adds the next 30 | Write                |
| Weekly summary | `Tabs` by week; `HorizontalBars` reports per member                                                                        | none                 |

## Rules most at risk

12 (written on a phone), 4 (Submit is pinned at the bottom on phones), 6 (the form locks while it submits).
