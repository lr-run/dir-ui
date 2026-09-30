import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { I18n } from '../../lib/i18n.tsx'
import { Toasts } from '../../components/ui/toast.tsx'
import { ComponentCatalog } from './pages/component-catalog.tsx'
export function App() {
  return (
    <I18n>
      <Tooltip.Provider>
        <Toast.Provider>
          <ComponentCatalog />
          <Toasts />
        </Toast.Provider>
      </Tooltip.Provider>
    </I18n>
  )
}
