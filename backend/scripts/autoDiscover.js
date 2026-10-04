/**
 * Auto-discovery CLI script
 * Called by GitHub Actions weekly OR run manually:
 *   MONGO_URI=... GEMINI_API_KEY=... node scripts/autoDiscover.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const { runAutoDiscovery } = require('../services/autoDiscovery')
const { aiEnabled } = require('../services/claudePipeline')

async function main() {
  if (!aiEnabled()) {
    console.log('⏭  GEMINI_API_KEY not set — skipping card writing (free key: aistudio.google.com).')
    return
  }
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ MongoDB connected')

  await runAutoDiscovery({
    youtubePerKeyword: 2,
    wikiTopics:        6,
    nasaCount:         3,
    redditPerSub:      3,
    openAlexTopics:    4,
    europePmcTopics:   4,
    arxivTopics:       2,
  })

  await mongoose.disconnect()
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
