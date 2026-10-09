import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { useT } from '../i18n/useT'

const DEMO_STORAGE_KEY = 'mf_demo_saved_cards'
const BookmarkContext = createContext(null)

function validCards(value) {
  return Array.isArray(value) ? value.filter(card => card && typeof card._id === 'string') : []
}

function loadDemoSaves() {
  try { return validCards(JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY))) }
  catch { return [] }
}

export function BookmarkProvider({ children }) {
  const { token } = useAuth()
  // A new session must never inherit another account's saves or requests.
  return <SessionBookmarks key={token || 'guest'} token={token}>{children}</SessionBookmarks>
}

function SessionBookmarks({ token, children }) {
  const [savedCards, setSavedCards] = useState(() => token ? [] : loadDemoSaves())
  const [ready, setReady] = useState(!token)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const pending = useRef(new Set())
  const { toast } = useToast()
  const t = useT()

  useEffect(() => {
    if (!token) return
    let alive = true
    api.get('/api/users/bookmarks')
      .then(data => { if (alive) setSavedCards(validCards(data)) })
      .catch(() => { if (alive) setError(true) })
      .finally(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [token, attempt])

  const retry = useCallback(() => {
    setError(false)
    setReady(false)
    setAttempt(value => value + 1)
  }, [])

  const isSaved = useCallback(id => savedCards.some(card => card._id === id), [savedCards])

  const changeSaved = useCallback(async (card, remove) => {
    const id = card?._id
    if (!id || !ready || error || pending.current.has(id)) return false
    pending.current.add(id)
    const update = prev => remove ? prev.filter(item => item._id !== id)
      : prev.some(item => item._id === id) ? prev : [...prev, card]
    try {
      if (token) {
        if (remove) await api.delete(`/api/users/bookmarks/${id}`)
        else await api.post(`/api/users/bookmark/${id}`)
      } else {
        // Persist first: a full or disabled store must not claim a successful save.
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(update(loadDemoSaves())))
      }
      setSavedCards(update)
      return true
    } catch {
      toast(t('auth.error.default'), 'error')
      return false
    } finally {
      pending.current.delete(id)
    }
  }, [token, ready, error, toast, t])

  const toggleSave = useCallback(card => changeSaved(card, isSaved(card?._id)), [changeSaved, isSaved])
  const removeSaved = useCallback(id => changeSaved({ _id: id }, true), [changeSaved])
  const value = useMemo(() => ({
    savedCards, ready, error, retry, isSaved, toggleSave, removeSaved, count: savedCards.length,
  }), [savedCards, ready, error, retry, isSaved, toggleSave, removeSaved])

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBookmarks() {
  return useContext(BookmarkContext)
}
