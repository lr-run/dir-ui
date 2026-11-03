import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { I18n } from '@dir/ui/lib/i18n.tsx'
import { Toasts } from '@dir/ui/components/ui/toast.tsx'
import { DocsApp } from './pages/docs-app.tsx'
import { EmbeddedExample, embeddedExample } from './pages/embedded-example.tsx'

const embed = embeddedExample()
export function App() {
  return (
    <I18n>
      <Tooltip.Provider>
        <Toast.Provider>
          {embed ? <EmbeddedExample {...embed} /> : <DocsApp />}
          <Toasts />
        </Toast.Provider>
      </Tooltip.Provider>
    </I18n>
  )
}
