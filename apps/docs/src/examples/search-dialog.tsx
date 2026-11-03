import { Building2Icon, TargetIcon } from 'lucide-react'
import { useState } from 'react'
import { SearchDialog, SearchDialogTrigger, type SearchItem } from '@dir/ui/components/collections/search-dialog.tsx'
import type { ComponentDoc } from './index.ts'

const results: SearchItem[] = [
  {
    id: 'c1',
    label: 'Hokuto Manufacturing',
    description: 'Manufacturing',
    group: 'Companies',
    meta: 'Company',
    icon: <Building2Icon size={16} strokeWidth={1.5} aria-hidden='true' />,
  },
  {
    id: 'd1',
    label: 'Hokuto Manufacturing — Production management PoC',
    group: 'Deals',
    meta: 'Proposed',
    icon: <TargetIcon size={16} strokeWidth={1.5} aria-hidden='true' />,
  },
  {
    id: 'd2',
    label: 'Hokuto Manufacturing — Attendance integration',
    group: 'Deals',
    meta: 'Lead',
    icon: <TargetIcon size={16} strokeWidth={1.5} aria-hidden='true' />,
  },
  {
    id: 'c2',
    label: 'ABC Trading',
    description: 'Wholesale',
    group: 'Companies',
    meta: 'Company',
    icon: <Building2Icon size={16} strokeWidth={1.5} aria-hidden='true' />,
  },
]

export function SearchDialogDemo() {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState('')
  return (
    <div className='flex flex-col items-start gap-3'>
      <div className='w-[184px] [&_button]:h-7 [&_button]:text-xs'>
        <SearchDialogTrigger placeholder='Search' shortcut aria-expanded={open} onClick={() => setOpen(true)} />
      </div>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        title='Search records'
        items={results}
        placeholder='Search companies and deals'
        emptyMessage='No matching results'
        shortcut
        onSelect={(item) => setPicked(item.label)}
      />
      {picked && <output className='text-[12px] text-muted-foreground'>Selected: {picked}</output>}
    </div>
  )
}
export function SearchDialogRemote() {
  const [open, setOpen] = useState(false)
  const loadResults = async (query: string, { signal }: { signal: AbortSignal }) => {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 600)
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new Error('Canceled'))
      }, { once: true })
    })
    return results.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  }
  return (
    <>
      <div className='w-[184px] [&_button]:h-7 [&_button]:text-xs'>
        <SearchDialogTrigger placeholder='Search (remote)' onClick={() => setOpen(true)} />
      </div>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        title='Search records'
        loadResults={loadResults}
        minQueryLength={1}
        onSelect={() => setOpen(false)}
      />
    </>
  )
}
export const doc: ComponentDoc = {
  hero: SearchDialogDemo,
  sections: [
    {
      id: 'remote',
      title: 'Remote Search',
      description:
        'Pass `loadResults` to search on the server; the dialog debounces input and shows a loading state. Results are grouped by `group`.',
      example: SearchDialogRemote,
    },
  ],
}
