import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'
import { ErrorState } from '@dir/ui/components/ui/error-state.tsx'
import { LoadingState } from '@dir/ui/components/ui/loading-state.tsx'
import { landingBaseUrl } from '../routes.ts'
import { MarkdownLink } from './catalog/install-command.tsx'

/** Renders one Markdown file from the skill bundle; the same file is served to agents as plain text. */
export function MarkdownPage({ path, title }: { path: string; title: string }) {
  const [state, setState] = useState<{ text?: string; error?: string }>({}), [revision, retry] = useState(0)
  const url = new URL(path, landingBaseUrl()).href
  useEffect(() => {
    const controller = new AbortController()
    setState({})
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Document not found (${response.status})`)
        setState({ text: await response.text() })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : 'Failed to load.' })
      })
    return () => controller.abort()
  }, [url, revision])
  return (
    <article className='flex flex-col gap-6 pb-16'>
      <header className='flex items-start justify-between gap-4'>
        <h1 className='m-0 text-[28px] leading-tight font-semibold tracking-tight max-[700px]:text-[24px]'>{title}</h1>
        <MarkdownLink markdown={url} />
      </header>
      {state.error
        ? <ErrorState message={state.error} retry={() => retry((n) => n + 1)} />
        : state.text === undefined
        ? <LoadingState label='Loading document' />
        : (
          <div className='markdown max-w-[760px] text-[14px] leading-[1.7] [&_h1]:hidden [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-6 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[14px] [&_h3]:font-semibold [&_p]:my-2.5 [&_li]:my-1 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:pl-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12.5px] [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_th]:border-b [&_th]:border-border [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:border-b [&_td]:border-border [&_td]:px-2.5 [&_td]:py-2 [&_td]:align-top [&_a]:underline [&_a]:underline-offset-4 [&_hr]:my-6 [&_hr]:border-border [&_strong]:font-semibold'>
            <Markdown remarkPlugins={[remarkGfm]}>{state.text}</Markdown>
          </div>
        )}
    </article>
  )
}
