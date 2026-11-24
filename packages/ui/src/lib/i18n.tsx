import { createContext, type ReactNode, useContext, useState } from 'react'
export type Language = 'ja' | 'en'
/** Every string passes its Japanese and English text; nothing is looked up, so a missing translation fails type-check. */
export const translate = (language: Language, text: string, english: string) => language === 'ja' ? text : english
const Context = createContext({
  language: 'en' as Language,
  setLanguage: (_l: Language) => {},
  t: (text: string, english: string) => translate('en', text, english),
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
