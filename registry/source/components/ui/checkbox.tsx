import '@/components/ui/dir-theme.css'
import type { ComponentProps } from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { CheckIcon } from 'lucide-react'

export function Checkbox(
  { label, disabled, readOnly, ...props }: ComponentProps<typeof BaseCheckbox.Root> & { label: string },
) {
  return (
    <BaseCheckbox.Root
      {...props}
      disabled={disabled || readOnly}
      aria-label={label}
      className='w-[15px] h-[15px] shrink-0 p-0 inline-flex items-center justify-center [border:1px_solid_var(--ui-border)] rounded-[4px] [background:var(--ui-raised)] align-middle cursor-pointer [&:focus-visible]:[outline:2px_solid_var(--dir-focus)] [&:focus-visible]:outline-offset-[2px] [&[data-checked]]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)] [&[data-checked]]:text-white [&[data-indeterminate]]:[background:var(--ui-primary)] [&[data-indeterminate]]:[border-color:var(--ui-primary)] [&[data-indeterminate]]:text-white [&_svg]:w-[12px] [&_svg]:h-[12px]'
    >
      <BaseCheckbox.Indicator>
        <CheckIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}
