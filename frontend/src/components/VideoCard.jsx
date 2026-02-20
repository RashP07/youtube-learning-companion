import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Clock, BookOpen } from 'lucide-react';
import { truncate, formatDate } from '../utils/helpers';

const VideoCard = ({ analysis, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(analysis);
  };

  return (
    <div
      className="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer group animate-[slideUp_0.3s_ease-out]"
      onClick={() => navigate(`/video/${analysis.videoId}`, { state: { analysis } })}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-28 h-[72px] rounded-lg overflow-hidden bg-gray-100">
          {analysis.thumbnail ? (
            <img
              src={analysis.thumbnail}
              alt={analysis.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
              🎥
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {analysis.title || 'Untitled Video'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {truncate(analysis.summary, 120)}
          </p>

          <div className="flex items-center gap-3 mt-2">
            {analysis.notes?.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <BookOpen className="w-3 h-3" />
                {analysis.notes.length} notes
              </span>
            )}
            {analysis.quiz?.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                ❓ {analysis.quiz.length} questions
              </span>
            )}
            {analysis.createdAt && (
              <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                <Clock className="w-3 h-3" />
                {formatDate(analysis.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(analysis.videoUrl, '_blank');
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Open video"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
