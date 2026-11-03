// Members, choices and date helpers shared by the daily report screens.
import type { Choice } from '@/lib/choice-types.ts'
import type { KitRow } from '@/components/systems/kit/types.ts'

export const users: Choice[] = [
  { value: 'u1', label: 'Mika Sato' },
  { value: 'u2', label: 'Ken Ito' },
  { value: 'u3', label: 'Aya Mori' },
  { value: 'u4', label: 'Daichi Kato' },
  { value: 'u5', label: 'Yuna Kobayashi' },
  { value: 'u6', label: 'Sota Nakamura' },
  { value: 'u7', label: 'Hana Yoshida' },
  { value: 'u8', label: 'Riku Yamamoto' },
]
export const me = 'u1'
export const moods: Choice[] = [
  { value: 'great', label: 'Great', color: 'var(--ui-green)' },
  { value: 'good', label: 'Good', color: 'var(--ui-blue)' },
  { value: 'okay', label: 'Okay', color: 'var(--ui-muted)' },
  { value: 'tired', label: 'Tired', color: 'var(--ui-amber)' },
  { value: 'struggling', label: 'Struggling', color: 'var(--ui-red)' },
]
export const reviews: Choice[] = [
  { value: 'submitted', label: 'Submitted', color: 'var(--ui-blue)' },
  { value: 'reviewed', label: 'Reviewed', color: 'var(--ui-green)' },
  { value: 'follow-up', label: 'Needs follow-up', color: 'var(--ui-amber)' },
]
export const projectStatus: Choice[] = [
  { value: 'active', label: 'Active', color: 'var(--ui-green)' },
  { value: 'paused', label: 'On hold', color: 'var(--ui-amber)' },
  { value: 'done', label: 'Done', color: 'var(--ui-muted)' },
]
export const blockerChoice: Choice = { value: 'blocker', label: 'Blocker', color: 'var(--ui-amber)' }

export const choice = (items: Choice[], value: unknown) => items.find((item) => item.value === value)
export const memberName = (id: unknown) => choice(users, id)?.label ?? ''
export const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
export const values = (row: KitRow) => row.record.values

/** Today as an ISO date in the viewer's time zone. */
export function today() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}
const utc = (date: string) => new Date(`${date}T00:00:00Z`)
export const addDays = (date: string, days: number) =>
  new Date(utc(date).getTime() + days * 86400000).toISOString().slice(0, 10)
export const isWeekend = (date: string) => [0, 6].includes(utc(date).getUTCDay())
/** Monday of the week that contains `date`. */
export const mondayOf = (date: string) => addDays(date, -((utc(date).getUTCDay() + 6) % 7))
export const shortDate = (date: string) =>
  utc(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
export const longDate = (date: string) =>
  utc(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })
/** `Oct 26 – 30`, or `Oct 27 – Nov 2` across a month. */
export function weekLabel(monday: string) {
  const friday = addDays(monday, 4)
  const sameMonth = monday.slice(0, 7) === friday.slice(0, 7)
  return `${shortDate(monday)} – ${sameMonth ? Number(friday.slice(8)) : shortDate(friday)}`
}
const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
export function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  if (Math.abs(minutes) < 60 * 24) return relative.format(Math.round(minutes / 60), 'hour')
  if (Math.abs(minutes) < 60 * 24 * 30) return relative.format(Math.round(minutes / 1440), 'day')
  return relative.format(Math.round(minutes / 43200), 'month')
}
/** Live reports, newest report date first, then newest post. */
export function newestFirst(rows: KitRow[]) {
  return rows.filter((row) => !row.archivedAt).sort((a, b) =>
    String(values(b).date).localeCompare(String(values(a).date)) || b.createdAt.localeCompare(a.createdAt)
  )
}
