import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import AuthForm from './components/AuthForm'
import Feed from './components/Feed'
import LangPicker from './components/LangPicker'
import BookmarksScreen from './components/BookmarksScreen'
import Splash from './components/Splash'
import { prewarm } from './api/client'
import './App.css'

// Kick off server wakeup immediately — overlaps with splash so Render cold
// boot (30-60s) finishes before the user reaches the feed.
prewarm()

function Root() {
  const { isAuth } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [demo, setDemo]             = useState(false)
  const [view, setView]             = useState('feed')
  const [langPicked, setLangPicked] = useState(() => Boolean(localStorage.getItem('mf_lang')))

  useEffect(() => {
    const handler = () => setDemo(true)
    window.addEventListener('mf:demo', handler)
    return () => window.removeEventListener('mf:demo', handler)
  }, [])

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />
  if (!langPicked) return <LangPicker onPick={() => setLangPicked(true)} />

  if (isAuth || demo) {
    if (view === 'bookmarks') return <BookmarksScreen onBack={() => setView('feed')} />
    return <Feed demo={demo} onBookmarks={() => setView('bookmarks')} />
  }

  return <AuthForm />
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
