import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

export const LangContext = createContext({ lang: 'el', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('mf_lang') || 'el'
  )

  // Keep <html lang> in sync — screen readers pick pronunciation rules from
  // it, so a stale value reads English content with Greek phonetics or vice
  // versa (WCAG 3.1.1, Language of Page).
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function setLang(newLang) {
    localStorage.setItem('mf_lang', newLang)
    setLangState(newLang)
    // fire-and-forget — sync to backend if logged in
    if (localStorage.getItem('mf_token')) {
      api.patch('/api/users/preferences', { language: newLang }).catch(() => {})
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
