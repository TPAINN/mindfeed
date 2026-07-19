/**
 * PubMed search pipeline — searches PubMed live (no more hand-pasted PMIDs),
 * picks fresh, not-yet-used papers per category, converts via Claude.
 * Run: MONGO_URI=... ANTHROPIC_API_KEY=... node scripts/weeklyPipeline.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Card = require('../models/Card');
const { createCardFromPubMed } = require('../services/claudePipeline');

// category -> PubMed search term. Restricted to the last 3 years, English,
// with an abstract, via esearch's own query syntax (no separate filter call).
const SEARCH_TARGETS = [
  { term: 'stress reduction intervention',      categorySlug: 'psychology'   },
  { term: 'sleep quality intervention',          categorySlug: 'health'       },
  { term: 'gut microbiome diet',                 categorySlug: 'biology'      },
  { term: 'physical activity cognitive function', categorySlug: 'science'     },
  { term: 'nature exposure wellbeing',           categorySlug: 'nature'       },
  { term: 'habit formation adherence',           categorySlug: 'self-improvement' },
];

async function searchPubMed(term, retmax = 5) {
  const q = `${term} AND hasabstract[text] AND ("2022"[Date - Publication] : "3000"[Date - Publication])`;
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` +
    `?db=pubmed&term=${encodeURIComponent(q)}&retmax=${retmax}&sort=relevance&retmode=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PubMed esearch error ${res.status} for "${term}"`);
  const data = await res.json();
  return data.esearchresult?.idlist || [];
}

async function alreadyUsed(pmid) {
  const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  const exists = await Card.findOne({ 'source.url': url }).lean();
  return Boolean(exists);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected\n');

  let created = 0;
  let skipped = 0;
  let failed  = 0;

  for (const { term, categorySlug } of SEARCH_TARGETS) {
    console.log(`🔎 Searching PubMed: "${term}" (${categorySlug})`);
    let pmids;
    try {
      pmids = await searchPubMed(term);
    } catch (err) {
      console.error(`   ❌ search failed: ${err.message}\n`);
      failed++;
      continue;
    }

    // Take the first fresh (not-already-a-card) result — this is a daily
    // job, so most PMIDs will already exist after the first few runs.
    let picked = null;
    for (const pmid of pmids) {
      if (!(await alreadyUsed(pmid))) { picked = pmid; break; }
    }
    if (!picked) {
      console.log(`   ⏭  all ${pmids.length} results already used, skipping\n`);
      skipped++;
      continue;
    }

    try {
      console.log(`   📡 PMID ${picked}`);
      const card = await createCardFromPubMed({ pmid: picked, categorySlug });
      console.log(`   ✅ Draft: "${card.title}"\n`);
      created++;
      await new Promise(r => setTimeout(r, 500)); // NCBI courtesy delay
    } catch (err) {
      console.error(`   ❌ PMID ${picked}: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\n📊 Done: ${created} created, ${skipped} skipped (no fresh match), ${failed} failed`);
  console.log('Review drafts: GET /api/admin/drafts (Bearer $ADMIN_PASSWORD)');

  await mongoose.disconnect();
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
