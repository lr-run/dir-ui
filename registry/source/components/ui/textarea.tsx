import '@/components/ui/dir-theme.css'
import * as React from 'react'
import { cn } from 'cn'

function Textarea(
  { className, invalid, disabled, readOnly, ...props }: React.ComponentProps<'textarea'> & { invalid?: boolean },
) {
  return (
    <textarea
      data-slot='textarea'
      disabled={disabled || readOnly}
      aria-invalid={invalid || props['aria-invalid']}
      className={cn(
        "[&[aria-invalid='true']]:[border-color:var(--ui-red)] [&[aria-invalid='true']]:[box-shadow:none] [&[aria-invalid='true']:focus]:[border-color:var(--ui-red)] [&:is(:focus,_:focus-visible)]:[border-color:var(--ui-ring)] [&:is(:focus,_:focus-visible)]:[outline:none] [&:is(:focus,_:focus-visible)]:outline-offset-0 [&:is(:focus,_:focus-visible)]:[box-shadow:none] border-input dark:bg-input/30 focus-visible:border-ring focus-visible:shadow-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:ring-0 aria-invalid:ring-0 md:text-sm flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
