const express  = require('express');
const router   = express.Router();
const Card     = require('../models/Card');
const { isObjectIdOrHexString } = require('mongoose');

// GET /api/cards — list με pagination + filters
router.get('/', async (req, res, next) => {
  try {
    const { category, difficulty, language = 'el', page = 1, limit = 20, q } = req.query;
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1 || pageNumber > 10000 ||
        !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
        !['el', 'en'].includes(language) ||
        (category !== undefined && !isObjectIdOrHexString(category)) ||
        (difficulty !== undefined && !['easy', 'medium', 'advanced'].includes(difficulty)) ||
        (q !== undefined && (typeof q !== 'string' || q.length > 200))) {
      return res.status(400).json({ message: 'Invalid search or pagination parameters' });
    }
    const filter = { status: 'published', language };
    if (category)   filter.category   = category;
    if (difficulty) filter.difficulty = difficulty;
    if (q)          filter.$text      = { $search: q };

    const [cards, total] = await Promise.all([Card.find(filter)
      .populate('category', 'name slug emoji color')
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(), Card.countDocuments(filter)]);
    res.json({ cards, total, page: pageNumber, pages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

// GET /api/cards/:id — single card
router.get('/:id', async (req, res, next) => {
  try {
    if (!isObjectIdOrHexString(req.params.id))
      return res.status(400).json({ message: 'Invalid card ID' });
    const card = await Card.findOne({ _id: req.params.id, status: 'published' })
      .populate('category', 'name slug emoji color')
      .populate({ path: 'relatedCards', select: 'title tldr category', match: { status: 'published' } });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // Increment view count
    await Card.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
