import { Badge } from '@dir/ui/components/ui/badge.tsx'
import type { ComponentDoc } from './index.ts'

export function BadgeDemo() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Badge>Manufacturing</Badge>
      <Badge>12</Badge>
      <Badge>
        <span className='tabular-nums'>SKU-20871</span>
      </Badge>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: BadgeDemo,
  sections: [],
  api: {
    usage: "import { Badge } from '@/components/ui/badge.tsx'",
    props: [{
      name: 'children',
      type: 'ReactNode',
      default: 'Required',
      description: 'A category, a count or a code.',
    }],
  },
}
