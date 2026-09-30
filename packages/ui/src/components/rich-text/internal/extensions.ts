import type { SuggestionProps } from '@tiptap/suggestion'
import { TableKit } from '@tiptap/extension-table'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import Suggestion from '@tiptap/suggestion'

export function createExtensions(
  { onSlash, language }: { onSlash: (props: SuggestionProps | null) => void; language: string },
) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      },
    }),
    TableKit.configure({ table: { resizable: false } }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight,
    TextStyle,
    Color,
    Placeholder.configure({
      placeholder: ({ node }) =>
        node.type.name === 'heading'
          ? (language === 'ja' ? '見出し' : 'Heading')
          : (language === 'ja'
            ? 'メモを入力。/ でブロック、@ で参照…'
            : 'Write notes. / for blocks, @ for references…'),
    }),
    Extension.create({
      name: 'slashCommands',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '/',
            startOfLine: true,
            allowSpaces: false,
            items: () => [],
            render: () => ({
              onStart: onSlash,
              onUpdate: onSlash,
              onExit: () => onSlash(null),
            }),
          }),
        ]
      },
    }),
  ]
}
