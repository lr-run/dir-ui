import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Checkbox } from '@base-ui/react/checkbox'
export { Button } from '@base-ui/react/button'
export declare function I(props: { name: string }): ReactElement
export declare function Graphic(props: { html: string }): ReactElement
export declare function Hint(props: { label: ReactNode; children: ReactElement }): ReactElement
export declare function Choice(props: {
  id?: string
  label: string
  value: string | null
  onChange: (value: string | null) => void
  items: (string | { label: string; value: string })[]
  prefix?: ReactNode
  className?: string
  disabled?: boolean
}): ReactElement
export declare function Check(props: ComponentProps<typeof Checkbox.Root> & { label: string }): ReactElement
export declare function Theme(props: {
  value: 'light' | 'dark' | 'system'
  onChange: (value: 'light' | 'dark' | 'system') => void
}): ReactElement
export declare function Toasts(): ReactElement
