import { Toasts } from '@/components/ui/toast.tsx'
import { I18n } from '@/lib/i18n.tsx'
import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { CrmApp } from '@/components/crm/app.tsx'

/** Mount in a bounded container. The host must serve its entry for every CRM URL. */
export function CrmTemplate({ count = 100, basePath = '' }: { count?: number; basePath?: string }) {
  return (
    <I18n>
      <Tooltip.Provider>
        <Toast.Provider>
          <CrmApp count={count} basePath={basePath} />
          <Toasts />
        </Toast.Provider>
      </Tooltip.Provider>
    </I18n>
  )
}
