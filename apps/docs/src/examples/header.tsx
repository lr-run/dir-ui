import { ArrowLeftIcon, CopyIcon, EllipsisIcon, PlusIcon } from 'lucide-react'
import { Header } from '@dir/ui/components/header.tsx'
import { Badge } from '@dir/ui/components/ui/badge.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import type { ComponentDoc } from './index.ts'

export function HeaderDemo() {
  return (
    <Header
      className='w-full rounded-lg border border-border'
      title='Deals'
      actions={
        <>
          <Button variant='ghost'>Archive</Button>
          <Button variant='default'>
            <PlusIcon aria-hidden='true' />New deal
          </Button>
        </>
      }
    />
  )
}
export function HeaderBack() {
  return (
    <Header
      className='w-full rounded-lg border border-border'
      leading={
        <IconButton variant='ghost' label='Back'>
          <ArrowLeftIcon aria-hidden='true' />
        </IconButton>
      }
      title={
        <span className='flex items-center gap-2'>
          Core system renewal <Badge>D-2026-0931</Badge>
        </span>
      }
      actions={
        <>
          <Button>
            <CopyIcon aria-hidden='true' />Duplicate
          </Button>
          <IconButton label='More actions'>
            <EllipsisIcon aria-hidden='true' />
          </IconButton>
        </>
      }
    />
  )
}
export const doc: ComponentDoc = {
  hero: HeaderDemo,
  heroAlign: 'stretch',
  sections: [
    {
      id: 'back',
      title: 'With Back Button',
      description: 'Nested screens put a back `IconButton` in `leading`.',
      example: HeaderBack,
      align: 'stretch',
    },
  ],
}
