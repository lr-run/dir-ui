---
name: dir-ui
description: Build internal business tools with dir/ui (Base UI + Tailwind 4 + React 19). Use when generating screens, forms, lists, or layouts for a company tool; the rules, page recipes and API digest keep generated screens consistent with the library.
---

# dir/ui skill

dir/ui is a shadcn source registry of React components for internal tools. This skill ships the rules every generated
screen follows, one page recipe per common system, and a digest of the component API.

## Files

- `rules.md` — the layouts and twelve UI rules. Read in full before building a screen; they are the system prompt
  section.
- `recipes/<system>.md` — shell, entities, screens and primary actions for nine common systems.
- `api-digest.md` — import paths and key props of every component, hook and layout shell.

## How to use

1. Pick the recipe closest to the request. Use its layout (`PageShell`, `AppShell` or `SuiteShell`) and screen list as
   the starting point.
2. Install what the screen needs with `npx shadcn@4.21.0 add lr-run/dir-ui/<item>#v<version>`; shells are `page-shell`,
   `app-shell` and `suite-shell`. `theme` (Light) comes with any component. Black and Paper are not shadcn items: Black
   is `[data-theme=dark]` (or `black.css`), Paper is `paper.css` loaded after `theme.css`.
3. Compose only the components in `api-digest.md`. Never create a control the library already provides and never edit
   the library source.
4. Check the result against all twelve rules in `rules.md` before handing it over. When a rule and the user's request
   conflict, follow the user and name the rule.

Reference implementations: `examples/crm`, and one app per recipe in `examples/systems` (built on a shared kit of lists,
details and dashboards), all live on the Examples tab at https://ui.usedir.com/.
