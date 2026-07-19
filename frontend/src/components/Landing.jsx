import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '../i18n/useT'
import Icon, { CategoryIcon } from './Icon'
import AuthCard from './AuthCard'
import './Landing.css'

/* ── Landing — the marketing front door. Hero holds a LIVE mini feed deck
   (a real component you can tap through, not a fake screenshot). ── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 18, filter: 'blur(5px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
}

const DEMO_CARDS = [
  {
    cat: { emoji: '🌿', name: 'Φύση' }, catEn: 'Nature',
    tEl: 'Το δάσος μειώνει την κορτιζόλη κατά 12.4%',
    tEn: 'Forests lower cortisol by 12.4%',
    bEl: 'Δύο ώρες shinrin-yoku αρκούν για μετρήσιμη πτώση του στρες, χαμηλότερη πίεση και ενισχυμένο ανοσοποιητικό έως και 7 μέρες μετά.',
    bEn: 'Two hours of shinrin-yoku measurably lower stress and blood pressure, with immune benefits lasting up to 7 days.',
    src: 'Li et al. 2007, DOI',
  },
  {
    cat: { emoji: '🌌', name: 'Σύμπαν' }, catEn: 'Cosmos',
    tEl: 'Το σύμπαν έχει 2 τρισεκατομμύρια γαλαξίες',
    tEn: 'The universe holds 2 trillion galaxies',
    bEl: 'Είκοσι φορές περισσότερους απ\' όσους πιστεύαμε πριν το 2016 — υπολογισμένους από βαθιές εικόνες του Hubble.',
    bEn: 'Twenty times more than the pre-2016 estimate — calculated from deep Hubble imaging.',
    src: 'Conselice et al. 2016, DOI',
  },
  {
    cat: { emoji: '🏛️', name: 'Φιλοσοφία' }, catEn: 'Philosophy',
    tEl: 'Amor Fati: θέλε τα πράγματα όπως έρχονται',
    tEn: 'Amor Fati: will things as they come',
    bEl: 'Ο Μάρκος Αυρήλιος έγραφε: μη ζητάς να γίνονται όπως θέλεις. Θέλε τα όπως γίνονται — και θα ζήσεις ήρεμα.',
    bEn: 'Marcus Aurelius wrote: do not ask that things happen as you wish. Wish them as they happen, and you will live calmly.',
    src: 'Marcus Aurelius, Meditations',
  },
]

/* Live demo deck — tap to advance, cards promote with the app's spring. */
function DemoDeck({ isEl }) {
  const [index, setIndex] = useState(0)
  const visible = [0, 1, 2].map(d => DEMO_CARDS[(index + d) % 3])

  return (
    <div
      className="mf-hero__deck"
      onClick={() => setIndex(i => i + 1)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIndex(i => i + 1) } }}
      aria-label={isEl ? 'Δοκιμαστική στοίβα καρτών, πάτησε για την επόμενη' : 'Demo card stack, press for the next card'}
    >
      <AnimatePresence initial={false}>
        {visible.map((card, depth) => (
          <motion.article
            key={`${card.src}-${Math.floor((index + depth) / 3)}`}
            className="mf-hero__card"
            style={{ zIndex: 3 - depth }}
            initial={depth === 2 ? { opacity: 0, scale: 0.86, y: 34 } : false}
            animate={{
              scale: 1 - depth * 0.05,
              y: depth * 15,
              opacity: depth === 2 ? 0.5 : 1,
              x: 0,
              rotate: depth === 1 ? 1.6 : depth === 2 ? -2.2 : 0,
            }}
            exit={{ x: -420, rotate: -10, opacity: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <span className="mf-hero__chip">
              <CategoryIcon category={card.cat} size={11} />
              {isEl ? card.cat.name : card.catEn}
            </span>
            <strong>{isEl ? card.tEl : card.tEn}</strong>
            <p>{isEl ? card.bEl : card.bEn}</p>
            <span className="mf-hero__src">{card.src}</span>
          </motion.article>
        ))}
      </AnimatePresence>
      <span className="mf-hero__tap">
        <Icon name="undo" size={12} style={{ transform: 'scaleX(-1)' }} />
        {isEl ? 'Πάτησε την κάρτα' : 'Tap the card'}
      </span>
    </div>
  )
}

export default function Landing() {
  const t = useT()
  const isEl = t('auth.login') === 'Σύνδεση'

  const startDemo = () => window.dispatchEvent(new CustomEvent('mf:demo'))
  const scrollToId = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToAuth = () => scrollToId('mf-join')

  const NAV_LINKS = [
    { id: 'mf-how', tEl: 'Πώς λειτουργεί', tEn: 'How it works' },
    { id: 'mf-compare', tEl: 'Σύγκριση', tEn: 'Compare' },
    { id: 'mf-sources', tEl: 'Πηγές', tEn: 'Sources' },
  ]

  return (
    <div className="mf-lp">
      {/* ── Nav ── */}
      <nav className="mf-lp__nav">
        <span className="mf-lp__navbrand">
          <img src="/mark.svg" alt="" />
          MindFeed
        </span>
        <div className="mf-lp__navlinks">
          {NAV_LINKS.map(l => (
            <button key={l.id} className="mf-lp__navlink" onClick={() => scrollToId(l.id)}>
              {isEl ? l.tEl : l.tEn}
            </button>
          ))}
        </div>
        <button className="mf-lp__navlogin" onClick={scrollToAuth}>
          {t('auth.login')}
        </button>
      </nav>

      {/* ── Hero: statement left, live deck right ── */}
      <header className="mf-lp__hero">
        <span className="mf-lp__twinkle" aria-hidden="true" />
        <span className="mf-lp__twinkle" aria-hidden="true" />
        <span className="mf-lp__twinkle" aria-hidden="true" />
        <span className="mf-lp__twinkle" aria-hidden="true" />
        <motion.div className="mf-lp__hero-copy" variants={stagger} initial="hidden" animate="show">
          <motion.h1 variants={item}>
            {isEl
              ? <>Το αντίθετο του <em>doomscrolling</em>.</>
              : <>The opposite of <em>doomscrolling</em>.</>}
          </motion.h1>
          <motion.p variants={item}>
            {isEl
              ? 'Δέκα τεκμηριωμένες κάρτες γνώσης τη μέρα. Τις διαβάζεις σε πέντε λεπτά, και τελείωσες.'
              : 'Ten sourced knowledge cards a day. You read them in five minutes, and you are done.'}
          </motion.p>
          <motion.div className="mf-lp__hero-actions" variants={item}>
            <button className="mf-lp__cta" onClick={startDemo}>
              {isEl ? 'Δοκίμασέ το τώρα' : 'Try it now'}
            </button>
            <span className="mf-lp__hero-note">
              {isEl ? 'Δωρεάν, χωρίς λογαριασμό.' : 'Free, no account needed.'}
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          <DemoDeck isEl={isEl} />
        </motion.div>
      </header>

      {/* ── The promise: there is an end ── */}
      <motion.section className="mf-lp__ten" {...reveal}>
        <span className="mf-lp__ten-numeral" aria-hidden="true">10</span>
        <div className="mf-lp__ten-copy">
          <h2>{isEl ? 'Υπάρχει τέλος.' : 'There is an end.'}</h2>
          <p>
            {isEl
              ? 'Καμία ροή δεν ανανεώνεται επ’ άπειρον. Όταν κλείσεις τη δέκατη κάρτα, το MindFeed σε στέλνει πίσω στη ζωή σου.'
              : 'No feed refreshes forever here. When you close the tenth card, MindFeed sends you back to your life.'}
          </p>
        </div>
      </motion.section>

      {/* ── How it works ── */}
      <motion.section className="mf-lp__sec" id="mf-how" {...reveal}>
        <h2 className="mf-lp__title">{isEl ? 'Πώς λειτουργεί' : 'How it works'}</h2>
        <div className="mf-lp__flow">
          {[
            { icon: 'sun', tEl: 'Άνοιξε', dEl: 'Μία στοίβα από 10 κάρτες σε περιμένει κάθε πρωί.', tEn: 'Open', dEn: 'A stack of 10 cards waits for you every morning.' },
            { icon: 'book', tEl: 'Διάβασε', dEl: 'Κάθε κάρτα σε 1 λεπτό: το εύρημα, γιατί μετράει, η πηγή.', tEn: 'Read', dEn: 'Each card in a minute: the finding, why it matters, the source.' },
            { icon: 'check', tEl: 'Τέλος', dEl: 'Στη δέκατη κάρτα η ροή τελειώνει. Μέχρι αύριο.', tEn: 'Done', dEn: 'At card ten the feed ends. Until tomorrow.' },
          ].map(s => (
            <div className="mf-lp__step" key={s.icon}>
              <span className="mf-lp__node"><Icon name={s.icon} size={17} /></span>
              <h3>{isEl ? s.tEl : s.tEn}</h3>
              <p>{isEl ? s.dEl : s.dEn}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Compare ── */}
      <motion.section className="mf-lp__sec mf-lp__sec--compare" id="mf-compare" {...reveal}>
        <h2 className="mf-lp__title">{isEl ? 'Δύο είδη ροής' : 'Two kinds of feed'}</h2>
        <div className="mf-lp__compare">
          <div className="mf-lp__col mf-lp__col--them">
            <h3>{isEl ? 'Το άπειρο scroll' : 'The infinite scroll'}</h3>
            <ul>
              {(isEl
                ? ['Δεν τελειώνει ποτέ', 'Αλγόριθμος θυμού', 'Χαμένες ώρες', 'Άγχος χωρίς λόγο']
                : ['Never ends', 'Anger algorithm', 'Lost hours', 'Anxiety for nothing']
              ).map(x => <li key={x}><Icon name="x" size={13} />{x}</li>)}
            </ul>
          </div>
          <div className="mf-lp__vs" aria-hidden="true" />
          <div className="mf-lp__col mf-lp__col--us">
            <h3>MindFeed</h3>
            <ul>
              {(isEl
                ? ['Τελειώνει στις 10 κάρτες', 'Επιμελημένη γνώση', '5 λεπτά την ημέρα', 'Ηρεμία, με πηγές']
                : ['Ends at 10 cards', 'Curated knowledge', '5 minutes a day', 'Calm, with sources']
              ).map(x => <li key={x}><Icon name="check" size={13} />{x}</li>)}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* ── Sources ── */}
      <motion.section className="mf-lp__sec mf-lp__sources" id="mf-sources" {...reveal}>
        <h2>{isEl ? 'Καμία κάρτα χωρίς πηγή.' : 'No card without a source.'}</h2>
        <p>
          {isEl
            ? 'Κάθε γεγονός τεκμηριώνεται από papers, βιβλία και ανοιχτές βάσεις γνώσης.'
            : 'Every fact is backed by papers, books and open knowledge bases.'}
        </p>
        <ul>
          {['PubMed', 'arXiv', 'NASA', 'Wikipedia', 'Open Library'].map(s => <li key={s}>{s}</li>)}
        </ul>
      </motion.section>

      {/* ── Join ── */}
      <motion.section className="mf-lp__sec mf-lp__join" id="mf-join" {...reveal}>
        <div className="mf-lp__join-copy">
          <h2>{isEl ? <>Ξεκίνα <em>σήμερα</em>.</> : <>Start <em>today</em>.</>}</h2>
          <p>
            {isEl
              ? 'Με λογαριασμό, τα αποθηκευμένα και η ροή σου σε ακολουθούν σε κάθε συσκευή.'
              : 'With an account, your saves and your feed follow you on every device.'}
          </p>
        </div>
        <AuthCard />
      </motion.section>

      {/* ── Footer ── */}
      <footer className="mf-lp__footer">
        <span className="mf-lp__navbrand">
          <img src="/mark.svg" alt="" />
          MindFeed
        </span>
        <p>{isEl ? 'Γνώση που αξίζει.' : 'Knowledge that matters.'} · 2026</p>
      </footer>
    </div>
  )
}
