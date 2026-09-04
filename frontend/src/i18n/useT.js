import { useContext } from 'react'
import { LangContext } from '../context/LangContext'
import el from './el.json'
import en from './en.json'

const dicts = { el, en }

export function useT() {
  const { lang } = useContext(LangContext)
  const dict = dicts[lang] || dicts.el

  return function t(key, vars = {}, fallback) {
    let str = dict[key]
    if (str === undefined) str = fallback !== undefined ? String(fallback) : key
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    })
    return str
  }
}
