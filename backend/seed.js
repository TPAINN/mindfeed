require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Card     = require('./models/Card');

const categories = [
  { name: 'Επιστήμη & Έρευνα',        slug: 'science',        emoji: '🔬', color: '#6366f1', order: 1  },
  { name: 'Ψυχολογία & Mindset',       slug: 'psychology',     emoji: '🧠', color: '#8b5cf6', order: 2  },
  { name: 'Φύση & Biophilia',          slug: 'nature',         emoji: '🌿', color: '#22c55e', order: 3  },
  { name: 'Ήλιος & Circadian Biology', slug: 'circadian',      emoji: '☀️', color: '#f59e0b', order: 4  },
  { name: 'Σύμπαν & Κοσμολογία',       slug: 'universe',       emoji: '🌌', color: '#0ea5e9', order: 5  },
  { name: 'Self-Improvement',           slug: 'self-improvement',emoji: '💪', color: '#ef4444', order: 6  },
  { name: 'Υγεία & Longevity',         slug: 'health',         emoji: '🍎', color: '#84cc16', order: 7  },
  { name: 'Βιολογία & Εξέλιξη',        slug: 'biology',        emoji: '🧬', color: '#06b6d4', order: 8  },
  { name: 'Book Insights',              slug: 'books',          emoji: '📖', color: '#d97706', order: 9  },
  { name: 'Cinema Intelligence',        slug: 'cinema',         emoji: '🎬', color: '#ec4899', order: 10 },
  { name: 'Life Hacks (Verified)',      slug: 'lifehacks',      emoji: '⚡', color: '#eab308', order: 11 },
  { name: 'Φιλοσοφία & Αρχαία Σοφία',  slug: 'philosophy',     emoji: '🏛️', color: '#a78bfa', order: 12 },
  { name: 'Ιστορία & Πολιτισμός',      slug: 'history',        emoji: '🌍', color: '#f97316', order: 13 },
  { name: 'Fun Facts (Cited)',          slug: 'funfacts',       emoji: '💡', color: '#facc15', order: 14 },
  { name: 'Mental Health & Νευροεπ.',  slug: 'mentalhealth',   emoji: '🧘', color: '#34d399', order: 15 },
  { name: 'Οικονομικός Αλφαβητισμός',  slug: 'finance',        emoji: '💰', color: '#4ade80', order: 16 },
  { name: 'Future & Technology',        slug: 'tech',           emoji: '🔭', color: '#38bdf8', order: 17 },
  { name: 'Άγρια Φύση & Ζωολογία',     slug: 'wildlife',       emoji: '🦁', color: '#fb923c', order: 18 },
];

const sampleCards = (m) => [
  {
    title: '20 λεπτά στο δάσος μειώνουν την κορτιζόλη κατά 15%',
    body: 'Ιαπωνική έρευνα ανακάλυψε ότι ακόμα και μια σύντομη βόλτα σε δασικό περιβάλλον μειώνει σημαντικά τα επίπεδα κορτιζόλης (ορμόνη του στρες). Το φαινόμενο ονομάζεται "Shinrin-yoku" (δασικό μπάνιο) και έχει ίδια αποτελεσματικότητα με ελαφρά άσκηση για τη μείωση άγχους.',
    whyItMatters: 'Δεν χρειάζεσαι γυμναστήριο για να μειώσεις το stress — αρκεί ένα πάρκο.',
    tldr: '20 λεπτά στη φύση = -15% κορτιζόλη.',
    category: m['nature'], tags: ['shinrin-yoku','cortisol','stress','φύση'], mood: ['calming','practical'],
    source: { type: 'paper', title: 'Effect of forest bathing trips on human immune function', author: 'Qing Li', year: 2010, url: 'https://doi.org/10.1007/s12199-008-0068-3', doi: '10.1007/s12199-008-0068-3', publisher: 'Environmental Health and Preventive Medicine' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  {
    title: 'Το πρωινό φως ρυθμίζει ολόκληρο το βιολογικό σου ρολόι',
    body: 'Η έκθεση στο φυσικό φως τις πρώτες 30-60 λεπτά μετά το ξύπνημα ρυθμίζει τον κιρκάδιο ρυθμό — τον βιολογικό ρυθμό 24 ωρών που ελέγχει ύπνο, εγρήγορση, ορμόνες και μεταβολισμό. Ο Dr. Andrew Huberman (Stanford) το ονομάζει "πιο ισχυρό δωρεάν εργαλείο βελτιστοποίησης".',
    whyItMatters: 'Πήγαινε έξω το πρωί χωρίς γυαλιά ηλίου — ακόμα και 5 λεπτά.',
    tldr: 'Πρωινό φως = reset βιολογικού ρολογιού.',
    category: m['circadian'], tags: ['circadian','morning','melatonin','huberman','ήλιος'], mood: ['practical','motivating'],
    source: { type: 'paper', title: 'Light and the circadian clock in mammals', author: 'Russell G. Foster', year: 2020, url: 'https://doi.org/10.1098/rstb.2020.0502', publisher: 'Philosophical Transactions of the Royal Society B' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Ο εγκέφαλός σου δεν μπορεί να κάνει multitasking — είναι νευροεπιστήμη',
    body: 'Ό,τι ονομάζουμε multitasking είναι rapid task-switching. Ο εγκέφαλος αλλάζει γρήγορα μεταξύ εργασιών, αλλά κάθε αλλαγή κοστίζει ~23 λεπτά επιστροφής σε πλήρη εστίαση (Gloria Mark, UCI). Αποτέλεσμα: κάνεις κάθε εργασία χειρότερα.',
    whyItMatters: 'Deep work σε blocks 25-50 λεπτών αποδίδει 4x περισσότερο.',
    tldr: 'Multitasking = μύθος. Κάθε interruption κοστίζει 23 λεπτά.',
    category: m['psychology'], tags: ['focus','multitasking','deep-work','productivity'], mood: ['mind-blowing','practical'],
    source: { type: 'paper', title: 'The Cost of Interrupted Work', author: 'Gloria Mark', year: 2008, url: 'https://dl.acm.org/doi/10.1145/1357054.1357072', publisher: 'University of California, Irvine' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Υπάρχουν 2 τρισεκατομμύρια γαλαξίες στο παρατηρήσιμο σύμπαν',
    body: 'Αστρονόμοι του Πανεπιστημίου Nottingham ανακαθόρισαν τον αριθμό γαλαξιών από 200 δισ. σε 2 τρισεκατομμύρια. Αν μετρούσες έναν ανά δευτερόλεπτο, θα χρειαζόσουν 63.000 χρόνια.',
    whyItMatters: 'Η κλίμακα του σύμπαντος κάνει κάθε πρόβλημα να φαίνεται διαχειρίσιμο.',
    tldr: '2 τρισεκατομμύρια γαλαξίες. Το σύμπαν είναι 10x μεγαλύτερο.',
    category: m['universe'], tags: ['γαλαξίες','σύμπαν','κοσμολογία'], mood: ['mind-blowing','inspiring'],
    source: { type: 'paper', title: 'The Evolution of Galaxy Number Density', author: 'Christopher Conselice', year: 2016, url: 'https://doi.org/10.3847/0004-637X/830/2/83', publisher: 'The Astrophysical Journal' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 30,
  },
  {
    title: 'Η "Μέθοδος 2 Λεπτών" εξαλείφει την αναβλητικότητα',
    body: 'Από το βιβλίο "Getting Things Done": αν μια εργασία παίρνει λιγότερο από 2 λεπτά, κάνε την αμέσως. Εξαλείφει το cognitive overhead — τον ψυχικό φόρτο των μικρών εκκρεμοτήτων που σωρεύονται.',
    whyItMatters: 'Απαντά σε εκείνο το email τώρα. Πιάνει λιγότερο από 2 λεπτά.',
    tldr: '< 2 λεπτά → κάνε το τώρα. Απλός κανόνας, τεράστια διαφορά.',
    category: m['self-improvement'], tags: ['productivity','GTD','habits','procrastination'], mood: ['practical','motivating'],
    source: { type: 'book', title: 'Getting Things Done', author: 'David Allen', year: 2001, publisher: 'Penguin Books' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 35,
  },
  {
    title: 'Το μικρόβιο του εντέρου παράγει 90% της σεροτονίνης',
    body: 'Το "δεύτερο εγκέφαλο" — εντερικό νευρικό σύστημα — περιέχει 500 εκατ. νευρώνες και παράγει 90% της σεροτονίνης. Αυτό εξηγεί γιατί η διατροφή επηρεάζει άμεσα τη διάθεση και το άγχος.',
    whyItMatters: 'Τρεφόμαστε καλά όχι μόνο για το σώμα — αλλά για τον εγκέφαλο.',
    tldr: '90% σεροτονίνης = έντερο. Η διατροφή είναι ψυχική υγεία.',
    category: m['biology'], tags: ['serotonin','gut','microbiome','διατροφή'], mood: ['mind-blowing','practical'],
    source: { type: 'paper', title: 'Gut feelings: the emerging biology of gut-brain communication', author: 'Emeran Mayer', year: 2011, url: 'https://doi.org/10.1038/nrn3071', publisher: 'Nature Reviews Neuroscience' },
    difficulty: 'medium', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: '"Amor Fati" — Αγάπα τη μοίρα σου: η Στωική τέχνη αποδοχής',
    body: 'Marcus Aurelius και Nietzsche συμφωνούν: "Amor Fati" δεν σημαίνει παθητική αποδοχή — σημαίνει ενεργή αγκαλιά κάθε εμπόδιο ως καύσιμο ανάπτυξης. "The obstacle is the way."',
    whyItMatters: 'Η Στωική φιλοσοφία είναι η πιο πρακτική ψυχολογία που υπάρχει.',
    tldr: 'Amor Fati = αγάπα τα εμπόδια. Ψυχοθεραπεία των αρχαίων.',
    category: m['philosophy'], tags: ['stoicism','marcus-aurelius','amor-fati','mindset'], mood: ['inspiring','motivating'],
    source: { type: 'book', title: 'The Obstacle Is the Way', author: 'Ryan Holiday', year: 2014, publisher: 'Portfolio/Penguin' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Κοιμάσαι λιγότερο από 7 ώρες; Ο εγκέφαλός σου "τρώει" εαυτό',
    body: 'Έρευνα του Matthew Walker δείχνει ότι έλλειψη ύπνου ενεργοποιεί αυτοφαγία στον εγκέφαλο — η astrocytic phagocytosis καταστρέφει συναπτικές συνδέσεις. Χρόνια υπο-ύπνωση = +30% κίνδυνος Alzheimer.',
    whyItMatters: 'Ο ύπνος είναι η πιο βασική συντήρηση του εγκεφάλου.',
    tldr: '< 7 ώρες = εγκέφαλος σε αυτοκαταστροφή. Κοιμήσου.',
    category: m['health'], tags: ['sleep','alzheimer','brain','matthew-walker'], mood: ['mind-blowing','practical'],
    source: { type: 'book', title: 'Why We Sleep', author: 'Matthew Walker', year: 2017, publisher: 'Scribner' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 45,
  },
  {
    title: 'Compound Interest: Ο Αϊνστάιν το αποκάλεσε "8η θαύμα του κόσμου"',
    body: '100€/μήνα στα 25, 7% ετήσια = 262.000€ στα 65. Ξεκινώντας στα 35 = 122.000€. Η διαφορά 10 χρόνων = 140.000€ χωρίς extra χρήμα. Το compound effect λειτουργεί εξίσου για χρήμα, γνώση και συνήθειες.',
    whyItMatters: 'Ξεκίνα να επενδύεις τώρα — ακόμα και μικρά ποσά.',
    tldr: 'Compound interest = μαγεία. Ξεκίνα νωρίς, ξεκίνα μικρά.',
    category: m['finance'], tags: ['compound-interest','investing','χρήμα','αποταμίευση'], mood: ['mind-blowing','practical'],
    source: { type: 'book', title: 'The Little Book of Common Sense Investing', author: 'John C. Bogle', year: 2007, publisher: 'Wiley' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
  {
    title: 'Οι χταπόδοι "βλέπουν" χρώματα παρόλο που είναι αχρωματόψοι',
    body: 'Οι χταπόδοι έχουν μόνο ένα τύπο κώνου αλλά αλλάζουν χρώμα με εκπληκτική ακρίβεια. Θεωρία: χρησιμοποιούν chromatic aberration μέσω της παράδοξης κόρης τους — ουσιαστικά "βλέπουν" με εστίαση αντί χρωματικών υποδοχέων.',
    whyItMatters: 'Η εξέλιξη βρίσκει λύσεις που δεν φανταζόμαστε.',
    tldr: 'Χταπόδια = αχρωματόψοι που βλέπουν χρώματα. Ακόμα το ερευνούμε.',
    category: m['wildlife'], tags: ['octopus','χταπόδι','εξέλιξη','camouflage'], mood: ['surprising','mind-blowing'],
    source: { type: 'paper', title: 'Spectral discrimination via chromatic aberration', author: 'Alexander & Christopher Stubbs', year: 2016, url: 'https://doi.org/10.1073/pnas.1524578113', publisher: 'PNAS' },
    difficulty: 'easy', status: 'published', verified: true, readTimeSec: 40,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  await Category.deleteMany({});
  await Card.deleteMany({});
  console.log('🗑️  Cleared existing data');

  const inserted = await Category.insertMany(categories);
  console.log(`✅ ${inserted.length} categories`);

  const catMap = {};
  inserted.forEach((c) => { catMap[c.slug] = c._id; });

  const cards = await Card.insertMany(sampleCards(catMap));
  console.log(`✅ ${cards.length} cards`);
  console.log('\n🚀 Seed complete!');

  await mongoose.disconnect();
}

seed().catch((e) => { console.error('❌', e); process.exit(1); });
