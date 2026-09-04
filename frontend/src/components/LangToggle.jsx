import { useLang } from '../context/LangContext'
import './LangToggle.css'

/* Compact ΕΛ | EN segmented control. Selecting a language persists it and, for
   signed-in users, syncs the preference to the backend (see LangContext). */
export default function LangToggle({ size = 'sm' }) {
  const { lang, setLang } = useLang()

  return (
    <div
      className={`mf-langtoggle mf-langtoggle--${size}`}
      role="group"
      aria-label="Language"
    >
      {(['el', 'en']).map(code => (
        <button
          key={code}
          className={`mf-langtoggle__opt${lang === code ? ' mf-langtoggle__opt--on' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          title={code === 'el' ? 'Ελληνικά' : 'English'}
        >
          {code === 'el' ? 'ΕΛ' : 'EN'}
        </button>
      ))}
    </div>
  )
}
