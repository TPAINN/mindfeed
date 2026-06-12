const mongoose  = require('mongoose');
const Card      = require('../models/Card');
const DailyFeed = require('../models/DailyFeed');

// Cards served in any feed within this window are excluded, even if the user
// never opened them — otherwise an untouched pool produces the same 10 cards
// every day (selection used to be deterministic on stats.views).
const RECENT_FEED_DAYS = 7;

function toObjectIds(ids) {
  return ids
    .filter(Boolean)
    .map((id) =>
      id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id))
    );
}

// Random selection — $sample gives a different draw every day.
async function sampleCards(query, size) {
  if (size <= 0) return [];
  return Card.aggregate([{ $match: query }, { $sample: { size } }]);
}

async function generateDailyFeed(user, date, limit = 10) {
  const existing = await DailyFeed.findOne({ user: user._id, date });
  if (existing) return existing;

  const seenIds = toObjectIds(user.seenCards.map((s) => s.card));

  const cutoff = new Date(Date.now() - RECENT_FEED_DAYS * 86400000);
  const recentFeeds = await DailyFeed.find(
    { user: user._id, createdAt: { $gte: cutoff } },
    { 'cards.card': 1 }
  ).lean();
  const recentIds = toObjectIds(recentFeeds.flatMap((f) => f.cards.map((c) => c.card)));

  const preferredCategoryIds = [...user.knowledgeProfile]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((kp) => kp.categoryId);

  const categoryPool =
    preferredCategoryIds.length > 0 ? preferredCategoryIds : user.preferences.categories;

  const difficultyFilter =
    !user.preferences.difficulty || user.preferences.difficulty === 'mixed'
      ? {}
      : { difficulty: user.preferences.difficulty };

  const baseQuery = {
    status: 'published',
    language: user.preferences.language || 'el',
    ...difficultyFilter,
  };

  const picked = [];
  const pickedIds = new Set();
  const addCards = (cards) => {
    for (const c of cards) {
      const key = String(c._id);
      if (!pickedIds.has(key) && picked.length < limit) {
        pickedIds.add(key);
        picked.push(c);
      }
    }
  };
  const pickedObjectIds = () => toObjectIds([...pickedIds]);

  // Tier 1: preferred categories, excluding seen + recently served
  const strictExclude = [...seenIds, ...recentIds];
  if (categoryPool.length > 0) {
    const perCategory = Math.ceil(limit / categoryPool.length);
    for (const catId of categoryPool) {
      if (picked.length >= limit) break;
      addCards(
        await sampleCards(
          { ...baseQuery, category: catId, _id: { $nin: [...strictExclude, ...pickedObjectIds()] } },
          perCategory
        )
      );
    }
  }

  // Tier 2: any category, still excluding seen + recently served
  if (picked.length < limit) {
    addCards(
      await sampleCards(
        { ...baseQuery, _id: { $nin: [...strictExclude, ...pickedObjectIds()] } },
        limit - picked.length
      )
    );
  }

  // Tier 3: small library — allow recently served, never seen
  if (picked.length < limit) {
    addCards(
      await sampleCards(
        { ...baseQuery, _id: { $nin: [...seenIds, ...pickedObjectIds()] } },
        limit - picked.length
      )
    );
  }

  // Tier 4: pool exhausted — repeats beat an empty feed
  if (picked.length < limit) {
    addCards(
      await sampleCards({ ...baseQuery, _id: { $nin: pickedObjectIds() } }, limit - picked.length)
    );
  }

  const cards = picked
    .slice(0, limit)
    .map((c, i) => ({ card: c._id, position: i, isCompleted: false }));

  try {
    return await DailyFeed.create({
      user: user._id,
      date,
      cards,
      generationAlgorithm: categoryPool.length > 0 ? 'personalized' : 'random',
    });
  } catch (err) {
    // Two simultaneous requests can race past the findOne — unique index wins
    if (err.code === 11000) return DailyFeed.findOne({ user: user._id, date });
    throw err;
  }
}

module.exports = { generateDailyFeed };
