import assert from 'node:assert/strict'
import { createSaveGate, validateNextAction, workflows } from '../examples/workflow/model.ts'

Deno.test('every business requires an explicit completion condition before planning', () => {
  for (const workflow of workflows) {
    const value = workflow.records[0]!.next
    assert.equal(validateNextAction(value).completion, 'This field is required.')
    assert.deepEqual(validateNextAction({ ...value, completion: 'Recipient confirms receipt' }), {})
    assert.equal(validateNextAction({ ...value, owner: '  ' }).owner, 'This field is required.')
  }
})
Deno.test('save gate prevents duplicate submissions and unlocks after failure for retry', async () => {
  const gate = createSaveGate()
  let release!: () => void
  let writes = 0
  const first = gate(async () => {
    writes++
    await new Promise<void>((resolve) => {
      release = resolve
    })
  })
  assert.equal(
    await gate(() => {
      writes++
      return Promise.resolve()
    }),
    false,
  )
  release()
  assert.equal(await first, true)
  assert.equal(writes, 1)
  await assert.rejects(() => gate(() => Promise.reject(new Error('offline'))), /offline/)
  assert.equal(
    await gate(() => {
      writes++
      return Promise.resolve()
    }),
    true,
  )
  assert.equal(writes, 2)
})
