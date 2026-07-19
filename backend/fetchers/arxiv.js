/**
 * arXiv API fetcher — fully free, no key, no rate-limit registration.
 * Docs: https://info.arxiv.org/help/api/user-manual.html
 *
 * arXiv's strength is physics/astronomy/CS/quantitative-biology preprints —
 * scoped by `cat:` (arXiv category) rather than freetext, which is far more
 * topically precise than a keyword search across all of arXiv.
 */

const QUERIES = [
  { catQuery: 'cat:astro-ph.CO OR cat:astro-ph.GA', categorySlug: 'universe' },
  { catQuery: 'cat:astro-ph.EP',                    categorySlug: 'universe' },
  { catQuery: 'cat:q-bio.NC',                       categorySlug: 'science'  },
  { catQuery: 'cat:physics.pop-ph',                 categorySlug: 'science'  },
]

function xmlDecode(s) {
  return (s || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim()
}

function parseEntries(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1])
  return entries.map(e => {
    const title = xmlDecode((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1])
    const summary = xmlDecode((e.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1])
    const idUrl = (e.match(/<id>([\s\S]*?)<\/id>/) || [])[1]
    const published = (e.match(/<published>(\d{4})/) || [])[1]
    const author = (e.match(/<name>([\s\S]*?)<\/name>/) || [])[1]
    const doi = (e.match(/<arxiv:doi>([\s\S]*?)<\/arxiv:doi>/) || [])[1]
    return { title, summary, idUrl, year: published ? parseInt(published) : null, author, doi }
  })
}

async function fetchOne({ catQuery, categorySlug }) {
  const url = `https://export.arxiv.org/api/query` +
    `?search_query=${encodeURIComponent(catQuery)}` +
    `&sortBy=submittedDate&sortOrder=descending&start=0&max_results=3`
  const res = await fetch(url, { headers: { 'User-Agent': 'MindFeed/1.0 (mailto:hello@mindfeed.app)' } })
  if (!res.ok) throw new Error(`arXiv error ${res.status} for "${catQuery}"`)
  const xml = await res.text()

  return parseEntries(xml)
    .filter(e => e.title && e.summary && e.summary.length > 200)
    .map(e => ({
      title:        e.title,
      body:         e.summary,
      sourceUrl:    e.doi ? `https://doi.org/${e.doi}` : e.idUrl,
      sourceType:   'arxiv',
      sourceAuthor: e.author || 'arXiv',
      categorySlug,
      _doi:         e.doi || null,
      _year:        e.year,
    }))
}

async function fetchAllArxiv(maxQueries = QUERIES.length) {
  const results = []
  for (const q of QUERIES.slice(0, maxQueries)) {
    try {
      const items = await fetchOne(q)
      results.push(...items)
      await new Promise(r => setTimeout(r, 3200)) // arXiv asks for 1 req / 3s
    } catch (err) {
      console.warn(`arXiv fetch failed for "${q.catQuery}": ${err.message}`)
    }
  }
  return results
}

module.exports = { fetchAllArxiv, QUERIES }
