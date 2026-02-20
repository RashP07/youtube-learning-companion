/**
 * Convert MM:SS or HH:MM:SS timestamp string to total seconds.
 * @param {string} timestamp
 * @returns {number}
 */
export const timestampToSeconds = (timestamp) => {
  if (!timestamp) return 0;
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

/**
 * Build a YouTube link that starts at the given timestamp.
 * @param {string} videoId
 * @param {string} timestamp e.g. "03:12"
 * @returns {string}
 */
export const buildYouTubeTimestampLink = (videoId, timestamp) => {
  const seconds = timestampToSeconds(timestamp);
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
};

/**
 * Copy text to clipboard and return success boolean.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Format a date string to a readable format.
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

/**
 * Truncate a string to a max length.
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export const truncate = (str, max = 100) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
};

/**
 * Check if a URL is a valid YouTube URL.
 * @param {string} url
 * @returns {boolean}
 */
export const isValidYouTubeUrl = (url) => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url?.trim() || '');
};
