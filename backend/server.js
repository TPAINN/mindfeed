"use strict";

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

require('dotenv').config();

// ── Startup env validation ────────────────────────────────────────────────────
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED.filter(k => !process.env[k]);
if (require.main === module && missing.length) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

// ── Security headers with production-ready configuration ───────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// ── CORS — frontend URL only with production safety ───────────────────────────────────────────
const ALLOWED = [
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173',
  'http://localhost:4173',
  // MindFeed dev is conventionally launched on 5176 (see CLAUDE.md)
  'http://localhost:5176',
  'http://127.0.0.1:5176'] : []),
  ...(process.env.FRONTEND_URL || '').split(',').map(url => url.trim().replace(/\/$/, '')).filter(Boolean),
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED.includes(origin);
}

app.use(cors({
  origin: (origin, cb) => isOriginAllowed(origin)
    ? cb(null, true)
    : cb(Object.assign(new Error('Origin not allowed'), { status: 403 })),
  methods:     ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));

// ── Trust proxy for Render deployment ───────────────────────────────────────────
app.set('trust proxy', 1);

// ── Body parsing (10 kb limit stops large payload DoS) ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── NoSQL injection sanitizer ───────────────────────────────────────────
app.use(mongoSanitize());

// ── Rate limiters ───────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            20,
  message:        { message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders:  false,
});

const apiLimiter = rateLimit({
  windowMs:       60 * 1000,
  max:            120,
  message:        { message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders:  false,
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users/login',    authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/admin',          authLimiter);
app.use('/api/pipeline',       authLimiter);
app.use('/api',                apiLimiter);

app.use('/api/cards',       require('./routes/cards'));
app.use('/api/feed',        require('./routes/feed'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/pipeline',    require('./routes/pipeline'));
app.use('/api/admin',       require('./routes/admin'));

// ── Health check endpoint ───────────────────────────────────────────
app.get('/api/status', (_, res) => res.json({ 
  status: 'ok', 
  app: 'MindFeed', 
  timestamp: new Date().toISOString() 
}));

app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));

// ── Global error handler ───────────────────────────────────────────
app.use((err, req, res, _next) => {
  const status  = err.status || 500;
  if (status >= 500) console.error('[error]', err.message, { stack: err.stack, path: req.path, method: req.method });
  const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ 
    message, 
    ...(process.env.NODE_ENV !== 'production' && { 
      error: err.message, 
      stack: err.stack,
      url: req.url,
      method: req.method
    })
  });
});

// ── DB + Start ───────────────────────────────────────────
if (require.main === module) mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 MindFeed API on port ${PORT}`);
    });
  })
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

module.exports = app;
