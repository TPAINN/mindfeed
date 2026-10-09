const express         = require('express');
const router          = express.Router();
const auth            = require('../middleware/auth');
const DailyFeed       = require('../models/DailyFeed');
const User            = require('../models/User');
const { isObjectIdOrHexString, Types } = require('mongoose');
const { generateDailyFeed } = require('../services/feedGenerator');

// The client sends its local calendar date (?date=YYYY-MM-DD). The server is
// on UTC — for Greece (UTC+2/+3) "today" used to flip hours late, so a morning
// login kept returning yesterday's feed. Accept the client date but only if it
// is within one day of server time, otherwise fall back to UTC.
function resolveDate(query) {
  const serverToday = new Date().toISOString().split('T')[0];
  const candidate = query.date;
  if (typeof candidate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return serverToday;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== candidate) return serverToday;
  const diffMs = Math.abs(parsed - new Date(serverToday));
  return diffMs <= 86400000 ? candidate : serverToday;
}

// GET /api/feed/today — get or generate today's feed
router.get('/today', auth, async (req, res, next) => {
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
    next(err);
  }
});

// PATCH /api/feed/complete/:cardId — mark a card as completed
router.patch('/complete/:cardId', auth, async (req, res, next) => {
  try {
    if (!isObjectIdOrHexString(req.params.cardId))
      return res.status(400).json({ message: 'Invalid card ID' });
    const engagement = req.body.engagement ?? 'read';
    if (!['skipped', 'read', 'saved', 'deep_dived'].includes(engagement))
      return res.status(400).json({ message: 'Invalid engagement' });
    const today = resolveDate(req.query);
    const cardId = new Types.ObjectId(req.params.cardId);
    // One atomic document update: concurrent reads cannot overwrite progress.
    const feed = await DailyFeed.findOneAndUpdate(
      { user: req.user._id, date: today, 'cards.card': cardId },
      [
        { $set: { cards: { $map: { input: '$cards', as: 'entry', in: {
          $cond: [{ $eq: ['$$entry.card', cardId] },
            { $mergeObjects: ['$$entry', { isCompleted: true, completedAt: { $ifNull: ['$$entry.completedAt', '$$NOW'] } }] },
            '$$entry'],
        } } } } },
        { $set: { currentIndex: { $size: { $filter: { input: '$cards', as: 'entry', cond: '$$entry.isCompleted' } } } } },
        { $set: {
          isCompleted: { $eq: ['$currentIndex', { $size: '$cards' }] },
          completedAt: { $cond: [{ $eq: ['$currentIndex', { $size: '$cards' }] }, { $ifNull: ['$completedAt', '$$NOW'] }, '$completedAt'] },
        } },
      ],
      { new: true }
    );
    if (!feed) return res.status(404).json({ message: 'Card not in today\'s feed' });
    const entry = feed.cards.find(c => c.card.toString() === cardId.toString());
    // The persisted completion timestamp is stable across retries. If this write
    // fails after the feed succeeds, retrying repairs history without double-counting.
    await User.updateOne(
      { _id: req.user._id, seenCards: { $not: { $elemMatch: { card: cardId, seenAt: entry.completedAt } } } },
      { $push: { seenCards: { $each: [{ card: cardId, seenAt: entry.completedAt, engagement }], $slice: -500 } }, $inc: { totalCardsRead: 1 } }
    );
    const lastActive = req.user.streak.lastActiveDate;
    req.user.updateStreak(today);
    await User.updateOne(
      { _id: req.user._id, 'streak.lastActiveDate': lastActive || null },
      { $set: { streak: req.user.streak.toObject() } }
    );

    res.json({ currentIndex: feed.currentIndex, isCompleted: feed.isCompleted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
