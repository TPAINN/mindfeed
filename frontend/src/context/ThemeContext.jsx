import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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

  // Toggle light ↔ dark — applies SYNCHRONOUSLY so every click is instant
  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('mf_theme', next)
      applyTheme(next) // synchronous DOM update — no waiting for effect
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
