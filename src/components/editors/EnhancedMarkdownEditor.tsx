'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorStatePersistence } from '@/lib/editor-state';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface EnhancedMarkdownEditorProps {
  initialContent: string;
  filePath: string;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
  showPreview?: boolean;
  isDistraction?: boolean;
}

export default function EnhancedMarkdownEditor({
  initialContent,
  filePath,
  onSave,
  onCancel,
  showPreview = true,
  isDistraction = false,
}: EnhancedMarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDistractionFree, setIsDistractionFree] = useState(isDistraction);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Load editor state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const state = EditorStatePersistence.getState(filePath);
    if (state.scrollPosition && editorContainerRef.current) {
      editorContainerRef.current.scrollTop = state.scrollPosition;
    }

    // Add to recent files
    const title = filePath.split('/').pop()?.replace('.md', '') || filePath;
    EditorStatePersistence.addRecentFile(filePath, title);

    // Cleanup old states on mount
    EditorStatePersistence.cleanupOldStates();
  }, [filePath]);

  // Calculate word and character counts
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    setWordCount(content.trim() === '' ? 0 : words);
    setCharCount(content.length);
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (content !== initialContent) {
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          await onSave(content);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, initialContent, onSave]);

  // Save scroll position
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      EditorStatePersistence.saveState(filePath, container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [filePath]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = useCallback(
    (prefix: string, suffix = '') => {
      const textarea = document.querySelector('.cm-content') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText =
        content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);

      setContent(newText);
    },
    [content]
  );

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isDistractionFree) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDistractionFree(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <span className="text-sm text-slate-500">
                {wordCount} words • {charCount} characters
              </span>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-sm text-slate-400">Saved {formatLastSaved(lastSaved)}</span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div className="flex-1">
            <CodeMirror
              value={content}
              onChange={val => setContent(val)}
              extensions={[markdown()]}
              theme={
                typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                  ? oneDark
                  : undefined
              }
              className="h-full"
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
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {filePath.split('/').pop()?.replace('.md', '')}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
              {lastSaved && (
                <>
                  <span>•</span>
                  <span>Saved {formatLastSaved(lastSaved)}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setIsDistractionFree(true)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              title="Distraction-free mode"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Bold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1 4 4 4 4 0 0 1-4 4H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 5V7h6a2 2 0 0 1 2 2 2 2 0 0 1-2 2H8zm0 6v-2h8a2 2 0 0 1 2 2 2 2 0 0 1-2 2H8z" />
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 italic"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => insertMarkdown('[[', ']]')}
            className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Wiki Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Heading"
          >
            H2
          </button>
          <button
            onClick={() => insertMarkdown('- ')}
            className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            title="List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Split pane editor */}
      {showPreview ? (
        <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700 h-[600px]">
          {/* Editor pane */}
          <div className="p-4 overflow-hidden" ref={editorContainerRef}>
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
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
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

          {/* Preview pane */}
          <div className="p-4 overflow-y-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mb-2 mt-4">{children}</h3>
                  ),
                  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[600px] p-4" ref={editorContainerRef}>
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
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
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
      )}
    </div>
  );
}
