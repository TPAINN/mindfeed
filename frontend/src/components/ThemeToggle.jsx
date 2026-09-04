import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

/* Simple light ↔ dark toggle. Shows sun in dark mode (click → light),
   moon in light mode (click → dark). Applies synchronously on click; the
   icon swap rolls softly instead of popping. */
export default function ThemeToggle({ size = 15 }) {
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'
  const icon = isDark ? 'sun' : 'moon'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      className="mf-theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={icon}
          className="mf-theme-toggle__icon"
          initial={{ rotate: -70, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 70, scale: 0.4, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        >
          <Icon name={icon} size={size} strokeWidth={1.9} />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
