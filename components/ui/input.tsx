import { InputGroup, InputGroupAddon, InputGroupInput } from '../shadcn/input-group.tsx'
import { Input as ShadcnInput } from '../shadcn/input.tsx'
import { Textarea as ShadcnTextarea } from '../shadcn/textarea.tsx'
import { Field as ShadcnField, FieldDescription, FieldError, FieldLabel } from '../shadcn/field.tsx'
import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'search'
  | 'number'
  | 'money'
  | 'percent'
  | 'date'
  | 'datetime-local'
export type InputProps = Omit<ComponentProps<'input'>, 'type' | 'readOnly'> & {
  type?: InputType
  currency?: string
  invalid?: boolean
  /** @deprecated Use disabled. Both prevent editing with the same disabled treatment. */
  readOnly?: boolean
}
export function Input(
  { type = 'text', currency = 'USD', invalid, disabled, readOnly, className = '', ...props }: InputProps,
) {
  const common = { ...props, disabled: disabled || readOnly, 'aria-invalid': invalid || props['aria-invalid'] }
  if (type === 'money' || type === 'percent') {
    return (
      <InputGroup className={className} data-disabled={common.disabled || undefined}>
        {type === 'money' && <InputGroupAddon>{currency}</InputGroupAddon>}
        <InputGroupInput {...common} type='number' inputMode='decimal' />
        {type === 'percent' && <InputGroupAddon align='inline-end'>%</InputGroupAddon>}
      </InputGroup>
    )
  }
  return (
    <ShadcnInput
      {...common}
      type={type}
      inputMode={props.inputMode ?? (type === 'number' ? 'decimal' : undefined)}
      className={`${className}`}
    />
  )
}
export type TextInputProps = InputProps
// Compatibility aliases; new consumers use Input with a type prop.
export const TextInput = Input
export function Textarea(
  { invalid, disabled, readOnly, className = '', ...props }: ComponentProps<'textarea'> & { invalid?: boolean },
) {
  return (
    <ShadcnTextarea
      {...props}
      disabled={disabled || readOnly}
      aria-invalid={invalid || props['aria-invalid']}
      className={`${className}`}
    />
  )
}
export function NumberInput(props: Omit<InputProps, 'type'>) {
  return <Input {...props} type='number' />
}
export function MoneyInput(props: Omit<InputProps, 'type'>) {
  return <Input {...props} type='money' />
}
export function PercentInput(props: Omit<InputProps, 'type'>) {
  return <Input {...props} type='percent' />
}
export function DateInput(props: Omit<InputProps, 'type'>) {
  return <Input {...props} type='date' />
}
export function DateTimeInput(props: Omit<InputProps, 'type'>) {
  return <Input {...props} type='datetime-local' />
}
/** Presentation only. The caller owns values, validation, and form subscriptions. */
export function Field({ label, description, error, required, children }: {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: (
    props: { id: string; 'aria-describedby'?: string; 'aria-required'?: boolean; invalid: boolean },
  ) => ReactNode
}) {
  const id = useId()
  return (
    <ShadcnField
      className='group/crm-field flex flex-col gap-[7px] min-w-0 [&>label]:text-[length:var(--dir-text-label)] [&>label]:font-medium [&>label]:text-muted-foreground [&>span:first-child]:text-[length:var(--dir-text-label)] [&>span:first-child]:font-medium [&>span:first-child]:text-muted-foreground'
      data-invalid={!!error || undefined}
    >
      <FieldLabel htmlFor={id}>{label}{required && <span aria-hidden='true'>*</span>}</FieldLabel>
      {children({
        id,
        'aria-describedby': error || description ? `${id}-help` : undefined,
        'aria-required': required,
        invalid: !!error,
      })}
      {error
        ? <FieldError id={`${id}-help`}>{error}</FieldError>
        : description
        ? <FieldDescription id={`${id}-help`}>{description}</FieldDescription>
        : null}
    </ShadcnField>
  )
}
