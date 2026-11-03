import { ChevronDownIcon, EllipsisIcon, PlusIcon, XIcon } from 'lucide-react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'
import type { ComponentDoc } from './index.ts'

export function ButtonDemo() {
  return <Button>Button</Button>
}
export function ButtonSize() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Button size='xs'>Extra small</Button>
      <Button size='sm'>Small</Button>
      <Button>Default</Button>
      <Button size='lg'>Large</Button>
    </div>
  )
}
export function ButtonVariant() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Button variant='default'>Save</Button>
      <Button variant='outline'>Export</Button>
      <Button variant='secondary'>Duplicate</Button>
      <Button variant='ghost'>Cancel</Button>
      <Button variant='destructive'>Delete</Button>
      <Button variant='link'>View details</Button>
    </div>
  )
}
export function ButtonIcon() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Button variant='default'>
        <PlusIcon aria-hidden='true' />New deal
      </Button>
      <Button>
        More <ChevronDownIcon aria-hidden='true' />
      </Button>
      <IconButton label='More actions'>
        <EllipsisIcon aria-hidden='true' />
      </IconButton>
      <IconButton variant='ghost' label='Close'>
        <XIcon aria-hidden='true' />
      </IconButton>
    </div>
  )
}
export function ButtonDisabled() {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Button disabled>Export</Button>
      <Button variant='default' disabled className='min-w-[72px]'>Saving…</Button>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: ButtonDemo,
  sections: [
    { id: 'size', title: 'Size', description: 'Use `size` for 22, 26, 28 or 32px.', example: ButtonSize },
    {
      id: 'variant',
      title: 'Variant',
      description:
        '`outline` is the default. Use `default` for the one primary action per screen and confirm `destructive` actions with `ConfirmDialog`.',
      example: ButtonVariant,
    },
    {
      id: 'icon',
      title: 'Icon',
      description: 'Icons sit before or after the label. Icon-only buttons use `IconButton`, which requires a `label`.',
      example: ButtonIcon,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description:
        'Use `disabled`. While a form submits, disable the button, keep its width and use the progressive label.',
      example: ButtonDisabled,
    },
  ],
}
