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
- **Content APIs:** PubMed (search + fetch), OpenAlex, Europe PMC, NASA APOD,
  Wikipedia, YouTube (optional), Reddit — see `backend/fetchers/`

---

## Current State (updated 2026-07-19 — app is SHIPPED, not greenfield)
- **Frontend LIVE:** https://mindfeed-tpainn.vercel.app (Vercel; never guess other URLs —
  see memory `vercel-portfolio-map`)
- **Backend:** Render free tier (`render.yaml`), service `mindfeed-api`. Free-tier hours
  are shared account-wide — NEVER add keepalive pings (see memory
  `render-free-tier-keepalive-postmortem`); cold starts are handled app-side.
- **Actions:** `.github/workflows/daily-discovery.yml` — runs DAILY, 06:00 UTC.
  Connects to MongoDB directly from the GitHub runner (`scripts/autoDiscover.js`
  + `scripts/weeklyPipeline.js`) and NEVER calls the Render API — zero Render
  instance-hours regardless of cadence. (A now-fixed 2026-07-20 version curled
  `/api/admin/run-discovery`, which woke Render on every run — don't reintroduce
  that pattern.) Needs repo secrets: `MONGO_URI`, `ANTHROPIC_API_KEY`,
  `NASA_API_KEY`, optional `YOUTUBE_API_KEY` (same values as Render's env vars —
  add once in GitHub repo Settings → Secrets and variables → Actions).
  Sources: Wikipedia, NASA APOD, Reddit, YouTube (if key set), OpenAlex,
  Europe PMC, PubMed (live-searched, not hardcoded PMIDs). New cards land as
  `status:'draft'` — review via `GET/PATCH /api/admin/...`.
  The old `keep-alive.yml` was deleted 2026-07-18 — do not recreate it.
- **Structure:** `backend/` (models, services, routes, seed.js, server.js) and
  `frontend/src/` (components, context, api, i18n, motion). Grep the repo for current
  state — do NOT trust old plans in this file's history.
- Dev server: launch config `mindfeed-dev` (port 5176) in `Documents\GitHub\.claude\launch.json`.

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
