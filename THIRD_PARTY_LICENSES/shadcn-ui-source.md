# shadcn/ui source

Copied from the official shadcn/ui Base UI registry on 2026-09-27 under the MIT license.

- button.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/button.tsx (blob
  2007374034d564bb926915baa057e500cab631a4)
- combobox.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/combobox.tsx (blob
  8fc7ae799f00cec1cf4efa6ab8509717f64a7a91)
- field.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/field.tsx (blob
  d58e0d29dbfe52053a21eff0b837f571b278f1ef)
- input-group.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/input-group.tsx (blob
  cb328462c7c372f1b22342b25d396704d87247c1)
- input.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/input.tsx (blob
  06c96abffafcd0fbbedb24778f0c2f668e1b2109)
- label.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/label.tsx (blob
  3b0886ba1826c80e7c6e0c22b699a43cb6df5bc9)
- select.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/select.tsx (blob
  2cb76c117197336324cfaed1300e92ca65273b40)
- separator.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/separator.tsx (blob
  d69c13426761105ab42e5a6bd364dc54bd70f78c)
- skeleton.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/skeleton.tsx (blob
  0439455a951949f8a75be48fa2c8b8e9f3d8b0f2)
- textarea.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/textarea.tsx (blob
  8b8d3f1c6cc7c66c2fab2e050164f355a655b6c9)
- tooltip.tsx: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/tooltip.tsx (blob
  8fbd22dacb65913e7e31cde7ad800dce6f889116)

Nova CSS rules were copied from https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-nova.css for the
installed controls. On 2026-09-28 those utility recipes were inlined into the TSX class strings and CVA variants; no
separate Nova stylesheet is required. Contextual styling now uses Tailwind utilities and the primitives’ data-slot
attributes. Input focus uses a single border instead of an outer ring.

Local adaptations: compact sizing, single-border focus, Base UI orientation selectors, popup stacking, direct named
Lucide imports, typed input formats, inline editing, and form/selection compositions. All adapted recipes now live in
components/ui, organized by purpose rather than provenance. Input Group is consolidated into input.tsx, Field includes
its form composition, and Select/Combobox recipes include their value-oriented APIs.

Unmodified Label, Separator and Skeleton are kept locally for documentation development. Registry installations
reference the official shadcn items instead of distributing these local copies. All original source references and MIT
notices remain applicable.

License: /THIRD_PARTY_LICENSES/shadcn-ui.txt

Popover and Dropdown Menu copied on 2026-09-27 from:

- https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/popover.tsx
- https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/dropdown-menu.tsx Nova style rules and MIT
  license apply. Local changes: icon import and popup stacking layer.

Tabs copied on 2026-09-27 from:

- https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/tabs.tsx

Nova styles and MIT license apply. Local adaptations: forward orientation to the Base UI root; use data-orientation
selectors supported by Base UI 1.6.

Calendar added from https://ui.shadcn.com/r/styles/base-nova/calendar.json on 2026-09-30 (MIT). Customized imports for
Lucide, direct day-button focus ref, and a thin focus ring. Date inputs compose Base UI Popover with this Calendar;
native input values and events remain intact.
