const Card      = require('../models/Card');
const DailyFeed = require('../models/DailyFeed');

async function generateDailyFeed(user, date, limit = 10) {
  const existing = await DailyFeed.findOne({ user: user._id, date });
  if (existing) return existing;

  const seenIds = user.seenCards.map((s) => s.card);

  const preferredCategoryIds = user.knowledgeProfile
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((kp) => kp.categoryId);

  const categoryPool =
    preferredCategoryIds.length > 0
      ? preferredCategoryIds
      : user.preferences.categories;

  const difficultyFilter =
    user.preferences.difficulty === 'mixed' ? {} : { difficulty: user.preferences.difficulty };

  const baseQuery = {
    status: 'published',
    language: user.preferences.language || 'el',
    _id: { $nin: seenIds },
    ...difficultyFilter,
  };

  const selectedCards = [];
  const cardsPerCategory = Math.ceil(limit / (categoryPool.length || 5));

  if (categoryPool.length > 0) {
    for (const catId of categoryPool) {
      if (selectedCards.length >= limit) break;
      const cards = await Card.find({ ...baseQuery, category: catId })
        .sort({ 'stats.views': 1 })
        .limit(cardsPerCategory)
        .lean();
      selectedCards.push(...cards);
    }
  }

  if (selectedCards.length < limit) {
    const existingIds = selectedCards.map((c) => c._id);
    const filler = await Card.find({
      ...baseQuery,
      _id: { $nin: [...seenIds, ...existingIds] },
    })
      .sort({ createdAt: -1 })
      .limit(limit - selectedCards.length)
      .lean();
    selectedCards.push(...filler);
  }

  const shuffled = selectedCards
    .slice(0, limit)
    .map((c) => ({ sort: Math.random(), card: c }))
    .sort((a, b) => a.sort - b.sort)
    .map((c, i) => ({ card: c.card._id, position: i, isCompleted: false }));

  return await DailyFeed.create({
    user: user._id,
    date,
    cards: shuffled,
    generationAlgorithm: categoryPool.length > 0 ? 'personalized' : 'category_balanced',
  });
}

module.exports = { generateDailyFeed };
