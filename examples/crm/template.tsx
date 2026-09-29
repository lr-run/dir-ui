import { I18n } from '../../lib/i18n.tsx'
import { Toast, Tooltip } from '../../components/ui/index.tsx'
import { CrmApp } from './app.tsx'

/** Mount in a bounded container. The host must serve its entry for every CRM URL. */
export function CrmTemplate({ count = 100, basePath = '' }: { count?: number; basePath?: string }) {
  return (
    <I18n>
      <Tooltip.Provider>
        <Toast.Provider>
          <CrmApp count={count} basePath={basePath} />
        </Toast.Provider>
      </Tooltip.Provider>
    </I18n>
  )
}
