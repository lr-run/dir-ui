import { choiceField, recordChoices, textField, userChoices } from '@/components/crm/components/record-fields.tsx'
import { RecordDetail } from '@/components/crm/components/record-detail.tsx'

import type { DetailRouteProps, RecordField, RecordFieldsContext } from '@/components/crm/types.ts'
export function dealsFields({ store: { state } }: RecordFieldsContext): RecordField[] {
  return [
    textField('name', 'Name', 'text', true),
    choiceField('companyId', 'Company', recordChoices(state, 'companies'), true),
    choiceField('ownerId', 'Owner', userChoices(state), true),
    choiceField(
      'stageId',
      'Stage',
      [...state.stages].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => ({ value: s.id, label: s.name })),
      true,
    ),
    textField('amount', 'Amount', 'money', false),
    choiceField(
      'currency',
      'Currency',
      Intl.supportedValuesOf('currency').map((value) => ({ value, label: value })),
      true,
    ),
    textField('expectedCloseDate', 'Expected close', 'date', false),
    textField('nextAction', 'Next action', 'text', false),
  ]
}
export function DealsDetail(props: DetailRouteProps) {
  return <RecordDetail {...props} fields={dealsFields(props)} />
}
