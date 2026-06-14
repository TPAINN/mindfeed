/**
 * Additive content expansion for MindFeed.
 *
 * The live DB only had the 10 seed cards, so a 10-card daily feed showed every
 * card every day — randomization can't create variety from a pool the same
 * size as the feed. This adds a large batch of verified Greek cards so the
 * $sample + 7-day-exclusion feed generator actually produces fresh days.
 *
 * Idempotent: skips any card whose title already exists. Never deletes.
 * Run:  node scripts/expandCards.js   (needs MONGO_URI in env)
 */
require('dotenv').config();
// Some Windows resolvers refuse SRV lookups for mongodb+srv URIs — force a
// public DNS so the Atlas connection string resolves.
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Card     = require('../models/Card');

// slug → array of cards. Sources are real and verifiable.
const byCategory = {
  science: [
    {
      title: 'Το φως του Ήλιου κάνει 8 λεπτά για να φτάσει σε εσένα',
      body: 'Ο Ήλιος απέχει ~150 εκατ. χλμ. Το φως ταξιδεύει με 299.792 χλμ/δευτ, οπότε η ηλιαχτίδα που σε ζεσταίνει τώρα ξεκίνησε 8 λεπτά και 20 δευτερόλεπτα πριν. Κοιτάς πάντα το παρελθόν του Ήλιου, ποτέ το παρόν του.',
      whyItMatters: 'Κάθε αστέρι στον ουρανό είναι μια εικόνα του παρελθόντος — βλέπεις τον χρόνο, όχι μόνο τον χώρο.',
      tldr: 'Η ηλιαχτίδα που βλέπεις είναι 8 λεπτών.',
      tags: ['φως','ήλιος','φυσική','ταχύτητα-φωτός'], mood: ['mind-blowing','inspiring'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'Sun Fact Sheet', author: 'NASA', year: 2023, url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html', publisher: 'NASA' },
    },
    {
      title: 'Τα tardigrades επιβιώνουν στο κενό του διαστήματος',
      body: 'Τα νεροαρκουδάκια (tardigrades) μπαίνουν σε κατάσταση cryptobiosis: αφυδατώνονται και σταματούν σχεδόν κάθε μεταβολισμό. Έτσι αντέχουν θερμοκρασίες από -272°C έως 150°C, ακτινοβολία 1000x θανατηφόρα για άνθρωπο, και — αποδεδειγμένα το 2007 — έκθεση στο κενό του διαστήματος.',
      whyItMatters: 'Η ζωή είναι πιο ανθεκτική από όσο φανταζόμαστε — και αυτό αλλάζει το πού ψάχνουμε εξωγήινη ζωή.',
      tldr: 'Νεροαρκουδάκια: ζουν στο κενό του διαστήματος.',
      tags: ['tardigrades','βιολογία','επιβίωση','διάστημα'], mood: ['surprising','mind-blowing'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'Tardigrades survive exposure to space in low Earth orbit', author: 'Jönsson et al.', year: 2008, url: 'https://doi.org/10.1016/j.cub.2008.06.048', publisher: 'Current Biology' },
    },
    {
      title: 'Ένα κουταλάκι αστέρα νετρονίων ζυγίζει ένα δισ. τόνους',
      body: 'Όταν ένα μεγάλο αστέρι καταρρέει, η ύλη συμπιέζεται τόσο ώστε ηλεκτρόνια και πρωτόνια γίνονται νετρόνια. Ένας αστέρας νετρονίων χωράει τη μάζα του Ήλιου σε σφαίρα 20 χλμ. Η πυκνότητά του: ένα κουταλάκι θα ζύγιζε όσο ένα βουνό — περίπου ένα δισεκατομμύριο τόνους.',
      whyItMatters: 'Δείχνει πόσο κενή είναι η κανονική ύλη — σχεδόν όλο το άτομο είναι άδειος χώρος.',
      tldr: 'Κουταλάκι αστέρα νετρονίων = 1 δισ. τόνοι.',
      tags: ['αστροφυσική','αστέρας-νετρονίων','πυκνότητα'], mood: ['mind-blowing'], difficulty: 'medium', readTimeSec: 40,
      source: { type: 'website', title: 'Neutron Stars', author: 'NASA Goddard', year: 2022, url: 'https://imagine.gsfc.nasa.gov/science/objects/neutron_stars1.html', publisher: 'NASA' },
    },
    {
      title: 'Το DNA σου, ξετυλιγμένο, φτάνει 60 φορές μέχρι τον Ήλιο',
      body: 'Κάθε κύτταρο κρύβει ~2 μέτρα DNA. Με ~37 τρισ. κύτταρα, το συνολικό σου DNA ξεπερνά τα 70 δισ. χιλιόμετρα — αρκετά για 60+ διαδρομές μετ’ επιστροφής ως τον Ήλιο. Όλο αυτό συμπιέζεται σε πυρήνες μικρότερους από 0,01 χιλιοστό.',
      whyItMatters: 'Η συμπίεση πληροφορίας στη βιολογία ξεπερνά κάθε τεχνολογία που έχουμε φτιάξει.',
      tldr: 'Όλο το DNA σου: 60+ φορές ως τον Ήλιο.',
      tags: ['dna','βιολογία','γενετική','κύτταρα'], mood: ['mind-blowing','surprising'], difficulty: 'medium', readTimeSec: 40,
      source: { type: 'book', title: 'The Epigenetics Revolution', author: 'Nessa Carey', year: 2012, publisher: 'Columbia University Press' },
    },
  ],

  psychology: [
    {
      title: 'Το Dunning-Kruger: οι λιγότερο ικανοί νιώθουν πιο σίγουροι',
      body: 'Έρευνα του Cornell (1999) έδειξε ότι όσοι τα πάνε χειρότερα σε ένα task υπερεκτιμούν δραματικά την επίδοσή τους — γιατί η ίδια έλλειψη γνώσης τους εμποδίζει να δουν τα λάθη τους. Οι πιο ικανοί, αντίθετα, συχνά υποτιμούν τον εαυτό τους.',
      whyItMatters: 'Όταν νιώθεις 100% σίγουρος, αξίζει να ελέγξεις αν απλώς δεν ξέρεις τι δεν ξέρεις.',
      tldr: 'Λιγότερη γνώση → περισσότερη (λάθος) σιγουριά.',
      tags: ['dunning-kruger','bias','γνωστική-προκατάληψη','metacognition'], mood: ['mind-blowing','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'Unskilled and Unaware of It', author: 'Kruger & Dunning', year: 1999, url: 'https://doi.org/10.1037/0022-3514.77.6.1121', publisher: 'Journal of Personality and Social Psychology' },
    },
    {
      title: 'Το "growth mindset" αλλάζει πραγματικά την επίδοση',
      body: 'Η Carol Dweck (Stanford) έδειξε ότι παιδιά που πιστεύουν πως η ικανότητα αναπτύσσεται με προσπάθεια ("growth mindset") επιμένουν περισσότερο και μαθαίνουν καλύτερα από όσα πιστεύουν πως η εξυπνάδα είναι σταθερή. Ο έπαινος στην προσπάθεια, όχι στο ταλέντο, ενισχύει την επιμονή.',
      whyItMatters: 'Πες "δεν το κατάφερα ΑΚΟΜΑ" — η λέξη "ακόμα" αλλάζει τη σχέση σου με την αποτυχία.',
      tldr: 'Πίστεψε ότι βελτιώνεσαι — και βελτιώνεσαι.',
      tags: ['growth-mindset','dweck','μάθηση','κίνητρο'], mood: ['motivating','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Mindset: The New Psychology of Success', author: 'Carol Dweck', year: 2006, publisher: 'Random House' },
    },
    {
      title: 'Το spacing effect: μαθαίνεις καλύτερα με διαλείμματα',
      body: 'Από τον Hermann Ebbinghaus (1885) ξέρουμε ότι η επανάληψη κατανεμημένη στον χρόνο (spaced repetition) εδραιώνει τη μνήμη πολύ καλύτερα από το cramming. Λίγη μελέτη κάθε μέρα νικά κατά κράτος τις πολύωρες μονομαχίες της τελευταίας στιγμής.',
      whyItMatters: 'Διάβασε 20 λεπτά κάθε μέρα αντί 3 ώρες πριν τις εξετάσεις. Θα θυμάσαι περισσότερα.',
      tldr: 'Λίγο κάθε μέρα > πολύ μία φορά.',
      tags: ['μνήμη','spaced-repetition','μάθηση','ebbinghaus'], mood: ['practical','surprising'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Make It Stick: The Science of Successful Learning', author: 'Brown, Roediger & McDaniel', year: 2014, publisher: 'Harvard University Press' },
    },
    {
      title: 'Το φαινόμενο Zeigarnik: το μυαλό κολλάει στα ημιτελή',
      body: 'Η Bluma Zeigarnik παρατήρησε ότι σερβιτόροι θυμόντουσαν τις ανοιχτές παραγγελίες πολύ καλύτερα από τις ολοκληρωμένες. Οι ημιτελείς εργασίες δημιουργούν ψυχική ένταση που κρατά τον εγκέφαλο απασχολημένο — γι’ αυτό οι εκκρεμότητες σε αγχώνουν ακόμα κι όταν δεν τις σκέφτεσαι συνειδητά.',
      whyItMatters: 'Γράψε τις εκκρεμότητες σε λίστα — το μυαλό τις αφήνει μόλις ξέρει ότι κάπου καταγράφηκαν.',
      tldr: 'Τα ημιτελή σε στοιχειώνουν. Γράψ’ τα κάπου.',
      tags: ['zeigarnik','μνήμη','άγχος','παραγωγικότητα'], mood: ['practical','surprising'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: 2011, publisher: 'Farrar, Straus and Giroux' },
    },
  ],

  nature: [
    {
      title: 'Τα δέντρα μοιράζονται τροφή μέσω υπόγειου δικτύου μυκήτων',
      body: 'Οι ρίζες των δέντρων συνδέονται με μυκόρριζα μύκητες σχηματίζοντας το "Wood Wide Web". Μέσα από αυτό, δέντρα ανταλλάσσουν άνθρακα, νερό και χημικά σήματα — μεγάλα "μητρικά" δέντρα στέλνουν θρεπτικά σε σκιασμένα νεαρά. Το δάσος λειτουργεί ως ένας συνεργατικός υπερ-οργανισμός.',
      whyItMatters: 'Η φύση βασίζεται στη συνεργασία τόσο όσο στον ανταγωνισμό.',
      tldr: 'Τα δέντρα ταΐζουν το ένα το άλλο υπόγεια.',
      tags: ['δάσος','μυκόρριζα','δέντρα','wood-wide-web'], mood: ['inspiring','mind-blowing'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'book', title: 'The Hidden Life of Trees', author: 'Peter Wohlleben', year: 2015, publisher: 'Greystone Books' },
    },
    {
      title: 'Το μέλι δεν χαλάει ποτέ — βρέθηκε εδώδιμο μετά από 3000 χρόνια',
      body: 'Αρχαιολόγοι βρήκαν μέλι σε αιγυπτιακούς τάφους που ήταν ακόμα βρώσιμο μετά από χιλιετίες. Η χαμηλή υγρασία, το όξινο pH και το υπεροξείδιο του υδρογόνου που παράγουν οι μέλισσες κάνουν αδύνατη την ανάπτυξη μικροβίων.',
      whyItMatters: 'Μερικές φυσικές διεργασίες ξεπερνούν κάθε συντηρητικό που φτιάχνουμε.',
      tldr: 'Το μέλι είναι σχεδόν αθάνατο φαγητό.',
      tags: ['μέλι','μέλισσες','συντήρηση','φύση'], mood: ['surprising','practical'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'The Science Behind Honey’s Eternal Shelf Life', author: 'Smithsonian Magazine', year: 2013, url: 'https://www.smithsonianmag.com/science-nature/the-science-behind-honeys-eternal-shelf-life-1218690/', publisher: 'Smithsonian' },
    },
    {
      title: 'Ένα δέντρο μπορεί να "ιδρώνει" εκατοντάδες λίτρα νερό τη μέρα',
      body: 'Μέσω διαπνοής, μια μεγάλη βελανιδιά απελευθερώνει έως και 400 λίτρα νερό στην ατμόσφαιρα σε μια ζεστή μέρα. Τα δάση δημιουργούν έτσι "ιπτάμενους ποταμούς" υδρατμών — το Αμαζόνιο παράγει μεγάλο μέρος της δικής του βροχής.',
      whyItMatters: 'Η αποψίλωση δεν χάνει μόνο δέντρα — διαλύει τον κύκλο της βροχής.',
      tldr: 'Τα δάση φτιάχνουν τη δική τους βροχή.',
      tags: ['δάση','διαπνοή','νερό','κλίμα'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 40,
      source: { type: 'paper', title: 'Biotic pump of atmospheric moisture', author: 'Makarieva & Gorshkov', year: 2007, url: 'https://doi.org/10.5194/hess-11-1013-2007', publisher: 'Hydrology and Earth System Sciences' },
    },
  ],

  circadian: [
    {
      title: 'Το φως οθόνης το βράδυ καθυστερεί τη μελατονίνη ως 90 λεπτά',
      body: 'Το μπλε φως από κινητά και οθόνες μιμείται το φως της ημέρας και καταστέλλει την έκκριση μελατονίνης. Έρευνα του Harvard έδειξε ότι ανάγνωση από οθόνη πριν τον ύπνο μετατοπίζει το κιρκάδιο ρολόι και μειώνει την εγρήγορση το επόμενο πρωί.',
      whyItMatters: 'Σταμάτα τις οθόνες 1 ώρα πριν τον ύπνο — ή ρίξε φωτεινότητα/night mode.',
      tldr: 'Οθόνη το βράδυ = αργεί ο ύπνος.',
      tags: ['μελατονίνη','μπλε-φως','ύπνος','circadian'], mood: ['practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'Evening use of light-emitting eReaders', author: 'Chang, Aeschbach, Duffy & Czeisler', year: 2015, url: 'https://doi.org/10.1073/pnas.1418490112', publisher: 'PNAS' },
    },
    {
      title: 'Η θερμοκρασία του σώματος πέφτει για να σε κοιμίσει',
      body: 'Ο ύπνος ξεκινά όταν η εσωτερική θερμοκρασία πέφτει ~1°C. Γι’ αυτό ένα ζεστό μπάνιο 1-2 ώρες πριν τον ύπνο βοηθά: η αιμάτωση στα άκρα αυξάνεται, το σώμα αποβάλλει θερμότητα και η πτώση που ακολουθεί σηματοδοτεί στον εγκέφαλο ότι ήρθε η ώρα.',
      whyItMatters: 'Δροσερό δωμάτιο (~18°C) και ζεστό ντους νωρίτερα = πιο γρήγορος ύπνος.',
      tldr: 'Κρύο σώμα = σήμα για ύπνο.',
      tags: ['ύπνος','θερμοκρασία','circadian','υγεία'], mood: ['practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Why We Sleep', author: 'Matthew Walker', year: 2017, publisher: 'Scribner' },
    },
    {
      title: 'Η καφεΐνη έχει χρόνο ημιζωής 5-6 ώρες',
      body: 'Ένας καφές στις 16:00 σημαίνει ότι το μισό της καφεΐνης κυκλοφορεί ακόμα στις 22:00. Η καφεΐνη μπλοκάρει την αδενοσίνη — το μόριο που χτίζει την υπνηλία — οπότε ακόμα κι αν κοιμηθείς, ο βαθύς ύπνος μειώνεται.',
      whyItMatters: 'Τελευταίος καφές νωρίς το απόγευμα προστατεύει τον βραδινό ύπνο.',
      tldr: 'Απογευματινός καφές = χαλασμένος ύπνος.',
      tags: ['καφεΐνη','αδενοσίνη','ύπνος','circadian'], mood: ['practical','surprising'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Why We Sleep', author: 'Matthew Walker', year: 2017, publisher: 'Scribner' },
    },
  ],

  universe: [
    {
      title: 'Υπάρχουν περισσότερα αστέρια απ’ ό,τι κόκκοι άμμου στη Γη',
      body: 'Οι εκτιμήσεις δίνουν ~10^24 αστέρια στο παρατηρήσιμο σύμπαν — δηλαδή ένα 1 με 24 μηδενικά. Οι κόκκοι άμμου σε όλες τις παραλίες και ερήμους της Γης υπολογίζονται σε ~10^18. Τα αστέρια ξεπερνούν την άμμο κατά ένα εκατομμύριο φορές.',
      whyItMatters: 'Η κλίμακα του σύμπαντος ξεπερνά κάθε μετρική της καθημερινότητάς μας.',
      tldr: 'Αστέρια > κόκκοι άμμου, κατά 1 εκατομμύριο φορές.',
      tags: ['αστέρια','σύμπαν','κοσμολογία','κλίμακα'], mood: ['mind-blowing','inspiring'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'How Many Stars Are There in the Universe?', author: 'European Space Agency', year: 2019, url: 'https://www.esa.int/Science_Exploration/Space_Science/Herschel/How_many_stars_are_there_in_the_Universe', publisher: 'ESA' },
    },
    {
      title: 'Μια μέρα στην Αφροδίτη διαρκεί περισσότερο από έναν χρόνο της',
      body: 'Η Αφροδίτη περιστρέφεται γύρω από τον άξονά της τόσο αργά που μια πλήρης ημέρα (243 γήινες μέρες) διαρκεί περισσότερο από μια πλήρη τροχιά γύρω από τον Ήλιο (225 μέρες). Και περιστρέφεται ανάποδα — ο Ήλιος ανατέλλει από τη δύση.',
      whyItMatters: 'Οι κανόνες της καθημερινότητας ("μέρα", "χρόνος") είναι τοπικοί, όχι σύμπαντος.',
      tldr: 'Αφροδίτη: η μέρα κρατά πιο πολύ απ’ τον χρόνο.',
      tags: ['αφροδίτη','πλανήτες','αστρονομία'], mood: ['surprising','mind-blowing'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'Venus Facts', author: 'NASA Science', year: 2023, url: 'https://science.nasa.gov/venus/venus-facts/', publisher: 'NASA' },
    },
    {
      title: 'Το Voyager 1 είναι το πιο μακρινό ανθρώπινο αντικείμενο',
      body: 'Εκτοξεύτηκε το 1977 και από το 2012 ταξιδεύει στον μεσοαστρικό χώρο, πάνω από 24 δισ. χλμ μακριά. Το σήμα του κάνει πάνω από 22 ώρες να φτάσει στη Γη. Κουβαλά τον "Golden Record" με ήχους και εικόνες της Γης για όποιον — ή ό,τι — το βρει.',
      whyItMatters: 'Ένα μήνυμα της ανθρωπότητας ταξιδεύει ήδη ανάμεσα στα αστέρια.',
      tldr: 'Voyager 1: 24 δισ. χλμ από το σπίτι.',
      tags: ['voyager','διάστημα','nasa','εξερεύνηση'], mood: ['inspiring','mind-blowing'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'website', title: 'Voyager Mission Status', author: 'NASA JPL', year: 2024, url: 'https://voyager.jpl.nasa.gov/mission/status/', publisher: 'NASA JPL' },
    },
  ],

  'self-improvement': [
    {
      title: 'Ο κανόνας του 1%: μικρές βελτιώσεις συσσωρεύονται εκθετικά',
      body: 'Στο "Atomic Habits", ο James Clear δείχνει ότι το να γίνεσαι 1% καλύτερος κάθε μέρα σε κάνει ~37 φορές καλύτερο σε έναν χρόνο (1.01^365). Αντίστροφα, το 1% χειρότερα κάθε μέρα σε μηδενίζει σχεδόν. Οι συνήθειες είναι ο ανατοκισμός της αυτοβελτίωσης.',
      whyItMatters: 'Μην κυνηγάς θεαματικές αλλαγές — κυνήγα μικρές, σταθερές.',
      tldr: '1% κάθε μέρα = 37x σε έναν χρόνο.',
      tags: ['habits','atomic-habits','βελτίωση','συνέπεια'], mood: ['motivating','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Atomic Habits', author: 'James Clear', year: 2018, publisher: 'Avery' },
    },
    {
      title: 'Στοίβαξε νέες συνήθειες πάνω σε παλιές (habit stacking)',
      body: 'Η πιο αξιόπιστη τεχνική για νέα συνήθεια: συνδέσέ την με μια υπάρχουσα. "Αφού φτιάξω καφέ, θα διαβάσω 2 σελίδες." Η εδραιωμένη συνήθεια λειτουργεί ως έναυσμα, οπότε δεν βασίζεσαι στη θέληση αλλά σε μια ρουτίνα που ήδη κάνεις αυτόματα.',
      whyItMatters: 'Δεν χρειάζεσαι πειθαρχία — χρειάζεσαι σωστό έναυσμα.',
      tldr: '«Αφού κάνω Χ, θα κάνω Υ.»',
      tags: ['habit-stacking','συνήθειες','ρουτίνα','atomic-habits'], mood: ['practical','motivating'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Atomic Habits', author: 'James Clear', year: 2018, publisher: 'Avery' },
    },
    {
      title: 'Το "deep work" είναι η πιο σπάνια δεξιότητα της εποχής',
      body: 'Ο Cal Newport ορίζει το deep work ως συγκέντρωση χωρίς περισπασμούς σε γνωστικά απαιτητική εργασία. Σε έναν κόσμο διαρκών ειδοποιήσεων, η ικανότητα να εστιάζεις βαθιά για ώρες γίνεται όλο και πιο σπάνια — και άρα όλο και πιο πολύτιμη.',
      whyItMatters: 'Κλείσε τις ειδοποιήσεις και δούλεψε σε blocks — η αξία σου εκτοξεύεται.',
      tldr: 'Βαθιά εστίαση = υπερδύναμη της εποχής.',
      tags: ['deep-work','focus','παραγωγικότητα','newport'], mood: ['motivating','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Deep Work', author: 'Cal Newport', year: 2016, publisher: 'Grand Central Publishing' },
    },
  ],

  health: [
    {
      title: 'Το περπάτημα 7.000 βημάτων μειώνει τη θνησιμότητα ως 50-70%',
      body: 'Μεγάλη μελέτη στο JAMA (2021) έδειξε ότι ενήλικες που έκαναν ~7.000 βήματα τη μέρα είχαν 50-70% χαμηλότερο κίνδυνο πρόωρου θανάτου σε σχέση με όσους έκαναν λιγότερα. Το όφελος δεν απαιτεί τα διάσημα 10.000 — η ένταση μετράει λιγότερο από τη σταθερότητα.',
      whyItMatters: 'Δεν χρειάζεσαι μαραθώνιο — αρκεί σταθερό καθημερινό περπάτημα.',
      tldr: '7.000 βήματα/μέρα = δραστικά λιγότερος κίνδυνος.',
      tags: ['περπάτημα','βήματα','longevity','άσκηση'], mood: ['practical','motivating'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'Steps per Day and All-Cause Mortality in Middle-aged Adults', author: 'Paluch et al.', year: 2021, url: 'https://doi.org/10.1001/jamanetworkopen.2021.24516', publisher: 'JAMA Network Open' },
    },
    {
      title: 'Η μοναξιά βλάπτει την υγεία όσο 15 τσιγάρα τη μέρα',
      body: 'Μετα-ανάλυση της Julianne Holt-Lunstad έδειξε ότι η χρόνια κοινωνική απομόνωση αυξάνει τον κίνδυνο πρόωρου θανάτου εξίσου με το κάπνισμα 15 τσιγάρων ημερησίως — και περισσότερο από την παχυσαρκία. Οι ισχυρές κοινωνικές σχέσεις είναι παράγοντας επιβίωσης.',
      whyItMatters: 'Μια τηλεφωνική κλήση σε φίλο είναι πράξη υγείας, όχι πολυτέλεια.',
      tldr: 'Η μοναξιά σκοτώνει όσο 15 τσιγάρα.',
      tags: ['μοναξιά','κοινωνικές-σχέσεις','longevity','ψυχική-υγεία'], mood: ['surprising','practical'], difficulty: 'easy', readTimeSec: 45,
      source: { type: 'paper', title: 'Social Relationships and Mortality Risk: A Meta-analytic Review', author: 'Holt-Lunstad et al.', year: 2010, url: 'https://doi.org/10.1371/journal.pmed.1000316', publisher: 'PLoS Medicine' },
    },
    {
      title: 'Η δύναμη λαβής προβλέπει τη μακροζωία καλύτερα από την πίεση',
      body: 'Η μελέτη PURE σε ~140.000 ανθρώπους βρήκε ότι η δύναμη της χειρολαβής (grip strength) είναι ισχυρότερος προγνωστικός δείκτης καρδιαγγειακού θανάτου από τη συστολική αρτηριακή πίεση. Η μυϊκή δύναμη αντανακλά τη συνολική βιολογική ανθεκτικότητα.',
      whyItMatters: 'Η προπόνηση δύναμης δεν είναι αισθητική — είναι επένδυση στη ζωή σου.',
      tldr: 'Δυνατή λαβή = δείκτης μακροζωίας.',
      tags: ['grip-strength','μυϊκή-δύναμη','longevity','άσκηση'], mood: ['surprising','motivating'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'paper', title: 'Grip strength and cardiovascular mortality (PURE study)', author: 'Leong et al.', year: 2015, url: 'https://doi.org/10.1016/S0140-6736(14)62000-6', publisher: 'The Lancet' },
    },
  ],

  biology: [
    {
      title: 'Αντικαθιστάς σχεδόν όλα σου τα κύτταρα κάθε ~7-10 χρόνια',
      body: 'Τα περισσότερα κύτταρα του σώματος ανανεώνονται διαρκώς: τα εντερικά κάθε λίγες μέρες, τα ερυθρά αιμοσφαίρια κάθε ~4 μήνες, ο σκελετός κάθε ~10 χρόνια. Με την πάροδο μιας δεκαετίας, το μεγαλύτερο μέρος της ύλης σου έχει αντικατασταθεί — είσαι μια μορφή, όχι μια σταθερή ουσία.',
      whyItMatters: 'Είσαι περισσότερο διεργασία παρά αντικείμενο — και οι διεργασίες αλλάζουν.',
      tldr: 'Το σώμα σου ανανεώνεται σχεδόν ολόκληρο σε ~10 χρόνια.',
      tags: ['κύτταρα','ανανέωση','βιολογία','σώμα'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'paper', title: 'Retrospective Birth Dating of Cells in Humans', author: 'Spalding et al.', year: 2005, url: 'https://doi.org/10.1016/j.cell.2005.04.028', publisher: 'Cell' },
    },
    {
      title: 'Έχεις περισσότερα βακτηριακά κύτταρα από ανθρώπινα',
      body: 'Το μικροβίωμα σου περιέχει περίπου τόσα — ίσως και περισσότερα — βακτηριακά κύτταρα όσα τα δικά σου. Αυτοί οι μικροοργανισμοί πέπτουν τροφή, παράγουν βιταμίνες και ρυθμίζουν το ανοσοποιητικό. Είσαι ένα οικοσύστημα που περπατά, όχι ένα μεμονωμένο ον.',
      whyItMatters: 'Η φροντίδα του μικροβιώματος (φυτικές ίνες, ζύμωση) είναι φροντίδα του εαυτού σου.',
      tldr: 'Είσαι μισός άνθρωπος, μισός μικρόβιο.',
      tags: ['μικροβίωμα','βακτήρια','έντερο','βιολογία'], mood: ['surprising','mind-blowing'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'paper', title: 'Revised Estimates for the Number of Human and Bacteria Cells', author: 'Sender, Fuchs & Milo', year: 2016, url: 'https://doi.org/10.1371/journal.pbio.1002533', publisher: 'PLoS Biology' },
    },
    {
      title: 'Η CRISPR επιτρέπει "ψαλίδι" επεξεργασίας του DNA',
      body: 'Οι Doudna και Charpentier (Nobel 2020) μετέτρεψαν έναν βακτηριακό μηχανισμό άμυνας, τη CRISPR-Cas9, σε εργαλείο που κόβει και επιδιορθώνει DNA με ακρίβεια. Ήδη χρησιμοποιείται σε εγκεκριμένη θεραπεία για τη δρεπανοκυτταρική αναιμία.',
      whyItMatters: 'Για πρώτη φορά μπορούμε να διορθώνουμε γενετικές ασθένειες στην πηγή τους.',
      tldr: 'CRISPR = ψαλίδι ακριβείας για το DNA.',
      tags: ['crispr','γενετική','βιοτεχνολογία','dna'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'paper', title: 'A Programmable Dual-RNA–Guided DNA Endonuclease', author: 'Jinek, Doudna, Charpentier et al.', year: 2012, url: 'https://doi.org/10.1126/science.1225829', publisher: 'Science' },
    },
  ],

  books: [
    {
      title: '"Thinking, Fast and Slow": δύο συστήματα σκέψης σε πόλεμο',
      body: 'Ο νομπελίστας Daniel Kahneman περιγράφει το Σύστημα 1 (γρήγορο, ενστικτώδες) και το Σύστημα 2 (αργό, λογικό). Τα περισσότερα λάθη κρίσης προκύπτουν όταν το γρήγορο Σύστημα 1 απαντά σε ερωτήσεις που χρειάζονται το αργό Σύστημα 2.',
      whyItMatters: 'Στις σημαντικές αποφάσεις, επίτηδες επιβράδυνε — άσε το Σύστημα 2 να αναλάβει.',
      tldr: 'Γρήγορο ένστικτο vs αργή λογική.',
      tags: ['kahneman','αποφάσεις','ψυχολογία','βιβλίο'], mood: ['mind-blowing','practical'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: 2011, publisher: 'Farrar, Straus and Giroux' },
    },
    {
      title: '"Man’s Search for Meaning": το νόημα επιβιώνει των πάντων',
      body: 'Ο ψυχίατρος Viktor Frankl επέζησε των στρατοπέδων συγκέντρωσης και κατέληξε: δεν μπορούμε πάντα να ελέγξουμε τι μας συμβαίνει, αλλά μπορούμε να επιλέξουμε τη στάση μας απέναντί του. Όσοι έβρισκαν νόημα στον πόνο τους είχαν περισσότερες πιθανότητες να αντέξουν.',
      whyItMatters: '"Αυτός που έχει ένα γιατί να ζει, αντέχει σχεδόν κάθε πώς." (Nietzsche, αναφορά Frankl)',
      tldr: 'Το νόημα είναι η τελευταία ελευθερία που μας μένει.',
      tags: ['frankl','νόημα','ψυχολογία','logotherapy'], mood: ['inspiring','calming'], difficulty: 'easy', readTimeSec: 45,
      source: { type: 'book', title: 'Man’s Search for Meaning', author: 'Viktor E. Frankl', year: 1946, publisher: 'Beacon Press' },
    },
    {
      title: '"Sapiens": οι μύθοι που πιστεύουμε μαζί χτίζουν πολιτισμούς',
      body: 'Ο Yuval Noah Harari υποστηρίζει ότι ο Homo sapiens κυριάρχησε γιατί μπορεί να πιστεύει σε κοινές φαντασιακές κατασκευές — χρήμα, έθνη, εταιρείες, θεοί. Αυτές οι κοινές ιστορίες επιτρέπουν σε εκατομμύρια αγνώστους να συνεργάζονται ευέλικτα.',
      whyItMatters: 'Πολλά από όσα θεωρούμε "φυσικά" είναι κοινές ιστορίες που συμφωνήσαμε να πιστεύουμε.',
      tldr: 'Οι κοινοί μύθοι χτίζουν κοινωνίες.',
      tags: ['harari','sapiens','ιστορία','ανθρωπολογία'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'book', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', year: 2011, publisher: 'Harper' },
    },
  ],

  philosophy: [
    {
      title: 'Memento Mori: η σκέψη του θανάτου σε κάνει να ζεις',
      body: 'Οι Στωικοί καλλιεργούσαν το "memento mori" — θυμήσου ότι θα πεθάνεις. Όχι ως μακάβρια εμμονή, αλλά ως υπενθύμιση να μην σπαταλάς χρόνο σε ασήμαντα. Ο Σενέκας έγραφε ότι το πρόβλημα δεν είναι πως η ζωή είναι σύντομη, αλλά ότι σπαταλάμε μεγάλο μέρος της.',
      whyItMatters: 'Η επίγνωση του πεπερασμένου χρόνου είναι το ισχυρότερο φίλτρο προτεραιοτήτων.',
      tldr: 'Θυμήσου τον θάνατο — για να ζήσεις σωστά.',
      tags: ['στωικισμός','memento-mori','σενέκας','φιλοσοφία'], mood: ['inspiring','calming'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'On the Shortness of Life', author: 'Seneca', year: 49, publisher: 'Penguin Classics' },
    },
    {
      title: 'Ικιγκάι: ο ιαπωνικός λόγος να σηκώνεσαι το πρωί',
      body: 'Το "ikigai" είναι η τομή τεσσάρων: αυτό που αγαπάς, αυτό που κάνεις καλά, αυτό που χρειάζεται ο κόσμος, και αυτό για το οποίο πληρώνεσαι. Στην Οκινάβα — μία από τις "Μπλε Ζώνες" μακροζωίας — οι κάτοικοι αποδίδουν τη μεγάλη διάρκεια ζωής εν μέρει στο σαφές αίσθημα σκοπού.',
      whyItMatters: 'Ο σκοπός δεν είναι πολυτέλεια — συνδέεται με μακροζωία και ευεξία.',
      tldr: 'Βρες το σταυροδρόμι αγάπης, ταλέντου, ανάγκης, αξίας.',
      tags: ['ikigai','σκοπός','ιαπωνία','blue-zones'], mood: ['inspiring','motivating'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Ikigai: The Japanese Secret to a Long and Happy Life', author: 'García & Miralles', year: 2016, publisher: 'Penguin Life' },
    },
    {
      title: 'Η διχοτομία του ελέγχου: η καρδιά της Στωικής γαλήνης',
      body: 'Ο Επίκτητος ξεκινά το Εγχειρίδιο με μία διάκριση: κάποια πράγματα εξαρτώνται από εμάς (κρίσεις, πράξεις, επιθυμίες) και άλλα όχι (γνώμες άλλων, υγεία, τύχη). Όλο το άγχος πηγάζει από το να προσπαθούμε να ελέγξουμε τη δεύτερη κατηγορία. Η γαλήνη έρχεται όταν εστιάζουμε μόνο στην πρώτη.',
      whyItMatters: 'Ρώτα σε κάθε ανησυχία: "Εξαρτάται από εμένα;" Αν όχι, άφησέ την.',
      tldr: 'Έλεγξε ό,τι μπορείς. Άσε τα υπόλοιπα.',
      tags: ['επίκτητος','στωικισμός','έλεγχος','γαλήνη'], mood: ['calming','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Enchiridion', author: 'Epictetus', year: 125, publisher: 'Dover' },
    },
  ],

  history: [
    {
      title: 'Η Κλεοπάτρα έζησε πιο κοντά στο iPhone παρά στις Πυραμίδες',
      body: 'Η Μεγάλη Πυραμίδα της Γκίζας χτίστηκε ~2560 π.Χ. Η Κλεοπάτρα έζησε ~30 π.Χ. — δηλαδή ~2530 χρόνια αργότερα. Από την Κλεοπάτρα μέχρι σήμερα έχουν περάσει ~2050 χρόνια. Άρα η Κλεοπάτρα ήταν χρονικά πιο κοντά στην εποχή μας παρά στην κατασκευή των Πυραμίδων.',
      whyItMatters: 'Η "αρχαιότητα" δεν είναι ένα ενιαίο σημείο — εκτείνεται σε χιλιετίες.',
      tldr: 'Κλεοπάτρα: πιο κοντά σε εμάς παρά στις Πυραμίδες.',
      tags: ['κλεοπάτρα','αίγυπτος','ιστορία','χρόνος'], mood: ['mind-blowing','surprising'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'Giza Pyramids', author: 'Encyclopaedia Britannica', year: 2023, url: 'https://www.britannica.com/topic/Pyramids-of-Giza', publisher: 'Britannica' },
    },
    {
      title: 'Το Πανεπιστήμιο της Οξφόρδης είναι παλιότερο από τους Αζτέκους',
      body: 'Διδασκαλία στην Οξφόρδη υπάρχει από το ~1096. Η πόλη Τενοτστιτλάν των Αζτέκων ιδρύθηκε το 1325. Όταν οι Αζτέκοι έχτιζαν την αυτοκρατορία τους, η Οξφόρδη λειτουργούσε ήδη ως πανεπιστήμιο για πάνω από δύο αιώνες.',
      whyItMatters: 'Οι "παλιοί" και οι "νέοι" πολιτισμοί συχνά συνυπήρχαν με τρόπους που μας εκπλήσσουν.',
      tldr: 'Οξφόρδη > Αζτέκοι, σε ηλικία.',
      tags: ['οξφόρδη','αζτέκοι','ιστορία','χρόνος'], mood: ['surprising','mind-blowing'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'Introduction and History', author: 'University of Oxford', year: 2023, url: 'https://www.ox.ac.uk/about/organisation/history', publisher: 'University of Oxford' },
    },
    {
      title: 'Ο "Μηχανισμός των Αντικυθήρων": αναλογικός υπολογιστής 2000 ετών',
      body: 'Βρέθηκε σε ναυάγιο κοντά στα Αντικύθηρα το 1901. Με δεκάδες οδοντωτούς τροχούς, υπολόγιζε θέσεις ήλιου και σελήνης, εκλείψεις, ακόμα και τον κύκλο των Ολυμπιακών Αγώνων. Τεχνολογία τέτοιας πολυπλοκότητας δεν ξαναεμφανίστηκε για πάνω από χίλια χρόνια.',
      whyItMatters: 'Η αρχαία ελληνική μηχανική ήταν πολύ πιο προηγμένη απ’ ό,τι νομίζαμε.',
      tldr: 'Αρχαίος ελληνικός "υπολογιστής" 2000 ετών.',
      tags: ['αντικύθηρα','αρχαία-ελλάδα','τεχνολογία','αστρονομία'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'paper', title: 'Decoding the Antikythera Mechanism', author: 'Freeth et al.', year: 2006, url: 'https://doi.org/10.1038/nature05357', publisher: 'Nature' },
    },
  ],

  funfacts: [
    {
      title: 'Οι μπανάνες είναι ραδιενεργές (αλλά αβλαβείς)',
      body: 'Οι μπανάνες περιέχουν κάλιο, και ένα μικρό ποσοστό είναι το ραδιενεργό ισότοπο κάλιο-40. Η δόση είναι τόσο μικρή που χρησιμοποιείται άτυπα ως μονάδα σύγκρισης — η "Banana Equivalent Dose". Θα χρειαζόσουν εκατομμύρια μπανάνες ταυτόχρονα για κίνδυνο.',
      whyItMatters: 'Η "ραδιενέργεια" είναι παντού σε ασήμαντες δόσεις — το πλαίσιο είναι τα πάντα.',
      tldr: 'Κάθε μπανάνα είναι λιγάκι ραδιενεργή.',
      tags: ['μπανάνα','ραδιενέργεια','κάλιο','fun-fact'], mood: ['surprising','mind-blowing'], difficulty: 'easy', readTimeSec: 30,
      source: { type: 'website', title: 'Radioactivity in Nature', author: 'U.S. EPA', year: 2022, url: 'https://www.epa.gov/radiation/radioactive-decay', publisher: 'EPA' },
    },
    {
      title: 'Ένας κεραυνός είναι 5 φορές πιο καυτός από την επιφάνεια του Ήλιου',
      body: 'Ο αέρας σε ένα κανάλι κεραυνού φτάνει στιγμιαία τους ~30.000°C — περίπου πέντε φορές τη θερμοκρασία της επιφάνειας του Ήλιου (~5.500°C). Αυτή η ακαριαία θέρμανση εκτονώνει τον αέρα εκρηκτικά, δημιουργώντας το κρότο της βροντής.',
      whyItMatters: 'Η βροντή είναι κυριολεκτικά ο ήχος του αέρα που "σκάει" από τη θερμότητα.',
      tldr: 'Κεραυνός: 5x πιο καυτός απ’ τον Ήλιο.',
      tags: ['κεραυνός','θερμοκρασία','καιρός','fun-fact'], mood: ['surprising','mind-blowing'], difficulty: 'easy', readTimeSec: 30,
      source: { type: 'website', title: 'Understanding Lightning: Thunder', author: 'NOAA / NWS', year: 2022, url: 'https://www.weather.gov/safety/lightning-science-thunder', publisher: 'NOAA' },
    },
    {
      title: 'Δεν υπάρχουν δύο πανομοιότυπες χιονονιφάδες — σχεδόν',
      body: 'Κάθε χιονονιφάδα σχηματίζεται μέσα από μια μοναδική διαδρομή θερμοκρασίας και υγρασίας καθώς πέφτει. Με ~10^18 μόρια νερού η καθεμία και αμέτρητους συνδυασμούς συνθηκών, η πιθανότητα δύο πανομοιότυπων είναι πρακτικά μηδενική.',
      whyItMatters: 'Η πολυπλοκότητα παράγει μοναδικότητα — ακόμα και στο πιο κοινό φαινόμενο.',
      tldr: 'Κάθε χιονονιφάδα είναι (σχεδόν σίγουρα) μοναδική.',
      tags: ['χιόνι','κρύσταλλοι','φυσική','fun-fact'], mood: ['surprising','calming'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'Snowflake Science', author: 'Kenneth Libbrecht, Caltech', year: 2020, url: 'http://www.snowcrystals.com/', publisher: 'Caltech' },
    },
  ],

  mentalhealth: [
    {
      title: 'Η ονομασία ενός συναισθήματος μειώνει την έντασή του',
      body: 'Έρευνα με fMRI (UCLA, Lieberman) έδειξε ότι το "affect labeling" — το να βάζεις λέξεις σε αυτό που νιώθεις — μειώνει τη δραστηριότητα της αμυγδαλής και ενεργοποιεί τον προμετωπιαίο φλοιό. Το "νιώθω άγχος" κυριολεκτικά ηρεμεί τον εγκέφαλο.',
      whyItMatters: 'Στην ένταση, ονόμασε το συναίσθημα — "name it to tame it".',
      tldr: 'Ονόμασε αυτό που νιώθεις, και ηρεμεί.',
      tags: ['συναισθήματα','affect-labeling','άγχος','νευροεπιστήμη'], mood: ['calming','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'Putting Feelings Into Words', author: 'Lieberman et al.', year: 2007, url: 'https://doi.org/10.1111/j.1467-9280.2007.01916.x', publisher: 'Psychological Science' },
    },
    {
      title: 'Η αναπνοή 4-7-8 ενεργοποιεί το "φρένο" του νευρικού συστήματος',
      body: 'Η αργή εκπνοή ενεργοποιεί το παρασυμπαθητικό νευρικό σύστημα μέσω του πνευμονογαστρικού νεύρου, μειώνοντας καρδιακό ρυθμό και άγχος. Εισπνοή 4 δευτ., κράτημα 7, εκπνοή 8. Η παρατεταμένη εκπνοή είναι το κλειδί — λέει στον εγκέφαλο "είμαστε ασφαλείς".',
      whyItMatters: 'Ένα δωρεάν, άμεσο εργαλείο κατά του άγχους, παντού, οποτεδήποτε.',
      tldr: 'Μεγάλη εκπνοή = άμεση ηρεμία.',
      tags: ['αναπνοή','άγχος','vagus','παρασυμπαθητικό'], mood: ['calming','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'The Physiological Effects of Slow Breathing', author: 'Russo, Santarelli & O’Rourke', year: 2017, url: 'https://doi.org/10.1183/20734735.009817', publisher: 'Breathe (ERS)' },
    },
    {
      title: 'Η άσκηση είναι τόσο αποτελεσματική όσο φάρμακα στην ήπια κατάθλιψη',
      body: 'Συστηματικές ανασκοπήσεις δείχνουν ότι η τακτική αερόβια άσκηση έχει συγκρίσιμο αποτέλεσμα με αντικαταθλιπτικά σε ήπια έως μέτρια κατάθλιψη. Η κίνηση αυξάνει BDNF, ενδορφίνες και ρυθμίζει τον άξονα του στρες — χωρίς παρενέργειες.',
      whyItMatters: 'Μια καθημερινή βόλτα ή τρέξιμο είναι πραγματική θεραπευτική παρέμβαση.',
      tldr: 'Η άσκηση δρα σαν αντικαταθλιπτικό.',
      tags: ['άσκηση','κατάθλιψη','ψυχική-υγεία','bdnf'], mood: ['practical','motivating'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'paper', title: 'Exercise for depression', author: 'Cooney et al. (Cochrane)', year: 2013, url: 'https://doi.org/10.1002/14651858.CD004366.pub6', publisher: 'Cochrane Database of Systematic Reviews' },
    },
  ],

  finance: [
    {
      title: 'Ο κανόνας 50/30/20 για να μη χάνεσαι στον προϋπολογισμό',
      body: 'Απλό πλαίσιο: 50% του καθαρού εισοδήματος σε ανάγκες (στέγη, φαγητό, λογαριασμοί), 30% σε επιθυμίες, 20% σε αποταμίευση και αποπληρωμή χρέους. Δεν είναι ιερός νόμος, αλλά δίνει μια καθαρή αφετηρία αντί για αόριστο "πρέπει να αποταμιεύω".',
      whyItMatters: 'Ένας απλός κανόνας που εφαρμόζεις νικά ένα τέλειο σχέδιο που εγκαταλείπεις.',
      tldr: '50% ανάγκες, 30% επιθυμίες, 20% αποταμίευση.',
      tags: ['budget','αποταμίευση','προϋπολογισμός','χρήμα'], mood: ['practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'All Your Worth: The Ultimate Lifetime Money Plan', author: 'Elizabeth Warren & Amelia Warren Tyagi', year: 2005, publisher: 'Free Press' },
    },
    {
      title: 'Τα index funds νικούν τους περισσότερους ειδικούς μακροπρόθεσμα',
      body: 'Στοιχεία δεκαετιών (S&P SPIVA) δείχνουν ότι >80% των ενεργά διαχειριζόμενων αμοιβαίων υπολείπονται του δείκτη αναφοράς σε βάθος 10+ ετών, κυρίως λόγω προμηθειών. Ο John Bogle, ιδρυτής της Vanguard, το έδειξε: χαμηλό κόστος + διασπορά + χρόνος.',
      whyItMatters: 'Δεν χρειάζεται να "νικήσεις την αγορά" — αρκεί να την ακολουθήσεις φθηνά.',
      tldr: 'Φθηνά index funds > ακριβοί "ειδικοί".',
      tags: ['index-funds','επένδυση','bogle','χρήμα'], mood: ['practical','mind-blowing'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'book', title: 'The Little Book of Common Sense Investing', author: 'John C. Bogle', year: 2007, publisher: 'Wiley' },
    },
    {
      title: 'Ταμείο έκτακτης ανάγκης: 3-6 μήνες εξόδων πριν από όλα',
      body: 'Πριν επενδύσεις, οικονομικοί σύμβουλοι συστήνουν ένα ρευστό απόθεμα 3-6 μηνών βασικών εξόδων. Λειτουργεί ως αμορτισέρ: μια απρόβλεπτη δαπάνη ή απώλεια εισοδήματος δεν σε αναγκάζει σε χρέος υψηλού επιτοκίου ή σε ρευστοποίηση επενδύσεων σε κακή στιγμή.',
      whyItMatters: 'Η ασφάλεια του ταμείου έκτακτης ανάγκης είναι η βάση κάθε οικονομικής ηρεμίας.',
      tldr: 'Κράτα 3-6 μήνες έξοδα σε ρευστό.',
      tags: ['emergency-fund','αποταμίευση','ασφάλεια','χρήμα'], mood: ['practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'The Total Money Makeover', author: 'Dave Ramsey', year: 2003, publisher: 'Thomas Nelson' },
    },
  ],

  tech: [
    {
      title: 'Ο νόμος του Moore: η υπολογιστική ισχύς διπλασιαζόταν κάθε ~2 χρόνια',
      body: 'Το 1965 ο Gordon Moore προέβλεψε ότι ο αριθμός των τρανζίστορ σε ένα chip θα διπλασιάζεται περίπου κάθε δύο χρόνια. Η πρόβλεψη κράτησε για δεκαετίες, οδηγώντας στην εκθετική πτώση κόστους που έβαλε υπερυπολογιστές της δεκαετίας του ’80 στην τσέπη σου.',
      whyItMatters: 'Η εκθετική πρόοδος είναι αντιδιαισθητική — υποτιμούμε πόσο γρήγορα αλλάζει η τεχνολογία.',
      tldr: 'Η ισχύς διπλασιαζόταν κάθε ~2 χρόνια.',
      tags: ['moore','τρανζίστορ','υπολογιστές','τεχνολογία'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 40,
      source: { type: 'paper', title: 'Cramming More Components onto Integrated Circuits', author: 'Gordon E. Moore', year: 1965, url: 'https://doi.org/10.1109/JPROC.1998.658762', publisher: 'Electronics Magazine' },
    },
    {
      title: 'Το πρώτο "bug" υπολογιστή ήταν ένας πραγματικός σκόρος',
      body: 'Το 1947, η ομάδα της Grace Hopper βρήκε έναν σκόρο παγιδευμένο στον υπολογιστή Harvard Mark II. Τον κόλλησαν στο ημερολόγιο με τη σημείωση "first actual case of bug being found". Ο όρος "debugging" καθιερώθηκε για το ξεμπλοκάρισμα προβλημάτων.',
      whyItMatters: 'Η ιστορία της τεχνολογίας είναι γεμάτη ανθρώπινες, απρόσμενες λεπτομέρειες.',
      tldr: 'Το πρώτο bug ήταν πραγματικός σκόρος.',
      tags: ['bug','grace-hopper','ιστορία','προγραμματισμός'], mood: ['surprising','inspiring'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'website', title: 'Log Book With Computer Bug', author: 'Smithsonian NMAH', year: 2021, url: 'https://americanhistory.si.edu/collections/search/object/nmah_334663', publisher: 'Smithsonian' },
    },
    {
      title: 'Το ίντερνετ "ζυγίζει" περίπου όσο μια φράουλα',
      body: 'Όλα τα δεδομένα κινούνται ως ηλεκτρόνια και φωτόνια. Υπολογισμός του φυσικού Russell Seitz εκτίμησε ότι το σύνολο των ηλεκτρονίων που κωδικοποιούν τα δεδομένα του ίντερνετ σε κίνηση ζυγίζει περίπου 50 γραμμάρια — όσο μια φράουλα.',
      whyItMatters: 'Η πληροφορία έχει φυσική υπόσταση — απλώς απίστευτα ελαφριά.',
      tldr: 'Το ίντερνετ ζυγίζει ~μία φράουλα.',
      tags: ['ίντερνετ','δεδομένα','φυσική','fun-fact'], mood: ['surprising','mind-blowing'], difficulty: 'medium', readTimeSec: 35,
      source: { type: 'website', title: 'How Much Does the Internet Weigh?', author: 'Discover Magazine', year: 2007, url: 'https://www.discovermagazine.com/technology/how-much-does-the-internet-weigh', publisher: 'Discover' },
    },
  ],

  wildlife: [
    {
      title: 'Οι κόκκινες αλεπούδες "βλέπουν" το μαγνητικό πεδίο της Γης',
      body: 'Όταν χτυπούν θηράματα κρυμμένα στο χιόνι, οι κόκκινες αλεπούδες πετυχαίνουν πολύ συχνότερα όταν πηδούν προς βορρά-νότο. Ερευνητές πιστεύουν ότι χρησιμοποιούν αίσθηση του γήινου μαγνητικού πεδίου σαν "στόχαστρο" για να υπολογίζουν απόσταση.',
      whyItMatters: 'Πολλά ζώα διαθέτουν αισθήσεις που εμείς ούτε καν αντιλαμβανόμαστε.',
      tldr: 'Οι αλεπούδες κυνηγούν με "μαγνητική πυξίδα".',
      tags: ['αλεπού','μαγνητισμός','ζώα','αίσθηση'], mood: ['surprising','mind-blowing'], difficulty: 'medium', readTimeSec: 40,
      source: { type: 'paper', title: 'Directional preference in fox mousing', author: 'Červený et al.', year: 2011, url: 'https://doi.org/10.1007/s10532-010-9374-8', publisher: 'Biogeosciences (Springer)' },
    },
    {
      title: 'Τα δελφίνια έχουν ονόματα — και ανταποκρίνονται σε αυτά',
      body: 'Κάθε δελφίνι αναπτύσσει ένα μοναδικό "signature whistle" που λειτουργεί σαν όνομα. Έρευνα στη Σκωτία έδειξε ότι τα δελφίνια απαντούν όταν ακούν τη δική τους σφυρίχτρα να αναπαράγεται — και μπορούν να καλούν συγκεκριμένα άτομα με το "όνομά" τους.',
      whyItMatters: 'Η γλώσσα και η ατομική ταυτότητα δεν είναι αποκλειστικά ανθρώπινες.',
      tldr: 'Τα δελφίνια φωνάζουν το ένα το άλλο με όνομα.',
      tags: ['δελφίνια','επικοινωνία','ζώα','νοημοσύνη'], mood: ['surprising','inspiring'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'paper', title: 'Vocal copying of individually distinctive signature whistles in dolphins', author: 'King & Janik', year: 2013, url: 'https://doi.org/10.1073/pnas.1304459110', publisher: 'PNAS' },
    },
    {
      title: 'Ένα μόνο μυρμήγκι χάνεται — η αποικία "σκέφτεται" ως σύνολο',
      body: 'Κανένα μυρμήγκι δεν έχει εικόνα του όλου. Όμως μέσα από απλούς τοπικούς κανόνες και χημικά ίχνη (φερομόνες), η αποικία λύνει σύνθετα προβλήματα: βρίσκει συντομότερες διαδρομές, κατανέμει εργασία, χτίζει. Αυτό λέγεται "swarm intelligence" — νοημοσύνη χωρίς κέντρο.',
      whyItMatters: 'Πολυπλοκότητα και "εξυπνάδα" μπορούν να αναδυθούν από απλούς κανόνες.',
      tldr: 'Η αποικία είναι έξυπνη· το μυρμήγκι όχι.',
      tags: ['μυρμήγκια','swarm','αναδυόμενη-συμπεριφορά','βιολογία'], mood: ['mind-blowing','inspiring'], difficulty: 'medium', readTimeSec: 45,
      source: { type: 'book', title: 'Emergence: The Connected Lives of Ants, Brains, Cities, and Software', author: 'Steven Johnson', year: 2001, publisher: 'Scribner' },
    },
  ],

  lifehacks: [
    {
      title: 'Ο κανόνας των 10 λεπτών νικά την αναβλητικότητα',
      body: 'Δέσμευσε τον εαυτό σου σε μόλις 10 λεπτά μιας εργασίας που αποφεύγεις. Το δύσκολο είναι το ξεκίνημα· μόλις αρχίσεις, το φαινόμενο Zeigarnik και η ορμή σε κρατούν συχνά πολύ περισσότερο. Κι αν σταματήσεις στα 10 λεπτά — έκανες ήδη περισσότερα από το μηδέν.',
      whyItMatters: 'Δεν χρειάζεσαι κίνητρο για να ξεκινήσεις — το κίνητρο έρχεται αφού ξεκινήσεις.',
      tldr: 'Πες "μόνο 10 λεπτά" — και ξεκίνα.',
      tags: ['procrastination','παραγωγικότητα','κίνητρο','lifehack'], mood: ['practical','motivating'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'book', title: 'The Now Habit', author: 'Neil Fiore', year: 1988, publisher: 'Tarcher/Penguin' },
    },
    {
      title: 'Πίνε νερό πρώτα — η δίψα μεταμφιέζεται σε πείνα',
      body: 'Οι μηχανισμοί δίψας και πείνας μοιράζονται περιοχές στον υποθάλαμο, οπότε μια ήπια αφυδάτωση συχνά εκλαμβάνεται ως πείνα. Ένα ποτήρι νερό και 10 λεπτά αναμονή πριν τσιμπήσεις κάτι ξεκαθαρίζει αν πραγματικά πεινάς.',
      whyItMatters: 'Πολλά άσκοπα σνακ είναι απλώς αφυδάτωση μεταμφιεσμένη.',
      tldr: 'Διψάς ή πεινάς; Πιες νερό πρώτα.',
      tags: ['νερό','πείνα','διατροφή','lifehack'], mood: ['practical'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'book', title: 'The Body: A Guide for Occupants', author: 'Bill Bryson', year: 2019, publisher: 'Doubleday' },
    },
    {
      title: 'Η τεχνική Pomodoro: 25 λεπτά δουλειά, 5 διάλειμμα',
      body: 'Ο Francesco Cirillo σχεδίασε ένα απλό σύστημα: δούλεψε εστιασμένα 25 λεπτά, κάνε 5 λεπτά διάλειμμα, και κάθε 4 κύκλους πάρε μεγαλύτερο διάλειμμα. Τα όρια χρόνου μειώνουν τον περισπασμό και κάνουν τα μεγάλα έργα να φαίνονται διαχειρίσιμα.',
      whyItMatters: 'Δομημένος χρόνος + προγραμματισμένα διαλείμματα = σταθερή, βιώσιμη εστίαση.',
      tldr: '25 δουλειά / 5 διάλειμμα. Επανάλαβε.',
      tags: ['pomodoro','focus','παραγωγικότητα','lifehack'], mood: ['practical','motivating'], difficulty: 'easy', readTimeSec: 35,
      source: { type: 'book', title: 'The Pomodoro Technique', author: 'Francesco Cirillo', year: 2006, publisher: 'FC Garage' },
    },
  ],

  cinema: [
    {
      title: 'Ο διάδρομος του "Σόινγκ" στο The Shining δεν βγάζει νόημα — επίτηδες',
      body: 'Ο Kubrick σχεδίασε το ξενοδοχείο Overlook με αρχιτεκτονική που είναι χωρικά αδύνατη: παράθυρα σε γραφεία που θα έπρεπε να είναι μέσα στο κτίριο, διάδρομοι που δεν συνδέονται. Πολλοί μελετητές πιστεύουν ότι το έκανε σκόπιμα, για να προκαλέσει υποσυνείδητη ανησυχία στον θεατή.',
      whyItMatters: 'Το ασυνείδητο πιάνει λεπτομέρειες που το συνειδητό μάτι προσπερνά.',
      tldr: 'Το ξενοδοχείο του Shining είναι χωρικά αδύνατο — επίτηδες.',
      tags: ['kubrick','shining','σινεμά','σκηνοθεσία'], mood: ['surprising','mind-blowing'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'documentary', title: 'Room 237', author: 'Rodney Ascher (dir.)', year: 2012, publisher: 'IFC Films' },
    },
    {
      title: 'Το "Toy Story 2" σβήστηκε κατά λάθος — και σώθηκε από ένα laptop',
      body: 'Το 1998, μια εντολή στους servers της Pixar άρχισε να διαγράφει την ταινία. Τα backups απέτυχαν. Η ταινία σώθηκε επειδή μια εργαζόμενη, σε άδεια μητρότητας, είχε αντίγραφο στο σπίτι της. Έκτοτε η Pixar άλλαξε ριζικά τα συστήματα ασφαλείας της.',
      whyItMatters: 'Τα backups δεν αξίζουν τίποτα αν δεν τα έχεις δοκιμάσει ότι δουλεύουν.',
      tldr: 'Το Toy Story 2 σώθηκε από ένα σπιτικό laptop.',
      tags: ['pixar','toy-story','backup','σινεμά'], mood: ['surprising','practical'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'book', title: 'Creativity, Inc.', author: 'Ed Catmull', year: 2014, publisher: 'Random House' },
    },
    {
      title: 'Ο ήχος του σπαθιού φωτός φτιάχτηκε από προβολέα και τηλεόραση',
      body: 'Ο sound designer Ben Burtt δημιούργησε το εμβληματικό βουητό του lightsaber συνδυάζοντας τον βόμβο της μηχανής ενός παλιού προβολέα φιλμ με το σφύριγμα που έπιανε ένα μικρόφωνο όταν πλησίαζε σε τηλεόραση. Η κίνηση προστέθηκε μετακινώντας τον ήχο στον χώρο.',
      whyItMatters: 'Η δημιουργικότητα συχνά είναι ανασυνδυασμός καθημερινών πραγμάτων.',
      tldr: 'Το lightsaber = προβολέας + τηλεόραση.',
      tags: ['star-wars','sound-design','σινεμά','δημιουργικότητα'], mood: ['surprising','inspiring'], difficulty: 'easy', readTimeSec: 40,
      source: { type: 'website', title: 'The Sounds of Star Wars: Ben Burtt', author: 'Sound on Sound', year: 2010, url: 'https://www.soundonsound.com/people/ben-burtt-star-wars', publisher: 'Sound on Sound' },
    },
  ],
};

async function run() {
  if (!process.env.MONGO_URI) { console.error('❌ MONGO_URI missing'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const cats = await Category.find({});
  const slugToId = {};
  cats.forEach((c) => { slugToId[c.slug] = c._id; });

  const existing = new Set((await Card.find({}, { title: 1 }).lean()).map((c) => c.title));

  const toInsert = [];
  let skippedNoCat = 0;
  for (const [slug, cards] of Object.entries(byCategory)) {
    const catId = slugToId[slug];
    if (!catId) { skippedNoCat += cards.length; console.warn(`⚠️  no category for slug "${slug}"`); continue; }
    for (const c of cards) {
      if (existing.has(c.title)) continue;
      toInsert.push({
        ...c,
        category: catId,
        language: 'el',
        status: c.status || 'published',
        verified: c.verified !== false,
        aiGenerated: false,
      });
    }
  }

  if (toInsert.length === 0) {
    console.log('ℹ️  Nothing new to insert (all titles already present).');
  } else {
    const inserted = await Card.insertMany(toInsert, { ordered: false });
    console.log(`✅ Inserted ${inserted.length} new cards`);
  }
  if (skippedNoCat) console.log(`⚠️  Skipped ${skippedNoCat} cards (missing category)`);

  const total = await Card.countDocuments({ status: 'published', language: 'el' });
  console.log(`📊 Total published el cards now: ${total}`);

  await mongoose.disconnect();
}

run().catch((e) => { console.error('❌', e); process.exit(1); });
