import { Textarea } from '@dir/ui/components/ui/textarea.tsx'
import type { ComponentDoc } from './index.ts'

export function TextareaDemo() {
  return (
    <div className='grid w-full max-w-md gap-3'>
      <Textarea
        defaultValue='Hokuto Manufacturing responded well on site; the PoC can grow to two production lines.'
        aria-label='Notes'
      />
      <Textarea invalid placeholder='Required' aria-label='Invalid' />
      <Textarea defaultValue='—' disabled aria-label='Disabled' />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: TextareaDemo,
  sections: [],
}
