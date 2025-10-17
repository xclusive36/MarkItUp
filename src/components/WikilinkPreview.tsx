'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Clock, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Note } from '@/lib/types';

interface WikilinkPreviewProps {
  noteName: string;
  position: { x: number; y: number };
  onClose: () => void;
  theme: 'light' | 'dark';
}

export default function WikilinkPreview({
  noteName,
  position,
  onClose,
  theme,
}: WikilinkPreviewProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch note content
        const response = await fetch('/api/files');
        if (response.ok) {
          const notes: Note[] = await response.json();
          const foundNote = notes.find(
            (n: Note) =>
              n.name === noteName ||
              n.name === `${noteName}.md` ||
              n.name.replace('.md', '') === noteName
          );

          if (foundNote) {
            setNote(foundNote);
          } else {
            setError('Note not found');
          }
        } else {
          setError('Failed to load note');
        }
      } catch (err) {
        setError('Error loading note');
        console.error('Error loading note preview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteName]);

  // Position the preview card
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.y + 20,
    left: position.x,
    maxWidth: '400px',
    zIndex: 9999,
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    borderRadius: '0.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  };

  // Adjust if too close to right edge
  if (position.x + 400 > window.innerWidth) {
    cardStyle.left = 'auto';
    cardStyle.right = 10;
  }

  // Adjust if too close to bottom edge
  if (position.y + 300 > window.innerHeight) {
    cardStyle.top = 'auto';
    cardStyle.bottom = 10;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        style={{ background: 'transparent' }}
      />

      {/* Preview Card */}
      <div style={cardStyle} className="overflow-hidden">
        {loading ? (
          <div className="p-4 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-5/6"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div
            className="p-4 text-center"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
          </div>
        ) : note ? (
          <>
            {/* Header */}
            <div
              className="p-4 border-b"
              style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
            >
              <div className="flex items-start gap-2">
                <FileText
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold truncate"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {note.name.replace('.md', '')}
                  </h3>
                  {note.folder && (
                    <p
                      className="text-xs truncate"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      📁 {note.folder}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div
                className="flex items-center gap-4 mt-2 text-xs"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{note.wordCount || 0} words</span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span>{note.tags.length} tags</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div
              className="p-4 max-h-60 overflow-y-auto prose prose-sm dark:prose-invert"
              style={{
                color: theme === 'dark' ? '#d1d5db' : '#374151',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
            >
              <ReactMarkdown>
                {note.content.slice(0, 500) + (note.content.length > 500 ? '...' : '')}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div
              className="p-2 text-xs text-center border-t"
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Click to open note
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
