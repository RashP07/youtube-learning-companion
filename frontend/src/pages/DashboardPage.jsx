import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, LayoutDashboard, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import { getLocalHistory, removeFromLocalHistory, clearLocalHistory } from '../utils/localStorage';
import { fetchHistory, deleteAnalysis } from '../utils/api';

const DashboardPage = () => {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(false);
  const navigate = useNavigate();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const serverData = await fetchHistory();
      if (Array.isArray(serverData) && serverData.length > 0) {
        setHistory(serverData);
        setDbAvailable(true);
      } else {
        // Fall back to localStorage
        setHistory(getLocalHistory());
        setDbAvailable(false);
      }
    } catch {
      // Server not available or no DB — use localStorage
      setHistory(getLocalHistory());
      setDbAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(
      (h) =>
        h.title?.toLowerCase().includes(q) ||
        h.summary?.toLowerCase().includes(q) ||
        h.videoUrl?.toLowerCase().includes(q)
    );
  }, [history, query]);

  const handleDelete = async (analysis) => {
    const confirmed = window.confirm(`Delete "${analysis.title}"?`);
    if (!confirmed) return;

    try {
      if (dbAvailable && analysis._id) {
        await deleteAnalysis(analysis._id);
      }
      removeFromLocalHistory(analysis.videoId);
      setHistory((prev) => prev.filter((h) => h.videoId !== analysis.videoId));
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleClearAll = () => {
    if (!window.confirm('Clear all history? This cannot be undone.')) return;
    clearLocalHistory();
    setHistory([]);
    toast.success('History cleared');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-600" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {history.length} analyzed video{history.length !== 1 ? 's' : ''} &mdash;{' '}
            <span className={`font-medium ${dbAvailable ? 'text-green-600' : 'text-amber-600'}`}>
              {dbAvailable ? 'synced with database' : 'local storage only'}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={loadHistory} className="btn-secondary text-sm" title="Refresh">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:block">Refresh</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Search bar */}
      {history.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or summary..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-colors"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          {history.length === 0 ? (
            <>
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No analyses yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Analyze your first YouTube video to see it here.
              </p>
              <button onClick={() => navigate('/')} className="btn-primary">
                <Plus className="w-4 h-4" />
                Analyze a Video
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-sm text-gray-500">
                Try a different search term.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {query && (
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
          )}

          <div className="space-y-3">
            {filtered.map((analysis) => (
              <VideoCard
                key={analysis.videoId || analysis._id}
                analysis={analysis}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {history.length > 0 && !query && (
            <div className="mt-8 text-center">
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all history
              </button>
            </div>
          )}
        </>
      )}

      {/* localStorage notice */}
      {!dbAvailable && history.length > 0 && (
        <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            History is stored in your browser&apos;s local storage (up to 10 items).
            To enable persistent server-side storage, configure MongoDB in your backend .env file.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
