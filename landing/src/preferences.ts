type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>
type StorageSource = () => PreferenceStorage
const browserStorage: StorageSource = () => globalThis.localStorage

export function readPreference(key: string, source: StorageSource = browserStorage): string | null {
  try {
    return source().getItem(key)
  } catch {
    return null
  }
}
export function writePreference(key: string, value: string, source: StorageSource = browserStorage): void {
  try {
    source().setItem(key, value)
  } catch { /* Preferences must not prevent the app from opening. */ }
}
