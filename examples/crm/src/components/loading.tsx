import { Skeleton } from '@/components/ui/skeleton.tsx'

function LoadingHeader({ title }: { title: string }) {
  return <div className='flex h-12 shrink-0 items-center border-b border-border px-4 text-sm font-medium'>{title}</div>
}

export function ReportSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading report'
      className='flex min-h-0 flex-1 flex-col overflow-auto motion-reduce:[&_[data-slot=skeleton]]:animate-none'
    >
      <span className='sr-only'>Loading report…</span>
      <LoadingHeader title='Report' />
      <div aria-hidden='true' className='mx-auto grid w-full max-w-[1280px] gap-5 p-6 max-[800px]:p-4'>
        <div className='flex flex-wrap justify-between gap-4'>
          <div className='space-y-3'>
            <Skeleton className='h-6 w-44' />
            <Skeleton className='h-3 w-64 max-w-full' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-[30px] w-32' />
            <Skeleton className='h-[30px] w-32' />
          </div>
        </div>
        <div className='grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border max-[600px]:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='space-y-5 p-5'>
              <Skeleton className='h-3 w-24 max-w-full' />
              <Skeleton className='h-7 w-28 max-w-full' />
            </div>
          ))}
        </div>
        <div className='grid grid-cols-2 gap-5 max-[800px]:grid-cols-1'>
          {[1, 2].map((i) => (
            <div key={i} className='rounded-lg border border-border p-5'>
              <Skeleton className='mb-3 h-3.5 w-32' />
              <Skeleton className='mb-6 h-3 w-48 max-w-full' />
              <div className='flex h-[200px] items-end gap-4 border-b border-border px-4'>
                {['h-2/5', 'h-3/4', 'h-1/2', 'h-5/6', 'h-3/5'].map((height) => (
                  <Skeleton key={height} className={`flex-1 rounded-b-none ${height}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className='space-y-4 rounded-lg border border-border p-5'>
          <Skeleton className='h-3.5 w-40' />
          {[1, 2, 3].map((i) => <Skeleton key={i} className='h-8 w-full' />)}
        </div>
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading settings'
      className='flex min-h-0 flex-1 flex-col overflow-auto motion-reduce:[&_[data-slot=skeleton]]:animate-none'
    >
      <span className='sr-only'>Loading settings…</span>
      <LoadingHeader title='Settings' />
      <div aria-hidden='true' className='mx-auto w-full max-w-4xl space-y-6 p-5'>
        <div className='flex gap-4'>
          <Skeleton className='h-6 w-24' />
          <Skeleton className='h-6 w-16' />
        </div>
        <Skeleton className='h-4 w-32' />
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className='h-12 w-full' />)}
      </div>
    </div>
  )
}
