import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import { useLang } from '../context/LangContext'
import './AuthForm.css'

/* Map a caught auth error to an i18n KEY (resolved at render time, so a
   language switch instantly re-translates the message). Backend messages are
   English strings — never shown raw when a known translation exists. */
function resolveAuthError(err, t) {
  const msg = String(err?.message || '')
  // No HTTP status + fetch-shaped message = server asleep / offline / aborted
  if (err?.status === undefined && /fetch|network|aborted|timeout|load failed/i.test(msg))
    return t('auth.error.network')
  const known = [
    [/invalid credentials/i, 'auth.error.invalid'],
    [/taken/i, 'auth.error.taken'],
    [/too many requests|rate limit/i, 'auth.error.ratelimit'],
  ]
  const hit = known.find(([re]) => re.test(msg))
  if (hit) return t(hit[1])
  // 5xx / transport junk: never leak internals — show the generic message
  if (!err?.status || err.status >= 500) return t('auth.error.default')
  // A real 4xx answer with a message we don't translate yet
  return msg || t('auth.error.default')
}

/* The working auth card — login / register tabs, guest entry, friendly
   network errors. Used by the landing page's final section. */
export default function AuthCard() {
  const { login, register } = useAuth()
  const t = useT()
  const { lang } = useLang()
  const reducedMotion = useReducedMotion()
  // Signup-first: the register tab is the default so the primary action is
  // creating an account; returning users switch to login in one tap.
  const [mode, setMode] = useState('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authErr, setAuthErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setAuthErr(null)
    setSlow(false)
    setLoading(true)
    try {
      if (mode === 'login') await login(email.trim(), password)
      else await register(name.trim(), email.trim(), password)
    } catch (err) {
      // Store the error OBJECT; the message is resolved from the i18n key on
      // every render, so switching language re-translates it instantly.
      setAuthErr(err)
    } finally {
      setLoading(false)
    }
  }

  /* A warm login answers in <2s. If we're still waiting after 6s, the Render
     free tier is almost certainly cold-booting (22–60s) — say so, so the wait
     doesn't read as a broken backend. */
  useEffect(() => {
    if (!loading) return
    const id = setTimeout(() => setSlow(true), 6000)
    return () => clearTimeout(id)
  }, [loading])

  /* External requests (e.g. the landing band's "sign in" link) can flip the
     active tab before the card scrolls into view. */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'login' || e.detail === 'register') {
        setMode(e.detail)
        setAuthErr(null)
      }
    }
    window.addEventListener('mf:auth-mode', handler)
    return () => window.removeEventListener('mf:auth-mode', handler)
  }, [])


  return (
    <div className="mf-auth__card" id="mf-auth-card">
      <div className="mf-auth__tabs">
        <button
          data-mode="login"
          aria-pressed={mode === 'login'}
          disabled={loading}
          className={`mf-auth__tab${mode === 'login' ? ' mf-auth__tab--active' : ''}`}
          onClick={() => { setMode('login'); setAuthErr(null) }}
        >
          {t('auth.login')}
        </button>
        <button
          data-mode="register"
          aria-pressed={mode === 'register'}
          disabled={loading}
          className={`mf-auth__tab${mode === 'register' ? ' mf-auth__tab--active' : ''}`}
          onClick={() => { setMode('register'); setAuthErr(null) }}
        >
          {t('auth.register')}
        </button>
      </div>

      <form className="mf-auth__form" onSubmit={handleSubmit} aria-busy={loading}>
        {mode === 'register' && (
          <div className="mf-auth__field">
            <label htmlFor="auth-name">{t('auth.name')}</label>
            <input
              id="auth-name"
              type="text"
              placeholder={t('auth.name_placeholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern=".*\\S.*"
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
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
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
            minLength={mode === 'register' ? 6 : undefined}
          />
        </div>

        {authErr && (
          <motion.p
            key={lang}
            className="mf-auth__error"
            role="alert"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: reducedMotion ? 0 : [0, -7, 7, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
          >
            {resolveAuthError(authErr, t)}
          </motion.p>
        )}

        <button className="mf-auth__submit" type="submit" disabled={loading}>
          {loading && <span className="mf-auth__spinner" aria-hidden="true" />}
          {loading
            ? t('auth.loading')
            : mode === 'login'
              ? t('auth.submit.login')
              : t('auth.submit.register')}
        </button>
        {loading && slow && (
          <motion.p
            className="mf-auth__waking"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {t('auth.waking')}
          </motion.p>
        )}
      </form>

      <p className="mf-auth__demo">
        <button
          className="mf-auth__demo-link"
          onClick={() => window.dispatchEvent(new CustomEvent('mf:demo'))}
        >
          {t('auth.demo')}
        </button>
      </p>
      <p className="mf-auth__reassure">{t('auth.reassure')}</p>
    </div>
  )
}
