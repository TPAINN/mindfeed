import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import Card from './Card'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useT } from '../i18n/useT'
import { api, localDate } from '../api/client'
import { deckSpring, deckTravel, deckFlyX, deckSlot, fadeUpStagger, fadeUpItem } from '../motion/variants'
import './Feed.css'

const MOCK_CARDS = [
  {
    _id: '1',
    title: 'ÎŸ ÎœÏÎ¸Î¿Ï‚ Ï„Î·Ï‚ Î Î¿Î»Ï…ÎµÏÎ³Î±ÏƒÎ¯Î±Ï‚',
    body: 'ÎŸ Î±Î½Î¸ÏÏŽÏ€Î¹Î½Î¿Ï‚ ÎµÎ³ÎºÎ­Ï†Î±Î»Î¿Ï‚ Î´ÎµÎ½ Î¼Ï€Î¿ÏÎµÎ¯ Î½Î± ÎºÎ¬Î½ÎµÎ¹ Î´ÏÎ¿ Î³Î½Ï‰ÏƒÏ„Î¹ÎºÎ­Ï‚ ÎµÏÎ³Î±ÏƒÎ¯ÎµÏ‚ Ï„Î±Ï…Ï„ÏŒÏ‡ÏÎ¿Î½Î±. Î‘Ï…Ï„ÏŒ Ï€Î¿Ï… Î±Ï€Î¿ÎºÎ±Î»Î¿ÏÎ¼Îµ Â«multitaskingÂ» ÎµÎ¯Î½Î±Î¹ Î³ÏÎ®Î³Î¿ÏÎ· ÎµÎ½Î±Î»Î»Î±Î³Î® â€” ÎºÎ¿ÏƒÏ„Î¯Î¶ÎµÎ¹ ÎºÎ±Ï„Î¬ Î¼Î­ÏƒÎ¿ ÏŒÏÎ¿ 23 Î»ÎµÏ€Ï„Î¬ ÎµÏ€Î¹ÏƒÏ„ÏÎ¿Ï†Î®Ï‚ ÏƒÏ„Î· Î²Î±Î¸Î¹Î¬ ÎµÏƒÏ„Î¯Î±ÏƒÎ· Î¼ÎµÏ„Î¬ Î±Ï€ÏŒ ÎºÎ¬Î¸Îµ Î´Î¹Î±ÎºÎ¿Ï€Î®.',
    tldr: 'ÎšÎ¬Î½Îµ Î­Î½Î± Ï€ÏÎ¬Î³Î¼Î± Ï„Î· Ï†Î¿ÏÎ¬. Î— ÎµÏƒÏ„Î¯Î±ÏƒÎ· ÎµÎ¯Î½Î±Î¹ Ï…Ï€ÎµÏÎ´ÏÎ½Î±Î¼Î·.',
    whyItMatters: 'Î¤Î¿ multitasking Î¼ÎµÎ¹ÏŽÎ½ÎµÎ¹ Ï„Î·Î½ Ï€Î±ÏÎ±Î³Ï‰Î³Î¹ÎºÏŒÏ„Î·Ï„Î± ÎºÎ±Ï„Î¬ 40%. ÎšÎ»ÎµÎ¯ÏƒÎµ Ï„Î¹Ï‚ ÎµÎ¹Î´Î¿Ï€Î¿Î¹Î®ÏƒÎµÎ¹Ï‚ Î³Î¹Î± 90 Î»ÎµÏ€Ï„Î¬.',
    category: { emoji: 'ðŸ§ ', name: 'ÎÎµÏ…ÏÎ¿ÎµÏ€Î¹ÏƒÏ„Î®Î¼Î·' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['mind-blowing', 'practical'],
    source: { type: 'paper', title: 'The Cost of Interrupted Work', author: 'Gloria Mark', year: 2008, url: 'https://www.ics.uci.edu/~gmark/chi08-mark.pdf' },
  },
  {
    _id: '2',
    title: 'Î¤Î¿ Î ÏÏ‰Î¹Î½ÏŒ Î¦Ï‰Ï‚ Î¡Ï…Î¸Î¼Î¯Î¶ÎµÎ¹ ÎŒÎ»Î±',
    body: '30 Î»ÎµÏ€Ï„Î¬ Ï†Ï…ÏƒÎ¹ÎºÏŒ Ï†Ï‰Ï‚ ÎµÎ½Ï„ÏŒÏ‚ 1 ÏŽÏÎ±Ï‚ Î±Ï€ÏŒ Ï„Î·Î½ Î±Ï†ÏÏ€Î½Î¹ÏƒÎ· ÎµÏ€Î±Î½Î±ÏÏ…Î¸Î¼Î¯Î¶ÎµÎ¹ Ï„Î¿ ÎºÎ¹ÏÎºÎ¬Î´Î¹Î¿ ÏÎ¿Î»ÏŒÎ¹ ÏƒÎ¿Ï…. ÎœÎµÎ¹ÏŽÎ½ÎµÎ¹ Ï„Î·Î½ ÎºÎ¿ÏÏ„Î¹Î¶ÏŒÎ»Î·, ÎµÎ½Î¹ÏƒÏ‡ÏÎµÎ¹ Ï„Î· ÏƒÎµÏÎ¿Ï„Î¿Î½Î¯Î½Î· ÎºÎ±Î¹ Î²ÎµÎ»Ï„Î¹ÏŽÎ½ÎµÎ¹ Ï„Î·Î½ Ï€Î¿Î¹ÏŒÏ„Î·Ï„Î± ÏÏ€Î½Î¿Ï… Ï„Î¿ Î²ÏÎ¬Î´Ï….',
    tldr: 'Î ÏÏ‰Î¹Î½ÏŒÏ‚ Î®Î»Î¹Î¿Ï‚ = ÎºÎ±Î»ÏÏ„ÎµÏÎ¿Ï‚ ÏÏ€Î½Î¿Ï‚ + ÎºÎ±Î»ÏÏ„ÎµÏÎ· Î´Î¹Î¬Î¸ÎµÏƒÎ·.',
    whyItMatters: 'Î— Î­ÎºÎ¸ÎµÏƒÎ· ÏƒÏ„Î¿Î½ Î®Î»Î¹Î¿ Ï„Î¿ Ï€ÏÏ‰Î¯ ÏÏ…Î¸Î¼Î¯Î¶ÎµÎ¹ Ï„Î·Î½ Ï€Î±ÏÎ±Î³Ï‰Î³Î® Î¼ÎµÎ»Î±Ï„Î¿Î½Î¯Î½Î·Ï‚ Î³Î¹Î± 16 ÏŽÏÎµÏ‚ Î¼ÎµÏ„Î¬.',
    category: { emoji: 'â˜€ï¸', name: 'Circadian Biology' },
    difficulty: 'easy', readTimeSec: 40,
    mood: ['calming', 'practical'],
    source: { type: 'paper', title: 'Entrainment of the Human Circadian Clock', author: 'Roenneberg et al.', year: 2013, url: 'https://www.cell.com/current-biology/fulltext/S0960-9822(12)01464-8' },
  },
  {
    _id: '3',
    title: 'Î¤Î¿ Î”Î¬ÏƒÎ¿Ï‚ ÎœÎµÎ¹ÏŽÎ½ÎµÎ¹ Ï„Î·Î½ ÎšÎ¿ÏÏ„Î¹Î¶ÏŒÎ»Î·',
    body: 'Shinrin-yoku â€” Ï„Î¿ Â«Î¼Ï€Î¬Î½Î¹Î¿ ÏƒÏ„Î¿ Î´Î¬ÏƒÎ¿Ï‚Â» â€” Î¼ÎµÎ¹ÏŽÎ½ÎµÎ¹ Ï„Î± ÎµÏ€Î¯Ï€ÎµÎ´Î± ÎºÎ¿ÏÏ„Î¹Î¶ÏŒÎ»Î·Ï‚ ÎºÎ±Ï„Î¬ 12.4% ÎºÎ±Î¹ Ï„Î·Î½ Î±ÏÏ„Î·ÏÎ¹Î±ÎºÎ® Ï€Î¯ÎµÏƒÎ· ÎºÎ±Ï„Î¬ 7% Î¼ÎµÏ„Î¬ Î±Ï€ÏŒ Î¼ÏŒÎ»Î¹Ï‚ 2 ÏŽÏÎµÏ‚. Î¤Î± phytoncides Ï€Î¿Ï… ÎµÎºÏ€Î­Î¼Ï€Î¿Ï…Î½ Ï„Î± Î´Î­Î½Ï„ÏÎ± ÎµÎ½Î¹ÏƒÏ‡ÏÎ¿Ï…Î½ Ï„Î± NK cells Ï„Î¿Ï… Î±Î½Î¿ÏƒÎ¿Ï€Î¿Î¹Î·Ï„Î¹ÎºÎ¿Ï.',
    tldr: '2 ÏŽÏÎµÏ‚ ÏƒÎµ Î´Î¬ÏƒÎ¿Ï‚ = Ï‡Î±Î¼Î·Î»ÏŒÏ„ÎµÏÎ¿ ÏƒÏ„ÏÎµÏ‚ + Î¹ÏƒÏ‡Ï…ÏÏŒÏ„ÎµÏÎ¿ Î±Î½Î¿ÏƒÎ¿Ï€Î¿Î¹Î·Ï„Î¹ÎºÏŒ.',
    whyItMatters: 'Î”ÎµÎ½ Ï‡ÏÎµÎ¹Î¬Î¶ÎµÏƒÎ±Î¹ Î³Ï…Î¼Î½Î±ÏƒÏ„Î®ÏÎ¹Î¿ Î® Ï†Î¬ÏÎ¼Î±ÎºÎ±. ÎœÎ¹Î± Î²ÏŒÎ»Ï„Î± ÏƒÏ„Î· Ï†ÏÏƒÎ· ÎºÎ¬Î½ÎµÎ¹ Ï‡Î·Î¼Î¹ÎºÎ® Î´Î¹Î±Ï†Î¿ÏÎ¬.',
    category: { emoji: 'ðŸŒ¿', name: 'Î¦ÏÏƒÎ· & Biophilia' },
    difficulty: 'easy', readTimeSec: 50,
    mood: ['calming', 'inspiring'],
    source: { type: 'paper', title: 'Forest Bathing Enhances Human Natural Killer Activity', author: 'Li et al.', year: 2007, doi: '10.1007/s007640070069' },
  },
  {
    _id: '4',
    title: 'Î¤Î¿ Î£ÏÎ¼Ï€Î±Î½ ÎˆÏ‡ÎµÎ¹ 2 Î¤ÏÎ¹ÏƒÎµÎºÎ±Ï„Î¿Î¼Î¼ÏÏÎ¹Î± Î“Î±Î»Î±Î¾Î¯ÎµÏ‚',
    body: 'Î¤Î¿ 2016, Î±ÏƒÏ„ÏÎ¿Î½ÏŒÎ¼Î¿Î¹ Ï…Ï€Î¿Î»ÏŒÎ³Î¹ÏƒÎ±Î½ ÏŒÏ„Î¹ Ï„Î¿ Ï€Î±ÏÎ±Ï„Î·ÏÎ®ÏƒÎ¹Î¼Î¿ ÏƒÏÎ¼Ï€Î±Î½ Ï€ÎµÏÎ¹Î­Ï‡ÎµÎ¹ Ï„Î¿Ï…Î»Î¬Ï‡Î¹ÏƒÏ„Î¿Î½ 2 Ã— 10Â¹Â² Î³Î±Î»Î±Î¾Î¯ÎµÏ‚ â€” 20 Ï†Î¿ÏÎ­Ï‚ Ï€ÎµÏÎ¹ÏƒÏƒÏŒÏ„ÎµÏÎ¿Ï…Ï‚ Î±Ï€ÏŒ Ï„Î·Î½ Ï€ÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î· ÎµÎºÏ„Î¯Î¼Î·ÏƒÎ·.',
    tldr: 'ÎŸ Î“Î±Î»Î±Î¾Î¯Î±Ï‚ Î¼Î±Ï‚ ÎµÎ¯Î½Î±Î¹ 1 ÏƒÏ„Î± 2.000.000.000.000.',
    whyItMatters: 'Î— ÎºÎ±Ï„Î±Î½ÏŒÎ·ÏƒÎ· Ï„Î·Ï‚ ÎºÎ»Î¯Î¼Î±ÎºÎ±Ï‚ Ï„Î¿Ï… ÏƒÏÎ¼Ï€Î±Î½Ï„Î¿Ï‚ Î¼ÎµÏ„Î±Î²Î¬Î»Î»ÎµÎ¹ Ï„Î¿Î½ Ï„ÏÏŒÏ€Î¿ Ï€Î¿Ï… Î±Î½Ï„Î¹Î¼ÎµÏ„Ï‰Ï€Î¯Î¶Î¿Ï…Î¼Îµ Ï„Î± ÎºÎ±Î¸Î·Î¼ÎµÏÎ¹Î½Î¬ Î¼Î±Ï‚ Ï€ÏÎ¿Î²Î»Î®Î¼Î±Ï„Î±.',
    category: { emoji: 'ðŸŒŒ', name: 'Î£ÏÎ¼Ï€Î±Î½ & ÎšÎ¿ÏƒÎ¼Î¿Î»Î¿Î³Î¯Î±' },
    difficulty: 'medium', readTimeSec: 55,
    mood: ['mind-blowing', 'inspiring'],
    source: { type: 'paper', title: 'Galaxy counts in the deep fields', author: 'Conselice et al.', year: 2016, doi: '10.3847/0004-637X/830/2/83' },
  },
  {
    _id: '5',
    title: 'Î¤Î¿ 90% Ï„Î·Ï‚ Î£ÎµÏÎ¿Ï„Î¿Î½Î¯Î½Î·Ï‚ Î Î±ÏÎ¬Î³ÎµÏ„Î±Î¹ ÏƒÏ„Î¿ ÎˆÎ½Ï„ÎµÏÎ¿',
    body: 'ÎŸ ÎµÎ½Ï„ÎµÏÎ¹ÎºÏŒÏ‚ ÏƒÏ‰Î»Î®Î½Î±Ï‚ Î±Ï€Î¿ÎºÎ±Î»ÎµÎ¯Ï„Î±Î¹ Â«Î´ÎµÏÏ„ÎµÏÎ¿Ï‚ ÎµÎ³ÎºÎ­Ï†Î±Î»Î¿Ï‚Â» Î¼Îµ Î»ÏŒÎ³Î¿: Î­Ï‡ÎµÎ¹ 500 ÎµÎºÎ±Ï„Î¿Î¼Î¼ÏÏÎ¹Î± Î½ÎµÏ…ÏÏŽÎ½ÎµÏ‚ ÎºÎ±Î¹ Ï€Î±ÏÎ¬Î³ÎµÎ¹ Ï„Î¿ 90% Ï„Î·Ï‚ ÏƒÎµÏÎ¿Ï„Î¿Î½Î¯Î½Î·Ï‚ Ï„Î¿Ï… ÏƒÏŽÎ¼Î±Ï„Î¿Ï‚.',
    tldr: 'ÎšÎ±Î»Î® Î´Î¹Î±Ï„ÏÎ¿Ï†Î® = ÎºÎ±Î»ÏÏ„ÎµÏÎ· Î´Î¹Î¬Î¸ÎµÏƒÎ·. Î•Ï€Î¹ÏƒÏ„Î·Î¼Î¿Î½Î¹ÎºÎ¬.',
    whyItMatters: 'Î¤ÏÏŒÏ†Î¹Î¼Î± Ï€Î»Î¿ÏÏƒÎ¹Î± ÏƒÎµ Ï€ÏÎµÎ²Î¹Î¿Ï„Î¹ÎºÎ¬ ÎµÎ½Î¹ÏƒÏ‡ÏÎ¿Ï…Î½ Ï„Î· Î¼Î¹ÎºÏÎ¿Î²Î¹Î¿Î¼Î¬Î¶Î± Ï€Î¿Ï… ÏÏ…Î¸Î¼Î¯Î¶ÎµÎ¹ Ï„Î· ÏƒÎµÏÎ¿Ï„Î¿Î½Î¯Î½Î·.',
    category: { emoji: 'ðŸ§¬', name: 'Î’Î¹Î¿Î»Î¿Î³Î¯Î± & ÎœÎ¹ÎºÏÎ¿Î²Î¯Ï‰Î¼Î±' },
    difficulty: 'medium', readTimeSec: 60,
    mood: ['surprising', 'practical'],
    source: { type: 'paper', title: 'The gut-brain axis', author: 'Cryan & Dinan', year: 2012, doi: '10.1038/nrn3346' },
  },
  {
    _id: '6',
    title: 'ÎŸ ÎŽÏ€Î½Î¿Ï‚ ÎšÎ±Î¸Î±ÏÎ¯Î¶ÎµÎ¹ ÎšÏ…ÏÎ¹Î¿Î»ÎµÎºÏ„Î¹ÎºÎ¬ Ï„Î¿Î½ Î•Î³ÎºÎ­Ï†Î±Î»Î¿',
    body: 'ÎšÎ±Ï„Î¬ Ï„Î· Î´Î¹Î¬ÏÎºÎµÎ¹Î± Ï„Î¿Ï… ÏÏ€Î½Î¿Ï…, Ï„Î¿ Î³Î»Ï…Î¼Ï†Î±Ï„Î¹ÎºÏŒ ÏƒÏÏƒÏ„Î·Î¼Î± ÎµÎ½ÎµÏÎ³Î¿Ï€Î¿Î¹ÎµÎ¯Ï„Î±Î¹ ÎºÎ±Î¹ Â«Î¾ÎµÏ€Î»Î­Î½ÎµÎ¹Â» Ï„Î¿Î¾Î¹ÎºÎ­Ï‚ Ï€ÏÏ‰Ï„ÎµÎÎ½ÎµÏ‚ â€” ÏƒÏ…Î¼Ï€ÎµÏÎ¹Î»Î±Î¼Î²Î±Î½Î¿Î¼Î­Î½Î·Ï‚ Ï„Î·Ï‚ Î²-Î±Î¼Ï…Î»Î¿ÎµÎ¹Î´Î¿ÏÏ‚ Ï€Î¿Ï… ÏƒÏ…Î½Î´Î­ÎµÏ„Î±Î¹ Î¼Îµ Alzheimer. Î— Î­Î»Î»ÎµÎ¹ÏˆÎ· ÏÏ€Î½Î¿Ï… Î´Î¹Ï€Î»Î±ÏƒÎ¹Î¬Î¶ÎµÎ¹ Ï„Î± ÎµÏ€Î¯Ï€ÎµÎ´Î¬ Ï„Î·Ï‚.',
    tldr: '7-9 ÏŽÏÎµÏ‚ ÏÏ€Î½Î¿Ï… = Ï‡Î±Î¼Î·Î»ÏŒÏ„ÎµÏÎ¿Ï‚ ÎºÎ¯Î½Î´Ï…Î½Î¿Ï‚ Alzheimer.',
    whyItMatters: 'ÎŸ ÏÏ€Î½Î¿Ï‚ Î´ÎµÎ½ ÎµÎ¯Î½Î±Î¹ Ï€Î¿Î»Ï…Ï„Î­Î»ÎµÎ¹Î± â€” ÎµÎ¯Î½Î±Î¹ Î· Î¼Î¿Î½Î±Î´Î¹ÎºÎ® Ï†Î¿ÏÎ¬ Ï€Î¿Ï… Î¿ ÎµÎ³ÎºÎ­Ï†Î±Î»Î¿Ï‚ ÎµÏ€Î¹ÏƒÎºÎµÏ…Î¬Î¶ÎµÏ„Î±Î¹.',
    category: { emoji: 'ðŸŽ', name: 'Î¥Î³ÎµÎ¯Î± & Longevity' },
    difficulty: 'easy', readTimeSec: 50,
    mood: ['surprising', 'practical'],
    source: { type: 'book', title: 'Why We Sleep', author: 'Matthew Walker', year: 2017, publisher: 'Scribner' },
  },
  {
    _id: '7',
    title: 'Amor Fati â€” Î‘Î³Î¬Ï€Î± Ï„Î·Î½ Î¤ÏÏ‡Î· ÏƒÎ¿Ï…',
    body: 'ÎŸ ÎœÎ¬ÏÎºÎ¿Ï‚ Î‘Ï…ÏÎ®Î»Î¹Î¿Ï‚ Î­Î³ÏÎ±Ï†Îµ: Â«ÎÎ± Î¼Î·Î½ ÎµÏ€Î¹Î¸Ï…Î¼ÎµÎ¯Ï‚ Ï„Î± Ï€ÏÎ¬Î³Î¼Î±Ï„Î± Î½Î± Î³Î¯Î½Î¿Î½Ï„Î±Î¹ ÏŒÏ€Ï‰Ï‚ Î¸Î­Î»ÎµÎ¹Ï‚, Î±Î»Î»Î¬ Î½Î± Î¸Î­Î»ÎµÎ¹Ï‚ Ï„Î± Ï€ÏÎ¬Î³Î¼Î±Ï„Î± Î½Î± Î³Î¯Î½Î¿Î½Ï„Î±Î¹ ÏŒÏ€Ï‰Ï‚ ÎµÎ¯Î½Î±Î¹.Â»',
    tldr: 'Î‘Ï€Î¿Î´Î­Î¾Î¿Ï… Î±Ï…Ï„ÏŒ Ï€Î¿Ï… Î´ÎµÎ½ ÎµÎ»Î­Î³Ï‡ÎµÎ¹Ï‚. Î†Î»Î»Î±Î¾Îµ Î±Ï…Ï„ÏŒ Ï€Î¿Ï… ÎµÎ»Î­Î³Ï‡ÎµÎ¹Ï‚.',
    whyItMatters: 'Î— Î£Ï„Ï‰Î¹ÎºÎ® Ï€ÏÎ±ÎºÏ„Î¹ÎºÎ® Î¼ÎµÎ¹ÏŽÎ½ÎµÎ¹ Ï„Î¿ Î¬Î³Ï‡Î¿Ï‚ ÎºÎ±Ï„Î¬ Î¼Î­ÏƒÎ¿ ÏŒÏÎ¿ 31%.',
    category: { emoji: 'ðŸ›ï¸', name: 'Î¦Î¹Î»Î¿ÏƒÎ¿Ï†Î¯Î± & Î£Ï„Ï‰Î¹ÎºÎ¹ÏƒÎ¼ÏŒÏ‚' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['calming', 'inspiring'],
    source: { type: 'book', title: 'Meditations', author: 'Marcus Aurelius', year: 161, publisher: 'Penguin Classics' },
  },
  {
    _id: '8',
    title: 'Î§Ï„Î±Ï€ÏŒÎ´Î¹Î± Â«Î’Î»Î­Ï€Î¿Ï…Î½Â» Î§ÏÏŽÎ¼Î±Ï„Î± ÎœÎµ Î Î»ÎµÏ…ÏÎ¹ÎºÎ¿ÏÏ‚ Î¥Ï€Î¿Î´Î¿Ï‡ÎµÎ¯Ï‚',
    body: 'Î¤Î± Ï‡Ï„Î±Ï€ÏŒÎ´Î¹Î± ÎµÎ¯Î½Î±Î¹ Ï‡ÏÏ‰Î¼Î±Ï„Î¿Ï„Ï…Ï†Î»Î¬ Î±Î»Î»Î¬ Î±Î½Ï„Î¹Î»Î±Î¼Î²Î¬Î½Î¿Î½Ï„Î±Î¹ Ï‡ÏÏŽÎ¼Î± Î¼Î­ÏƒÏ‰ ÎµÎ¹Î´Î¹ÎºÏŽÎ½ Ï…Ï€Î¿Î´Î¿Ï‡Î­Ï‰Î½ ÏƒÏ„Î¿ Î´Î­ÏÎ¼Î± Ï„Î¿Ï…Ï‚ â€” Ï€Î¹Î¸Î±Î½ÏŽÏ‚ Â«Î²Î»Î­Ï€Î¿Ï…Î½Â» Ï‡ÏÏŽÎ¼Î± Î¿Î»ÏŒÎºÎ»Î·ÏÎ¿Ï… Ï„Î¿Ï… ÏƒÏŽÎ¼Î±Ï„Î¿Ï‚ Ï€Î±ÏÎ±ÎºÎ¬Î¼Ï€Ï„Î¿Î½Ï„Î±Ï‚ Ï„Î± Î¼Î¬Ï„Î¹Î±.',
    tldr: 'Î§Ï„Î±Ï€ÏŒÎ´Î¹Î± Î²Î»Î­Ï€Î¿Ï…Î½ Ï‡ÏÏŽÎ¼Î± Î¼Îµ Ï„Î¿ Î´Î­ÏÎ¼Î± Ï„Î¿Ï…Ï‚.',
    whyItMatters: 'Î— Î½Î¿Î·Î¼Î¿ÏƒÏÎ½Î· Î¼Ï€Î¿ÏÎµÎ¯ Î½Î± ÎµÎ¾ÎµÎ»Î¹Ï‡Î¸ÎµÎ¯ Î¼Îµ Ï„ÏÏŒÏ€Î¿Ï…Ï‚ ÎµÎ½Ï„ÎµÎ»ÏŽÏ‚ Î´Î¹Î±Ï†Î¿ÏÎµÏ„Î¹ÎºÎ¿ÏÏ‚ Î±Ï€ÏŒ Ï„Î¿Î½ Î±Î½Î¸ÏÏŽÏ€Î¹Î½Î¿.',
    category: { emoji: 'ðŸ¦', name: 'Î†Î³ÏÎ¹Î± Î¦ÏÏƒÎ· & Î–Ï‰Î¿Î»Î¿Î³Î¯Î±' },
    difficulty: 'medium', readTimeSec: 40,
    mood: ['surprising', 'mind-blowing'],
    source: { type: 'paper', title: 'Opsins in Octopus bimaculoides skin', author: 'Ramirez & Oakley', year: 2015, doi: '10.1098/rsbl.2015.0153' },
  },
  {
    _id: '9',
    title: 'ÎŸ ÎšÎ±Î½ÏŒÎ½Î±Ï‚ Ï„Ï‰Î½ 2 Î›ÎµÏ€Ï„ÏŽÎ½',
    body: 'Î‘Î½ Î¼Î¹Î± ÎµÏÎ³Î±ÏƒÎ¯Î± Ï‡ÏÎµÎ¹Î¬Î¶ÎµÏ„Î±Î¹ Î»Î¹Î³ÏŒÏ„ÎµÏÎ¿ Î±Ï€ÏŒ 2 Î»ÎµÏ€Ï„Î¬ â€” ÎºÎ¬Î½Îµ Ï„Î·Î½ Ï„ÏŽÏÎ±. Î— ÏˆÏ…Ï‡Î¹ÎºÎ® ÎµÎ½Î­ÏÎ³ÎµÎ¹Î± Ï€Î¿Ï… Î¾Î¿Î´ÎµÏÎ¿Ï…Î¼Îµ Î³Î¹Î± Î½Î± Â«Î¸Ï…Î¼ÏŒÎ¼Î±ÏƒÏ„ÎµÂ» Î¼Î¹Î± Î¼Î¹ÎºÏÎ® ÎµÏÎ³Î±ÏƒÎ¯Î± ÎµÎ¯Î½Î±Î¹ Ï€Î¿Î»Î»Î±Ï€Î»Î¬ÏƒÎ¹Î± Î±Ï€ÏŒ Î±Ï…Ï„Î® Ï€Î¿Ï… ÎºÎ¿ÏƒÏ„Î¯Î¶ÎµÎ¹ Î· ÎµÎºÏ„Î­Î»ÎµÏƒÎ® Ï„Î·Ï‚.',
    tldr: 'ÎšÎ¬Ï„Ï‰ Î±Ï€ÏŒ 2 Î»ÎµÏ€Ï„Î¬; ÎšÎ¬Î½Îµ Ï„Î¿ Ï„ÏŽÏÎ±.',
    whyItMatters: 'ÎœÎµÎ¹ÏŽÎ½ÎµÎ¹ Ï„Î·Î½ Â«Î±Î½Î¿Î¹Ï‡Ï„Î® Î»Î¿ÏÏ€Î±Â» ÏƒÏ„Î¿ Î¼Ï…Î±Î»ÏŒ â€” Ï„Î¿ ÎºÏŒÏƒÏ„Î¿Ï‚ Î½Î± ÎºÏÎ±Ï„Î¬Ï‚ ÎµÎºÎºÏÎµÎ¼ÏŒÏ„Î·Ï„ÎµÏ‚ ÏƒÏ„Î· Î¼Î½Î®Î¼Î·.',
    category: { emoji: 'ðŸ’ª', name: 'Self-Improvement' },
    difficulty: 'easy', readTimeSec: 35,
    mood: ['practical', 'motivating'],
    source: { type: 'book', title: 'Getting Things Done', author: 'David Allen', year: 2001, publisher: 'Penguin Books' },
  },
  {
    _id: '10',
    title: 'Î‘Î½Î±Ï„Î¿ÎºÎ¹ÏƒÎ¼ÏŒÏ‚: Î¤Î¿ 8Î¿ Î˜Î±ÏÎ¼Î± Ï„Î¿Ï… ÎšÏŒÏƒÎ¼Î¿Ï…',
    body: 'â‚¬1.000 Î¼Îµ 7% ÎµÏ„Î®ÏƒÎ¹Î¿ ÎµÏ€Î¹Ï„ÏŒÎºÎ¹Î¿ Î³Î¯Î½Î¿Î½Ï„Î±Î¹ â‚¬7.612 ÏƒÎµ 30 Ï‡ÏÏŒÎ½Î¹Î± Ï‡Ï‰ÏÎ¯Ï‚ Î½Î± ÎºÎ¬Î½ÎµÎ¹Ï‚ Ï„Î¯Ï€Î¿Ï„Î±. Î¤Î¿ Ï€Î±ÏÎ¬Î´Î¿Î¾Î¿ Ï„Î¿Ï… Î±Î½Î±Ï„Î¿ÎºÎ¹ÏƒÎ¼Î¿Ï ÎµÎ¯Î½Î±Î¹ ÏŒÏ„Î¹ Î¿ Ï‡ÏÏŒÎ½Î¿Ï‚ ÎºÎ¬Î½ÎµÎ¹ Ï€ÎµÏÎ¹ÏƒÏƒÏŒÏ„ÎµÏÎ· Î´Î¿Ï…Î»ÎµÎ¹Î¬ Î±Ï€ÏŒ Ï„Î¿ ÎºÎµÏ†Î¬Î»Î±Î¹Î¿.',
    tldr: 'ÎžÎµÎºÎ¯Î½Î± Î½Î± Î±Ï€Î¿Ï„Î±Î¼Î¹ÎµÏÎµÎ¹Ï‚ Î½Ï‰ÏÎ¯Ï‚. ÎŸ Ï‡ÏÏŒÎ½Î¿Ï‚ ÎµÎ¯Î½Î±Î¹ Ï„Î¿ Ï€Î¹Î¿ Î¹ÏƒÏ‡Ï…ÏÏŒ ÎµÏÎ³Î±Î»ÎµÎ¯Î¿.',
    whyItMatters: 'â‚¬100/Î¼Î®Î½Î± Î±Ï€ÏŒ Ï„Î± 25 > â‚¬500/Î¼Î®Î½Î± Î±Ï€ÏŒ Ï„Î± 45, Î»ÏŒÎ³Ï‰ Î±Î½Î±Ï„Î¿ÎºÎ¹ÏƒÎ¼Î¿Ï.',
    category: { emoji: 'ðŸ’°', name: 'ÎŸÎ¹ÎºÎ¿Î½Î¿Î¼Î¹ÎºÏŒÏ‚ Î‘Î»Ï†Î±Î²Î·Ï„Î¹ÏƒÎ¼ÏŒÏ‚' },
    difficulty: 'easy', readTimeSec: 45,
    mood: ['practical', 'mind-blowing'],
    source: { type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', year: 2020, publisher: 'Harriman House' },
  },
]

const SWIPE_OFFSET   = 100
const SWIPE_VELOCITY = 500

function formatDate(date, lang = 'el') {
  return date.toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8)
}

// â”€â”€ Deck card: one component for every depth so promotion from the stack to
// the top is a prop change (smooth spring), never a remount (blink).
// Rotation is always derived from x â€” it follows every horizontal travel
// (drag, fly-out, fly-in, demote) automatically, with no snapping.
function DeckCard({ depth, isTop, canGoBack, onNext, onBack, reduceMotion, enterFromLeft, children }) {
  const x = useMotionValue(0)
  const rotate      = useTransform(x, [-300, 300], [-13, 13])
  const nextStamp   = useTransform(x, [-130, -36], [1, 0])
  const backStamp   = useTransform(x, [36, 130], [0, 1])
  const nextScale   = useTransform(x, [-130, -36], [1, 0.7])
  const backScale   = useTransform(x, [36, 130], [0.7, 1])

  function handleDragEnd(_, info) {
    const { offset, velocity } = info
    if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) {
      haptic()
      onNext()
    } else if (canGoBack && (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY)) {
      haptic()
      onBack()
    }
  }

  return (
    <motion.div
      className={`mf-deck__card${isTop ? ' mf-deck__card--top' : ''}`}
      style={{
        x,
        rotate: reduceMotion ? 0 : rotate,
        zIndex: 3 - depth,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      initial={
        isTop && enterFromLeft
          // Mirror of the exit: same distance, same fade â€” rotation follows x
          ? { ...deckSlot(0), x: reduceMotion ? 0 : -deckFlyX(), opacity: 0 }
          : { ...deckSlot(depth + 1), opacity: 0 }
      }
      animate={{ x: 0, ...deckSlot(depth) }}
      exit={
        isTop
          ? {
              x: reduceMotion ? 0 : -deckFlyX(),
              opacity: 0,
              transition: deckTravel,
            }
          : { opacity: 0, transition: { duration: 0.15 } }
      }
      transition={{
        ...deckSpring,
        x: deckTravel,
        opacity: deckTravel,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragDirectionLock
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      aria-hidden={!isTop}
    >
      {/* Swipe stamps â€” opacity rides on x, so they fade on any travel */}
      <motion.div
        className="mf-stamp mf-stamp--next"
        style={{ opacity: nextStamp, scale: nextScale }}
        aria-hidden
      >âœ“</motion.div>
      <motion.div
        className="mf-stamp mf-stamp--back"
        style={{ opacity: canGoBack ? backStamp : 0, scale: backScale }}
        aria-hidden
      >â†©</motion.div>
      {children}
    </motion.div>
  )
}

export default function Feed({ demo = false, onBookmarks }) {
  const { logout } = useAuth()
  const { lang }   = useLang()
  const t          = useT()
  const reduceMotion = useReducedMotion()

  const [cards, setCards]       = useState(() => (demo ? MOCK_CARDS : []))
  const [loading, setLoading]   = useState(!demo)
  const [slowLoad, setSlowLoad] = useState(false)
  const [error, setError]       = useState(false)
  const [index, setIndex]       = useState(0)
  const [lastDir, setLastDir]   = useState(1)   // 1 = forward, -1 = back
  const [savedIds, setSavedIds] = useState(new Set())
  const [done, setDone]         = useState(false)
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('mf_swiped'))
  const completedRef = useRef(new Set())

  const load = useCallback(async () => {
    if (demo) return
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000)
    try {
      const [feedData, bookmarks] = await Promise.all([
        api.get(`/api/feed/today?date=${localDate()}`),
        api.get('/api/users/bookmarks').catch(() => []),
      ])
      const entries   = feedData.cards || []
      const feedCards = entries.map(fc => fc.card).filter(Boolean)
      if (!feedCards.length) throw new Error('Empty feed')

      entries.forEach(fc => {
        if (fc.isCompleted && fc.card) completedRef.current.add(fc.card._id)
      })
      const firstOpen = entries.findIndex(fc => !fc.isCompleted)

      setCards(feedCards)
      setSavedIds(new Set((bookmarks || []).map(b => b._id)))
      if (firstOpen === -1) setDone(true)
      else setIndex(firstOpen)
    } catch {
      setError(true)
    } finally {
      clearTimeout(slowTimer)
      setSlowLoad(false)
      setLoading(false)
    }
  }, [demo])

  // Fetch-on-mount: every setState in load() runs after an await, so it
  // cannot cascade renders â€” the rule can't see through the async boundary.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const total   = cards.length

  const markCompleted = useCallback((card) => {
    if (demo || !card || completedRef.current.has(card._id)) return
    completedRef.current.add(card._id)
    api.patch(`/api/feed/complete/${card._id}?date=${localDate()}`).catch(() => {
      completedRef.current.delete(card._id)
    })
  }, [demo])

  const goNext = useCallback(() => {
    markCompleted(cards[index])
    if (showHint) { setShowHint(false); localStorage.setItem('mf_swiped', '1') }
    setLastDir(1)
    if (index >= total - 1) { setDone(true); return }
    setIndex(i => i + 1)
  }, [index, total, cards, markCompleted, showHint])

  const goBack = useCallback(() => {
    if (index === 0) return
    setLastDir(-1)
    setIndex(i => i - 1)
  }, [index])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goBack])

  function toggleSave(id) {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    if (!demo) {
      api.post(`/api/users/bookmark/${id}`).catch(console.error)
    }
  }

  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0

  if (loading) {
    return (
      <div className="mf-feed mf-feed--loading">
        <div className="mf-skeleton" />
        {slowLoad && <p className="mf-loading-hint">{t('feed.loading.slow')}</p>}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mf-feed mf-feed--loading">
        <motion.div
          className="mf-error"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mf-error__icon">ðŸ“¡</div>
          <h2 className="mf-error__title">{t('feed.error.title')}</h2>
          <p className="mf-error__sub">{t('feed.error.sub')}</p>
          <button
            className="mf-error__retry"
            onClick={() => { setError(false); setLoading(true); load() }}
          >
            {t('feed.retry')}
          </button>
        </motion.div>
      </div>
    )
  }

  if (done) {
    const nounKey = savedIds.size === 1 ? 'feed.done.noun.one' : 'feed.done.noun.many'
    return (
      <div className="mf-feed">
        <motion.div
          className="mf-done"
          variants={fadeUpStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="mf-done__icon"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          >âœ…</motion.div>
          <div className="mf-done__confetti" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="mf-confetti-piece" style={{ '--i': i }} />
            ))}
          </div>
          <motion.h1 className="mf-done__title" variants={fadeUpItem}>{t('feed.done.title')}</motion.h1>
          <motion.p className="mf-done__sub" variants={fadeUpItem}>
            {savedIds.size > 0
              ? t('feed.done.sub.saved', { count: savedIds.size, noun: t(nounKey) })
              : t('feed.done.sub.read')}
          </motion.p>
          <motion.p className="mf-done__date" variants={fadeUpItem}>{t('feed.done.return')}</motion.p>
          <motion.button
            className="mf-done__restart"
            variants={fadeUpItem}
            onClick={() => { setIndex(0); setDone(false); setLastDir(-1) }}
          >
            {t('feed.done.restart')}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const visible = cards.slice(index, index + 3)

  return (
    <div className="mf-feed">
      <header className="mf-feed__header">
        <span className="mf-feed__logo">ðŸ§  MindFeed</span>
        <span className="mf-feed__date">{formatDate(new Date(), lang)}</span>
        <div className="mf-feed__header-right">
          <span className="mf-feed__counter" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={index}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                style={{ display: 'inline-block' }}
              >
                {index + 1}
              </motion.span>
            </AnimatePresence>
            /{total}
          </span>
          {onBookmarks && (
            <button
              className="mf-feed__bookmark-btn"
              onClick={onBookmarks}
              aria-label={t('nav.bookmarks')}
              title={t('nav.bookmarks')}
            >
              ðŸ”–
            </button>
          )}
          {!demo && logout && (
            <button className="mf-feed__logout" onClick={logout} aria-label={t('nav.logout')}>
              â†©
            </button>
          )}
        </div>
      </header>

      <div className="mf-feed__progress-wrap">
        <motion.div
          className="mf-feed__progress-bar"
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <main className="mf-feed__main">
        {/* Keyboard hint for desktop â€” only shown once */}
        <div className="mf-feed__deck-wrap">
        <div className="mf-deck">
          <AnimatePresence initial={false}>
            {visible.map((card, depth) => (
              <DeckCard
                key={card._id}
                depth={depth}
                isTop={depth === 0}
                canGoBack={index > 0}
                onNext={goNext}
                onBack={goBack}
                reduceMotion={reduceMotion}
                enterFromLeft={lastDir === -1}
              >
                <Card
                  card={card}
                  isSaved={savedIds.has(card._id)}
                  onSave={depth === 0 ? toggleSave : undefined}
                />
              </DeckCard>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showHint && (
              <motion.div
                className="mf-swipe-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.span
                  className="mf-swipe-hint__arrow"
                  animate={reduceMotion ? {} : { x: [-2, -14, -2] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >â†</motion.span>
                {t('feed.swipe_hint')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        </div>{/* end mf-feed__deck-wrap */}

        {/* Dots only â€” navigation is swipe or â† â†’ keyboard arrows */}
        <div className="mf-feed__dots" role="tablist" aria-label="Card progress">
          {cards.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === index}
              className={`mf-dot${i === index ? ' mf-dot--active' : i < index ? ' mf-dot--done' : ''}`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

