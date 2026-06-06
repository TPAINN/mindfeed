const express         = require('express');
const router          = express.Router();
const auth            = require('../middleware/auth');
const DailyFeed       = require('../models/DailyFeed');
const { generateDailyFeed } = require('../services/feedGenerator');

// GET /api/feed/today — get or generate today's feed
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let feed = await generateDailyFeed(req.user, today, req.user.preferences.dailyCardLimit || 10);

    feed = await DailyFeed.findById(feed._id)
      .populate({
        path: 'cards.card',
        populate: { path: 'category', select: 'name slug emoji color' },
      });

    res.json(feed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/feed/complete/:cardId — mark a card as completed
router.patch('/complete/:cardId', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const feed  = await DailyFeed.findOne({ user: req.user._id, date: today });
    if (!feed) return res.status(404).json({ message: 'No feed for today' });

    const entry = feed.cards.find((c) => c.card.toString() === req.params.cardId);
    if (!entry) return res.status(404).json({ message: 'Card not in feed' });

    entry.isCompleted = true;
    entry.completedAt = new Date();
    feed.currentIndex = feed.cards.filter((c) => c.isCompleted).length;
    feed.isCompleted  = feed.cards.every((c) => c.isCompleted);
    if (feed.isCompleted) feed.completedAt = new Date();

    // Update user history
    req.user.addSeenCard({ card: req.params.cardId, engagement: req.body.engagement || 'read' });
    req.user.updateStreak();
    await req.user.save();
    await feed.save();

    res.json({ currentIndex: feed.currentIndex, isCompleted: feed.isCompleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
