import { useState } from 'react'
import { Checkbox } from '@dir/ui/components/ui/checkbox.tsx'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRoot,
  FieldSeparator,
  FieldSet,
} from '@dir/ui/components/ui/field.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import type { ComponentDoc } from './index.ts'

export function FieldDemo() {
  return (
    <div className='w-full max-w-xs'>
      <Field label='Company name'>{(props) => <Input {...props} placeholder='Acme Inc.' />}</Field>
    </div>
  )
}
export function FieldRequired() {
  return (
    <div className='w-full max-w-xs'>
      <Field label='Company name' required description='Use the registered name'>
        {(props) => <Input {...props} placeholder='Acme Inc.' />}
      </Field>
    </div>
  )
}
export function FieldHorizontal() {
  return (
    <FieldRoot orientation='horizontal' className='w-[260px]'>
      <FieldLabel className='text-[13px] font-medium text-muted-foreground'>Receive notifications</FieldLabel>
      <Checkbox label='Receive notifications' defaultChecked />
    </FieldRoot>
  )
}
export function FieldDisabled() {
  return (
    <FieldRoot data-disabled='true' className='w-full max-w-xs gap-[7px]'>
      <FieldLabel className='text-[13px] font-medium text-muted-foreground'>Deal number</FieldLabel>
      <Input defaultValue='D-2026-0931' disabled aria-label='Deal number' />
      <FieldDescription className='text-[13px]'>Assigned automatically</FieldDescription>
    </FieldRoot>
  )
}
export function FieldSetDemo() {
  const [prefecture, setPrefecture] = useState('Tokyo')
  return (
    <FieldSet className='w-full max-w-md'>
      <FieldLegend>Billing address</FieldLegend>
      <div className='grid grid-cols-2 gap-3.5'>
        <Field label='Postal code'>{(props) => <Input {...props} defaultValue='150-0001' />}</Field>
        <Field label='Prefecture'>
          {(props) => (
            <Select
              id={props.id}
              label='Prefecture'
              items={['Tokyo', 'Osaka', 'Aichi'].map((p) => ({ value: p, label: p }))}
              value={prefecture}
              onChange={setPrefecture}
            />
          )}
        </Field>
      </div>
      <Field label='Street'>{(props) => <Input {...props} defaultValue='1-1-1 Jingumae, Shibuya' />}</Field>
    </FieldSet>
  )
}
export function FieldGroupDemo() {
  const [template, setTemplate] = useState('')
  return (
    <FieldGroup className='max-w-xs'>
      <Field label='Subject'>{(props) => <Input {...props} defaultValue='November travel expenses' />}</Field>
      <FieldSeparator className='text-[13px]'>or</FieldSeparator>
      <Field label='From template'>
        {(props) => (
          <Select
            id={props.id}
            label='Template'
            items={[{ value: '', label: 'Select' }, { value: 'travel', label: 'Travel' }]}
            value={template}
            onChange={setTemplate}
          />
        )}
      </Field>
    </FieldGroup>
  )
}
export function FieldInvalid() {
  return (
    <div className='grid w-full max-w-xs gap-5'>
      <Field label='Amount' required error='Enter a number'>
        {(props) => <Input {...props} type='money' currency='JPY' defaultValue='abc' />}
      </Field>
      <FieldRoot data-invalid='true' className='gap-[7px]'>
        <FieldLabel className='text-[13px] font-medium'>Password</FieldLabel>
        <Input type='password' defaultValue='abcd' invalid aria-label='Password' />
        <FieldError
          className='text-[13px]'
          errors={[{ message: '8 characters or more' }, { message: 'Include a number' }]}
        />
      </FieldRoot>
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: FieldDemo,
  sections: [
    {
      id: 'description',
      title: 'Description',
      description: '`required` adds the asterisk; `description` renders help text under the control.',
      example: FieldRequired,
    },
    {
      id: 'invalid',
      title: 'Invalid',
      description: 'Pass `error` for one message. `FieldError` with `errors` renders a list.',
      example: FieldInvalid,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: '`data-disabled` on `FieldRoot` dims the whole field.',
      example: FieldDisabled,
    },
    {
      id: 'horizontal',
      title: 'Horizontal',
      description: '`orientation="horizontal"` puts the label inline.',
      example: FieldHorizontal,
    },
    {
      id: 'field-set',
      title: 'Field Set',
      description: 'Group related fields under a `FieldLegend`.',
      example: FieldSetDemo,
    },
    {
      id: 'field-group',
      title: 'Field Group',
      description: 'Stack fields with a 20px gap; `FieldSeparator` divides alternatives.',
      example: FieldGroupDemo,
    },
  ],
}
