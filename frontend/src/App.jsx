import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import Landing from './components/Landing'
import Feed from './components/Feed'
import LangPicker from './components/LangPicker'
import BookmarksScreen from './components/BookmarksScreen'
import Splash from './components/Splash'
import { prewarm } from './api/client'
import './App.css'

// Kick off server wakeup immediately — overlaps with splash so Render cold
// boot (30-60s) finishes before the user reaches the feed.
prewarm()

// Every top-level screen enters AND exits through this wrapper, so screen
// changes cross-fade with a gentle vertical drift instead of hard-cutting.
const screenMotion = {
  initial: { opacity: 0, y: 16, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -12, scale: 0.995 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
}

function Screen({ children }) {
  return (
    <motion.div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }} {...screenMotion}>
      {children}
    </motion.div>
  )
}

function Root() {
  const { isAuth } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  // Demo survives a refresh for the rest of the browser session — a guest who
  // reloads shouldn't be thrown back to the login screen.
  const [demo, setDemo]             = useState(() => sessionStorage.getItem('mf_demo') === '1')
  const [view, setView]             = useState('feed')
  const [langPicked, setLangPicked] = useState(() => Boolean(localStorage.getItem('mf_lang')))

  useEffect(() => {
    const handler = () => {
      sessionStorage.setItem('mf_demo', '1')
      setDemo(true)
    }
    window.addEventListener('mf:demo', handler)
    return () => window.removeEventListener('mf:demo', handler)
  }, [])

  let screen
  if (!langPicked) {
    screen = <Screen key="lang"><LangPicker onPick={() => setLangPicked(true)} /></Screen>
  } else if (isAuth || demo) {
    screen = view === 'bookmarks'
      ? <Screen key="bookmarks"><BookmarksScreen onBack={() => setView('feed')} /></Screen>
      : <Screen key="feed"><Feed demo={demo} onBookmarks={() => setView('bookmarks')} /></Screen>
  } else {
    screen = <Screen key="auth"><Landing /></Screen>
  }

  return (
    <>
      {/* Splash overlays the first screen and fades itself out */}
      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
      <AnimatePresence mode="wait">{screen}</AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </LangProvider>
  )
}
