/**
 * Auto-discovery orchestrator
 * Runs all fetchers → deduplicates → Claude → saves as drafts
 */
const Card = require('../models/Card')
const { createCardFromContent } = require('./claudePipeline')
const { fetchAllYouTube }   = require('../fetchers/youtube')
const { fetchAllWikipedia } = require('../fetchers/wikipedia')
const { fetchNASA }         = require('../fetchers/nasa')
const { fetchAllReddit }    = require('../fetchers/reddit')
const { fetchAllOpenAlex }  = require('../fetchers/openalex')
const { fetchAllEuropePmc } = require('../fetchers/europepmc')
const { fetchAllArxiv }     = require('../fetchers/arxiv')

async function isDuplicate(sourceUrl) {
  if (!sourceUrl) return false
  const exists = await Card.findOne({ 'source.url': sourceUrl }).lean()
  return Boolean(exists)
}

async function processItems(items, label) {
  let created = 0, skipped = 0, failed = 0

  for (const item of items) {
    try {
      if (await isDuplicate(item.sourceUrl)) {
        skipped++
        continue
      }
      await createCardFromContent(item)
      console.log(`  ✅ [${label}] "${item.title?.slice(0, 60)}"`)
      created++
      // Pause between Claude calls to avoid rate limits
      await new Promise(r => setTimeout(r, 800))
    } catch (err) {
      console.warn(`  ❌ [${label}] "${item.title?.slice(0, 40)}": ${err.message}`)
      failed++
    }
  }

  return { created, skipped, failed }
}

async function runAutoDiscovery({
  youtubePerKeyword = 2,
  wikiTopics        = 10,
  nasaCount         = 5,
  redditPerSub      = 5,
  openAlexTopics    = 4,
  europePmcTopics   = 4,
  arxivTopics       = 2,
} = {}) {
  const totals = { created: 0, skipped: 0, failed: 0 }

  function add(r) {
    totals.created += r.created
    totals.skipped += r.skipped
    totals.failed  += r.failed
  }

  console.log('\n🔍 Auto-discovery started\n')

  // 1. YouTube
  if (process.env.YOUTUBE_API_KEY) {
    console.log('📹 YouTube...')
    try {
      const items = await fetchAllYouTube(youtubePerKeyword)
      console.log(`   Fetched ${items.length} items`)
      add(await processItems(items, 'YouTube'))
    } catch (err) {
      console.warn(`YouTube fetch failed: ${err.message}`)
    }
  } else {
    console.warn('⚠️  YOUTUBE_API_KEY not set — skipping YouTube')
  }

  // 2. Wikipedia
  console.log('\n📖 Wikipedia...')
  try {
    const items = await fetchAllWikipedia(wikiTopics)
    console.log(`   Fetched ${items.length} items`)
    add(await processItems(items, 'Wikipedia'))
  } catch (err) {
    console.warn(`Wikipedia fetch failed: ${err.message}`)
  }

  // 3. NASA
  console.log('\n🚀 NASA APOD...')
  try {
    const items = await fetchNASA(nasaCount)
    console.log(`   Fetched ${items.length} items`)
    add(await processItems(items, 'NASA'))
  } catch (err) {
    console.warn(`NASA fetch failed: ${err.message}`)
  }

  // 4. Reddit
  console.log('\n💬 Reddit...')
  try {
    const items = await fetchAllReddit(redditPerSub)
    console.log(`   Fetched ${items.length} items`)
    add(await processItems(items, 'Reddit'))
  } catch (err) {
    console.warn(`Reddit fetch failed: ${err.message}`)
  }

  // 5. OpenAlex — free, no key, 250M+ scholarly works with real DOIs
  console.log('\n🎓 OpenAlex...')
  try {
    const items = await fetchAllOpenAlex(openAlexTopics)
    console.log(`   Fetched ${items.length} items`)
    add(await processItems(items, 'OpenAlex'))
  } catch (err) {
    console.warn(`OpenAlex fetch failed: ${err.message}`)
  }

  // 6. Europe PMC — free, no key, peer-reviewed life-sciences literature
  console.log('\n🧬 Europe PMC...')
  try {
    const items = await fetchAllEuropePmc(europePmcTopics)
    console.log(`   Fetched ${items.length} items`)
    add(await processItems(items, 'Europe PMC'))
  } catch (err) {
    console.warn(`Europe PMC fetch failed: ${err.message}`)
  }

  // 7. arXiv — free, no key, physics/astronomy/quantitative-biology preprints
  console.log('\n🔭 arXiv...')
  try {
    const items = await fetchAllArxiv(arxivTopics)
    console.log(`   Fetched ${items.length} items`)
    add(await processItems(items, 'arXiv'))
  } catch (err) {
    console.warn(`arXiv fetch failed: ${err.message}`)
  }

  console.log(`\n📊 Auto-discovery complete:`)
  console.log(`   ✅ Created: ${totals.created} draft cards`)
  console.log(`   ⏭  Skipped: ${totals.skipped} duplicates`)
  console.log(`   ❌ Failed:  ${totals.failed}`)

  return totals
}

module.exports = { runAutoDiscovery }
