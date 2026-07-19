import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import Card from './Card'
import Icon from './Icon'
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
    body: 'Ο ανθρώπινος εγκέφαλος δεν μπορεί να επεξεργαστεί δύο γνωστικά απαιτητικές εργασίες ταυτόχρονα. Αυτό που αποκαλούμε «multitasking» είναι στην πραγματικότητα rapid task-switching — γρήγορη εναλλαγή προσοχής. Κάθε φορά που αλλάζεις εργασία, ο εγκέφαλος χρειάζεται κατά μέσο όρο 23 λεπτά για να επιστρέψει στο ίδιο επίπεδο βαθιάς εστίασης. Η έρευνα της Gloria Mark στο UC Irvine παρακολούθησε εργαζομένους επί ημέρες και βρήκε ότι διακόπτονται κατά μέσο όρο κάθε 3 λεπτά — πράγμα που σημαίνει ότι ο εγκέφαλος σχεδόν ποτέ δεν φτάνει σε πλήρη βάθος συγκέντρωσης.',
    tldr: 'Κάνε ένα πράγμα τη φορά. Η εστίαση είναι υπερδύναμη.',
    whyItMatters: 'Το χρόνιο task-switching δεν μειώνει μόνο την ταχύτητα — μειώνει και την ποιότητα της σκέψης σου, σχεδόν όσο μια άυπνη νύχτα. Κλείσε τις ειδοποιήσεις για 90 λεπτά και δούλεψε σε ένα πράγμα: η διαφορά είναι μετρήσιμη.',
    category: { emoji: '🧠', name: 'Νευροεπιστήμη' },
    difficulty: 'easy', readTimeSec: 60,
    mood: ['mind-blowing', 'practical'],
    source: { type: 'paper', title: 'The Cost of Interrupted Work', author: 'Gloria Mark', year: 2008, url: 'https://www.ics.uci.edu/~gmark/chi08-mark.pdf' },
  },
  {
    _id: '2',
    title: 'Το Πρωινό Φως Ρυθμίζει Όλα',
    body: 'Η έκθεση σε φυσικό φως τα πρώτα 30-60 λεπτά μετά το ξύπνημα λειτουργεί σαν «reset» για το κιρκάδιο ρολόι σου — τον εσωτερικό βιολογικό χρονομετρητή που ρυθμίζει ύπνο, ενέργεια, θερμοκρασία σώματος και ορμόνες. Το πρωινό φως καταστέλλει τη μελατονίνη, ανεβάζει την κορτιζόλη στο σωστό επίπεδο για εγρήγορση, και προγραμματίζει τον οργανισμό να ξανααπελευθερώσει μελατονίνη περίπου 16 ώρες αργότερα, ακριβώς τη στιγμή που χρειάζεται για ύπνο. Ο νευροεπιστήμονας Andrew Huberman (Stanford) το περιγράφει ως το πιο ισχυρό δωρεάν εργαλείο για ύπνο και διάθεση που διαθέτουμε.',
    tldr: 'Πρωινός ήλιος = καλύτερος ύπνος + καλύτερη διάθεση.',
    whyItMatters: 'Δεν χρειάζονται γυαλιά ηλίου ή ειδικός εξοπλισμός — μόνο 5-10 λεπτά έξω, ιδανικά πριν τον καφέ. Η συνέπεια μετράει περισσότερο από τη διάρκεια: κάνε το κάθε πρωί, ακόμα κι όταν έχει συννεφιά.',
    category: { emoji: '☀️', name: 'Circadian Biology' },
    difficulty: 'easy', readTimeSec: 55,
    mood: ['calming', 'practical'],
    source: { type: 'paper', title: 'Entrainment of the Human Circadian Clock', author: 'Roenneberg et al.', year: 2013, url: 'https://www.cell.com/current-biology/fulltext/S0960-9822(12)01464-8' },
  },
  {
    _id: '3',
    title: 'Το Δάσος Μειώνει την Κορτιζόλη',
    body: 'Το Shinrin-yoku — κυριολεκτικά «μπάνιο στο δάσος» — είναι επίσημη ιαπωνική πρακτική δημόσιας υγείας από τη δεκαετία του 1980. Ο ερευνητής Qing Li (Nippon Medical School) μέτρησε ότι μόλις 2 ώρες σε δασικό περιβάλλον μειώνουν την κορτιζόλη κατά 12.4% και την αρτηριακή πίεση κατά 7%. Τα δέντρα εκπέμπουν phytoncides — αντιμικροβιακές ενώσεις που χρησιμοποιούν για άμυνα — και η εισπνοή τους ενισχύει μετρήσιμα τα φυσικά κύτταρα-φονιάδες (NK cells) του ανοσοποιητικού, με το αποτέλεσμα να διαρκεί έως και 7 ημέρες μετά από μία μόνο επίσκεψη.',
    tldr: '2 ώρες σε δάσος = χαμηλότερο στρες + ισχυρότερο ανοσοποιητικό.',
    whyItMatters: 'Δεν χρειάζεσαι αληθινό δάσος — ακόμα κι ένα πάρκο με πυκνή βλάστηση δίνει μέρος του οφέλους. Η μόνη προϋπόθεση είναι να αφήσεις το κινητό στην τσέπη και να παρατηρήσεις πραγματικά τον χώρο γύρω σου.',
    category: { emoji: '🌿', name: 'Φύση & Biophilia' },
    difficulty: 'easy', readTimeSec: 65,
    mood: ['calming', 'inspiring'],
    source: { type: 'paper', title: 'Forest Bathing Enhances Human Natural Killer Activity', author: 'Li et al.', year: 2007, doi: '10.1007/s007640070069' },
  },
  {
    _id: '4',
    title: 'Το Σύμπαν Έχει 2 Τρισεκατομμύρια Γαλαξίες',
    body: 'Το 2016, μια ομάδα αστρονόμων με επικεφαλής τον Christopher Conselice (Πανεπιστήμιο Nottingham) ανέλυσε βαθιές εικόνες του τηλεσκοπίου Hubble και κατέληξε ότι το παρατηρήσιμο σύμπαν περιέχει τουλάχιστον 2 τρισεκατομμύρια γαλαξίες — 10 έως 20 φορές περισσότερους απ\' όσους πίστευαν οι προηγούμενες εκτιμήσεις. Ο δικός μας Γαλαξίας, ο Δρόμος του Γάλακτος, περιέχει με τη σειρά του 100-400 δισεκατομμύρια αστέρια. Αν μετρούσες έναν γαλαξία το δευτερόλεπτο, θα χρειαζόσουν πάνω από 63.000 χρόνια για να τους μετρήσεις όλους.',
    tldr: 'Ο Γαλαξίας μας είναι 1 στα 2.000.000.000.000.',
    whyItMatters: 'Η κλίμακα του σύμπαντος δεν είναι απλώς εντυπωσιακή στατιστική — είναι χρήσιμο εργαλείο προοπτικής. Όταν ένα πρόβλημα φαίνεται τεράστιο, θυμήσου πόσο μικρό είναι μέσα στο μεγάλο σχήμα.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία' },
    difficulty: 'medium', readTimeSec: 65,
    mood: ['mind-blowing', 'inspiring'],
    source: { type: 'paper', title: 'Galaxy counts in the deep fields', author: 'Conselice et al.', year: 2016, doi: '10.3847/0004-637X/830/2/83' },
  },
  {
    _id: '5',
    title: 'Το 90% της Σεροτονίνης Παράγεται στο Έντερο',
    body: 'Ο εντερικός σωλήνας διαθέτει το δικό του νευρικό σύστημα — το εντερικό νευρικό σύστημα — με περίπου 500 εκατομμύρια νευρώνες, όσο και ο νωτιαίος μυελός μιας γάτας. Γι\' αυτό αποκαλείται άτυπα «δεύτερος εγκέφαλος». Παράγει περίπου το 90% της σεροτονίνης του σώματος και σημαντικό μέρος της ντοπαμίνης, επικοινωνώντας διαρκώς με τον εγκέφαλο μέσω του πνευμονογαστρικού νεύρου. Αυτός ο «άξονας εντέρου-εγκεφάλου» εξηγεί γιατί το άγχος προκαλεί στομαχικές διαταραχές, και γιατί η κατάσταση του μικροβιώματος συνδέεται όλο και πιο στενά με τη διάθεση.',
    tldr: 'Καλή διατροφή = καλύτερη διάθεση. Επιστημονικά.',
    whyItMatters: 'Τρόφιμα πλούσια σε φυτικές ίνες και φυσική ζύμωση (γιαούρτι, ξινολάχανο, κεφίρ) τρέφουν τα «καλά» βακτήρια που ρυθμίζουν αυτόν τον άξονα. Η φροντίδα του εντέρου είναι, κυριολεκτικά, φροντίδα της διάθεσης.',
    category: { emoji: '🧬', name: 'Βιολογία & Μικροβίωμα' },
    difficulty: 'medium', readTimeSec: 70,
    mood: ['surprising', 'practical'],
    source: { type: 'paper', title: 'The gut-brain axis', author: 'Cryan & Dinan', year: 2012, doi: '10.1038/nrn3346' },
  },
  {
    _id: '6',
    title: 'Ο Ύπνος Καθαρίζει Κυριολεκτικά τον Εγκέφαλο',
    body: 'Κατά τη διάρκεια του βαθύ ύπνου, το γλυμφατικό σύστημα του εγκεφάλου ενεργοποιείται και «ξεπλένει» μεταβολικά απόβλητα που συσσωρεύονται όσο είσαι ξύπνιος — ανάμεσά τους η β-αμυλοειδής πρωτεΐνη, που σχετίζεται άμεσα με τη νόσο Alzheimer. Ο νευροεπιστήμονας Matthew Walker (UC Berkeley) δείχνει ότι ο εγκεφαλικός ιστός συρρικνώνεται κατά περίπου 60% τη νύχτα, ανοίγοντας «κανάλια» ανάμεσα στα κύτταρα για να περάσει το εγκεφαλονωτιαίο υγρό. Χρόνια στέρηση ύπνου εμποδίζει αυτόν τον καθαρισμό και σχετίζεται με σχεδόν διπλάσια συσσώρευση τοξικών πρωτεϊνών σε βάθος χρόνου.',
    tldr: '7-9 ώρες ύπνου = χαμηλότερος κίνδυνος Alzheimer.',
    whyItMatters: 'Ο ύπνος δεν είναι παύση λειτουργίας — είναι ενεργή συντήρηση. 7-9 ώρες σταθερά κάθε βράδυ είναι από τις πιο αποδοτικές επενδύσεις που μπορείς να κάνεις στη μακροπρόθεσμη υγεία του εγκεφάλου σου.',
    category: { emoji: '🍎', name: 'Υγεία & Longevity' },
    difficulty: 'easy', readTimeSec: 65,
    mood: ['surprising', 'practical'],
    source: { type: 'book', title: 'Why We Sleep', author: 'Matthew Walker', year: 2017, publisher: 'Scribner' },
  },
  {
    _id: '7',
    title: 'Amor Fati — Αγάπα την Τύχη σου',
    body: 'Ο Ρωμαίος αυτοκράτορας και Στωικός φιλόσοφος Μάρκος Αυρήλιος έγραφε στα προσωπικά του «Τα εις εαυτόν»: «Να μην επιθυμείς τα πράγματα να γίνονται όπως θέλεις, αλλά να θέλεις τα πράγματα να γίνονται όπως είναι — και έτσι θα ζήσεις ήρεμα.» Η ιδέα του Amor Fati («αγάπη για τη μοίρα») δεν σημαίνει παθητική παραίτηση, αλλά ενεργή αποδοχή: αναγνωρίζεις τι δεν ελέγχεις, και επενδύεις όλη σου την ενέργεια σε αυτό που ελέγχεις — τις δικές σου κρίσεις και πράξεις. Ο Νίτσε, αιώνες αργότερα, υιοθέτησε τον ίδιο όρο ως θεμέλιο της δικής του φιλοσοφίας ζωής.',
    tldr: 'Αποδέξου αυτό που δεν ελέγχεις. Άλλαξε αυτό που ελέγχεις.',
    whyItMatters: 'Η διάκριση «τι ελέγχω / τι δεν ελέγχω» είναι ο πυρήνας της γνωσιακής-συμπεριφορικής θεραπείας σήμερα, 1.800 χρόνια αργότερα. Δοκίμασέ το στην επόμενη ενόχλησή σου: ρώτησε αν πραγματικά εξαρτάται από εσένα.',
    category: { emoji: '🏛️', name: 'Φιλοσοφία & Στωικισμός' },
    difficulty: 'easy', readTimeSec: 60,
    mood: ['calming', 'inspiring'],
    source: { type: 'book', title: 'Meditations', author: 'Marcus Aurelius', year: 161, publisher: 'Penguin Classics' },
  },
  {
    _id: '8',
    title: 'Χταπόδια «Βλέπουν» Χρώματα Με Πλευρικούς Υποδοχείς',
    body: 'Τα χταπόδια έχουν μόνο έναν τύπο φωτοϋποδοχέα στα μάτια τους, πράγμα που τα καθιστά επίσημα χρωματοτυφλά — και όμως αλλάζουν χρώμα και μοτίβο με απίστευτη ακρίβεια για καμουφλάζ. Έρευνα του 2015 (UC Berkeley) πρότεινε ότι το δέρμα τους περιέχει φωτοευαίσθητες πρωτεΐνες, οψίνες, που τους επιτρέπουν να «βλέπουν» χρώμα με ολόκληρο το σώμα, παρακάμπτοντας εντελώς τα μάτια. Το ασυνήθιστο σχήμα της κόρης τους μπορεί επίσης να δημιουργεί χρωματική εκτροπή, επιτρέποντάς τους να διακρίνουν χρώματα μέσω εστίασης αντί για χρωματικούς υποδοχείς.',
    tldr: 'Χταπόδια βλέπουν χρώμα με το δέρμα τους.',
    whyItMatters: 'Η εξέλιξη βρίσκει λύσεις εντελώς διαφορετικές από αυτές που θα φανταζόμασταν — η νοημοσύνη και η αντίληψη δεν έχουν μία μόνο «σωστή» αρχιτεκτονική.',
    category: { emoji: '🦁', name: 'Άγρια Φύση & Ζωολογία' },
    difficulty: 'medium', readTimeSec: 55,
    mood: ['surprising', 'mind-blowing'],
    source: { type: 'paper', title: 'Opsins in Octopus bimaculoides skin', author: 'Ramirez & Oakley', year: 2015, doi: '10.1098/rsbl.2015.0153' },
  },
  {
    _id: '9',
    title: 'Ο Κανόνας των 2 Λεπτών',
    body: 'Στο βιβλίο του «Getting Things Done», ο David Allen προτείνει έναν απλό κανόνα: αν μια εργασία χρειάζεται λιγότερο από 2 λεπτά, κάνε την αμέσως — μην την προσθέτεις σε λίστα. Η λογική είναι νευρολογική: η ψυχική ενέργεια που ξοδεύεις για να θυμάσαι, να προγραμματίζεις και να ανησυχείς για μια μικρή εκκρεμότητα είναι συχνά πολλαπλάσια από αυτή που χρειάζεται για να την ολοκληρώσεις. Κάθε ανοιχτή, ημιτελής εργασία δημιουργεί «ψυχικό θόρυβο» — το φαινόμενο Zeigarnik — που παραμένει στο υποσυνείδητο μέχρι να κλείσει.',
    tldr: 'Κάτω από 2 λεπτά; Κάνε το τώρα.',
    whyItMatters: 'Δοκίμασέ το σήμερα σε 10 μικρές εκκρεμότητες: εκείνο το email, το ραντεβού, το πιάτο στον νεροχύτη. Θα νιώσεις αμέσως λιγότερο νοητικό «θόρυβο» στο μυαλό σου.',
    category: { emoji: '💪', name: 'Self-Improvement' },
    difficulty: 'easy', readTimeSec: 50,
    mood: ['practical', 'motivating'],
    source: { type: 'book', title: 'Getting Things Done', author: 'David Allen', year: 2001, publisher: 'Penguin Books' },
  },
  {
    _id: '10',
    title: 'Ανατοκισμός: Το 8ο Θαύμα του Κόσμου',
    body: 'Το φαινόμενο του ανατοκισμού είναι απλό μαθηματικά αλλά αντιδιαισθητικό στην πράξη: 1.000€ με 7% μέση ετήσια απόδοση γίνονται περίπου 7.612€ σε 30 χρόνια, χωρίς καμία επιπλέον κατάθεση. Το «μυστικό» δεν είναι το ποσοστό, αλλά ο χρόνος: όσο νωρίτερα ξεκινήσεις, τόσο περισσότερες φορές «δουλεύουν» τα κέρδη πάνω σε προηγούμενα κέρδη. Κάποιος που επενδύει 200€/μήνα από τα 25 έως τα 35, και μετά σταματά, καταλήγει συνήθως με περισσότερα χρήματα στα 65 από κάποιον που ξεκινά στα 35 και επενδύει συνεχώς μέχρι τη σύνταξη.',
    tldr: 'Ξεκίνα να αποταμιεύεις νωρίς. Ο χρόνος είναι το πιο ισχυρό εργαλείο.',
    whyItMatters: 'Ο χρόνος στην αγορά νικά το timing της αγοράς. Ακόμα και μικρά, σταθερά ποσά από νωρίς κάνουν μεγαλύτερη διαφορά από μεγάλα ποσά αργότερα.',
    category: { emoji: '💰', name: 'Οικονομικός Αλφαβητισμός' },
    difficulty: 'easy', readTimeSec: 55,
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
function DeckCard({ depth, isTop, canGoBack, onNext, onBack, enterFromLeft, children }) {
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
        rotate,
        zIndex: 3 - depth,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      initial={
        isTop && enterFromLeft
          // Mirror of the exit: same distance, same fade — rotation follows x
          ? { ...deckSlot(0), x: -deckFlyX(), opacity: 0 }
          : { ...deckSlot(depth + 1), opacity: 0 }
      }
      animate={{ x: 0, ...deckSlot(depth) }}
      exit={
        isTop
          ? {
              x: -deckFlyX(),
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

export default function Feed({ demo = false, onBookmarks }) {
  const { logout } = useAuth()
  const { lang }   = useLang()
  const t          = useT()

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
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000)
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
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          >
            {/* Draw-on completion mark — ring sweeps, check draws in after */}
            <svg viewBox="0 0 64 64" width="72" height="72" fill="none" aria-hidden="true">
              <motion.circle
                cx="32" cy="32" r="27"
                stroke="oklch(0.80 0.165 66)" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
                style={{ rotate: -90, transformOrigin: '50% 50%' }}
              />
              <circle cx="32" cy="32" r="27" stroke="oklch(0.80 0.165 66 / 0.16)" strokeWidth="3" />
              <motion.path
                d="M20.5 33.5 28.5 41 44 24"
                stroke="oklch(0.80 0.165 66)" strokeWidth="4.2"
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
              <Icon name="bookmark" size={15} />
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
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <main className="mf-feed__main">
        {/* Keyboard hint for desktop — only shown once */}
        <div className="mf-feed__deck-wrap">
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
                animate={{ opacity: 1, transition: { delay: 1.2 } }}
                exit={{ opacity: 0, transition: { delay: 0, duration: 0.2 } }}
              >
                <motion.span
                  className="mf-swipe-hint__arrow"
                  animate={{ x: [-2, -14, -2] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                ><Icon name="chevron-left" size={14} strokeWidth={2.2} /></motion.span>
                {t('feed.swipe_hint')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        </div>{/* end mf-feed__deck-wrap */}

        {/* Dots only — navigation is swipe or ← → keyboard arrows */}
        <div className="mf-feed__dots" role="tablist" aria-label="Card progress">
          {cards.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === index}
              className={`mf-dot${i === index ? ' mf-dot--active' : i < index ? ' mf-dot--done' : ''}`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

