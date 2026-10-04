/**
 * Reddit fetcher — free app-only OAuth (anonymous access is blocked from servers)
 * Reads top posts from curated subreddits
 */

const SUBREDDITS = [
  { sub: 'lifehacks',          categorySlug: 'lifehacks',    minScore: 500  },
  { sub: 'todayilearned',      categorySlug: 'funfacts',     minScore: 1000 },
  { sub: 'science',            categorySlug: 'science',      minScore: 500  },
  { sub: 'explainlikeimfive',  categorySlug: 'science',      minScore: 500  },
  { sub: 'psychology',         categorySlug: 'psychology',   minScore: 200  },
  { sub: 'history',            categorySlug: 'history',      minScore: 300  },
  { sub: 'nature',             categorySlug: 'nature',       minScore: 300  },
];

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
const SKIP_DOMAINS = ['v.redd.it', 'youtube.com', 'youtu.be'];

function extractImageUrl(post) {
  if (post.url && IMAGE_EXTENSIONS.test(post.url)) return post.url;
  if (post.thumbnail && !['self','default','nsfw','spoiler'].includes(post.thumbnail)) {
    return post.thumbnail;
  }
  return null;
}

/*
 * Reddit refuses anonymous requests from cloud servers (GitHub Actions, Render
 * all got 403 on every subreddit). Its free app-only OAuth works from anywhere:
 * create a "script" app at reddit.com/prefs/apps (free) and set
 * REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET. Without them Reddit is skipped.
 */
const redditEnabled = () => Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
const UA = 'MindFeed/1.0 (knowledge app)';
let token = null;

async function accessToken() {
  if (token && token.expires > Date.now()) return token.value;
  const basic = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Reddit token error ${res.status}`);
  const data = await res.json();
  token = { value: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return token.value;
}

async function fetchRedditSubreddit(sub, categorySlug, minScore = 500, limit = 8) {
  const url = `https://oauth.reddit.com/r/${sub}/top?t=week&limit=${limit * 2}&raw_json=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'User-Agent': UA,
      'Accept':     'application/json',
    },
  });
  if (!res.ok) throw new Error(`Reddit API error ${res.status} for r/${sub}`);
  const data = await res.json();

  return data.data.children
    .map(c => c.data)
    .filter(p =>
      p.score >= minScore &&
      !p.over_18 &&
      !p.stickied &&
      (p.selftext?.length > 80 || p.title?.length > 40) &&
      !SKIP_DOMAINS.some(d => p.url?.includes(d))
    )
    .slice(0, limit)
    .map(p => ({
      title:       p.title.replace(/^TIL\s+/i, '').replace(/^ELI5:\s*/i, ''),
      body:        p.selftext || p.title,
      sourceUrl:   `https://reddit.com${p.permalink}`,
      sourceType:  'website',
      sourceAuthor:`r/${sub}`,
      imageUrl:    extractImageUrl(p),
      categorySlug,
    }));
}

async function fetchAllReddit(limitPerSub = 5) {
  if (!redditEnabled()) {
    console.log('   ⏭  REDDIT_CLIENT_ID/SECRET not set — skipping Reddit (free app: reddit.com/prefs/apps)');
    return [];
  }
  const results = [];
  for (const { sub, categorySlug, minScore } of SUBREDDITS) {
    try {
      const items = await fetchRedditSubreddit(sub, categorySlug, minScore, limitPerSub);
      results.push(...items);
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.warn(`Reddit fetch failed for r/${sub}: ${err.message}`);
    }
  }
  return results;
}

module.exports = { fetchAllReddit, fetchRedditSubreddit, SUBREDDITS };
