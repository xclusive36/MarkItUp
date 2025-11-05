'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CollaborativePage } from '../../../components/CollaborativePage';

export default function CollaborateNotePage() {
  const params = useParams();
  const noteId = params.noteId as string;

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files/${encodeURIComponent(noteId)}`);

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || '');
      } else if (response.status === 404) {
        // Note doesn't exist, create it
        setContent(`# ${noteId.replace('.md', '').replace(/-/g, ' ')}\n\nStart collaborating...`);
      } else {
        throw new Error(`Failed to load note: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = async (contentToSave: string) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(noteId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave, overwrite: true }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save the document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading collaborative editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Document
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CollaborativePage
        noteId={noteId}
        initialContent={content}
        onContentChange={handleContentChange}
        onSave={handleSave}
      />
    </div>
  );
}
