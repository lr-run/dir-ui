import { ArchiveIcon, ArchiveRestoreIcon } from 'lucide-react'
import { ActionsMenu } from '@/components/crm/components/actions-menu.tsx'
import { Button } from '@/components/ui/button.tsx'

export function RecordArchiveAction({ archived, onArchive }: { archived: boolean; onArchive: () => void }) {
  return archived
    ? (
      <Button size='sm' variant='ghost' onClick={onArchive}>
        <ArchiveRestoreIcon size={14} aria-hidden />Restore
      </Button>
    )
    : (
      <ActionsMenu
        label='Record options'
        items={[{ label: 'Archive record', icon: <ArchiveIcon size={14} aria-hidden />, onClick: onArchive }]}
      />
    )
}
