'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Hash, Folder, FileText, Clock } from 'lucide-react';
import { SearchResult, SearchMatch } from '@/lib/types';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

interface SearchOptions {
  limit?: number;
  includeContent?: boolean;
  tags?: string[];
  folders?: string[];
}

interface SearchBoxProps {
  onSearch: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  onSelectNote: (noteId: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  onSelectNote,
  placeholder = 'Search notes...',
  className = ''
}) => {
  const { theme } = useSimpleTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim()) {
        try {
          const searchResults = await onSearch(query, { limit: 20 });
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
  }, [query, onSearch]);

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    searchRef.current?.blur();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
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
          behavior: 'smooth'
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

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before match
      if (match.start > lastIndex) {
        parts.push(
          <span key={`before-${index}`}>
            {text.slice(lastIndex, match.start)}
          </span>
        );
      }

      // Add highlighted match
      parts.push(
        <mark 
          key={`match-${index}`}
          className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
          style={{
            backgroundColor: theme === 'dark' ? '#92400e' : '#fef3c7'
          }}
        >
          {match.text}
        </mark>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="after">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const getSearchTypeIcon = (query: string) => {
    if (query.startsWith('tag:')) return <Hash className="w-4 h-4 text-blue-500" />;
    if (query.startsWith('folder:')) return <Folder className="w-4 h-4 text-green-500" />;
    return <Search className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {getSearchTypeIcon(query)}
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
            color: theme === 'dark' ? '#f9fafb' : '#111827'
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

      {/* Search Suggestions */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Try: "tag:project", "folder:notes", or "exact phrase"
      </div>

      {/* Search Results */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg 
                   max-h-96 overflow-y-auto z-50"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
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
                  backgroundColor: index === selectedIndex 
                    ? (theme === 'dark' ? '#1e3a8a20' : '#eff6ff') 
                    : 'transparent'
                }}
              >
                {/* Note title */}
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {result.noteName.replace('.md', '')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    Score: {result.score}
                  </span>
                </div>

                {/* Matches */}
                {result.matches.length > 0 && (
                  <div className="space-y-1">
                    {result.matches.slice(0, 2).map((match, matchIndex) => (
                      <div 
                        key={matchIndex}
                        className="text-sm text-gray-600 dark:text-gray-300 pl-6"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            Line {match.lineNumber}
                          </span>
                        </div>
                        <div className="text-xs font-mono bg-gray-50 dark:bg-gray-800 
                                      p-2 rounded border-l-2 border-blue-300 dark:border-blue-600"
                             style={{
                               backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                               borderColor: theme === 'dark' ? '#60a5fa' : '#93c5fd'
                             }}>
                          {highlightMatches(match.context, [match])}
                        </div>
                      </div>
                    ))}
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
          <div className="p-2 border-t border-gray-100 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-800 rounded-b-lg"
               style={{
                 backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                 borderColor: theme === 'dark' ? '#4b5563' : '#f3f4f6'
               }}>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {results.length} result{results.length !== 1 ? 's' : ''} • 
              Use ↑↓ to navigate, Enter to select, Esc to close
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
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No notes found for "{query}"</div>
            <div className="text-xs mt-1">
              Try different keywords or create a new note
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBox;
