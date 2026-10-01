/** Parse a date-only value in local time, without UTC conversion or calendar rollover. */
export function calendarDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value)
  if (!match) return
  const year = Number(match[1]), month = Number(match[2]) - 1, day = Number(match[3])
  const date = new Date(0)
  date.setFullYear(year, month, day)
  date.setHours(0, 0, 0, 0)
  if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) return date
}

/** Keep wall-clock time when picking a new day; clamp boundary-day times to native limits. */
export function calendarInputValue(
  date: Date,
  previous: string,
  withTime: boolean,
  min?: string | number,
  max?: string | number,
) {
  const day = [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
  if (!withTime) return day
  let next = day + 'T' + (previous.split('T')[1] || '09:00')
  if (typeof min === 'string' && min.startsWith(day + 'T') && next < min) next = min
  if (typeof max === 'string' && max.startsWith(day + 'T') && next > max) next = max
  return next
}
