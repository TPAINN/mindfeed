const express         = require('express');
const router          = express.Router();
const auth            = require('../middleware/auth');
const DailyFeed       = require('../models/DailyFeed');
const { generateDailyFeed } = require('../services/feedGenerator');

// The client sends its local calendar date (?date=YYYY-MM-DD). The server is
// on UTC — for Greece (UTC+2/+3) "today" used to flip hours late, so a morning
// login kept returning yesterday's feed. Accept the client date but only if it
// is within one day of server time, otherwise fall back to UTC.
function resolveDate(query) {
  const serverToday = new Date().toISOString().split('T')[0];
  const candidate = query.date;
  if (!candidate || !/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return serverToday;
  const diffMs = Math.abs(new Date(candidate) - new Date(serverToday));
  return diffMs <= 86400000 ? candidate : serverToday;
}

// GET /api/feed/today — get or generate today's feed
router.get('/today', auth, async (req, res) => {
  try {
    const today = resolveDate(req.query);
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
    const today = resolveDate(req.query);
    const feed  = await DailyFeed.findOne({ user: req.user._id, date: today });
    if (!feed) return res.status(404).json({ message: 'No feed for today' });

    const entry = feed.cards.find((c) => c.card.toString() === req.params.cardId);
    if (!entry) return res.status(404).json({ message: 'Card not in feed' });

    if (!entry.isCompleted) {
      entry.isCompleted = true;
      entry.completedAt = new Date();
      // Update user history (only once per card)
      req.user.addSeenCard({ card: req.params.cardId, engagement: req.body.engagement || 'read' });
      req.user.updateStreak();
      await req.user.save();
    }
    feed.currentIndex = feed.cards.filter((c) => c.isCompleted).length;
    feed.isCompleted  = feed.cards.every((c) => c.isCompleted);
    if (feed.isCompleted && !feed.completedAt) feed.completedAt = new Date();
    await feed.save();

    res.json({ currentIndex: feed.currentIndex, isCompleted: feed.isCompleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
