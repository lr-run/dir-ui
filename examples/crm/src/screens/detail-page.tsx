import { Trash2Icon } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button.tsx'
import type { ReactNode } from 'react'

export type DetailContext<R, Change> = {
  record: R
  onChange: (change: Change, label: string) => void
}
export type DetailField<R, Change> = {
  id: string
  label: string
  render: (context: DetailContext<R, Change>) => ReactNode
}

export function DetailPage<R, Change>(
  { title, fields, record, onChange, onDelete, children }: DetailContext<R, Change> & {
    title: string
    fields: readonly DetailField<R, Change>[]
    onDelete: () => void
    children?: ReactNode
  },
) {
  const context = { record, onChange }
  return (
    <div className='grid grid-cols-[minmax(240px,_310px)_minmax(0,_1fr)] min-h-full [@media(max-width:_1000px)]:grid-cols-[minmax(220px,_260px)_minmax(0,_1fr)] [@media(max-width:_800px)]:grid-cols-[minmax(0,_1fr)]'>
      <section
        className='p-[22px_16px] [border-right:1px_solid_var(--ui-border)] min-w-0 [&_h3]:text-[12px] [&_h3]:text-muted-foreground [&_h3]:font-medium [&_h3]:m-[0_0_16px] [@media(max-width:_800px)]:[border-right:0] [@media(max-width:_800px)]:p-[20px_16px]'
        aria-label='Record properties'
      >
        <div className='flex items-center gap-[9px] mb-[24px] [&_h2]:text-[16px] [&_h2]:[font-weight:550] [&_h2]:m-0 [&_h2]:[overflow-wrap:anywhere] [&_h2]:flex-1'>
          <span className='w-[34px] h-[34px] [border:1px_solid_var(--ui-border)] rounded-[8px] grid [place-items:center] font-semibold shrink-0'>
            {title[0]}
          </span>
          <h2>{title}</h2>
          <IconButton label='Delete record' onClick={onDelete}>
            <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </IconButton>
        </div>
        <h3>Record details</h3>
        <DetailFields fields={fields} {...context} />
      </section>
      <section
        className="[&_h3]:text-[12px] [&_h3]:text-muted-foreground [&_h3]:font-medium [&_h3]:m-[0_0_16px] p-[12px_20px_28px] min-w-0 [@media(max-width:_800px)]:p-[12px_16px_24px] [&_[role='tabpanel']]:pt-[24px] [&_[class~='group/ui-list']]:text-[12px]"
        aria-label='Record content'
      >
        {children}
      </section>
    </div>
  )
}

export function DetailFields<R, Change>({ fields, ...context }: DetailContext<R, Change> & {
  fields: readonly DetailField<R, Change>[]
}) {
  return (
    <dl className='group/screen-field-list grid gap-[10px] m-0 [&>div]:grid [&>div]:grid-cols-[76px_minmax(0,_1fr)] [&>div]:items-center [&>div]:gap-[8px] [&>div]:min-h-[32px] [&_dt]:text-muted-foreground [&_dt]:text-[12px] [&_dd]:min-w-0 [&_dd]:m-0 [&_dd]:text-[13px]'>
      {fields.map((field) => (
        <div key={field.id}>
          <dt>{field.label}</dt>
          <dd>{field.render(context)}</dd>
        </div>
      ))}
    </dl>
  )
}
