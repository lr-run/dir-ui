import { ErrorToastProvider, Toasts } from '@dir/ui/components/ui/toast.tsx'
import '../../tailwind.css'
import { initializeDocumentStyles } from '../../document-styles.ts'
import { setThemeColor } from '../../theme-colors.ts'
import { installThemes, isTheme, setThemeAttributes } from '../../theme-presets.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { z } from 'zod'
import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { I18n } from '@dir/ui/lib/i18n.tsx'
import { ErrorBoundary } from '@dir/ui/components/ui/error-boundary.tsx'
import { CrmApp } from '@dir/crm/app.tsx'
import { KitApp } from '@/components/systems/kit/app.tsx'
import { systemExamples } from '@/components/systems/index.ts'
import { TaskBoardApp } from '@/components/systems/task-board/app.tsx'
initializeDocumentStyles(true)
const root = document.getElementById('screen-root')
if (!root) throw new Error('Missing preview root')
const params = new URLSearchParams(location.search)
const count = z.coerce.number().int().min(0).max(1000).catch(100).parse(params.get('count') ?? 100)
const theme = params.get('theme')
installThemes()
setThemeAttributes(isTheme(theme) ? theme : 'light')
setThemeColor(params.get('color'))
// The first path segment after /preview/ picks the example; the CRM keeps its own app.
const slug = location.pathname.split('/')[2] ?? 'crm'
const system = systemExamples[slug]
const basePath = `/preview/${system ? slug : 'crm'}`
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
            <ErrorToastProvider>
              {slug === 'task-board'
                ? <TaskBoardApp count={count} />
                : system
                ? <KitApp config={system.config} layout={system.layout} count={count} basePath={basePath} />
                : <CrmApp count={count} basePath={basePath} />}
            </ErrorToastProvider>
          </ErrorBoundary>
          <Toasts />
        </Toast.Provider>
      </Tooltip.Provider>
    </I18n>
  </StrictMode>,
)
