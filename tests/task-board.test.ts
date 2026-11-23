import assert from 'node:assert/strict'
import { filterTasks, moveTask, seedTasks } from '../examples/systems/src/task-board/model.ts'
import { resolveLandingRoute } from '../apps/docs/src/routes.ts'
Deno.test('task board seed respects preview size with distinct IDs', () => {
  for (const count of [0, 5, 25, 100, 1000]) {
    const tasks = seedTasks(count)
    assert.equal(tasks.length, count)
    assert.equal(new Set(tasks.map((task) => task.id)).size, count)
  }
})
Deno.test('task filters combine view, owner, project, and case-insensitive search', () => {
  const tasks = seedTasks(25)
  assert.equal(filterTasks(tasks, ' task-12 ', 'all', '', '')[0]?.id, 'TASK-12')
  assert.equal(filterTasks(tasks, '', 'backlog', '', '').every((task) => task.status === 'backlog'), true)
  const task = tasks[0]!
  assert.deepEqual(filterTasks(tasks, task.id, 'active', task.owner, task.project), [task])
  assert.deepEqual(filterTasks(tasks, task.id, 'active', 'Unknown', ''), [])
})
Deno.test('moving a card updates only the target and appends history once', () => {
  const before = seedTasks(5), moved = moveTask(before, before[0]!.id, 'done')
  assert.equal(before[0]!.status, 'todo')
  assert.equal(moved[0]!.status, 'done')
  assert.equal(moved[0]!.activity.length, before[0]!.activity.length + 1)
  assert.equal(moved[1], before[1])
  assert.deepEqual(moveTask(moved, moved[0]!.id, 'done'), moved)
})
Deno.test('task board example and source routes resolve', () => {
  for (const suffix of ['', '/code']) {
    assert.equal(
      resolveLandingRoute(`https://example.com/examples/task-board${suffix}`, 'https://example.com/').id,
      `examples/task-board${suffix}`,
    )
  }
})
