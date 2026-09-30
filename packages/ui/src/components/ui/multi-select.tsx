import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import type { Choice } from '@/lib/choice-types.ts'
type Props = {
  items: Choice[]
  value: string[]
  onValueChange: (value: string[]) => void
  label: string
  id?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  'aria-describedby'?: string
}
export function MultiSelect(
  { items, value, onValueChange, label, id, disabled, readOnly, invalid, open, onOpenChange, ...aria }: Props & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  },
) {
  return (
    <SelectRoot
      multiple
      items={items}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || readOnly}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        {...aria}
        id={id}
        aria-label={label}
        aria-invalid={invalid}
        className="[box-shadow:0_1px_2px_#00000005] [transition:border-color_120ms,_box-shadow_120ms] w-full min-w-0 h-[36px] p-[7px_10px] [border:1px_solid_var(--ui-border)] rounded-[var(--dir-radius)] [background:var(--ui-raised)] text-foreground text-[length:var(--dir-text-body)] [outline:none] [&:disabled]:cursor-not-allowed [&[readonly]]:[background:var(--ui-subtle)] [&[readonly]]:text-muted-foreground [&:disabled]:opacity-55 [textarea&]:h-auto [textarea&]:min-h-[90px] [textarea&]:resize-y [textarea&]:leading-[1.6] [@media(prefers-reduced-motion:reduce)]:[transition:none] [&:focus]:[outline:none] [&:focus]:outline-offset-0 [&:focus]:[border-color:var(--ui-ring)] [&:focus]:[box-shadow:none] [&:focus-visible]:[outline:none] [&:focus-visible]:outline-offset-0 [&:focus-visible]:[border-color:var(--ui-ring)] [&:focus-visible]:[box-shadow:none] [&[aria-invalid='true']]:[border-color:var(--ui-red)] [&[aria-invalid='true']]:[box-shadow:none] [&::placeholder]:text-muted-foreground [&::placeholder]:opacity-75 [&[aria-invalid='true']:focus]:[box-shadow:none] [&[aria-invalid='true']:focus]:[border-color:var(--ui-red)] [&:is(:focus,_:focus-visible)]:[border-color:var(--ui-ring)] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:outline-offset-0 [&:is(:focus,_:focus-visible)]:[box-shadow:none] group/crm-select flex items-center justify-between gap-[12px] text-left [&_svg]:w-[14px] [&_svg]:h-[14px] [&_svg]:shrink-0 [&>span:first-child]:overflow-hidden [&>span:first-child]:text-ellipsis [&>span:first-child]:whitespace-nowrap"
      >
        <SelectValue>
          {() =>
            value.length
              ? items.filter((i) => value.includes(i.value)).map((i) => i.label).join(', ')
              : 'Select an option'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
      </SelectContent>
    </SelectRoot>
  )
}
