'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface ZenModeProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  onClose: () => void;
  theme: string;
}

const ZenMode: React.FC<ZenModeProps> = ({ markdown, onMarkdownChange, onClose, theme }) => {
  const [focusMode, setFocusMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 3 seconds of no mouse movement
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const metaKey = isMac ? e.metaKey : e.ctrlKey;

      // Escape to exit zen mode
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Cmd/Ctrl+Shift+F to toggle focus mode
      if (metaKey && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }

      // Cmd/Ctrl+Shift+T to toggle typewriter mode
      if (metaKey && e.shiftKey && e.key === 't') {
        e.preventDefault();
        setTypewriterMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Typewriter mode: keep cursor centered
  const handleScroll = useCallback(() => {
    if (!typewriterMode || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;

    // Calculate line height and scroll to center
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const viewportHeight = textarea.clientHeight;
    const scrollTop = currentLine * lineHeight - viewportHeight / 2;

    textarea.scrollTop = Math.max(0, scrollTop);
  }, [typewriterMode]);

  // Focus mode: Apply styling to dim non-active paragraphs
  const getFocusModeStyle = () => {
    if (!focusMode) return {};
    return {
      background: `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0) 45%,
        rgba(0, 0, 0, 0) 55%,
        rgba(0, 0, 0, 0.6) 100%
      )`,
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Top controls bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(to bottom, rgba(10, 10, 10, 0.95), transparent)'
              : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), transparent)',
          paddingTop: '1rem',
          paddingBottom: '3rem',
        }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Zen Mode
            </h2>
            <span className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Press Esc to exit
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Focus mode toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-lg transition-all ${
                focusMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              } hover:opacity-80`}
              title="Focus Mode (Cmd+Shift+F) - Highlight current section"
            >
              {focusMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Typewriter mode toggle */}
            <button
              onClick={() => setTypewriterMode(!typewriterMode)}
              className={`p-2 rounded-lg transition-all ${
                typewriterMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              } hover:opacity-80`}
              title="Typewriter Mode (Cmd+Shift+T) - Keep cursor centered"
            >
              {typewriterMode ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Exit Zen Mode (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Focus mode overlay */}
        {focusMode && (
          <div className="absolute inset-0 pointer-events-none z-5" style={getFocusModeStyle()} />
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={e => {
            onMarkdownChange(e.target.value);
            if (typewriterMode) {
              handleScroll();
            }
          }}
          onKeyUp={typewriterMode ? handleScroll : undefined}
          onClick={typewriterMode ? handleScroll : undefined}
          className="w-full max-w-4xl h-full resize-none focus:outline-none relative z-10"
          style={{
            backgroundColor: 'transparent',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            fontSize: '1.125rem',
            lineHeight: '1.75rem',
            fontFamily: 'var(--font-geist-mono, monospace)',
            padding: '2rem',
          }}
          placeholder="Start writing in zen mode..."
          autoFocus
        />
      </div>

      {/* Bottom stats bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(to top, rgba(10, 10, 10, 0.95), transparent)'
              : 'linear-gradient(to top, rgba(255, 255, 255, 0.95), transparent)',
          paddingBottom: '1rem',
          paddingTop: '3rem',
        }}
      >
        <div
          className="flex items-center justify-center gap-8 px-6 py-3 text-sm"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
        >
          <span>{markdown.split(/\s+/).filter(w => w.length > 0).length} words</span>
          <span>
            {Math.ceil(markdown.split(/\s+/).filter(w => w.length > 0).length / 200)} min read
          </span>
          <span>{markdown.length} characters</span>
          <span>{markdown.split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
};

export default ZenMode;
