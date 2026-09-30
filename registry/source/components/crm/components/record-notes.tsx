import { AlignLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { createElement, type CSSProperties, type ReactNode, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { ConfirmDialog } from '@/components/ui/alert-dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { RichText, type RichTextValue } from '@/components/ui/rich-text.tsx'
import type { ExampleNote } from '@/components/crm/types.ts'
import type { Note } from '@/components/ui/rich-text.tsx'
export function RecordNotes({ notes, onChange }: {
  notes: ExampleNote[]
  onChange: (notes: ExampleNote[], label: string) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<ExampleNote | null>(null)
  const active = notes.find((note) => note.id === editing)
  return (
    <div className='min-w-0'>
      <div className="flex items-center justify-between gap-[12px] mb-[16px] [&_h3]:flex [&_h3]:gap-[8px] [&_h3]:items-center [&_h3]:m-0 [&_h3]:text-foreground [&_h3]:text-[13px] [&_h3]:[font-weight:550] [&_h3_span]:text-muted-foreground [&_h3_span]:text-[11px] [&_[data-slot='button']]:h-[28px] [&_[data-slot='button']]:text-[12px]">
        <h3>
          Notes <span>{notes.length}</span>
        </h3>
        <Button disabled={editing !== null} onClick={() => setEditing('new')}>
          <PlusIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />Add note
        </Button>
      </div>
      {editing && (
        <NoteEditor
          key={editing}
          note={active}
          onCancel={() => setEditing(null)}
          onSave={(note) => {
            onChange(
              active ? notes.map((item) => item.id === note.id ? note : item) : [note, ...notes],
              active ? 'Note edited' : 'Note added',
            )
            setEditing(null)
          }}
        />
      )}
      {!notes.length && !editing && (
        <div className='p-[34px_12px] text-center text-muted-foreground text-[12px] [&_p]:text-foreground [&_p]:m-[12px_0_8px] [&_p]:text-[13px] [&>svg>svg]:w-[24px] [&>svg>svg]:h-[24px] [&>svg>svg]:m-[0_auto]'>
          <AlignLeftIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          <p>No notes yet</p>
          <span>Keep meeting notes, context, and next steps together.</span>
        </div>
      )}
      <div className='grid gap-[12px]'>
        {notes.filter((note) => note.id !== editing).map((note) => (
          <article
            key={note.id}
            className='[border:1px_solid_var(--ui-border)] rounded-[8px] min-w-0 p-[16px] [&>header]:flex [&>header]:items-start [&>header]:justify-between [&>header]:gap-[8px] [&>header]:mb-[16px] [&_h4]:text-[13px] [&_h4]:[font-weight:550] [&_h4]:m-[0_0_6px] [&_h4]:[overflow-wrap:anywhere] [&_time]:text-[11px] [&_time]:text-muted-foreground [&>header>div:first-child]:min-w-0'
            aria-label={note.title}
          >
            <header>
              <div>
                <h4>{note.title}</h4>
                <time dateTime={note.updatedAt}>
                  {new Date(note.updatedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {note.updatedAt !== note.createdAt ? ' · Edited' : ''}
                </time>
              </div>
              <div className="flex gap-[2px] shrink-0 [&_[class~='group/crm-icon-button']]:w-[26px] [&_[class~='group/crm-icon-button']]:h-[26px]">
                <IconButton
                  variant='ghost'
                  label={`Edit note: ${note.title}`}
                  disabled={editing !== null}
                  onClick={() => setEditing(note.id)}
                >
                  <PencilIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                </IconButton>
                <IconButton
                  variant='ghost'
                  label={`Delete note: ${note.title}`}
                  disabled={editing !== null}
                  onClick={() => setDeleting(note)}
                >
                  <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                </IconButton>
              </div>
            </header>
            <NoteContent body={note.body} />
          </article>
        ))}
      </div>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={`Delete “${deleting?.title ?? 'note'}”?`}
        description='This removes this note from the demo record.'
        action='Delete note'
        onConfirm={() => {
          if (deleting) {
            onChange(notes.filter((note) => note.id !== deleting.id), 'Note deleted')
          }
          setDeleting(null)
        }}
      />
    </div>
  )
}
function NoteEditor(
  { note, onSave, onCancel }: { note?: ExampleNote; onSave: (note: ExampleNote) => void; onCancel: () => void },
) {
  const draft = useRef<RichTextValue>({
    notes: note?.text ?? '',
    notesDoc: note?.body ?? { type: 'doc', content: [{ type: 'paragraph' }] },
  })
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<{ title: string }>({
    defaultValues: { title: note?.title ?? '' },
  })
  const save = handleSubmit(({ title }) => {
    if (!draft.current.notes.trim()) {
      setError('root', { message: 'Write a note before saving.' })
      return
    }
    const now = new Date().toISOString()
    onSave({
      id: note?.id ?? crypto.randomUUID(),
      title: title.trim() || 'Untitled note',
      body: draft.current.notesDoc,
      text: draft.current.notes,
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    })
  })
  return (
    <form
      className="grid gap-[10px] mb-[16px] min-w-0 [&_footer]:flex [&_footer]:gap-[8px] [&_footer]:justify-end [&_footer_[data-slot='button']]:h-[28px] [&_footer_[data-slot='button']]:text-[12px] [&>[data-slot='input']]:w-full [&>[data-slot='input']]:text-[13px] [&_[class~='group/rich-editor-content']]:min-h-[160px] [&_[class~='group/rich-editor-content']]:p-[14px] [&_[class~='group/rich-editor-content']]:text-[length:var(--dir-text-inline,_13px)] [&_[class~='group/editor-status']]:flex-wrap [&_[class~='group/editor-status']]:gap-[4px] [&_[class~='group/editor-status']]:text-[10px]"
      aria-label={note ? 'Edit note' : 'New note'}
      onSubmit={save}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          void save()
        }
      }}
    >
      <Input
        autoFocus
        aria-label='Note title'
        placeholder='Untitled note'
        {...register('title', { maxLength: { value: 160, message: 'Use 160 characters or fewer.' } })}
      />
      <RichText
        label='Note body'
        initialContent={draft.current.notesDoc}
        onUpdate={(value) => {
          draft.current = value
          clearErrors('root')
        }}
      />
      {(errors.root || errors.title) && (
        <p className='text-destructive text-[12px] m-0' role='alert'>
          {errors.root?.message || errors.title?.message}
        </p>
      )}
      <footer>
        <Button type='button' onClick={onCancel}>Cancel</Button>
        <Button type='submit' variant='default'>{note ? 'Save changes' : 'Add note'}</Button>
      </footer>
    </form>
  )
}

// Static React rendering keeps a notes list lightweight; only the active draft mounts an editor.
export function NoteContent({ body }: { body: Note }) {
  return (
    <div className="text-[length:var(--dir-text-inline,_13px)] leading-[1.65] [overflow-wrap:anywhere] [&_p]:m-[0_0_10px] [&_h1]:m-[14px_0_8px] [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:m-[14px_0_8px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:m-[14px_0_8px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h1]:text-[20px] [&_h2]:text-[17px] [&_h3]:text-[15px] [&_ul]:pl-[22px] [&_ul]:m-[8px_0] [&_ol]:pl-[22px] [&_ol]:m-[8px_0] [&_ul]:[list-style:disc] [&_ol]:[list-style:decimal] [&_li_p]:mb-[4px] [&_blockquote]:m-[12px_0] [&_blockquote]:pl-[12px] [&_blockquote]:[border-left:3px_solid_var(--ui-border)] [&_blockquote]:text-muted-foreground [&_pre]:[background:var(--ui-raised)] [&_pre]:p-[10px] [&_pre]:rounded-[5px] [&_pre]:overflow-auto [&_a]:underline [&_a]:text-primary [&_table]:w-full [&_table]:[border-collapse:collapse] [&_th]:[border:1px_solid_var(--ui-border)] [&_th]:p-[6px] [&_td]:[border:1px_solid_var(--ui-border)] [&_td]:p-[6px] [&>div>:last-child]:mb-0 [&_[class~='group/record-note-tasks']]:list-none [&_[class~='group/record-note-tasks']]:pl-0">
      {renderNode(body)}
    </div>
  )
}
function safeHref(value: unknown) {
  return typeof value === 'string' && /^(https?:\/\/|mailto:|tel:|#)/i.test(value) ? value : undefined
}
function renderNode(node: Note, key = 0): ReactNode {
  const children = node.content?.map((child, index) => renderNode(child, index))
  if (node.type === 'text') {
    let content: ReactNode = node.text ?? ''
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case 'bold':
          content = <strong>{content}</strong>
          break
        case 'italic':
          content = <em>{content}</em>
          break
        case 'underline':
          content = <u>{content}</u>
          break
        case 'strike':
          content = <s>{content}</s>
          break
        case 'code':
          content = <code>{content}</code>
          break
        case 'highlight':
          content = <mark>{content}</mark>
          break
        case 'textStyle': {
          const color = mark.attrs?.color
          if (typeof color === 'string' && /^#[0-9a-f]{3,8}$/i.test(color)) {
            content = (
              <span className='text-(--note-color)' style={{ '--note-color': color } as CSSProperties}>{content}</span>
            )
          }
          break
        }
        case 'link': {
          const href = safeHref(mark.attrs?.href)
          if (href) content = <a href={href} rel='noopener noreferrer' target='_blank'>{content}</a>
          break
        }
      }
    }
    return <span key={key}>{content}</span>
  }
  switch (node.type) {
    case 'doc':
      return <div key={key}>{children}</div>
    case 'paragraph':
      return <p key={key}>{children?.length ? children : <br />}</p>
    case 'heading':
      return createElement(`h${Math.min(3, Math.max(1, Number(node.attrs?.level) || 1))}`, { key }, children)
    case 'bulletList':
      return <ul key={key}>{children}</ul>
    case 'orderedList':
      return <ol key={key} start={Number(node.attrs?.start) || 1}>{children}</ol>
    case 'listItem':
      return <li key={key}>{children}</li>
    case 'taskList':
      return (
        <ul key={key} className='group/record-note-tasks [&>li]:flex [&>li]:items-start [&>li]:gap-[8px]'>
          {children}
        </ul>
      )
    case 'taskItem':
      return (
        <li key={key}>
          <span role='img' aria-label={node.attrs?.checked ? 'Completed' : 'Not completed'}>
            {node.attrs?.checked ? '☑' : '☐'}
          </span>
          <div>{children}</div>
        </li>
      )
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>
    case 'codeBlock':
      return <pre key={key}><code>{children}</code></pre>
    case 'hardBreak':
      return <br key={key} />
    case 'horizontalRule':
      return <hr key={key} />
    case 'table':
      return (
        <div key={key} className='overflow-x-auto'>
          <table>
            <tbody>{children}</tbody>
          </table>
        </div>
      )
    case 'tableRow':
      return <tr key={key}>{children}</tr>
    case 'tableHeader':
    case 'tableCell':
      return createElement(node.type === 'tableHeader' ? 'th' : 'td', {
        key,
        colSpan: Math.max(1, Number(node.attrs?.colspan) || 1),
        rowSpan: Math.max(1, Number(node.attrs?.rowspan) || 1),
      }, children)
    default:
      return <span key={key}>{children}</span>
  }
}
