import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from './Card'
import Icon, { CategoryIcon } from './Icon'
import { api } from '../api/client'
import { useT } from '../i18n/useT'
import { fadeUpStagger, fadeUpItem } from '../motion/variants'
import './BookmarksScreen.css'

function readTime(sec) {
  if (!sec) return null
  return sec < 60 ? `${sec}s` : `${Math.round(sec / 60)}m`
}

export default function BookmarksScreen({ onBack }) {
  const t = useT()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    api.get('/api/users/bookmarks')
      .then(data => setBookmarks(data || []))
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false))
  }, [])

  function removeBookmark(cardId) {
    api.delete(`/api/users/bookmarks/${cardId}`).catch(console.error)
    setBookmarks(prev => prev.filter(c => c._id !== cardId))
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
            onSave={removeBookmark}
          />
        </main>
      </div>
    )
  }

  // ── List view ───────────────────────────────────────────────────────────────
  const countKey = bookmarks.length === 1 ? 'bookmarks.count.one' : 'bookmarks.count.many'

  return (
    <div className="mf-bookmarks">
      <header className="mf-bookmarks__header">
        <button className="mf-bookmarks__back-btn" onClick={onBack}>
          <Icon name="chevron-left" size={14} /> {t('nav.back')}
        </button>
        <h1 className="mf-bookmarks__title">{t('bookmarks.title')}</h1>
        {bookmarks.length > 0 && (
          <span className="mf-bookmarks__count">
            {t(countKey, { count: bookmarks.length })}
          </span>
        )}
      </header>

      {loading ? (
        <div className="mf-bookmarks__skeleton" />
      ) : bookmarks.length === 0 ? (
        <div className="mf-bookmarks__empty">
          <p>{t('bookmarks.empty')}</p>
        </div>
      ) : (
        <motion.ul
          className="mf-bookmarks__list"
          variants={fadeUpStagger}
          initial="hidden"
          animate="show"
        >
          {bookmarks.map(card => (
            <motion.li key={card._id} className="mf-bookmarks__item" variants={fadeUpItem}>
              <button
                className="mf-bookmarks__row"
                onClick={() => setSelected(card)}
              >
                <span className="mf-bookmarks__cat-icon"><CategoryIcon category={card.category} size={17} /></span>
                <div className="mf-bookmarks__info">
                  <span className="mf-bookmarks__item-title">{card.title}</span>
                  <span className="mf-bookmarks__item-meta">
                    {card.category?.name}
                    {card.difficulty && ` · ${t(`card.difficulty.${card.difficulty}`)}`}
                    {card.readTimeSec && ` · ${readTime(card.readTimeSec)}`}
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
        </motion.ul>
      )}
    </div>
  )
}
