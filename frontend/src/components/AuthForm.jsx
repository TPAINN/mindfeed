import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import Icon from './Icon'
import './AuthForm.css'

/* Landing entrance — brand pane staggers in from the left, auth card floats
   up. Both run on mount; exit is handled by the App-level AnimatePresence. */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(5px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

const FEATURES = [
  { icon: 'layers', textEl: '10 κάρτες την ημέρα — και τέλος. Όχι άπειρο scroll.', textEn: '10 cards a day — then you are done. No infinite scroll.' },
  { icon: 'shield', textEl: 'Κάθε κάρτα με πραγματική πηγή: paper, DOI, βιβλίο.', textEn: 'Every card cites a real source: paper, DOI, book.' },
  { icon: 'moon', textEl: 'Χωρίς likes, χωρίς ειδοποιήσεις, χωρίς άγχος.', textEn: 'No likes, no notifications, no anxiety.' },
]

export default function AuthForm() {
  const { login, register } = useAuth()
  const t = useT()
  const isEl = t('auth.login') === 'Σύνδεση'
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
      // A network failure ("Failed to fetch" / aborted timeout) means the
      // server is asleep/unreachable — show a friendly, actionable message
      // instead of the raw browser error.
      const msg = String(err?.message || '')
      const isNetwork = err?.status === undefined &&
        /fetch|network|aborted|timeout|load failed/i.test(msg)
      setError(isNetwork
        ? 'Ο διακομιστής ξυπνάει ή δεν υπάρχει σύνδεση. Δοκίμασε ξανά σε λίγο — ή συνέχισε χωρίς λογαριασμό.'
        : (msg || t('auth.error.default')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mf-land">
      {/* ── Brand pane ── */}
      <motion.section
        className="mf-land__brand"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div className="mf-land__mark" variants={item}>
          <img src="/favicon.svg" alt="" />
          <span>MindFeed</span>
        </motion.div>

        <motion.h1 className="mf-land__headline" variants={item}>
          {isEl ? <>Γνώση που <em>αξίζει</em>.</> : <>Knowledge that <em>matters</em>.</>}
        </motion.h1>

        <motion.p className="mf-land__sub" variants={item}>
          {isEl
            ? 'Δέκα κάρτες γνώσης κάθε μέρα — επιστήμη, φιλοσοφία, φύση. Το αντίθετο του doomscrolling.'
            : 'Ten knowledge cards a day — science, philosophy, nature. The opposite of doomscrolling.'}
        </motion.p>

        <motion.ul className="mf-land__features" variants={item}>
          {FEATURES.map(f => (
            <li key={f.icon}>
              <span className="mf-land__feature-icon"><Icon name={f.icon} size={16} /></span>
              {isEl ? f.textEl : f.textEn}
            </li>
          ))}
        </motion.ul>

        {/* Floating preview — the product IS the pitch */}
        <motion.div className="mf-land__preview" variants={item} aria-hidden="true">
          <div className="mf-land__ghost mf-land__ghost--b" />
          <div className="mf-land__ghost mf-land__ghost--a" />
          <div className="mf-land__minicard">
            <span className="mf-land__minichip">
              <Icon name="leaf" size={11} />
              {isEl ? 'Φύση' : 'Nature'}
            </span>
            <strong>
              {isEl
                ? 'Το δάσος μειώνει την κορτιζόλη κατά 12.4%'
                : 'Forests lower cortisol by 12.4%'}
            </strong>
            <span className="mf-land__minisrc">Li et al. · 2007 · DOI</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Auth card ── */}
      <motion.section
        className="mf-land__auth"
        initial={{ opacity: 0, y: 22, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
      >
        <div className="mf-auth__card">
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
      </motion.section>
    </div>
  )
}
