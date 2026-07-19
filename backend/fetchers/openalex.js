/**
 * OpenAlex API fetcher — fully free, no API key, no registration.
 * Docs: https://docs.openalex.org  (polite pool: send a real email in User-Agent)
 *
 * Abstracts are NOT returned as plain text (publisher copyright) — OpenAlex
 * ships an "abstract_inverted_index" (word -> [positions]) instead, which we
 * reconstruct into a normal sentence below.
 */

const QUERIES = [
  { q: 'multitasking attention cost',        categorySlug: 'psychology'  },
  { q: 'octopus cognition camouflage',       categorySlug: 'wildlife'    },
  { q: 'compound interest financial literacy', categorySlug: 'finance'   },
  { q: 'stoicism wellbeing philosophy',      categorySlug: 'philosophy'  },
  { q: 'galaxy count observable universe',   categorySlug: 'universe'    },
  { q: 'gene editing CRISPR therapy',        categorySlug: 'biology'     },
  { q: 'urban green space mental health',    categorySlug: 'nature'      },
  { q: 'productivity deep work focus',       categorySlug: 'self-improvement' },
]

function reconstructAbstract(index) {
  if (!index) return null
  const positions = []
  for (const [word, idxs] of Object.entries(index)) {
    for (const i of idxs) positions[i] = word
  }
  const text = positions.filter(Boolean).join(' ')
  return text.length > 200 ? text : null
}

async function fetchOne({ q, categorySlug }) {
  // Default relevance ranking, not citation count — citation-sort kept
  // surfacing huge, loosely-matching mega-cited papers off-topic. (Quoted
  // exact-phrase search returns 0 results on OpenAlex — its `search` param
  // doesn't support that syntax; unquoted relevance ranking works well.)
  const url = `https://api.openalex.org/works` +
    `?search=${encodeURIComponent(q)}` +
    `&filter=has_abstract:true,from_publication_date:2022-01-01,type:article` +
    `&per-page=3` +
    `&mailto=hello@mindfeed.app`
  const res = await fetch(url, { headers: { 'User-Agent': 'MindFeed/1.0 (mailto:hello@mindfeed.app)' } })
  if (!res.ok) throw new Error(`OpenAlex error ${res.status} for "${q}"`)
  const data = await res.json()
  const results = data.results || []

  return results
    .map(w => {
      const body = reconstructAbstract(w.abstract_inverted_index)
      if (!body || !w.title) return null
      const doi = w.doi ? w.doi.replace('https://doi.org/', '') : null
      return {
        title:        w.title,
        body,
        sourceUrl:    w.doi || w.primary_location?.landing_page_url || `https://openalex.org/${w.id?.split('/').pop()}`,
        sourceType:   'paper',
        sourceAuthor: w.authorships?.[0]?.author?.display_name || 'OpenAlex',
        categorySlug,
        _doi:         doi,
        _year:        w.publication_year || null,
        _journal:     w.primary_location?.source?.display_name || null,
      }
    })
    .filter(Boolean)
}

async function fetchAllOpenAlex(maxQueries = QUERIES.length) {
  const results = []
  for (const q of QUERIES.slice(0, maxQueries)) {
    try {
      const items = await fetchOne(q)
      results.push(...items)
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.warn(`OpenAlex fetch failed for "${q.q}": ${err.message}`)
    }
  }
  return results
}

module.exports = { fetchAllOpenAlex, QUERIES }
