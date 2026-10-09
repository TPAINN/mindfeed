const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const auth     = require('../middleware/auth');
const Card     = require('../models/Card');
const { isObjectIdOrHexString } = require('mongoose');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Never leak Mongoose/JWT internals to the client — generic message in production.
function fail500(res, err) {
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  res.status(500).json({ message });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof req.body.username !== 'string' || typeof req.body.email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: 'All fields required' });
    const username = req.body.username.trim();
    const email = req.body.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_RE.test(email))
      return res.status(400).json({ message: 'Invalid email' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password too short' });
    if (Buffer.byteLength(password, 'utf8') > 72)
      return res.status(400).json({ message: 'Password exceeds 72 bytes' });
    if (username.length < 3 || username.length > 30)
      return res.status(400).json({ message: 'Invalid username' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'Username or email taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({ token: sign(user._id), user: { id: user._id, username, email } });
  } catch (err) {
    // Race on the unique indexes (two registers same instant) → 11000
    if (err.code === 11000) return res.status(409).json({ message: 'Username or email taken' });
    fail500(res, err);
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof req.body.email !== 'string' || typeof password !== 'string' || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const email = req.body.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_RE.test(email))
      return res.status(400).json({ message: 'Invalid email' });
    const user = await User.findOne({ email });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();
    res.json({ token: sign(user._id), user: { id: user._id, username: user.username, email } });
  } catch (err) {
    fail500(res, err);
  }
});

// GET /api/users/me
router.get('/me', auth, (req, res) => res.json(req.user));

// PATCH /api/users/preferences
// Whitelist prevents mass-assignment of arbitrary user fields
const ALLOWED_PREFS = ['language', 'difficulty', 'dailyCardLimit', 'theme', 'categories'];

router.patch('/preferences', auth, async (req, res) => {
  try {
    if (req.body.dailyCardLimit !== undefined &&
        (!Number.isInteger(req.body.dailyCardLimit) || req.body.dailyCardLimit < 3 || req.body.dailyCardLimit > 20))
      return res.status(400).json({ message: 'Daily card limit must be an integer from 3 to 20' });
    if (req.body.categories !== undefined &&
        (!Array.isArray(req.body.categories) || req.body.categories.length > 30 || !req.body.categories.every(isObjectIdOrHexString)))
      return res.status(400).json({ message: 'Invalid categories' });
    const safe = {};
    ALLOWED_PREFS.forEach(k => { if (req.body[k] !== undefined) safe[k] = req.body[k]; });
    Object.assign(req.user.preferences, safe);
    await req.user.save();
    res.json(req.user.preferences);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError')
      return res.status(400).json({ message: 'Invalid preferences' });
    fail500(res, err);
  }
});

// GET /api/users/bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    // Nested populate so the frontend gets the full category (icon, name) on
    // every bookmarked card — a shallow populate left `category` as a raw
    // ObjectId, which the UI could not render.
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'category', select: 'name slug emoji color' },
    });
    res.json(user.bookmarks || []);
  } catch (err) {
    fail500(res, err);
  }
});

// DELETE /api/users/bookmarks/:cardId
router.delete('/bookmarks/:cardId', auth, async (req, res) => {
  try {
    if (!isObjectIdOrHexString(req.params.cardId))
      return res.status(400).json({ message: 'Invalid card ID' });
    await User.updateOne({ _id: req.user.id }, { $pull: { bookmarks: req.params.cardId } });
    res.json({ message: 'Removed' });
  } catch (err) {
    fail500(res, err);
  }
});

// POST /api/users/bookmark/:cardId
router.post('/bookmark/:cardId', auth, async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!isObjectIdOrHexString(cardId))
      return res.status(400).json({ message: 'Invalid card ID' });
    if (!await Card.exists({ _id: cardId, status: 'published' }))
      return res.status(404).json({ message: 'Card not found' });
    await User.updateOne({ _id: req.user.id }, { $addToSet: { bookmarks: cardId } });
    res.json({ bookmarked: true });
  } catch (err) {
    fail500(res, err);
  }
});

module.exports = router;
