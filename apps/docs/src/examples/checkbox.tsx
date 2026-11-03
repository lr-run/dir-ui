import type { ComponentDoc } from './index.ts'
import { SelectionGuide } from './selection-guide.tsx'
import { Checkbox } from '@dir/ui/components/ui/checkbox.tsx'
import { FieldLabel } from '@dir/ui/components/ui/field.tsx'

export function CheckboxDemo() {
  return (
    <FieldLabel className='text-[13px]'>
      <Checkbox label='Accept terms and conditions' />
      Accept terms and conditions
    </FieldLabel>
  )
}
export function CheckboxWhenToUse() {
  return <SelectionGuide current='Checkbox' />
}
export function CheckboxStates() {
  return (
    <div className='flex flex-wrap items-center gap-5'>
      <Checkbox label='Unchecked' />
      <Checkbox label='Checked' defaultChecked />
      <Checkbox label='Indeterminate' indeterminate />
      <Checkbox label='Disabled' disabled defaultChecked />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: CheckboxDemo,
  sections: [
    {
      id: 'when-to-use',
      title: 'When to Use',
      description: 'There is no Switch or RadioGroup. Settings that apply immediately use `InlineSelect`.',
      example: CheckboxWhenToUse,
      align: 'stretch',
      code: false,
    },
    {
      id: 'states',
      title: 'States',
      description: 'Use `checked`, `indeterminate` and `disabled`.',
      example: CheckboxStates,
    },
  ],
}
