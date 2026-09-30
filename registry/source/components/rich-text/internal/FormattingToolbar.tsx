import { Redo2Icon, Undo2Icon } from 'lucide-react'
import { useEditorText } from '@/components/rich-text/internal/locale.ts'
import type { CSSProperties, Ref } from 'react'
import type { ChainedCommands, Editor } from '@tiptap/core'
import { Toolbar } from '@base-ui/react/toolbar'
import { Menu } from '@base-ui/react/menu'
import { Hint } from '@/components/ui/tooltip.tsx'
import { marks } from '@/components/rich-text/internal/commands.ts'
import { BlockMenu } from '@/components/rich-text/internal/BlockMenu.tsx'
import LinkPopover from '@/components/rich-text/internal/LinkPopover.tsx'

export default function FormattingToolbar({
  editor,
  disabled = false,
  compact = false,
  toolbarRef,
}: { editor: Editor | null; disabled?: boolean; compact?: boolean; toolbarRef?: Ref<HTMLDivElement> }) {
  const t = useEditorText()
  const run = (fn: (chain: ChainedCommands) => ChainedCommands) => editor && fn(editor.chain().focus()).run()
  return (
    <Toolbar.Root
      ref={toolbarRef}
      className={"group/rich-toolbar [&_button]:box-border [&_button]:[font:inherit] [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] flex items-center flex-wrap gap-[2px] p-[7px] [border-bottom:1px_solid_var(--ui-border)] [background:var(--ui-subtle)] rounded-[9px_9px_0_0] [&_button]:relative [&_button]:inline-flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[5px] [&_button]:min-w-[27px] [&_button]:h-[28px] [&_button]:p-[0_5px] [&_button]:rounded-[4px] [&_button]:text-[13px] [&_button]:text-muted-foreground [&_button_svg]:w-[14px] [&_button_svg]:h-[14px] [@media(max-width:_680px)]:gap-[1px] [@media(max-width:_680px)]:p-[5px] [@media(max-width:_680px)]:[&_button]:min-w-[27px] [@media(pointer:_coarse)]:[&_button]:min-w-[40px] [@media(pointer:_coarse)]:[&_button]:h-[40px] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px] [&_button:hover]:[background:var(--ui-hover)] [&_button:hover]:text-foreground [&_button[data-popup-open]]:[background:var(--ui-hover)] [&_button[data-popup-open]]:text-foreground [&_button[aria-pressed=\"true\"]]:[background:var(--ui-violet-bg)] [&_button[aria-pressed=\"true\"]]:text-[var(--ui-violet)] [&_button:disabled]:opacity-32 [&_button[data-disabled]]:opacity-32 [&_[class~='group/block-type-trigger']]:w-auto [&_[class~='group/block-type-trigger']]:min-w-[58px] [&_[class~='group/block-type-trigger']]:text-[12px] [&_[class~='group/block-type-trigger']]:justify-between [&_[class~='group/block-type-trigger']]:[padding-inline:7px] " +
        (compact ? '[border:0] p-0 rounded-[5px] [background:none] flex-nowrap' : '')}
      aria-label={t(compact ? 'Selected text formatting' : 'Notes formatting')}
    >
      {!compact && (
        <>
          <BlockMenu editor={editor} disabled={disabled} />
          <Toolbar.Separator className='w-[1px] h-[17px] [border:0] [background:var(--ui-border)] m-[0_4px] shrink-0' />
        </>
      )}
      {marks
        .filter((_, i) => !compact || i < 3 || i === 5)
        .map((mark) => (
          <Hint key={mark.id} label={t(mark.label)}>
            <Toolbar.Button
              className={'mark-' + mark.id}
              aria-label={t(mark.label)}
              aria-pressed={!!editor?.isActive(mark.id)}
              disabled={disabled || !editor}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(mark.run)}
            >
              <mark.Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </Toolbar.Button>
          </Hint>
        ))}
      <LinkPopover editor={editor} disabled={disabled || !editor} />
      {!compact && (
        <>
          <Menu.Root>
            <Menu.Trigger
              disabled={disabled || !editor}
              render={
                <Toolbar.Button
                  aria-label={t('Text color')}
                  disabled={disabled || !editor}
                />
              }
            >
              A<span className='absolute bottom-[4px] w-[10px] h-[2px] [background:var(--ui-violet)]' />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                className='[outline:0] z-2147483140'
                sideOffset={7}
                collisionPadding={8}
              >
                <Menu.Popup
                  className='[border:1px_solid_var(--ui-border)] rounded-[9px] [box-shadow:var(--ui-shadow)] p-[5px] [outline:0] [transform-origin:var(--transform-origin)] [transition:opacity_120ms,_transform_120ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] box-border [font:inherit] text-inherit [&_input]:box-border [&_input]:[font:inherit] [&_input]:text-inherit [&_button]:box-border [&_button]:[font:inherit] [&_button]:text-inherit [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] [background:var(--ui-raised)] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(-3px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(-3px)] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px]'
                  finalFocus={() => editor?.view.dom}
                >
                  {([
                    ['Default', null],
                    ['Violet', 'var(--ui-violet)'],
                    ['Green', 'var(--ui-green)'],
                    ['Blue', 'var(--ui-blue)'],
                    ['Amber', 'var(--ui-amber)'],
                    ['Red', 'var(--ui-red)'],
                  ] as const).map(([label, color]) => (
                    <Menu.Item
                      key={t(label)}
                      className='flex items-center gap-[8px] p-[8px] rounded-[5px] [outline:0] cursor-default min-h-[32px] [&_svg]:w-[14px] [&_svg]:h-[14px] [&_svg]:text-muted-foreground [@media(pointer:_coarse)]:min-h-[44px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-highlighted]]:text-foreground [&[data-disabled]]:opacity-35'
                      onClick={() => run((c) => (color ? c.setColor(color) : c.unsetColor()))}
                    >
                      <span
                        className='w-[10px] h-[10px] rounded-[50%] bg-(--choice-color)'
                        style={{ '--choice-color': color || 'var(--ui-text)' } as CSSProperties}
                      />
                      {t(label)}
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
          <Toolbar.Separator className='w-[1px] h-[17px] [border:0] [background:var(--ui-border)] m-[0_4px] shrink-0' />
          {([
            ['Undo', Undo2Icon, 'undo'],
            ['Redo', Redo2Icon, 'redo'],
          ] as const).map(([label, Icon, command]) => (
            <Hint key={command} label={t(label)}>
              <Toolbar.Button
                aria-label={t(label)}
                disabled={disabled || !editor || !editor.can()[command]()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run((c) => c[command]())}
              >
                <Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
              </Toolbar.Button>
            </Hint>
          ))}
        </>
      )}
    </Toolbar.Root>
  )
}
