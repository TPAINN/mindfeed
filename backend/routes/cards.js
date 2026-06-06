const express  = require('express');
const router   = express.Router();
const Card     = require('../models/Card');
const auth     = require('../middleware/auth');

// GET /api/cards — list με pagination + filters
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, language = 'el', page = 1, limit = 20, q } = req.query;
    const filter = { status: 'published', language };
    if (category)   filter.category   = category;
    if (difficulty) filter.difficulty = difficulty;
    if (q)          filter.$text      = { $search: q };

    const cards = await Card.find(filter)
      .populate('category', 'name slug emoji color')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Card.countDocuments(filter);
    res.json({ cards, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cards/:id — single card
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('category', 'name slug emoji color')
      .populate('relatedCards', 'title tldr category');
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // Increment view count
    await Card.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
