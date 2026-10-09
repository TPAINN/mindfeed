const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { isObjectIdOrHexString } = require('mongoose');

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token' });

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded || !isObjectIdOrHexString(decoded.id)) throw new Error('Invalid subject');
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
  try {
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user || !req.user.isActive) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    next(err);
  }
};
