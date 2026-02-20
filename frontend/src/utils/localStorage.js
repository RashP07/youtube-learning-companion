const STORAGE_KEY = 'ylc_history';
const MAX_HISTORY = 10;

/**
 * Get all stored analyses from localStorage.
 * @returns {Array}
 */
export const getLocalHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Save an analysis to localStorage (most recent first, max 10).
 * @param {object} analysis
 */
export const saveToLocalHistory = (analysis) => {
  try {
    const history = getLocalHistory();
    // Remove if already exists (re-analyze same video)
    const filtered = history.filter((h) => h.videoId !== analysis.videoId);
    const updated = [
      {
        _id: analysis._id,
        videoId: analysis.videoId,
        videoUrl: analysis.videoUrl,
        title: analysis.title,
        thumbnail: analysis.thumbnail,
        summary: analysis.summary,
        keyTakeaways: analysis.keyTakeaways,
        notes: analysis.notes,
        quiz: analysis.quiz,
        flashcards: analysis.flashcards,
        createdAt: analysis.createdAt || new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
};

/**
 * Remove a specific item from localStorage history by videoId.
 * @param {string} videoId
 */
export const removeFromLocalHistory = (videoId) => {
  try {
    const history = getLocalHistory();
    const updated = history.filter((h) => h.videoId !== videoId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('localStorage remove failed:', e);
  }
};

/**
 * Find analysis in localStorage by videoId.
 * @param {string} videoId
 * @returns {object|null}
 */
export const findInLocalHistory = (videoId) => {
  const history = getLocalHistory();
  return history.find((h) => h.videoId === videoId) || null;
};

/**
 * Clear all localStorage history.
 */
export const clearLocalHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
