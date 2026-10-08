import { strict as assert } from 'node:assert'
import { selectionToolbarSchedule } from '../src/components/rich-text/internal/selection-toolbar.ts'
function setup() {
  let id = 0
  const frames = new Map<number, () => void>(), events: string[] = []
  const state = selectionToolbarSchedule(
    () => events.push('show'),
    () => events.push('hide'),
    (callback) => {
      frames.set(++id, callback)
      return id
    },
    (key) => {
      frames.delete(key)
    },
  )
  const flush = () => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((fn) => fn())
  }
  return { state, events, flush, frames }
}
Deno.test('mouse drag stays closed until release, even when final selection does not emit another update', () => {
  const { state, events, flush } = setup()
  state.start()
  state.change()
  flush()
  state.change()
  flush()
  assert.deepEqual(events, ['hide'])
  state.end()
  assert.deepEqual(events, ['hide'])
  flush()
  assert.deepEqual(events, ['hide', 'show'])
})
Deno.test('reselecting cancels a pending popup; keyboard updates coalesce and outside releases do not reopen', () => {
  const { state, events, flush, frames } = setup()
  state.change()
  state.change()
  assert.equal(frames.size, 1)
  state.start()
  flush()
  assert.deepEqual(events, ['hide'])
  state.end()
  flush()
  assert.deepEqual(events, ['hide', 'show'])
  state.end()
  flush()
  assert.deepEqual(events, ['hide', 'show'])
  state.change()
  state.change()
  flush()
  assert.deepEqual(events, ['hide', 'show', 'show'])
})
Deno.test('cancelled drag and destroyed editor cannot display delayed popups', () => {
  const { state, events, flush } = setup()
  state.start()
  state.end()
  state.cancel()
  flush()
  assert.deepEqual(events, ['hide', 'hide'])
  state.change()
  state.dispose()
  state.change()
  flush()
  assert.deepEqual(events, ['hide', 'hide'])
})
