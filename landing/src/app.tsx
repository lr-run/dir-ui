import { Toast, Tooltip } from '../../components/ui/index.tsx'
import { I18n } from '../../lib/i18n.tsx'
import { Toasts } from '../../components/icons/index.jsx'
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
