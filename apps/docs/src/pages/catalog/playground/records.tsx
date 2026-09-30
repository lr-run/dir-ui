import type { PreviewProps } from './model.ts'
import { RecordListPreview } from './record-list.tsx'
export default function RecordsPreview({ values, update }: PreviewProps) {
  return <RecordListPreview values={values} update={update} />
}
