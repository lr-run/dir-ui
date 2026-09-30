import { createContext, type ReactNode, useContext } from 'react'
export type NotifyError = (error: unknown, fallback?: string) => void
const ErrorNotifications = createContext<NotifyError | null>(null)
/** Optional application-level policy. Components retain inline errors without this provider. */
export function ErrorNotificationProvider({ onError, children }: { onError: NotifyError; children: ReactNode }) {
  return <ErrorNotifications.Provider value={onError}>{children}</ErrorNotifications.Provider>
}
export function useErrorNotification() {
  return useContext(ErrorNotifications)
}
