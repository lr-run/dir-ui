import { landingHref } from '../routes.ts'
import { Page } from './showcase.tsx'

const layouts = [
  {
    id: 'page-shell',
    name: 'PageShell',
    structure: 'Header, optional tabs',
    levels: 'None, or up to 5 header tabs',
    limits: 'Links inside the page and a back button',
    phone: 'Tabs move to a row under the header',
    use: 'Single-purpose tools, one-off forms',
  },
  {
    id: 'app-shell',
    name: 'AppShell',
    structure: 'Sidebar + header',
    levels: '2 (group → item)',
    limits: 'About 5 groups and 15 items',
    phone: 'Sidebar opens as a left sheet',
    use: 'One app with many screens',
  },
  {
    id: 'suite-shell',
    name: 'SuiteShell',
    structure: 'Header tabs + sidebar per tab',
    levels: '3 (tab → group → item)',
    limits: 'Up to 6 tabs; each sidebar as in AppShell',
    phone: 'Tabs move to the bottom; sidebar opens as a left sheet',
    use: 'Several apps in one product, customer portals',
  },
]
/** Wireframe of each layout: header, sidebar and tab bars as plain blocks. */
const Bar = ({ className = '' }: { className?: string }) => (
  <span className={`block rounded-[2px] bg-(--ui-border) ${className}`} aria-hidden='true' />
)
function Sketch({ id }: { id: string }) {
  const header = (tabs: boolean) => (
    <div className='flex h-4 shrink-0 items-center gap-1.5 border-b border-border bg-(--ui-sidebar) px-1.5'>
      <span className='size-2 rounded-[2px] bg-primary/80' aria-hidden='true' />
      {tabs
        ? (
          <>
            <Bar className='h-1 w-5 bg-primary/70' />
            <Bar className='h-1 w-5' />
            <Bar className='h-1 w-5' />
          </>
        )
        : <Bar className='h-1 w-8' />}
      <span className='ml-auto size-2 rounded-full bg-(--ui-border)' aria-hidden='true' />
    </div>
  )
  const sidebar = (
    <div className='flex w-[28%] shrink-0 flex-col gap-1 border-r border-border bg-(--ui-sidebar) p-1.5'>
      <Bar className='h-1 w-3/5' />
      <Bar className='h-1.5' />
      <Bar className='h-1.5 bg-primary/40' />
      <Bar className='h-1 mt-1 w-3/5' />
      <Bar className='h-1.5' />
    </div>
  )
  const body = (
    <div className='flex flex-1 flex-col'>
      <div className='flex h-3.5 shrink-0 items-center justify-between border-b border-border px-1.5'>
        <Bar className='h-1 w-8' />
        <span className='h-1.5 w-4 rounded-[2px] bg-primary/80' aria-hidden='true' />
      </div>
      <div className='flex flex-col gap-1 p-1.5'>
        <Bar className='h-1.5' />
        <Bar className='h-1.5' />
        <Bar className='h-1.5 w-4/5' />
      </div>
    </div>
  )
  return (
    <div className='flex h-[92px] w-[148px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-(--ui-surface)'>
      {id === 'page-shell' && (
        <>
          <div className='flex h-4 shrink-0 items-center gap-1.5 border-b border-border px-1.5'>
            <span className='size-2 rounded-[2px] bg-primary/80' aria-hidden='true' />
            <Bar className='h-1 w-10' />
            <span className='ml-auto h-1.5 w-4 rounded-[2px] bg-primary/80' aria-hidden='true' />
          </div>
          <div className='flex flex-col gap-1 p-1.5'>
            <Bar className='h-1.5' />
            <Bar className='h-1.5' />
            <Bar className='h-1.5 w-4/5' />
          </div>
        </>
      )}
      {id === 'app-shell' && <div className='flex flex-1'>{sidebar}{body}</div>}
      {id === 'suite-shell' && (
        <>
          {header(true)}
          <div className='flex flex-1'>{sidebar}{body}</div>
        </>
      )}
    </div>
  )
}
const patterns = [
  ['Form', 'width="narrow" keeps a 640px column and bottomBar pins the submit button.', 'page-shell', 'form'],
  ['Record list', 'Search and one filter above a table; each row opens the record.', 'app-shell', 'record-list'],
  [
    'Record detail',
    'Opening a record is not a navigation level: show a back button in leading.',
    'app-shell',
    'record-detail',
  ],
  [
    'Tabs in the content',
    'A long record splits into Tabs under the header; the navigation stays.',
    'app-shell',
    'content-tabs',
  ],
]
const link = (onNavigate: (id: string) => void, id: string) => (event: React.MouseEvent) => {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  onNavigate(id)
}

export default function LayoutsPage({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <Page title='Layouts' lead='Pick the layout by how much navigation the app needs. Every screen uses exactly one.'>
      <div className='overflow-auto rounded-lg border border-border'>
        {/* On phones each row stacks into a card and every cell names its column, as rule 12 asks of tables. */}
        <table className='w-full border-collapse text-left text-[13px] leading-5 [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-middle [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium [&_th]:text-muted-foreground max-[700px]:[&_thead]:hidden max-[700px]:[&_tbody]:block max-[700px]:[&_tr]:block max-[700px]:[&_tr]:border-t max-[700px]:[&_tr]:border-border max-[700px]:[&_tr:first-child]:border-t-0 max-[700px]:[&_tr]:py-2 max-[700px]:[&_td]:block max-[700px]:[&_td]:border-t-0 max-[700px]:[&_td]:py-1.5 max-[700px]:[&_td[data-label]]:before:block max-[700px]:[&_td[data-label]]:before:text-[12px] max-[700px]:[&_td[data-label]]:before:font-medium max-[700px]:[&_td[data-label]]:before:text-muted-foreground max-[700px]:[&_td[data-label]]:before:content-[attr(data-label)]'>
          <thead className='bg-muted/40 text-[12px]'>
            <tr>
              <th>Layout</th>
              <th>Navigation levels</th>
              <th>Limits</th>
              <th>Phone</th>
              <th>Use for</th>
            </tr>
          </thead>
          <tbody>
            {layouts.map((layout) => (
              <tr key={layout.id}>
                <td>
                  <a
                    href={landingHref(layout.id)}
                    onClick={link(onNavigate, layout.id)}
                    className='flex items-center gap-3 no-underline max-[700px]:flex-col max-[700px]:items-start'
                  >
                    <Sketch id={layout.id} />
                    <span>
                      <span className='block font-medium text-foreground underline underline-offset-4'>
                        {layout.name}
                      </span>
                      <span className='block text-muted-foreground'>{layout.structure}</span>
                    </span>
                  </a>
                </td>
                <td data-label='Navigation levels'>{layout.levels}</td>
                <td data-label='Limits' className='text-muted-foreground'>{layout.limits}</td>
                <td data-label='Phone' className='text-muted-foreground'>{layout.phone}</td>
                <td data-label='Use for' className='text-muted-foreground'>{layout.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className='flex flex-col gap-3'>
        <h2 className='m-0 text-[16px] font-semibold tracking-tight'>Page patterns</h2>
        <p className='m-0 text-[14px] text-muted-foreground'>These work inside any of the three layouts.</p>
        <ul className='m-0 flex flex-col gap-2 p-0 text-[14px] leading-6 [&_li]:list-none'>
          {patterns.map(([name, text, layout, section]) => (
            <li key={name}>
              <a
                href={`${landingHref(layout!)}#${section}`}
                className='font-medium underline underline-offset-4'
              >
                {name}
              </a>
              <span className='text-muted-foreground'>{` — ${text}`}</span>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  )
}
