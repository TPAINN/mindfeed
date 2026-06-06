import { useState, useEffect, useCallback } from 'react'
import Card from './Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
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
    body: '30 λεπτά φυσικό φως εντός 1 ώρας από την αφύπνιση επαναρυθμίζει το κιρκάδιο ρολόι σου. Μειώνει την κορτιζόλη, ενισχύει τη σεροτονίνη και βελτιώνει την ποιότητα ύπνου το βράδυ — ανεξάρτητα από εποχή.',
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
    body: 'Shinrin-yoku (森林浴) — το «μπάνιο στο δάσος» — μειώνει τα επίπεδα κορτιζόλης κατά 12.4% και την αρτηριακή πίεση κατά 7% μετά από μόλις 2 ώρες. Τα φυτοχημικά (phytoncides) που εκπέμπουν τα δέντρα ενισχύουν τα NK cells του ανοσοποιητικού.',
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
    body: 'Το 2016, αστρονόμοι υπολόγισαν ότι το παρατηρήσιμο σύμπαν περιέχει τουλάχιστον 2 × 10¹² γαλαξίες — 20 φορές περισσότερους από την προηγούμενη εκτίμηση. Αν υπήρχε ένα αστέρι για κάθε κόκκο άμμου στη Γη, ο αριθμός των άστρων θα ήταν μικρότερος.',
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
    body: 'Ο εντερικός σωλήνας αποκαλείται «δεύτερος εγκέφαλος» με λόγο: έχει 500 εκατομμύρια νευρώνες και παράγει το 90% της σεροτονίνης του σώματος. Ο άξονας εντέρου-εγκεφάλου επηρεάζει απευθείας τη διάθεση, το άγχος και τη γνωστική λειτουργία.',
    tldr: 'Καλή διατροφή = καλύτερη διάθεση. Επιστημονικά.',
    whyItMatters: 'Τρόφιμα πλούσια σε πρεβιοτικά (σκόρδο, κρεμμύδι, βρώμη) ενισχύουν τη μικροβιομάζα που ρυθμίζει τη σεροτονίνη.',
    category: { emoji: '🧬', name: 'Βιολογία & Μικροβίωμα' },
    difficulty: 'medium', readTimeSec: 60,
    mood: ['surprising', 'practical'],
    source: { type: 'paper', title: 'The gut-brain axis', author: 'Cryan & Dinan', year: 2012, doi: '10.1038/nrn3346' },
  },
  {
    _id: '6',
    title: 'Ο Ύπνος Καθαρίζει Κυριολεκτικά τον Εγκέφαλο',
    body: 'Κατά τη διάρκεια του ύπνου, το γλυμφατικό σύστημα του εγκεφάλου ενεργοποιείται και «ξεπλένει» τις τοξικές πρωτεΐνες που συσσωρεύτηκαν την ημέρα — συμπεριλαμβανομένης της β-αμυλοειδούς που συνδέεται με Alzheimer. Η έλλειψη ύπνου διπλασιάζει τα επίπεδά της.',
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
    body: 'Ο Μάρκος Αυρήλιος έγραφε: «Να μην επιθυμείς τα πράγματα να γίνονται όπως θέλεις, αλλά να θέλεις τα πράγματα να γίνονται όπως είναι.» Η φιλοσοφική πρακτική της αποδοχής — όχι παθητική υποταγή, αλλά ενεργή επιλογή να επεξεργαστείς αυτό που υπάρχει.',
    tldr: 'Αποδέξου αυτό που δεν ελέγχεις. Άλλαξε αυτό που ελέγχεις.',
    whyItMatters: 'Η Στωική πρακτική μειώνει το άγχος κατά μέσο όρο 31% (μελέτες βασισμένες σε CBT).',
    category: { emoji: '🏛️', name: 'Φιλοσοφία & Στωικισμός' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['calming', 'inspiring'],
    source: { type: 'book', title: 'Meditations', author: 'Marcus Aurelius', year: 161, publisher: 'Penguin Classics' },
  },
  {
    _id: '8',
    title: 'Χταπόδια «Βλέπουν» Χρώματα Με Πλευρικούς Υποδοχείς',
    body: 'Τα χταπόδια είναι χρωματοτυφλά (έχουν μόνο ένα τύπο φωτοϋποδοχέα) αλλά αντιλαμβάνονται χρώμα μέσω κανακότρυπων (orrins) στο δέρμα τους. Πιθανώς «βλέπουν» χρώμα ολόκληρου του σώματος παρακάμπτοντας τα μάτια εντελώς.',
    tldr: 'Χταπόδια βλέπουν χρώμα με το δέρμα τους.',
    whyItMatters: 'Η νοημοσύνη και η αντίληψη μπορούν να εξελιχθούν με τρόπους εντελώς διαφορετικούς από τον ανθρώπινο.',
    category: { emoji: '🦁', name: 'Άγρια Φύση & Ζωολογία' },
    difficulty: 'medium', readTimeSec: 40,
    mood: ['surprising', 'mind-blowing'],
    source: { type: 'paper', title: 'Opsins in Octopus bimaculoides skin', author: 'Ramirez & Oakley', year: 2015, doi: '10.1098/rsbl.2015.0153' },
  },
  {
    _id: '9',
    title: 'Ο Κανόνας των 2 Λεπτών',
    body: 'Αν μια εργασία χρειάζεται λιγότερο από 2 λεπτά — κάνε την τώρα. Ο David Allen (GTD) τεκμηριώνει ότι η ψυχική ενέργεια που ξοδεύουμε για να «θυμόμαστε» μια μικρή εργασία και να την αναβάλλουμε είναι πολλαπλάσια από αυτή που κοστίζει η εκτέλεσή της.',
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
    body: '€1.000 με 7% ετήσιο επιτόκιο γίνονται €7.612 σε 30 χρόνια χωρίς να κάνεις τίποτα. Στα 40 χρόνια: €14.974. Το παράδοξο του ανατοκισμού είναι ότι ο χρόνος κάνει περισσότερη δουλειά από το κεφάλαιο μετά από κάποιο σημείο.',
    tldr: 'Ξεκίνα να αποταμιεύεις νωρίς. Ο χρόνος είναι το πιο ισχυρό εργαλείο.',
    whyItMatters: '€100/μήνα από τα 25 > €500/μήνα από τα 45, λόγω ανατοκισμού.',
    category: { emoji: '💰', name: 'Οικονομικός Αλφαβητισμός' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['practical', 'mind-blowing'],
    source: { type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', year: 2020, publisher: 'Harriman House' },
  },
]

function formatDate(date) {
  return date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Feed({ demo = false }) {
  const { logout } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set())
  const [animKey, setAnimKey] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function load() {
      if (demo) { setCards(MOCK_CARDS); setLoading(false); return }
      try {
        const data = await api.get('/api/feed/today')
        const feedCards = (data.cards || []).map(fc => fc.card).filter(Boolean)
        setCards(feedCards.length ? feedCards : MOCK_CARDS)
      } catch {
        setCards(MOCK_CARDS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [demo])

  const total = cards.length
  const current = cards[index]

  const goNext = useCallback(() => {
    if (index >= total - 1) { setDone(true); return }
    setAnimKey(k => k + 1)
    setIndex(i => i + 1)
  }, [index, total])

  const goBack = useCallback(() => {
    if (index === 0) return
    setAnimKey(k => k + 1)
    setIndex(i => i - 1)
  }, [index])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goBack()
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
  }

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0

  if (loading) {
    return (
      <div className="mf-feed mf-feed--loading">
        <div className="mf-skeleton" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="mf-feed">
        <div className="mf-done">
          <div className="mf-done__icon">✅</div>
          <h1 className="mf-done__title">Τελείωσες για σήμερα!</h1>
          <p className="mf-done__sub">
            {savedIds.size > 0
              ? `Αποθήκευσες ${savedIds.size} ${savedIds.size === 1 ? 'κάρτα' : 'κάρτες'}.`
              : 'Διάβασες όλες τις κάρτες.'}
          </p>
          <p className="mf-done__date">Επιστροφή αύριο με νέο υλικό 🌱</p>
          <button className="mf-done__restart" onClick={() => { setIndex(0); setDone(false) }}>
            Ξαναδές από την αρχή
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mf-feed">
      <header className="mf-feed__header">
        <span className="mf-feed__logo">🧠 MindFeed</span>
        <span className="mf-feed__date">{formatDate(new Date())}</span>
        <div className="mf-feed__header-right">
          <span className="mf-feed__counter">{index + 1}/{total}</span>
          {!demo && logout && (
            <button className="mf-feed__logout" onClick={logout} aria-label="Αποσύνδεση">
              ↩
            </button>
          )}
        </div>
      </header>

      <div className="mf-feed__progress-wrap">
        <div
          className="mf-feed__progress-bar"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <main className="mf-feed__main">
        <div className="mf-feed__card-wrap" key={animKey}>
          <Card
            card={current}
            isSaved={savedIds.has(current._id)}
            onSave={toggleSave}
            onComplete={goNext}
            onSkip={goBack}
          />
        </div>

        <div className="mf-feed__nav">
          <button
            className="mf-feed__nav-btn"
            onClick={goBack}
            disabled={index === 0}
            aria-label="Προηγούμενο"
          >
            ←
          </button>
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
            aria-label="Επόμενο"
          >
            →
          </button>
        </div>
      </main>
    </div>
  )
}
