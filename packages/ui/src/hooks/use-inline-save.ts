import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { useEffect, useRef, useState } from 'react'
import { createInlineSaveTask } from '@/lib/inline-save-task.ts'

export type InlineSaveHandler<T> = (value: T) => void | Promise<void>

export function useInlineSave() {
  const notifyError = useErrorNotification()
  const task = useRef(createInlineSaveTask())
  const mounted = useRef(true)
  const [saving, setSaving] = useState(false), [error, setError] = useState('')
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const save = async (write: () => void | Promise<void>) => {
    if (task.current.isSaving()) return false
    setSaving(true)
    setError('')
    const result = await task.current.run(async () => {
      try {
        await write()
      } catch (error) {
        notifyError?.(error, 'Unable to save. Please try again.')
        throw error
      }
    })
    if (mounted.current) {
      setSaving(false)
      setError(result.status === 'failed' && !notifyError ? result.error : '')
    }
    return mounted.current && result.status === 'saved'
  }
  return { saving, error, save, isSaving: task.current.isSaving, setError, clearError: () => setError('') }
}
