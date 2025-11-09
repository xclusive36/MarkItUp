'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

export default function QuickEditor() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('markitup-scratchpad');
    if (saved) {
      setContent(saved);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        localStorage.setItem('markitup-scratchpad', content);
        setLastSaved(new Date());
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  const handleCreateNote = async () => {
    if (!content.trim()) {
      alert('Please write something first');
      return;
    }

    setIsSaving(true);
    try {
      // Generate filename from first line or timestamp
      const firstLine = content.split('\n')[0]?.replace(/^#\s*/, '').trim() || '';
      const filename = firstLine
        ? `${firstLine
            .substring(0, 50)
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()}.md`
        : `note-${Date.now()}.md`;

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filename,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      // Clear scratchpad and navigate to new note
      setContent('');
      localStorage.removeItem('markitup-scratchpad');
      router.push(`/editor/${encodeURIComponent(filename)}`);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount =
    content.trim() === ''
      ? 0
      : content
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 0).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Note</h3>
            <span className="text-sm text-slate-500">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            {lastSaved && (
              <span className="text-xs text-slate-400">
                Auto-saved{' '}
                {lastSaved.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setContent('');
                localStorage.removeItem('markitup-scratchpad');
              }}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCreateNote}
              disabled={isSaving || !content.trim()}
              className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="h-64">
        <CodeMirror
          value={content}
          onChange={val => setContent(val)}
          extensions={[markdown()]}
          theme={
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
              ? oneDark
              : undefined
          }
          height="100%"
          placeholder="Start writing... This will auto-save locally."
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
          }}
        />
      </div>
    </div>
  );
}
