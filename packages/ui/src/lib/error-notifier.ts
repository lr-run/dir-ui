/** Ignores cancellation and avoids notifying twice when the same error bubbles through handlers. */
export function createErrorNotifier(deliver: (message: string) => void) {
  const seen = new WeakSet<object>()
  return (error: unknown, fallback = 'Unable to complete the request. Please try again.') => {
    if (error && typeof error === 'object') {
      if ('name' in error && error.name === 'AbortError' || seen.has(error)) return
      seen.add(error)
    }
    deliver(
      error instanceof Error && error.message ? error.message : typeof error === 'string' && error ? error : fallback,
    )
  }
}
