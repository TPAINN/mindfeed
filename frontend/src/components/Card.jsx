import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '../i18n/useT'
import VideoPlayer from './VideoPlayer'
import './Card.css'

const MOOD_LABELS = {
  inspiring: '✨ Εμπνευστικό',
  surprising: '😲 Εκπληκτικό',
  calming: '🌿 Ηρεμιστικό',
  motivating: '💪 Κινητοποιητικό',
  'mind-blowing': '🤯 Εντυπωσιακό',
  practical: '🔧 Πρακτικό',
}

const SOURCE_TYPE_LABELS = {
  paper: 'Επιστημονική Έρευνα',
  book: 'Βιβλίο',
  documentary: 'Ντοκιμαντέρ',
  website: 'Ιστοσελίδα',
  nasa: 'NASA',
  pubmed: 'PubMed',
  arxiv: 'arXiv',
}

function formatReadTime(sec) {
  if (!sec) return null
  if (sec < 60) return `${sec}δλ`
  return `${Math.round(sec / 60)}λ`
}

export default function Card({ card, isSaved = false, onSave }) {
  const t = useT()
  const [tldrOpen, setTldrOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)

  const category = card.category
  const categoryEmoji = typeof category === 'object' ? category?.emoji : '📖'
  const categoryName = typeof category === 'object' ? category?.name : ''

  const sourceUrl = card.source?.url || (card.source?.doi ? `https://doi.org/${card.source.doi}` : null)

  return (
    <article className="mf-card" aria-label={card.title}>
      <header className="mf-card__header">
        <div className="mf-card__meta">
          <span className="mf-card__category">
            {categoryEmoji}
            {categoryName && <span className="mf-card__category-name">{categoryName}</span>}
          </span>
          <div className="mf-card__badges">
            {card.difficulty && (
              <span className={`mf-badge mf-badge--${card.difficulty}`}>
                {t(`card.difficulty.${card.difficulty}`)}
              </span>
            )}
            {card.readTimeSec && (
              <span className="mf-badge mf-badge--time">
                ⏱ {formatReadTime(card.readTimeSec)}
              </span>
            )}
          </div>
        </div>
        <h2 className="mf-card__title">{card.title}</h2>
      </header>

      {card.imageUrl && (
        <div className="mf-card__image-wrap">
          <img
            src={card.imageUrl}
            alt={card.imageAlt || card.title}
            className="mf-card__image"
            loading="lazy"
          />
        </div>
      )}

      <div className="mf-card__body">
        <p className="mf-card__text">{card.body}</p>
      </div>

      {card.videoUrl && (
        <div className="mf-card__section">
          <button
            className="mf-card__toggle mf-card__toggle--video"
            onClick={() => setVideoOpen(o => !o)}
            aria-expanded={videoOpen}
          >
            <span>{t('card.video_label')}</span>
            <span className="mf-card__toggle-icon">{videoOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {videoOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <VideoPlayer
                  videoUrl={card.videoUrl}
                  videoType={card.videoType}
                  thumbnailUrl={card.videoThumbnailUrl}
                  title={card.title}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {card.tldr && (
        <div className="mf-card__section">
          <button
            className="mf-card__toggle"
            onClick={() => setTldrOpen(o => !o)}
            aria-expanded={tldrOpen}
          >
            <span>{t('card.tldr_label')}</span>
            <span className="mf-card__toggle-icon">{tldrOpen ? '▲' : '▼'}</span>
          </button>
          {tldrOpen && <p className="mf-card__tldr">{card.tldr}</p>}
        </div>
      )}

      {card.whyItMatters && (
        <div className="mf-card__why">
          <span className="mf-card__why-label">💡 {t('card.why_label')}</span>
          <p className="mf-card__why-text">{card.whyItMatters}</p>
        </div>
      )}

      {card.mood?.length > 0 && (
        <div className="mf-card__moods">
          {card.mood.map(m => (
            <span key={m} className="mf-mood-chip">{MOOD_LABELS[m] ?? m}</span>
          ))}
        </div>
      )}

      <footer className="mf-card__footer">
        <div className="mf-card__actions">
          <button
            className={`mf-card__save-btn${isSaved ? ' mf-card__save-btn--saved' : ''}`}
            onClick={() => onSave?.(card._id)}
            aria-label={isSaved ? t('card.saved') : t('card.save')}
          >
            {isSaved ? t('card.saved') : t('card.save')}
          </button>

          <button
            className="mf-card__source-btn"
            onClick={() => setSourceOpen(o => !o)}
            aria-expanded={sourceOpen}
          >
            {t('card.source')}
          </button>
        </div>

        {sourceOpen && card.source && (
          <div className="mf-card__source">
            <span className="mf-card__source-type">
              {SOURCE_TYPE_LABELS[card.source.type] ?? card.source.type}
            </span>
            <strong className="mf-card__source-title">{card.source.title}</strong>
            {card.source.author && (
              <span className="mf-card__source-author">{card.source.author}</span>
            )}
            {card.source.year && (
              <span className="mf-card__source-year">{card.source.year}</span>
            )}
            {card.source.publisher && (
              <span className="mf-card__source-publisher">{card.source.publisher}</span>
            )}
            {sourceUrl && (
              <a
                className="mf-card__source-link"
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card.source.doi ? `DOI: ${card.source.doi}` : t('card.source_link')}
              </a>
            )}
          </div>
        )}

      </footer>
    </article>
  )
}
