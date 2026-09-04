import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

// Match the PWA manifest / index.html so the browser chrome (status bar on
// installed apps, pull-to-refresh backdrop) follows the actual theme.
const THEME_COLORS = { light: '#faf5ec', dark: '#0c0f17' }

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved] || THEME_COLORS.light)
}

export function ThemeProvider({ children }) {
  // Initialize: stored preference, or fall back to system
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('mf_theme')
    if (stored === 'light' || stored === 'dark') return stored
    return getSystemTheme()
  })

  // Apply immediately on mount (covers React hydration gap)
  useEffect(() => {
    applyTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for OS-level changes ONLY if user hasn't manually chosen
  useEffect(() => {
    const stored = localStorage.getItem('mf_theme')
    if (stored === 'light' || stored === 'dark') return // user has explicit pref
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const sys = getSystemTheme()
      setThemeState(sys)
      applyTheme(sys)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Smooth light ↔ dark swap:
  // - Modern browsers: View Transitions API — the whole page cross-fades, and
  //   when the toggle itself is the origin it ripples outward from the button
  //   (OS-style circular reveal). The DOM update runs inside the transition
  //   callback via flushSync so the new snapshot captures the new theme.
  // - Legacy browsers: a temporary class enables app-wide color transitions
  //   for the duration of the swap, so nothing snaps.
  const setThemeSmooth = useCallback((next, origin) => {
    localStorage.setItem('mf_theme', next)
    const doc = document.documentElement
    const cleanup = () => {
      doc.classList.remove('mf-vt-ripple')
      doc.style.removeProperty('--tx')
      doc.style.removeProperty('--ty')
    }
    const domApply = () => {
      flushSync(() => setThemeState(next))
      applyTheme(next) // data-theme + theme-color meta
    }
    if (document.startViewTransition) {
      if (origin && origin.getBoundingClientRect) {
        const r = origin.getBoundingClientRect()
        doc.style.setProperty('--tx', `${Math.round(r.left + r.width / 2)}px`)
        doc.style.setProperty('--ty', `${Math.round(r.top + r.height / 2)}px`)
        doc.classList.add('mf-vt-ripple')
      }
      try {
        const vt = document.startViewTransition(domApply)
        // .finished rejects if the transition is skipped (e.g. a second click
        // mid-transition) — settle cleanup either way.
        vt.finished.then(cleanup, cleanup)
      } catch {
        cleanup()
        domApply()
      }
    } else {
      doc.classList.add('mf-theme-transition')
      domApply()
      window.setTimeout(() => doc.classList.remove('mf-theme-transition'), 700)
    }
  }, [])

  // Toggle from the header button — the button becomes the ripple origin.
  const toggleTheme = useCallback((e) => {
    const origin = e && e.currentTarget
    setThemeSmooth(theme === 'dark' ? 'light' : 'dark', origin)
  }, [theme, setThemeSmooth])

  // Listen for OS-level changes ONLY if user hasn't manually chosen
  useEffect(() => {
    const stored = localStorage.getItem('mf_theme')
    if (stored === 'light' || stored === 'dark') return // user has explicit pref
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setThemeSmooth(getSystemTheme(), null)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setThemeSmooth])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
