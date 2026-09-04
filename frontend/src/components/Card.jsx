import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animate } from 'animejs'
import { useT } from '../i18n/useT'
import { useLocalizedCard } from '../i18n/cardLocale'
import VideoPlayer from './VideoPlayer'
import Icon, { CategoryIcon } from './Icon'
import './Card.css'

function formatReadTime(sec, t) {
  if (!sec) return null
  if (sec < 60) return t('card.read.sec', { n: Math.round(sec) })
  return t('card.read.min', { n: Math.round(sec / 60) })
}

/* Shared expand/collapse — height auto-animates, content fades. */
const expand = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit:    { opacity: 0, height: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
}

export default function Card({
  card,
  isSaved = false,
  onSave,
  onScrollTop,
  scrollRestoreTop = 0,
}) {
  const t = useT()
  const { card: L, categoryName } = useLocalizedCard(card)
  const [tldrOpen, setTldrOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)
  const [scrollMore, setScrollMore] = useState(false)
  const scrollRef = useRef(null)
  const saveRingRef = useRef(null)
  const prevSavedRef = useRef(isSaved)
  const firstSavedRunRef = useRef(true)

  const category = typeof card.category === 'object' ? card.category : null

  const sourceUrl = card.source?.url || (card.source?.doi ? `https://doi.org/${card.source.doi}` : null)

  /* ── "More content below" cue ─────────────────────────────────────────────
     Cards are height-capped inside the deck and their scrollbars are hidden;
     without a cue users never realise long bodies continue. The gradient +
     label appear only while content actually overflows and isn't at the end. */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const over = el.scrollHeight - el.clientHeight
      setScrollMore(over > 1 && el.scrollTop < over - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [card._id])

  /* Restore the scroll position from the last time this card was shown (only
     relevant inside the swipe deck, where only three cards stay mounted). */
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !scrollRestoreTop) return
    const timer = setTimeout(() => {
      el.scrollTop = scrollRestoreTop
      // Refresh the "more content" cue after the jump.
      el.dispatchEvent(new Event('scroll'))
    }, 380)
    return () => clearTimeout(timer)
  }, [scrollRestoreTop, card._id])

  function handleScroll(e) {
    onScrollTop?.(card._id, e.currentTarget.scrollTop)
  }

  /* Micro-detail: a soft ring bursts from the bookmark icon the moment a card
     becomes saved (anime.js) — feedback without a layout move. Cards that
     mount already-saved don't burst. */
  useEffect(() => {
    if (firstSavedRunRef.current) {
      firstSavedRunRef.current = false
      prevSavedRef.current = isSaved
      return
    }
    const justSaved = isSaved && !prevSavedRef.current
    prevSavedRef.current = isSaved
    if (justSaved && saveRingRef.current) {
      animate(saveRingRef.current, {
        scale: [0.35, 1.9],
        opacity: [0.85, 0],
        duration: 620,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      })
    }
  }, [isSaved])

  return (
    <article className="mf-card" aria-label={L.title}>
      <div
        ref={scrollRef}
        className={`mf-card__scroll${scrollMore ? ' mf-card__scroll--more' : ''}`}
        onScroll={handleScroll}
      >
      <header className="mf-card__header">
        <div className="mf-card__meta">
          <span className="mf-card__category">
            <CategoryIcon category={category} size={13} />
            {categoryName && <span className="mf-card__category-name">{categoryName}</span>}
          </span>
          {card.readTimeSec && (
            <span className="mf-card__time">
              <Icon name="clock" size={12} strokeWidth={2} />
              {formatReadTime(card.readTimeSec, t)}
            </span>
          )}
        </div>
        <h2 className="mf-card__title">{L.title}</h2>
      </header>

      {card.imageUrl && (
        <div className="mf-card__image-wrap">
          <img
            src={card.imageUrl}
            alt={card.imageAlt || L.title}
            className="mf-card__image"
            loading="lazy"
          />
        </div>
      )}

      <div className="mf-card__body">
        <p className="mf-card__text">{L.body}</p>
      </div>

      {card.videoUrl && (
        <div className="mf-card__section">
          <button
            className="mf-card__toggle mf-card__toggle--video"
            onClick={() => setVideoOpen(o => !o)}
            aria-expanded={videoOpen}
          >
            <span className="mf-card__toggle-label">
              <Icon name="play" size={11} />
              {t('card.video_label')}
            </span>
            <Icon name="chevron" size={13} className={`mf-card__chevron${videoOpen ? ' is-open' : ''}`} />
          </button>
          <AnimatePresence>
            {videoOpen && (
              <motion.div {...expand} style={{ overflow: 'hidden' }}>
                <VideoPlayer
                  videoUrl={card.videoUrl}
                  videoType={card.videoType}
                  thumbnailUrl={card.videoThumbnailUrl}
                  title={L.title}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {L.tldr && (
        <div className="mf-card__section">
          <button
            className="mf-card__toggle"
            onClick={() => setTldrOpen(o => !o)}
            aria-expanded={tldrOpen}
          >
            <span>{t('card.tldr_label')}</span>
            <Icon name="chevron" size={13} className={`mf-card__chevron${tldrOpen ? ' is-open' : ''}`} />
          </button>
          <AnimatePresence>
            {tldrOpen && (
              <motion.div {...expand} style={{ overflow: 'hidden' }}>
                <p className="mf-card__tldr">{L.tldr}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {L.whyItMatters && (
        <div className="mf-card__why">
          <span className="mf-card__why-label">{t('card.why_label')}</span>
          <p className="mf-card__why-text">{L.whyItMatters}</p>
        </div>
      )}

      {card.mood?.length > 0 && (
        <div className="mf-card__moods">
          {card.mood.map(m => (
            <span key={m} className="mf-mood-chip">{t(`card.mood.${m}`, {}, m)}</span>
          ))}
        </div>
      )}

      {scrollMore && (
        <div className="mf-card__fade" aria-hidden="true">
          <span className="mf-card__cue-pill">
            <Icon name="chevron" size={10} strokeWidth={2.4} />
            {t('feed.scroll_more')}
          </span>
        </div>
      )}
      </div>

      <footer className="mf-card__footer">
        <div className="mf-card__actions">
          <button
            className={`mf-card__save-btn${isSaved ? ' mf-card__save-btn--saved' : ''}`}
            onClick={() => onSave?.(card)}
            aria-label={isSaved ? t('card.saved') : t('card.save')}
          >
            <span className="mf-card__save-ring" ref={saveRingRef} aria-hidden="true" />
            <Icon name={isSaved ? 'bookmark-filled' : 'bookmark'} size={14} />
            {isSaved ? t('card.saved') : t('card.save')}
          </button>

          <button
            className="mf-card__source-btn"
            onClick={() => setSourceOpen(o => !o)}
            aria-expanded={sourceOpen}
          >
            {t('card.source')}
            <Icon name="chevron" size={13} className={`mf-card__chevron${sourceOpen ? ' is-open' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {sourceOpen && card.source && (
            <motion.div {...expand} style={{ overflow: 'hidden' }}>
              <div className="mf-card__source">
                <span className="mf-card__source-type">
                  {t(`card.source_type.${card.source.type}`, {}, card.source.type)}
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
                    <Icon name="external" size={11} />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </article>
  )
}
