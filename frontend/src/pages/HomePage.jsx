import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, Sparkles, BookOpen, Brain, Layers, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeVideo } from '../utils/api';
import { saveToLocalHistory } from '../utils/localStorage';
import { isValidYouTubeUrl } from '../utils/helpers';
import Loader from '../components/Loader';

const SAMPLE_URLS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/jNQXAC9IVRw',
];

const features = [
  { icon: '📝', title: 'Smart Notes', desc: 'Timestamped notes with clickable links to jump to that part of the video.' },
  { icon: '❓', title: 'Interactive Quiz', desc: '8–12 multiple choice questions with explanations to test your understanding.' },
  { icon: '🃏', title: 'Flashcards', desc: 'Flip-card flashcards for key concepts — perfect for memorization.' },
  { icon: '📄', title: 'PDF Export', desc: 'Download your notes, quiz, and flashcards as a beautifully formatted PDF.' },
];

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a YouTube URL.');
      return;
    }

    if (!isValidYouTubeUrl(trimmed)) {
      setError('Please enter a valid YouTube URL (youtube.com or youtu.be).');
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeVideo(trimmed);
      saveToLocalHistory(analysis);
      toast.success('Analysis complete!');
      navigate(`/video/${analysis.videoId}`, { state: { analysis } });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12 animate-[fadeIn_0.5s_ease-out]">

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Turn any YouTube video into
            <br />
            <span className="text-brand-600">smart study materials</span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Paste a YouTube URL and get smart summaries, timestamped notes,
            interactive quizzes, and flashcards — instantly.
          </p>
        </div>

        {/* URL Input Form */}
        <div className="card p-6 mb-6 animate-[slideUp_0.4s_ease-out]">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              YouTube Video URL
            </label>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none text-sm transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                    error
                      ? 'border-red-300 focus:border-red-400 dark:border-red-500'
                      : 'border-gray-200 focus:border-brand-400 dark:border-gray-700 dark:focus:border-brand-500'
                  }`}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="btn-primary px-6 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Supports: youtube.com/watch?v=... and youtu.be/... links
            </p>
          </form>
        </div>

        {/* Sample URLs */}
        <div className="text-center mb-12">
          <p className="text-xs text-gray-400 mb-2">Try a sample:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SAMPLE_URLS.map((sample, i) => (
              <button
                key={i}
                onClick={() => setUrl(sample)}
                className="text-xs text-brand-600 hover:text-brand-700 underline underline-offset-2"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="card p-5 hover:shadow-md transition-shadow animate-[slideUp_0.4s_ease-out]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-14 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '🔗', title: 'Paste URL', desc: 'Copy any YouTube video URL and paste it above.' },
              { step: '2', icon: '🤖', title: 'Analyzes Content', desc: 'Reads the transcript and generates structured study content.' },
              { step: '3', icon: '📚', title: 'Study Smarter', desc: 'Review notes, take quizzes, and download your PDF study guide.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                  {item.step}
                </div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
