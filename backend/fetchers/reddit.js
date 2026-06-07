/**
 * Reddit public JSON API fetcher — no key needed
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

async function fetchRedditSubreddit(sub, categorySlug, minScore = 500, limit = 8) {
  const url = `https://www.reddit.com/r/${sub}/top.json?t=week&limit=${limit * 2}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MindFeed/1.0 (knowledge app)',
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
