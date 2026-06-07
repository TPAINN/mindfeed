import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import './AuthForm.css'

export default function AuthForm() {
  const { login, register } = useAuth()
  const t = useT()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
    } catch (err) {
      setError(err.message || t('auth.error.default'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mf-auth">
      <div className="mf-auth__card">
        <div className="mf-auth__logo">🧠 MindFeed</div>
        <p className="mf-auth__tagline">Μάθε κάτι ουσιαστικό κάθε μέρα.</p>

        <div className="mf-auth__tabs">
          <button
            className={`mf-auth__tab${mode === 'login' ? ' mf-auth__tab--active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            {t('auth.login')}
          </button>
          <button
            className={`mf-auth__tab${mode === 'register' ? ' mf-auth__tab--active' : ''}`}
            onClick={() => { setMode('register'); setError('') }}
          >
            {t('auth.register')}
          </button>
        </div>

        <form className="mf-auth__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="mf-auth__field">
              <label htmlFor="auth-name">{t('auth.name')}</label>
              <input
                id="auth-name"
                type="text"
                placeholder="π.χ. Απόστολος"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="mf-auth__field">
            <label htmlFor="auth-email">{t('auth.email')}</label>
            <input
              id="auth-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="mf-auth__field">
            <label htmlFor="auth-pass">{t('auth.password')}</label>
            <input
              id="auth-pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {error && <p className="mf-auth__error">{error}</p>}

          <button className="mf-auth__submit" type="submit" disabled={loading}>
            {loading
              ? t('auth.loading')
              : mode === 'login'
                ? t('auth.submit.login')
                : t('auth.submit.register')}
          </button>
        </form>

        <p className="mf-auth__demo">
          ή{' '}
          <button
            className="mf-auth__demo-link"
            onClick={() => window.dispatchEvent(new CustomEvent('mf:demo'))}
          >
            {t('auth.demo')}
          </button>
        </p>
      </div>
    </div>
  )
}
