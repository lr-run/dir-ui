import { Skeleton } from '@/components/ui/skeleton.tsx'

export function TableSkeleton(
  { rows = 8, columns = 6, rowHeight = 40 }: { rows?: number; columns?: number; rowHeight?: number },
) {
  return (
    <div
      role='status'
      aria-label='Loading records'
      className='motion-reduce:[&_[data-slot=skeleton]]:animate-none sticky left-0 col-span-full grid grid-cols-subgrid w-[100cqw] max-w-full overflow-hidden self-start'
    >
      <span className='sr-only'>Loading records…</span>
      <div aria-hidden='true' className='col-span-full grid grid-cols-subgrid'>
        {Array.from(
          { length: rows },
          (_, row) => (
            <div
              key={row}
              className='col-span-full grid grid-cols-subgrid border-b border-border'
              style={{
                height: rowHeight,
              }}
            >
              {Array.from(
                { length: columns },
                (_, column) => (
                  <div key={column} className='flex items-center gap-2 border-r border-border px-3'>
                    {column === 0 && <Skeleton className='size-5 shrink-0 rounded' />}
                    <Skeleton className={`h-3 ${row % 3 === 0 ? 'w-3/5' : row % 3 === 1 ? 'w-4/5' : 'w-1/2'}`} />
                  </div>
                ),
              )}
            </div>
          ),
        )}
      </div>
    </div>
  )
}
