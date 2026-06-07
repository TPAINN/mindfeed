import { useContext } from 'react'
import { LangContext } from '../context/LangContext'
import el from './el.json'
import en from './en.json'

const dicts = { el, en }

export function useT() {
  const { lang } = useContext(LangContext)
  const dict = dicts[lang] || dicts.el

  return function t(key, vars = {}) {
    let str = dict[key] ?? key
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    })
    return str
  }
}
