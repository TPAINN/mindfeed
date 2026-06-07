import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

export const LangContext = createContext({ lang: 'el', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('mf_lang') || 'el'
  )

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
