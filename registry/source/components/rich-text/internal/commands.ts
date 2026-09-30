import type { ChainedCommands, Editor } from '@tiptap/core'
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
} from 'lucide-react'
// Editor commands have no dependency on the CRM or its persistence layer.
export const blockCommands = [
  {
    id: 'table',
    label: 'Table',
    hint: 'A simple table',
    Icon: TableIcon,
    run: (c: ChainedCommands) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
  },
  {
    id: 'paragraph',
    label: 'Text',
    hint: 'Plain paragraph',
    Icon: PilcrowIcon,
    run: (c: ChainedCommands) => c.setParagraph(),
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    hint: 'Large section heading',
    Icon: Heading1Icon,
    run: (c: ChainedCommands) => c.toggleHeading({ level: 1 }),
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    hint: 'Medium section heading',
    Icon: Heading2Icon,
    run: (c: ChainedCommands) => c.toggleHeading({ level: 2 }),
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    hint: 'Small section heading',
    Icon: Heading3Icon,
    run: (c: ChainedCommands) => c.toggleHeading({ level: 3 }),
  },
  {
    id: 'bulletList',
    label: 'Bullet list',
    hint: 'A simple list',
    Icon: ListIcon,
    run: (c: ChainedCommands) => c.toggleBulletList(),
  },
  {
    id: 'orderedList',
    label: 'Numbered list',
    hint: 'A list with an order',
    Icon: ListOrderedIcon,
    run: (c: ChainedCommands) => c.toggleOrderedList(),
  },
  {
    id: 'taskList',
    label: 'To-do list',
    hint: 'Track a set of tasks',
    Icon: ListTodoIcon,
    run: (c: ChainedCommands) => c.toggleTaskList(),
  },
  {
    id: 'blockquote',
    label: 'Quote',
    hint: 'Capture something worth noting',
    Icon: QuoteIcon,
    run: (c: ChainedCommands) => c.toggleBlockquote(),
  },
  {
    id: 'codeBlock',
    label: 'Code block',
    hint: 'A block of plain code',
    Icon: CodeIcon,
    run: (c: ChainedCommands) => c.toggleCodeBlock(),
  },
  {
    id: 'horizontalRule',
    label: 'Divider',
    hint: 'Separate sections',
    Icon: MinusIcon,
    run: (c: ChainedCommands) => c.setHorizontalRule(),
  },
]
export function currentBlock(editor: Editor | null) {
  for (const level of [1, 2, 3]) {
    if (editor?.isActive('heading', { level })) return 'Heading ' + level
  }
  return (
    blockCommands.find((c) => c.id !== 'paragraph' && editor?.isActive(c.id))
      ?.label || 'Text'
  )
}
export const marks = [
  { id: 'bold', label: 'Bold', Icon: BoldIcon, run: (c: ChainedCommands) => c.toggleBold() },
  { id: 'italic', label: 'Italic', Icon: ItalicIcon, run: (c: ChainedCommands) => c.toggleItalic() },
  {
    id: 'underline',
    label: 'Underline',
    Icon: UnderlineIcon,
    run: (c: ChainedCommands) => c.toggleUnderline(),
  },
  {
    id: 'strike',
    label: 'Strikethrough',
    Icon: StrikethroughIcon,
    run: (c: ChainedCommands) => c.toggleStrike(),
  },
  { id: 'code', label: 'Inline code', Icon: CodeIcon, run: (c: ChainedCommands) => c.toggleCode() },
  {
    id: 'highlight',
    label: 'Highlight',
    Icon: HighlighterIcon,
    run: (c: ChainedCommands) => c.toggleHighlight(),
  },
]
export function plainDocument(value = '') {
  return {
    type: 'doc',
    content: String(value)
      .split('\n')
      .map((text) => ({
        type: 'paragraph',
        ...(text ? { content: [{ type: 'text', text }] } : {}),
      })),
  }
}
