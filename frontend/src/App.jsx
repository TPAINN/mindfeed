import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import Feed from './components/Feed'
import './App.css'

function Root() {
  const { isAuth } = useAuth()
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    function onDemo() { setDemo(true) }
    window.addEventListener('mf:demo', onDemo)
    return () => window.removeEventListener('mf:demo', onDemo)
  }, [])

  if (isAuth || demo) return <Feed demo={demo} />
  return <AuthForm />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
