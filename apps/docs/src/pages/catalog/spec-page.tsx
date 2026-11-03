import { Button } from '@dir/ui/components/ui/button.tsx'
import { groupBySpec } from '../../navigation.ts'
import { landingHref } from '../../routes.ts'
import type { Spec } from './playground/model.ts'
import { ApiReference, Usage } from './api-reference.tsx'
import { InstallCommand, MarkdownLink } from './install-command.tsx'
import { Playground } from './playground/index.tsx'

/** Component detail: playground, installation, usage and API reference. Linked from the group pages. */
export function SpecPage({ spec, onNavigate }: { spec: Spec; onNavigate: (id: string) => void }) {
  const group = groupBySpec.get(spec.id)
  return (
    <>
      <header className='mb-8 [&_h1]:mt-3 [&_h1]:mb-3 [&_h1]:text-[32px] [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:tracking-tight [&_p]:m-0 [&_p]:max-w-[680px] [&_p]:text-[15px] [&_p]:leading-7 [&_p]:text-muted-foreground max-[700px]:[&_h1]:text-[28px]'>
        <div>
          {group && (
            <a
              className='text-xs font-medium text-muted-foreground no-underline hover:text-foreground'
              href={landingHref(group.members[0])}
              onClick={(event) => {
                if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                onNavigate(group.members[0])
              }}
            >
              ← {group.title}
            </a>
          )}
          <div className='flex items-center justify-between gap-4'>
            <h1>{spec.title}</h1>
            <MarkdownLink markdown={landingHref(spec.id) + '.md'} />
          </div>
          <p>{spec.description}</p>
        </div>
      </header>
      <Playground key={spec.id} spec={spec} />
      <section id='installation' className='mt-12 scroll-mt-[calc(var(--docs-header-height)+24px)]'>
        <h2 className='mb-5 text-xl font-semibold tracking-tight'>Installation</h2>
        <InstallCommand item={spec.id} />
      </section>
      <Usage id={spec.id} />
      <ApiReference id={spec.id} />
      <footer className='flex justify-between gap-[16px] p-[24px_0_30px] [border-top:1px_solid_var(--ui-border)] text-[11px] text-muted-foreground [@media(max-width:700px)]:flex-col [@media(max-width:700px)]:gap-[6px]'>
        <span>dir/ui</span>
        <span>Base UI · React Hook Form · Recharts</span>
      </footer>
    </>
  )
}
export function NotFound({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className='m-[44px_0] pt-[24px] [border-top:1px_solid_var(--ui-border)] [&_h1]:mb-4 [&_h1]:text-[24px] [&_h1]:font-semibold'>
      <h1>Page not found</h1>
      <Button onClick={() => onNavigate('button')}>Back to components</Button>
    </div>
  )
}
