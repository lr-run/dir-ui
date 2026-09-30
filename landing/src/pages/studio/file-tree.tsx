import { FolderIcon } from 'lucide-react'
import type { ReactNode } from 'react'

function Folder({ name, children }: { name: string; children: ReactNode }) {
  return (
    <details
      className="[&>summary]:flex [&>summary]:items-center [&>summary]:gap-[7px] [&>summary]:h-[30px] [&>summary]:p-[0_5px] [&>summary]:cursor-pointer [&>summary]:list-none [&>summary]:text-[12px] [&>summary]:text-foreground [&>summary]:rounded-[4px] [&>summary:hover]:[background:color-mix(in_srgb,_var(--ui-text)_5%,_transparent)] [&>summary:focus-visible]:[outline:1px_solid_var(--ui-ring)] [&>summary::-webkit-details-marker]:hidden [&[open]>summary>[class~='group/code-tree-chevron']]:[transform:rotate(90deg)]"
      open
    >
      <summary>
        <span className='group/code-tree-chevron w-[10px] text-center text-[16px]' aria-hidden='true'>›</span>
        <FolderIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        {name}
      </summary>
      <div className='ml-[10px] pl-[7px] [border-left:1px_solid_var(--ui-border)]'>{children}</div>
    </details>
  )
}
export function FileTree({ files, selected, onSelect }: {
  files: readonly string[]
  selected: string
  onSelect: (file: string) => void
}) {
  return (
    <nav
      className="min-h-0 overflow-auto p-[18px_8px] [border-right:1px_solid_var(--ui-border)] [background:var(--ui-hover)] [&_h2]:text-[10px] [&_h2]:tracking-[.1em] [&_h2]:uppercase [&_h2]:text-muted-foreground [&_h2]:m-[0_12px_20px] [&_h2]:font-medium [&_button]:flex [&_button]:items-center [&_button]:w-full [&_button]:gap-[9px] [&_button]:[border:0] [&_button]:rounded-[4px] [&_button]:p-[7px_12px] [&_button]:[background:transparent] [&_button]:text-[12px] [&_button]:text-muted-foreground [&_button]:text-left [&_button]:cursor-pointer [&_button]:whitespace-nowrap [@media(max-width:_700px)]:flex-row [@media(max-width:_700px)]:p-[5px_8px] [@media(max-width:_700px)]:[border-right:0] [@media(max-width:_700px)]:[border-bottom:1px_solid_var(--ui-border)] [@media(max-width:_700px)]:[&_h2]:hidden [@media(max-width:_700px)]:[&_button]:shrink-0 [@media(max-width:_700px)]:block [@media(max-width:_700px)]:max-h-[180px] [@media(max-width:_700px)]:overflow-auto [@media(max-width:_700px)]:[&_button]:w-full [&_button:hover]:[background:color-mix(in_srgb,_var(--ui-text)_5%,_transparent)] [&_button[aria-current='page']]:text-foreground [&_button[aria-current='page']]:[background:color-mix(in_srgb,_#4776e6_12%,_transparent)] [&_button:focus-visible]:[outline:1px_solid_var(--ui-ring)] [&_button:focus-visible]:outline-offset-[-1px]"
      aria-label='Source files'
    >
      <h2>Explorer</h2>
      <TreeEntries files={files} selected={selected} onSelect={onSelect} />
    </nav>
  )
}

function TreeEntries({ files, selected, onSelect, prefix = '' }: {
  files: readonly string[]
  selected: string
  onSelect: (file: string) => void
  prefix?: string
}) {
  const folders = [
    ...new Set(
      files.map((file) => file.slice(prefix.length)).filter((file) => file.includes('/')).map((file) =>
        file.split('/')[0]!
      ),
    ),
  ].sort()
  const leaves = files.filter((file) => !file.slice(prefix.length).includes('/'))
  return (
    <>
      {folders.map((folder) => {
        const path = `${prefix}${folder}/`
        return (
          <Folder key={path} name={folder}>
            <TreeEntries
              files={files.filter((file) => file.startsWith(path))}
              prefix={path}
              selected={selected}
              onSelect={onSelect}
            />
          </Folder>
        )
      })}
      <ul className='list-none m-0 p-0'>
        {leaves.map((file) => (
          <li key={file}>
            <button
              type='button'
              title={file}
              aria-current={selected === file ? 'page' : undefined}
              onClick={() => onSelect(file)}
            >
              <span className='font-mono text-blue-600 dark:text-blue-300 text-[10px]' aria-hidden='true'>TS</span>
              <span className='overflow-hidden text-ellipsis'>{file.slice(prefix.length)}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
