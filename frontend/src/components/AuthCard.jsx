import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { animate } from 'animejs'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import './AuthForm.css'

/* The working auth card — login / register tabs, guest entry, friendly
   network errors. Used by the landing page's final section. */
export default function AuthCard() {
  const { login, register } = useAuth()
  const t = useT()
  const isEl = t('auth.login') === 'Σύνδεση'
  // Signup-first: the register tab is the default so the primary action is
  // creating an account; returning users switch to login in one tap.
  const [mode, setMode] = useState('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const trackRef = useRef(null)
  const pillRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
    } catch (err) {
      // A network failure ("Failed to fetch" / aborted timeout) means the
      // server is asleep/unreachable — show a friendly, actionable message
      // instead of the raw browser error.
      const msg = String(err?.message || '')
      const isNetwork = err?.status === undefined &&
        /fetch|network|aborted|timeout|load failed/i.test(msg)
      setError(isNetwork
        ? (isEl
            ? 'Ο διακομιστής ξυπνάει ή δεν υπάρχει σύνδεση. Δοκίμασε ξανά σε λίγο, ή συνέχισε χωρίς λογαριασμό.'
            : 'The server is waking up or you are offline. Try again shortly, or continue without an account.')
        : (msg || t('auth.error.default')))
    } finally {
      setLoading(false)
    }
  }

  /* External requests (e.g. the landing band's "sign in" link) can flip the
     active tab before the card scrolls into view. */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'login' || e.detail === 'register') {
        setMode(e.detail)
        setError('')
      }
    }
    window.addEventListener('mf:auth-mode', handler)
    return () => window.removeEventListener('mf:auth-mode', handler)
  }, [])

  /* Sliding pill behind the active tab — measured once layout is ready (and
     re-measured whenever the mode changes). anime.js tweens left + width so
     the indicator physically glides between Login and Create account. */
  useEffect(() => {
    const track = trackRef.current
    const pill = pillRef.current
    if (!track || !pill) return
    const btn = track.querySelector(`[data-mode="${mode}"]`)
    if (!btn) return

    const place = () => {
      animate(pill, {
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: 380,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      })
    }
    const raf = requestAnimationFrame(place)
    // The card sits under webfonts that can still be loading; settle late too.
    const late = setTimeout(place, 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(late)
    }
  }, [mode])

  return (
    <div className="mf-auth__card" id="mf-auth-card">
      <div className="mf-auth__tabs" ref={trackRef}>
        <span className="mf-auth__pill" ref={pillRef} aria-hidden="true" />
        <button
          data-mode="login"
          className={`mf-auth__tab${mode === 'login' ? ' mf-auth__tab--active' : ''}`}
          onClick={() => { setMode('login'); setError('') }}
        >
          {t('auth.login')}
        </button>
        <button
          data-mode="register"
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
              placeholder={t('auth.name_placeholder')}
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

        {error && (
          <motion.p
            className="mf-auth__error"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -7, 7, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
          >
            {error}
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
      </form>

      <p className="mf-auth__demo">
        <button
          className="mf-auth__demo-link"
          onClick={() => window.dispatchEvent(new CustomEvent('mf:demo'))}
        >
          {t('auth.demo')}
        </button>
      </p>
      <p className="mf-auth__reassure">
        {isEl ? 'Δωρεάν. Χωρίς κάρτα, χωρίς δεσμεύσεις.' : 'Free. No card, no strings.'}
      </p>
    </div>
  )
}
