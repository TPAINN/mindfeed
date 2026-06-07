const express   = require('express');
const router    = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Card      = require('../models/Card');
const { createCardFromPubMed } = require('../services/claudePipeline');

// GET /api/admin/drafts — list draft cards
router.get('/drafts', adminAuth, async (req, res) => {
  try {
    const drafts = await Card.find({ status: 'draft' })
      .populate('category', 'name emoji slug')
      .sort({ createdAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/cards/:id — publish or archive
router.patch('/cards/:id', adminAuth, async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || 'published' },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: 'Not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/cards/:id — discard draft
router.delete('/cards/:id', adminAuth, async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/run-pipeline — trigger Claude pipeline for given PMIDs
router.post('/run-pipeline', adminAuth, async (req, res) => {
  try {
    const targets = req.body.targets; // [{ pmid, categorySlug }]
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ message: 'targets array required' });
    }
    const results = [];
    for (const { pmid, categorySlug } of targets) {
      try {
        const card = await createCardFromPubMed({ pmid, categorySlug });
        results.push({ pmid, status: 'ok', cardId: card._id, title: card.title });
      } catch (err) {
        results.push({ pmid, status: 'error', message: err.message });
      }
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
