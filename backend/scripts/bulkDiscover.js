/**
 * One-time bulk discovery to seed 500+ cards fast.
 * Run once: MONGO_URI=... ANTHROPIC_API_KEY=... node scripts/bulkDiscover.js
 *
 * Targets:
 *   YouTube: 15 keywords × 3 results = ~45 items
 *   Wikipedia: 40 topics × 1 = ~40 items
 *   NASA: 20 APOD = ~20 items
 *   Reddit: 7 subreddits × 10 posts = ~70 items
 *   Total potential: ~175 new draft cards
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const { runAutoDiscovery } = require('../services/autoDiscovery')

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ MongoDB connected')
  console.log('🚀 Starting BULK discovery (this may take 10-20 minutes)...\n')

  await runAutoDiscovery({
    youtubePerKeyword: 3,
    wikiTopics:        40,   // all topics
    nasaCount:         20,
    redditPerSub:      10,
  })

  await mongoose.disconnect()
  console.log('\n✅ Bulk discovery complete.')
  console.log('Review drafts: GET /api/admin/drafts')
  console.log('Bulk publish:  PATCH /api/admin/cards/:id  { "status": "published" }')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
