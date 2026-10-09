import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => typeof window === 'undefined' ? null : localStorage.getItem('mf_token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mf_user')) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const data = await api.post('/api/users/login', { email, password })
    localStorage.setItem('mf_token', data.token)
    localStorage.setItem('mf_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/api/users/register', { username: name, email, password })
    localStorage.setItem('mf_token', data.token)
    localStorage.setItem('mf_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mf_token')
    localStorage.removeItem('mf_user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('mf:session-expired', logout)
    return () => window.removeEventListener('mf:session-expired', logout)
  }, [logout])

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
