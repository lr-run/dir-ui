import { WorkflowDemo } from '../../../../examples/workflow/workflow-demo.tsx'
import { exampleRoute, recipes } from '../navigation.ts'
import { landingHref } from '../routes.ts'

function Examples() {
  return (
    <>
      several example systems prove the system works in practice:{' '}
      {recipes.map((recipe, index) => (
        <span key={recipe.slug}>
          {index > 0 && (index === recipes.length - 1 ? ' and ' : ', ')}
          <a href={landingHref(exampleRoute(recipe.slug))} className='text-foreground underline underline-offset-4'>
            {recipe.title}
          </a>
        </span>
      ))}, each built from these parts alone.
    </>
  )
}
const items: [string, React.ReactNode][] = [
  ['Components', 'inputs, selects, multi-selects and every other control a business screen needs.'],
  ['Layouts', 'several shells, such as a screen with a sidebar, so every page starts from a proven structure.'],
  ['Mobile', 'every screen works on a phone.'],
  [
    'UI rules',
    'conventions every screen follows: loading shows a skeleton, submitting a form disables the inputs and shows a loading state, and so on.',
  ],
  ['Themes', 'Light, Black and Paper out of the box, each customizable with a company color.'],
  ['Page speed', 'designed for fast first paint and small bundles.'],
  ['Examples', <Examples key='examples' />],
]

export default function ConceptPage() {
  return (
    <article className='flex max-w-[680px] flex-col gap-8 pb-16'>
      <header className='flex flex-col gap-3'>
        <h1 className='m-0 text-[28px] leading-tight font-semibold tracking-tight max-[700px]:text-[24px]'>Concept</h1>
        <p className='m-0 text-[18px] leading-7 font-medium'>
          One purpose, one pattern. Consistent workflows for CRM, recruiting and task management.
        </p>
      </header>
      <section className='flex flex-col gap-4'>
        <h2 className='m-0 text-[16px] font-semibold tracking-tight'>What it covers</h2>
        <p className='m-0 text-[14px] leading-6 text-muted-foreground'>
          Start with a proven workflow: find a record, inspect it, update it and decide the next action. Components,
          layouts and quality states are composed together so people and agents share the same defaults.
        </p>
        <ol className='m-0 flex flex-col gap-3 p-0 [&_li]:list-none'>
          {items.map(([title, text], index) => (
            <li key={title} className='grid grid-cols-[24px_minmax(0,1fr)] gap-x-2 text-[14px] leading-6'>
              <span className='text-muted-foreground tabular-nums'>{index + 1}</span>
              <span>
                <b className='font-semibold'>{title}</b>
                <span className='text-muted-foreground'>{` — `}{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
      <WorkflowDemo />
    </article>
  )
}
