import { Component, lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider, useLang } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { BookmarkProvider } from './context/BookmarkContext'
import Landing from './components/Landing'
import './App.css'

const Feed = lazy(() => import('./components/Feed'))
const BookmarksScreen = lazy(() => import('./components/BookmarksScreen'))
const SplashStudio = import.meta.env.DEV ? lazy(() => import('./components/SplashStudio')) : null

class ScreenErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="screen-loading"><div><h1>MindFeed</h1><p>Η σελίδα δεν φορτώθηκε. / The page could not load.</p><button className="editorial-primary" onClick={() => window.location.reload()}>Επανάληψη / Try again</button></div></main>
    return this.props.children
  }
}

function LoadingScreen() {
  const { lang } = useLang()
  return <div className="screen-loading" role="status">{lang === 'el' ? 'Ανοίγουμε την ανάγνωσή σου…' : 'Opening your reading…'}</div>
}

function Shell({ demo, view, openBookmarks, onBack, onExitDemo }) {
  const { lang } = useLang()
  const veiled = view === 'bookmarks'
  return <div className="mf-stack">
    {demo && <div className="demo-banner"><span>{lang === 'el' ? 'Δοκιμαστική ανάγνωση · χωρίς λογαριασμό' : 'Sample reading · no account needed'}</span><button onClick={onExitDemo}>{lang === 'el' ? 'Επιστροφή' : 'Exit preview'} ↗</button></div>}
    <div className={`mf-stack__feed${veiled ? ' mf-stack__feed--veiled' : ''}`} inert={veiled}>
      <Feed demo={demo} active={!veiled} onBookmarks={openBookmarks} />
    </div>
    <AnimatePresence initial={false}>
      {veiled && <motion.div key="bookmarks" className="mf-stack__layer" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: .2 }}><Suspense fallback={<LoadingScreen />}><BookmarksScreen onBack={onBack} /></Suspense></motion.div>}
    </AnimatePresence>
  </div>
}

function Root() {
  const { isAuth } = useAuth()
  const screen = useRef(null)
  const [demo, setDemo] = useState(() => sessionStorage.getItem('mf_demo') === '1')
  const bookmarkTrigger = useRef(null)
  const [view, setView] = useState(() => window.history.state?.view === 'bookmarks' ? 'bookmarks' : 'feed')
  const reading = isAuth || demo
  useEffect(() => {
    const controller = new AbortController()
    import('./motion/screenMotion').then(({ enterScreen }) => {
      if (!controller.signal.aborted && screen.current) return enterScreen(screen.current, reading ? 'reading' : 'home', controller.signal)
    }).catch(() => { /* Navigation does not depend on optional animation loading. */ })
    return () => controller.abort()
  }, [reading])
  useEffect(() => {
    const enter = () => { sessionStorage.setItem('mf_demo', '1'); setDemo(true); window.scrollTo(0, 0) }
    window.addEventListener('mf:demo', enter)
    return () => window.removeEventListener('mf:demo', enter)
  }, [])
  const openBookmarks = useCallback((event) => {
    bookmarkTrigger.current = event?.currentTarget
    if (window.history.state?.view !== 'bookmarks') window.history.pushState({ view: 'bookmarks' }, '')
    setView('bookmarks')
  }, [])
  const closeBookmarks = useCallback(() => {
    if (window.history.state?.view === 'bookmarks') window.history.back()
    else setView('feed')
  }, [])
  useEffect(() => {
    const onPopState = e => setView(e.state?.view === 'bookmarks' ? 'bookmarks' : 'feed')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    if (view !== 'feed' || !bookmarkTrigger.current) return
    const timer = setTimeout(() => bookmarkTrigger.current?.focus({ preventScroll: true }), 360)
    return () => clearTimeout(timer)
  }, [view])
  function exitDemo() { sessionStorage.removeItem('mf_demo'); setDemo(false); setView('feed'); window.history.replaceState({}, '', window.location.pathname); window.scrollTo(0, 0) }
  if (SplashStudio && new URLSearchParams(window.location.search).get('studio') === '1') return <Suspense fallback={<LoadingScreen />}><SplashStudio /></Suspense>
  return <div ref={screen}><Suspense fallback={<LoadingScreen />}>{reading ? <Shell key={isAuth ? 'account' : 'demo'} demo={!isAuth && demo} view={view} openBookmarks={openBookmarks} onBack={closeBookmarks} onExitDemo={exitDemo} /> : <Landing />}</Suspense></div>
}

export default function App() {
  return <MotionConfig reducedMotion="user"><ThemeProvider><LangProvider><AuthProvider><ToastProvider><BookmarkProvider><ScreenErrorBoundary><Root /></ScreenErrorBoundary></BookmarkProvider></ToastProvider></AuthProvider></LangProvider></ThemeProvider></MotionConfig>
}
