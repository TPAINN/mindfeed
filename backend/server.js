require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/cards',    require('./routes/cards'));
app.use('/api/feed',     require('./routes/feed'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/pipeline',  require('./routes/pipeline'));

app.get('/api/status', (_, res) => res.json({ status: 'ok', app: 'MindFeed' }));

// ── DB + Start ────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 MindFeed API running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => { console.error('❌ MongoDB error:', err); process.exit(1); });
