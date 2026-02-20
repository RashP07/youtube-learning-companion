import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { buildYouTubeTimestampLink, copyToClipboard } from '../utils/helpers';
import toast from 'react-hot-toast';

const NotesList = ({ notes = [], videoId }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyAll = async () => {
    const text = notes.map((n) => `[${n.timestamp}] ${n.text}`).join('\n');
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Notes copied to clipboard!');
    else toast.error('Failed to copy notes');
  };

  const handleCopyNote = async (note, index) => {
    const ok = await copyToClipboard(`[${note.timestamp}] ${note.text}`);
    if (ok) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  if (!notes.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No timestamped notes available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{notes.length} notes</p>
        <button onClick={handleCopyAll} className="btn-secondary text-xs py-1.5">
          <Copy className="w-3.5 h-3.5" />
          Copy all
        </button>
      </div>

      <div className="space-y-2">
        {notes.map((note, index) => (
          <div
            key={index}
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
          >
            {/* Timestamp button */}
            <a
              href={buildYouTubeTimestampLink(videoId, note.timestamp)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-mono font-semibold transition-colors"
              title={`Open YouTube at ${note.timestamp}`}
            >
              {note.timestamp}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            {/* Note text */}
            <p className="flex-1 text-sm text-gray-700 leading-relaxed pt-0.5">
              {note.text}
            </p>

            {/* Copy single note */}
            <button
              onClick={() => handleCopyNote(note, index)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-brand-600 transition-all"
              title="Copy note"
            >
              {copiedIndex === index ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
