import { useEffect, useRef } from 'react'
import { FileUpload } from '@dir/ui/components/collections/files.tsx'
import type { ComponentDoc } from './index.ts'

export function FileUploadDemo() {
  const urls = useRef<string[]>([])
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])
  return (
    <div className='w-full max-w-md'>
      <FileUpload
        label='Receipts'
        accept='.pdf,.png,.jpg'
        maxSize={8 * 1024 * 1024}
        upload={async (file, { signal, onProgress }) => {
          for (let step = 1; step <= 4; step++) {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, 180)
              signal.addEventListener('abort', () => {
                clearTimeout(timer)
                reject(new Error('Canceled'))
              }, { once: true })
            })
            onProgress(step * 25)
          }
          if (file.name.includes('fail')) throw new Error('Upload failed. Retry.')
          const url = URL.createObjectURL(file)
          urls.current.push(url)
          return { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, url }
        }}
      />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: FileUploadDemo,
  sections: [],
}
