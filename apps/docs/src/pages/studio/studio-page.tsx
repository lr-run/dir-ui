import { examplePreviewUrl } from './preview-url.ts'
import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { SourceViewer } from './source-viewer.tsx'
import { FileTree } from './file-tree.tsx'
import { sourceFiles } from './source-files.ts'
import { kitSources, systemSources } from './system-source-files.ts'

/** CRM compositions the system kit builds on: the list page, record table and detail page. */
const sharedCrm = Object.fromEntries(
  Object.entries(sourceFiles).filter(([path]) =>
    /components\/crm\/(screens|types\.ts|components\/(record-(list|table|table-model|archive-action)|table-skeleton|actions-menu))/
      .test(path)
  ),
)
const appName = (slug: string) => slug.replace(/(^|-)(\w)/g, (_, _dash, letter: string) => letter.toUpperCase()) + 'App'
export function PreviewStudio({ example, theme, color, codeView, count, viewport, revision }: {
  example: string
  theme: string
  color: string
  codeView: boolean
  count: number
  viewport: string
  revision: number
}) {
  const [file, setFile] = useState('Example.tsx')
  const [copied, setCopied] = useState(''), [copyError, setCopyError] = useState('')
  useEffect(() => setCopied(''), [count])
  const crm = example === 'crm'
  const usage = crm
    ? `import { CrmTemplate } from '@/components/crm/template.tsx'\n\nexport default function Example() {\n  return <div className="h-dvh"><CrmTemplate count={${count}} /></div>\n}\n`
    : `import { ${
      appName(example)
    } } from '@/components/systems/${example}/app.tsx'\n\nexport default function Example() {\n  return <div className="h-dvh"><${
      appName(example)
    } count={${count}} /></div>\n}\n`
  const files: Record<string, string> = crm
    ? { 'Example.tsx': usage, ...sourceFiles }
    : example === 'task-board'
    ? { 'Example.tsx': usage, ...systemSources[example] }
    : { 'Example.tsx': usage, ...systemSources[example], ...kitSources, ...sharedCrm }
  const source = files[file] ?? usage
  const previewUrl = useMemo(() => examplePreviewUrl(example, count, theme, color), [count, theme, color, example])
  const copy = async (all: boolean) => {
    try {
      await navigator.clipboard.writeText(
        all ? Object.entries(files).map(([path, content]) => `// FILE: ${path}\n${content}`).join('\n\n') : source,
      )
      setCopied(all ? 'all' : 'file')
      setCopyError('')
    } catch {
      setCopyError('Select the source code to copy it manually.')
    }
  }
  return (
    <div
      className="flex flex-1 flex-col min-h-0 [@media(max-width:_700px)]:[&[data-panel='code']]:flex-none [@media(max-width:_700px)]:[&[data-panel='code']]:h-[calc(100dvh_-_var(--dir-app-shell-height,_0px)_-_var(--docs-header-height,_48px))] [@media(max-width:_700px)]:[&[data-panel='code']]:min-h-[400px]"
      data-panel={codeView ? 'code' : 'preview'}
    >
      <main
        className='grid grid-cols-[minmax(0,_1fr)] flex-1 min-h-0 text-foreground [&[hidden]]:hidden'
        aria-label='Example app playground'
        hidden={codeView}
      >
        <section className='flex flex-col min-w-0 min-h-0' aria-label='Interactive app preview'>
          <div className='flex-1 min-h-0 overflow-clip bg-background p-4 max-[600px]:p-2'>
            <div
              className='m-[0_auto] h-full min-h-0 max-w-full flex flex-col w-(--preview-width)'
              style={{ '--preview-width': viewport === 'responsive' ? '100%' : `${viewport}px` } as CSSProperties}
            >
              <iframe
                key={revision}
                className='block w-full flex-1 min-h-0 rounded-lg border border-border bg-background'
                title='Example app preview'
                src={previewUrl}
                sandbox='allow-scripts allow-same-origin allow-forms'
              />
            </div>
          </div>
        </section>
      </main>
      {codeView && (
        <section
          className='flex-1 min-h-0 min-w-0 grid grid-cols-[228px_minmax(0,_1fr)] grid-rows-[46px_minmax(0,_1fr)_28px] text-foreground [background:var(--ui-canvas)] [@media(max-width:_700px)]:grid-cols-[minmax(0,_1fr)] [@media(max-width:_700px)]:grid-rows-[46px_auto_minmax(0,_1fr)_28px]'
          aria-label='Source code editor'
        >
          <header className='[grid-column:1_/_-1] flex items-center gap-[20px] p-[0_14px] [border-bottom:1px_solid_var(--ui-border)] [@media(max-width:_700px)]:p-[0_8px] [@media(max-width:_700px)]:gap-[4px]'>
            <span className='text-xs font-medium text-muted-foreground'>Source code</span>
            <div className='flex gap-[8px] ml-auto [@media(max-width:_700px)]:gap-[4px]'>
              <Button onClick={() => copy(false)}>{copied === 'file' ? 'Copied' : 'Copy file'}</Button>
              <Button variant='default' onClick={() => copy(true)}>
                {copied === 'all' ? 'Copied all' : 'Copy all files'}
              </Button>
            </div>
          </header>
          <FileTree
            files={Object.keys(files)}
            selected={file}
            onSelect={(name) => {
              setFile(name)
              setCopied('')
              setCopyError('')
            }}
          />
          <div className='min-h-0 min-w-0 flex flex-col'>
            <div className='flex items-center h-[38px] shrink-0 [border-bottom:1px_solid_var(--ui-border)] [background:var(--ui-hover)] [&>span:first-child]:self-stretch [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:p-[0_20px] [&>span:first-child]:[background:var(--ui-canvas)] [&>span:first-child]:[border-right:1px_solid_var(--ui-border)] [&>span:first-child]:[border-top:2px_solid_#4776e6] [&>span:first-child]:text-[12px]'>
              <span>{file}</span>
              <span className='ml-auto pr-[18px] text-[10px] text-muted-foreground'>Read only</span>
            </div>
            <div className='p-[12px_20px_8px] text-[11px] text-muted-foreground [&_strong]:font-normal [&_strong]:text-foreground'>
              Source root / <strong>{file}</strong>
            </div>
            <SourceViewer key={file} source={source} />
          </div>
          <footer className='[grid-column:1_/_-1] flex items-center gap-[20px] p-[0_16px] [border-top:1px_solid_var(--ui-border)] [background:var(--ui-hover)] text-muted-foreground text-[10px] [@media(max-width:_700px)]:gap-[10px] [@media(max-width:_700px)]:p-[0_10px] [&>span:first-child]:mr-auto'>
            <span role='status'>
              {copyError || (copied ? 'Copied to clipboard' : `${Object.keys(files).length} files`)}
            </span>
            <span>{source.trimEnd().split('\n').length} lines</span>
            <span>UTF-8</span>
            <span>{file.endsWith('.css') ? 'CSS' : file.endsWith('.tsx') ? 'TypeScript React' : 'TypeScript'}</span>
          </footer>
        </section>
      )}
    </div>
  )
}
