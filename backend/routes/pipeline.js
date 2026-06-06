const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { createCardFromPubMed } = require('../services/claudePipeline')

// POST /api/pipeline/pubmed — admin only (add auth check as needed)
// body: { pmid: "12345678", categorySlug: "psychology" }
router.post('/pubmed', auth, async (req, res) => {
  try {
    const { pmid, categorySlug } = req.body
    if (!pmid || !categorySlug) {
      return res.status(400).json({ message: 'pmid and categorySlug required' })
    }
    const card = await createCardFromPubMed({ pmid, categorySlug })
    res.status(201).json({ message: 'Card created (draft)', card })
  } catch (err) {
    console.error('Pipeline error:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
