// The system examples shown on the Examples tab, by recipe slug. Each is a KitConfig plus the layout it uses.
import type { KitConfig } from '@/components/systems/kit/types.ts'
import { inventory } from '@/components/systems/inventory/app.tsx'
import { salesReport } from '@/components/systems/sales-report/app.tsx'
import { customerPortal } from '@/components/systems/customer-portal/app.tsx'
import { expense } from '@/components/systems/expense/app.tsx'
import { dailyReport } from '@/components/systems/daily-report/app.tsx'
import { recruiting } from '@/components/systems/recruiting/app.tsx'
import { inquiry } from '@/components/systems/inquiry/app.tsx'
import { contract } from '@/components/systems/contract/app.tsx'

export type SystemExample = { config: KitConfig; layout: 'app' | 'page' }
export const systemExamples: Record<string, SystemExample> = {
  inventory: { config: inventory, layout: 'app' },
  'sales-report': { config: salesReport, layout: 'app' },
  'customer-portal': { config: customerPortal, layout: 'page' },
  'expense': { config: expense, layout: 'page' },
  'daily-report': { config: dailyReport, layout: 'page' },
  'recruiting': { config: recruiting, layout: 'app' },
  'inquiry': { config: inquiry, layout: 'app' },
  'contract': { config: contract, layout: 'app' },
}
