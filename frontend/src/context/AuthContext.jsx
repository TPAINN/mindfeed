import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mf_token'))
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

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
