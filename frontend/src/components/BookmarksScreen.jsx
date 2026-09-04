import { useState } from 'react'
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
  const { savedCards, ready, removeSaved } = useBookmarks()
  const [selected, setSelected] = useState(null)

  function removeBookmark(cardId) {
    removeSaved(cardId)
    if (selected?._id === cardId) setSelected(null)
  }

  // ── Full card view ──────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="mf-bookmarks">
        <header className="mf-bookmarks__header">
          <button className="mf-bookmarks__back-btn" onClick={() => setSelected(null)}>
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
        <h1 className="mf-bookmarks__title">{t('bookmarks.title')}</h1>
        {savedCards.length > 0 && (
          <span className="mf-bookmarks__count">
            {t(countKey, { count: savedCards.length })}
          </span>
        )}
      </header>

      {!ready ? (
        <div className="mf-bookmarks__skeleton" />
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
                  onClick={() => setSelected(card)}
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
