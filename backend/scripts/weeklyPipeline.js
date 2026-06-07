/**
 * Weekly pipeline — fetches 5 PubMed papers, converts via Claude, saves as drafts.
 * Run: MONGO_URI=... ANTHROPIC_API_KEY=... node scripts/weeklyPipeline.js
 *
 * Update TARGETS each week with fresh PMIDs from PubMed searches.
 * Find PMIDs at: https://pubmed.ncbi.nlm.nih.gov/
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { createCardFromPubMed } = require('../services/claudePipeline');

// ── Update these weekly ──────────────────────────────────────────────────────
const TARGETS = [
  { pmid: '38374742', categorySlug: 'psychology'  },
  { pmid: '38221436', categorySlug: 'biology'     },
  { pmid: '38189544', categorySlug: 'health'      },
  { pmid: '38131765', categorySlug: 'science'     },
  { pmid: '38029241', categorySlug: 'nature'      },
];
// ────────────────────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected\n');

  let created = 0;
  let failed  = 0;

  for (const target of TARGETS) {
    try {
      console.log(`📡 Processing PMID ${target.pmid} → ${target.categorySlug}`);
      const card = await createCardFromPubMed(target);
      console.log(`✅ Draft: "${card.title}"\n`);
      created++;
    } catch (err) {
      console.error(`❌ PMID ${target.pmid}: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\n📊 Done: ${created} created, ${failed} failed`);
  console.log('Review drafts: GET /api/admin/drafts (Bearer $ADMIN_PASSWORD)');

  await mongoose.disconnect();
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
