export type FileItem = {
  id: string
  name: string
  size: number
  type?: string
  url?: string
  status?: 'uploading' | 'complete' | 'error' | 'canceled' | 'queued'
  progress?: number
  error?: string
}
export function formatFileSize(bytes: number) {
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`
}
export function validateFile(
  file: Pick<File, 'name' | 'size' | 'type'>,
  accept?: string,
  maxSize?: number,
): string | undefined {
  if (maxSize !== undefined && file.size > maxSize) return `Exceeds ${formatFileSize(maxSize)}.`
  if (
    accept && !accept.split(',').some((raw) => {
      const rule = raw.trim().toLowerCase()
      return rule.startsWith('.')
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith('/*')
        ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
        : file.type.toLowerCase() === rule
    })
  ) return 'Unsupported file type.'
}
export type UploadFile = (
  file: File,
  context: { signal: AbortSignal; onProgress: (percent: number) => void },
) => Promise<FileItem>
