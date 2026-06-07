/**
 * Seed expansion: adds 40 new cards to bring the DB to ~50 total.
 * Run AFTER seed.js: MONGO_URI=... node scripts/expandSeed.js
 * Safe to run multiple times — skips existing titles.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Card     = require('../models/Card');

const newCards = (m) => [
  // ── Επιστήμη & Έρευνα ────────────────────────────────────────────────────
  {
    title: 'Το DNA κάθε ανθρώπου έχει μήκος 2 μέτρα — σε κάθε κύτταρο',
    body: 'Κάθε κύτταρο του σώματος περιέχει ~3 δισ. ζεύγη βάσεων DNA, που αν ξετυλιχθούν έχουν μήκος 2 μέτρα. Στο ανθρώπινο σώμα υπάρχουν ~37 τρισεκατομμύρια κύτταρα. Άρα το συνολικό DNA μας θα έφτανε ως τον Πλούτωνα και πίσω 17 φορές.',
    whyItMatters: 'Η πολυπλοκότητα της ζωής είναι κρυμμένη σε δομές που δεν μπορεί να δει το μάτι.',
    tldr: '2 μέτρα DNA σε κάθε κύτταρο. 37 τρισ. κύτταρα. Υπολόγισε.',
    category: m['science'], tags: ['dna','biology','κύτταρα'], mood: ['mind-blowing'],
    source: { type: 'paper', title: 'Human Genome Project Completion', author: 'International Human Genome Sequencing Consortium', year: 2003, url: 'https://doi.org/10.1038/nature01480', doi: '10.1038/nature01480' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Βακτήρια επικοινωνούν και «ψηφίζουν» με χημικά σήματα',
    body: 'Το Quorum Sensing είναι ο τρόπος που βακτήρια μετράνε πόσα είναι γύρω τους — εκκρίνουν χημικά μόρια και ανταποκρίνονται όταν φτάσουν σε κρίσιμη μάζα. Τότε ενεργοποιούν συλλογικές συμπεριφορές: biofilm, λοίμωξη, βιολαμινέσανς.',
    whyItMatters: 'Καταλαβαίνοντας πώς «επικοινωνούν» βακτήρια, μπορούμε να σχεδιάσουμε νέα αντιβιοτικά.',
    tldr: 'Βακτήρια δεν δρουν μόνα — ψηφίζουν πότε να επιτεθούν.',
    category: m['science'], tags: ['bacteria','quorum-sensing','microbiology'], mood: ['surprising','mind-blowing'],
    source: { type: 'paper', title: 'Quorum sensing: cell-to-cell communication in bacteria', author: 'Waters & Bassler', year: 2005, url: 'https://doi.org/10.1146/annurev.cellbio.21.012704.131001', doi: '10.1146/annurev.cellbio.21.012704.131001' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  {
    title: 'Η Σχετικότητα Αλλάζει τον Ρυθμό του Χρόνου — Κυριολεκτικά',
    body: 'Το GPS χρειάζεται να διορθώνει τον χρόνο κατά 38 μικρολεπτά/ημέρα λόγω Γενικής Σχετικότητας (δορυφόροι είναι πιο γρήγοροι χρονικά σε τροχιά). Χωρίς διόρθωση, οι χάρτες GPS θα έχαναν ~11 km/ημέρα.',
    whyItMatters: 'Η Θεωρία Σχετικότητας δεν είναι μόνο θεωρία — κάνει τον GPS να λειτουργεί.',
    tldr: 'GPS χρησιμοποιεί σχετικότητα του Αϊνστάιν. Αλλιώς χάνεις 11km/ημέρα.',
    category: m['science'], tags: ['relativity','physics','GPS','Einstein'], mood: ['mind-blowing'],
    source: { type: 'paper', title: 'Relativity and the Global Positioning System', author: 'Neil Ashby', year: 2002, url: 'https://doi.org/10.1063/1.1485583', doi: '10.1063/1.1485583' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  // ── Ψυχολογία & Mindset ──────────────────────────────────────────────────
  {
    title: 'Dunning-Kruger: Γιατί οι αμαθείς νομίζουν ότι ξέρουν πολλά',
    body: 'Σε μελέτη του 1999 (Cornell), οι χαμηλότερα βαθμολογημένοι συμμετέχοντες εκτιμούσαν ότι βρίσκονται στο top 62%. Η ανικανότητα αφαιρεί και την ικανότητα να αναγνωρίσεις την ανικανότητα σου. Αντίθετα, οι ειδικοί υποτιμούν τις γνώσεις τους.',
    whyItMatters: 'Η μετριοφροσύνη δεν είναι αδυναμία — είναι ένδειξη πραγματικής γνώσης.',
    tldr: 'Όσο λιγότερο ξέρεις, τόσο περισσότερο νομίζεις ξέρεις.',
    category: m['psychology'], tags: ['dunning-kruger','bias','self-awareness'], mood: ['mind-blowing','practical'],
    source: { type: 'paper', title: 'Unskilled and Unaware of It', author: 'Kruger & Dunning', year: 1999, url: 'https://doi.org/10.1037/0022-3514.77.6.1121', doi: '10.1037/0022-3514.77.6.1121' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Mirror Neurons: Ο Εγκέφαλος «Βιώνει» ό,τι Βλέπει',
    body: 'Τα mirror neurons ενεργοποιούνται τόσο όταν εκτελούμε μια πράξη ΟΣΟ και όταν απλώς βλέπουμε κάποιον άλλον να την εκτελεί. Αυτός ο μηχανισμός εξηγεί την ενσυναίσθηση, τη μίμηση και γιατί ένα χαμόγελο είναι «μεταδοτικό».',
    whyItMatters: 'Περιβάλλεσαι με ανθρώπους που ζουν τη ζωή που θέλεις — κυριολεκτικά το απορροφάς.',
    tldr: 'Ο εγκέφαλος δεν ξεχωρίζει «βλέπω» από «κάνω». Mirror neurons.',
    category: m['psychology'], tags: ['mirror-neurons','empathy','neuroscience'], mood: ['mind-blowing','inspiring'],
    source: { type: 'paper', title: 'Mirror neurons and the simulation theory of mind-reading', author: 'Gallese & Goldman', year: 1998, url: 'https://doi.org/10.1016/S1364-6613(98)01262-5', doi: '10.1016/S1364-6613(98)01262-5' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  {
    title: 'Η Ψυχολογία του Αυτοσυμπαθούς: Λιγότερη Αυτοκριτική = Καλύτερη Απόδοση',
    body: 'Έρευνες της Kristin Neff (UT Austin) δείχνουν ότι self-compassion — η στάση που κρατάμε απέναντί μας σαν καλός φίλος — βελτιώνει ψυχική υγεία, μειώνει άγχος και... αυξάνει κίνητρο. Η αυτοκριτική κάνει το αντίθετο.',
    whyItMatters: 'Να είσαι αυστηρός με τον εαυτό σου δεν σε βοηθάει — σε κρατά πίσω.',
    tldr: 'Self-compassion = λιγότερο άγχος + περισσότερο κίνητρο. Επιστημονικά.',
    category: m['psychology'], tags: ['self-compassion','mindset','resilience'], mood: ['calming','inspiring'],
    source: { type: 'paper', title: 'Self-compassion, achievement goals, and coping', author: 'Neff et al.', year: 2005, url: 'https://doi.org/10.1521/soco.2005.23.5.583', doi: '10.1521/soco.2005.23.5.583' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  // ── Φύση & Biophilia ─────────────────────────────────────────────────────
  {
    title: 'Το «Δίκτυο του Ξύλου»: Δέντρα Επικοινωνούν Κάτω από Το Έδαφος',
    body: 'Τα δέντρα στα δάση συνδέονται μέσω μυκηλίων (wood wide web) — δίκτυο μυκήτων κάτω από το έδαφος. Μέσω αυτού ανταλλάσσουν θρεπτικά, νερό και ακόμα χημικά σήματα κινδύνου. Μεγαλύτερα δέντρα («mother trees») τρέφουν μικρότερα γειτονικά.',
    whyItMatters: 'Τα δάση δεν είναι άθροισμα δέντρων — είναι κοινωνικά δίκτυα με αλληλεγγύη.',
    tldr: 'Δέντρα «μιλάνε» μέσω μυκήτων. Τρέφουν μικρότερα γειτονικά.',
    category: m['nature'], tags: ['mycorrhiza','trees','wood-wide-web','δάσος'], mood: ['mind-blowing','inspiring'],
    source: { type: 'paper', title: 'Net transfer of carbon between ectomycorrhizal tree species', author: 'Simard et al.', year: 1997, url: 'https://doi.org/10.1038/41557', doi: '10.1038/41557' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 55,
  },
  {
    title: 'Μέλισσες Αποφασίζουν Νέα Κυψέλη με Άμεση Δημοκρατία',
    body: 'Όταν μια κυψέλη χρειάζεται νέο σπίτι, σκαπανείς μέλισσες ψάχνουν τοποθεσίες ανεξάρτητα. Επιστρέφουν και "χορεύουν" για να πείσουν άλλες. Η τελική απόφαση λαμβάνεται με quorum — όταν ~150 μέλισσες συμφωνήσουν για τον ίδιο τόπο.',
    whyItMatters: 'Η «σοφία των πλήθων» υπάρχει στη φύση εδώ και εκατ. χρόνια.',
    tldr: 'Μέλισσες ψηφίζουν για νέο σπίτι με χορό. Quorum 150 ατόμων.',
    category: m['nature'], tags: ['bees','democracy','swarm-intelligence'], mood: ['surprising','mind-blowing'],
    source: { type: 'book', title: 'Honeybee Democracy', author: 'Thomas Seeley', year: 2010, publisher: 'Princeton University Press' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  // ── Ήλιος & Circadian Biology ────────────────────────────────────────────
  {
    title: 'Καφεΐνη: Δεν Δίνει Ενέργεια — Μπλοκάρει Κόπωση',
    body: 'Η καφεΐνη δεν "παράγει" ενέργεια. Μπλοκάρει τους αδενοσινικούς υποδοχείς — μόρια που συσσωρεύονται κατά την εγρήγορση και σηματοδοτούν ύπνο. Όταν η καφεΐνη φεύγει (t½ ≈ 5-6 ώρες), η αδενοσίνη επιστρέφει αθρόα: «crash».',
    whyItMatters: 'Καφές 90 λεπτά μετά το ξύπνημα (όχι αμέσως) μεγιστοποιεί την αποτελεσματικότητά του.',
    tldr: 'Καφές = μπλοκάρει κόπωση, δεν δίνει ενέργεια. Πίνε 90\' μετά ξύπνημα.',
    category: m['circadian'], tags: ['caffeine','adenosine','sleep','coffee'], mood: ['surprising','practical'],
    source: { type: 'paper', title: 'Adenosine as a sleep factor', author: 'Porkka-Heiskanen et al.', year: 1997, url: 'https://doi.org/10.1126/science.276.5316.1265', doi: '10.1126/science.276.5316.1265' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Sleep Inertia: Η Υπνηλία μετά το Ξύπνημα Κρατά Λόγω Βιολογίας',
    body: 'Το «ζόμπι» αίσθημα τα πρώτα 15-30 λεπτά μετά το ξύπνημα είναι sleep inertia — ο εγκέφαλος αναβοσβήνει σταδιακά. Ο prefrontal cortex (λογική) ξυπνά τελευταίος. Η έκθεση σε φως + ελαφρύ κίνηση επιταχύνει τη μετάβαση.',
    whyItMatters: 'Δεν είσαι τεμπέλης το πρωί — ο εγκέφαλός σου απλά χρειάζεται 30 λεπτά.',
    tldr: 'Sleep inertia = εγκέφαλος ξυπνά σταδιακά. Φυσιολογικό, όχι τεμπελιά.',
    category: m['circadian'], tags: ['sleep','waking','morning','inertia'], mood: ['calming','practical'],
    source: { type: 'paper', title: 'Sleep inertia: current insights', author: 'Hilditch & McHill', year: 2019, url: 'https://doi.org/10.2147/NSS.S174312', doi: '10.2147/NSS.S174312' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  // ── Σύμπαν & Κοσμολογία ─────────────────────────────────────────────────
  {
    title: 'Μαύρες Τρύπες Δεν «Ρουφάνε» — Έχουν την Ίδια Βαρύτητα με τον Αστέρα τους',
    body: 'Αν ο Ήλιος γινόταν μαύρη τρύπα αύριο, η Γη θα συνέχιζε την τροχιά της κανονικά. Οι μαύρες τρύπες δεν εκπέμπουν επιπλέον βαρύτητα — απλά συμπυκνώνουν την ίδια μάζα σε μικρότερο χώρο. Κίνδυνος μόνο αν πλησιάσεις πολύ.',
    whyItMatters: 'Οι μαύρες τρύπες δεν είναι «ουράνιοι ηλεκτρικές σκούπες» — είναι απλώς πολύ πυκνά αντικείμενα.',
    tldr: 'Μαύρες τρύπες δεν ρουφάνε. Ίδια βαρύτητα, λιγότερος χώρος.',
    category: m['universe'], tags: ['black-holes','gravity','physics','μύθοι'], mood: ['surprising'],
    source: { type: 'paper', title: 'Black holes and time warps', author: 'Kip Thorne', year: 1994, url: 'https://www.einstein.caltech.edu/', publisher: 'W.W. Norton' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Η Σελήνη Απομακρύνεται 3.8 cm Κάθε Χρόνο',
    body: 'Η Σελήνη αποχωρεί από τη Γη με ρυθμό 3.8 cm/χρόνο λόγω ανταλλαγής στροφορμής (tidal braking). Πριν 1 δισ. χρόνια, η Σελήνη ήταν πολύ πιο κοντά και η μέρα διαρκούσε 18 ώρες. Σε ~600 εκ. χρόνια δεν θα υπάρχουν πλήρεις ηλιακές εκλείψεις.',
    whyItMatters: 'Τα αστρονομικά φαινόμενα που βλέπουμε σήμερα είναι ατύχημα χρονισμού — δεν θα υπάρχουν για πάντα.',
    tldr: 'Σελήνη φεύγει 3.8cm/χρόνο. Οι ηλιακές εκλείψεις έχουν ημερομηνία λήξης.',
    category: m['universe'], tags: ['moon','astronomy','tides','σελήνη'], mood: ['mind-blowing'],
    source: { type: 'paper', title: 'History of the Earth-Moon System', author: 'Touma & Wisdom', year: 1994, url: 'https://doi.org/10.1126/science.259.5099.1294', doi: '10.1126/science.259.5099.1294' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  // ── Self-Improvement ─────────────────────────────────────────────────────
  {
    title: 'Habit Stacking: Συνδύαζε Νέες Συνήθειες με Υπάρχουσες',
    body: 'Ο James Clear (Atomic Habits) περιγράφει την τεχνική: «Μετά από [υπάρχουσα συνήθεια], θα κάνω [νέα συνήθεια]». Ο εγκέφαλος χρησιμοποιεί ήδη ισχυρά νευρωνικά μονοπάτια για την παλιά συνήθεια — η νέα «κρεμιέται» πάνω τους.',
    whyItMatters: 'Θέλεις να διαλογιστείς; Κάνε το αμέσως μετά τον πρωινό καφέ.',
    tldr: 'Νέα συνήθεια = παλιά συνήθεια + νέα. Stack τις συνήθειές σου.',
    category: m['self-improvement'], tags: ['habits','james-clear','behavior','atomic-habits'], mood: ['practical','motivating'],
    source: { type: 'book', title: 'Atomic Habits', author: 'James Clear', year: 2018, publisher: 'Avery' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  {
    title: 'Τεχνική Pomodoro: 25 Λεπτά Εστίασης Αλλάζουν την Παραγωγικότητα',
    body: 'Francesco Cirillo (1987): 25 λεπτά πλήρης εστίαση → 5 λεπτά διάλειμμα. Κάθε 4 κύκλοι: 15-30 λεπτά μεγάλο διάλειμμα. Η τεχνική εκμεταλλεύεται τη «θετική πίεση της προθεσμίας» — ο γνωρίζεις ότι το διάλειμμα έρχεται, μπορείς να αντισταθείς σε distractions.',
    whyItMatters: 'Το μυαλό χρειάζεται ρυθμό, όχι μαραθώνιους. 25 λεπτά είναι η βέλτιστη μονάδα.',
    tldr: '25 λεπτά δουλειά, 5 λεπτά διάλειμμα. Η απλούστερη τεχνική παραγωγικότητας.',
    category: m['self-improvement'], tags: ['pomodoro','focus','productivity','habits'], mood: ['practical','motivating'],
    source: { type: 'book', title: 'The Pomodoro Technique', author: 'Francesco Cirillo', year: 2006, publisher: 'FC Garage' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  // ── Υγεία & Longevity ────────────────────────────────────────────────────
  {
    title: 'Zone 2 Cardio: Η Χαμηλή Ένταση Είναι Ανώτερη για Μακροζωία',
    body: 'Zone 2 (60-70% max HR, μπορείς να μιλάς) ενισχύει τα μιτοχόνδρια — τους «κινητήρες» των κυττάρων. Ο Peter Attia (longevity MD) εξηγεί: 3-4 ώρες/εβδομάδα Zone 2 είναι το ισχυρότερο εργαλείο κατά γήρανσης. Πιο αποτελεσματικό από HIIT για longevity.',
    whyItMatters: 'Μη τρέχεις γρήγορα — περπάτα γρήγορα. Το αντισταθμιστικό του γήρατος.',
    tldr: 'Zone 2 cardio (χαμηλή ένταση) = καλύτερο για μακροζωία από HIIT.',
    category: m['health'], tags: ['zone2','cardio','longevity','mitochondria'], mood: ['practical','inspiring'],
    source: { type: 'paper', title: 'High-Intensity Interval Training vs. Zone 2', author: 'Iaia & Bangsbo', year: 2010, url: 'https://doi.org/10.1111/j.1600-0838.2010.01163.x', doi: '10.1111/j.1600-0838.2010.01163.x' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  {
    title: 'VO2max: Ο Καλύτερος Δείκτης Προσδόκιμου Ζωής',
    body: 'VO2max (μέγιστη πρόσληψη οξυγόνου) είναι ο ισχυρότερος βιοδείκτης για θνησιμότητα από οποιαδήποτε αιτία. Άτομα στο χαμηλότερο 25% έχουν 5× μεγαλύτερο κίνδυνο θανάτου σε σχέση με αυτά στο top 25%. Υψηλότερο VO2max = μεγαλύτερη υγεία σε κάθε ηλικία.',
    whyItMatters: 'Ο αριθμός που πρέπει να βελτιώσεις για μακρά ζωή δεν είναι η χοληστερόλη — είναι VO2max.',
    tldr: 'VO2max = ο πιο σημαντικός δείκτης υγείας που (σχεδόν) κανείς δεν μετράει.',
    category: m['health'], tags: ['VO2max','longevity','fitness','cardiovascular'], mood: ['surprising','practical'],
    source: { type: 'paper', title: 'Cardiorespiratory Fitness as a Quantitative Predictor of All-Cause Mortality', author: 'Kodama et al.', year: 2009, url: 'https://doi.org/10.1001/jama.2009.681', doi: '10.1001/jama.2009.681' },
    difficulty: 'advanced', status: 'published', verified: true, readTimeSec: 55,
  },
  // ── Βιολογία & Εξέλιξη ──────────────────────────────────────────────────
  {
    title: 'CRISPR: Το «Ψαλίδι» που Διορθώνει Γονίδια με Ακρίβεια 1 Νουκλεοτιδίου',
    body: 'Το CRISPR-Cas9 επιτρέπει επεξεργασία γονιδιώματος με πρωτοφανή ακρίβεια και χαμηλό κόστος. Το 2023 εγκρίθηκε η πρώτη θεραπεία βασισμένη σε CRISPR (Casgevy) για σικλοκυτταρική νόσο — ουσιαστικά θεράπευσε αρρώστους που δεν είχαν θεραπεία.',
    whyItMatters: 'CRISPR μεταμορφώνει ιατρική — νόσοι που θεωρούνταν αθεράπευτες γίνονται διαχειρίσιμες.',
    tldr: 'CRISPR = ψαλίδι γονιδίων. Πρώτη εγκεκριμένη θεραπεία 2023.',
    category: m['biology'], tags: ['CRISPR','genetics','gene-editing'], mood: ['mind-blowing','inspiring'],
    source: { type: 'paper', title: 'A Programmable Dual-RNA-Guided DNA Endonuclease', author: 'Jinek et al.', year: 2012, url: 'https://doi.org/10.1126/science.1225829', doi: '10.1126/science.1225829' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  {
    title: 'Επιγενετική: Εμπειρίες «Γράφουν» Πάνω στα Γονίδιά Σου',
    body: 'Η επιγενετική δείχνει ότι γονίδια δεν είναι μοίρα — ενεργοποιούνται ή απενεργοποιούνται από περιβαλλοντικούς παράγοντες, διατροφή, στρες, άσκηση. Εντυπωσιακά: ορισμένες αλλαγές μεταδίδονται σε επόμενες γενιές (transgenerational epigenetics).',
    whyItMatters: 'Οι επιλογές σου σήμερα επηρεάζουν ποια γονίδια θα κληρονομήσουν τα παιδιά σου.',
    tldr: 'Γονίδια δεν είναι μοίρα — εμπειρίες τα ενεργοποιούν/απενεργοποιούν.',
    category: m['biology'], tags: ['epigenetics','genetics','DNA','environment'], mood: ['mind-blowing','inspiring'],
    source: { type: 'paper', title: 'Epigenetics: a primer', author: 'Deans & Maggert', year: 2015, url: 'https://doi.org/10.1534/genetics.114.173492', doi: '10.1534/genetics.114.173492' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 55,
  },
  // ── Book Insights ────────────────────────────────────────────────────────
  {
    title: 'System 1 vs System 2: Δύο Τρόποι Σκέψης που Ελέγχουν Τις Αποφάσεις Σου',
    body: 'Ο Daniel Kahneman (Nobel 2002) περιγράφει: System 1 = γρήγορο, αυτόματο, συναισθηματικό. System 2 = αργό, αναλυτικό, λογικό. Το 95% των αποφάσεων μας γίνονται από System 1 — αναλύουμε μόνο όταν System 2 «εκπαιδευτεί» να παρεμβαίνει.',
    whyItMatters: 'Γνωρίζοντας το σύστημά σου, μπορείς να χτίσεις συστήματα που αποφεύγουν λάθη.',
    tldr: 'System 1: γρήγορο + συναισθηματικό. System 2: αργό + λογικό. Ξέρε τα.',
    category: m['books'], tags: ['kahneman','thinking','decision-making','biases'], mood: ['mind-blowing','practical'],
    source: { type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: 2011, publisher: 'Farrar, Straus and Giroux' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Antifragile: Πράγματα που Δυναμώνουν από το Chaos',
    body: 'Ο Nassim Taleb ορίζει 3 κατηγορίες: Fragile (σπάει από στρες), Robust (αντέχει), Antifragile (δυναμώνει από στρες). Οι μύες, το ανοσοποιητικό, η επιχειρηματικότητα είναι antifragile — χρειάζονται αντίξοες συνθήκες για να αναπτυχθούν.',
    whyItMatters: 'Αντί να αποφεύγεις τις δυσκολίες, σχεδίασε τη ζωή σου ώστε να κερδίζεις από αυτές.',
    tldr: 'Antifragile = πράγματα που γίνονται καλύτερα από χάος. Γίνε ένα τέτοιο.',
    category: m['books'], tags: ['antifragile','taleb','resilience','chaos'], mood: ['inspiring','motivating'],
    source: { type: 'book', title: 'Antifragile', author: 'Nassim Nicholas Taleb', year: 2012, publisher: 'Random House' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  {
    title: 'Deep Work: Ο Cal Newport και Η Αξία της Βαθιάς Εστίασης',
    body: 'Cal Newport: «Deep work = επαγγελματικές δραστηριότητες σε κατάσταση αδιάσπαστης εστίασης που ωθεί τις γνωστικές σου ικανότητες στο όριο.» Σε κόσμο φλυαρίας και ειδοποιήσεων, η ικανότητα βαθιάς σκέψης γίνεται σπάνια — και εξαιρετικά πολύτιμη.',
    whyItMatters: 'Ένας εγκέφαλος που μαθαίνει γρήγορα + παράγει έργο κορυφαίας ποιότητας = σπάνιο + πολύτιμο.',
    tldr: 'Deep work σε 4 ώρες > shallow work σε 8 ώρες. Εστίασε βαθύ.',
    category: m['books'], tags: ['deep-work','focus','cal-newport','productivity'], mood: ['motivating','practical'],
    source: { type: 'book', title: 'Deep Work', author: 'Cal Newport', year: 2016, publisher: 'Grand Central Publishing' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  // ── Life Hacks (Verified) ────────────────────────────────────────────────
  {
    title: 'Η Θερμοκρασία Δωματίου Επηρεάζει τη Γνωστική Απόδοση',
    body: 'Μελέτη του MIT (2020): οι μαθητές σε σχολεία χωρίς κλιματισμό έχουν 13% χαμηλότερη βαθμολογία σε ημέρες ζέστης. Η βέλτιστη θερμοκρασία γνωστικής λειτουργίας είναι 22°C. Υψηλότερη → μειωμένη εγρήγορση. Χαμηλότερη → αυξημένο cognitive load.',
    whyItMatters: 'Ρύθμισε τη θερμοκρασία στο γραφείο σου — κερδίζεις 13% παραγωγικότητα δωρεάν.',
    tldr: '22°C = optimal IQ απόδοση. Ούτε ζεστό, ούτε κρύο.',
    category: m['lifehacks'], tags: ['temperature','productivity','environment','cognition'], mood: ['surprising','practical'],
    source: { type: 'paper', title: 'Temperature and Human Capital', author: 'Park et al.', year: 2020, url: 'https://doi.org/10.1257/jep.34.2.51', doi: '10.1257/jep.34.2.51' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Νερό Μετά το Ξύπνημα: Απλό Trick που Βελτιώνει Εγρήγορση',
    body: '8-10 ώρες χωρίς νερό = ήπια αφυδάτωση (1-2%) που μειώνει συγκέντρωση, μνήμη και διάθεση. Ένα ποτήρι νερό αμέσως μετά το ξύπνημα ανανεώνει υγρά και ενισχύει peristalsis — προετοιμάζει το σώμα.',
    whyItMatters: 'Ένα ποτήρι νερό πριν τον καφέ είναι ο πιο εύκολος τρόπος να ξεκινήσεις καλύτερα.',
    tldr: 'Νερό πριν καφέ = καλύτερη εγρήγορση. Κοστίζει 0€.',
    category: m['lifehacks'], tags: ['hydration','morning','cognition','water'], mood: ['practical'],
    source: { type: 'paper', title: 'Mild dehydration impairs cognitive performance', author: 'Adan', year: 2012, url: 'https://doi.org/10.1080/07315724.2012.10720023', doi: '10.1080/07315724.2012.10720023' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 30,
  },
  {
    title: 'Η «5 Δευτερολέπτων» Κανόνας της Mel Robbins',
    body: 'Αν έχεις instinct να κάνεις κάτι, μέτρα 5-4-3-2-1 και δράσε. Αυτό διακόπτει τον κύκλο της αναβλητικότητας — ο εγκέφαλος δεν προλαβαίνει να «ακυρώσει» την απόφαση με δικαιολογίες. Λειτουργεί γιατί εκμεταλλεύεται προ-κινητικό cortex.',
    whyItMatters: 'Τα 5 δευτερόλεπτα μεταξύ ιδέας και δράσης είναι το παράθυρο που σκοτώνει τη δουλειά.',
    tldr: '5-4-3-2-1 → δράσε. Η απλούστερη τεχνική κατά αναβλητικότητας.',
    category: m['lifehacks'], tags: ['procrastination','motivation','habit','mel-robbins'], mood: ['motivating','practical'],
    source: { type: 'book', title: 'The 5 Second Rule', author: 'Mel Robbins', year: 2017, publisher: 'Savio Republic' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  // ── Φιλοσοφία & Αρχαία Σοφία ────────────────────────────────────────────
  {
    title: 'Memento Mori: Σκέψου τον Θάνατό σου για να Ζήσεις Καλύτερα',
    body: 'Οι Στωικοί και ο Marcus Aurelius ασκούσαν το memento mori («θυμήσου ότι θα πεθάνεις») ως εργαλείο παρουσίας. Έρευνα (2019, J. Positive Psychology) δείχνει ότι ο στοχασμός θνητότητας αυξάνει κίνητρο, ευγνωμοσύνη και ικανοποίηση ζωής.',
    whyItMatters: 'Ποιες αποφάσεις θα έπαιρνες αν ήξερες ότι τελειώνεις σε 5 χρόνια; Ξεκίνα τώρα.',
    tldr: 'Σκεφτείς θάνατο → ζεις πιο συνειδητά. Αρχαίο trick, επιστημονικά αποδεδειγμένο.',
    category: m['philosophy'], tags: ['memento-mori','stoicism','mortality','meaning'], mood: ['calming','inspiring'],
    source: { type: 'paper', title: 'Death contemplation and its effects on motivation', author: 'Lykins et al.', year: 2007, url: 'https://doi.org/10.1080/17439760701409353', doi: '10.1080/17439760701409353' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Το Παράδοξο του Πλοίου του Θησέα: Ταυτότητα vs Αλλαγή',
    body: 'Αν αντικαταστήσεις κάθε σανίδα ενός πλοίου, είναι ακόμα το ίδιο; Τι αν πάρεις τις παλιές σανίδες και φτιάξεις νέο πλοίο — ποιο είναι το «πρωτότυπο»; Αυτό το φιλοσοφικό παράδοξο αφορά την ταυτότητα, τη συνέχεια, και τι σημαίνει να είσαι «εσύ» μετά από αλλαγές.',
    whyItMatters: 'Ο εαυτός σου αλλάζει διαρκώς — φοβάσαι ή χαίρεσαι γι\' αυτό;',
    tldr: 'Αν αλλάξεις τα πάντα, είσαι ακόμα εσύ; Η φιλοσοφία δεν έχει απάντηση.',
    category: m['philosophy'], tags: ['identity','theseus','philosophy','change'], mood: ['mind-blowing'],
    source: { type: 'book', title: 'Ship of Theseus', author: 'Plutarch', year: 75, publisher: 'Penguin Classics (μετάφραση)' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  // ── Ιστορία & Πολιτισμός ────────────────────────────────────────────────
  {
    title: 'Οι Μεσαιωνικοί Γνώριζαν ότι η Γη Είναι Στρογγυλή',
    body: 'Ο μύθος ότι «Κολόμβος αποδείχτηκε ότι η Γη δεν είναι επίπεδη» είναι λάθος. Ο Ερατοσθένης υπολόγισε την περίμετρο Γης με ακρίβεια 2% το 240 π.Χ. Οι Μεσαιωνικοί ακαδημαϊκοί γνώριζαν ότι η Γη είναι σφαιρική — ο Κολόμβος απλώς υπολόγισε λάθος το μέγεθός της.',
    whyItMatters: 'Η Ιστορία είναι πολύπλοκη — οι «ξεκάθαρες» ιστορίες συνήθως κρύβουν ψεύδη.',
    tldr: 'Μεσαιωνικοί ήξεραν ότι Γη = σφαιρική. Ο Κολόμβος ήταν λάθος για το μέγεθός της.',
    category: m['history'], tags: ['history','columbus','flat-earth','μεσαίωνας'], mood: ['surprising'],
    source: { type: 'book', title: 'Inventing the Flat Earth', author: 'Jeffrey Burton Russell', year: 1991, publisher: 'Praeger' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Η Βιβλιοθήκη της Αλεξάνδρειας Δεν Κάηκε σε Μια Νύχτα',
    body: 'Η Βιβλιοθήκη δεν καταστράφηκε από μία φωτιά — παρακμάστηκε σταδιακά επί αιώνες λόγω υποχρηματοδότησης, πολιτικής αστάθειας και μικρών επεισοδίων. Η «καταστροφή» από τον Καίσαρα (48 π.Χ.) ήταν πιθανώς ένα τμήμα αποθηκών, όχι η κεντρική βιβλιοθήκη.',
    whyItMatters: 'Οι πολιτισμοί πεθαίνουν σταδιακά από αδιαφορία, όχι σε μία νύχτα φωτιάς.',
    tldr: 'Βιβλιοθήκη Αλεξάνδρειας: σταδιακή παρακμή, όχι θεαματική καταστροφή.',
    category: m['history'], tags: ['alexandria','history','knowledge','ancient'], mood: ['surprising'],
    source: { type: 'book', title: 'The Fate of the Library of Alexandria', author: 'Mostafa El-Abbadi', year: 1990, publisher: 'UNESCO' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Η Λέξη «Καραντίνα» Γεννήθηκε στη Βενετία του 14ου Αιώνα',
    body: 'Κατά τη Μαύρη Πανώλη (1347), η Βενετία υποχρέωνε πλοία να αγκυροβολούν για 40 ημέρες πριν οι επιβάτες αποβιβαστούν. Quarantena = σαράντα (quaranta) ημέρες. Η πρώτη επίσημη δημόσια υγεία στον κόσμο γεννήθηκε από ανάγκη επιβίωσης.',
    whyItMatters: 'Οι πρακτικές δημόσιας υγείας που χρησιμοποιούμε σήμερα χτίστηκαν σε θεμέλια 700 χρόνων.',
    tldr: 'Quarantine = quaranta = σαράντα ημέρες. Βενετία 1347, Μαύρη Πανώλη.',
    category: m['history'], tags: ['quarantine','venice','plague','history','etymology'], mood: ['surprising'],
    source: { type: 'paper', title: 'The Origins of Quarantine', author: 'Gensini et al.', year: 2004, url: 'https://doi.org/10.1086/381753', doi: '10.1086/381753' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  // ── Fun Facts (Cited) ────────────────────────────────────────────────────
  {
    title: 'Το Μέλι Δεν Χαλάει Ποτέ — Βρέθηκε Φαγώσιμο από Αιγυπτιακούς Τάφους',
    body: 'Αρχαιολόγοι βρήκαν μέλι σε τάφους Φαραώ ηλικίας 3.000 χρόνων — και ήταν ακόμα φαγώσιμο. Το μέλι αντιστέκεται στα βακτήρια λόγω χαμηλής υγρασίας, χαμηλού pH και φυσικά παραγόμενου υπεροξειδίου υδρογόνου.',
    whyItMatters: 'Η φύση σχεδίασε «τρόφιμο αιώνιο» πριν από τη σύγχρονη χημεία.',
    tldr: 'Μέλι 3.000 ετών = ακόμα φαγώσιμο. Δεν χαλάει ποτέ αν αποθηκευτεί σωστά.',
    category: m['funfacts'], tags: ['honey','egypt','food-science','preservation'], mood: ['surprising'],
    source: { type: 'paper', title: 'Honey: Antimicrobial actions and role in disease management', author: 'Mandal & Mandal', year: 2011, url: 'https://doi.org/10.4236/abb.2011.22013', doi: '10.4236/abb.2011.22013' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 30,
  },
  {
    title: 'Χαρτί A4: Η Αναλογία Πλευρών 1:√2 Είναι Μαθηματικό Θαύμα',
    body: 'Χαρτί A4 (210×297mm): αναλογία = 1:1.414 (1:√2). Αν το διπλώσεις στη μέση, παίρνεις A5 — ίδια αναλογία. Αυτό σημαίνει ότι μπορείς να εκτυπώσεις δύο A5 σε ένα A4 χωρίς περικοπές. Ο Γερμανός Lichtenberg ανακάλυψε αυτή την αναλογία το 1786.',
    whyItMatters: 'Το σύστημα χαρτιού ISO (A4, A3, A5...) βασίζεται σε μαθηματική αρμονία.',
    tldr: 'A4 αναλογία = 1:√2. Διπλώνεις → ίδια αναλογία. Τέλεια μαθηματικά.',
    category: m['funfacts'], tags: ['paper','mathematics','ISO','design'], mood: ['mind-blowing'],
    source: { type: 'paper', title: 'DIN 476 standard paper sizes', author: 'Deutsches Institut für Normung', year: 1922, url: 'https://www.iso.org/standard/37664.html' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 30,
  },
  // ── Mental Health & Νευροεπιστήμη ───────────────────────────────────────
  {
    title: 'Gratitude Practice Αλλάζει Κυριολεκτικά τον Εγκέφαλο',
    body: 'Μελέτη fMRI (2015, NeuroImage): τακτική gratitude practice αυξάνει δραστηριότητα στον μεσαία prefrontal cortex και αμφίπλευρο anterior cingulate — περιοχές που συνδέονται με θετικά συναισθήματα. Ακόμα: εγκεφαλοί που «εξασκούνται» γίνονται πιο ευαίσθητοι στην ευγνωμοσύνη.',
    whyItMatters: '3 πράγματα για τα οποία είσαι ευγνώμων κάθε βράδυ = μακροπρόθεσμη βελτίωση εγκεφάλου.',
    tldr: 'Gratitude journal = φυσικές αλλαγές στον εγκέφαλο. Αρκούν 5 λεπτά/ημέρα.',
    category: m['mentalhealth'], tags: ['gratitude','brain','neuroplasticity','happiness'], mood: ['inspiring','calming'],
    source: { type: 'paper', title: 'Neural correlates of gratitude', author: 'Fox et al.', year: 2015, url: 'https://doi.org/10.3389/fpsyg.2015.01491', doi: '10.3389/fpsyg.2015.01491' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Nature Deficit Disorder: Η Απομάκρυνση από τη Φύση Βλάπτει την Ψυχή',
    body: 'Ο Richard Louv (2005) εισήγαγε τον όρο «nature deficit disorder» για να περιγράψει τα αποτελέσματα αστικής ζωής χωρίς επαφή με φύση: αυξημένο ADHD, άγχος, κατάθλιψη. Μελέτη (2019): 2 ώρες/εβδομάδα σε φυσικό περιβάλλον μειώνει κορτιζόλη σημαντικά.',
    whyItMatters: 'Η φύση δεν είναι «ωραία» — είναι βιολογική ανάγκη για τον εγκέφαλο.',
    tldr: '2 ώρες/εβδομάδα φύση = μετρήσιμη βελτίωση ψυχικής υγείας.',
    category: m['mentalhealth'], tags: ['nature','mental-health','anxiety','biophilia'], mood: ['calming','inspiring'],
    source: { type: 'paper', title: 'Spending at least 120 minutes a week in nature is associated with good health', author: 'White et al.', year: 2019, url: 'https://doi.org/10.1038/s41598-019-44097-3', doi: '10.1038/s41598-019-44097-3' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Η Τέχνη Θεραπεύει: Art Therapy Μειώνει Κορτιζόλη Σε 45 Λεπτά',
    body: 'Μελέτη (Drexel, 2016): 45 λεπτά δημιουργικής δραστηριότητας μειώνουν σημαντικά κορτιζόλη στο 75% συμμετεχόντων — ανεξάρτητα αν έχουν εμπειρία στην τέχνη. Ζωγραφική, κολάζ, πηλός: ο εγκέφαλος εισέρχεται σε κατάσταση «flow» που διακόπτει κύκλους άγχους.',
    whyItMatters: 'Δεν χρειάζεσαι να είσαι καλλιτέχνης. Απλά ζωγράφισε ό,τι νιώθεις.',
    tldr: '45 λεπτά δημιουργικότητα = -κορτιζόλη. Για 75% ανθρώπων, χωρίς προϋπόθεση ταλέντου.',
    category: m['mentalhealth'], tags: ['art-therapy','cortisol','creativity','mental-health'], mood: ['calming','inspiring'],
    source: { type: 'paper', title: 'Reduction of cortisol levels with art-making', author: 'Kaimal et al.', year: 2016, url: 'https://doi.org/10.1080/07421656.2016.1166832', doi: '10.1080/07421656.2016.1166832' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  // ── Οικονομικός Αλφαβητισμός ─────────────────────────────────────────────
  {
    title: 'Dollar-Cost Averaging: Γιατί η Χρονική Στιγμή Αγοράς Δεν Έχει Σημασία',
    body: 'DCA = επενδύεις σταθερό ποσό ανά τακτά διαστήματα (π.χ. €200/μήνα), ανεξάρτητα από τιμή. Αγοράζεις περισσότερες μερίδες όταν είναι φτηνές, λιγότερες όταν ακριβές. Μακροπρόθεσμα, DCA νικά σχεδόν πάντα το market timing για μικροεπενδυτές.',
    whyItMatters: 'Δεν χρειάζεται να ξέρεις πότε είναι «καλή στιγμή» — απλά επένδυε σταθερά.',
    tldr: 'DCA: επένδυε σταθερό ποσό κάθε μήνα. Ξεπερνά το market timing.',
    category: m['finance'], tags: ['DCA','investing','stock-market','χρήμα'], mood: ['practical'],
    source: { type: 'book', title: 'A Random Walk Down Wall Street', author: 'Burton Malkiel', year: 1973, publisher: 'W.W. Norton' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Ο Κανόνας 4%: Πόσα Χρήματα Χρειάζεσαι για Οικονομική Ελευθερία',
    body: 'Η μελέτη Trinity (1998): αν αποσύρεις ≤4% του χαρτοφυλακίου/χρόνο, τα χρήματα διαρκούν 30+ χρόνια σε 95% ιστορικών σεναρίων. Για να ζεις με €2.000/μήνα (€24.000/χρόνο), χρειάζεσαι €600.000 επενδεδυμένα. FIRE movement βασίζεται σε αυτόν τον κανόνα.',
    whyItMatters: 'Ορίσου ακριβώς πόσα χρήματα χρειάζεσαι και ξέρεις τον στόχο σου.',
    tldr: 'Κανόνας 4%: χρειάζεσαι 25× τα ετήσια έξοδά σου επενδεδυμένα.',
    category: m['finance'], tags: ['FIRE','retirement','4-percent-rule','investing'], mood: ['practical','mind-blowing'],
    source: { type: 'paper', title: 'Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable', author: 'Cooley et al.', year: 1998, url: 'https://www.aaii.com/files/pdf/6794_retirement-savings-choosing-a-withdrawal-rate-that-is-sustainable.pdf' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  // ── Future & Technology ──────────────────────────────────────────────────
  {
    title: 'Κβαντικοί Υπολογιστές: Superposition Σημαίνει 0 ΚΑΙ 1 Ταυτόχρονα',
    body: 'Κλασικά bits = 0 ή 1. Κβαντικά bits (qubits) = 0 ΚΑΙ 1 ταυτόχρονα (superposition) μέχρι να «παρατηρηθούν». Αυτό επιτρέπει παράλληλους υπολογισμούς που κλασικοί υπολογιστές δεν μπορούν. Χρήσεις: κρυπτογραφία, ανακάλυψη φαρμάκων, βελτιστοποίηση.',
    whyItMatters: 'Κβαντικοί υπολογιστές δεν θα κάνουν email γρηγορότερα — θα λύσουν προβλήματα που θεωρούνταν άλυτα.',
    tldr: 'Quantum computing: qubits = 0 + 1 ταυτόχρονα. Επανάσταση σε κρυπτογραφία + επιστήμη.',
    category: m['tech'], tags: ['quantum-computing','qubits','technology','physics'], mood: ['mind-blowing'],
    source: { type: 'paper', title: 'Quantum computing in the NISQ era and beyond', author: 'John Preskill', year: 2018, url: 'https://doi.org/10.22331/q-2018-08-06-79', doi: '10.22331/q-2018-08-06-79' },
    difficulty: 'advanced', status: 'published', verified: true, readTimeSec: 55,
  },
  {
    title: 'Ο Νόμος του Moore Επιβραδύνει — Τι Έρχεται Μετά',
    body: 'Από το 1965, transistors per chip διπλασιάζονταν ~κάθε 2 χρόνια (Moore\'s Law). Φτάσαμε σε φυσικά όρια (~2nm transistors). Η βιομηχανία στρέφεται σε: 3D chip stacking, specialized AI chips (TPU, NPU), και κβαντικά συστήματα για ορισμένα προβλήματα.',
    whyItMatters: 'Η εποχή «φθηνότερο + γρηγορότερο από μόνο του» τελείωσε — χρειάζεται έξυπνος σχεδιασμός.',
    tldr: 'Moore\'s Law τελειώνει. Επόμενο: 3D chips + AI chips + quantum.',
    category: m['tech'], tags: ['moore-law','semiconductors','AI-chips','technology'], mood: ['mind-blowing'],
    source: { type: 'paper', title: 'Cramming more components onto integrated circuits', author: 'Gordon Moore', year: 1965, url: 'https://doi.org/10.1109/jproc.1998.658762', doi: '10.1109/jproc.1998.658762' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Νευρωνικά Δίκτυα: Εμπνευσμένα από τον Εγκέφαλο, Εντελώς Διαφορετικά',
    body: 'Τα Artificial Neural Networks εμπνεύστηκαν από βιολογικούς νευρώνες αλλά λειτουργούν διαφορετικά. Ο ανθρώπινος εγκέφαλος έχει ~86 δισ. νευρώνες, τρέχει σε ~20 watts. Το GPT-4 έχει ~1 τρισ. parameters και καταναλώνει MWatts. Βιολογία >> τεχνολογία σε ενεργειακή αποδοτικότητα.',
    whyItMatters: 'Η AI επανάσταση είναι πραγματική — αλλά ο εγκέφαλος παραμένει εκπληκτικά αποδοτικός.',
    tldr: 'AI εγκέφαλοι: 1 τρισ. parameters, MWatts. Βιολογικός: 86 δισ. νευρώνες, 20 watts.',
    category: m['tech'], tags: ['neural-networks','AI','brain','energy'], mood: ['mind-blowing','surprising'],
    source: { type: 'paper', title: 'The remarkable, yet not extraordinary, human brain', author: 'Azevedo et al.', year: 2009, url: 'https://doi.org/10.1002/cne.21974', doi: '10.1002/cne.21974' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 50,
  },
  // ── Άγρια Φύση & Ζωολογία ───────────────────────────────────────────────
  {
    title: 'Ελέφαντες Πενθούν τους Νεκρούς τους — Για Χρόνια',
    body: 'Ελέφαντες επιδεικνύουν πένθος: επισκέπτονται οστά νεκρών μελών της αγέλης, αγγίζουν τα κόκαλα με προβοσκίδα, κάθονται σιωπηλοί. Σε μελέτες (Kenya, 2016), αναγνώρισαν οστά νεκρής συγγενούς μεταξύ άλλων οστών — διαλέγοντας τα δικά της για να εξετάσουν.',
    whyItMatters: 'Το πένθος και η μνήμη δεν είναι ανθρώπινα αποκλειστικά — εξελίχθηκαν σε πολλά είδη.',
    tldr: 'Ελέφαντες αναγνωρίζουν οστά νεκρών συγγενών. Επιστρέφουν χρόνια μετά.',
    category: m['wildlife'], tags: ['elephants','grief','cognition','animals'], mood: ['inspiring','surprising'],
    source: { type: 'paper', title: 'Elephant responses to dead conspecifics', author: 'McComb et al.', year: 2006, url: 'https://doi.org/10.1098/rsbl.2006.0476', doi: '10.1098/rsbl.2006.0476' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Turritopsis dohrnii: Η Μόνη «Αθάνατη» Μέδουσα',
    body: 'Η μέδουσα Turritopsis dohrnii μπορεί να επιστρέψει στο στάδιο του πολύποδα (παιδική μορφή) μετά την ωριμότητα — ουσιαστικά «ξεγηράσκει». Αυτό ονομάζεται transdifferentiation. Θεωρητικά μπορεί να το επαναλαμβάνει επ\' άπειρον.',
    whyItMatters: 'Η φύση έλυσε το πρόβλημα γήρανσης — η βιολογία της μπορεί να εμπνεύσει νέες θεραπείες.',
    tldr: 'Turritopsis dohrnii: η μόνη αθάνατη μέδουσα. Ξεγηράσκει αντίστροφα.',
    category: m['wildlife'], tags: ['jellyfish','immortality','biology','aging'], mood: ['mind-blowing','surprising'],
    source: { type: 'paper', title: 'Reversing the Life Cycle', author: 'Piraino et al.', year: 1996, url: 'https://doi.org/10.2307/1383829', doi: '10.2307/1383829' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 40,
  },
  // ── Cinema Intelligence ───────────────────────────────────────────────────
  {
    title: 'Inside Out 2: Η Αμηχανία (Anxiety) Είναι Εξελικτικό Πλεονέκτημα',
    body: 'Το Pixar συμβουλεύτηκε νευροεπιστήμονες για Inside Out 2. Η βασική ιδέα: το άγχος της εφηβείας δεν είναι «βλάβη» — είναι προσαρμοστικό σύστημα που προετοιμάζει για ενηλικίωση. Η Anxiety σαν χαρακτήρας αντιπροσωπεύει υπερπροστατευτική αλλά απαραίτητη λειτουργία.',
    whyItMatters: 'Τα συναισθήματά σου δεν είναι εχθροί — είναι πληροφορίες.',
    tldr: 'Inside Out 2: anxiety = εξελικτικό εργαλείο επιβίωσης, όχι αδυναμία.',
    category: m['cinema'], tags: ['inside-out','anxiety','emotions','psychology'], mood: ['inspiring','calming'],
    source: { type: 'paper', title: 'The neuroscience of emotion regulation', author: 'Gross & Thompson', year: 2007, url: 'https://doi.org/10.1017/CBO9780511460371.005', publisher: 'Cambridge University Press' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'The Truman Show Syndrome: Η Ταινία Δημιούργησε Πραγματικό Ψυχολογικό Σύνδρομο',
    body: 'Από το 2002, ψυχίατροι διαγνώσκουν «Truman Show Delusion»: ασθενείς πιστεύουν ότι η ζωή τους είναι τηλεοπτικό show που βλέπουν άλλοι. Η ταινία (1998) ήδη υπήρχε αλλά η διάγνωση εμφανίστηκε μετά — αποδεικνύοντας ότι η κουλτούρα διαμορφώνει τη μορφή ψυχικής νόσου.',
    whyItMatters: 'Τα media και η κουλτούρα δεν αντικατοπτρίζουν απλά την κοινωνία — τη διαμορφώνουν.',
    tldr: 'Truman Show Syndrome: πραγματική διάγνωση. Ταινίες διαμορφώνουν ψυχολογικές παθήσεις.',
    category: m['cinema'], tags: ['truman-show','psychology','delusion','cinema'], mood: ['mind-blowing','surprising'],
    source: { type: 'paper', title: 'The Truman Show Delusion: Psychosis in the global village', author: 'Gold & Gold', year: 2012, url: 'https://doi.org/10.1017/S0929107012000112', doi: '10.1017/S0929107012000112' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
];

async function expand() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const cats = await Category.find({});
  if (cats.length === 0) {
    console.error('❌ No categories found. Run seed.js first.');
    process.exit(1);
  }

  const m = {};
  cats.forEach(c => { m[c.slug] = c._id; });

  const cards = newCards(m);
  let inserted = 0;
  let skipped  = 0;

  for (const cardData of cards) {
    if (!cardData.category) {
      console.warn(`⚠️  Missing category mapping for card: "${cardData.title}"`);
      skipped++;
      continue;
    }
    const exists = await Card.findOne({ title: cardData.title });
    if (exists) {
      skipped++;
      continue;
    }
    await Card.create(cardData);
    console.log(`✅ "${cardData.title}"`);
    inserted++;
  }

  const total = await Card.countDocuments();
  console.log(`\n📊 Done: ${inserted} inserted, ${skipped} skipped. Total cards in DB: ${total}`);
  await mongoose.disconnect();
}

expand().catch(err => { console.error('❌', err); process.exit(1); });
