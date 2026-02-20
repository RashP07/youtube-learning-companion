const { YoutubeTranscript } = require('youtube-transcript');
const https = require('https');

/**
 * Extract 11-char videoId from various YouTube URL formats.
 * Handles: youtube.com/watch?v=, youtu.be/, /embed/, /shorts/, bare ID
 */
const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /(?:youtube\.com\/watch[?&]v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }

  return null;
};

/** Returns true for valid youtube.com or youtu.be URLs. */
const isValidYouTubeUrl = (url) =>
  typeof url === 'string' &&
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url.trim());

/** Return the HQ thumbnail URL for a given videoId. */
const getThumbnailUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

/**
 * Fetch the transcript for a YouTube video using youtube-transcript.
 * Returns a plain string of the full transcript text, or null if unavailable.
 *
 * @param {string} videoId — 11-char YouTube video ID
 * @returns {Promise<string|null>}
 */
const fetchTranscript = async (videoId) => {
  // Try without a language first (picks whatever is available), then force 'en'
  const attempts = [
    { lang: undefined },
    { lang: 'en' },
    { lang: 'en-US' },
  ];

  for (const { lang } of attempts) {
    try {
      console.log(`[Transcript] Fetching transcript for ${videoId}${lang ? ` (lang=${lang})` : ''}...`);
      const segments = await YoutubeTranscript.fetchTranscript(videoId, lang ? { lang } : undefined);

      if (!segments || segments.length === 0) continue;

      const text = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
      if (text.length < 30) continue; // too short to be useful

      console.log(`[Transcript] Success — ${segments.length} segments, ${text.length} chars.`);
      return text;
    } catch (err) {
      console.warn(`[Transcript] Attempt failed (lang=${lang ?? 'default'}):`, err.message);
    }
  }

  console.warn('[Transcript] All attempts failed — video may have no captions.');
  return null;
};

/**
 * Fetch video title + author from YouTube's free oEmbed API.
 * No API key required. Returns { title, author } or null on failure.
 *
 * @param {string} videoId
 * @returns {Promise<{title:string, author:string}|null>}
 */
const fetchVideoMetadata = (videoId) => {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`[Metadata] Title: "${json.title}" by ${json.author_name}`);
          resolve({ title: json.title || '', author: json.author_name || '' });
        } catch {
          console.warn('[Metadata] Failed to parse oEmbed response.');
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.warn('[Metadata] oEmbed request failed:', err.message);
      resolve(null);
    });
  });
};

module.exports = { extractVideoId, isValidYouTubeUrl, getThumbnailUrl, fetchTranscript, fetchVideoMetadata };
