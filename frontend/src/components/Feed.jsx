import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import Card from './Card'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import LangToggle from './LangToggle'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { useBookmarks } from '../context/BookmarkContext'
import { useT } from '../i18n/useT'
import { api, localDate } from '../api/client'
import { deckSpring, deckTravel, deckFlyX, deckSlot, fadeUpStagger, fadeUpItem } from '../motion/variants'
import './Feed.css'

const MOCK_CARDS = [
  {
    _id: '1',
    title: 'Γιατί βλέπουμε την ίδια όψη της Σελήνης;',
    body: 'Η Σελήνη περιστρέφεται γύρω από τον άξονά της στον ίδιο χρόνο που χρειάζεται για να κάνει μια περιφορά γύρω από τη Γη. Έτσι, μας δείχνει σχεδόν την ίδια όψη. Αυτή η σύμπτωση των δύο κινήσεων ονομάζεται σύγχρονη περιστροφή.',
    tldr: 'Μία περιστροφή για κάθε περιφορά γύρω από τη Γη.',
    whyItMatters: 'Η σταθερή όψη της Σελήνης είναι αποτέλεσμα κίνησης, όχι ακινησίας.',
    titleEn: 'Why do we see the same face of the Moon?',
    bodyEn: 'The Moon takes the same time to rotate on its axis as it does to orbit Earth. As a result, it keeps nearly the same face toward us. Astronomers call this matching of the two motions synchronous rotation.',
    tldrEn: 'One rotation for each orbit around Earth.',
    whyEn: 'The familiar face of the Moon is a consequence of its motion.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
    difficulty: 'easy', readTimeSec: 30,
    mood: ['surprising'],
    source: { type: 'website', title: 'Moon Facts', author: 'NASA', url: 'https://science.nasa.gov/moon/facts/' },
  },
  {
    _id: '2',
    title: 'Οι μικροσκοπικοί κάτοικοι των κοραλλιών',
    body: 'Πολλά κοράλλια αποτελούνται από αποικίες μικρών ζώων που λέγονται πολύποδες. Οι πολύποδες των σκληρών κοραλλιών παράγουν έναν σκελετό από ανθρακικό ασβέστιο. Καθώς διαδοχικές γενιές αναπτύσσονται πάνω στους παλιότερους σκελετούς, σχηματίζεται σταδιακά η δομή ενός υφάλου.',
    tldr: 'Οι κοραλλιογενείς ύφαλοι χτίζονται από μικρά ζώα.',
    whyItMatters: 'Ο ύφαλος που βλέπουμε περιλαμβάνει τόσο ζωντανές αποικίες όσο και σκελετούς προηγούμενων γενεών.',
    titleEn: 'The tiny animals inside a coral reef',
    bodyEn: 'Many corals are colonies of small animals called polyps. Stony coral polyps produce a calcium carbonate skeleton. As successive generations grow over older skeletons, they gradually build the structure of a reef.',
    tldrEn: 'Coral reefs are built by tiny animals.',
    whyEn: 'A reef includes both living colonies and the skeletons left by earlier generations.',
    category: { emoji: '🦁', name: 'Άγρια Φύση & Ζωολογία', slug: 'wildlife' },
    difficulty: 'easy', readTimeSec: 30,
    mood: ['surprising'],
    source: { type: 'website', title: 'Are corals animals or plants?', author: 'NOAA', url: 'https://oceanservice.noaa.gov/facts/coral.html' },
  },
  {
    _id: '3',
    title: 'Δύο διαφορετικά ρολόγια στην Αφροδίτη',
    body: 'Η Αφροδίτη ολοκληρώνει μια περιστροφή γύρω από τον άξονά της σε περίπου 243 γήινες ημέρες. Μια περιφορά της γύρω από τον Ήλιο διαρκεί περίπου 225. Η περιστροφή της λοιπόν κρατά περισσότερο από το έτος της. Ο χρόνος ανάμεσα σε δύο ανατολές είναι διαφορετική μέτρηση.',
    tldr: 'Στην Αφροδίτη, μία περιστροφή διαρκεί περισσότερο από ένα έτος.',
    whyItMatters: 'Η λέξη «ημέρα» χρειάζεται διευκρίνιση όταν συγκρίνουμε την περιστροφή και την εμφάνιση του Ήλιου.',
    titleEn: 'Two different clocks on Venus',
    bodyEn: 'Venus completes one rotation on its axis in about 243 Earth days. Its orbit around the Sun takes about 225. One rotation therefore lasts longer than its year. The interval between two sunrises is a different measurement.',
    tldrEn: 'One rotation on Venus takes longer than its year.',
    whyEn: 'A rotation and a sunrise-to-sunrise day measure different things.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['surprising'],
    source: { type: 'website', title: 'Venus Facts', author: 'NASA', url: 'https://science.nasa.gov/venus/facts/' },
  },
  {
    _id: '4',
    title: 'Ένα δάσος από φύκη',
    body: 'Τα kelp είναι μεγάλα καφέ φύκη που σχηματίζουν πυκνές συστάδες σε δροσερά παράκτια νερά. Τα υποθαλάσσια αυτά δάση προσφέρουν τροφή και καταφύγιο σε πολλά θαλάσσια είδη. Επειδή τα φύκη χρειάζονται φως για φωτοσύνθεση, αναπτύσσονται σε σχετικά ρηχά νερά.',
    tldr: 'Τα δάση kelp είναι κοινότητες μεγάλων καφέ φυκών.',
    whyItMatters: 'Το διαθέσιμο φως βοηθά να εξηγήσουμε πού μπορούν να αναπτυχθούν αυτά τα υποθαλάσσια οικοσυστήματα.',
    titleEn: 'A forest made of algae',
    bodyEn: 'Kelp are large brown algae that grow in dense groups in cool coastal waters. These underwater forests provide food and shelter for many marine species. Their need for sunlight for photosynthesis keeps them in relatively shallow water.',
    tldrEn: 'Kelp forests are communities of large brown algae.',
    whyEn: 'Available light helps explain where these underwater ecosystems can grow.',
    category: { emoji: '🌿', name: 'Φύση & Biophilia', slug: 'nature' },
    difficulty: 'easy', readTimeSec: 30,
    mood: ['inspiring'],
    source: { type: 'website', title: 'What is a kelp forest?', author: 'NOAA', url: 'https://oceanservice.noaa.gov/facts/kelp.html' },
  },
  {
    _id: '5',
    title: 'Ο Άρης έχει εποχές',
    body: 'Ο άξονας περιστροφής του Άρη είναι κεκλιμένος, όπως και της Γης, και ο πλανήτης έχει εποχές. Επειδή χρειάζεται περισσότερο χρόνο για μια περιφορά γύρω από τον Ήλιο, οι εποχές του διαρκούν περισσότερο. Δεν έχουν όλες την ίδια διάρκεια: η ελλειπτική τροχιά του επηρεάζει τον χρόνο κάθε εποχής.',
    tldr: 'Στον Άρη, οι εποχές είναι μεγαλύτερες και άνισες σε διάρκεια.',
    whyItMatters: 'Το μήκος μιας εποχής συνδέεται τόσο με την κλίση του άξονα όσο και με την τροχιά.',
    titleEn: 'Mars has seasons, too',
    bodyEn: 'Like Earth, Mars has a tilted rotation axis and experiences seasons. Its longer journey around the Sun makes its seasons longer than ours. They also differ in duration because of its elliptical orbit.',
    tldrEn: 'Martian seasons are longer and unequal in length.',
    whyEn: 'Understanding a season means considering both axial tilt and orbital motion.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['surprising'],
    source: { type: 'website', title: 'Mars Facts', author: 'NASA', url: 'https://science.nasa.gov/mars/facts/' },
  },
  {
    _id: '6',
    title: 'Το φυτοπλαγκτόν ακολουθεί το φως',
    body: 'Το φυτοπλαγκτόν περιλαμβάνει μικροσκοπικούς φωτοσυνθετικούς οργανισμούς. Όπως τα φυτά της στεριάς, διαθέτει χλωροφύλλη και χρειάζεται ηλιακό φως για να αναπτυχθεί. Μεγάλο μέρος του επιπλέει στα ανώτερα στρώματα του ωκεανού, όπου φτάνει το φως. Για την ανάπτυξή του χρειάζεται επίσης θρεπτικά συστατικά του νερού.',
    tldr: 'Φως και θρεπτικά συστατικά στηρίζουν την ανάπτυξη του φυτοπλαγκτού.',
    whyItMatters: 'Η θέση αυτών των μικροσκοπικών οργανισμών στον ωκεανό συνδέεται με τον τρόπο που τρέφονται.',
    titleEn: 'Phytoplankton live where light reaches',
    bodyEn: 'Phytoplankton include microscopic photosynthetic organisms. Like land plants, they contain chlorophyll and need sunlight to grow. Much of this plankton floats in the upper ocean, where light penetrates the water. Growth also depends on nutrients in the surrounding water.',
    tldrEn: 'Light and nutrients support phytoplankton growth.',
    whyEn: 'Where these tiny organisms live is connected to how they obtain energy.',
    category: { emoji: '🌿', name: 'Φύση & Biophilia', slug: 'nature' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['inspiring'],
    source: { type: 'website', title: 'What are phytoplankton?', author: 'NOAA', url: 'https://oceanservice.noaa.gov/facts/phyto.html' },
  },
  {
    _id: '7',
    title: 'Οι λίμνες του Τιτάνα έχουν άλλη χημεία',
    body: 'Ο Τιτάνας, το μεγαλύτερο φεγγάρι του Κρόνου, έχει σύννεφα, βροχή και λίμνες. Στην εξαιρετικά κρύα επιφάνειά του, τα υγρά αυτά είναι κυρίως υδρογονάνθρακες, όπως μεθάνιο και αιθάνιο. Ένας κύκλος εξάτμισης, βροχής και ροής θυμίζει τον κύκλο του νερού στη Γη, με διαφορετικά υλικά.',
    tldr: 'Στον Τιτάνα, μεθάνιο και αιθάνιο σχηματίζουν λίμνες.',
    whyItMatters: 'Παρόμοιες διεργασίες μπορούν να διαμορφώνουν τοπία σε κόσμους με πολύ διαφορετικές θερμοκρασίες και χημεία.',
    titleEn: 'The lakes of Titan have different chemistry',
    bodyEn: 'Titan, the largest moon of Saturn, has clouds, rain and lakes. On its extremely cold surface, these liquids are mainly hydrocarbons such as methane and ethane. Evaporation, rainfall and flowing liquid form a cycle resembling the water cycle on Earth, using different materials.',
    tldrEn: 'Methane and ethane form lakes on Titan.',
    whyEn: 'Similar processes can shape landscapes under very different temperatures and chemical conditions.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['surprising'],
    source: { type: 'website', title: 'Titan Facts', author: 'NASA', url: 'https://science.nasa.gov/saturn/moons/titan/facts/' },
  },
  {
    _id: '8',
    title: 'Οι φωτεινές γραμμές γύρω από έναν κρατήρα',
    body: 'Σε εικόνες του Ερμή, ορισμένοι κρατήρες περιβάλλονται από φωτεινές ακτίνες. Πρόκειται για θρυμματισμένο πέτρωμα που εκτοξεύτηκε κατά την πρόσκρουση και έπεσε ξανά στην επιφάνεια. Τα μικρά σωματίδια αντανακλούν περισσότερο φως. Με τον χρόνο, το διαστημικό περιβάλλον σκουραίνει αυτές τις ακτίνες.',
    tldr: 'Οι ακτίνες των κρατήρων είναι ίχνη εκτοξευμένου πετρώματος.',
    whyItMatters: 'Μια εικόνα της επιφάνειας διατηρεί στοιχεία τόσο της πρόσκρουσης όσο και της μεταγενέστερης αλλοίωσης.',
    titleEn: 'The bright lines around a crater',
    bodyEn: 'Some craters on Mercury are surrounded by bright rays. These are crushed rocks thrown outward by an impact and deposited on the surface. Small particles reflect more light. Over time, exposure to the space environment darkens the rays.',
    tldrEn: 'Crater rays trace rock scattered by an impact.',
    whyEn: 'A surface image preserves clues about both an impact and the changes that followed.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['surprising'],
    source: { type: 'website', title: 'Mercury Facts', author: 'NASA', url: 'https://science.nasa.gov/mercury/facts/' },
  },
  {
    _id: '9',
    title: 'Πώς ανάβει το σέλας;',
    body: 'Ο ηλιακός άνεμος μεταφέρει φορτισμένα σωματίδια από τον Ήλιο. Όταν σωματίδια αλληλεπιδρούν με το μαγνητικό πεδίο της Γης και συγκρούονται με την ανώτερη ατμόσφαιρα κοντά στους πόλους, τα ατμοσφαιρικά αέρια εκπέμπουν φως. Αυτό παρατηρούμε ως βόρειο ή νότιο σέλας.',
    tldr: 'Το σέλας είναι φως που εκπέμπει η ανώτερη ατμόσφαιρα.',
    whyItMatters: 'Το φαινόμενο κάνει ορατή μια αλληλεπίδραση ανάμεσα στον Ήλιο, το μαγνητικό πεδίο και την ατμόσφαιρα.',
    titleEn: 'What makes an aurora glow?',
    bodyEn: 'The solar wind carries charged particles from the Sun. When particles interact with the magnetic field of Earth and collide with its upper atmosphere near the poles, atmospheric gases emit light. We see this as the northern or southern lights.',
    tldrEn: 'Auroras are light emitted by the upper atmosphere.',
    whyEn: 'An aurora reveals an interaction between the Sun, the magnetic field and the atmosphere.',
    category: { emoji: '🌿', name: 'Φύση & Biophilia', slug: 'nature' },
    difficulty: 'easy', readTimeSec: 30,
    mood: ['inspiring'],
    source: { type: 'website', title: 'Earth Facts', author: 'NASA', url: 'https://science.nasa.gov/earth/facts/' },
  },
  {
    _id: '10',
    title: 'Ο πλανήτης που περιστρέφεται στο πλάι',
    body: 'Ο άξονας του Ουρανού έχει τόσο μεγάλη κλίση ώστε ο πλανήτης μοιάζει να περιστρέφεται στο πλάι. Καθώς περιφέρεται γύρω από τον Ήλιο, κάθε πόλος περνά μεγάλα διαστήματα στο φως και στο σκοτάδι. Η ασυνήθιστη αυτή γεωμετρία δημιουργεί ακραίες εποχικές διαφορές.',
    tldr: 'Η μεγάλη κλίση του Ουρανού διαμορφώνει τις εποχές του.',
    whyItMatters: 'Η κατεύθυνση του άξονα αλλάζει δραστικά τον τρόπο που ένας πλανήτης δέχεται το ηλιακό φως.',
    titleEn: 'The planet that spins on its side',
    bodyEn: 'The rotation axis of Uranus is tilted so far that the planet appears to spin on its side. As it orbits the Sun, each pole experiences long stretches of light and darkness. This unusual geometry produces extreme seasonal differences.',
    tldrEn: 'The extreme tilt of Uranus shapes its seasons.',
    whyEn: 'The direction of a rotation axis changes how a planet receives sunlight.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
    difficulty: 'easy', readTimeSec: 30,
    mood: ['surprising'],
    source: { type: 'website', title: 'Uranus Facts', author: 'NASA', url: 'https://science.nasa.gov/uranus/facts/' },
  },
]

const SWIPE_OFFSET   = 90
const SWIPE_VELOCITY = 450
const ARM_AT         = -58  // drag x where the card visually "arms" before release

function formatDate(date, lang = 'el') {
  return date.toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8)
}

// Scroll depth per card id, kept at module scope (not a ref): it survives the
// deck's mount/unmount cycle so swiping away and back lands where you left
// off, and it is never read during render in a way that affects output.
const scrollPositions = new Map()

// ── Deck card: one component for every depth so promotion from the stack to
// the top is a prop change (smooth spring), never a remount (blink).
// Rotation is always derived from x — it follows every horizontal travel
// (drag, fly-out, fly-in, demote) automatically, with no snapping.
function DeckCard({ depth, isTop, canGoBack, hasNext, onArmChange, onNext, onBack, direction, children }) {
  const x = useMotionValue(0)
  const rotate      = useTransform(x, [-250, 250], [-15, 15])
  const nextStamp   = useTransform(x, [-120, -28], [1, 0])
  const backStamp   = useTransform(x, [28, 120], [0, 1])
  const nextScale   = useTransform(x, [-120, -28], [1, 0.7])
  const backScale   = useTransform(x, [28, 120], [0.7, 1])
  const dragOpacity = useTransform(x, [-350, -180, 0, 180, 350], [0.6, 1, 1, 1, 0.6])
  const armedRef    = useRef(false)

  // As the top card is pulled left, cross the arm point and the deck signals
  // "release = dismiss": the top card lights up and the card beneath rises.
  function armForNext(armed) {
    if (armed === armedRef.current) return
    armedRef.current = armed
    onArmChange?.(armed)
  }

  function handleDrag(_, info) {
    if (!isTop || !hasNext) return
    armForNext(info.offset.x <= ARM_AT)
  }

  function handleDragEnd(_, info) {
    armForNext(false)
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
        rotate,
        opacity: isTop ? dragOpacity : undefined,
        zIndex: 3 - depth,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      initial={
        isTop && direction === -1
          // Mirror of the exit: same distance, same fade — rotation follows x
          ? { ...deckSlot(0), x: -deckFlyX(), opacity: 0 }
          : { ...deckSlot(depth + 1), opacity: 0 }
      }
      animate={{ x: 0, ...deckSlot(depth) }}
      exit={
        isTop
          ? {
              x: -deckFlyX() * direction,
              scale: 0.94,          // recede as it leaves — depth cue, not a flat slide
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
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      aria-hidden={!isTop}
    >
      {/* Swipe stamps — opacity rides on x, so they fade on any travel */}
      <motion.div
        className="mf-stamp mf-stamp--next"
        style={{ opacity: nextStamp, scale: nextScale }}
        aria-hidden
      ><Icon name="check" size={24} strokeWidth={2.4} /></motion.div>
      <motion.div
        className="mf-stamp mf-stamp--back"
        style={{ opacity: canGoBack ? backStamp : 0, scale: backScale }}
        aria-hidden
      ><Icon name="undo" size={22} strokeWidth={2.2} /></motion.div>
      {children}
    </motion.div>
  )
}

export default function Feed({ demo = false, active = true, onBookmarks }) {
  const { logout } = useAuth()
  const { lang }   = useLang()
  const t          = useT()
  const { toast }  = useToast()
  const { isSaved, toggleSave, count } = useBookmarks()

  const [cards, setCards]       = useState(() => (demo ? MOCK_CARDS : []))
  const [loading, setLoading]   = useState(!demo)
  const [slowLoad, setSlowLoad] = useState(false)
  const [error, setError]       = useState(false)
  const [index, setIndex]       = useState(0)
  const [lastDir, setLastDir]   = useState(1)   // 1 = forward, -1 = back
  const [done, setDone]         = useState(false)
  const [finishing, setFinishing] = useState(false) // last card is flying out → done
  const [armed, setArmed]       = useState(false)   // top card dragged past the commit point
  const [session, setSession]   = useState(0)       // bumped on restart → deck re-deals in
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('mf_swiped'))
  const completedRef = useRef(new Set())
  const savingRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const [progressError, setProgressError] = useState(false)

  const isCoarsePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
    []
  )

  const load = useCallback(async () => {
    if (demo) return
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000)
    try {
      const feedData = await api.get(`/api/feed/today?date=${localDate()}`)
      const entries   = (feedData.cards || []).filter(entry => entry.card)
      const feedCards = entries.map(fc => fc.card).filter(Boolean)
      if (!feedCards.length) throw new Error('Empty feed')

      entries.forEach(fc => {
        if (fc.isCompleted && fc.card) completedRef.current.add(fc.card._id)
      })
      const firstOpen = entries.findIndex(fc => !fc.isCompleted)

      setCards(feedCards)
      scrollPositions.clear()
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

  const markCompleted = useCallback(async (card) => {
    if (demo || !card || completedRef.current.has(card._id)) return true
    try {
      await api.patch(`/api/feed/complete/${card._id}?date=${localDate()}`)
      completedRef.current.add(card._id)
      return true
    } catch {
      return false
    }
  }, [demo])

  const goNext = useCallback(async () => {
    if (!active || finishing || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setProgressError(false)
    const saved = await markCompleted(cards[index])
    savingRef.current = false
    setSaving(false)
    if (!saved) { setProgressError(true); return }
    if (showHint) { setShowHint(false); localStorage.setItem('mf_swiped', '1') }
    setArmed(false)
    setLastDir(1)
    if (index >= total - 1) setFinishing(true)
    setIndex(i => i + 1)
  }, [active, finishing, index, total, cards, markCompleted, showHint])
  const goBack = useCallback(() => {
    if (!active || finishing || savingRef.current || index === 0) return
    setArmed(false)
    setLastDir(-1)
    setIndex(i => i - 1)
  }, [active, finishing, index])

  // After the last card clears the deck, mount the Done screen.
  useEffect(() => {
    if (!finishing) return
    const tm = setTimeout(() => setDone(true), 420)
    return () => clearTimeout(tm)
  }, [finishing])

  // Re-deal from Done: the deck re-enters from the left like a fresh hand.
  const restart = useCallback(() => {
    setFinishing(false)
    setDone(false)
    setArmed(false)
    setLastDir(-1)
    setIndex(0)
    setSession(s => s + 1)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (!active) return
      // Never hijack navigation while the user is typing, focused on a
      // control, or trying to scroll a card's text with arrow keys.
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target
      const inField = target instanceof HTMLElement &&
        !!target.closest?.('input, textarea, select, button, a, [contenteditable]')
      const inCardScroll = target instanceof HTMLElement &&
        !!target.closest?.('.mf-card__scroll')
      if (inField || inCardScroll) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goBack() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, goNext, goBack])

  // Track scroll depth per card so a "back" swipe lands where you left off.
  const onCardScroll = useCallback((id, top) => {
    if (id) scrollPositions.set(id, top)
  }, [])

  const handleSaveToggle = useCallback(async (card) => {
    const wasSaved = isSaved(card._id)
    haptic()
    if (!await toggleSave(card)) return
    toast(
      wasSaved ? t('card.save_removed') : t('card.save_added'),
      wasSaved ? 'info' : 'success'
    )
  }, [isSaved, toggleSave, toast, t])

  const shownIndex  = Math.min(index, total - 1) // during the exit-to-done beat, index is past the end
  const progressPct = total > 0 ? Math.min(((shownIndex + 1) / total) * 100, 100) : 0

  if (loading) {
    return (
      <div className="mf-feed mf-feed--loading">
        <div className="mf-skeleton-card" aria-hidden="true">
          <div className="mf-skeleton-card__header">
            <span className="mf-sk mf-sk--chip" />
            <span className="mf-sk mf-sk--time" />
          </div>
          <div className="mf-sk mf-sk--title" />
          <div className="mf-sk mf-sk--title mf-sk--title-short" />
          <div className="mf-skeleton-card__body">
            <div className="mf-sk mf-sk--line" />
            <div className="mf-sk mf-sk--line" />
            <div className="mf-sk mf-sk--line" />
            <div className="mf-sk mf-sk--line mf-sk--line-short" />
          </div>
          <div className="mf-skeleton-card__why">
            <div className="mf-sk mf-sk--label" />
            <div className="mf-sk mf-sk--line" />
            <div className="mf-sk mf-sk--line mf-sk--line-med" />
          </div>
          <div className="mf-skeleton-card__footer">
            <span className="mf-sk mf-sk--btn" />
            <span className="mf-sk mf-sk--btn" />
          </div>
        </div>
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
          <div className="mf-error__icon"><Icon name="signal" size={30} /></div>
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
    const nounKey = count === 1 ? 'feed.done.noun.one' : 'feed.done.noun.many'
    const totalReadSec = cards.reduce((sum, c) => sum + (Number(c.readTimeSec) || 0), 0)
    const knowledgeMin = totalReadSec > 0 ? Math.max(1, Math.round(totalReadSec / 60)) : 0
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
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          >
            {/* Draw-on completion mark — ring sweeps, check draws in after */}
            <svg viewBox="0 0 64 64" width="72" height="72" fill="none" aria-hidden="true">
              <motion.circle
                cx="32" cy="32" r="27"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
                style={{ rotate: -90, transformOrigin: '50% 50%' }}
              />
              <circle cx="32" cy="32" r="27" stroke="currentColor" opacity=".16" strokeWidth="3" />
              <motion.path
                d="M20.5 33.5 28.5 41 44 24"
                stroke="currentColor" strokeWidth="4.2"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              />
            </svg>
          </motion.div>
          <div className="mf-done__confetti" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="mf-confetti-piece" style={{ '--i': i }} />
            ))}
          </div>
          <motion.h1 className="mf-done__title" variants={fadeUpItem}>{t('feed.done.title')}</motion.h1>
          <motion.p className="mf-done__sub" variants={fadeUpItem}>
            {count > 0
              ? t('feed.done.sub.saved', { count, noun: t(nounKey) })
              : t('feed.done.sub.read')}
          </motion.p>
          {knowledgeMin > 0 && (
            <motion.p className="mf-done__minutes" variants={fadeUpItem}>
              {t('feed.done.minutes', { min: knowledgeMin })}
            </motion.p>
          )}
          <motion.p className="mf-done__date" variants={fadeUpItem}>{t('feed.done.return')}</motion.p>
          <motion.button
            className="mf-done__restart"
            variants={fadeUpItem}
            onClick={restart}
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
        <span className="mf-feed__logo">
          <img src="/mark.svg" alt="" />
          MindFeed
        </span>
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
                {shownIndex + 1}
              </motion.span>
            </AnimatePresence>
            /{total}
          </span>
          <LangToggle />
          <ThemeToggle />
          {onBookmarks && (
            <button
              className="mf-feed__bookmark-btn"
              onClick={onBookmarks}
              aria-label={t('nav.bookmarks')}
              title={t('nav.bookmarks')}
            >
              <Icon name="bookmark" size={15} />
              {count > 0 && <span className="mf-feed__bookmark-badge" aria-hidden="true">{count}</span>}
            </button>
          )}
          {!demo && logout && (
            <button className="mf-feed__logout" onClick={logout} aria-label={t('nav.logout')}>
              <Icon name="logout" size={15} />
            </button>
          )}
        </div>
      </header>

      <div className="mf-feed__progress-wrap">
        <motion.div
          className="mf-feed__progress-bar"
          style={{ width: '100%', transformOrigin: 'left' }}
          animate={{ scaleX: progressPct / 100 }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          role="progressbar"
          aria-label={lang === 'el' ? 'Πρόοδος ανάγνωσης' : 'Reading progress'}
          aria-valuenow={shownIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <main className="mf-feed__main">
        <div className="mf-feed__intro">
          <h1>{lang === 'el' ? 'Η σημερινή σου ανάγνωση' : 'Your daily reading'}</h1>
          <p>{demo
            ? (lang === 'el' ? 'Μια πρώτη γνωριμία. Διάβασε με τον ρυθμό σου και κράτησε όσα σε ενδιαφέρουν.' : 'A first look. Read at your own pace and save what interests you.')
            : (lang === 'el' ? 'Λίγες ιδέες για σήμερα. Χωρίς ατελείωτη κύλιση.' : 'A few ideas for today. No endless scrolling.')}</p>
        </div>
        <div className="mf-feed__deck-wrap">
        <div className={`mf-deck${armed ? ' mf-deck--armed' : ''}${finishing ? ' mf-deck--finishing' : ''}`}>
          <AnimatePresence initial={session === 0 ? false : true}>
            {visible.map((card, depth) => (
              <DeckCard
                key={card._id}
                depth={depth}
                isTop={depth === 0}
                canGoBack={index > 0}
                hasNext={depth === 0 ? index < total - 1 : false}
                onArmChange={setArmed}
                onNext={goNext}
                onBack={goBack}
                direction={lastDir}
              >
                <Card
                  card={card}
                  isSaved={isSaved(card._id)}
                  onSave={handleSaveToggle}
                  scrollRestoreTop={scrollPositions.get(card._id) || 0}
                  onScrollTop={onCardScroll}
                />
              </DeckCard>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showHint && active && !finishing && (
              <motion.div
                className="mf-swipe-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 1.2 } }}
                exit={{ opacity: 0, transition: { delay: 0, duration: 0.2 } }}
              >
                <motion.span
                  className="mf-swipe-hint__arrow"
                  animate={{ x: [-2, -14, -2] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                ><Icon name="chevron-left" size={14} strokeWidth={2.2} /></motion.span>
                <span className="mf-swipe-hint__text">
                  {isCoarsePointer ? t('feed.swipe_hint') : t('feed.swipe_hint_desktop')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>{/* end mf-feed__deck-wrap */}

        {progressError && <p className="mf-progress-error" role="alert">{lang === 'el' ? 'Η πρόοδος δεν αποθηκεύτηκε. Έλεγξε τη σύνδεσή σου και πάτησε ξανά Επόμενη.' : 'Your progress was not saved. Check your connection and try Next again.'}</p>}
        <nav aria-busy={saving} className="mf-feed__navigation" aria-label={lang === 'el' ? 'Πλοήγηση καρτών' : 'Card navigation'}>
          <button type="button" onClick={goBack} disabled={index === 0 || finishing || saving || !active}>
            <Icon name="chevron-left" size={16} />
            {lang === 'el' ? 'Προηγούμενη' : 'Previous'}
          </button>
          <button type="button" onClick={goNext} disabled={finishing || !active || total === 0}>
            {index >= total - 1
              ? (lang === 'el' ? 'Ολοκλήρωση' : 'Finish')
              : (lang === 'el' ? 'Επόμενη' : 'Next')}
            <Icon name="chevron-right" size={16} />
          </button>
        </nav>

        {/* Dots are decorative — the progress bar above carries the semantics */}
        <div className="mf-feed__dots" aria-hidden="true">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`mf-dot${i === index ? ' mf-dot--active' : i < index ? ' mf-dot--done' : ''}`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
