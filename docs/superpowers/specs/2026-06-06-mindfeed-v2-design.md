# MindFeed V2 Design Spec
**Date:** 2026-06-06  
**Author:** Apostolos Peinires  
**Status:** Approved

---

## Overview

MindFeed V1 is a working anti-doom-scroll PWA: 10 cards/day, JWT auth, Claude pipeline, Greek-first. V2 elevates it to production quality — buttery animations, bookmarks screen, bilingual UI, and a sustainable content pipeline that keeps the database growing without manual work.

**Non-negotiables carried forward:**
- Hard 10 cards/day limit — no exceptions
- Every card has a real source with URL/DOI
- No likes, no share counts, no streaks pressure
- Greek language first for card content

---

## Section 1 — Architecture

### Frontend
```
src/
  i18n/
    el.json         ← ~60 UI string keys (Greek)
    en.json         ← same keys (English)
    useT.js         ← context hook, returns t(key)
  context/
    AuthContext.jsx  (existing)
    LangContext.jsx  (new)
  components/
    Card.jsx         (existing, add Framer Motion)
    Feed.jsx         (existing, add motion variants)
    AuthForm.jsx     (existing, add t() calls)
    BookmarksScreen.jsx  (new)
    LangPicker.jsx   (new, first-launch screen)
    AdminPanel.jsx   (new, draft review UI)
  motion/
    variants.js      (shared animation config)
```

### Backend additions
```
backend/
  routes/
    admin.js         ← draft review + pipeline trigger
  scripts/
    weeklyPipeline.js  ← PubMed fetch × 5, auto-draft
    expandSeed.js      ← one-time 10 → 50 seed expansion
  middleware/
    adminAuth.js     ← single env-var password check
```

### State flow (no change to existing)
Auth → Feed → Card interactions. Bookmarks pulled from `user.bookmarks` via `GET /api/users/bookmarks`. Language stored in `localStorage` + `PATCH /api/users/preferences`.

---

## Section 2 — Animation System

### Approach: Framer Motion + CSS micro-interactions (B+C hybrid)

Install: `framer-motion` (frontend only, ~30KB gzip).

**Shared variants** (`src/motion/variants.js`):
```js
export const cardVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22,1,0.36,1] } },
  exit:   { opacity: 0, x: -40, transition: { duration: 0.2, ease: 'easeIn' } }
}

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }
}

export const springScale = {
  tap: { scale: 0.94 }
}
```

**Applied to:**
| Element | Animation |
|---------|-----------|
| Card transition (next/prev) | `cardVariants` via `AnimatePresence` |
| Save button | CSS `transform: scale(0.94)` on `:active` + color transition |
| Progress bar fill | CSS `transition: width 0.4s cubic-bezier(0.4,0,0.2,1)` (already done) |
| Done screen appear | `fadeUp` stagger on icon → title → subtitle |
| Bookmark screen mount | `fadeUp` |
| Lang picker cards | `springScale` on tap |
| Dot indicator active | CSS `transform: scale(1.4)` (already done) |

**Rule:** no animation > 300ms. `prefers-reduced-motion` media query wraps all Framer variants with `duration: 0`.

**CSS micro-interactions** (no library needed):
- Button hover: `background 0.15s` (already done)
- Badge hover: `opacity 0.85`
- Source link underline on hover
- Logout button: `background 0.15s` (already done)

---

## Section 3 — Navigation + Bookmarks

### Navigation additions
Feed header gains a bookmark icon button (🔖) alongside the existing logout button. Tap → slides to `BookmarksScreen`.

No router installed. Navigation state: `view` enum in `App.jsx` — `'feed' | 'bookmarks'`. Transitions via `AnimatePresence` with `fadeUp`.

```jsx
// App.jsx (simplified)
const [view, setView] = useState('feed')
// Feed passes onBookmarks={() => setView('bookmarks')}
// BookmarksScreen passes onBack={() => setView('feed')}
```

### BookmarksScreen component
```
┌─────────────────────────┐
│ ← Αποθηκευμένα    🔖 4 │  ← header
├─────────────────────────┤
│ [Card title]            │
│ 🧬 Βιολογία · easy · 3′ │
│ ─────────────────────── │
│ [Card title]            │
│ 🌿 Φύση · medium · 4′   │
│ …                       │
└─────────────────────────┘
```

Each row: title + category emoji + difficulty badge + read time. Tap row → list slides out, full `Card.jsx` slides in (read-only: no "next" nav, no swipe to advance). Back arrow returns to list.

Bookmarks loaded from `GET /api/users/bookmarks` on mount. Remove bookmark: swipe left or long-press → trash icon → `DELETE /api/users/bookmarks/:cardId`.

**Backend endpoint (new):**
- `GET /api/users/bookmarks` — returns populated card array from `user.bookmarks`
- `DELETE /api/users/bookmarks/:cardId` — pulls card from array

---

## Section 4 — Language Picker + i18n

### Architecture
Custom `useT()` hook — no react-i18next. Two flat JSON files, ~60 keys each.

```
src/i18n/
  el.json
  en.json
  useT.js     ← reads LangContext, returns t(key)
```

`LangContext.jsx`: reads `localStorage.getItem('mf_lang')` on init. Exposes `{ lang, setLang }`. `setLang` writes to localStorage + fires `PATCH /api/users/preferences { language }` if authenticated.

`useT(key, vars?)` supports simple interpolation: `t('feed.counter', { current: 3, total: 10 })` replaces `{{current}}` and `{{total}}` in the string.

### First-launch screen (LangPicker)
Shown when `mf_lang` is null (first visit). Replaces AuthForm temporarily — once language chosen, AuthForm appears. Two tap cards:

```
┌─────────────────────────────────────┐
│         Καλώς ήρθες στο             │
│              MindFeed               │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │     🇬🇷       │ │     🇬🇧       │  │
│  │   Ελληνικά   │ │   English    │  │
│  └──────────────┘ └──────────────┘  │
└─────────────────────────────────────┘
```

Tap → sets lang → mounts AuthForm.

### Language toggle in feed
Settings gear icon (⚙️) in header → inline dropdown: `🇬🇷 Ελληνικά` / `🇬🇧 English`. Updates instantly (React context), persists to localStorage + backend.

### i18n key set (~60 keys)
```json
{
  "app.name": "MindFeed",
  "lang.pick_prompt": "Καλώς ήρθες",
  "auth.login": "Σύνδεση",
  "auth.register": "Εγγραφή",
  "auth.email": "Email",
  "auth.password": "Κωδικός",
  "auth.name": "Όνομα",
  "auth.demo": "Δοκιμή χωρίς λογαριασμό",
  "feed.counter": "{{current}} / {{total}}",
  "feed.done.title": "Τελείωσες για σήμερα!",
  "feed.done.sub": "Επέστρεψε αύριο για νέες κάρτες.",
  "feed.done.restart": "Ξεκινά από την αρχή",
  "card.why_label": "Γιατί έχει σημασία",
  "card.tldr_label": "Με λίγα λόγια",
  "card.save": "Αποθήκευση",
  "card.saved": "Αποθηκεύτηκε",
  "card.source": "Πηγή",
  "card.difficulty.easy": "Εύκολο",
  "card.difficulty.medium": "Μέτριο",
  "card.difficulty.advanced": "Προχωρημένο",
  "nav.bookmarks": "Αποθηκευμένα",
  "nav.logout": "Έξοδος",
  "nav.settings": "Ρυθμίσεις",
  "bookmarks.empty": "Δεν έχεις αποθηκεύσει κάρτες ακόμα.",
  "bookmarks.back": "Πίσω"
}
```
English equivalent keys have the same IDs with English values.

---

## Section 5 — Content Pipeline

### Phase A: Seed expansion (one-time)
`backend/scripts/expandSeed.js` — manual script, run locally against prod MongoDB once.

Target: 50 cards across 18 categories (~3 per category). Written/curated manually with real DOIs. Same format as existing 10-card seed. Covers all major categories so every user sees varied content on day one regardless of preferences.

Run: `MONGO_URI=... node scripts/expandSeed.js`

### Phase B: Weekly automated drafts
`backend/scripts/weeklyPipeline.js`:

```
1. Query PubMed eutils: 1 recent paper per top-5 categories by user engagement
2. claudePipeline.createCardFromPubMed() × 5
3. Cards saved: status='draft', aiGenerated=true
4. Admin notification: console log (upgrade to email later)
```

Triggered manually: `POST /api/admin/run-pipeline` (admin auth required) or `node scripts/weeklyPipeline.js` locally.

**No Render cron (free tier).** Upgrade path: add Render cron job config in one line when upgrading plan.

### Phase C: Admin draft review
`GET /admin` — password-protected single-page review UI.

Auth: `Authorization: Bearer <ADMIN_PASSWORD>` env var. Simple `adminAuth.js` middleware — no user accounts.

Draft table:
```
Title                    Category    Difficulty  Source              Actions
────────────────────────────────────────────────────────────────────────────
Η σεροτονίνη και...     Βιολογία    medium      Nature Neurosci.   ✓ Publish  ✗ Discard
Νέα έρευνα για...        Ψυχολογία  easy        PNAS               ✓ Publish  ✗ Discard
```

Publish → `PATCH /api/admin/cards/:id { status: 'published' }`.
Discard → `DELETE /api/admin/cards/:id`.

---

## Implementation Order (Layered)

| Layer | What | Why first |
|-------|------|-----------|
| 1 | Framer Motion + animation variants | Foundation for all transitions |
| 2 | i18n (useT hook + JSON files + LangPicker) | Needed before adding new UI text |
| 3 | Bookmarks screen + backend endpoints | Builds on animation layer |
| 4 | Admin panel + weeklyPipeline script | Backend-only, independent |
| 5 | Seed expansion (50 cards) | Content, runs last |

Each layer ships independently and is fully testable before the next begins.

---

## Out of Scope (V2)

- Push notifications
- Social sharing
- User-generated content
- Multiple languages for card content (Claude writes Greek only for now)
- Analytics dashboard
- Paid tier / subscription

---

## Success Criteria

- Card-to-card transition feels instant and smooth on a mid-range phone
- Language switch takes < 100ms (no network round-trip for UI)
- Bookmarks screen loads in < 500ms
- Weekly pipeline produces ≥ 3 publishable cards per run
- Admin can review and publish drafts in < 2 minutes total
- 50 seed cards cover all 18 categories with ≥ 2 cards each
