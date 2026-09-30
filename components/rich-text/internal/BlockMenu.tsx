import type { Editor, Range } from '@tiptap/core'
import type { SuggestionProps } from '@tiptap/suggestion'
import { ChevronDownIcon, SearchIcon } from 'lucide-react'
import { useEditorText } from './locale.ts'
import { useRef, useState } from 'react'
import { Menu } from '@base-ui/react/menu'
import { Input } from '@base-ui/react/input'
import { Toolbar } from '@base-ui/react/toolbar'
import { exitSuggestion } from '@tiptap/suggestion'
import { blockCommands, currentBlock } from './commands.ts'

function Items(
  { editor, query = '', range, onPick }: { editor: Editor | null; query?: string; range?: Range; onPick?: () => void },
) {
  const t = useEditorText()
  const items = blockCommands.filter((c) =>
    (t(c.label) + ' ' + t(c.hint) + ' ' + c.label).toLowerCase().includes(query.toLowerCase())
  )
  return (
    <>
      {items.map((c) => (
        <Menu.Item
          className='flex gap-[10px] items-center rounded-[6px] p-[7px] [outline:0] cursor-default [&_strong]:block [&_strong]:text-[0.75rem] [&_strong]:font-medium [&_strong]:leading-[18px] [&_small]:block [&_small]:text-[0.625rem] [&_small]:text-muted-foreground [&_small]:leading-[16px] [@media(pointer:_coarse)]:min-h-[44px] [&[data-highlighted]]:[background:var(--ui-hover)]'
          key={c.id}
          onClick={() => {
            if (!editor) return
            let chain = editor.chain().focus()
            if (range) chain = chain.deleteRange(range)
            c.run(chain).run()
            onPick?.()
          }}
        >
          <span className='w-[33px] h-[33px] [border:1px_solid_var(--ui-border)] rounded-[6px] grid [place-items:center] [background:var(--ui-surface)] text-[15px] font-medium shrink-0'>
            <c.Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </span>
          <span>
            <strong>{t(c.label)}</strong>
            <small>{t(c.hint)}</small>
          </span>
        </Menu.Item>
      ))}
      {!items.length && <p className='text-[0.75rem] text-muted-foreground p-[10px]'>{t('No matching blocks')}</p>}
    </>
  )
}
export function BlockMenu({ editor, disabled }: { editor: Editor | null; disabled?: boolean }) {
  const t = useEditorText()
  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={disabled || !editor}
        render={
          <Toolbar.Button
            className='group/block-type-trigger'
            aria-label={t('Text block type')}
            disabled={disabled}
          />
        }
      >
        {t(currentBlock(editor))}
        <ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className='[outline:0] z-2147483140'
          sideOffset={7}
          align='start'
          collisionPadding={8}
        >
          <Menu.Popup
            className='[border:1px_solid_var(--ui-border)] rounded-[9px] [box-shadow:var(--ui-shadow)] p-[5px] [outline:0] [transform-origin:var(--transform-origin)] [transition:opacity_120ms,_transform_120ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] box-border [font:inherit] text-inherit [&_input]:box-border [&_input]:[font:inherit] [&_input]:text-inherit [&_button]:box-border [&_button]:[font:inherit] [&_button]:text-inherit [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] [background:var(--ui-raised)] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(-3px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(-3px)] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px] w-[255px] max-h-[min(450px,_var(--available-height))] overflow-auto [scrollbar-width:thin]'
            finalFocus={() => editor?.view.dom}
          >
            <div className='text-[0.625rem] tracking-[0.05em] font-medium text-muted-foreground p-[7px_8px_5px]'>
              {t('TURN INTO')}
            </div>
            <Items editor={editor} />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
export function SlashMenu(
  { editor, suggestion, onClose }: { editor: Editor; suggestion: SuggestionProps; onClose: () => void },
) {
  const t = useEditorText()
  const [query, setQuery] = useState(''),
    popup = useRef<HTMLDivElement>(null)
  const anchor = {
    getBoundingClientRect: () => suggestion.clientRect?.() || editor.view.dom.getBoundingClientRect(),
    contextElement: editor.view.dom,
  }
  function close() {
    exitSuggestion(editor.view)
    onClose()
  }
  return (
    <Menu.Root open modal={false} onOpenChange={(open) => !open && close()}>
      <Menu.Portal>
        <Menu.Positioner
          anchor={anchor}
          className='[outline:0] z-2147483140'
          sideOffset={6}
          align='start'
          collisionPadding={12}
        >
          <Menu.Popup
            className='[border:1px_solid_var(--ui-border)] rounded-[9px] [box-shadow:var(--ui-shadow)] p-[5px] [outline:0] [transform-origin:var(--transform-origin)] [transition:opacity_120ms,_transform_120ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] box-border [font:inherit] text-inherit [&_input]:box-border [&_input]:[font:inherit] [&_input]:text-inherit [&_button]:box-border [&_button]:[font:inherit] [&_button]:text-inherit [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] [background:var(--ui-raised)] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(-3px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(-3px)] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px] w-[255px] max-h-[min(450px,_var(--available-height))] overflow-auto [scrollbar-width:thin] slash-menu'
            aria-label={t('Insert a block')}
            ref={popup}
            finalFocus={() => editor.view.dom}
          >
            <div className='flex items-center gap-[7px] m-[3px_3px_6px] p-[6px_8px] [border:1px_solid_var(--ui-border)] rounded-[6px] [&_input]:[background:none] [&_input]:[border:0] [&_input]:[outline:0] [&_input]:text-[0.75rem] [&_input]:min-w-0 [&_input]:w-full [&_input]:p-0 [&_svg]:w-[14px] [&_svg]:h-[14px] [&_svg]:text-muted-foreground [&:focus-within]:[border-color:var(--ui-ring)] [&:focus-within]:[outline:none] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[border:0] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[outline:none] [&_:is(input,_textarea):is(:focus,_:focus-visible)]:[box-shadow:none]'>
              <SearchIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
              <Input
                autoFocus
                aria-label={t('Search blocks')}
                placeholder={t('Search blocks…')}
                value={query}
                onValueChange={setQuery}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    popup.current?.querySelector<HTMLDivElement>('[role=menuitem]')?.focus()
                  }
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    popup.current?.querySelector<HTMLDivElement>('[role=menuitem]')?.click()
                  }
                }}
              />
            </div>
            <div className='text-[0.625rem] tracking-[0.05em] font-medium text-muted-foreground p-[7px_8px_5px]'>
              {t('BASIC BLOCKS')}
            </div>
            <Items
              editor={editor}
              query={query}
              range={suggestion.range}
              onPick={close}
            />
            <div className='flex justify-between text-[0.625rem] text-muted-foreground p-[9px_8px_4px] [border-top:1px_solid_var(--ui-border)] mt-[5px]'>
              ↑ ↓ Navigate <span>↵ Insert</span>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
