const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const auth     = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'Username or email taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({ token: sign(user._id), user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();
    res.json({ token: sign(user._id), user: { id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me
router.get('/me', auth, (req, res) => res.json(req.user));

// PATCH /api/users/preferences
router.patch('/preferences', auth, async (req, res) => {
  try {
    Object.assign(req.user.preferences, req.body);
    await req.user.save();
    res.json(req.user.preferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/bookmark/:cardId
router.post('/bookmark/:cardId', auth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const idx = req.user.bookmarks.indexOf(cardId);
    if (idx === -1) {
      req.user.bookmarks.push(cardId);
    } else {
      req.user.bookmarks.splice(idx, 1); // toggle
    }
    await req.user.save();
    res.json({ bookmarked: idx === -1, total: req.user.bookmarks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
