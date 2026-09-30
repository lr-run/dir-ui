import { ChevronDownIcon, ClockIcon, Maximize2Icon, TargetIcon, Trash2Icon, UserRoundIcon, XIcon } from 'lucide-react'
import { IconButton } from '../../../components/ui/icon-button.tsx'
import { SheetBody, SheetClose, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet.tsx'
import { RecordNotes } from './record-notes.tsx'
import { InlineCombobox } from '../../../components/ui/inline-inputs.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs.tsx'
import { DetailFields } from '../screens/detail-page.tsx'
import type { DetailField } from '../screens/detail-page.tsx'
import type { RecordChange } from '../types.ts'
import { examples, owners } from '../example/data.ts'
import type { ExampleKind, ExampleRecord } from '../types.ts'
export function RecordPreview(
  { kind, fields, record, position, total, onPrevious, onNext, onOpen, onDelete, onChange }: {
    kind: ExampleKind
    fields: readonly DetailField<ExampleRecord, RecordChange>[]
    record: ExampleRecord
    position: number
    total: number
    onPrevious?: () => void
    onNext?: () => void
    onOpen: () => void
    onDelete: () => void
    onChange: (change: RecordChange, label: string) => void
  },
) {
  const config = examples[kind]
  return (
    <SheetContent
      className="group/screen-record-sheet group/record-preview [&_[class~='group/crm-sheet-header']]:min-h-[44px] [&_[class~='group/crm-sheet-header']]:p-[6px_10px] [&_[class~='group/crm-sheet-header']]:gap-[4px] [&_[class~='group/crm-sheet-header']>button]:ml-0 [&_[class~='group/crm-icon-button']]:w-[28px] [&_[class~='group/crm-icon-button']]:h-[28px] [&_[class~='group/crm-icon-button']]:text-muted-foreground [&_[class~='group/screen-field-list']]:gap-[6px] [&_[class~='group/screen-field-list']>div]:grid-cols-[112px_minmax(0,_1fr)] [@media(max-width:_480px)]:[&_[class~='group/screen-field-list']>div]:grid-cols-[86px_minmax(0,_1fr)] [&_[class~='group/crm-sheet-header']>button:last-of-type]:ml-auto [&_[class~='group/inline-search']_[data-slot='input-group']]:[border-color:transparent] [&_[class~='group/inline-search']_[data-slot='input-group']]:[background:transparent] [&_[class~='group/inline-search']_[data-slot='input-group']]:[box-shadow:none] [&_[class~='group/inline-search']:hover_[data-slot='input-group']]:[background:var(--ui-hover)] [&_[class~='group/inline-search']_[data-slot='input-group']:focus-within]:[border-color:var(--ui-ring)]"
      backdrop={false}
    >
      <SheetHeader>
        <SheetClose render={<IconButton variant='ghost' label='Close preview' />}>
          <XIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        </SheetClose>
        <IconButton variant='ghost' label='Previous record' disabled={!onPrevious} onClick={onPrevious}>
          <span className='flex [transform:rotate(180deg)]'>
            <ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </span>
        </IconButton>
        <IconButton variant='ghost' label='Next record' disabled={!onNext} onClick={onNext}>
          <ChevronDownIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        </IconButton>
        <span className='text-[11px] text-muted-foreground ml-[5px] overflow-hidden text-ellipsis whitespace-nowrap'>
          {position} of {total} in {config.title}
        </span>
        <IconButton variant='ghost' label='Open full record' onClick={onOpen}>
          <Maximize2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
        </IconButton>
        <SheetTitle className='[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]'>
          {record.name} preview
        </SheetTitle>
      </SheetHeader>
      <SheetBody>
        <div className='flex items-center gap-[12px] p-[24px_20px_20px] [&>div]:min-w-0 [&>div]:flex-1 [&_h2]:m-0 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:[overflow-wrap:anywhere] [&_h2]:tracking-[-.3px] [&_p]:text-[12px] [&_p]:text-muted-foreground [&_p]:m-[5px_0_0] [&_p]:[overflow-wrap:anywhere] [@media(max-width:_480px)]:p-[20px_16px]'>
          <span className='w-[38px] h-[38px] [border:1px_solid_var(--ui-border)] [background:var(--ui-raised)] rounded-[10px] grid [place-items:center] text-[18px] [font-weight:550] shrink-0'>
            {record.name.slice(0, 1)}
          </span>
          <div>
            <h2>{record.name}</h2>
            <p>{kind === 'companies' ? record.domain : record.company || config.singular}</p>
          </div>
          <IconButton variant='ghost' label='Delete record' onClick={onDelete}>
            <Trash2Icon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
          </IconButton>
        </div>
        <Tabs
          defaultValue='overview'
          key={record.id}
          className="[&>[role='tablist']]:w-full [&>[role='tablist']]:p-[0_20px] [&>[role='tablist']]:[border-bottom:1px_solid_var(--ui-border)] [&>[role='tablist']]:justify-start [&>[role='tablist']]:gap-[20px] [&>[role='tabpanel']]:p-[0_20px_24px] [@media(max-width:_480px)]:[&>[role='tablist']]:[padding-inline:16px] [@media(max-width:_480px)]:[&>[role='tabpanel']]:[padding-inline:16px] [&_[role='tab']]:[flex:0_0_auto] [&_[role='tab']]:text-[12px] [&_[role='tab']]:[padding-inline:0]"
        >
          <TabsList aria-label='Preview sections'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
            <TabsTrigger value='notes'>Notes</TabsTrigger>
          </TabsList>
          <TabsContent value='overview'>
            <section
              className='mt-[22px] min-w-0 [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-muted-foreground [&_h3]:m-[0_0_12px]'
              aria-label='Highlights'
            >
              <h3>Highlights</h3>
              <div className='grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[8px] [&>div]:[border:1px_solid_var(--ui-border)] [&>div]:rounded-[8px] [&>div]:p-[12px_10px_8px] [&>div]:min-w-0'>
                <div>
                  <span className='flex justify-between items-center text-[11px] text-muted-foreground m-[0_4px_12px] [&_svg]:w-[14px] [&_svg]:h-[14px]'>
                    Status<TargetIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                  </span>
                  <InlineCombobox
                    label='Status'
                    clearable={false}
                    value={record.status}
                    items={config.statuses.map((value) => ({ value, label: value }))}
                    onValueChange={(status) => {
                      if (status) onChange({ status }, 'Status')
                    }}
                  />
                </div>
                <div>
                  <span className='flex justify-between items-center text-[11px] text-muted-foreground m-[0_4px_12px] [&_svg]:w-[14px] [&_svg]:h-[14px]'>
                    Owner<UserRoundIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
                  </span>
                  <InlineCombobox
                    label='Owner'
                    clearable={false}
                    value={record.owner}
                    items={owners.map((value) => ({ value, label: value }))}
                    onValueChange={(owner) => {
                      if (owner) onChange({ owner }, 'Owner')
                    }}
                  />
                </div>
              </div>
            </section>
            <section
              className='mt-[22px] min-w-0 [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-muted-foreground [&_h3]:m-[0_0_12px]'
              aria-label='Record details'
            >
              <h3>Record details</h3>
              <DetailFields fields={fields} record={record} onChange={onChange} />
            </section>
            <section
              className='mt-[22px] min-w-0 [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-muted-foreground [&_h3]:m-[0_0_12px]'
              aria-label='Recent activity'
            >
              <h3>Recent activity</h3>
              <PreviewActivity events={record.activity.slice(0, 3)} />
            </section>
          </TabsContent>
          <TabsContent value='activity'>
            <section className='mt-[22px] min-w-0 [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-muted-foreground [&_h3]:m-[0_0_12px]'>
              <h3>Activity</h3>
              <PreviewActivity events={record.activity} />
            </section>
          </TabsContent>
          <TabsContent value='notes'>
            <section className='mt-[22px] min-w-0 [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:text-muted-foreground [&_h3]:m-[0_0_12px]'>
              <RecordNotes
                key={record.id}
                notes={record.notes}
                onChange={(notes, label) => onChange({ notes }, label)}
              />
            </section>
          </TabsContent>
        </Tabs>
      </SheetBody>
    </SheetContent>
  )
}
function PreviewActivity({ events }: { events: ExampleRecord['activity'] }) {
  return (
    <ol className='p-0 m-0 list-none [&_li]:flex [&_li]:items-start [&_li]:gap-[10px] [&_li]:p-[8px_0] [&_p]:m-[0_0_5px] [&_p]:text-[12px] [&_li>div>span]:text-[11px] [&_li>div>span]:text-muted-foreground'>
      {events.length
        ? events.map((event) => (
          <li key={event.id}>
            <span className='grid [place-items:center] w-[26px] h-[26px] [border:1px_solid_var(--ui-border)] rounded-[50%] text-muted-foreground shrink-0 [&_svg]:w-[13px] [&_svg]:h-[13px]'>
              <ClockIcon size={16} strokeWidth={1.5} aria-hidden='true' className='shrink-0' />
            </span>
            <div>
              <p>{event.title}</p>
              <span>{event.time}</span>
            </div>
          </li>
        ))
        : <li className='text-[11px] text-muted-foreground'>No activity yet.</li>}
    </ol>
  )
}
