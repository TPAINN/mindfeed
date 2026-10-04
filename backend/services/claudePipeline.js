const Card = require('../models/Card')
const Category = require('../models/Category')

/*
 * Cards are written by Google's Gemini on its FREE tier (an AI Studio key, no
 * billing account), not by a paid API. Without GEMINI_API_KEY nothing is
 * called at all: aiEnabled() is false and the scripts skip card writing, so a
 * missing key can never turn into a bill.
 */
const GEMINI_MODEL = 'gemini-2.5-flash'

const aiEnabled = () => Boolean(process.env.GEMINI_API_KEY)

// Models sometimes wrap JSON in ```json fences despite being told not to
// -- strip them before parsing instead of trusting the prompt instruction.
function parseModelJSON(text) {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  return JSON.parse(stripped)
}

async function askModel(prompt) {
  if (!aiEnabled()) throw new Error('GEMINI_API_KEY not set')
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.6, maxOutputTokens: 1024 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  return parseModelJSON(text)
}

async function fetchPubMedAbstract(pmid) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&rettype=abstract`
  const res = await fetch(url)
  const xml = await res.text()
  const abstractMatch = xml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/)
  const titleMatch = xml.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)
  const authorMatch = xml.match(/<LastName>([\s\S]*?)<\/LastName>/)
  const yearMatch = xml.match(/<Year>(\d{4})<\/Year>/)
  const doiMatch = xml.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/)
  return {
    abstract: abstractMatch ? abstractMatch[1].replace(/<[^>]+>/g, '').trim() : null,
    title: titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : null,
    author: authorMatch ? authorMatch[1].trim() : null,
    year: yearMatch ? parseInt(yearMatch[1]) : null,
    doi: doiMatch ? doiMatch[1].trim() : null,
    pmid,
  }
}

async function simplify(paper, categoryName) {
  const prompt = `Μετέτρεψε αυτή την επιστημονική έρευνα σε μια κάρτα γνώσης για ελληνικό κοινό (χωρίς επιστημονικό υπόβαθρο). Γράψε σε φυσικά ελληνικά.

ΤΙΤΛΟΣ ΕΡΕΥΝΑΣ: ${paper.title}
ABSTRACT: ${paper.abstract}
ΚΑΤΗΓΟΡΙΑ: ${categoryName}

Επέστρεψε ΜΟΝΟ valid JSON με αυτά τα fields (χωρίς markdown, χωρίς backticks):
{
  "title": "Ελκυστικός τίτλος στα ελληνικά (max 100 chars)",
  "body": "Απλή εξήγηση 3-4 προτάσεων στα ελληνικά (max 600 chars)",
  "tldr": "Μία πρόταση συμπέρασμα (max 140 chars)",
  "whyItMatters": "Γιατί αφορά τον καθημερινό άνθρωπο (max 250 chars)",
  "mood": ["inspiring"|"surprising"|"calming"|"motivating"|"mind-blowing"|"practical"],
  "difficulty": "easy"|"medium"|"advanced",
  "readTimeSec": 30-90
}`

  return askModel(prompt)
}

async function createCardFromPubMed({ pmid, categorySlug }) {
  const paper = await fetchPubMedAbstract(pmid)
  if (!paper.abstract) throw new Error(`No abstract found for PMID ${pmid}`)

  const category = await Category.findOne({ slug: categorySlug })
  if (!category) throw new Error(`Category not found: ${categorySlug}`)

  const simplified = await simplify(paper, category.name)

  const card = await Card.create({
    title: simplified.title,
    body: simplified.body,
    tldr: simplified.tldr,
    whyItMatters: simplified.whyItMatters,
    mood: simplified.mood || [],
    difficulty: simplified.difficulty || 'medium',
    readTimeSec: simplified.readTimeSec || 60,
    category: category._id,
    language: 'el',
    status: 'draft',
    aiGenerated: true,
    aiSimplified: true,
    verified: false,
    source: {
      type: 'pubmed',
      title: paper.title || 'PubMed Research',
      author: paper.author,
      year: paper.year,
      doi: paper.doi,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      publisher: 'PubMed',
    },
  })

  return card
}

async function createCardFromContent(raw) {
  const category = await Category.findOne({ slug: raw.categorySlug })
  if (!category) throw new Error(`Category not found: ${raw.categorySlug}`)

  const prompt = `Μετέτρεψε αυτό το περιεχόμενο σε μια κάρτα γνώσης για ελληνικό κοινό (χωρίς επιστημονικό υπόβαθρο). Γράψε σε φυσικά, απλά ελληνικά.

ΤΙΤΛΟΣ: ${raw.title}
ΠΕΡΙΕΧΟΜΕΝΟ: ${raw.body?.slice(0, 1200) || raw.title}
ΚΑΤΗΓΟΡΙΑ: ${category.name}
ΤΥΠΟΣ ΠΗΓΗΣ: ${raw.sourceType}

Επέστρεψε ΜΟΝΟ valid JSON (χωρίς markdown, χωρίς backticks):
{
  "title": "Ελκυστικός τίτλος στα ελληνικά (max 100 chars)",
  "body": "Απλή εξήγηση 3-4 προτάσεων στα ελληνικά (max 600 chars)",
  "tldr": "Μία πρόταση συμπέρασμα (max 140 chars)",
  "whyItMatters": "Γιατί αφορά τον καθημερινό άνθρωπο (max 250 chars)",
  "mood": ["inspiring"|"surprising"|"calming"|"motivating"|"mind-blowing"|"practical"],
  "difficulty": "easy"|"medium"|"advanced",
  "readTimeSec": 30-90,
  "tags": ["tag1","tag2","tag3"]
}`

  const simplified = await askModel(prompt)

  const videoUrl = raw.videoId
    ? `https://www.youtube.com/embed/${raw.videoId}`
    : null

  const card = await Card.create({
    title:             simplified.title,
    body:              simplified.body,
    tldr:              simplified.tldr,
    whyItMatters:      simplified.whyItMatters,
    mood:              simplified.mood || [],
    difficulty:        simplified.difficulty || 'easy',
    readTimeSec:       simplified.readTimeSec || 45,
    tags:              simplified.tags || [],
    category:          category._id,
    language:          'el',
    status:            'draft',
    aiGenerated:       true,
    aiSimplified:      true,
    verified:          false,
    imageUrl:          raw.imageUrl || null,
    videoUrl,
    videoType:         videoUrl ? 'youtube' : null,
    videoThumbnailUrl: raw.videoThumbnailUrl || null,
    source: {
      type:      raw.sourceType || 'website',
      title:     raw.title,
      author:    raw.sourceAuthor || null,
      url:       raw.sourceUrl,
      doi:       raw._doi || null,
      year:      raw._year || null,
      publisher: raw._journal || null,
    },
  })

  return card
}

module.exports = { aiEnabled, createCardFromPubMed, fetchPubMedAbstract, simplify, createCardFromContent }
