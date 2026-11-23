import { Button } from '@dir/ui/components/ui/button.tsx'
import { EmptyState } from '@dir/ui/components/ui/empty-state.tsx'
import type { ComponentDoc } from './index.ts'

export function EmptyStateDemo() {
  return (
    <div className='grid w-full grid-cols-2 gap-3 max-[600px]:grid-cols-1'>
      <div className='rounded-lg border border-border'>
        <EmptyState title='No deals yet'>
          <Button variant='default'>Add a deal</Button>
        </EmptyState>
      </div>
      <div className='rounded-lg border border-border'>
        <EmptyState title='No deals match these filters'>
          <Button>Clear filters</Button>
        </EmptyState>
      </div>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: EmptyStateDemo,
  heroAlign: 'stretch',
  sections: [],
}
