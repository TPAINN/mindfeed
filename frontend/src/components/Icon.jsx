/* ── MindFeed icon system ────────────────────────────────────────────────────
   Hand-drawn stroke icons — 24px grid, 1.7px stroke, round caps — replacing
   every emoji in the UI. All icons inherit `currentColor` so they tint with
   the surrounding text (amber chips, muted buttons, etc.).                  */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const PATHS = {
  /* ── UI ── */
  bookmark: <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.8L6 20V5.5a1 1 0 0 1 1-1Z" />,
  'bookmark-filled': (
    <path
      d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.8L6 20V5.5a1 1 0 0 1 1-1Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  logout: (
    <g>
      <path d="M14 5H7a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 7 19h7" />
      <path d="M11 12h8m0 0-3-3m3 3-3 3" />
    </g>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  undo: <path d="M8.5 7 5 10.5m0 0L8.5 14M5 10.5h9a5 5 0 0 1 0 10h-3" transform="translate(0,-2.5)" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  'chevron-left': <path d="m14 6.5-5.5 5.5L14 17.5" />,
  play: <path d="M8.5 6.2v11.6a.6.6 0 0 0 .92.5l9-5.8a.6.6 0 0 0 0-1l-9-5.8a.6.6 0 0 0-.92.5Z" />,
  external: (
    <g>
      <path d="M11 6H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-4" />
      <path d="M13.5 4.5H19.5V10.5M19 5l-8 8" />
    </g>
  ),
  x: <path d="M6.5 6.5l11 11m0-11-11 11" />,
  clock: (
    <g>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </g>
  ),
  signal: (
    <g>
      <path d="M5 11.5a10 10 0 0 1 6-2.9M16.6 9.7A10 10 0 0 1 19 11.5" />
      <path d="M8 14.6a6.2 6.2 0 0 1 2.6-1.5M14.6 13.5a6.2 6.2 0 0 1 1.4 1.1" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none" />
      <path d="M4 4l16 16" />
    </g>
  ),
  /* ── Landing features ── */
  layers: (
    <g>
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m5.2 11.6 6.8 3.4 6.8-3.4" />
      <path d="m5.2 15.1 6.8 3.4 6.8-3.4" />
    </g>
  ),
  shield: (
    <g>
      <path d="M12 3.5 5.5 6v5c0 4.4 2.9 7.4 6.5 9 3.6-1.6 6.5-4.6 6.5-9V6L12 3.5Z" />
      <path d="m9.2 11.8 2 2 3.8-4" />
    </g>
  ),
  moon: <path d="M19.5 14A8 8 0 0 1 10 4.5 8 8 0 1 0 19.5 14Z" />,
  /* ── Categories ── */
  brain: (
    <g>
      <circle cx="12" cy="12" r="2.3" />
      <path d="M12 9.7V5.5m0 13v-4.2m2.1-1 3.6 2.2m-9.3-5.6 3.5 2.2m0 2.2-3.6 2.2m9.4-5.6-3.6 2.2" />
      <circle cx="12" cy="4.4" r="1.1" />
      <circle cx="12" cy="19.6" r="1.1" />
      <circle cx="18.6" cy="8.2" r="1.1" />
      <circle cx="5.4" cy="8.2" r="1.1" />
      <circle cx="18.6" cy="15.8" r="1.1" />
      <circle cx="5.4" cy="15.8" r="1.1" />
    </g>
  ),
  sun: (
    <g>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </g>
  ),
  leaf: (
    <g>
      <path d="M6 18C6 10 10.5 5.5 19 5c.5 8.5-4 13-12 13" />
      <path d="M6 18c2.5-5.5 6-9 10.5-10.5" />
    </g>
  ),
  planet: (
    <g>
      <circle cx="12" cy="12" r="5" />
      <path d="M4.6 9.5C2.7 10.6 1.7 11.8 2.1 12.8c.6 1.6 4.9 1.6 10.3-.4s9-4.6 8.4-6.2c-.4-1-2-1.2-4.2-.8" />
    </g>
  ),
  dna: (
    <g>
      <path d="M8 3.5c0 6 8 5 8 11m0-11c0 6-8 5-8 11m0-11v2m8 9v2m-8-2c0 2.5 1.5 4 4 4" transform="translate(0,1)" />
      <path d="M9 8h6M9 17h6" transform="translate(0,-0.5)" />
    </g>
  ),
  heart: (
    <g>
      <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10Z" />
      <path d="M8 12h2.2l1.2-2 1.4 3.5 1-1.5H16" />
    </g>
  ),
  column: (
    <g>
      <path d="M5 20h14M6.5 17.5h11" />
      <path d="M8 17.5v-8M12 17.5v-8M16 17.5v-8" />
      <path d="M5 9.5h14L12 4.5 5 9.5Z" />
    </g>
  ),
  paw: (
    <g>
      <ellipse cx="7.2" cy="9.8" rx="1.6" ry="2.1" />
      <ellipse cx="16.8" cy="9.8" rx="1.6" ry="2.1" />
      <ellipse cx="10" cy="6.8" rx="1.6" ry="2.1" />
      <ellipse cx="14" cy="6.8" rx="1.6" ry="2.1" />
      <path d="M12 12c-2.6 0-4.8 2.1-4.8 4.1 0 1.2.9 1.9 2 1.9 1 0 1.8-.5 2.8-.5s1.8.5 2.8.5c1.1 0 2-.7 2-1.9 0-2-2.2-4.1-4.8-4.1Z" />
    </g>
  ),
  trending: (
    <g>
      <path d="m4 17 5.5-5.5 3.5 3.5L20 8" />
      <path d="M15.5 8H20v4.5" />
    </g>
  ),
  coins: (
    <g>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.7" />
      <path d="M5.5 6.5v5c0 1.5 2.9 2.7 6.5 2.7s6.5-1.2 6.5-2.7v-5" />
      <path d="M5.5 11.5v5c0 1.5 2.9 2.7 6.5 2.7s6.5-1.2 6.5-2.7v-5" />
    </g>
  ),
  spark: (
    <g>
      <path d="M12 4v4.2M12 15.8V20M4 12h4.2M15.8 12H20" />
      <path d="m6.8 6.8 2.6 2.6M14.6 14.6l2.6 2.6M17.2 6.8l-2.6 2.6M9.4 14.6l-2.6 2.6" opacity="0.55" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </g>
  ),
  book: (
    <g>
      <path d="M12 6.5C10.3 5 8 4.5 4.5 4.5v13c3.5 0 5.8.5 7.5 2 1.7-1.5 4-2 7.5-2v-13C16 4.5 13.7 5 12 6.5Z" />
      <path d="M12 6.5v13" />
    </g>
  ),
}

export default function Icon({ name, size = 16, className = '', ...rest }) {
  const glyph = PATHS[name] ?? PATHS.book
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`mf-icon${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      focusable="false"
      {...STROKE}
      {...rest}
    >
      {glyph}
    </svg>
  )
}

/* ── Category → icon mapping ─────────────────────────────────────────────────
   The DB stores an emoji per category; we render a real icon instead. Match
   by the emoji character first, then by keywords in the category name.      */

const EMOJI_MAP = {
  '🧠': 'brain', '☀️': 'sun', '🌿': 'leaf', '🌱': 'leaf', '🌌': 'planet',
  '🪐': 'planet', '🔭': 'planet', '🧬': 'dna', '🍎': 'heart', '❤️': 'heart',
  '🏛️': 'column', '🏛': 'column', '🦁': 'paw', '🐾': 'paw', '🦉': 'paw',
  '💪': 'trending', '📈': 'trending', '💰': 'coins', '🪙': 'coins',
  '⚡': 'spark', '✨': 'spark', '📖': 'book', '📚': 'book',
}

const NAME_RULES = [
  [/νευρο|ψυχολ|εγκέφαλ|neuro|psych|brain|mind/i, 'brain'],
  [/circadian|ήλιο|φως|ύπνο|sleep|light|sun/i, 'sun'],
  [/φύση|φυτ|δάσ|biophil|nature|plant|περιβάλλ/i, 'leaf'],
  [/σύμπαν|κοσμολ|γαλαξ|αστρο|space|cosmos|universe|astro/i, 'planet'],
  [/βιολογ|μικροβ|γονίδ|dna|gene|biology|microb/i, 'dna'],
  [/υγεία|longevity|διατροφ|health|ιατρικ|medic/i, 'heart'],
  [/φιλοσοφ|στωικ|ηθικ|philosoph|stoic|ιστορ|histor/i, 'column'],
  [/ζωολογ|ζώα|άγρια|wildlife|animal|zoo/i, 'paw'],
  [/βελτίωση|συνήθει|παραγωγικ|self|habit|improve|productiv/i, 'trending'],
  [/οικονομ|χρήμα|επενδ|finan|money|invest|econom/i, 'coins'],
  [/τεχνολογ|φυσική|ενέργεια|tech|physic|energy|επιστήμ|science/i, 'spark'],
]

export function categoryIconName(category) {
  if (!category || typeof category !== 'object') return 'book'
  const byEmoji = EMOJI_MAP[(category.emoji || '').trim()]
  if (byEmoji) return byEmoji
  const name = category.name || ''
  for (const [re, icon] of NAME_RULES) if (re.test(name)) return icon
  return 'book'
}

export function CategoryIcon({ category, size = 14, ...rest }) {
  return <Icon name={categoryIconName(category)} size={size} {...rest} />
}
