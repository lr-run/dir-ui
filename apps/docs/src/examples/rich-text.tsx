import { RichText } from '@dir/ui/components/ui/rich-text.tsx'
import type { ComponentDoc } from './index.ts'

export function RichTextDemo() {
  return (
    <div className='w-full max-w-md'>
      <RichText
        label='Notes'
        initialText='Hokuto Manufacturing PoC expands to two lines. Maintenance matters more than price.'
      />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: RichTextDemo,
  sections: [],
}
