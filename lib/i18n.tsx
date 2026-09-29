import { createContext, type ReactNode, useContext, useState } from 'react'
export type Language = 'ja' | 'en'
const en: Record<string, string> = {
  '閉じる': 'Close',
  '表示するデータがありません': 'No data to display',
  'ワークスペース': 'Workspace',
  'キャンセル': 'Cancel',
  '読み込み中…': 'Loading…',
  '再試行': 'Retry',
  '処理中…': 'Working…',
}
export const translate = (language: Language, text: string, english?: string) =>
  language === 'ja' ? text : english ?? en[text] ?? text
const Context = createContext({
  language: 'en' as Language,
  setLanguage: (_l: Language) => {},
  t: (text: string, english?: string) => translate('en', text, english),
})
export function I18n({ children, defaultLanguage = 'en' }: { children: ReactNode; defaultLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  return (
    <Context.Provider value={{ language, setLanguage, t: (text, english) => translate(language, text, english) }}>
      {children}
    </Context.Provider>
  )
}
export const useI18n = () => useContext(Context)
