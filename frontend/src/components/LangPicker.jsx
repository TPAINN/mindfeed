import { motion } from 'framer-motion'
import { useLang } from '../context/LangContext'
import { fadeUp } from '../motion/variants'
import './LangPicker.css'

export default function LangPicker({ onPick }) {
  const { setLang } = useLang()

  function pick(lang) {
    setLang(lang)
    onPick()
  }

  return (
    <div className="mf-langpicker">
      <motion.div
        className="mf-langpicker__content"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="mf-langpicker__logo">🧠</div>
        <h1 className="mf-langpicker__title">MindFeed</h1>
        <p className="mf-langpicker__subtitle">Choose your language · Επίλεξε γλώσσα</p>

        <div className="mf-langpicker__options">
          <motion.button
            className="mf-langpicker__option"
            whileTap={{ scale: 0.95 }}
            onClick={() => pick('el')}
          >
            <span className="mf-langpicker__flag">🇬🇷</span>
            <span className="mf-langpicker__label">Ελληνικά</span>
          </motion.button>

          <motion.button
            className="mf-langpicker__option"
            whileTap={{ scale: 0.95 }}
            onClick={() => pick('en')}
          >
            <span className="mf-langpicker__flag">🇬🇧</span>
            <span className="mf-langpicker__label">English</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
