import type { FileItem, UploadFile } from '@/lib/file-model.ts'
type Task = { file: File; controller: AbortController; status: FileItem['status'] }
type Options = { upload: UploadFile; onComplete?: (file: FileItem) => void; concurrency: number }
/** Each attempt owns its controller; stale completions cannot replace a retried file. */
export class UploadQueue {
  private tasks = new Map<string, Task>()
  private active = 0
  private disposed = false
  private options: () => Options
  private patch: (id: string, changes: Partial<FileItem>) => void
  constructor(options: () => Options, patch: (id: string, changes: Partial<FileItem>) => void) {
    this.options = options
    this.patch = patch
  }
  add(id: string, file: File) {
    this.tasks.set(id, { file, controller: new AbortController(), status: 'queued' })
  }
  pump() {
    if (this.disposed) return
    for (const [id, task] of this.tasks) {
      if (this.active >= Math.max(1, Math.floor(this.options().concurrency))) break
      if (task.status !== 'queued') continue
      this.active++
      task.status = 'uploading'
      this.patch(id, { status: 'uploading' })
      const current = () => !this.disposed && !task.controller.signal.aborted && this.tasks.get(id) === task
      void Promise.resolve().then(() =>
        this.options().upload(task.file, {
          signal: task.controller.signal,
          onProgress: (progress) => {
            if (current()) this.patch(id, { progress: Math.max(0, Math.min(100, progress)) })
          },
        })
      ).then((result) => {
        if (current()) {
          task.status = 'complete'
          this.patch(id, { ...result, id, status: 'complete', progress: 100 })
          this.options().onComplete?.(result)
        }
      }).catch((error) => {
        if (current()) {
          task.status = 'error'
          this.patch(id, { status: 'error', error: error instanceof Error ? error.message : 'Upload failed.' })
        }
      }).finally(() => {
        this.active--
        this.pump()
      })
    }
  }
  cancel(id: string) {
    const task = this.tasks.get(id)
    if (!task) return
    task.controller.abort()
    task.status = 'canceled'
    this.patch(id, { status: 'canceled' })
    this.pump()
  }
  retry(id: string) {
    const task = this.tasks.get(id)
    if (!task || !['error', 'canceled'].includes(task.status ?? '')) return
    this.add(id, task.file)
    this.patch(id, { status: 'queued', error: undefined, progress: 0 })
    this.pump()
  }
  remove(id: string) {
    this.tasks.get(id)?.controller.abort()
    this.tasks.delete(id)
    this.pump()
  }
  dispose() {
    this.disposed = true
    this.tasks.forEach((task) => task.controller.abort())
    this.tasks.clear()
  }
}
