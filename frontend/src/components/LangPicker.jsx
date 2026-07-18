import { motion } from 'framer-motion'
import { useLang } from '../context/LangContext'
import './LangPicker.css'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

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
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div className="mf-langpicker__logo" variants={item}>
          <img src="/favicon.svg" alt="" />
        </motion.div>
        <motion.h1 className="mf-langpicker__title" variants={item}>MindFeed</motion.h1>
        <motion.p className="mf-langpicker__subtitle" variants={item}>
          Επίλεξε γλώσσα · Choose your language
        </motion.p>

        <motion.div className="mf-langpicker__options" variants={item}>
          <motion.button
            className="mf-langpicker__option"
            whileTap={{ scale: 0.95 }}
            onClick={() => pick('el')}
          >
            <span className="mf-langpicker__badge">ΕΛ</span>
            <span className="mf-langpicker__label">Ελληνικά</span>
          </motion.button>

          <motion.button
            className="mf-langpicker__option"
            whileTap={{ scale: 0.95 }}
            onClick={() => pick('en')}
          >
            <span className="mf-langpicker__badge">EN</span>
            <span className="mf-langpicker__label">English</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
