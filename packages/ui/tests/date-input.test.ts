import assert from 'node:assert/strict'
import { calendarDate, calendarInputValue } from '../src/lib/date-input.ts'

Deno.test('calendar parses local dates without UTC shifts or invalid day rollover', () => {
  for (const value of ['2028-02-29', '2026-01-01', '2026-12-31']) {
    const date = calendarDate(value)!
    assert.ok(date)
    assert.equal(calendarInputValue(date, '', false), value)
    assert.equal(date.getHours(), 0)
  }
  for (const value of ['', '2026-02-29', '2026-02-31', '2026-13-01', '2026-00-01', '2026-01-00']) {
    assert.equal(calendarDate(value), undefined)
  }
})

Deno.test('calendar retains datetime precision and respects time bounds on boundary days', () => {
  const date = calendarDate('2026-10-02')!
  assert.equal(calendarInputValue(date, '2026-09-30T14:35:12', true), '2026-10-02T14:35:12')
  assert.equal(calendarInputValue(date, '', true), '2026-10-02T09:00')
  assert.equal(calendarInputValue(date, '', true, '2026-10-02T12:00'), '2026-10-02T12:00')
  assert.equal(calendarInputValue(date, '2026-09-30T20:00', true, undefined, '2026-10-02T17:00'), '2026-10-02T17:00')
  assert.equal(calendarInputValue(date, '2026-09-30T14:35', false), '2026-10-02')
})
