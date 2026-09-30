import { lazy, Suspense } from 'react'
export interface Note {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: Note[]
}

const Editor = lazy(() => import('../rich-text/internal/RichTextEditor.tsx'))
export type RichTextValue = { notesDoc: Note; notes: string }
export type RichTextProps = {
  initialContent?: Note
  initialText?: string
  onUpdate?: (value: RichTextValue) => void
  disabled?: boolean
  /** @deprecated Use disabled. */
  readOnly?: boolean
  label: string
  className?: string
  references?: { kind: string; id: string; title: string }[]
}

/** Uncontrolled document input. Remount with a document/revision key to load a new value. */
export function RichText(props: RichTextProps) {
  return (
    <Suspense fallback={null}>
      <Editor
        {...props}
        readOnly={props.disabled || props.readOnly}
        initialContent={props.initialContent}
        onUpdate={props.onUpdate}
      />
    </Suspense>
  )
}
