import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

/* ── BookmarkContext — single source of truth for saved cards ────────────────
   The Feed's save buttons and the Bookmarks screen previously kept separate
   copies of state (Feed only knew ids, BookmarksScreen re-fetched on mount),
   which caused three real bugs:
     1. Demo-mode saves never appeared in Bookmarks (no token → API 401).
     2. Saving in the feed and removing in Bookmarks left the feed's button
        showing a stale "saved" state.
     3. Opening Bookmarks re-fetched everything while Feed still believed
        cards were unsaved.
   This provider owns the list. Authed users sync through the API (optimistic
   with rollback on error), demo/guest users persist to localStorage so saves
   survive a reload.                                                          */

const DEMO_STORAGE_KEY = 'mf_demo_saved_cards'

function isDemoSession() {
  try { return sessionStorage.getItem('mf_demo') === '1' } catch { return false }
}

function loadDemoSaves() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return [] // corrupted storage is not worth crashing over
  }
}

const BookmarkContext = createContext({
  savedCards: [],
  ready: false,
  isSaved: () => false,
  toggleSave: () => {},
  removeSaved: () => {},
  count: 0,
})

export function BookmarkProvider({ children }) {
  const { isAuth } = useAuth()
  const [savedCards, setSavedCards] = useState([])
  const [ready, setReady] = useState(false)
  const hydratedForRef = useRef(null)

  // Demo/guest: seed synchronously from localStorage so the first paint
  // already shows saves (no flash, no network).
  useEffect(() => {
    if (!isAuth && isDemoSession() && hydratedForRef.current !== 'demo') {
      hydratedForRef.current = 'demo'
      setSavedCards(loadDemoSaves())
      setReady(true)
    }
  }, [isAuth])

  // Authed: hydrate from the API once per login, not per mount.
  useEffect(() => {
    if (!isAuth) return
    if (hydratedForRef.current === 'authed') return
    hydratedForRef.current = 'authed'
    let alive = true
    setReady(false)
    api.get('/api/users/bookmarks')
      .then(data => { if (alive) setSavedCards(data || []) })
      .catch(() => { if (alive) setSavedCards([]) })
      .finally(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [isAuth])

  const isSaved = useCallback((id) => savedCards.some(c => c._id === id), [savedCards])

  // Optimistic toggle — flip the UI first, persist after. On server failure
  // the change is rolled back so the UI never lies about the saved state.
  const toggleSave = useCallback((card) => {
    if (!card?._id) return
    const id = card._id
    const wasSaved = savedCards.some(c => c._id === id)

    if (wasSaved) {
      setSavedCards(prev => prev.filter(c => c._id !== id))
    } else {
      setSavedCards(prev => prev.some(c => c._id === id) ? prev : [...prev, card])
    }

    if (isAuth) {
      const p = api.post(`/api/users/bookmark/${id}`) // server toggles
      if (wasSaved) {
        p.catch(() => setSavedCards(prev => prev.some(c => c._id === id) ? prev : [...prev, card]))
      } else {
        p.catch(() => setSavedCards(prev => prev.filter(c => c._id !== id)))
      }
    } else if (isDemoSession()) {
      const next = wasSaved ? savedCards.filter(c => c._id !== id) : [...savedCards, card]
      try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)) } catch { /* storage full/unavailable */ }
    }
  }, [isAuth, savedCards])

  // Direct remove (Bookmarks screen X button / detail view "Saved" button).
  const removeSaved = useCallback((id) => {
    setSavedCards(prev => prev.filter(c => c._id !== id))
    if (isAuth) {
      api.delete(`/api/users/bookmarks/${id}`).catch(() => {
        // Roll back to server truth so the list never shows a lie.
        api.get('/api/users/bookmarks').then(d => setSavedCards(d || [])).catch(() => {})
      })
    } else if (isDemoSession()) {
      const next = savedCards.filter(c => c._id !== id)
      try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)) } catch { /* storage full/unavailable */ }
    }
  }, [isAuth, savedCards])

  const value = useMemo(() => ({
    savedCards,
    ready,
    isSaved,
    toggleSave,
    removeSaved,
    count: savedCards.length,
  }), [savedCards, ready, isSaved, toggleSave, removeSaved])

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  return useContext(BookmarkContext)
}
