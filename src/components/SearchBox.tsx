'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Hash, Folder, FileText, Clock, Sparkles, Brain } from 'lucide-react';
import { SearchResult, SearchMatch } from '@/lib/types';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import {
  highlightText,
  getHighlightColor,
  formatMatchCount,
  EnhancedSearchMatch,
} from '@/lib/search/highlight';
import VectorSearchTooltip from './VectorSearchTooltip';

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

interface SearchOptions {
  limit?: number;
  includeContent?: boolean;
  tags?: string[];
  folders?: string[];
  mode?: SearchMode;
}

interface SearchBoxProps {
  onSearch: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  onSelectNote: (noteId: string) => void;
  placeholder?: string;
  className?: string;
  defaultMode?: SearchMode;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  onSelectNote,
  placeholder = 'Search notes...',
  className = '',
  defaultMode = 'keyword',
}) => {
  const { theme } = useSimpleTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchMode, setSearchMode] = useState<SearchMode>(defaultMode);
  const [showTooltip, setShowTooltip] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Show tooltip when semantic mode is available but not used
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('vectorSearchTooltip_search_seen');
    if (!hasSeenTooltip && searchMode === 'keyword' && query.trim()) {
      const timer = setTimeout(() => setShowTooltip(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [searchMode, query]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim()) {
        try {
          const searchResults = await onSearch(query, {
            limit: 20,
            mode: searchMode,
          });
          setResults(searchResults);
          setIsOpen(true);
          setSelectedIndex(0);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
          setIsOpen(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch, searchMode]);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      onSelectNote(noteId);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      searchRef.current?.blur();
    },
    [onSelectNote]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectNote(results[selectedIndex].noteId);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          searchRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelectNote]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    searchRef.current?.focus();
  };

  const highlightMatches = (text: string, matches: SearchMatch[]) => {
    if (matches.length === 0) return text;

    // Convert to enhanced matches with type info
    const enhancedMatches: EnhancedSearchMatch[] = matches.map(match => ({
      ...match,
      type: searchMode === 'semantic' || searchMode === 'hybrid' ? 'semantic' : 'keyword',
    }));

    // Use the enhanced highlighting utility
    return highlightText(text, enhancedMatches, { theme });
  };

  const getSearchTypeIcon = (query: string) => {
    if (query.startsWith('tag:')) return <Hash className="w-4 h-4 text-blue-500" />;
    if (query.startsWith('folder:')) return <Folder className="w-4 h-4 text-green-500" />;
    return <Search className="w-4 h-4 text-gray-500" />;
  };

  const getModeIcon = (mode: SearchMode) => {
    switch (mode) {
      case 'keyword':
        return <Search className="w-3 h-3" />;
      case 'semantic':
        return <Brain className="w-3 h-3" />;
      case 'hybrid':
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getModeColor = (mode: SearchMode) => {
    switch (mode) {
      case 'keyword':
        return 'blue';
      case 'semantic':
        return 'purple';
      case 'hybrid':
        return 'green';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Mode Selector */}
      <div className="flex gap-1 mb-2">
        {(['keyword', 'semantic', 'hybrid'] as SearchMode[]).map(mode => {
          const color = getModeColor(mode);
          const isActive = searchMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setSearchMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                         transition-all duration-200 ${
                           isActive
                             ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300 
                                border-${color}-300 dark:border-${color}-600`
                             : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                         }`}
              style={{
                backgroundColor: isActive
                  ? theme === 'dark'
                    ? color === 'blue'
                      ? '#1e3a8a30'
                      : color === 'purple'
                        ? '#581c8730'
                        : '#14532d30'
                    : color === 'blue'
                      ? '#dbeafe'
                      : color === 'purple'
                        ? '#f3e8ff'
                        : '#dcfce7'
                  : theme === 'dark'
                    ? '#1f2937'
                    : '#f3f4f6',
                color: isActive
                  ? theme === 'dark'
                    ? color === 'blue'
                      ? '#93c5fd'
                      : color === 'purple'
                        ? '#d8b4fe'
                        : '#86efac'
                    : color === 'blue'
                      ? '#1d4ed8'
                      : color === 'purple'
                        ? '#7e22ce'
                        : '#15803d'
                  : theme === 'dark'
                    ? '#9ca3af'
                    : '#4b5563',
              }}
            >
              {getModeIcon(mode)}
              <span className="capitalize">{mode}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {getSearchTypeIcon(query)}
        </div>

        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
          }}
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg 
                   max-h-96 overflow-y-auto z-50"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <div ref={resultsRef}>
            {results.map((result, index) => (
              <div
                key={result.noteId}
                onClick={() => handleSelectNote(result.noteId)}
                className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 
                          last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                style={{
                  backgroundColor:
                    index === selectedIndex
                      ? theme === 'dark'
                        ? '#1e3a8a20'
                        : '#eff6ff'
                      : 'transparent',
                }}
              >
                {/* Note title */}
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {result.noteName.replace('.md', '')}
                  </span>
                  {/* Match type indicator */}
                  {searchMode !== 'keyword' && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          theme === 'dark'
                            ? searchMode === 'semantic'
                              ? '#7c3aed30'
                              : '#10b98130'
                            : searchMode === 'semantic'
                              ? '#ddd6fe'
                              : '#d1fae5',
                        color:
                          theme === 'dark'
                            ? searchMode === 'semantic'
                              ? '#c4b5fd'
                              : '#6ee7b7'
                            : searchMode === 'semantic'
                              ? '#7c3aed'
                              : '#059669',
                      }}
                    >
                      {searchMode === 'semantic' ? '🧠 Semantic' : '✨ Hybrid'}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formatMatchCount(
                      result.matches.length,
                      searchMode === 'semantic' ? 'semantic' : 'keyword'
                    )}
                  </span>
                </div>

                {/* Matches */}
                {result.matches.length > 0 && (
                  <div className="space-y-1">
                    {result.matches.slice(0, 2).map((match, matchIndex) => {
                      const matchType =
                        searchMode === 'semantic' || searchMode === 'hybrid'
                          ? 'semantic'
                          : 'keyword';
                      const colors = getHighlightColor(matchType, theme);

                      return (
                        <div
                          key={matchIndex}
                          className="text-sm text-gray-600 dark:text-gray-300 pl-6"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Line {match.lineNumber}</span>
                            {searchMode !== 'keyword' && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: colors.background,
                                  color: colors.text,
                                }}
                              >
                                {matchType}
                              </span>
                            )}
                          </div>
                          <div
                            className="text-xs font-mono p-2 rounded border-l-2"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              borderColor: colors.border,
                            }}
                          >
                            {highlightMatches(match.context, [match])}
                          </div>
                        </div>
                      );
                    })}
                    {result.matches.length > 2 && (
                      <div className="text-xs text-gray-400 pl-6">
                        +{result.matches.length - 2} more matches
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="p-2 border-t border-gray-100 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-800 rounded-b-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
              borderColor: theme === 'dark' ? '#4b5563' : '#f3f4f6',
            }}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {results.length} result{results.length !== 1 ? 's' : ''} • Use ↑↓ to navigate, Enter
              to select, Esc to close
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && results.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No notes found for "{query}"</div>
            <div className="text-xs mt-1">Try different keywords or create a new note</div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}

      {/* Discovery Tooltip */}
      {showTooltip && (
        <VectorSearchTooltip trigger="search" onDismiss={() => setShowTooltip(false)} />
      )}
    </div>
  );
};

export default SearchBox;
