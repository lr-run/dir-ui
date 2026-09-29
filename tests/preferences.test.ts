import { readPreference, writePreference } from '../landing/src/preferences.ts'
Deno.test('unavailable or denied browser storage cannot interrupt startup', () => {
  const denied = () => {
    throw new DOMException('Access denied', 'SecurityError')
  }
  if (readPreference('language', denied) !== null) throw new Error('Must use default preference')
  writePreference('language', 'ja', denied)
  const unavailable = () => ({
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('quota')
    },
  })
  if (readPreference('language', unavailable) !== null) throw new Error('Must use default preference')
  writePreference('language', 'ja', unavailable)
})
Deno.test('available storage retains user preferences', () => {
  const values = new Map<string, string>()
  const source = () => ({
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  })
  writePreference('language', 'en', source)
  if (readPreference('language', source) !== 'en') throw new Error('Preference was not saved')
})
