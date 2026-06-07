import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './VideoPlayer.css'

export default function VideoPlayer({ videoUrl, videoType, thumbnailUrl, title }) {
  const [playing, setPlaying] = useState(false)

  if (!videoUrl) return null

  const embedUrl = videoType === 'youtube'
    ? `${videoUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : videoUrl

  return (
    <div className="mf-video">
      <AnimatePresence mode="wait">
        {!playing ? (
          <motion.button
            key="thumb"
            className="mf-video__thumb"
            onClick={() => setPlaying(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.97 }}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="mf-video__thumbnail"
                loading="lazy"
              />
            ) : (
              <div className="mf-video__thumbnail mf-video__thumbnail--placeholder" />
            )}
            <div className="mf-video__play-overlay">
              <div className="mf-video__play-btn">
                <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="player"
            className="mf-video__player"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {videoType === 'youtube' ? (
              <iframe
                src={embedUrl}
                title={title}
                className="mf-video__iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                className="mf-video__element"
                title={title}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
