import type { ReactNode } from 'react'

/** Shared "when to use" table for the selection pages. Not an example; rendered as a section body. */
const rows: [string, string, string][] = [
  ['Yes / no', 'Checkbox', 'A boolean committed with Save'],
  ['One of a few', 'Select', '2–7 fixed options, no search'],
  ['One of many', 'Combobox', '8+ options or server search'],
  ['Several', 'Combobox (multiple)', 'Any multiple selection, shown as chips'],
  ['Edit in place', 'InlineSelect · InlineCombobox · InlineMultiCombobox', 'Detail screens, saved on change'],
]
export function SelectionGuide({ current }: { current: string }) {
  return (
    <div className='w-full overflow-hidden rounded-lg border border-border'>
      <table className='w-full border-collapse text-left text-[13px]'>
        <thead className='bg-muted/40 text-[12px] text-muted-foreground'>
          <tr>
            <th className='px-3 py-2 font-medium'>Need</th>
            <th className='px-3 py-2 font-medium'>Use</th>
            <th className='px-3 py-2 font-medium max-[600px]:hidden'>When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([need, use, when]) => (
            <tr key={need} className='border-t border-border' data-current={use.startsWith(current) || undefined}>
              <td className='px-3 py-2 text-muted-foreground'>{need}</td>
              <td className='px-3 py-2 font-medium'>{highlight(use, current)}</td>
              <td className='px-3 py-2 text-muted-foreground max-[600px]:hidden'>{when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function highlight(use: string, current: string): ReactNode {
  return use.startsWith(current) ? <span className='rounded bg-muted px-1.5 py-0.5'>{use}</span> : use
}
