import { installPath } from '../../../../../registry/paths.ts'
// @deno-types="./source-text.d.ts"
import templateSource from '../../../../../examples/crm/src/template.tsx?raw'
// @deno-types="./source-text.d.ts"
import source0 from '../../../../../examples/crm/src/app.tsx?raw'
// @deno-types="./source-text.d.ts"
import source1 from '../../../../../examples/crm/src/components/record-notes.tsx?raw'
// @deno-types="./source-text.d.ts"
import source2 from '../../../../../examples/crm/src/components/record-preview.tsx?raw'
// @deno-types="./source-text.d.ts"
import source3 from '../../../../../examples/crm/src/example/data.ts?raw'
// @deno-types="./source-text.d.ts"
import source4 from '../../../../../examples/crm/src/layout.tsx?raw'
// @deno-types="./source-text.d.ts"
import source5 from '../../../../../examples/crm/src/routes/companies-detail.tsx?raw'
// @deno-types="./source-text.d.ts"
import source6 from '../../../../../examples/crm/src/routes/companies-list.tsx?raw'
// @deno-types="./source-text.d.ts"
import source7 from '../../../../../examples/crm/src/routes/deals-detail.tsx?raw'
// @deno-types="./source-text.d.ts"
import source8 from '../../../../../examples/crm/src/routes/deals-list.tsx?raw'
// @deno-types="./source-text.d.ts"
import source9 from '../../../../../examples/crm/src/routes/people-detail.tsx?raw'
// @deno-types="./source-text.d.ts"
import source10 from '../../../../../examples/crm/src/routes/people-list.tsx?raw'
// @deno-types="./source-text.d.ts"
import source11 from '../../../../../examples/crm/src/routes/report.tsx?raw'
// @deno-types="./source-text.d.ts"
import source12 from '../../../../../examples/crm/src/screens/detail-page.tsx?raw'
// @deno-types="./source-text.d.ts"
import source13 from '../../../../../examples/crm/src/screens/list-page.tsx?raw'
// @deno-types="./source-text.d.ts"
import source14 from '../../../../../examples/crm/src/types.ts?raw'

// @deno-types="./source-text.d.ts"
import source15 from '../../../../../examples/crm/src/example/store.ts?raw'

// @deno-types="./source-text.d.ts"
import source16 from '../../../../../examples/crm/src/example/query.ts?raw'

const originals = {
  'template.tsx': templateSource,
  'app.tsx': source0,
  'components/record-notes.tsx': source1,
  'components/record-preview.tsx': source2,
  'example/data.ts': source3,
  'example/query.ts': source16,
  'example/store.ts': source15,
  'layout.tsx': source4,
  'routes/companies-detail.tsx': source5,
  'routes/companies-list.tsx': source6,
  'routes/deals-detail.tsx': source7,
  'routes/deals-list.tsx': source8,
  'routes/people-detail.tsx': source9,
  'routes/people-list.tsx': source10,
  'routes/report.tsx': source11,
  'screens/detail-page.tsx': source12,
  'screens/list-page.tsx': source13,
  'types.ts': source14,
}

export const sourceFiles = Object.fromEntries(
  Object.entries(originals).map(([path, source]) => [
    installPath(`examples/crm/src/${path}`),
    source,
  ]),
)
