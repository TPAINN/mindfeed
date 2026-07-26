import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

/* Simple light ↔ dark toggle. Shows sun in dark mode (click → light),
   moon in light mode (click → dark). Applies synchronously on click. */
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
      <Icon name={icon} size={size} strokeWidth={1.9} />
    </button>
  )
}
