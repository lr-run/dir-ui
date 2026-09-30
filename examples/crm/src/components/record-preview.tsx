import { ArchiveIcon, ChevronDownIcon, Maximize2Icon, XIcon } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { SheetBody, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet.tsx'
import { DetailFields } from '@/components/crm/screens/detail-page.tsx'
import type { DetailRouteProps, RecordField } from '@/components/crm/types.ts'
export function RecordPreview(
  { record, fields, onChange, onArchive, position, total, onPrevious, onNext, onOpen }:
    & Pick<DetailRouteProps, 'record' | 'onChange' | 'onArchive'>
    & {
      fields: RecordField[]
      position: number
      total: number
      onPrevious?: () => void
      onNext?: () => void
      onOpen: () => void
    },
) {
  return (
    <SheetContent backdrop={false} className='group/screen-record-sheet group/record-preview'>
      <SheetHeader>
        <div className='flex w-full items-center gap-1'>
          <SheetClose
            render={
              <IconButton variant='ghost' label='Close preview'>
                <XIcon size={16} />
              </IconButton>
            }
          />
          <IconButton variant='ghost' label='Previous record' disabled={!onPrevious} onClick={onPrevious}>
            <ChevronDownIcon size={16} className='rotate-180' />
          </IconButton>
          <IconButton variant='ghost' label='Next record' disabled={!onNext} onClick={onNext}>
            <ChevronDownIcon size={16} />
          </IconButton>
          <span className='flex-1 text-xs text-muted-foreground'>{position} of {total}</span>
          <IconButton variant='ghost' label='Open full record' onClick={onOpen}>
            <Maximize2Icon size={16} />
          </IconButton>
        </div>
        <SheetTitle className='sr-only'>{record.name} preview</SheetTitle>
      </SheetHeader>
      <SheetBody>
        <div className='p-5'>
          <div className='mb-6 flex items-center gap-3'>
            <span className='grid size-9 shrink-0 place-items-center rounded-lg border border-border'>
              {record.name[0]}
            </span>
            <h2 className='flex-1 text-base font-semibold'>{record.name}</h2>
            <IconButton label={record.archivedAt ? 'Restore record' : 'Archive record'} onClick={onArchive}>
              <ArchiveIcon size={16} />
            </IconButton>
          </div>
          {record.archivedAt && <p className='mb-4 text-xs text-muted-foreground'>Archived · Restore to edit.</p>}
          <DetailFields fields={fields} record={record} onChange={onChange} />
        </div>
      </SheetBody>
    </SheetContent>
  )
}
