import { choiceField, textField, userChoices } from '@/components/crm/components/record-fields.tsx'
import { RecordDetail } from '@/components/crm/components/record-detail.tsx'

import type { DetailRouteProps, RecordField, RecordFieldsContext } from '@/components/crm/types.ts'
export function companiesFields({ store: { state } }: RecordFieldsContext): RecordField[] {
  return [
    textField('name', 'Name', 'text', true),
    choiceField('ownerId', 'Owner', userChoices(state), true),
    textField('industry', 'Industry', 'text', false),
    textField('website', 'Website', 'url', false),
  ]
}
export function CompaniesDetail(props: DetailRouteProps) {
  return <RecordDetail {...props} fields={companiesFields(props)} />
}
