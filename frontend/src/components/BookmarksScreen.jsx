import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Card from './Card'
import Icon, { CategoryIcon } from './Icon'
import { useBookmarks } from '../context/BookmarkContext'
import { useT } from '../i18n/useT'
import { localizeCard, categoryLabel } from '../i18n/cardLocale'
import { useLang } from '../context/LangContext'
import { fadeUpStagger, fadeUpItem } from '../motion/variants'
import './BookmarksScreen.css'

function readTime(sec, t) {
  if (!sec) return null
  if (sec < 60) return t('card.read.sec', { n: Math.round(sec) })
  return t('card.read.min', { n: Math.round(sec / 60) })
}

export default function BookmarksScreen({ onBack }) {
  const t = useT()
  const { lang } = useLang()
  const { savedCards, ready, error, retry, removeSaved } = useBookmarks()
  const [selected, setSelected] = useState(null)
  const headingRef = useRef(null)
  const detailBackRef = useRef(null)
  const rowRefs = useRef(new Map())
  const returnToRef = useRef(null)

  useEffect(() => {
    const target = selected ? detailBackRef.current
      : rowRefs.current.get(returnToRef.current) || headingRef.current
    target?.focus({ preventScroll: true })
  }, [selected])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      if (selected) setSelected(null)
      else onBack?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, onBack])

  async function removeBookmark(cardId) {
    if (!await removeSaved(cardId)) return
    if (selected?._id === cardId) setSelected(null)
    else headingRef.current?.focus({ preventScroll: true })
  }

  // ── Full card view ──────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="mf-bookmarks">
        <header className="mf-bookmarks__header">
          <button ref={detailBackRef} className="mf-bookmarks__back-btn" onClick={() => setSelected(null)}>
            <Icon name="chevron-left" size={14} /> {t('nav.back')}
          </button>
        </header>
        <main className="mf-bookmarks__card-view">
          <Card
            card={selected}
            isSaved={true}
            onSave={(card) => removeBookmark(card._id)}
          />
        </main>
      </div>
    )
  }

  // ── List view ───────────────────────────────────────────────────────────────
  const countKey = savedCards.length === 1 ? 'bookmarks.count.one' : 'bookmarks.count.many'

  return (
    <div className="mf-bookmarks">
      <header className="mf-bookmarks__header">
        <button className="mf-bookmarks__back-btn" onClick={onBack}>
          <Icon name="chevron-left" size={14} /> {t('nav.back')}
        </button>
        <h1 ref={headingRef} tabIndex={-1} className="mf-bookmarks__title">{t('bookmarks.title')}</h1>
        {savedCards.length > 0 && (
          <span className="mf-bookmarks__count">
            {t(countKey, { count: savedCards.length })}
          </span>
        )}
      </header>

      {!ready ? (
        <div className="mf-bookmarks__skeleton" role="status" aria-live="polite">
          <span className="sr-only">{t('auth.loading')}</span>
        </div>
      ) : error ? (
        <div className="mf-bookmarks__empty" role="alert">
          <p>{t('auth.error.network')}</p>
          <button className="mf-bookmarks__empty-cta" onClick={retry}>{t('feed.retry')}</button>
        </div>
      ) : savedCards.length === 0 ? (
        <motion.div
          className="mf-bookmarks__empty"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mf-bookmarks__empty-icon"><Icon name="bookmark" size={26} /></span>
          <p>{t('bookmarks.empty')}</p>
          <button className="mf-bookmarks__empty-cta" onClick={onBack}>
            {t('nav.back')}
          </button>
        </motion.div>
      ) : (
        <motion.ul
          className="mf-bookmarks__list"
          variants={fadeUpStagger}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence initial={false}>
            {savedCards.map(card => (
              <motion.li
                key={card._id}
                className="mf-bookmarks__item"
                variants={fadeUpItem}
                layout
                exit={{ opacity: 0, x: -28, transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
              >
                <button
                  className="mf-bookmarks__row"
                  ref={node => {
                    if (node) rowRefs.current.set(card._id, node)
                    else rowRefs.current.delete(card._id)
                  }}
                  onClick={() => { returnToRef.current = card._id; setSelected(card) }}
                >
                  <span className="mf-bookmarks__cat-icon"><CategoryIcon category={card.category} size={17} /></span>
                  <div className="mf-bookmarks__info">
                    <span className="mf-bookmarks__item-title">{localizeCard(card, lang).title}</span>
                    <span className="mf-bookmarks__item-meta">
                      {[categoryLabel(card.category, t), card.readTimeSec && readTime(card.readTimeSec, t)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                </button>
                <button
                  className="mf-bookmarks__remove-btn"
                  onClick={() => removeBookmark(card._id)}
                  aria-label={t('bookmarks.remove')}
                  title={t('bookmarks.remove')}
                >
                  <Icon name="x" size={13} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
