require('dotenv').config();
const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const helmet        = require('helmet');
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// ── Startup env validation ────────────────────────────────────────────────────
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,   // allow YouTube iframes
  contentSecurityPolicy: false,        // handled by frontend
}));

// ── CORS — frontend URL only ──────────────────────────────────────────────────
const ALLOWED = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

function isOriginAllowed(origin) {
  if (!origin) return true;                         // curl / health checks
  if (ALLOWED.includes(origin)) return true;
  if (process.env.NODE_ENV === 'production' && origin.endsWith('.onrender.com')) return true;
  if (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app')) return true;
  return false;
}

app.use(cors({
  origin: (origin, cb) => isOriginAllowed(origin)
    ? cb(null, true)
    : cb(new Error(`CORS: origin ${origin} not allowed`)),
  methods:     ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));

// ── Body parsing (10 kb limit stops large payload DoS) ───────────────────────
app.use(express.json({ limit: '10kb' }));

// ── NoSQL injection sanitizer ─────────────────────────────────────────────────
app.use(mongoSanitize());

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,  // 15 min window
  max:            20,              // 20 attempts per window
  message:        { message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders:  false,
});

const apiLimiter = rateLimit({
  windowMs:       60 * 1000,  // 1 min window
  max:            120,        // 120 req/min per IP
  standardHeaders: true,
  legacyHeaders:  false,
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/users/login',    authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api',                apiLimiter);

app.use('/api/cards',       require('./routes/cards'));
app.use('/api/feed',        require('./routes/feed'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/pipeline',    require('./routes/pipeline'));
app.use('/api/admin',       require('./routes/admin'));

app.get('/api/status', (_, res) => res.json({ status: 'ok', app: 'MindFeed' }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[error]', err.message);
  const status  = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ message });
});

// ── DB + Start ────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 MindFeed API on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });
