const Anthropic = require('@anthropic-ai/sdk')
const mongoose = require('mongoose')
const Card = require('../models/Card')
const Category = require('../models/Category')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

async function simplifyWithClaude(paper, categoryName) {
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].text.trim()
  return JSON.parse(text)
}

async function createCardFromPubMed({ pmid, categorySlug }) {
  const paper = await fetchPubMedAbstract(pmid)
  if (!paper.abstract) throw new Error(`No abstract found for PMID ${pmid}`)

  const category = await Category.findOne({ slug: categorySlug })
  if (!category) throw new Error(`Category not found: ${categorySlug}`)

  const simplified = await simplifyWithClaude(paper, category.name)

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

/**
 * Create a card from any raw content (YouTube, Wikipedia, NASA, Reddit, etc.)
 * raw: { title, body, sourceUrl, sourceType, sourceAuthor?, categorySlug,
 *        imageUrl?, videoId?, videoThumbnailUrl? }
 */
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].text.trim()
  const simplified = JSON.parse(text)

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
    },
  })

  return card
}

module.exports = { createCardFromPubMed, fetchPubMedAbstract, simplifyWithClaude, createCardFromContent }
