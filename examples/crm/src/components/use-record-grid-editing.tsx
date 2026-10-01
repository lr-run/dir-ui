import { useMemo, useRef, useState } from 'react'
import { Toast } from '@/components/ui/toast.tsx'
import { RecordCellEditor } from '@/components/crm/components/record-cell-editor.tsx'
import type { RecordTableProps } from '@/components/crm/components/record-table.tsx'
import { recordEditField, recordFieldChange } from '@/components/crm/components/record-editing.ts'
import { projectRecord } from '@/components/crm/example/data.ts'
import type {
  CrmStore,
  ExampleKind,
  ExampleRecord,
  RecordChange,
  RecordField,
  RecordFieldsContext,
} from '@/components/crm/types.ts'

type PendingEdit = {
  row: ExampleRecord
  patch: RecordChange
  column: string
  saving: boolean
  toastId?: string
}

/** Persistence is separate from react-data-grid's synchronous editing lifecycle. */
export function useRecordGridEditing(
  store: CrmStore,
  kind: ExampleKind,
  fields: (props: RecordFieldsContext) => RecordField[],
): NonNullable<RecordTableProps<ExampleRecord>['inlineEditing']> {
  const toast = Toast.useToastManager()
  const [pending, setPending] = useState(new Map<string, PendingEdit>())
  const pendingRef = useRef(pending)
  const latest = useRef(store)
  latest.current = store
  const currentRows = useMemo(() => new Map(Object.values(store.collections).flat().map((row) => [row.id, row])), [
    store.collections,
  ])
  const put = (id: string, entry?: PendingEdit) => {
    const next = new Map(pendingRef.current)
    if (entry) next.set(id, entry)
    else next.delete(id)
    pendingRef.current = next
    setPending(next)
  }
  const save = async (entry: PendingEdit) => {
    const { row } = entry
    if (pendingRef.current.get(row.id)?.saving) return
    if (entry.toastId) toast.close(entry.toastId)
    put(row.id, { ...entry, saving: true, toastId: undefined })
    try {
      await latest.current.update(row.data.kind, row.id, entry.patch)
      put(row.id)
    } catch (error) {
      const failed = { ...entry, saving: false }
      failed.toastId = toast.add({
        title: 'Changes not saved',
        description: `${
          error instanceof Error ? error.message : 'Unable to save.'
        } Your input is retained in the table.`,
        type: 'error',
        priority: 'high',
        timeout: 0,
        actionProps: {
          children: 'Retry',
          onClick: () => {
            const retained = pendingRef.current.get(row.id)
            if (retained) void save(retained)
          },
        },
      })
      put(row.id, failed)
    }
  }
  return {
    resolveRow: (row) => {
      const retained = pending.get(row.id)
      if (retained) return retained.row
      const current = currentRows.get(row.id)
      return current && current.version > row.version ? current : row
    },
    status: (row, column) => {
      const entry = pending.get(row.id)
      return entry?.column === column ? entry.saving ? 'saving' : 'failed' : undefined
    },
    canEdit: (row, column) =>
      !row.archivedAt && !pending.get(row.id)?.saving &&
      !!recordEditField(kind, column),
    render: (props) => {
      const field = fields({
        record: props.row,
        store,
      }).find((field) => field.id === recordEditField(kind, props.column.key))
      return field?.editor && <RecordCellEditor {...props} field={field} state={store.state} />
    },
    onRowsChange: (rows, { indexes, column }) => {
      for (const index of indexes) {
        const row = rows[index], id = recordEditField(kind, column.key)
        if (!row || !id || pendingRef.current.get(row.id)?.saving) continue
        const prior = latest.current.state.records.find((record) => record.id === row.id)
        const patch: RecordChange = {
          ...pendingRef.current.get(row.id)?.patch,
          ...recordFieldChange(prior ?? row.data, id, Reflect.get(row.data, id)),
        }
        if (
          prior &&
          Object.entries(patch).every(([key, value]) =>
            JSON.stringify(Reflect.get(prior, key)) === JSON.stringify(value)
          )
        ) {
          const old = pendingRef.current.get(row.id)
          if (old?.toastId) toast.close(old.toastId)
          put(row.id)
          continue
        }
        void save({
          row: projectRecord({ ...row.data, ...patch }, store.state.records, store.state.users, store.state.stages),
          patch,
          column: column.key,
          saving: false,
          toastId: pendingRef.current.get(row.id)?.toastId,
        })
      }
    },
  }
}
