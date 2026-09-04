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
import { deckSpring, deckTravel, deckTravelBack, deckFlyX, deckSlot, fadeUpStagger, fadeUpItem } from '../motion/variants'
import './Feed.css'

const MOCK_CARDS = [
  {
    _id: '1',
    title: 'Ο Μύθος της Πολυεργασίας',
    body: 'Ο ανθρώπινος εγκέφαλος δεν μπορεί να επεξεργαστεί δύο γνωστικά απαιτητικές εργασίες ταυτόχρονα. Αυτό που αποκαλούμε «multitasking» είναι στην πραγματικότητα rapid task-switching — γρήγορη εναλλαγή προσοχής. Κάθε φορά που αλλάζεις εργασία, ο εγκέφαλος χρειάζεται κατά μέσο όρο 23 λεπτά για να επιστρέψει στο ίδιο επίπεδο βαθιάς εστίασης. Η έρευνα της Gloria Mark στο UC Irvine παρακολούθησε εργαζομένους επί ημέρες και βρήκε ότι διακόπτονται κατά μέσο όρο κάθε 3 λεπτά — πράγμα που σημαίνει ότι ο εγκέφαλος σχεδόν ποτέ δεν φτάνει σε πλήρη βάθος συγκέντρωσης.',
    tldr: 'Κάνε ένα πράγμα τη φορά. Η εστίαση είναι υπερδύναμη.',
    whyItMatters: 'Το χρόνιο task-switching δεν μειώνει μόνο την ταχύτητα — μειώνει και την ποιότητα της σκέψης σου, σχεδόν όσο μια άυπνη νύχτα. Κλείσε τις ειδοποιήσεις για 90 λεπτά και δούλεψε σε ένα πράγμα: η διαφορά είναι μετρήσιμη.',
    titleEn: 'The Myth of Multitasking',
    bodyEn: 'The human brain cannot process two cognitively demanding tasks at the same time. What we call “multitasking” is actually rapid task-switching — quick shifting of attention. Every time you switch tasks, your brain needs an average of 23 minutes to return to the same level of deep focus. Gloria Mark\'s research at UC Irvine tracked workers for days and found they are interrupted on average every 3 minutes — which means the brain almost never reaches full depth of concentration.',
    tldrEn: 'Do one thing at a time. Focus is a superpower.',
    whyEn: 'Chronic task-switching doesn\'t just slow you down — it lowers the quality of your thinking, almost as much as a sleepless night. Close your notifications for 90 minutes and work on one thing: the difference is measurable.',
    category: { emoji: '🧠', name: 'Ψυχολογία & Mindset', slug: 'psychology' },
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
    titleEn: 'Morning Light Sets Your Rhythm',
    bodyEn: 'Exposure to natural light within the first 30–60 minutes after waking acts as a “reset” for your circadian clock — the inner biological timer that regulates sleep, energy, body temperature and hormones. Morning light suppresses melatonin, raises cortisol to the right level for alertness, and programs your body to release melatonin again about 16 hours later, exactly when you need it for sleep. Neuroscientist Andrew Huberman (Stanford) calls it the most powerful free tool we have for sleep and mood.',
    tldrEn: 'Morning sun = better sleep + better mood.',
    whyEn: 'No special glasses or equipment needed — just 5–10 minutes outside, ideally before coffee. Consistency matters more than duration: do it every morning, even when it\'s cloudy.',
    category: { emoji: '☀️', name: 'Ήλιος & Circadian Biology', slug: 'circadian' },
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
    titleEn: 'Walking in the Woods Lowers Cortisol',
    bodyEn: 'Shinrin-yoku — literally “forest bathing” — has been an official Japanese public-health practice since the 1980s. Researcher Qing Li (Nippon Medical School) measured that just 2 hours in a forest environment lowers cortisol by 12.4% and blood pressure by 7%. Trees release phytoncides — antimicrobial compounds they use for defense — and inhaling them measurably boosts the immune system\'s natural killer (NK) cells, with the effect lasting up to 7 days after a single visit.',
    tldrEn: '2 hours in a forest = lower stress + stronger immunity.',
    whyEn: 'You don\'t need a real forest — even a park with dense greenery gives part of the benefit. The only requirement is to leave your phone in your pocket and actually observe the space around you.',
    category: { emoji: '🌿', name: 'Φύση & Biophilia', slug: 'nature' },
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
    titleEn: 'The Universe Has 2 Trillion Galaxies',
    bodyEn: 'In 2016, a team of astronomers led by Christopher Conselice (University of Nottingham) analyzed deep images from the Hubble telescope and concluded that the observable universe contains at least 2 trillion galaxies — 10 to 20 times more than earlier estimates suggested. Our own galaxy, the Milky Way, holds 100–400 billion stars in turn. If you counted one galaxy per second, it would take you over 63,000 years to count them all.',
    tldrEn: 'Our galaxy is 1 in 2,000,000,000,000.',
    whyEn: 'The scale of the universe isn\'t just an impressive statistic — it\'s a useful tool for perspective. When a problem feels huge, remember how small it is in the big picture.',
    category: { emoji: '🌌', name: 'Σύμπαν & Κοσμολογία', slug: 'universe' },
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
    titleEn: '90% of Your Serotonin Is Made in Your Gut',
    bodyEn: 'Your intestinal tract has its own nervous system — the enteric nervous system — with about 500 million neurons, as many as a cat\'s spinal cord. That\'s why it\'s informally called the “second brain.” It produces about 90% of the body\'s serotonin and a significant share of its dopamine, talking constantly to the brain through the vagus nerve. This “gut–brain axis” explains why stress causes stomach upsets, and why the state of your microbiome is increasingly linked to mood.',
    tldrEn: 'Good food = better mood. Scientifically.',
    whyEn: 'Foods rich in fiber and natural fermentation (yogurt, sauerkraut, kefir) feed the “good” bacteria that regulate this axis. Caring for your gut is, literally, caring for your mood.',
    category: { emoji: '🧬', name: 'Βιολογία & Εξέλιξη', slug: 'biology' },
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
    titleEn: 'Sleep Literally Cleans Your Brain',
    bodyEn: 'During deep sleep, the brain\'s glymphatic system activates and “flushes out” metabolic waste that accumulates while you\'re awake — including beta-amyloid protein, which is directly linked to Alzheimer\'s disease. Neuroscientist Matthew Walker (UC Berkeley) shows that brain tissue shrinks by about 60% at night, opening “channels” for cerebrospinal fluid to flow through. Chronic sleep deprivation blocks this cleaning and is associated with nearly double the accumulation of toxic proteins over time.',
    tldrEn: '7–9 hours of sleep = lower Alzheimer\'s risk.',
    whyEn: 'Sleep isn\'t a shutdown — it\'s active maintenance. A steady 7–9 hours every night is one of the most effective investments you can make in your brain\'s long-term health.',
    category: { emoji: '🍎', name: 'Υγεία & Longevity', slug: 'health' },
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
    titleEn: 'Amor Fati — Love Your Fate',
    bodyEn: 'Roman emperor and Stoic philosopher Marcus Aurelius wrote in his private “Meditations”: “Do not wish things to happen as you want them to, but wish them to happen as they do — and you will live serenely.” The idea of Amor Fati (“love of fate”) doesn\'t mean passive resignation, but active acceptance: you recognize what you don\'t control, and invest all your energy in what you do — your own judgments and actions. Nietzsche, centuries later, adopted the same term as the foundation of his own philosophy of life.',
    tldrEn: 'Accept what you can\'t control. Change what you can.',
    whyEn: 'The “what I control / what I don\'t” distinction is the core of cognitive-behavioral therapy today, 1,800 years later. Try it on your next annoyance: ask whether it really depends on you.',
    category: { emoji: '🏛️', name: 'Φιλοσοφία & Αρχαία Σοφία', slug: 'philosophy' },
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
    titleEn: 'Octopuses “See” Color Through Their Skin',
    bodyEn: 'Octopuses have only one type of photoreceptor in their eyes, which officially makes them colorblind — and yet they change color and pattern with astonishing precision for camouflage. A 2015 study (UC Berkeley) proposed that their skin contains light-sensitive proteins, opsins, that let them “see” color with their whole body, bypassing the eyes entirely. The unusual shape of their pupils may also create chromatic aberration, allowing them to distinguish colors through focus rather than color receptors.',
    tldrEn: 'Octopuses see color with their skin.',
    whyEn: 'Evolution finds solutions completely different from the ones we\'d imagine — intelligence and perception don\'t have a single “correct” architecture.',
    category: { emoji: '🦁', name: 'Άγρια Φύση & Ζωολογία', slug: 'wildlife' },
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
    titleEn: 'The 2-Minute Rule',
    bodyEn: 'In his book “Getting Things Done,” David Allen proposes a simple rule: if a task takes less than 2 minutes, do it immediately — don\'t add it to a list. The logic is neurological: the mental energy you spend remembering, planning and worrying about a small open item is often many times what it takes to finish it. Every open, unfinished task creates “mental noise” — the Zeigarnik effect — that stays in your subconscious until it\'s closed.',
    tldrEn: 'Under 2 minutes? Do it now.',
    whyEn: 'Try it today on 10 small open items: that email, that appointment, that plate in the sink. You\'ll immediately feel less mental “noise” in your head.',
    category: { emoji: '💪', name: 'Self-Improvement', slug: 'self-improvement' },
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
    titleEn: 'Compound Interest: The 8th Wonder of the World',
    bodyEn: 'Compound interest is simple math but counterintuitive in practice: €1,000 at a 7% average annual return becomes about €7,612 in 30 years, with no additional deposits. The “secret” isn\'t the rate — it\'s time: the earlier you start, the more times your gains “work” on top of previous gains. Someone who invests €200/month from age 25 to 35, then stops, usually ends up with more money at 65 than someone who starts at 35 and keeps investing until retirement.',
    tldrEn: 'Start saving early. Time is your most powerful tool.',
    whyEn: 'Time in the market beats timing the market. Even small, steady amounts from early on make a bigger difference than large amounts later.',
    category: { emoji: '💰', name: 'Οικονομικός Αλφαβητισμός', slug: 'finance' },
    difficulty: 'easy', readTimeSec: 55,
    mood: ['practical', 'mind-blowing'],
    source: { type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', year: 2020, publisher: 'Harriman House' },
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
function DeckCard({ depth, isTop, canGoBack, hasNext, onArmChange, onNext, onBack, enterFromLeft, children }) {
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
              scale: 0.94,          // recede as it leaves — depth cue, not a flat slide
              opacity: 0,
              transition: deckTravel,
            }
          : { opacity: 0, transition: { duration: 0.15 } }
      }
      transition={{
        ...deckSpring,
        x: enterFromLeft ? deckTravelBack : deckTravel,
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

  const isCoarsePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
    []
  )

  const load = useCallback(async () => {
    if (demo) return
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000)
    try {
      const feedData = await api.get(`/api/feed/today?date=${localDate()}`)
      const entries   = feedData.cards || []
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

  const markCompleted = useCallback((card) => {
    if (demo || !card || completedRef.current.has(card._id)) return
    completedRef.current.add(card._id)
    api.patch(`/api/feed/complete/${card._id}?date=${localDate()}`).catch(() => {
      completedRef.current.delete(card._id)
    })
  }, [demo])

  const goNext = useCallback(() => {
    if (!active || finishing) return
    markCompleted(cards[index])
    if (showHint) { setShowHint(false); localStorage.setItem('mf_swiped', '1') }
    setArmed(false)
    setLastDir(1)
    if (index >= total - 1) {
      // Let the last card FLY OUT first — the Done screen mounts only after
      // its exit lands, so the end of the deck never cuts abruptly.
      setFinishing(true)
      setIndex(i => i + 1)
      return
    }
    setIndex(i => i + 1)
  }, [active, finishing, index, total, cards, markCompleted, showHint])

  const goBack = useCallback(() => {
    if (!active || finishing || index === 0) return
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

  const handleSaveToggle = useCallback((card) => {
    const wasSaved = isSaved(card._id)
    haptic()
    toggleSave(card)
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
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          role="progressbar"
          aria-valuenow={shownIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <main className="mf-feed__main">
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
                enterFromLeft={lastDir === -1}
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
