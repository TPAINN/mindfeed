# MindFeed V3 — Rich Media + Multi-API Auto-Discovery

**Date:** 2026-06-07
**Status:** Approved → Implementation

---

## 1. Goals

- Scale DB to 500–1000 published cards
- Automatic weekly content discovery (zero manual intervention)
- 4 new content sources: YouTube, Wikipedia, NASA, Reddit
- Rich media cards: inline video player (YouTube embed + MP4), card images
- All media stays in-app; only source citation link opens externally

---

## 2. Architecture

### New backend files
```
backend/fetchers/
  youtube.js      YouTube Data API v3 (free, 10k units/day)
  wikipedia.js    Wikipedia REST API (free, no key)
  nasa.js         NASA APOD + Image/Video Library (free key)
  reddit.js       Reddit public JSON API (no key)

backend/services/
  autoDiscovery.js    Orchestrator — runs all fetchers → Claude → drafts

backend/scripts/
  autoDiscover.js     CLI entry (called by GitHub Actions + manual)
  bulkDiscover.js     One-time bulk run to seed 500+ cards fast

.github/workflows/
  weekly-discovery.yml   Cron every Monday 08:00 UTC
```

### Modified backend files
```
backend/models/Card.js          + videoUrl, videoType, videoThumbnailUrl
backend/services/claudePipeline.js  + createCardFromContent()
backend/routes/admin.js         + POST /api/admin/run-discovery
```

### New frontend files
```
frontend/src/components/VideoPlayer.jsx
frontend/src/components/VideoPlayer.css
```

### Modified frontend files
```
frontend/src/components/Card.jsx   + video toggle + image display
frontend/src/i18n/el.json          + card.video_label
frontend/src/i18n/en.json          + card.video_label
```

---

## 3. Fetcher Contracts

Each fetcher returns `RawContent[]`:
```js
{
  title: String,
  body: String,         // description / extract / selftext
  sourceUrl: String,    // for deduplication
  sourceType: String,   // 'website' | 'nasa' | 'pubmed'
  imageUrl?: String,
  videoId?: String,     // YouTube only
  videoThumbnailUrl?: String,
}
```

### YouTube keyword → category map
| Keyword | Category slug |
|---------|--------------|
| life hack daily | lifehacks |
| how to cook efficiently | lifehacks |
| psychology trick explained | psychology |
| amazing nature facts | nature |
| science fact mind blowing | science |
| stoicism philosophy daily | philosophy |
| health longevity tips | health |
| history mystery fact | history |
| biology explained simple | biology |
| finance money tip | finance |

### Wikipedia topic → category map
30 curated topics across all 18 categories.

### NASA → always `universe`

### Reddit subreddit → category map
| Subreddit | Category |
|-----------|---------|
| r/lifehacks | lifehacks |
| r/todayilearned | funfacts |
| r/science | science |
| r/explainlikeimfive | science |

---

## 4. Card Model Changes

```js
videoUrl:           String   // YouTube embed URL or direct MP4
videoType:          String   // 'youtube' | 'mp4'
videoThumbnailUrl:  String   // thumbnail for collapsed state
```

---

## 5. VideoPlayer Component

- Collapsed by default: shows thumbnail + play button overlay
- Click → Framer Motion expand animation → video appears
- YouTube: `<iframe>` with `autoplay=1&rel=0&modestbranding=1`
- MP4: `<video controls autoPlay>`
- Integrated into Card.jsx as a toggle section (same pattern as TL;DR)

---

## 6. Auto-Discovery Flow

```
GitHub Actions (every Monday 08:00 UTC)
  → POST /api/admin/run-discovery (Bearer ADMIN_PASSWORD)
    → autoDiscovery.runAutoDiscovery()
      → fetchYouTube() × 10 keywords × 2 results = ~20 items
      → fetchWikipedia() × 5 random topics = ~5 items
      → fetchNASA() × 5 APOD entries = ~5 items
      → fetchReddit() × 4 subreddits × 5 posts = ~20 items
      → deduplicate by source.url
      → Claude converts each → Greek draft card
      → save to DB with status: 'draft'
    → returns { created, skipped, failed }
```

Weekly yield: ~30–40 new draft cards per run.

---

## 7. Bulk Seed Strategy

`bulkDiscover.js` — one-time run:
- YouTube: 20 keywords × 3 = 60 items
- Wikipedia: 30 topics × 1 = 30 items
- NASA: 20 APOD = 20 items
- Reddit: 4 subreddits × 10 = 40 items
- Total potential: ~150 new cards

With existing 50 + 150 bulk = 200 on day 1.
Weekly +30–40 → 500 cards in ~10 weeks.

---

## 8. GitHub Secrets Required

| Secret | Value |
|--------|-------|
| MINDFEED_API_URL | Render backend URL |
| ADMIN_PASSWORD | Same as .env |

---

## 9. API Keys Required (all free)

| API | Where to get |
|-----|-------------|
| YouTube Data API v3 | console.cloud.google.com |
| NASA API key | api.nasa.gov |
| Wikipedia | None needed |
| Reddit | None needed |
