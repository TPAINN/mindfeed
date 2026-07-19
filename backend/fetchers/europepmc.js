/**
 * Europe PMC REST API fetcher — no API key, no rate-limit registration.
 * Life-sciences literature (overlaps PubMed, also indexes European journals
 * and preprints). Docs: https://europepmc.org/RestfulWebService
 */

// keyword -> category, searched against title/abstract, restricted to the
// last 3 years for freshness and to peer-reviewed (source:MED) records.
const QUERIES = [
  { q: 'sleep deprivation cognition',       categorySlug: 'health'       },
  { q: 'gut microbiome mood',               categorySlug: 'biology'      },
  { q: 'exercise depression anxiety',       categorySlug: 'mentalhealth' },
  { q: 'circadian rhythm light exposure',   categorySlug: 'circadian'    },
  { q: 'forest nature stress cortisol',     categorySlug: 'nature'       },
  { q: 'habit formation behavior change',   categorySlug: 'self-improvement' },
  { q: 'social connection longevity',       categorySlug: 'health'       },
  { q: 'memory learning spaced repetition', categorySlug: 'psychology'   },
]

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function fetchOne({ q, categorySlug }) {
  // Quoted phrase = topical precision over raw citation count, which kept
  // surfacing huge, loosely-matching mega-cited reports instead of the
  // actual topic.
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search` +
    `?query=${encodeURIComponent(`"${q}" AND HAS_ABSTRACT:Y AND SRC:MED AND FIRST_PDATE:[2022-01-01 TO 3000-01-01]`)}` +
    `&format=json&pageSize=3&resultType=core`
  const res = await fetch(url, { headers: { 'User-Agent': 'MindFeed/1.0 (mailto:hello@mindfeed.app)' } })
  if (!res.ok) throw new Error(`Europe PMC error ${res.status} for "${q}"`)
  const data = await res.json()
  const results = data.resultList?.result || []

  return results
    .filter(r => r.abstractText && r.abstractText.length > 200 && r.title)
    .map(r => ({
      title:        stripHtml(r.title),
      body:         stripHtml(r.abstractText),
      sourceUrl:    r.doi ? `https://doi.org/${r.doi}` : `https://europepmc.org/article/${r.source}/${r.id}`,
      sourceType:   'paper',
      sourceAuthor: r.authorString ? r.authorString.split(',')[0].trim() : 'Europe PMC',
      categorySlug,
      // carried through so createCardFromContent's caller can enrich source metadata
      _doi:         r.doi || null,
      _year:        r.pubYear ? parseInt(r.pubYear) : null,
      _journal:     r.journalInfo?.journal?.title || null,
    }))
}

async function fetchAllEuropePmc(maxQueries = QUERIES.length) {
  const results = []
  for (const q of QUERIES.slice(0, maxQueries)) {
    try {
      const items = await fetchOne(q)
      results.push(...items)
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.warn(`Europe PMC fetch failed for "${q.q}": ${err.message}`)
    }
  }
  return results
}

module.exports = { fetchAllEuropePmc, QUERIES }
