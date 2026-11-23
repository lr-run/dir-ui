import { LoadingState } from '@dir/ui/components/ui/loading-state.tsx'
import { Skeleton } from '@dir/ui/components/ui/skeleton.tsx'
import { TableSkeleton } from '@dir/crm/components/table-skeleton.tsx'
import type { ComponentDoc } from './index.ts'

export function SkeletonDemo() {
  return (
    <div className='flex w-full max-w-sm flex-col gap-2.5'>
      <div className='flex items-center gap-2.5'>
        <Skeleton className='size-8 rounded-full' />
        <div className='flex flex-1 flex-col gap-1.5'>
          <Skeleton className='h-3 w-3/5' />
          <Skeleton className='h-2.5 w-2/5' />
        </div>
      </div>
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-4/5' />
    </div>
  )
}
export function LoadingStateDemo() {
  return (
    <div className='w-full max-w-sm rounded-lg border border-border'>
      <LoadingState label='Loading' />
    </div>
  )
}
export function TableSkeletonDemo() {
  return (
    <div className='grid w-full grid-cols-[28px_1.6fr_1fr_1fr] overflow-hidden rounded-lg border border-border [&>div>div>div:last-child]:border-b-0'>
      <TableSkeleton rows={4} columns={4} />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: SkeletonDemo,
  sections: [
    {
      id: 'loading-state',
      title: 'Loading State',
      description: 'Three bars for a panel, with `role="status"`.',
      example: LoadingStateDemo,
    },
    {
      id: 'table-skeleton',
      title: 'Table Skeleton',
      description: 'Match the grid row height and column count so nothing shifts when data arrives.',
      example: TableSkeletonDemo,
      align: 'stretch',
    },
  ],
}
