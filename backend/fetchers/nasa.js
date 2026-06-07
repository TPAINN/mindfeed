/**
 * NASA Astronomy Picture of the Day (APOD) fetcher
 * Free key: https://api.nasa.gov (instant registration)
 * Limit: 1000 requests/day
 */

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function fetchNASA(count = 5) {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}&thumbs=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
  const data = await res.json();

  return data
    .filter(item => item.title && item.explanation && item.explanation.length > 100)
    .map(item => {
      const ytId = extractYouTubeId(item.url);
      const isVideo = item.media_type === 'video';

      return {
        title:             item.title,
        body:              item.explanation,
        sourceUrl:         item.url || 'https://apod.nasa.gov/',
        sourceType:        'nasa',
        sourceAuthor:      item.copyright || 'NASA',
        imageUrl:          isVideo
                             ? (item.thumbnail_url || null)
                             : (item.hdurl || item.url),
        videoId:           isVideo ? ytId : null,
        videoThumbnailUrl: isVideo ? (item.thumbnail_url || null) : null,
        categorySlug:      'universe',
      };
    });
}

async function fetchNASABulk(count = 20) {
  return fetchNASA(count);
}

module.exports = { fetchNASA, fetchNASABulk };
