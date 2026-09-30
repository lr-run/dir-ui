import '@/components/ui/dir-theme.css'
import type { ComponentProps } from 'react'
import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Button } from '@/components/ui/button.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'

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
    <InputPrimitive
      {...common}
      type={type}
      inputMode={props.inputMode ?? (type === 'number' ? 'decimal' : undefined)}
      data-slot='input'
      className={cn(
        "[&[aria-invalid='true']]:[border-color:var(--ui-red)] [&[aria-invalid='true']]:[box-shadow:none] [&[aria-invalid='true']:focus]:[border-color:var(--ui-red)] [&[data-slot='input'][data-slot='input'][readonly]]:[background:var(--ui-subtle)] [&:is(:focus,_:focus-visible)]:[border-color:var(--ui-ring)] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:outline-offset-0 [&:is(:focus,_:focus-visible)]:[box-shadow:none] dark:bg-input/30 border-input focus-visible:border-ring focus-visible:shadow-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-0 aria-invalid:ring-0 md:text-sm w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  )
}

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='input-group'
      role='group'
      className={cn(
        "group/input-group [background:var(--ui-raised)] [&[data-slot]:focus-within]:[border-color:var(--ui-ring)] [&[data-slot]:focus-within]:[outline:none] [&[data-slot]:focus-within]:outline-offset-0 [&[data-slot]:focus-within]:[box-shadow:none] [&[data-slot]:has([aria-invalid='true'])]:[border-color:var(--ui-red)] [&[data-slot]:has([aria-invalid='true'])]:[box-shadow:none] [&[data-slot]:has([aria-invalid='true']):focus-within]:[border-color:var(--ui-red)] [&[data-slot]_:is(input,_textarea):is(:focus,_:focus-visible)]:[border:0] [&[data-slot]_:is(input,_textarea):is(:focus,_:focus-visible)]:[outline:none] [&[data-slot]_:is(input,_textarea):is(:focus,_:focus-visible)]:[box-shadow:none] border-input dark:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-disabled:bg-input/50 dark:has-disabled:bg-input/80 h-8 rounded-lg border transition-colors in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-3 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5 relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
        className,
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  'text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*=size-])]:size-4 flex cursor-text items-center justify-center select-none',
  {
    variants: {
      align: {
        'inline-start': 'pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first',
        'inline-end': 'pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last',
        'block-start':
          'px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start',
        'block-end': 'px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  'gap-2 text-sm flex items-center shadow-none',
  {
    variants: {
      size: {
        xs: 'h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*=size-])]:size-3.5',
        sm: '',
        'icon-xs': 'size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
)

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}:
  & Omit<React.ComponentProps<typeof Button>, 'size' | 'type'>
  & VariantProps<typeof inputGroupButtonVariants>
  & {
    type?: 'button' | 'submit' | 'reset'
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'text-muted-foreground gap-2 text-sm [&_svg:not([class*=size-])]:size-4 flex items-center [&_svg]:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: InputProps) {
  return (
    <Input
      data-slot='input-group-control'
      className={cn(
        'min-w-0 [&:focus]:[outline:none] [&:focus]:[box-shadow:none] [&:focus]:[border:0] [&:focus]:rounded-none [&:focus]:[background:transparent] [&:focus-visible]:[outline:none] [&:focus-visible]:[box-shadow:none] [&:focus-visible]:[border:0] [&:focus-visible]:rounded-none [&:focus-visible]:[background:transparent] rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot='input-group-control'
      className={cn(
        'rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1 resize-none',
        className,
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea }
