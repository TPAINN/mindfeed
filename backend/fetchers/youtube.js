/**
 * YouTube Data API v3 fetcher
 * Free quota: 10,000 units/day. One search = 100 units.
 * Get key: console.cloud.google.com → Enable "YouTube Data API v3"
 */

const KEYWORDS = [
  { keyword: 'life hack daily useful',              categorySlug: 'lifehacks'    },
  { keyword: 'how to cook efficiently kitchen tip', categorySlug: 'lifehacks'    },
  { keyword: 'psychology trick explained simple',   categorySlug: 'psychology'   },
  { keyword: 'amazing nature facts animals',        categorySlug: 'nature'       },
  { keyword: 'science fact mind blowing explained', categorySlug: 'science'      },
  { keyword: 'stoicism philosophy daily life',      categorySlug: 'philosophy'   },
  { keyword: 'health longevity tip science',        categorySlug: 'health'       },
  { keyword: 'history mystery fact ancient',        categorySlug: 'history'      },
  { keyword: 'biology explained simple cell',       categorySlug: 'biology'      },
  { keyword: 'personal finance money tip',          categorySlug: 'finance'      },
  { keyword: 'mental health tip anxiety calm',      categorySlug: 'mentalhealth' },
  { keyword: 'self improvement habit productivity', categorySlug: 'self-improvement' },
  { keyword: 'wildlife animal behavior surprising', categorySlug: 'wildlife'     },
  { keyword: 'technology future science explained', categorySlug: 'tech'         },
  { keyword: 'fun fact did you know universe',      categorySlug: 'universe'     },
];

async function fetchYouTube(keyword, categorySlug, maxResults = 2) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

  const url = `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&q=${encodeURIComponent(keyword)}&type=video` +
    `&maxResults=${maxResults}&relevanceLanguage=en` +
    `&videoDuration=short&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  if (!data.items) return [];

  return data.items
    .filter(item => item.id?.videoId && item.snippet?.description?.length > 50)
    .map(item => ({
      title:             item.snippet.title,
      body:              item.snippet.description,
      sourceUrl:         `https://www.youtube.com/watch?v=${item.id.videoId}`,
      sourceType:        'website',
      sourceAuthor:      item.snippet.channelTitle,
      videoId:           item.id.videoId,
      videoThumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      categorySlug,
    }));
}

async function fetchAllYouTube(resultsPerKeyword = 2) {
  const results = [];
  for (const { keyword, categorySlug } of KEYWORDS) {
    try {
      const items = await fetchYouTube(keyword, categorySlug, resultsPerKeyword);
      results.push(...items);
      // Small delay to be polite to quota
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.warn(`YouTube fetch failed for "${keyword}": ${err.message}`);
    }
  }
  return results;
}

module.exports = { fetchAllYouTube, fetchYouTube, KEYWORDS };
