import { useState, useEffect, useRef } from 'react'
import { useLang } from '../context/LangContext'
import AuthCard from './AuthCard'
import ThemeToggle from './ThemeToggle'
import LangToggle from './LangToggle'
import Icon from './Icon'
import './Landing.css'

const stories = [
  { topic: ['Διάστημα', 'Space'], title: ['Ένας κόσμος πέρα από τον δικό μας.', 'A world beyond our own.'], body: ['Κάθε φωτεινό σημείο στον νυχτερινό ουρανό είναι η αρχή μιας ιστορίας. Ανακάλυψε την αστρονομία, μία ιδέα τη φορά.', 'Every point of light in the night sky is the beginning of a story. Explore astronomy, one idea at a time.'], source: 'NASA · Science', url: 'https://science.nasa.gov/universe/', art: 'orbit' },
  { topic: ['Φύση', 'Nature'], title: ['Η περιέργεια έχει βαθιές ρίζες.', 'Curiosity has deep roots.'], body: ['Από τα μικρότερα κύτταρα μέχρι ολόκληρα οικοσυστήματα. Μικρές αναγνώσεις για τον ζωντανό κόσμο που μας περιβάλλει.', 'From the smallest cells to entire ecosystems. Short reads about the living world around us.'], source: 'Smithsonian · Natural History', url: 'https://naturalhistory.si.edu/', art: 'leaf' },
  { topic: ['Ιστορία', 'History'], title: ['Το παρελθόν έχει κι άλλα να πει.', 'The past still has something to say.'], body: ['Ιδέες, άνθρωποι και ανακαλύψεις που άλλαξαν τον τρόπο που ζούμε. Μια διαφορετική οπτική, κάθε μέρα.', 'Ideas, people, and discoveries that changed how we live. A different perspective, every day.'], source: 'World History Encyclopedia', url: 'https://www.worldhistory.org/', art: 'history' },
]

function Illustration({ variant }) {
  return <div className={`editorial-art editorial-art--${variant}`} aria-hidden="true">
    <svg viewBox="0 0 520 270" fill="none">
      {variant === 'orbit' ? <>
        <circle cx="269" cy="133" r="78" fill="currentColor" opacity=".13" />
        <circle cx="269" cy="133" r="57" fill="currentColor" />
        <ellipse cx="260" cy="136" rx="190" ry="51" transform="rotate(-27 260 136)" stroke="currentColor" strokeWidth="1.4" />
        <ellipse cx="260" cy="136" rx="214" ry="83" transform="rotate(-27 260 136)" stroke="currentColor" opacity=".3" />
        <circle cx="103" cy="186" r="9" fill="currentColor" /><circle cx="404" cy="70" r="4" fill="currentColor" />
        <path d="M110 53v16m-8-8h16M420 202v12m-6-6h12" stroke="currentColor" />
      </> : variant === 'leaf' ? <>
        <path d="M256 241V55m0 109C140 166 121 109 128 61c74 0 128 36 128 103Zm0-25c99 0 130-52 128-101-78 2-126 40-128 101Zm0 71c-75 0-100-32-104-68 63-2 104 24 104 68Z" stroke="currentColor" strokeWidth="2" />
        <path d="m256 164-128-103m128 78L384 38m-128 172-104-68" stroke="currentColor" opacity=".4" />
        <circle cx="259" cy="132" r="108" stroke="currentColor" opacity=".16" />
      </> : <>
        <path d="m126 75 134-43 134 43H126Zm12 20h244M133 231h254M125 245h270" stroke="currentColor" strokeWidth="3" />
        {[157, 215, 273, 331].map(x => <g key={x}><path d={`M${x} 99v124m18-124v124`} stroke="currentColor" strokeWidth="3"/><path d={`M${x-4} 106h26m-26 109h26`} stroke="currentColor" /></g>)}
        <circle cx="260" cy="136" r="115" stroke="currentColor" opacity=".12" />
      </>}
    </svg>
  </div>
}

export default function Landing() {
  const root = useRef(null)
  useEffect(() => {
    let disposed = false
    let cleanup
    import('../motion/landingMotion').then(({ default: setup }) => {
      if (!disposed) cleanup = setup(root.current)
    }).catch(() => { /* Native scrolling remains available if motion cannot load. */ })
    return () => { disposed = true; cleanup?.() }
  }, [])
  const { lang } = useLang()
  const l = lang === 'el' ? 0 : 1
  const [selected, setSelected] = useState(0)
  const story = stories[selected]
  const copy = (el, en) => l === 0 ? el : en
  function signIn() { window.dispatchEvent(new CustomEvent('mf:auth-mode', { detail: 'login' })) }
  return <div ref={root} className="editorial" id="top">
    <a className="skip-link" href="#main-content">{copy('Μετάβαση στο περιεχόμενο', 'Skip to content')}</a>
    <header className="editorial-header">
      <a href="#top" className="editorial-brand" aria-label="MindFeed"><img src="/mark.svg" width="30" height="30" alt="" />MindFeed<span>.</span></a>
      <nav className="editorial-nav" aria-label={copy('Κύρια πλοήγηση', 'Main navigation')}><a href="#how-it-works">{copy('Πώς λειτουργεί', 'How it works')}</a><a href="#our-approach">{copy('Η φιλοσοφία μας', 'Our approach')}</a></nav>
      <div className="editorial-tools"><LangToggle /><ThemeToggle /><a className="editorial-signin" href="#start" onClick={signIn}>{copy('Σύνδεση', 'Sign in')} <span aria-hidden="true">↗</span></a></div>
    </header>
    <main id="main-content">
      <section className="editorial-hero" aria-labelledby="hero-title">
        <div className="editorial-hero-copy">
          <p className="editorial-kicker"><span />{copy('Μια μικρή καθημερινή ανακάλυψη', 'A little discovery, every day')}</p>
          <h1 id="hero-title">{copy('Λιγότερο scroll.', 'Less scrolling.')}<br /><em>{copy('Περισσότερος κόσμος.', 'More world.')}</em></h1>
          <p className="editorial-intro">{copy('Δέκα κάρτες γνώσης. Πραγματικές πηγές. Λίγα λεπτά για κάτι που αξίζει να μείνει μαζί σου.', 'Ten knowledge cards. Real sources. A few minutes for something worth taking with you.')}</p>
          <button className="editorial-primary" onClick={() => window.dispatchEvent(new CustomEvent('mf:demo'))}>{copy('Δοκίμασε την πρώτη σου ανάγνωση', 'Try your first read')}<span aria-hidden="true">↗</span></button>
          <p className="editorial-note">{copy('Δωρεάν. Χωρίς λογαριασμό για τη δοκιμή.', 'Free. No account needed to try it.')}</p>
          <div className="editorial-promise"><span><strong>10</strong>{copy('κάρτες τη μέρα', 'cards a day')}</span><span><Icon name="external" size={18} />{copy('Πηγές σε κάθε κάρτα', 'Sources on every card')}</span></div>
        </div>
        <div className="editorial-preview">
          <div className="editorial-preview-label"><span>{copy('Μια γεύση από το MindFeed', 'A taste of MindFeed')}</span><span>0{selected + 1} / 03</span></div>
          <article className="editorial-story" aria-live="polite" aria-atomic="true">
            <Illustration variant={story.art} />
            <div className="editorial-story-copy"><div className="editorial-story-meta"><span>{story.topic[l]}</span><span>{copy('Θεματική συλλογή', 'Topic preview')}</span></div><h2>{story.title[l]}</h2><p>{story.body[l]}</p><a href={story.url} target="_blank" rel="noopener noreferrer">{story.source}<Icon name="external" size={14} /></a></div>
          </article>
          <div className="editorial-preview-controls"><span>{copy('Ακολούθησε την περιέργειά σου', 'Follow your curiosity')}</span><div>{stories.map((s, i) => <button key={s.art} aria-label={s.topic[l]} aria-pressed={selected === i} onClick={() => setSelected(i)}>{i + 1}</button>)}</div></div>
        </div>
      </section>
      <div className="editorial-topics" aria-label={copy('Θεματικές', 'Topics')}>{(l === 0 ? ['Επιστήμη', 'Ψυχολογία', 'Φύση', 'Φιλοσοφία', 'Ιστορία', 'Διάστημα'] : ['Science', 'Psychology', 'Nature', 'Philosophy', 'History', 'Space']).map(topic => <span key={topic}>{topic}</span>)}</div>
      <section className="editorial-method" id="how-it-works" aria-labelledby="method-title">
        <div><p className="editorial-section-label">{copy('Ένας καλύτερος μικρός ρυθμός', 'A better little ritual')}</p><h2 id="method-title">{copy('Άνοιξε. Ανακάλυψε.', 'Open. Discover.')}<br /><em>{copy('Συνέχισε τη μέρα σου.', 'Get on with your day.')}</em></h2><p>{copy('Δεν χρειάζεσαι άλλη μία εφαρμογή που ζητά τον χρόνο σου. Χρειάζεσαι έναν καλό λόγο να αφήσεις το κινητό λίγο πιο πλούσιος σε ιδέες.', 'You don’t need another app asking for your time. You need a good reason to put your phone down with a little more to think about.')}</p></div>
        <dl className="editorial-steps"><div><dt>{copy('Λίγη γνώση, κάθε μέρα', 'A little knowledge, every day')}</dt><dd>{copy('Μια πεπερασμένη συλλογή από σύντομες αναγνώσεις. Χωρίς ατελείωτη ροή.', 'A finite collection of short reads. There’s a beginning, and an end.')}</dd></div><div><dt>{copy('Δες από πού προέρχεται', 'See where it comes from')}</dt><dd>{copy('Άνοιξε την πηγή κάθε κάρτας και εμβάθυνε σε ό,τι σε ενδιαφέρει.', 'Open the source behind each card and go deeper into what interests you.')}</dd></div><div><dt>{copy('Κράτα ό,τι σου μένει', 'Keep what stays with you')}</dt><dd>{copy('Αποθήκευσε τις αγαπημένες σου ιδέες. Όταν τελειώσεις, η μέρα είναι δική σου.', 'Save your favorite ideas. When you’re finished, the rest of the day is yours.')}</dd></div></dl>
      </section>
      <section className="editorial-approach" id="our-approach"><p className="editorial-section-label">{copy('Σχεδιασμένο με ένα όριο', 'Designed with a limit')}</p><h2>{copy('Η καλύτερη στιγμή;', 'The best part?')}<br /><em>{copy('Όταν το κλείνεις.', 'When you close it.')}</em></h2><p>{copy('Χωρίς likes. Χωρίς κατάταξη. Χωρίς πίεση να επιστρέψεις. Μόνο εσύ, η περιέργειά σου και κάτι καινούργιο να σκεφτείς.', 'No likes. No leaderboards. No pressure to come back. Just you, your curiosity, and something new to think about.')}</p></section>
      <section className="editorial-start" id="start"><div><p className="editorial-section-label">{copy('Η δική σου μικρή βιβλιοθήκη', 'Your own little library')}</p><h2>{copy('Κάνε χώρο', 'Make room')}<br /><em>{copy('για μια νέα ιδέα.', 'for a new idea.')}</em></h2><p>{copy('Δημιούργησε δωρεάν λογαριασμό για την καθημερινή σου ροή και τις αποθηκευμένες κάρτες σου.', 'Create a free account for your daily feed and saved cards.')}</p><p className="editorial-start-note">{copy('Στα ελληνικά και στα αγγλικά. Στο κινητό, στο tablet, στον υπολογιστή.', 'In Greek and English. On your phone, tablet, or computer.')}</p></div><AuthCard /></section>
    </main>
    <footer className="editorial-footer"><a className="editorial-brand" href="#top">MindFeed<span>.</span></a><p>{copy('Λίγη γνώση. Αρκετή για σήμερα.', 'A little knowledge. Enough for today.')}</p><a href="https://github.com/TPAINN/mindfeed" target="_blank" rel="noopener noreferrer">{copy('Το έργο', 'The project')} ↗</a></footer>
  </div>
}
