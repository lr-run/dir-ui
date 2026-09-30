import { FileCodeIcon, TerminalIcon } from 'lucide-react'
import { useState } from 'react'
import { PopoverPanel } from '../../../../components/ui/popover-panel.tsx'
import { templates } from '../../../../examples/catalog.ts'
import { landingHref } from '../../routes.ts'
import { Button } from '../../../../components/ui/button.tsx'
import { installCommand } from '../../../../registry/catalog.ts'

export function MarkdownLink({ markdown }: { markdown: string }) {
  return (
    <a
      aria-label='Open Markdown'
      title='Open Markdown'
      className='inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground no-underline hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
      href={markdown}
    >
      <FileCodeIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
    </a>
  )
}

export function InstallCommand({ item, markdown }: { item: string; markdown?: string }) {
  const [status, setStatus] = useState('')
  const command = installCommand(item)
  return (
    <section aria-label='Installation' className='min-w-0 space-y-3'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span className='font-mono'>shadcn</span>
        {markdown && <MarkdownLink markdown={markdown} />}
      </div>
      <div className='flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/40 p-3'>
        <code className='min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs leading-6'>{command}</code>
        <Button
          size='sm'
          variant='ghost'
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command)
              setStatus('Copied')
            } catch {
              setStatus('Select the command to copy it manually.')
            }
          }}
        >
          Copy
        </Button>
      </div>
      {status && <p role='status' className='text-xs text-muted-foreground'>{status}</p>}
    </section>
  )
}

/** Keeps the template installation command out of the workspace preview. */
export function TemplateInstall() {
  return (
    <PopoverPanel
      title='Install CRM'
      align='end'
      width={560}
      trigger={
        <Button
          variant='outline'
          aria-label='Install CRM'
          title='Install CRM'
          className='gap-1.5 max-[700px]:w-7 max-[700px]:px-0'
        >
          <TerminalIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          <span className='max-[700px]:hidden'>Install</span>
        </Button>
      }
    >
      <InstallCommand item={templates[0].registryItem} markdown={landingHref('studio') + '.md'} />
    </PopoverPanel>
  )
}
