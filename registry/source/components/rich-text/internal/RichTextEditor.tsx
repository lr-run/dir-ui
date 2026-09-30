import type { Note, RichTextProps } from '@/components/ui/rich-text.tsx'
import type { SuggestionProps } from '@tiptap/suggestion'
import type { ComponentProps } from 'react'
import { useI18n } from '@/lib/i18n.tsx'
import { useEditorText } from '@/components/rich-text/internal/locale.ts'
import { Modal } from '@/components/rich-text/internal/modal.tsx'
import { markdownDocument } from '@/components/rich-text/internal/paste.ts'
import { useEffect, useId, useRef, useState } from 'react'
import { Editor } from '@tiptap/core'
import { Popover } from '@base-ui/react/popover'
import { createExtensions } from '@/components/rich-text/internal/extensions.ts'
import { plainDocument } from '@/components/rich-text/internal/commands.ts'
import FormattingToolbar from '@/components/rich-text/internal/FormattingToolbar.tsx'
import { SlashMenu } from '@/components/rich-text/internal/BlockMenu.tsx'

/**
 * Standalone editor. Persistence belongs to the caller, never this component.
 * Pass Tiptap JSON as initialContent and remount with key={documentId} when
 * switching documents. onUpdate returns {notesDoc, notes}; the plain text
 * value is useful for previews, while notesDoc preserves all formatting.
 */
export default function RichTextEditor({
  references = /** @type {{kind:string,id:string,title:string}[]} */ ([]),
  initialContent,
  initialText = '',
  onUpdate,
  readOnly = false,
  label = 'Document',
  className = '',
}: RichTextProps) {
  const { language } = useI18n(), t = useEditorText()
  const [mention, setMention] = useState(false), [query, setQuery] = useState('')
  const searchReferences = references.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
  const searchError = ''
  const mentionRecords = [...new Map([...references, ...searchReferences].map((r) => [r.kind + r.id, r])).values()]
  const selection = useRef(0)
  const mount = useRef<HTMLDivElement>(null),
    instance = useRef<Editor | null>(null),
    toolbar = useRef<HTMLDivElement>(null),
    callback = useRef(onUpdate),
    helpId = useId()
  callback.current = onUpdate
  const [, setRevision] = useState(0),
    [slash, setSlash] = useState<SuggestionProps | null>(null),
    [selectionRect, setSelectionRect] = useState<ComponentProps<typeof Popover.Positioner>['anchor']>(null)
  useEffect(() => {
    if (!mount.current) return
    let ready = false
    const editor = new Editor({
      element: mount.current,
      content: initialContent?.type === 'doc' ? initialContent : plainDocument(initialText),
      extensions: createExtensions({ onSlash: setSlash, language }),
      editorProps: {
        attributes: {
          class:
            'group/rich-editor-content min-h-[200px] p-[18px_20px] text-[0.875rem] leading-[1.75] [outline:0] [overflow-wrap:anywhere] whitespace-pre-wrap [&>*]:m-[0_0_10px] [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] [&_h1]:m-[22px_0_9px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:m-[22px_0_9px] [&_h3]:font-semibold [&_h3]:tracking-[-0.02em] [&_h3]:m-[22px_0_9px] [&_h1]:text-[1.5rem] [&_h2]:text-[1.25rem] [&_h3]:text-[1.0625rem] [&_ul]:pl-[22px] [&_ol]:pl-[22px] [&_ul]:[list-style:disc] [&_ol]:[list-style:decimal] [&_li>p]:m-0 [&_li>div>p]:m-0 [&_li+li]:mt-[4px] [&_blockquote]:p-[4px_0_4px_14px] [&_blockquote]:[border-left:3px_solid_var(--ui-text)] [&_blockquote]:text-muted-foreground [&_blockquote]:m-[15px_0] [&_blockquote>p]:m-0 [&_pre]:text-[0.8125rem] [&_pre]:leading-[1.6] [&_pre]:[background:var(--ui-subtle)] [&_pre]:[border:1px_solid_var(--ui-border)] [&_pre]:rounded-[7px] [&_pre]:p-[13px_14px] [&_pre]:whitespace-pre-wrap [&_pre]:[tab-size:2] [&_pre]:[font-family:ui-monospace,_monospace] [&_hr]:[border:0] [&_hr]:[border-top:1px_solid_var(--ui-border)] [&_hr]:m-[20px_0] [&_a]:text-[var(--ui-violet)] [&_a]:underline [&_a]:[text-underline-offset:3px] [&_strong]:font-semibold [&_mark]:[background:var(--ui-amber-bg)] [&_mark]:text-[var(--ui-amber)] [&_mark]:rounded-[2px] [&_mark]:p-[1px_2px] [@media(max-width:_680px)]:text-[1rem] [@media(max-width:_680px)]:p-[16px] [@media(max-width:_680px)]:[&_h1]:text-[1.4rem] [&_table]:[border-collapse:collapse] [&_table]:w-full [&_table]:m-[12px_0] [&_td]:[border:1px_solid_var(--ui-border)] [&_td]:p-[6px] [&_td]:min-w-[70px] [&_th]:[border:1px_solid_var(--ui-border)] [&_th]:p-[6px] [&_th]:min-w-[70px] [&_th]:[background:var(--ui-subtle)] [&:focus-visible]:[outline:none] [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_:not(pre)>code]:[background:var(--ui-subtle)] [&_:not(pre)>code]:rounded-[4px] [&_:not(pre)>code]:p-[2px_4px] [&_:not(pre)>code]:text-destructive [&_:not(pre)>code]:text-[0.9em] [&_ul[data-type="taskList"]]:list-none [&_ul[data-type="taskList"]]:p-0 [&_ul[data-type="taskList"]>li]:flex [&_ul[data-type="taskList"]>li]:items-start [&_ul[data-type="taskList"]>li]:gap-[9px] [&_ul[data-type="taskList"]>li>label]:pt-[3px] [&_ul[data-type="taskList"]>li>label]:shrink-0 [&_ul[data-type="taskList"]>li_input]:[appearance:auto] [&_ul[data-type="taskList"]>li_input]:[accent-color:var(--ui-primary)] [&_ul[data-type="taskList"]>li_input]:min-h-0 [&_ul[data-type="taskList"]>li_input]:w-[14px] [&_ul[data-type="taskList"]>li_input]:h-[14px] [&_ul[data-type="taskList"]>li_input]:m-0 [&_ul[data-type="taskList"]>li_input]:cursor-pointer [&_ul[data-type="taskList"]>li>div]:flex-1 [&_ul[data-type="taskList"]>li>div]:min-w-0 [&_li[data-checked="true"]>div>p]:text-muted-foreground [&_li[data-checked="true"]>div>p]:line-through [@media(pointer:_coarse)]:[&_ul[data-type="taskList"]>li>label]:p-[6px_2px] [@media(pointer:_coarse)]:[&_ul[data-type="taskList"]>li_input]:w-[18px] [@media(pointer:_coarse)]:[&_ul[data-type="taskList"]>li_input]:h-[18px] [&:is(:focus,_:focus-visible)]:[border:0] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:[box-shadow:none]',
          role: 'textbox',
          'aria-label': label,
          'aria-multiline': 'true',
          'aria-describedby': helpId,
          spellcheck: 'true',
        },
        handlePaste: (_view, event) => {
          const text = event.clipboardData?.getData('text/plain') || ''
          if (!event.clipboardData?.getData('text/html') && /(^#{1,3} |^[-*] |^\d+\. |\*\*|^```)/m.test(text)) {
            event.preventDefault()
            editor.commands.insertContent(markdownDocument(text))
            return true
          }
          return false
        },
        handleClick: (_view, _pos, event) => {
          const href = (event.target instanceof Element ? event.target.closest('a') : null)?.getAttribute('href')
          if (href?.startsWith('#record=')) {
            globalThis.open(new URL(href, document.baseURI).href, '_blank', 'noopener,noreferrer')
            return true
          }
          return false
        },
        handleKeyDown: (_view, event) => {
          if (event.isComposing) return false
          if (event.key === '@') {
            event.preventDefault()
            selection.current = editor.state.selection.from
            setQuery('')
            setMention(true)
            return true
          }
          if (event.altKey && event.key === 'F10') {
            toolbar.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
            return true
          }
          return false
        },
      },
      onCreate: () => {
        ready = true
      },
      onUpdate: ({ editor: e }) => {
        if (ready) {
          callback.current?.({
            notesDoc: e.getJSON() as Note,
            notes: e.getText({ blockSeparator: '\n' }),
          })
        }
      },
      onTransaction: () => setRevision((v) => v + 1),
      onSelectionUpdate: ({ editor: e }) => {
        const { from, to, empty } = e.state.selection
        if (empty || !e.isEditable || e.isActive('codeBlock')) {
          setSelectionRect(null)
          return
        }
        setSelectionRect({
          getBoundingClientRect: () => {
            const a = e.view.coordsAtPos(
              Math.min(from, e.state.doc.content.size),
            )
            const b = e.view.coordsAtPos(
              Math.min(to, e.state.doc.content.size),
            )
            return {
              x: Math.min(a.left, b.left),
              y: a.top,
              top: a.top,
              bottom: b.bottom,
              left: Math.min(a.left, b.left),
              right: Math.max(a.right, b.right),
              width: Math.max(1, Math.abs(b.right - a.left)),
              height: b.bottom - a.top,
            }
          },
          contextElement: e.view.dom,
        })
      },
    })
    instance.current = editor
    setRevision((v) => v + 1)
    return () => {
      editor.destroy()
      instance.current = null
    }
  }, [])
  useEffect(() => {
    instance.current?.setEditable(!readOnly, false)
  }, [readOnly])
  const editor = instance.current
  return (
    <div
      className={"group/rich-editor [border:1px_solid_var(--ui-border)] [background:var(--ui-surface)] rounded-[9px] min-w-0 text-foreground [&_input[type=checkbox]]:w-[20px]! [&_input[type=checkbox]]:h-[20px]! [&_input[type=checkbox]]:m-[2px_7px_2px_0] [&:focus-within]:[border-color:var(--ui-ring)] [&:focus-within]:[outline:none] [&:focus-within]:outline-offset-0 [&:focus-within]:[box-shadow:none] [&[data-readonly]_[class~='group/rich-editor-content']]:opacity-70 " +
        className}
      data-readonly={readOnly || undefined}
    >
      <Modal
        open={mention}
        onOpenChange={setMention}
        title={language === 'ja' ? '関連レコードを参照' : 'Reference a record'}
      >
        <input
          className='block w-[calc(100%_-_40px)] m-[16px_20px] text-[length:var(--dir-text-body)] h-[38px]'
          aria-label={language === 'ja' ? 'レコードを検索' : 'Search records'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className='max-h-[380px] overflow-auto p-[0_12px_12px] [&>button]:flex [&>button]:items-center [&>button]:gap-[12px] [&>button]:p-[12px_8px] [&>button]:rounded-[6px] [&>button]:w-full [&>button]:text-left [&>button]:text-[length:var(--dir-text-label)] [&_small]:block [&_small]:text-muted-foreground [&_small]:text-[length:var(--dir-text-caption)] [&_small]:mt-[5px] [outline:none] [&>button:hover]:[background:var(--ui-hover)] [&>button>span:nth-child(2)]:flex-1'>
          {searchError && <p role='alert'>{searchError}</p>}
          {mentionRecords.filter((r) => (r.title + ' ' + r.kind).toLowerCase().includes(query.toLowerCase())).slice(
            0,
            20,
          ).map((r) => (
            <button
              type='button'
              key={r.kind + r.id}
              onClick={() => {
                editor?.chain().focus().setTextSelection(selection.current).insertContent([{
                  type: 'text',
                  text: '@' + r.title,
                  marks: [{ type: 'link', attrs: { href: '#record=' + r.kind + ':' + r.id } }],
                }, { type: 'text', text: ' ' }]).run()
                setMention(false)
              }}
            >
              {r.title}
            </button>
          ))}
        </div>
      </Modal>
      <FormattingToolbar
        editor={editor}
        disabled={readOnly}
        toolbarRef={toolbar}
      />
      <div ref={mount} className='rich-editor-document' />
      <div
        className='group/editor-status flex gap-[12px] justify-between p-[9px_14px] [border-top:1px_solid_var(--ui-border)] text-[0.625rem] text-muted-foreground [&_kbd]:[font:inherit] [&_kbd]:font-medium [@media(max-width:_680px)]:text-[0.625rem] [@media(max-width:_680px)]:p-[8px_10px] [&>span:last-child]:whitespace-nowrap [@media(max-width:_680px)]:[&>span:first-child]:max-w-[190px]'
        id={helpId}
      >
        <span>
          {language === 'ja' ? '/ でブロック・@ で参照・⌘ B で太字' : '/ for blocks · @ for references · ⌘ B to format'}
        </span>
        <span>
          {editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0} {language === 'ja' ? '語' : 'words'}
        </span>
      </div>
      {editor && slash && !readOnly && (
        <SlashMenu
          editor={editor}
          suggestion={slash}
          onClose={() => setSlash(null)}
        />
      )}
      {editor && !readOnly && (
        <Popover.Root
          open={!!selectionRect && !slash}
          onOpenChange={(open) => !open && setSelectionRect(null)}
        >
          <Popover.Portal>
            <Popover.Positioner
              className='[outline:0] z-2147483140'
              anchor={selectionRect}
              side='top'
              sideOffset={8}
              collisionPadding={12}
            >
              <Popover.Popup
                className='[border:1px_solid_var(--ui-border)] rounded-[9px] [box-shadow:var(--ui-shadow)] [outline:0] [transform-origin:var(--transform-origin)] [transition:opacity_120ms,_transform_120ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] box-border [font:inherit] text-inherit [&_input]:box-border [&_input]:[font:inherit] [&_input]:text-inherit [&_button]:box-border [&_button]:[font:inherit] [&_button]:text-inherit [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] [background:var(--ui-raised)] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(-3px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(-3px)] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px] p-[3px]'
                initialFocus={false}
                finalFocus={false}
              >
                <Popover.Title className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
                  {t('Selected text')}
                </Popover.Title>
                <Popover.Description className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
                  {t('Format the selected text.')}
                </Popover.Description>
                <FormattingToolbar editor={editor} compact />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  )
}
