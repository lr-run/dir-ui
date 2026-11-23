// Record list for any object: the CRM list page with columns, filters and the create form derived from fields.
import { type ReactNode, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import type { Choice } from '@/lib/choice-types.ts'
import type { RecordCellType, RecordColumn } from '@/components/crm/components/record-table.tsx'
import { ListPage, type ListPageDefinition } from '@/components/crm/screens/list-page.tsx'
import { FormField } from '@/components/systems/kit/fields.tsx'
import { queryFields, queryKitRows } from '@/components/systems/kit/query.ts'
import type { KitStore } from '@/components/systems/kit/store.ts'
import type { KitField, KitObject, KitRow, ListViews } from '@/components/systems/kit/types.ts'

const cellType = (field: KitField): RecordCellType =>
  field.type === 'choice'
    ? 'status'
    : field.type === 'member'
    ? 'member'
    : field.type === 'longtext' || field.type === 'tel' || field.type === 'reference'
    ? 'text'
    : field.type
/** The object's saved views, or one Default view; filters and sorts come from `KitObject.views`. */
export const defaultViews = (object?: KitObject): ListViews => {
  const views = (object?.views?.length ? object.views : [{ id: 'default', name: 'Default' }]).map((view) => ({
    id: view.id,
    name: view.name,
    sorts: 'sorts' in view ? [...(view.sorts ?? [])] : [],
    filter: ('filter' in view && view.filter) || { conjunction: 'and' as const, conditions: [] },
    columns: [],
  }))
  return { activeId: views[0]!.id, views }
}

export function listDefinition(object: KitObject): ListPageDefinition<KitRow> {
  const fields = queryFields(object)
  return {
    title: object.title,
    singular: object.singular,
    icon: object.icon,
    rowKey: (row) => row.id,
    queryFields: fields,
    query: (rows, query) => queryKitRows(rows, fields, query),
    columns: [
      { key: 'name', name: object.nameLabel ?? 'Name', type: 'record', width: 240, required: true },
      ...object.fields.filter((field) => !field.hideInList).map((field): RecordColumn<KitRow> => ({
        key: field.key,
        name: field.label,
        type: cellType(field),
        width: field.width,
        format: field.type === 'money' ? { currency: field.currency ?? 'JPY' } : undefined,
        ...field.type === 'choice'
          ? { renderCell: ({ row }) => <ChoiceCell field={field} label={row[field.key]} /> }
          : {},
      })),
      { key: 'updatedAt', name: 'Updated', type: 'date', width: 150 },
    ],
  }
}

/** A choice as a tinted pill in its option color, so status reads the same in every list. */
function ChoiceCell({ field, label }: { field: KitField; label: unknown }) {
  const option = field.options?.find((item) => item.label === label)
  if (!option) return null
  const color = option.color ?? 'var(--ui-muted)'
  return (
    <span
      className='inline-flex h-[22px] items-center gap-[6px] rounded-[5px] px-[7px] text-[12px] whitespace-nowrap'
      style={{ background: `color-mix(in srgb, ${color} 12%, var(--ui-raised))` }}
    >
      <span className='size-[6px] shrink-0 rounded-full' style={{ background: color }} aria-hidden='true' />
      {option.label}
    </span>
  )
}

export function KitList(
  { object, store, users, leading, views, onViewsChange, onOpen, onOpenPreview, previewId, onNavigate }: {
    object: KitObject
    store: KitStore
    users: Choice[]
    leading: ReactNode
    views: ListViews
    onViewsChange: (views: ListViews | ((previous: ListViews) => ListViews)) => void
    onOpen: (id: string) => void
    onNavigate: (path: string) => void
    previewId?: string
    onOpenPreview: (row: KitRow, rows: readonly KitRow[], fieldId?: string) => void
  },
) {
  const [archived, setArchived] = useState(false)
  const [creating, setCreating] = useState(false)
  const definition = useMemo(() => listDefinition(object), [object])
  const rows = useMemo(() => store.rows[object.id]!.filter((row) => !!row.archivedAt === archived), [
    store.rows,
    object.id,
    archived,
  ])
  return (
    <>
      <ListPage
        key={object.id}
        definition={definition}
        leading={leading}
        records={rows}
        views={views}
        onViewsChange={onViewsChange}
        archived={archived}
        onArchivedChange={setArchived}
        onCreate={object.readOnly
          ? undefined
          : () => object.createPath ? onNavigate(object.createPath) : setCreating(true)}
        onOpenDetail={(row) => onOpen(row.id)}
        previewId={previewId}
        onOpenPreview={onOpenPreview}
      />
      {creating && (
        <CreateForm
          object={object}
          store={store}
          users={users}
          onClose={() => setCreating(false)}
          onCreated={onOpen}
        />
      )}
    </>
  )
}

type Values = Record<string, unknown> & { name: string }
export function CreateForm({ object, store, users, onClose, onCreated }: {
  object: KitObject
  store: KitStore
  users: Choice[]
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const notifyError = useErrorNotification()
  const editable = object.fields.filter((field) => !field.readOnly)
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    defaultValues: {
      name: '',
      ...Object.fromEntries(
        editable.map((field) => [field.key, field.type === 'choice' ? field.options![0]!.value : '']),
      ),
      ...object.defaults?.(store),
    },
  })
  const formId = `create-${object.id}`
  return (
    <Dialog
      open
      title={`New ${object.singular.toLowerCase()}`}
      onOpenChange={(open) => !open && onClose()}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant='default' type='submit' form={formId} disabled={isSubmitting} className='min-w-[120px]'>
            {isSubmitting ? 'Creating…' : `Create ${object.singular.toLowerCase()}`}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        noValidate
        aria-busy={isSubmitting}
        className='grid grid-cols-2 gap-4 p-5 max-[600px]:grid-cols-1 [&>*:has(textarea)]:col-span-full'
        onSubmit={handleSubmit(async ({ name, ...values }) => {
          try {
            // The in-memory store answers at once; an API call would be awaited here the same way.
            const record = await Promise.resolve(store.create(
              object.id,
              name.trim(),
              Object.fromEntries(
                editable.map((field) => {
                  const value = values[field.key]
                  const numeric = field.type === 'number' || field.type === 'money' || field.type === 'percent'
                  return [field.key, numeric ? (value === '' || value == null ? null : Number(value)) : value]
                }),
              ),
            ))
            onClose()
            onCreated?.(record.id)
          } catch (error) {
            notifyError?.(error, 'Unable to save.')
          }
        })}
      >
        {/* Every field locks with the buttons while the record saves (rule 6). */}
        <fieldset disabled={isSubmitting} className='contents'>
          <div className='col-span-full'>
            <Field label={object.nameLabel ?? 'Name'} required error={errors.name?.message}>
              {(props) => (
                <Input
                  {...props}
                  autoFocus
                  {...register('name', {
                    validate: (value) => !!value.trim() || `${object.nameLabel ?? 'Name'} is required.`,
                  })}
                />
              )}
            </Field>
          </div>
          {editable.map((field) => (
            <FormField key={field.key} field={field} control={control} store={store} users={users} />
          ))}
        </fieldset>
      </form>
    </Dialog>
  )
}
