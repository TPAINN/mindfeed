# MindFeed — Project Context for Claude Code

## What We're Building
**MindFeed** — Anti-doom-scroll knowledge PWA. Daily feed of 10 verified knowledge cards (science, psychology, nature, philosophy, etc.) that make the user smarter, not anxious. No infinite scroll, no likes, no manipulation.

---

## Tech Stack
- **Frontend:** React + Vite (PWA)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **AI Layer:** Claude API (content simplification pipeline)
- **Hosting:** Render (free tier)
- **Content APIs:** PubMed, arXiv, NASA, OpenLibrary, Wikipedia

---

## Project Structure (to be created)
```
mindfeed/
├── backend/
│   ├── models/
│   │   ├── Category.js       ✅ DONE
│   │   ├── Card.js           ✅ DONE
│   │   ├── User.js           ✅ DONE
│   │   └── DailyFeed.js      ✅ DONE
│   ├── services/
│   │   └── feedGenerator.js  ✅ DONE
│   ├── routes/               ← NEXT: build these
│   │   ├── cards.js
│   │   ├── feed.js
│   │   └── users.js
│   ├── seed.js               ✅ DONE (10 verified cards)
│   ├── server.js             ← NEXT: build this
│   └── package.json
└── frontend/
    └── src/
        ├── components/
        │   └── Card.jsx      ← NEXT: build this
        └── App.jsx
```

---

## MongoDB Schema Summary

### `Category` — 18 categories
slug, name, emoji, color, order, isActive

### `Card` — Core content unit
- `title` (120 chars), `body` (800 chars), `whyItMatters`, `tldr`
- `category` (ref), `tags[]`, `mood[]`
- `source` embedded: { type, title, author, year, url, doi, publisher }
- `difficulty`: easy | medium | advanced
- `status`: draft | published | archived
- `language`: el | en
- `aiGenerated`, `verified`, `readTimeSec`
- `stats` embedded: { views, saves, shares }
- Text index on title + body + tags
- Compound index: status + language + category

### `User`
- preferences: { categories[], language, difficulty, dailyCardLimit(10), theme }
- streak: { current, longest, lastActiveDate, totalDaysActive }
- seenCards: rolling window max 500 entries { card, seenAt, engagement }
- bookmarks: Card[]
- knowledgeProfile: [{ categoryId, score, cardsRead, cardsSaved }]
- Methods: `addSeenCard()`, `updateStreak()`

### `DailyFeed`
- user + date (unique compound index)
- cards[]: { card, position, isCompleted, completedAt }
- currentIndex (resume position)
- Idempotent: safe to call multiple times same day

---

## Feed Generation Algorithm (feedGenerator.js)
1. Exclude already seen cards (seenIds from user.seenCards)
2. Weight preferred categories from knowledgeProfile scores
3. Spread across categories: ceil(10 / categoryPool.length) per category
4. Filler from general pool if < 10 cards found
5. Shuffle before serving
6. Returns existing DailyFeed if already generated today (idempotent)

---

## Seed Data (seed.js)
10 verified cards ready with real DOIs:
- 🌿 Shinrin-yoku / forest bathing (Nature Reviews)
- ☀️ Circadian biology / morning light (Huberman / Royal Society B)
- 🧠 Multitasking myth (Gloria Mark, UCI)
- 🌌 2 trillion galaxies (Astrophysical Journal)
- 💪 2-Minute Rule (GTD / David Allen)
- 🧬 Gut-brain serotonin 90% (Nature Neuroscience)
- 🏛️ Amor Fati / Stoicism (Ryan Holiday)
- 🍎 Sleep & Alzheimer (Matthew Walker)
- 💰 Compound interest
- 🦁 Octopus color vision (PNAS)

Run: `node seed.js` after setting MONGO_URI env var.

---

## What's Next (Priority Order)
1. **`backend/server.js`** — Express setup, mongoose connect, middleware
2. **`backend/routes/cards.js`** — GET /api/cards, GET /api/cards/:id
3. **`backend/routes/feed.js`** — GET /api/feed/today (calls feedGenerator)
4. **`backend/routes/users.js`** — auth, preferences, bookmarks
5. **`frontend/Card.jsx`** — Core card component (swipe, title, body, source, save)
6. **`frontend/Feed.jsx`** — Daily feed container (10-card limit UI)
7. **Claude pipeline** — PubMed abstract → simplified Greek card

---

## Design Principles (Non-Negotiable)
- Hard limit: 10 cards/day — no infinite scroll
- Every card has a real source with URL/DOI
- `whyItMatters` field on every card — practical relevance
- Anti-anxiety UX: no likes, no share counts, no streaks pressure
- Greek language first (language: 'el')

---

## Developer Notes
- User is Apostolos, solo developer, Greece
- Familiar with: React/Vite, Node/Express, MongoDB/Mongoose, Render deployment
- Style: surgical code edits, no monolithic dumps, Greek communication preferred
- Similar existing project: Smart Grocery Hub (same stack, same Render account)
