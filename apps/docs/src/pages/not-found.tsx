import { Button } from '@dir/ui/components/ui/button.tsx'

export function NotFound({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className='m-[44px_0] pt-[24px] [border-top:1px_solid_var(--ui-border)] [&_h1]:mb-4 [&_h1]:text-[24px] [&_h1]:font-semibold'>
      <h1>Page not found</h1>
      <Button onClick={() => onNavigate('button')}>Back to components</Button>
    </div>
  )
}
