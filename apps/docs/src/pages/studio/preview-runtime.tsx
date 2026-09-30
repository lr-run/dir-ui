import '../../tailwind.css'
import { initializeDocumentStyles } from '../../document-styles.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { z } from 'zod'
import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { I18n } from '@dir/ui/lib/i18n.tsx'
import { ErrorBoundary } from '@dir/ui/components/ui/error-boundary.tsx'
import { CrmApp } from '@dir/crm/app.tsx'
initializeDocumentStyles(true)
const root = document.getElementById('screen-root')
if (!root) throw new Error('Missing preview root')
const params = new URLSearchParams(location.search)
const count = z.coerce.number().int().min(0).max(1000).catch(100).parse(params.get('count') ?? 100)
const theme = params.get('theme') === 'dark' ? 'dark' : 'light'
document.documentElement.dataset.theme = theme
const basePath = '/preview/crm'
// Navigation stays inside the demo; example website and email links are inert.
document.addEventListener('click', (event) => {
  const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
  if (anchor && new URL(anchor.href).origin !== location.origin) event.preventDefault()
})
createRoot(root).render(
  <StrictMode>
    <I18n>
      <Tooltip.Provider>
        <Toast.Provider>
          <ErrorBoundary>
            <CrmApp count={count} basePath={basePath} />
          </ErrorBoundary>
        </Toast.Provider>
      </Tooltip.Provider>
    </I18n>
  </StrictMode>,
)
