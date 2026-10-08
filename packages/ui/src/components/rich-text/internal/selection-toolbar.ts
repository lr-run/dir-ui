/** Keep a selection popup out of an active drag, then read the settled selection. */
export function selectionToolbarSchedule(
  show: () => void,
  hide: () => void,
  requestFrame = (callback: () => void) => requestAnimationFrame(callback),
  cancelFrame = (id: number) => cancelAnimationFrame(id),
) {
  let dragging = false, disposed = false, frame: number | undefined
  const cancel = () => {
    if (frame !== undefined) cancelFrame(frame)
    frame = undefined
  }
  const change = () => {
    if (disposed || dragging) return
    cancel()
    frame = requestFrame(() => {
      frame = undefined
      if (!disposed && !dragging) show()
    })
  }
  return {
    change,
    start() {
      dragging = true
      cancel()
      hide()
    },
    end() {
      if (!dragging) return
      dragging = false
      change()
    },
    cancel() {
      dragging = false
      cancel()
      hide()
    },
    dispose() {
      disposed = true
      cancel()
    },
  }
}
