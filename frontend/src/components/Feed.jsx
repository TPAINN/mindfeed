import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import Card from './Card'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/useT'
import { api, localDate } from '../api/client'
import { deckSpring, deckTravel, deckFlyX, deckSlot, fadeUpStagger, fadeUpItem } from '../motion/variants'
import './Feed.css'

const MOCK_CARDS = [
  {
    _id: '1',
    title: 'Ο Μύθος της Πολυεργασίας',
    body: 'Ο ανθρώπινος εγκέφαλος δεν μπορεί να κάνει δύο γνωστικές εργασίες ταυτόχρονα. Αυτό που αποκαλούμε «multitasking» είναι γρήγορη εναλλαγή — κοστίζει κατά μέσο όρο 23 λεπτά επιστροφής στη βαθιά εστίαση μετά από κάθε διακοπή.',
    tldr: 'Κάνε ένα πράγμα τη φορά. Η εστίαση είναι υπερδύναμη.',
    whyItMatters: 'Το multitasking μειώνει την παραγωγικότητα κατά 40%. Κλείσε τις ειδοποιήσεις για 90 λεπτά.',
    category: { emoji: '🧠', name: 'Νευροεπιστήμη' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['mind-blowing', 'practical'],
    source: { type: 'paper', title: 'The Cost of Interrupted Work', author: 'Gloria Mark', year: 2008, url: 'https://www.ics.uci.edu/~gmark/chi08-mark.pdf' },
  },
  {
    _id: '2',
    title: 'Το Πρωινό Φως Ρυθμίζει Όλα',
    body: '30 λεπτά φυσικό φως εντός 1 ώρας από την αφύπνιση επαναρυθμίζει το κιρκάδιο ρολόι σου. Μειώνει την κορτιζόλη, ενισχύει τη σεροτονίνη και βελτιώνει την ποιότητα ύπνου το βράδυ.',
    tldr: 'Πρωινός ήλιος = καλύτερος ύπνος + καλύτερη διάθεση.',
    whyItMatters: 'Η έκθεση στον ήλιο το πρωί ρυθμίζει την παραγωγή μελατονίνης για 16 ώρες μετά.',
    category: { emoji: '☀️', name: 'Circadian Biology' },
    difficulty: 'easy', readTimeSec: 40,
    mood: ['calming', 'practical'],
    source: { type: 'paper', title: 'Entrainment of the Human Circadian Clock', author: 'Roenneberg et al.', year: 2013, url: 'https://www.cell.com/current-biology/fulltext/S0960-9822(12)01464-8' },
  },
  {
    _id: '3',
    title: 'Το Δάσος Μειώνει την Κορτιζόλη',
    body: 'Shinrin-yoku — το «μπάνιο στο δάσος» — μειώνει τα επίπεδα κορτιζόλης κατά 12.4% και την αρτηριακή πίεση κατά 7% μετά από μόλις 2 ώρες. Τα phytoncides που εκπέμπουν τα δέντρα ενισχύουν τα NK cells του ανοσοποιητικού.',
    tldr: '2 ώρες σε δάσος = χαμηλότερο στρες + ισχυρότερο ανοσοποιητικό.',
    whyItMatters: 'Δεν χρειάζεσαι γυμναστήριο ή φάρμακα. Μια βόλτα στη φύση κάνει χημική διαφορά.',
    category: { emoji: '🌿', name: 'Φύση & Biophilia' },
    difficulty: 'easy', readTimeSec: 50,
    mood: ['calming', 'inspiring'],
    source: { type: 'paper', title: 'Forest Bathing Enhances Human Natural Killer Activity', author: 'Li et al.', year: 2007, doi: '10.1007/s007640070069' },
  },
  {
    _id: '4',
    title: 'Το Σύμπαν Έχει 2 Τρισεκατομμύρια Γαλαξίες',
    body: 'Το 2016, αστρονόμοι υπολόγισαν ότι το παρατηρήσιμο σύμπαν περιέχει τουλάχιστον 2 × 10¹² γαλαξίες — 20 φορές περισσότερους από την προηγούμενη εκτίμηση.',
    tldr: 'Ο Γαλαξίας μας είναι 1 στα 2.000.000.000.000.',
    whyItMatters: 'Η κατανόηση της κλίμακας του σύμπαντος μεταβάλλει τον τρόπο που αντιμετωπίζουμε τα καθημερινά μας προβλήματα.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία' },
    difficulty: 'medium', readTimeSec: 55,
    mood: ['mind-blowing', 'inspiring'],
    source: { type: 'paper', title: 'Galaxy counts in the deep fields', author: 'Conselice et al.', year: 2016, doi: '10.3847/0004-637X/830/2/83' },
  },
  {
    _id: '5',
    title: 'Το 90% της Σεροτονίνης Παράγεται στο Έντερο',
    body: 'Ο εντερικός σωλήνας αποκαλείται «δεύτερος εγκέφαλος» με λόγο: έχει 500 εκατομμύρια νευρώνες και παράγει το 90% της σεροτονίνης του σώματος.',
    tldr: 'Καλή διατροφή = καλύτερη διάθεση. Επιστημονικά.',
    whyItMatters: 'Τρόφιμα πλούσια σε πρεβιοτικά ενισχύουν τη μικροβιομάζα που ρυθμίζει τη σεροτονίνη.',
    category: { emoji: '🧬', name: 'Βιολογία & Μικροβίωμα' },
    difficulty: 'medium', readTimeSec: 60,
    mood: ['surprising', 'practical'],
    source: { type: 'paper', title: 'The gut-brain axis', author: 'Cryan & Dinan', year: 2012, doi: '10.1038/nrn3346' },
  },
  {
    _id: '6',
    title: 'Ο Ύπνος Καθαρίζει Κυριολεκτικά τον Εγκέφαλο',
    body: 'Κατά τη διάρκεια του ύπνου, το γλυμφατικό σύστημα ενεργοποιείται και «ξεπλένει» τοξικές πρωτεΐνες — συμπεριλαμβανομένης της β-αμυλοειδούς που συνδέεται με Alzheimer. Η έλλειψη ύπνου διπλασιάζει τα επίπεδά της.',
    tldr: '7-9 ώρες ύπνου = χαμηλότερος κίνδυνος Alzheimer.',
    whyItMatters: 'Ο ύπνος δεν είναι πολυτέλεια — είναι η μοναδική φορά που ο εγκέφαλος επισκευάζεται.',
    category: { emoji: '🍎', name: 'Υγεία & Longevity' },
    difficulty: 'easy', readTimeSec: 50,
    mood: ['surprising', 'practical'],
    source: { type: 'book', title: 'Why We Sleep', author: 'Matthew Walker', year: 2017, publisher: 'Scribner' },
  },
  {
    _id: '7',
    title: 'Amor Fati — Αγάπα την Τύχη σου',
    body: 'Ο Μάρκος Αυρήλιος έγραφε: «Να μην επιθυμείς τα πράγματα να γίνονται όπως θέλεις, αλλά να θέλεις τα πράγματα να γίνονται όπως είναι.»',
    tldr: 'Αποδέξου αυτό που δεν ελέγχεις. Άλλαξε αυτό που ελέγχεις.',
    whyItMatters: 'Η Στωική πρακτική μειώνει το άγχος κατά μέσο όρο 31%.',
    category: { emoji: '🏛️', name: 'Φιλοσοφία & Στωικισμός' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['calming', 'inspiring'],
    source: { type: 'book', title: 'Meditations', author: 'Marcus Aurelius', year: 161, publisher: 'Penguin Classics' },
  },
  {
    _id: '8',
    title: 'Χταπόδια «Βλέπουν» Χρώματα Με Πλευρικούς Υποδοχείς',
    body: 'Τα χταπόδια είναι χρωματοτυφλά αλλά αντιλαμβάνονται χρώμα μέσω ειδικών υποδοχέων στο δέρμα τους — πιθανώς «βλέπουν» χρώμα ολόκληρου του σώματος παρακάμπτοντας τα μάτια.',
    tldr: 'Χταπόδια βλέπουν χρώμα με το δέρμα τους.',
    whyItMatters: 'Η νοημοσύνη μπορεί να εξελιχθεί με τρόπους εντελώς διαφορετικούς από τον ανθρώπινο.',
    category: { emoji: '🦁', name: 'Άγρια Φύση & Ζωολογία' },
    difficulty: 'medium', readTimeSec: 40,
    mood: ['surprising', 'mind-blowing'],
    source: { type: 'paper', title: 'Opsins in Octopus bimaculoides skin', author: 'Ramirez & Oakley', year: 2015, doi: '10.1098/rsbl.2015.0153' },
  },
  {
    _id: '9',
    title: 'Ο Κανόνας των 2 Λεπτών',
    body: 'Αν μια εργασία χρειάζεται λιγότερο από 2 λεπτά — κάνε την τώρα. Η ψυχική ενέργεια που ξοδεύουμε για να «θυμόμαστε» μια μικρή εργασία είναι πολλαπλάσια από αυτή που κοστίζει η εκτέλεσή της.',
    tldr: 'Κάτω από 2 λεπτά; Κάνε το τώρα.',
    whyItMatters: 'Μειώνει την «ανοιχτή λούπα» στο μυαλό — το κόστος να κρατάς εκκρεμότητες στη μνήμη.',
    category: { emoji: '💪', name: 'Self-Improvement' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['practical', 'motivating'],
    source: { type: 'book', title: 'Getting Things Done', author: 'David Allen', year: 2001, publisher: 'Penguin Books' },
  },
  {
    _id: '10',
    title: 'Ανατοκισμός: Το 8ο Θαύμα του Κόσμου',
    body: '€1.000 με 7% ετήσιο επιτόκιο γίνονται €7.612 σε 30 χρόνια χωρίς να κάνεις τίποτα. Το παράδοξο του ανατοκισμού είναι ότι ο χρόνος κάνει περισσότερη δουλειά από το κεφάλαιο.',
    tldr: 'Ξεκίνα να αποταμιεύεις νωρίς. Ο χρόνος είναι το πιο ισχυρό εργαλείο.',
    whyItMatters: '€100/μήνα από τα 25 > €500/μήνα από τα 45, λόγω ανατοκισμού.',
    category: { emoji: '💰', name: 'Οικονομικός Αλφαβητισμός' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['practical', 'mind-blowing'],
    source: { type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', year: 2020, publisher: 'Harriman House' },
  },
]

const SWIPE_OFFSET   = 100
const SWIPE_VELOCITY = 500

function formatDate(date, lang = 'el') {
  return date.toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8)
}

// ── Deck card: one component for every depth so promotion from the stack to
// the top is a prop change (smooth spring), never a remount (blink).
// Rotation is always derived from x — it follows every horizontal travel
// (drag, fly-out, fly-in, demote) automatically, with no snapping.
function DeckCard({ depth, isTop, canGoBack, onNext, onBack, reduceMotion, enterFromLeft, children }) {
  const x = useMotionValue(0)
  const rotate      = useTransform(x, [-300, 300], [-13, 13])
  const nextStamp   = useTransform(x, [-130, -36], [1, 0])
  const backStamp   = useTransform(x, [36, 130], [0, 1])
  const nextScale   = useTransform(x, [-130, -36], [1, 0.7])
  const backScale   = useTransform(x, [36, 130], [0.7, 1])

  function handleDragEnd(_, info) {
    const { offset, velocity } = info
    if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) {
      haptic()
      onNext()
    } else if (canGoBack && (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY)) {
      haptic()
      onBack()
    }
  }

  return (
    <motion.div
      className={`mf-deck__card${isTop ? ' mf-deck__card--top' : ''}`}
      style={{
        x,
        rotate: reduceMotion ? 0 : rotate,
        zIndex: 3 - depth,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      initial={
        isTop && enterFromLeft
          // Mirror of the exit: same distance, same fade — rotation follows x
          ? { ...deckSlot(0), x: reduceMotion ? 0 : -deckFlyX(), opacity: 0 }
          : { ...deckSlot(depth + 1), opacity: 0 }
      }
      animate={{ x: 0, ...deckSlot(depth) }}
      exit={
        isTop
          ? {
              x: reduceMotion ? 0 : -deckFlyX(),
              opacity: 0,
              transition: deckTravel,
            }
          : { opacity: 0, transition: { duration: 0.15 } }
      }
      transition={{
        ...deckSpring,
        x: deckTravel,
        opacity: deckTravel,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragDirectionLock
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      aria-hidden={!isTop}
    >
      {/* Swipe stamps — opacity rides on x, so they fade on any travel */}
      <motion.div
        className="mf-stamp mf-stamp--next"
        style={{ opacity: nextStamp, scale: nextScale }}
        aria-hidden
      >✓</motion.div>
      <motion.div
        className="mf-stamp mf-stamp--back"
        style={{ opacity: canGoBack ? backStamp : 0, scale: backScale }}
        aria-hidden
      >↩</motion.div>
      {children}
    </motion.div>
  )
}

export default function Feed({ demo = false, onBookmarks }) {
  const { logout } = useAuth()
  const { lang }   = useLang()
  const t          = useT()
  const reduceMotion = useReducedMotion()

  const [cards, setCards]       = useState(() => (demo ? MOCK_CARDS : []))
  const [loading, setLoading]   = useState(!demo)
  const [slowLoad, setSlowLoad] = useState(false)
  const [error, setError]       = useState(false)
  const [index, setIndex]       = useState(0)
  const [lastDir, setLastDir]   = useState(1)   // 1 = forward, -1 = back
  const [savedIds, setSavedIds] = useState(new Set())
  const [done, setDone]         = useState(false)
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('mf_swiped'))
  const completedRef = useRef(new Set())

  const load = useCallback(async () => {
    if (demo) return
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000)
    try {
      const [feedData, bookmarks] = await Promise.all([
        api.get(`/api/feed/today?date=${localDate()}`),
        api.get('/api/users/bookmarks').catch(() => []),
      ])
      const entries   = feedData.cards || []
      const feedCards = entries.map(fc => fc.card).filter(Boolean)
      if (!feedCards.length) throw new Error('Empty feed')

      entries.forEach(fc => {
        if (fc.isCompleted && fc.card) completedRef.current.add(fc.card._id)
      })
      const firstOpen = entries.findIndex(fc => !fc.isCompleted)

      setCards(feedCards)
      setSavedIds(new Set((bookmarks || []).map(b => b._id)))
      if (firstOpen === -1) setDone(true)
      else setIndex(firstOpen)
    } catch {
      setError(true)
    } finally {
      clearTimeout(slowTimer)
      setSlowLoad(false)
      setLoading(false)
    }
  }, [demo])

  // Fetch-on-mount: every setState in load() runs after an await, so it
  // cannot cascade renders — the rule can't see through the async boundary.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const total   = cards.length

  const markCompleted = useCallback((card) => {
    if (demo || !card || completedRef.current.has(card._id)) return
    completedRef.current.add(card._id)
    api.patch(`/api/feed/complete/${card._id}?date=${localDate()}`).catch(() => {
      completedRef.current.delete(card._id)
    })
  }, [demo])

  const goNext = useCallback(() => {
    markCompleted(cards[index])
    if (showHint) { setShowHint(false); localStorage.setItem('mf_swiped', '1') }
    setLastDir(1)
    if (index >= total - 1) { setDone(true); return }
    setIndex(i => i + 1)
  }, [index, total, cards, markCompleted, showHint])

  const goBack = useCallback(() => {
    if (index === 0) return
    setLastDir(-1)
    setIndex(i => i - 1)
  }, [index])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goBack])

  function toggleSave(id) {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    if (!demo) {
      api.post(`/api/users/bookmark/${id}`).catch(console.error)
    }
  }

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0

  if (loading) {
    return (
      <div className="mf-feed mf-feed--loading">
        <div className="mf-skeleton" />
        {slowLoad && <p className="mf-loading-hint">{t('feed.loading.slow')}</p>}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mf-feed mf-feed--loading">
        <motion.div
          className="mf-error"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mf-error__icon">📡</div>
          <h2 className="mf-error__title">{t('feed.error.title')}</h2>
          <p className="mf-error__sub">{t('feed.error.sub')}</p>
          <button
            className="mf-error__retry"
            onClick={() => { setError(false); setLoading(true); load() }}
          >
            {t('feed.retry')}
          </button>
        </motion.div>
      </div>
    )
  }

  if (done) {
    const nounKey = savedIds.size === 1 ? 'feed.done.noun.one' : 'feed.done.noun.many'
    return (
      <div className="mf-feed">
        <motion.div
          className="mf-done"
          variants={fadeUpStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="mf-done__icon"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          >✅</motion.div>
          <div className="mf-done__confetti" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="mf-confetti-piece" style={{ '--i': i }} />
            ))}
          </div>
          <motion.h1 className="mf-done__title" variants={fadeUpItem}>{t('feed.done.title')}</motion.h1>
          <motion.p className="mf-done__sub" variants={fadeUpItem}>
            {savedIds.size > 0
              ? t('feed.done.sub.saved', { count: savedIds.size, noun: t(nounKey) })
              : t('feed.done.sub.read')}
          </motion.p>
          <motion.p className="mf-done__date" variants={fadeUpItem}>{t('feed.done.return')}</motion.p>
          <motion.button
            className="mf-done__restart"
            variants={fadeUpItem}
            onClick={() => { setIndex(0); setDone(false); setLastDir(-1) }}
          >
            {t('feed.done.restart')}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const visible = cards.slice(index, index + 3)

  return (
    <div className="mf-feed">
      <header className="mf-feed__header">
        <span className="mf-feed__logo">🧠 MindFeed</span>
        <span className="mf-feed__date">{formatDate(new Date(), lang)}</span>
        <div className="mf-feed__header-right">
          <span className="mf-feed__counter" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={index}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                style={{ display: 'inline-block' }}
              >
                {index + 1}
              </motion.span>
            </AnimatePresence>
            /{total}
          </span>
          {onBookmarks && (
            <button
              className="mf-feed__bookmark-btn"
              onClick={onBookmarks}
              aria-label={t('nav.bookmarks')}
              title={t('nav.bookmarks')}
            >
              🔖
            </button>
          )}
          {!demo && logout && (
            <button className="mf-feed__logout" onClick={logout} aria-label={t('nav.logout')}>
              ↩
            </button>
          )}
        </div>
      </header>

      <div className="mf-feed__progress-wrap">
        <motion.div
          className="mf-feed__progress-bar"
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <main className="mf-feed__main">
        <div className="mf-deck">
          <AnimatePresence initial={false}>
            {visible.map((card, depth) => (
              <DeckCard
                key={card._id}
                depth={depth}
                isTop={depth === 0}
                canGoBack={index > 0}
                onNext={goNext}
                onBack={goBack}
                reduceMotion={reduceMotion}
                enterFromLeft={lastDir === -1}
              >
                <Card
                  card={card}
                  isSaved={savedIds.has(card._id)}
                  onSave={depth === 0 ? toggleSave : undefined}
                />
              </DeckCard>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showHint && (
              <motion.div
                className="mf-swipe-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.span
                  className="mf-swipe-hint__arrow"
                  animate={reduceMotion ? {} : { x: [-2, -14, -2] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >←</motion.span>
                {t('feed.swipe_hint')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mf-feed__nav">
          <button
            className="mf-feed__nav-btn"
            onClick={goBack}
            disabled={index === 0}
            aria-label={t('nav.back')}
          >←</button>
          <div className="mf-feed__dots">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`mf-dot${i === index ? ' mf-dot--active' : i < index ? ' mf-dot--done' : ''}`}
              />
            ))}
          </div>
          <button
            className="mf-feed__nav-btn"
            onClick={goNext}
            aria-label={t('feed.next')}
          >→</button>
        </div>
      </main>
    </div>
  )
}
