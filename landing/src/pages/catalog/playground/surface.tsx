import { type ReactNode, useState } from 'react'
import { Button } from '../../../../../components/ui/index.tsx'
export function Surface({ code, children }: { code: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false), [error, setError] = useState('')
  return (
    <div className='contents'>
      <section
        aria-label='Component preview'
        className="[grid-area:preview] grid [align-content:center] gap-[18px] rounded-t-xl border border-border bg-background min-h-[300px] px-8 py-12 min-w-0 overflow-auto [@media(max-width:_700px)]:p-[18px] [&_[data-slot='input']]:max-w-full [&_[class~='group/component-header']]:w-full"
      >
        <div className="grid grid-cols-[minmax(0,_1fr)] gap-[18px] w-full max-w-[320px] min-w-0 [justify-self:center] [overflow-wrap:anywhere] [&>*]:min-w-0 [&>*]:max-w-full [[data-preview-size='natural']_&]:w-[fit-content] [[data-preview-size='natural']_&]:max-w-full [[data-preview-size='natural']_&]:[justify-items:start] [[data-preview-size='panel']_&]:max-w-[480px] [[data-preview-size='wide']_&]:max-w-[640px] [[data-preview-size='full']_&]:max-w-[none]">
          {children}
        </div>
      </section>
      <details
        id='code'
        className='group/code scroll-mt-[calc(var(--docs-header-height)+24px)] [grid-area:code] min-w-0 rounded-b-xl border border-t-0 border-border bg-muted/30 open:[&_summary]:border-b'
      >
        <summary className='flex h-10 cursor-pointer list-none items-center justify-center gap-2 border-border text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden'>
          <span aria-hidden='true' className='font-mono'>&lt;/&gt;</span>
          <span className='group-open/code:hidden'>View code</span>
          <span className='hidden group-open/code:inline'>Hide code</span>
        </summary>
        <section aria-label='Example code' className='relative min-w-0'>
          <div className='flex items-center justify-between px-5 pt-3 text-xs text-muted-foreground'>
            <span className='font-mono'>example.tsx</span>
            <Button
              size='sm'
              variant='ghost'
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code)
                  setCopied(true)
                  setError('')
                } catch {
                  setError('Select the code to copy it manually.')
                }
              }}
              onBlur={() => setCopied(false)}
            >
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          </div>
          {error && <p role='status' className='px-5 text-xs'>{error}</p>}
          <pre className='m-0 max-h-[460px] overflow-auto p-5 text-xs leading-7'><code>{code}</code></pre>
        </section>
      </details>
    </div>
  )
}
