import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 120000, // 2 minutes for AI processing
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Analyze a YouTube video URL.
 * @param {string} videoUrl
 * @returns {Promise<object>} analysis data
 */
export const analyzeVideo = async (videoUrl) => {
  const { data } = await api.post('/analyze', { videoUrl });
  return data.data;
};

/**
 * Fetch analysis history from server (MongoDB).
 * @returns {Promise<Array>}
 */
export const fetchHistory = async () => {
  const { data } = await api.get('/history');
  return data.data;
};

/**
 * Fetch single analysis by id or videoId.
 * @param {string} id
 * @returns {Promise<object>}
 */
export const fetchAnalysisById = async (id) => {
  const { data } = await api.get(`/history/${id}`);
  return data.data;
};

/**
 * Delete an analysis record.
 * @param {string} id
 */
export const deleteAnalysis = async (id) => {
  await api.delete(`/history/${id}`);
};

/**
 * Download PDF for an analysis (by ID from DB) — opens in new tab.
 * @param {string} id
 */
export const openPDFById = (id) => {
  window.open(`${API_BASE}/api/history/${id}/pdf`, '_blank');
};

/**
 * Post analysis data to backend and trigger PDF download in browser.
 * @param {object} analysisData
 */
export const downloadPDFFromData = async (analysisData) => {
  const response = await api.post('/analyze/pdf', { data: analysisData }, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-${analysisData.videoId || 'analysis'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default api;
