// Record detail and side preview for any object: the CRM detail page with inline fields, related records, notes
// and change history.
import { ChevronDownIcon, Maximize2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { Field } from '@/components/ui/field.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { InlineField } from '@/components/ui/inline-field.tsx'
import { SheetBody, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { List, ListItem } from '@/components/ui/list.tsx'
import type { Choice } from '@/lib/choice-types.ts'
import { RecordArchiveAction } from '@/components/crm/components/record-archive-action.tsx'
import { type DetailField, DetailFields, DetailPage } from '@/components/crm/screens/detail-page.tsx'
import { RecordField } from '@/components/systems/kit/fields.tsx'
import type { KitStore } from '@/components/systems/kit/store.ts'
import type { KitDetailContext, KitObject, KitRecord } from '@/components/systems/kit/types.ts'

type Change = { name?: string; values?: Record<string, unknown> }
const time = (value: string) =>
  new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

/** The record's fields as inline editors; the name comes first. */
export function recordFields(object: KitObject, store: KitStore, users: Choice[]): DetailField<KitRecord, Change>[] {
  return [
    {
      id: 'name',
      label: object.nameLabel ?? 'Name',
      render: ({ record, onChange }) =>
        record.archivedAt || object.readOnly
          ? <span className='block px-2 py-1 text-[13px]'>{record.name}</span>
          : (
            <InlineField
              label={object.nameLabel ?? 'Name'}
              value={record.name}
              validate={(value) => value.trim() ? undefined : 'Enter a name.'}
              onValueChange={(name) => onChange({ name: name.trim() }, 'Name')}
            />
          ),
    },
    ...object.fields.map((field): DetailField<KitRecord, Change> => ({
      id: field.key,
      label: field.label,
      render: ({ record, onChange }) => (
        <RecordField
          field={field}
          record={record}
          store={store}
          users={users}
          readOnly={object.readOnly}
          onSave={(value) => onChange({ values: { [field.key]: value } }, field.label)}
        />
      ),
    })),
  ]
}

export function KitDetail({ object, record, store, users, context, onArchive, onOpenRecord }: {
  object: KitObject
  record: KitRecord
  store: KitStore
  users: Choice[]
  context: KitDetailContext
  onArchive: () => void
  onOpenRecord: (objectId: string, id: string) => void
}) {
  const custom = object.detail?.tabs ?? []
  const related = store.related(object.id, record.id).filter((group) =>
    !object.detail?.hideRelated?.includes(group.object.id)
  )
  const history = store.state.history.filter((entry) => entry.objectId === object.id && entry.recordId === record.id)
  const notes = store.state.notes.filter((note) => note.objectId === object.id && note.recordId === record.id)
  const [draft, setDraft] = useState('')
  return (
    <DetailPage
      title={record.name}
      fields={recordFields(object, store, users)}
      record={record}
      archived={!!record.archivedAt}
      onArchive={object.readOnly ? undefined : onArchive}
      onChange={(change) => store.update(object.id, record.id, change)}
    >
      <Tabs defaultValue={custom[0]?.id ?? (related.length ? 'related' : 'notes')}>
        <TabsList aria-label='Record sections'>
          {custom.map((tab) => <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>)}
          {related.length > 0 && <TabsTrigger value='related'>Related</TabsTrigger>}
          <TabsTrigger value='notes'>Notes{notes.length ? ` · ${notes.length}` : ''}</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>
        {custom.map((tab) => <TabsContent key={tab.id} value={tab.id}>{tab.render(context)}</TabsContent>)}
        {related.length > 0 && (
          <TabsContent value='related' className='flex flex-col gap-6'>
            {related.map((group) => (
              <section key={`${group.object.id}-${group.field.key}`} className='flex flex-col gap-2'>
                <h3 className='m-0 flex items-center gap-2 text-[13px] font-semibold'>
                  {group.object.icon}
                  {group.object.title}
                  <span className='font-normal text-muted-foreground'>{group.rows.length}</span>
                </h3>
                <List className='overflow-hidden rounded-lg border border-border'>
                  {group.rows.slice(0, 8).map((row) => {
                    const summary = group.object.fields.filter((field) =>
                      field.key !== group.field.key && !field.hideInList
                    ).slice(0, 2)
                    return (
                      <ListItem
                        key={row.id}
                        className='px-3 py-2.5'
                        onOpen={() => onOpenRecord(group.object.id, row.id)}
                        title={row.name}
                        description={summary.map((field) =>
                          String(row[field.key] ?? '')
                        ).filter(Boolean).join(' · ') ||
                          undefined}
                      />
                    )
                  })}
                </List>
              </section>
            ))}
          </TabsContent>
        )}
        <TabsContent value='notes' className='flex flex-col gap-4'>
          {!record.archivedAt && (
            <form
              className='flex flex-col gap-2'
              onSubmit={(event) => {
                event.preventDefault()
                if (!draft.trim()) return
                store.addNote(object.id, record.id, draft.trim())
                setDraft('')
              }}
            >
              <Field label='New note'>
                {(props) => (
                  <Textarea
                    {...props}
                    rows={3}
                    placeholder='Add a note for your team'
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                )}
              </Field>
              <div className='flex justify-end'>
                <Button type='submit' variant='default' disabled={!draft.trim()}>Add note</Button>
              </div>
            </form>
          )}
          {notes.length
            ? (
              <ul className='m-0 flex flex-col gap-3 p-0 [&_li]:list-none'>
                {notes.map((note) => (
                  <li key={note.id} className='rounded-lg border border-border p-3 text-[13px] leading-5'>
                    <span className='mb-1 block text-[12px] text-muted-foreground'>
                      {note.author} · {time(note.at)}
                    </span>
                    <span className='whitespace-pre-wrap'>{note.body}</span>
                  </li>
                ))}
              </ul>
            )
            : <EmptyState title='No notes yet' />}
        </TabsContent>
        <TabsContent value='history'>
          {history.length
            ? (
              <ol className='m-0 flex flex-col p-0 text-[13px] [&_li]:list-none'>
                {history.map((entry) => (
                  <li key={entry.id} className='flex flex-col gap-1 border-t border-border py-3 first:border-t-0'>
                    <span className='text-[12px] text-muted-foreground'>
                      {entry.actor} · {time(entry.at)}
                    </span>
                    {entry.operation === 'update'
                      ? Object.entries(entry.changes).map(([label, { before, after }]) => (
                        <span key={label}>
                          <b className='font-medium'>{label}</b> <span className='text-muted-foreground'>{before}</span>
                          {' → '}
                          {after}
                        </span>
                      ))
                      : <span className='capitalize'>{entry.operation}d</span>}
                  </li>
                ))}
              </ol>
            )
            : <EmptyState title='No changes since this page opened' />}
        </TabsContent>
      </Tabs>
    </DetailPage>
  )
}

/** The right-hand sheet a list row opens; the arrows move through the rows in their current order. */
export function KitPreview(
  { object, record, store, users, highlightedFieldId, position, total, onPrevious, onNext, onOpen, onArchive }: {
    object: KitObject
    record: KitRecord
    store: KitStore
    users: Choice[]
    highlightedFieldId?: string
    position: number
    total: number
    onPrevious?: () => void
    onNext?: () => void
    onOpen: () => void
    onArchive: () => void
  },
) {
  return (
    <SheetContent backdrop={false} className='group/screen-record-sheet group/record-preview'>
      <SheetHeader>
        <div className='flex w-full items-center gap-1'>
          <SheetClose
            render={
              <IconButton variant='ghost' label='Close preview'>
                <XIcon size={16} />
              </IconButton>
            }
          />
          <IconButton variant='ghost' label='Previous record' disabled={!onPrevious} onClick={onPrevious}>
            <ChevronDownIcon size={16} className='rotate-180' />
          </IconButton>
          <IconButton variant='ghost' label='Next record' disabled={!onNext} onClick={onNext}>
            <ChevronDownIcon size={16} />
          </IconButton>
          <span className='flex-1 text-xs text-muted-foreground'>{position} of {total}</span>
          <IconButton variant='ghost' label='Open full record' onClick={onOpen}>
            <Maximize2Icon size={16} />
          </IconButton>
        </div>
        <SheetTitle className='sr-only'>{record.name} preview</SheetTitle>
      </SheetHeader>
      <SheetBody>
        <div className='p-5'>
          <div className='mb-6 flex items-center gap-3'>
            <span className='grid size-9 shrink-0 place-items-center rounded-lg border border-border'>
              {record.name[0]}
            </span>
            <h2 className='m-0 flex-1 text-base font-semibold'>{record.name}</h2>
            {!object.readOnly && <RecordArchiveAction archived={!!record.archivedAt} onArchive={onArchive} />}
          </div>
          {record.archivedAt && <p className='mb-4 text-xs text-muted-foreground'>Archived · Restore to edit.</p>}
          <DetailFields
            fields={recordFields(object, store, users)}
            highlightedFieldId={highlightedFieldId}
            record={record}
            onChange={(change) => store.update(object.id, record.id, change)}
          />
        </div>
      </SheetBody>
    </SheetContent>
  )
}
