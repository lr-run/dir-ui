import { choiceField, recordChoices, textField, userChoices } from '@/components/crm/components/record-fields.tsx'
import { RecordDetail } from '@/components/crm/components/record-detail.tsx'
import { taskStatuses } from '@/components/crm/example/data.ts'
import type { DetailRouteProps, RecordField } from '@/components/crm/types.ts'
export function tasksFields({ record, store: { state } }: DetailRouteProps): RecordField[] {
  return [
    textField('name', 'Title', 'text', true),
    choiceField('companyId', 'Company', recordChoices(state, 'companies'), true),
    choiceField(
      'dealId',
      'Deal',
      recordChoices(state, 'deals', record.data.kind === 'tasks' ? record.data.companyId : undefined),
      false,
    ),
    choiceField(
      'personId',
      'Person',
      recordChoices(state, 'people', record.data.kind === 'tasks' ? record.data.companyId : undefined),
      false,
    ),
    choiceField('assigneeId', 'Assignee', userChoices(state), true),
    textField('dueAt', 'Due', 'datetime-local', false),
    choiceField('status', 'Status', [...taskStatuses], true),
  ]
}
export function TasksDetail(props: DetailRouteProps) {
  return <RecordDetail {...props} fields={tasksFields(props)} />
}
