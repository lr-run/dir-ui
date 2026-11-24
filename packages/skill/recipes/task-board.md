# Task Board

Live preview: https://ui.usedir.com/examples/task-board (its source is in the Code view).

Use `AppShell` for a team's issue board.

- Group compact issue cards by Todo, In progress, In review and Done. Keep Backlog and Canceled in the hidden-column
  area until requested. Show counts, a column menu and an Add issue action on each column.
- Display the issue ID, title, assignee, priority, due date and project. Open the existing `Sheet` to edit properties
  and read activity without leaving the board. Keep search and filters when closing the sheet.
- Use the column's Add action to preselect status in the creation `Dialog`. Drag a card to another column to change its
  status; provide the same action through the detail form for keyboard and touch users.
- Use existing `Input`, `Select`, `Field`, `List`, `Button`, `ConfirmDialog`, `Skeleton` and `ErrorState` components.
  The board layout is example-level composition, not a new registry component or external Kanban dependency.
- Keep all fields and submit controls disabled while saving. Preserve failed edits and comments, allow retry, and
  confirm before discarding unsaved changes. Record status changes in activity.
- On phones stack the columns vertically and show the detail sheet full screen. Use semantic colors and the installed
  themes. Keep horizontal overflow inside the board on desktop.
- Demo data stays in memory and resets on reload. `count` supports the Examples record selector, including zero. Board
  options expose loading, load failure and a one-time save failure for quality checks.

Reference: [Linear board layout](https://linear.app/docs/board-layout), checked 2026-11-11. This example does not
connect with Linear or send notifications.
