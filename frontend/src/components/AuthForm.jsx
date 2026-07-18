import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import Icon, { CategoryIcon } from './Icon'
import './AuthForm.css'

/* Landing = hero (brand + auth card) plus the marketing sections below.
   Entrances stagger on mount; below-the-fold sections reveal on scroll.
   Exit is handled by the App-level AnimatePresence. */
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
const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
}

const STEPS = [
  { icon: 'sun', tEl: 'Άνοιξε', dEl: 'Μία στοίβα από 10 κάρτες σε περιμένει κάθε πρωί.', tEn: 'Open', dEn: 'A stack of 10 cards waits for you every morning.' },
  { icon: 'book', tEl: 'Διάβασε', dEl: 'Κάθε κάρτα σε 1 λεπτό: το εύρημα, γιατί μετράει, η πηγή.', tEn: 'Read', dEn: 'Each card in a minute: the finding, why it matters, the source.' },
  { icon: 'check', tEl: 'Τέλος', dEl: 'Στη δέκατη κάρτα η ροή τελειώνει. Μέχρι αύριο.', tEn: 'Done', dEn: 'At card ten the feed ends. Until tomorrow.' },
]

const SAMPLES = [
  {
    cat: { emoji: '🌿', name: 'Φύση' }, nameEn: 'Nature',
    tEl: 'Το δάσος μειώνει την κορτιζόλη κατά 12.4%',
    tEn: 'Forests lower cortisol by 12.4%',
    src: 'Li et al. 2007, DOI',
  },
  {
    cat: { emoji: '🌌', name: 'Σύμπαν' }, nameEn: 'Cosmos',
    tEl: 'Το σύμπαν έχει 2 τρισεκατομμύρια γαλαξίες',
    tEn: 'The universe holds 2 trillion galaxies',
    src: 'Conselice et al. 2016, DOI',
  },
  {
    cat: { emoji: '🏛️', name: 'Φιλοσοφία' }, nameEn: 'Philosophy',
    tEl: 'Amor Fati: θέλε τα πράγματα όπως έρχονται',
    tEn: 'Amor Fati: will things as they come',
    src: 'Marcus Aurelius, Meditations',
  },
]

const COMPARE = {
  left: {
    tEl: 'Το άπειρο scroll', tEn: 'The infinite scroll',
    itemsEl: ['Δεν τελειώνει ποτέ', 'Αλγόριθμος θυμού', 'Χαμένες ώρες', 'Άγχος χωρίς λόγο'],
    itemsEn: ['Never ends', 'Anger algorithm', 'Lost hours', 'Anxiety for nothing'],
  },
  right: {
    tEl: 'Το MindFeed', tEn: 'MindFeed',
    itemsEl: ['Τελειώνει στις 10 κάρτες', 'Επιμελημένη γνώση', '5 λεπτά την ημέρα', 'Ηρεμία, με πηγές'],
    itemsEn: ['Ends at 10 cards', 'Curated knowledge', '5 minutes a day', 'Calm, with sources'],
  },
}

const SOURCES = ['PubMed', 'arXiv', 'NASA', 'Wikipedia', 'Open Library']

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
        ? 'Ο διακομιστής ξυπνάει ή δεν υπάρχει σύνδεση. Δοκίμασε ξανά σε λίγο, ή συνέχισε χωρίς λογαριασμό.'
        : (msg || t('auth.error.default')))
    } finally {
      setLoading(false)
    }
  }

  function scrollToAuth() {
    document.getElementById('mf-auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="mf-page">
      {/* ── Hero ── */}
      <div className="mf-land">
        <motion.section
          className="mf-land__brand"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div className="mf-land__mark" variants={item}>
            <img src="/mark.svg" alt="" />
            <span>MindFeed</span>
          </motion.div>

          <motion.h1 className="mf-land__headline" variants={item}>
            {isEl ? <>Γνώση που <em>αξίζει</em>.</> : <>Knowledge that <em>matters</em>.</>}
          </motion.h1>

          <motion.p className="mf-land__sub" variants={item}>
            {isEl
              ? 'Δέκα κάρτες γνώσης κάθε μέρα: επιστήμη, φιλοσοφία, φύση. Το αντίθετο του doomscrolling.'
              : 'Ten knowledge cards a day: science, philosophy, nature. The opposite of doomscrolling.'}
          </motion.p>

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
              <span className="mf-land__minisrc">Li et al. 2007, DOI</span>
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
          <div className="mf-auth__card" id="mf-auth-card">
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

      {/* ── How it works — step flow on an amber line ── */}
      <motion.section className="mf-sec mf-how" {...reveal}>
        <h2 className="mf-sec__title">{isEl ? 'Πώς λειτουργεί' : 'How it works'}</h2>
        <div className="mf-how__flow">
          {STEPS.map((s, i) => (
            <div className="mf-how__step" key={s.icon} style={{ '--i': i }}>
              <span className="mf-how__node"><Icon name={s.icon} size={17} /></span>
              <h3>{isEl ? s.tEl : s.tEn}</h3>
              <p>{isEl ? s.dEl : s.dEn}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Sample cards — asymmetric fan ── */}
      <motion.section className="mf-sec mf-samples" {...reveal}>
        <h2 className="mf-sec__title">{isEl ? 'Δες τι θα μάθεις' : 'See what you will learn'}</h2>
        <div className="mf-samples__fan">
          {SAMPLES.map((c, i) => (
            <article className={`mf-sample mf-sample--${i}`} key={c.src}>
              <span className="mf-land__minichip">
                <CategoryIcon category={c.cat} size={11} />
                {isEl ? c.cat.name : c.nameEn}
              </span>
              <strong>{isEl ? c.tEl : c.tEn}</strong>
              <span className="mf-land__minisrc">{c.src}</span>
            </article>
          ))}
        </div>
      </motion.section>

      {/* ── Compare — one split panel ── */}
      <motion.section className="mf-sec mf-compare" {...reveal}>
        <h2 className="mf-sec__title">{isEl ? 'Το αντίθετο του feed' : 'The opposite of the feed'}</h2>
        <div className="mf-compare__panel">
          <div className="mf-compare__col mf-compare__col--them">
            <h3>{isEl ? COMPARE.left.tEl : COMPARE.left.tEn}</h3>
            <ul>
              {(isEl ? COMPARE.left.itemsEl : COMPARE.left.itemsEn).map(x => (
                <li key={x}><Icon name="x" size={13} />{x}</li>
              ))}
            </ul>
          </div>
          <div className="mf-compare__divider" aria-hidden="true" />
          <div className="mf-compare__col mf-compare__col--us">
            <h3>{isEl ? COMPARE.right.tEl : COMPARE.right.tEn}</h3>
            <ul>
              {(isEl ? COMPARE.right.itemsEl : COMPARE.right.itemsEn).map(x => (
                <li key={x}><Icon name="check" size={13} />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* ── Sources — statement band ── */}
      <motion.section className="mf-sec mf-sources" {...reveal}>
        <h2 className="mf-sources__statement">
          {isEl ? 'Καμία κάρτα χωρίς πηγή.' : 'No card without a source.'}
        </h2>
        <p className="mf-sources__sub">
          {isEl
            ? 'Κάθε γεγονός τεκμηριώνεται από papers, βιβλία και ανοιχτές βάσεις γνώσης.'
            : 'Every fact is backed by papers, books and open knowledge bases.'}
        </p>
        <ul className="mf-sources__list">
          {SOURCES.map(s => <li key={s}>{s}</li>)}
        </ul>
      </motion.section>

      {/* ── Final CTA ── */}
      <motion.section className="mf-sec mf-cta" {...reveal}>
        <h2>{isEl ? <>Η γνώση σου <em>περιμένει</em>.</> : <>Your knowledge is <em>waiting</em>.</>}</h2>
        <button className="mf-cta__btn" onClick={scrollToAuth}>
          {isEl ? 'Ξεκίνα δωρεάν' : 'Start free'}
        </button>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="mf-footer">
        <div className="mf-footer__brand">
          <img src="/mark.svg" alt="" />
          <span>MindFeed</span>
        </div>
        <p>{isEl ? 'Γνώση που αξίζει.' : 'Knowledge that matters.'} · 2026</p>
      </footer>
    </div>
  )
}
