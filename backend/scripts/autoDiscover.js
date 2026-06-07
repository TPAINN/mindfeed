/**
 * Auto-discovery CLI script
 * Called by GitHub Actions weekly OR run manually:
 *   MONGO_URI=... ANTHROPIC_API_KEY=... node scripts/autoDiscover.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const { runAutoDiscovery } = require('../services/autoDiscovery')

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ MongoDB connected')

  await runAutoDiscovery({
    youtubePerKeyword: 2,
    wikiTopics:        10,
    nasaCount:         5,
    redditPerSub:      5,
  })

  await mongoose.disconnect()
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
