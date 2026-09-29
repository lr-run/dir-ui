import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../ui/index.tsx'
import { List, ListItem } from '../ui/list.tsx'
import { type FileItem, formatFileSize, type UploadFile, validateFile } from './file-model.ts'
import { UploadQueue } from './upload-queue.ts'
export { formatFileSize, validateFile } from './file-model.ts'
export type { FileItem, UploadFile } from './file-model.ts'
function UploadItems(
  { files, onRemove, onRetry, onCancel, disabled }: {
    files: readonly FileItem[]
    onRemove?: (id: string) => void
    onRetry?: (id: string) => void
    onCancel?: (id: string) => void
    disabled?: boolean
  },
) {
  return (
    <List aria-label='Files' empty='No files attached.'>
      {files.length
        ? files.map((file) => (
          <ListItem
            key={file.id}
            title={file.url ? <a href={file.url} target='_blank' rel='noreferrer'>{file.name}</a> : file.name}
            leading={<span aria-hidden>▤</span>}
            meta={`${formatFileSize(file.size)}${file.type ? ` · ${file.type}` : ''}`}
            actions={
              <>
                {file.url && <a href={file.url} download={file.name}>Download</a>}
                {(file.status === 'uploading' || file.status === 'queued') && onCancel && (
                  <Button
                    disabled={disabled}
                    variant='ghost'
                    onClick={() => onCancel(file.id)}
                  >
                    Cancel
                  </Button>
                )}
                {(file.status === 'error' || file.status === 'canceled') && onRetry && (
                  <Button
                    disabled={disabled}
                    variant='ghost'
                    onClick={() => onRetry(file.id)}
                  >
                    Retry
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant='ghost'
                    disabled={disabled || file.status === 'uploading'}
                    onClick={() => onRemove(file.id)}
                  >
                    Remove
                  </Button>
                )}
              </>
            }
          >
            <span className='text-muted-foreground text-[11px]' role='status'>
              {file.error || (file.status === 'queued' ? 'Queued' : file.status === 'canceled' ? 'Canceled' : '')}
            </span>
            {file.status === 'uploading' && (
              <progress aria-label={`Uploading ${file.name}`} value={file.progress ?? 0} max={100} />
            )}
          </ListItem>
        ))
        : null}
    </List>
  )
}
export type FileUploadProps = {
  upload: UploadFile
  onComplete?: (file: FileItem) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  label?: string
  concurrency?: number
}
export function FileUpload(
  {
    upload,
    onComplete,
    accept,
    maxSize = 20 * 1024 * 1024,
    multiple = true,
    disabled,
    label = 'Attach files',
    concurrency = 2,
  }: FileUploadProps,
) {
  const id = useId(),
    [files, setFiles] = useState<FileItem[]>([]),
    [dragging, setDragging] = useState(false),
    [errors, setErrors] = useState<string[]>([])
  const callbacks = useRef({ upload, onComplete, concurrency })
  const queue = useRef<UploadQueue | null>(null)
  useEffect(() => {
    callbacks.current = { upload, onComplete, concurrency }
  }, [upload, onComplete, concurrency])
  useEffect(() => {
    const instance = new UploadQueue(
      () => callbacks.current,
      (id, changes) => setFiles((old) => old.map((file) => file.id === id ? { ...file, ...changes } : file)),
    )
    queue.current = instance
    return () => {
      instance.dispose()
      queue.current = null
    }
  }, [])
  const add = (incoming: File[]) => {
    if (disabled) return
    const errors: string[] = [], next: FileItem[] = []
    for (const file of multiple ? incoming : incoming.slice(0, 1)) {
      const error = validateFile(file, accept, maxSize)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        continue
      }
      const id = crypto.randomUUID()
      queue.current?.add(id, file)
      next.push({ id, name: file.name, size: file.size, type: file.type, status: 'queued', progress: 0 })
    }
    setErrors(errors)
    setFiles((old) => [...old, ...next])
    queue.current?.pump()
  }
  return (
    <div className='[&_progress]:w-full [&_progress]:h-[4px] [&_progress]:block [&_progress]:mt-[8px]'>
      <label
        htmlFor={id}
        className="relative flex flex-col items-center gap-[6px] p-[28px_20px] [border:1px_dashed_var(--ui-border)] rounded-[8px] cursor-pointer text-center text-[13px] [&_input]:absolute [&_input]:inset-0 [&_input]:opacity-0 [&_input]:w-full [&_input]:h-full [&_input]:[cursor:inherit] [&_small]:text-muted-foreground [&_small]:text-[11px] [&:focus-within]:[border:1px_solid_var(--ui-blue)] [&[data-dragging]]:[background:var(--ui-hover)] [&[aria-disabled='true']]:opacity-50 [&[aria-disabled='true']]:cursor-default"
        data-dragging={dragging || undefined}
        aria-disabled={disabled}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          add(Array.from(e.dataTransfer.files))
        }}
      >
        <span aria-hidden>↑</span>
        <strong>{label}</strong>
        <span>Choose files or drop them here</span>
        <small>{accept || 'Any file type'} · Up to {formatFileSize(maxSize)} per file</small>
        <input
          id={id}
          type='file'
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            add(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
      </label>
      {errors.length > 0 && <div role='alert'>{errors.map((error) => <p key={error}>{error}</p>)}</div>}
      <UploadItems
        files={files}
        disabled={disabled}
        onCancel={(id) => queue.current?.cancel(id)}
        onRetry={(id) => queue.current?.retry(id)}
        onRemove={(id) => {
          queue.current?.remove(id)
          setFiles((old) => old.filter((file) => file.id !== id))
        }}
      />
    </div>
  )
}
