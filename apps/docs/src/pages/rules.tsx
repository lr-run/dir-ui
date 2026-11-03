import { CheckIcon, LoaderCircleIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Checkbox } from '@dir/ui/components/ui/checkbox.tsx'
import { ChoiceContent } from '@dir/ui/components/ui/choice-content.tsx'
import { MultiCombobox, SingleCombobox } from '@dir/ui/components/ui/combobox.tsx'
import { EmptyState } from '@dir/ui/components/ui/empty-state.tsx'
import { Field, FieldGroup } from '@dir/ui/components/ui/field.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { List, ListItem } from '@dir/ui/components/ui/list.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { Skeleton } from '@dir/ui/components/ui/skeleton.tsx'
import { uiRules } from '../navigation.ts'
import { landingHref } from '../routes.ts'
import { MarkdownLink } from './catalog/install-command.tsx'

const statuses = [
  { value: 'active', label: 'Active', color: 'var(--ui-green)' },
  { value: 'lead', label: 'Lead', color: 'var(--ui-blue)' },
  { value: 'overdue', label: 'Overdue', color: 'var(--ui-red)' },
]
const people = [
  'Nizam',
  'Tessaly',
  'Mika',
  'Ken',
  'Aya',
  'Ines',
  'Odile',
  'Gideon',
  'Lucille',
  'Anselm',
  'Remy',
  'Dario',
]
  .map((name) => ({ value: name.toLowerCase(), label: name }))
const clients = [
  ['Chris and Ada Okafor', statuses[0]!, 'Today'],
  ['Marisol Quenby', statuses[1]!, 'Yesterday'],
  ['Ines Calloway', statuses[2]!, 'Oct 28'],
] as const

/** A small surface that looks like part of a real screen, so each rule is seen in context. */
function Panel({ title, actions, children, className = '' }: {
  title?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`w-full max-w-[520px] overflow-hidden rounded-lg border border-border bg-(--ui-surface) ${className}`}
    >
      {title && (
        <div className='flex h-12 items-center gap-2 border-b border-border px-4'>
          <b className='mr-auto text-[14px] font-semibold'>{title}</b>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
const table =
  'w-full border-collapse text-left text-[13px] [&_td]:h-10 [&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_th]:h-9 [&_th]:px-4 [&_th]:text-[12px] [&_th]:font-normal [&_th]:text-muted-foreground'
function ClientTable({ status }: { status: (item: (typeof clients)[number][1]) => ReactNode }) {
  return (
    <table className={table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th className='text-right'>Updated</th>
        </tr>
      </thead>
      <tbody>
        {clients.map(([name, item, updated]) => (
          <tr key={name}>
            <td className='font-medium'>{name}</td>
            <td>{status(item)}</td>
            <td className='text-right text-muted-foreground'>{updated}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
/** Wireframe frames for the layout rule. */
function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className='flex flex-col items-center gap-2'>
      <span className='flex h-[84px] w-[128px] flex-col overflow-hidden rounded-md border border-border bg-(--ui-surface)'>
        {children}
      </span>
      <code className='text-[12px] text-muted-foreground'>{label}</code>
    </span>
  )
}
const top = <span className='h-4 shrink-0 border-b border-border bg-(--ui-sidebar)' />
const side = <span className='w-8 shrink-0 border-r border-border bg-(--ui-sidebar)' />
const page = <span className='m-2 flex-1 rounded-sm bg-(--ui-subtle)' />
function Phone({ children }: { children: ReactNode }) {
  return (
    <div className='flex h-[300px] w-[200px] flex-col overflow-hidden rounded-[22px] border-4 border-(--ui-text)/80 bg-(--ui-surface) p-2 text-[11px]'>
      {children}
    </div>
  )
}
/** The same card styled with tokens or with hard-coded colors, in Light and Black side by side. */
function ThemedCard({ raw }: { raw?: boolean }) {
  return (
    <div className='flex gap-3'>
      {(['light', 'black'] as const).map((theme) => (
        <div key={theme} className='flex flex-col items-center gap-2'>
          <div
            data-ui-theme={theme}
            className='flex w-[170px] flex-col gap-2 rounded-lg border border-border bg-(--ui-surface) p-3 text-(--ui-text)'
            style={raw ? { background: '#ffffff', color: '#111111', borderColor: '#e5e7eb' } : undefined}
          >
            <b className='text-[13px] font-semibold'>Clients</b>
            <span className='text-[12px] text-muted-foreground' style={raw ? { color: '#6b7280' } : undefined}>
              1,248 active
            </span>
            <span
              className='inline-flex h-7 items-center justify-center rounded-md bg-primary px-2 text-[12px] font-medium text-primary-foreground'
              style={raw ? { background: '#2563eb', color: '#ffffff' } : undefined}
            >
              New client
            </span>
          </div>
          <code className='text-[11px] text-muted-foreground'>{theme === 'light' ? 'Light' : 'Black'}</code>
        </div>
      ))}
    </div>
  )
}
function SelectDemo({ id }: { id: string }) {
  const [value, setValue] = useState('active')
  return <Select id={id} label='Status' items={statuses} value={value} onChange={setValue} />
}
function ChooseControl() {
  const [status, setStatus] = useState('active')
  const [owner, setOwner] = useState<string | null>('nizam')
  const [team, setTeam] = useState(['mika', 'ken'])
  const [archived, setArchived] = useState(false)
  const rows: [string, string, ReactNode][] = [
    [
      'One of 2–7 options',
      'Select',
      <Select key='s' label='Status' items={statuses} value={status} onChange={setStatus} />,
    ],
    [
      'One of many, or search',
      'SingleCombobox',
      <SingleCombobox key='c' label='Owner' items={people} value={owner} onValueChange={setOwner} />,
    ],
    [
      'Several values',
      'MultiCombobox',
      <MultiCombobox key='m' label='Team' items={people} value={team} onValueChange={setTeam} />,
    ],
    ['Yes or no', 'Checkbox', <Checkbox key='b' label='Archived' checked={archived} onCheckedChange={setArchived} />],
  ]
  return (
    <Panel>
      {rows.map(([when, name, control]) => (
        <div
          key={name}
          className='grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 border-t border-border px-4 py-2.5 first:border-t-0 max-[600px]:grid-cols-1 max-[600px]:gap-1.5'
        >
          <span className='text-[12px] leading-tight'>
            {when}
            <code className='block text-[11px] text-muted-foreground'>{name}</code>
          </span>
          <span className='min-w-0'>{control}</span>
        </div>
      ))}
    </Panel>
  )
}

type Example = { node: ReactNode; caption: string }
type RuleVisual = { why: string; check: string; good: Example; bad?: Example }
/** Visuals and explanations per rule, in the order of `uiRules`. */
const visuals: Record<string, RuleVisual> = {
  components: {
    why:
      'A hand-made control misses the states the library already handles: keyboard, focus, disabled, read-only, error and phone sizes. Editing the source forks you from every fix.',
    check:
      'Every input, select, dialog, sheet, table, toast and sidebar is imported from @/components; nothing under components/ui is changed.',
    good: {
      caption: 'Field, Input and Select from the library: one height, focus style and theme.',
      node: (
        <Panel className='p-4'>
          <FieldGroup>
            <Field label='Name'>{(props) => <Input {...props} defaultValue='Chris and Ada Okafor' />}</Field>
            <Field label='Status'>{(props) => <SelectDemo id={props.id} />}</Field>
          </FieldGroup>
        </Panel>
      ),
    },
    bad: {
      caption: 'Native controls: different heights, focus rings and no dark mode.',
      node: (
        <Panel className='flex flex-col gap-3 p-4 text-[13px]'>
          <label className='flex flex-col gap-1'>
            Name
            <input defaultValue='Chris and Ada Okafor' />
          </label>
          <label className='flex flex-col gap-1'>
            Status
            <select defaultValue='active'>
              <option value='active'>Active</option>
              <option value='lead'>Lead</option>
            </select>
          </label>
        </Panel>
      ),
    },
  },
  tokens: {
    why:
      'Light, Black and Paper and a company color all change the --ui-* tokens. A raw hex or a palette class stays the same in every theme and stands out in all but one.',
    check: 'Search the app for #, rgb( and palette classes such as bg-blue-500; there are none.',
    good: { caption: 'bg-primary, text-muted-foreground: the card follows the theme.', node: <ThemedCard /> },
    bad: { caption: '#ffffff and #2563eb: the card stays light inside the Black theme.', node: <ThemedCard raw /> },
  },
  'one-layout': {
    why:
      'People learn where navigation, the title and the primary action are once. A custom frame moves them and breaks the phone behavior the shells already have.',
    check: 'Each screen renders exactly one of the three shells at its root.',
    good: {
      caption: 'Pick one of the three by how much navigation the app needs.',
      node: (
        <div className='flex flex-wrap justify-center gap-4'>
          <Frame label='PageShell'>
            {top}
            {page}
          </Frame>
          <Frame label='AppShell'>
            <span className='flex flex-1'>
              {side}
              {page}
            </span>
          </Frame>
          <Frame label='SuiteShell'>
            {top}
            <span className='flex flex-1'>
              {side}
              {page}
            </span>
          </Frame>
        </div>
      ),
    },
    bad: {
      caption: 'A custom frame with sidebars on both sides and a second header.',
      node: (
        <Frame label='custom frame'>
          {top}
          {top}
          <span className='flex flex-1'>
            {side}
            {page}
            <span className='w-8 shrink-0 border-l border-border bg-(--ui-sidebar)' />
          </span>
        </Frame>
      ),
    },
  },
  'primary-action': {
    why:
      'One filled button tells people what the screen is for. Several compete, and labels like OK do not say what will happen.',
    check:
      'Count the variant="default" buttons on the screen: one, at the right end of the header, with a verb such as New client.',
    good: {
      caption: 'Secondary actions first, then one primary action with a verb.',
      node: (
        <Panel
          title='Clients'
          actions={
            <>
              <Button variant='ghost'>Export</Button>
              <Button variant='default'>
                <PlusIcon aria-hidden='true' />New client
              </Button>
            </>
          }
        />
      ),
    },
    bad: {
      caption: 'Three primary buttons, and OK does not say what it does.',
      node: (
        <Panel
          title='Clients'
          actions={
            <>
              <Button variant='default'>Export</Button>
              <Button variant='default'>Import</Button>
              <Button variant='default'>OK</Button>
            </>
          }
        />
      ),
    },
  },
  skeletons: {
    why:
      'A skeleton in the final shape shows what is coming and keeps the layout still. A spinner hides the structure and the page jumps when data lands.',
    check:
      'Throttle the network: the loading state has the same height and columns as the loaded one, and there is no spinner.',
    good: {
      caption: 'Skeleton rows with the same columns and row height as the loaded table.',
      node: (
        <Panel title='Clients'>
          <div role='status' aria-label='Loading clients'>
            {[0, 1, 2].map((row) => (
              <div key={row} className='flex h-10 items-center gap-4 border-t border-border px-4'>
                <Skeleton className='h-3 w-2/5' />
                <Skeleton className='h-3 w-1/5' />
                <Skeleton className='ml-auto h-3 w-1/6' />
              </div>
            ))}
          </div>
        </Panel>
      ),
    },
    bad: {
      caption: 'A spinner in an empty box; the page jumps when the rows arrive.',
      node: (
        <Panel title='Clients'>
          <div className='flex h-[60px] items-center justify-center'>
            <LoaderCircleIcon
              size={20}
              strokeWidth={1.5}
              className='animate-spin text-muted-foreground'
              aria-hidden='true'
            />
          </div>
        </Panel>
      ),
    },
  },
  submitting: {
    why:
      'A form that stays editable gets changed or submitted twice while the request runs. A label like Saving… says what is happening; a lone spinner does not.',
    check:
      'Submit on a slow network: every field and button is disabled, the button keeps its width and reads Saving…, and a Toast reports the result.',
    good: {
      caption: 'Every field and button disabled, the button keeps its width and reads Saving….',
      node: (
        <Panel className='p-4'>
          <FieldGroup aria-busy='true'>
            <Field label='Name'>{(props) => <Input {...props} defaultValue='Chris and Ada Okafor' disabled />}</Field>
            <div className='flex justify-end gap-2'>
              <Button disabled>Cancel</Button>
              <Button variant='default' disabled className='min-w-[96px]'>Saving…</Button>
            </div>
          </FieldGroup>
        </Panel>
      ),
    },
    bad: {
      caption: 'Still editable while it saves, and the label is replaced by a spinner.',
      node: (
        <Panel className='p-4'>
          <FieldGroup>
            <Field label='Name'>{(props) => <Input {...props} defaultValue='Chris and Ada Okafor' />}</Field>
            <div className='flex justify-end gap-2'>
              <Button>Cancel</Button>
              <Button variant='default'>
                <LoaderCircleIcon size={14} className='animate-spin' aria-hidden='true' />
              </Button>
            </div>
          </FieldGroup>
        </Panel>
      ),
    },
  },
  fields: {
    why:
      'A placeholder disappears as soon as people type, so they lose what the field was for. Field also wires the label, required mark and error for screen readers.',
    check: 'Every control is the child of a Field with a label; errors appear under the field, never only in a Toast.',
    good: {
      caption: 'Label above, an example as placeholder, the error under the field.',
      node: (
        <Panel className='p-4'>
          <Field label='Email' required error='Enter an email address, such as name@example.com'>
            {(props) => <Input {...props} type='email' placeholder='name@example.com' />}
          </Field>
        </Panel>
      ),
    },
    bad: {
      caption: 'The placeholder is the label, and the error is far from the field.',
      node: (
        <Panel className='flex flex-col gap-3 p-4'>
          <Input aria-label='Email' placeholder='Email' />
          <span className='self-end rounded-md bg-(--ui-red-bg) px-2 py-1 text-[12px] text-(--ui-red)'>
            Invalid input
          </span>
        </Panel>
      ),
    },
  },
  'choosing-controls': {
    why: 'The right control makes the number of answers visible: one of a few, one of many, several, or yes and no.',
    check:
      'Select has 2–7 options, SingleCombobox is used for more or for search, MultiCombobox for several values and Checkbox for a boolean.',
    good: { caption: 'Each control matches how many values, from how many options.', node: <ChooseControl /> },
    bad: {
      caption: 'A Select of twelve people: no search, and the list runs off the screen.',
      node: (
        <Panel className='p-3'>
          <ul className='m-0 max-h-[200px] overflow-hidden p-0 text-[13px] [&_li]:list-none'>
            {people.map((person) => (
              <li key={person.value} className='rounded px-2 py-1 hover:bg-(--ui-hover)'>{person.label}</li>
            ))}
          </ul>
        </Panel>
      ),
    },
  },
  status: {
    why:
      'People who cannot tell the colors apart, and every theme that shifts them, need the word. Status colors also mean something, so charts use their own series colors.',
    check:
      'Every status shows a label next to its dot through ChoiceContent; no chart series uses --ui-green, blue, amber or red.',
    good: {
      caption: 'ChoiceContent: a dot and the status name.',
      node: (
        <Panel>
          <ClientTable status={(item) => <ChoiceContent item={item} compact />} />
        </Panel>
      ),
    },
    bad: {
      caption: 'Dots only: the status is a guess for anyone who cannot see the colors.',
      node: (
        <Panel>
          <ClientTable
            status={(item) => (
              <span
                className='inline-block size-2.5 rounded-full'
                style={{ background: item.color }}
              />
            )}
          />
        </Panel>
      ),
    },
  },
  'empty-and-error': {
    why:
      'An empty or failed region is where people get stuck. One clear action, or a retry, gets them moving again without leaving the page.',
    check:
      'Empty lists show EmptyState with one action, failed loads show ErrorState with retry, and the code has no alert() or confirm().',
    good: {
      caption: 'EmptyState says what is missing and offers one action.',
      node: (
        <Panel title='Clients'>
          <EmptyState title='No clients yet'>
            <Button variant='default'>
              <PlusIcon aria-hidden='true' />New client
            </Button>
          </EmptyState>
        </Panel>
      ),
    },
    bad: {
      caption: 'A dead end: no explanation and nothing to do next.',
      node: (
        <Panel title='Clients'>
          <p className='m-0 py-12 text-center text-[13px] text-muted-foreground'>No data</p>
        </Panel>
      ),
    },
  },
  'destructive-actions': {
    why:
      'Deleting by accident is the most expensive mistake in an internal tool. Naming the record and what goes with it lets people stop in time.',
    check:
      'Every delete or irreversible action opens ConfirmDialog with the record’s name, the consequence and a destructive button with a verb.',
    good: {
      caption: 'The dialog names the record and what is lost; the button says Delete client.',
      node: (
        <div className='flex w-full max-w-[520px] justify-center rounded-lg bg-(--ui-overlay) p-8'>
          <div className='flex w-full max-w-[340px] flex-col gap-2 rounded-lg border border-border bg-(--ui-raised) p-4 text-[13px] shadow-lg'>
            <b className='text-[15px] font-semibold'>Delete Chris and Ada Okafor?</b>
            <span className='text-muted-foreground'>
              Their 2 loans and 14 activities are deleted too. This cannot be undone.
            </span>
            <span className='mt-2 flex justify-end gap-2'>
              <Button>Cancel</Button>
              <Button variant='destructive'>Delete client</Button>
            </span>
          </div>
        </div>
      ),
    },
    bad: {
      caption: 'The trash icon deletes at once; the toast is the first sign anything happened.',
      node: (
        <div className='flex w-full max-w-[520px] flex-col items-center gap-4'>
          <Panel>
            <div className='flex h-11 items-center gap-3 px-4 text-[13px]'>
              <span className='mr-auto font-medium'>Chris and Ada Okafor</span>
              <span className='inline-grid size-7 place-items-center rounded-md border border-border text-muted-foreground'>
                <Trash2Icon size={14} strokeWidth={1.5} aria-hidden='true' />
              </span>
            </div>
          </Panel>
          <span className='self-end rounded-md border border-border bg-(--ui-raised) px-3 py-2 text-[12px] shadow-sm'>
            Client deleted
          </span>
        </div>
      ),
    },
  },
  phones: {
    why:
      'A table needs width a phone does not have, so its columns get cut off and the page scrolls sideways. A list keeps the name, one line of detail and the status in view.',
    check:
      'At 375px every table is a List of ListItems, rows are at least 40px tall, the page never scrolls sideways and nothing appears only on hover.',
    good: {
      caption: 'The table becomes a List: name, one line of detail and the status.',
      node: (
        <Phone>
          <b className='mb-1 px-1 text-[12px]'>Clients</b>
          <List className='-mx-2 [&_li]:px-3'>
            {clients.map(([name, item, updated]) => (
              <ListItem
                key={name}
                title={<span className='block truncate text-[11px] font-medium'>{name}</span>}
                description={
                  <span className='text-[10px]'>
                    Updated {/^[A-Z][a-z]+$/.test(updated) ? updated.toLowerCase() : updated}
                  </span>
                }
                trailing={
                  <span className='text-[10px]'>
                    <ChoiceContent item={item} compact />
                  </span>
                }
              />
            ))}
          </List>
        </Phone>
      ),
    },
    bad: {
      caption: 'The desktop table squeezed onto a phone: columns cut off, scrolling sideways.',
      node: (
        <Phone>
          <b className='mb-1 text-[12px]'>Clients</b>
          <div className='w-[300px]'>
            {[['Name', 'Email', 'Owner', 'Updated'], ...clients.map(([name]) => [name, 'okafor@…', 'Nizam', 'Today'])]
              .map((cells, row) => (
                <span
                  key={row}
                  className={`flex h-6 items-center gap-3 border-t border-border whitespace-nowrap ${
                    row ? '' : 'text-muted-foreground'
                  }`}
                >
                  {cells.map((cell) => <span key={cell} className='w-[70px] shrink-0 truncate'>{cell}</span>)}
                </span>
              ))}
          </div>
          <span className='mt-auto h-1 w-1/2 rounded-full bg-(--ui-muted)' aria-hidden='true' />
        </Phone>
      ),
    },
  },
}

/** The same frame as a component preview: a stage, then a bar that says Do or Don’t and why. */
function RulePreview({ kind, example }: { kind: 'do' | 'dont'; example: Example }) {
  const good = kind === 'do'
  return (
    <figure className='m-0 flex min-w-0 flex-col overflow-hidden rounded-lg border border-border'>
      <div className='flex min-h-[280px] items-center justify-center bg-background p-8 max-[600px]:p-4'>
        {example.node}
      </div>
      <figcaption className='flex items-start gap-2 border-t border-border bg-muted/30 px-4 py-2.5 text-[13px] leading-5'>
        <span
          className={`flex shrink-0 items-center gap-1 font-medium ${good ? 'text-(--ui-green)' : 'text-(--ui-red)'}`}
        >
          {good
            ? <CheckIcon size={14} strokeWidth={2} aria-hidden='true' />
            : <XIcon size={14} strokeWidth={2} aria-hidden='true' />}
          {good ? 'Do' : 'Don’t'}
        </span>
        <span className='text-muted-foreground'>{example.caption}</span>
      </figcaption>
    </figure>
  )
}
const link = (onNavigate: (id: string) => void, id: string) => (event: React.MouseEvent) => {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  onNavigate(id)
}

export function RulePage({ slug, onNavigate }: { slug: string; onNavigate: (id: string) => void }) {
  const index = uiRules.findIndex((rule) => rule.slug === slug)
  const rule = uiRules[index]!, visual = visuals[slug]!
  const previous = uiRules[index - 1], next = uiRules[index + 1]
  return (
    <article className='flex max-w-[880px] flex-col gap-8 pb-16 [&_h2]:m-0 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:tracking-tight'>
      <header className='flex flex-col gap-2'>
        <span className='text-[13px] text-muted-foreground tabular-nums'>Rule {index + 1} of {uiRules.length}</span>
        <div className='flex items-start justify-between gap-4'>
          <h1 className='m-0 text-[28px] leading-tight font-semibold tracking-tight max-[700px]:text-[24px]'>
            {rule.title}
          </h1>
          <MarkdownLink markdown='skill/rules.md' />
        </div>
        <p className='m-0 text-[15px] leading-6 text-muted-foreground'>{rule.summary}</p>
      </header>
      <RulePreview kind='do' example={visual.good} />
      {visual.bad && <RulePreview kind='dont' example={visual.bad} />}
      <section className='flex flex-col gap-2'>
        <h2>Why</h2>
        <p className='m-0 text-[14px] leading-6'>{visual.why}</p>
      </section>
      <section className='flex flex-col gap-2'>
        <h2>How to check</h2>
        <p className='m-0 text-[14px] leading-6'>{visual.check}</p>
      </section>
      <nav aria-label='Other rules' className='flex justify-between gap-4 border-t border-border pt-6 text-[13px]'>
        {previous
          ? (
            <a
              href={landingHref(`rules/${previous.slug}`)}
              onClick={link(onNavigate, `rules/${previous.slug}`)}
              className='no-underline'
            >
              <span className='block text-muted-foreground'>Previous</span>
              <span className='font-medium text-foreground'>{previous.title}</span>
            </a>
          )
          : <span />}
        {next && (
          <a
            href={landingHref(`rules/${next.slug}`)}
            onClick={link(onNavigate, `rules/${next.slug}`)}
            className='text-right no-underline'
          >
            <span className='block text-muted-foreground'>Next</span>
            <span className='font-medium text-foreground'>{next.title}</span>
          </a>
        )}
      </nav>
    </article>
  )
}
