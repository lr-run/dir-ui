import { XIcon } from 'lucide-react'
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@dir/ui/components/ui/input.tsx'
import { Textarea } from '@dir/ui/components/ui/textarea.tsx'
import type { ComponentDoc } from './index.ts'

export function InputDemo() {
  return <Input type='email' placeholder='Email' aria-label='Email' className='max-w-xs' />
}
export function InputGroupDemo() {
  return (
    <div className='grid w-full max-w-md gap-3'>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput defaultValue='usedir.com' aria-label='URL' />
      </InputGroup>
      <InputGroup>
        <InputGroupInput defaultValue='Hokuto Manufacturing' aria-label='Company' />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton size='icon-xs' aria-label='Clear'>
            <XIcon aria-hidden='true' />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder='Search' aria-label='Search' />
        <InputGroupAddon align='inline-end'>
          <kbd className='rounded bg-muted px-1.5 text-[11px]'>⌘K</kbd>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon align='block-start'>
          <InputGroupText className='text-xs'>Notes</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea defaultValue='Propose the upper plan at renewal.' aria-label='Notes' rows={2} />
      </InputGroup>
    </div>
  )
}
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
export function InputTypes() {
  return (
    <div className='grid w-full max-w-md grid-cols-2 gap-3 max-[600px]:grid-cols-1'>
      <Input type='search' defaultValue='Hokuto' aria-label='Search' />
      <Input type='password' defaultValue='password' aria-label='Password' />
      <Input type='number' defaultValue='24' aria-label='Number' />
      <Input type='money' currency='JPY' defaultValue='12000000' aria-label='Amount' />
      <Input type='percent' defaultValue='12.5' aria-label='Margin' />
      <Input type='date' defaultValue='2026-11-14' aria-label='Close date' />
    </div>
  )
}
export function InputStates() {
  return (
    <div className='grid w-full max-w-md gap-3'>
      <Input defaultValue='abc' invalid aria-label='Amount' />
      <Input defaultValue='D-2026-0931' disabled aria-label='Deal number' />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: InputDemo,
  sections: [
    {
      id: 'types',
      title: 'Types',
      description:
        'Use `type` for text, search, password, number, `money` (with `currency`), `percent`, `date` and `datetime-local`.',
      example: InputTypes,
    },
    {
      id: 'states',
      title: 'States',
      description: '`invalid` turns the border red; `disabled` renders at 50%.',
      example: InputStates,
    },
    {
      id: 'input-group',
      title: 'Input Group',
      description: 'Add text, a button or a keyboard hint inside the input with `InputGroup` and `InputGroupAddon`.',
      example: InputGroupDemo,
    },
    {
      id: 'textarea',
      title: 'Textarea',
      description: '`Textarea` grows with its content from 64px.',
      example: TextareaDemo,
    },
  ],
}
