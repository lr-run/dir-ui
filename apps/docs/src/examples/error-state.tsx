import { useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { ErrorBoundary } from '@dir/ui/components/ui/error-boundary.tsx'
import { ErrorState } from '@dir/ui/components/ui/error-state.tsx'
import type { ComponentDoc } from './index.ts'

export function ErrorStateDemo() {
  return (
    <div className='w-full max-w-sm rounded-lg border border-border'>
      <ErrorState message='Failed to load.' retry={() => {}} />
    </div>
  )
}
function Broken(): never {
  throw new Error('The report failed to start.')
}
export function ErrorBoundaryDemo() {
  const [broken, setBroken] = useState(false)
  return (
    <div className='w-full max-w-md rounded-lg border border-border'>
      <ErrorBoundary key={String(broken)}>
        {broken ? <Broken /> : (
          <div className='grid place-items-center gap-3 p-6 text-[13px] text-muted-foreground'>
            The report renders here.
            <Button onClick={() => setBroken(true)}>Throw an error</Button>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: ErrorStateDemo,
  sections: [
    {
      id: 'error-boundary',
      title: 'Error Boundary',
      description:
        'Wrap the app or a page in `ErrorBoundary` so a render error shows a reload screen instead of a blank page. Use `ErrorState` for failed requests you can retry.',
      example: ErrorBoundaryDemo,
    },
  ],
}
