import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { BookmarkProvider } from './context/BookmarkContext'
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

// ── Directional screen transitions ──────────────────────────────────────────
// Forward (depth increases): new screen slides in from right, old exits left.
// Back (depth decreases): new screen slides in from left, old exits right.
// This mirrors native iOS/Android push/pop navigation.
const slideVariants = {
  enterForward:  { opacity: 0, x: 60, scale: 0.985 },
  enterBack:     { opacity: 0, x: -60, scale: 0.985 },
  center:        { opacity: 1, x: 0, scale: 1 },
  exitForward:   { opacity: 0, x: -60, scale: 0.985 },
  exitBack:      { opacity: 0, x: 60, scale: 0.985 },
}

const slideTransition = {
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1],
}

function Screen({ children, direction }) {
  return (
    <motion.div
      style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}
      initial={direction >= 0 ? 'enterForward' : 'enterBack'}
      animate="center"
      exit={direction >= 0 ? 'exitForward' : 'exitBack'}
      variants={slideVariants}
      transition={slideTransition}
    >
      {children}
    </motion.div>
  )
}

/* ── Deck shell: the Feed screen + the Bookmarks slide-over ─────────────────
   The Feed stays MOUNTED while Bookmarks is open — it only recedes behind the
   layer. This preserves the user's deck position, scroll offsets and loaded
   data, and kills the "returning from Bookmarks reloads the whole feed and
   resets to card 1" behaviour. The layer exits with the same slide used by
   native push navigation.                                             */
function Shell({ demo, view, openBookmarks, onBack }) {
  const veiled = view === 'bookmarks'
  return (
    <div className="mf-stack">
      <div
        className={`mf-stack__feed${veiled ? ' mf-stack__feed--veiled' : ''}`}
        inert={veiled}
      >
        <Feed demo={demo} active={!veiled} onBookmarks={openBookmarks} />
      </div>
      <AnimatePresence initial={false}>
        {veiled && (
          <motion.div
            key="bookmarks-layer"
            className="mf-stack__layer"
            initial={{ x: '102%' }}
            animate={{ x: 0 }}
            exit={{ x: '102%' }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
          >
            <BookmarksScreen onBack={onBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Root() {
  const { isAuth } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [demo, setDemo]             = useState(() => sessionStorage.getItem('mf_demo') === '1')
  const [view, setView]             = useState('feed')
  const [langPicked, setLangPicked] = useState(() => Boolean(localStorage.getItem('mf_lang')))
  const directionRef = useRef(1) // 1 = forward, -1 = back
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const handler = () => {
      sessionStorage.setItem('mf_demo', '1')
      setDemo(true)
    }
    window.addEventListener('mf:demo', handler)
    return () => window.removeEventListener('mf:demo', handler)
  }, [])

  // ── History API navigation ────────────────────────────────────────────────
  // Bookmarks behaves like a native overlay: it REPLACES the current history
  // entry instead of pushing a new one, so opening/closing it never stacks
  // duplicate entries (which wedged the view after repeated open→close→open)
  // and the system/Android back button still closes it via popstate.
  const openBookmarks = useCallback(() => {
    directionRef.current = 1
    setDirection(1)
    window.history.replaceState({ view: 'bookmarks' }, '')
    setView('bookmarks')
  }, [])

  const closeBookmarks = useCallback(() => {
    directionRef.current = -1
    setDirection(-1)
    window.history.replaceState({}, '')
    setView('feed')
  }, [])

  // Listen for browser back/forward buttons
  useEffect(() => {
    function onPopState(e) {
      const targetView = e.state?.view || 'feed'
      directionRef.current = -1
      setDirection(-1)
      setView(targetView)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  let screen
  if (!langPicked) {
    screen = <Screen key="lang" direction={1}><LangPicker onPick={() => setLangPicked(true)} /></Screen>
  } else if (isAuth || demo) {
    screen = (
      <Screen key="shell" direction={direction}>
        <Shell
          demo={demo}
          view={view}
          openBookmarks={openBookmarks}
          onBack={closeBookmarks}
        />
      </Screen>
    )
  } else {
    screen = <Screen key="auth" direction={1}><Landing /></Screen>
  }

  return (
    <>
      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
      <AnimatePresence mode="wait">{screen}</AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="never">
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <ToastProvider>
              <BookmarkProvider>
                <Root />
              </BookmarkProvider>
            </ToastProvider>
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}
