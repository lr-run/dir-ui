import { createElement, type CSSProperties, type ReactNode } from 'react'
import type { Note } from '@/components/ui/rich-text.tsx'
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
