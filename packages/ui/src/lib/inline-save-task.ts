export type InlineSaveResult = { status: 'saved' | 'busy' } | { status: 'failed'; error: string }

/** One in-flight write per field. Failures release the lock so the draft can be retried. */
export function createInlineSaveTask() {
  let busy = false
  return {
    isSaving: () => busy,
    async run(write: () => void | Promise<void>): Promise<InlineSaveResult> {
      if (busy) return { status: 'busy' }
      busy = true
      try {
        await write()
        return { status: 'saved' }
      } catch (error) {
        return {
          status: 'failed',
          error: error instanceof Error && error.message ? error.message : 'Unable to save. Please try again.',
        }
      } finally {
        busy = false
      }
    },
  }
}
