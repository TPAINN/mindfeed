const { test, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const User = require('../models/User');
const Card = require('../models/Card');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-only-secret-not-for-deployment';
const app = express();
app.use(express.json());
app.use('/users', require('../routes/users'));
app.use('/cards', require('../routes/cards'));
app.use('/feed', require('../routes/feed'));
app.use((err, req, res, next) => res.status(503).json({ message: 'Service unavailable' }));
const server = app.listen(0, '127.0.0.1');
after(() => server.close());

async function request(path, body, token, method) {
  if (!server.listening) await new Promise(resolve => server.once('listening', resolve));
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    ...(body && { body: JSON.stringify(body) }),
  });
}

test('login rejects objects before querying MongoDB', async () => {
  const lookup = mock.method(User, 'findOne', async () => null);
  try {
    const res = await request('/users/login', { email: { $ne: null }, password: 'secret' });
    assert.equal(res.status, 400);
    assert.equal(lookup.mock.callCount(), 0);
  } finally { lookup.mock.restore(); }
});

test('registration normalizes email and username before checking uniqueness', async () => {
  const lookup = mock.method(User, 'findOne', async () => ({}));
  try {
    const res = await request('/users/register', { email: ' Reader@Example.COM ', username: ' reader ', password: 'secret123' });
    assert.equal(res.status, 409);
    assert.deepEqual(lookup.mock.calls[0].arguments[0], { $or: [{ email: 'reader@example.com' }, { username: 'reader' }] });
  } finally { lookup.mock.restore(); }
});

test('oversized bcrypt passwords are rejected instead of silently truncated', async () => {
  const lookup = mock.method(User, 'findOne', async () => ({}));
  try {
    const res = await request('/users/register', { email: 'reader@example.com', username: 'reader', password: 'a'.repeat(73) });
    assert.equal(res.status, 400);
    assert.equal(lookup.mock.callCount(), 0);
  } finally { lookup.mock.restore(); }
});

test('card pagination rejects unbounded and malformed values before database access', async () => {
  const lookup = mock.method(Card, 'find', () => { throw new Error('Unexpected database access'); });
  try {
    for (const query of ['limit=0', 'limit=10000', 'page=-1', 'page=nope', 'limit=1.5', 'language[$ne]=en']) {
      assert.equal((await request(`/cards?${query}`)).status, 400, query);
    }
    assert.equal(lookup.mock.callCount(), 0);
  } finally { lookup.mock.restore(); }
});

test('public card lookup excludes unpublished records', async () => {
  let filter;
  const query = { populate() { return this; }, then(resolve) { return Promise.resolve(null).then(resolve); } };
  const lookup = mock.method(Card, 'findOne', value => { filter = value; return query; });
  const oldLookup = mock.method(Card, 'findById', () => query);
  try {
    assert.equal((await request('/cards/507f1f77bcf86cd799439011')).status, 404);
    assert.deepEqual(filter, { _id: '507f1f77bcf86cd799439011', status: 'published' });
  } finally { lookup.mock.restore(); oldLookup.mock.restore(); }
});

test('database outages preserve session and propagate as server errors', async () => {
  const lookup = mock.method(User, 'findById', () => ({ select: async () => { throw new Error('Database offline'); } }));
  try {
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
    assert.equal((await request('/users/me', null, token)).status, 503);
  } finally { lookup.mock.restore(); }
});

test('inactive accounts cannot use previously issued tokens', async () => {
  const lookup = mock.method(User, 'findById', () => ({ select: async () => ({ isActive: false }) }));
  try {
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
    assert.equal((await request('/users/me', null, token)).status, 401);
  } finally { lookup.mock.restore(); }
});

test('fractional daily limits cannot break daily feed sampling', async () => {
  const user = new User({ username: 'reader', email: 'reader@example.com', passwordHash: 'test' });
  const lookup = mock.method(User, 'findById', () => ({ select: async () => user }));
  const save = mock.method(user, 'save', async () => user);
  try {
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
    const res = await request('/users/preferences', { dailyCardLimit: 3.5 }, token, 'PATCH');
    assert.equal(res.status, 400);
    assert.equal(save.mock.callCount(), 0);
  } finally { lookup.mock.restore(); save.mock.restore(); }
});

test('streak uses the same local calendar date as the daily feed', () => {
  const user = new User({ username: 'reader', email: 'reader@example.com', passwordHash: 'test', streak: { current: 2, longest: 2, totalDaysActive: 2, lastActiveDate: new Date('2026-10-04') } });
  user.updateStreak('2026-10-05');
  assert.equal(user.streak.current, 3);
  assert.equal(user.streak.lastActiveDate.toISOString().slice(0, 10), '2026-10-05');
  user.updateStreak('2026-10-05');
  assert.equal(user.streak.totalDaysActive, 3);
});

test('saving an existing bookmark is idempotent and uses an atomic update', async () => {
  const cardId = '507f1f77bcf86cd799439012';
  const user = new User({ username: 'reader', email: 'reader@example.com', passwordHash: 'test', bookmarks: [cardId] });
  const lookup = mock.method(User, 'findById', () => ({ select: async () => user }));
  const exists = mock.method(Card, 'exists', async () => ({ _id: cardId }));
  const update = mock.method(User, 'updateOne', async () => ({ modifiedCount: 0 }));
  const save = mock.method(user, 'save', async () => user);
  try {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    for (let i = 0; i < 2; i++) {
      const res = await request(`/users/bookmark/${cardId}`, {}, token);
      assert.equal(res.status, 200);
      assert.equal((await res.json()).bookmarked, true);
    }
    assert.deepEqual(update.mock.calls[0].arguments[1], { $addToSet: { bookmarks: cardId } });
    assert.equal(save.mock.callCount(), 0);
  } finally { lookup.mock.restore(); exists.mock.restore(); update.mock.restore(); save.mock.restore(); }
});


test('completion retries repair history using a stable, idempotent completion key', async () => {
  const DailyFeed = require('../models/DailyFeed');
  const cardId = '507f1f77bcf86cd799439012';
  const completedAt = new Date('2026-10-06T12:00:00Z');
  const user = new User({ username: 'reader', email: 'reader@example.com', passwordHash: 'test' });
  const lookup = mock.method(User, 'findById', () => ({ select: async () => user }));
  const feed = mock.method(DailyFeed, 'findOneAndUpdate', async (query, pipeline, options) => {
    assert.equal(String(query['cards.card']), cardId);
    assert.equal(pipeline[0].$set.cards.$map.in.$cond[1].$mergeObjects[1].completedAt.$ifNull[1], '$$NOW');
    assert.ok(pipeline[1].$set.currentIndex.$size.$filter);
    assert.equal(options.new, true);
    return { cards: [{ card: cardId, isCompleted: true, completedAt }], currentIndex: 1, isCompleted: true };
  });
  let historyAttempts = 0;
  const update = mock.method(User, 'updateOne', async (query, change) => {
    if (change.$push) {
      historyAttempts++;
      assert.equal(String(query.seenCards.$not.$elemMatch.card), cardId);
      assert.equal(query.seenCards.$not.$elemMatch.seenAt, completedAt);
      assert.equal(change.$push.seenCards.$each[0].seenAt, completedAt);
      assert.equal(change.$push.seenCards.$slice, -500);
      assert.equal(change.$inc.totalCardsRead, 1);
      if (historyAttempts === 1) throw new Error('Transient database interruption');
    }
    return { modifiedCount: 1 };
  });
  try {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    assert.equal((await request(`/feed/complete/${cardId}`, {}, token, 'PATCH')).status, 503);
    const retry = await request(`/feed/complete/${cardId.toUpperCase()}`, {}, token, 'PATCH');
    assert.equal(retry.status, 200);
    assert.deepEqual(await retry.json(), { currentIndex: 1, isCompleted: true });
    assert.equal(historyAttempts, 2);
  } finally { lookup.mock.restore(); feed.mock.restore(); update.mock.restore(); }
});
