import { choiceField, recordChoices, textField } from '@/components/crm/components/record-fields.tsx'
import { RecordDetail } from '@/components/crm/components/record-detail.tsx'

import type { DetailRouteProps, RecordField, RecordFieldsContext } from '@/components/crm/types.ts'
export function peopleFields({ store: { state } }: RecordFieldsContext): RecordField[] {
  return [
    textField('name', 'Name', 'text', true),
    choiceField('companyId', 'Company', recordChoices(state, 'companies'), true),
    textField('department', 'Department', 'text', false),
    textField('title', 'Title', 'text', false),
    textField('email', 'Email', 'email', false),
    textField('phone', 'Phone', 'tel', false),
  ]
}
export function PeopleDetail(props: DetailRouteProps) {
  return <RecordDetail {...props} fields={peopleFields(props)} />
}
