import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, ExternalLink, Copy, Check,
  BookOpen, MessageSquare, Layers, Lightbulb, FileText, Youtube
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotesList from '../components/NotesList';
import QuizComponent from '../components/QuizComponent';
import FlashcardDeck from '../components/FlashcardDeck';
import { findInLocalHistory } from '../utils/localStorage';
import { fetchAnalysisById, downloadPDFFromData } from '../utils/api';
import { copyToClipboard } from '../utils/helpers';

const TABS = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: MessageSquare },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
];

const VideoDetailsPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(!location.state?.analysis);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  useEffect(() => {
    if (!analysis) {
      // Try localStorage first
      const local = findInLocalHistory(videoId);
      if (local) {
        setAnalysis(local);
        setLoading(false);
        return;
      }

      // Try server
      fetchAnalysisById(videoId)
        .then((data) => {
          setAnalysis(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Analysis not found. Please analyze this video again.');
          setLoading(false);
        });
    }
  }, [videoId, analysis]);

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    setPdfLoading(true);
    try {
      await downloadPDFFromData(analysis);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!analysis?.summary) return;
    const ok = await copyToClipboard(analysis.summary);
    if (ok) {
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 2000);
      toast.success('Summary copied!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading analysis...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'Could not load this analysis.'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Analyze a new video
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Video header */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Thumbnail */}
          {analysis.thumbnail && (
            <div className="flex-shrink-0 w-full sm:w-36 h-auto sm:h-[81px] rounded-xl overflow-hidden bg-gray-100">
              <img
                src={analysis.thumbnail}
                alt={analysis.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">
              {analysis.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={analysis.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 transition-colors"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                Watch on YouTube
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Stats chips */}
              {analysis.notes?.length > 0 && (
                <span className="badge bg-blue-50 text-blue-700">
                  📝 {analysis.notes.length} notes
                </span>
              )}
              {analysis.quiz?.length > 0 && (
                <span className="badge bg-purple-50 text-purple-700">
                  ❓ {analysis.quiz.length} questions
                </span>
              )}
              {analysis.flashcards?.length > 0 && (
                <span className="badge bg-green-50 text-green-700">
                  🃏 {analysis.flashcards.length} cards
                </span>
              )}
            </div>
          </div>

          {/* PDF Download */}
          <div className="flex-shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="btn-secondary text-sm"
              title="Download PDF study guide"
            >
              {pdfLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:block">{pdfLoading ? 'Generating...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-1 justify-center ${
              activeTab === id
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                <FileText className="w-5 h-5 text-brand-600" />
                Summary
              </h2>
              <button onClick={handleCopySummary} className="btn-secondary text-xs py-1.5">
                {summaryCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {summaryCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed text-base mb-8">
              {analysis.summary}
            </p>

            {analysis.keyTakeaways?.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-gray-900">Key Takeaways</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.keyTakeaways.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <h2 className="section-title">Timestamped Notes</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Click any timestamp to jump to that moment in the YouTube video.
            </p>
            <NotesList notes={analysis.notes} videoId={videoId} />
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h2 className="section-title">Quiz</h2>
            </div>
            <QuizComponent quiz={analysis.quiz} />
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-2 mb-5">
              <Layers className="w-5 h-5 text-brand-600" />
              <h2 className="section-title">Flashcards</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Click a card to flip it and reveal the answer.
            </p>
            <FlashcardDeck flashcards={analysis.flashcards} />
          </div>
        )}
      </div>

      {/* Bottom PDF button (mobile) */}
      <div className="mt-6 sm:hidden text-center">
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="btn-primary w-full justify-center"
        >
          <Download className="w-4 h-4" />
          {pdfLoading ? 'Generating PDF...' : 'Download PDF Study Guide'}
        </button>
      </div>
    </div>
  );
};

export default VideoDetailsPage;
