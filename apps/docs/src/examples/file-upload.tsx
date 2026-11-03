import { useEffect, useRef } from 'react'
import { FileUpload } from '@dir/ui/components/collections/files.tsx'
import { RichText } from '@dir/ui/components/ui/rich-text.tsx'
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
export function RichTextDemo() {
  return (
    <div className='w-full max-w-md'>
      <RichText
        label='Notes'
        initialText='Hokuto Manufacturing PoC expands to two lines. Maintenance matters more than price.'
      />
    </div>
  )
}
export const doc: ComponentDoc = {
  hero: FileUploadDemo,
  sections: [
    {
      id: 'rich-text',
      title: 'Rich Text',
      description: '`RichText` is an uncontrolled editor for formatted notes; it loads lazily.',
      example: RichTextDemo,
    },
  ],
}
