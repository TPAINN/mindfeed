const crypto = require('crypto');

module.exports = function adminAuth(req, res, next) {
  const token    = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const expected = process.env.ADMIN_PASSWORD || '';

  if (!token || !expected) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Timing-safe comparison — prevents timing side-channel attacks
  // Pad both buffers to the same length first
  const maxLen = Math.max(token.length, expected.length);
  const tokBuf = Buffer.alloc(maxLen);
  const expBuf = Buffer.alloc(maxLen);
  Buffer.from(token).copy(tokBuf);
  Buffer.from(expected).copy(expBuf);

  const lengthMatch = token.length === expected.length;
  const valueMatch  = crypto.timingSafeEqual(tokBuf, expBuf);

  if (!lengthMatch || !valueMatch) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
};
