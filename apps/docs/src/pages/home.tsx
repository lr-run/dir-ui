import { ArrowRightIcon } from 'lucide-react'
import { type MouseEvent, useState } from 'react'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { landingHref } from '../routes.ts'

const teammates = [
  {
    id: 'alex',
    name: 'Alex Morgan',
    email: 'alex@acme.example',
    initials: 'AM',
    role: 'Owner',
    color: 'bg-[#e7eee9] text-[#365544] dark:bg-[#293c31] dark:text-[#bbd7c5]',
  },
  {
    id: 'jordan',
    name: 'Jordan Lee',
    email: 'jordan@acme.example',
    initials: 'JL',
    role: 'Editor',
    color: 'bg-[#eee9e2] text-[#775f3e] dark:bg-[#3d3428] dark:text-[#ddccb1]',
  },
  {
    id: 'sam',
    name: 'Sam Taylor',
    email: 'sam@acme.example',
    initials: 'ST',
    role: 'Viewer',
    color: 'bg-[#e8e9f0] text-[#515a7d] dark:bg-[#2c3045] dark:text-[#c2c8e4]',
  },
]

export function Home({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [roles, setRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(teammates.map((person) => [person.id, person.role]))
  )
  const people = teammates.filter((person) =>
    `${person.name} ${person.email}`.toLowerCase().includes(search.trim().toLowerCase())
  )
  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate(id)
  }
  return (
    <main className='relative isolate flex min-h-[calc(100dvh-56px)] items-center overflow-clip'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-px bg-border/60 max-[1000px]:hidden'
      />
      <section
        aria-labelledby='home-title'
        className='mx-auto grid w-full max-w-[1320px] grid-cols-2 items-center gap-16 px-10 py-20 max-[1100px]:gap-10 max-[1000px]:grid-cols-1 max-[1000px]:gap-14 max-[1000px]:py-14 max-[600px]:gap-10 max-[600px]:px-6 max-[600px]:py-10'
      >
        <div className='max-w-[620px]'>
          <p className='mb-7 flex items-center gap-2.5 font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase'>
            <span className='size-1.5 rounded-full bg-[#6a9277] dark:bg-[#96bd9f]' aria-hidden='true' />
            The internal toolkit
          </p>
          <h1
            id='home-title'
            className='m-0 text-[clamp(44px,5.1vw,72px)] leading-[1.06] font-medium tracking-[-0.06em]'
          >
            Internal tools.<br />
            <span className='text-muted-foreground'>Built beautifully.</span>
          </h1>
          <p className='mt-7 mb-0 max-w-[410px] text-[16px] leading-7 text-muted-foreground max-[600px]:text-[15px]'>
            Components for the software your team uses every day. Tables, forms, search, and everything in between.
          </p>
          <div className='mt-9 flex flex-wrap items-center gap-3'>
            <a
              href={landingHref('button')}
              onClick={(event) => navigate(event, 'button')}
              className='inline-flex h-11 items-center justify-center gap-5 rounded-lg max-[600px]:px-4 bg-foreground px-5 text-[13px] font-medium text-background no-underline transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
            >
              Explore components
              <ArrowRightIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </a>
            <a
              href={landingHref('studio')}
              onClick={(event) => navigate(event, 'studio')}
              className='inline-flex h-11 items-center justify-center rounded-lg max-[600px]:px-4 border border-border px-5 text-[13px] font-medium text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
            >
              Explore CRM Example
            </a>
          </div>
          <p className='mt-9 mb-0 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground'>
            <span>React</span>
            <span aria-hidden='true' className='text-border'>/</span>
            <span>Base UI</span>
            <span aria-hidden='true' className='text-border'>/</span>
            <span>Tailwind CSS</span>
          </p>
        </div>
        <div className='relative mx-auto w-full max-w-[540px] min-w-0'>
          <div
            aria-hidden='true'
            className='absolute -inset-6 -z-10 rounded-[28px] border border-dashed border-border max-[600px]:-inset-3'
          />
          <div className='overflow-hidden rounded-2xl border border-border bg-background shadow-[0_12px_50px_-22px_var(--ui-shadow-color)]'>
            <div className='flex h-12 items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 text-[11px] text-muted-foreground'>
              <span className='flex items-center gap-2'>
                <span className='grid size-5 place-items-center rounded bg-foreground text-[10px] font-medium text-background'>
                  A
                </span>{' '}
                Acme workspace <span aria-hidden='true' className='mx-1 text-border'>/</span> People
              </span>
              <span className='font-mono text-[9px] tracking-wider uppercase'>Preview</span>
            </div>
            <div className='px-6 pt-6 pb-5 max-[600px]:px-4'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='m-0 text-[18px] font-medium tracking-tight'>People & permissions</h2>
                <span className='rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground'>3 members</span>
              </div>
              <p className='mt-1.5 mb-5 text-xs text-muted-foreground'>The right access for everyone on your team.</p>
              <Input
                type='search'
                aria-label='Search team members'
                placeholder='Find a teammate…'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className='min-h-[234px]'>
              <table className='w-full border-collapse text-left text-xs'>
                <caption className='sr-only'>Interactive team permissions example</caption>
                <thead className='border-y border-border bg-muted/30 text-[10px] text-muted-foreground'>
                  <tr>
                    <th className='px-6 py-2.5 font-normal max-[600px]:px-4'>Member</th>
                    <th className='w-[134px] pr-6 py-2.5 font-normal max-[600px]:w-[112px] max-[600px]:pr-4'>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.id} className='border-b border-border last:border-b-0'>
                      <td className='px-6 py-4 max-[600px]:px-4'>
                        <div className='flex items-center gap-3'>
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-medium ${person.color}`}
                            aria-hidden='true'
                          >
                            {person.initials}
                          </span>
                          <div>
                            <div className='font-medium'>{person.name}</div>
                            <div className='mt-1 text-[10px] text-muted-foreground max-[370px]:hidden'>
                              {person.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='pr-6 max-[600px]:pr-4'>
                        <Select
                          label={`${person.name} role`}
                          value={roles[person.id]!}
                          onChange={(role) => setRoles((previous) => ({ ...previous, [person.id]: role }))}
                          items={['Owner', 'Editor', 'Viewer'].map((role) => ({ value: role, label: role }))}
                        />
                      </td>
                    </tr>
                  ))}
                  {!people.length && (
                    <tr>
                      <td colSpan={2} className='h-[198px] px-6 text-center text-muted-foreground'>
                        No teammates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='flex items-center justify-between gap-3 border-t border-border px-6 py-3 text-[10px] text-muted-foreground max-[600px]:px-4'>
              <span role='status'>{people.length} of 3 members</span>
              <span className='flex items-center gap-1.5'>
                <span className='size-1 rounded-full bg-[#6a9277]' aria-hidden='true' />Your team, connected
              </span>
            </div>
          </div>
          <p className='mt-5 mb-0 text-center font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase'>
            Small components. A complete workspace.
          </p>
        </div>
      </section>
    </main>
  )
}
