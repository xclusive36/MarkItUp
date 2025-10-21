'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { GraphNode } from '@/lib/types';

interface GraphSearchProps {
  nodes: GraphNode[];
  onNodeSelect: (nodeId: string) => void;
  onClose?: () => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  node: GraphNode;
  score: number;
  matchType: 'exact' | 'start' | 'contains' | 'fuzzy';
}

const GraphSearch: React.FC<GraphSearchProps> = ({
  nodes,
  onNodeSelect,
  onClose,
  placeholder = 'Search nodes...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fuzzy match scoring
  const fuzzyMatch = (str: string, pattern: string): number => {
    const patternLower = pattern.toLowerCase();
    const strLower = str.toLowerCase();

    let score = 0;
    let patternIndex = 0;
    let bonus = 0;

    for (let i = 0; i < strLower.length && patternIndex < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIndex]) {
        score += 1 + bonus;
        bonus += 0.5; // Consecutive character bonus
        patternIndex++;
      } else {
        bonus = 0;
      }
    }

    // Full pattern match required
    if (patternIndex !== patternLower.length) {
      return 0;
    }

    return score;
  };

  // Search and rank nodes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const queryLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    nodes.forEach(node => {
      const nameLower = node.name.toLowerCase();
      let matchType: SearchResult['matchType'] | null = null;
      let score = 0;

      // Exact match
      if (nameLower === queryLower) {
        matchType = 'exact';
        score = 1000;
      }
      // Starts with
      else if (nameLower.startsWith(queryLower)) {
        matchType = 'start';
        score = 500;
      }
      // Contains
      else if (nameLower.includes(queryLower)) {
        matchType = 'contains';
        score = 250;
      }
      // Fuzzy match
      else {
        const fuzzyScore = fuzzyMatch(node.name, query);
        if (fuzzyScore > 0) {
          matchType = 'fuzzy';
          score = fuzzyScore;
        }
      }

      // Also check tags for matches
      if (node.tags) {
        node.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (tagLower.includes(queryLower)) {
            score += 50;
            if (!matchType) matchType = 'contains';
          }
        });
      }

      if (matchType) {
        searchResults.push({
          node,
          score,
          matchType,
        });
      }
    });

    // Sort by score (descending)
    searchResults.sort((a, b) => b.score - a.score);

    // Limit to top 10 results
    setResults(searchResults.slice(0, 10));
    setSelectedIndex(0);
    setIsOpen(searchResults.length > 0);
  }, [query, nodes]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex].node.id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (nodeId: string) => {
    onNodeSelect(nodeId);
    setQuery('');
    setIsOpen(false);
  };

  const handleClose = () => {
    setQuery('');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const highlightMatch = (text: string, pattern: string): React.ReactNode => {
    if (!pattern) return text;

    const parts: React.ReactNode[] = [];
    const lowerText = text.toLowerCase();
    const lowerPattern = pattern.toLowerCase();

    // Simple highlighting for exact/contains matches
    const index = lowerText.indexOf(lowerPattern);
    if (index !== -1) {
      if (index > 0) {
        parts.push(<span key="before">{text.substring(0, index)}</span>);
      }
      parts.push(
        <span key="match" className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
          {text.substring(index, index + pattern.length)}
        </span>
      );
      if (index + pattern.length < text.length) {
        parts.push(<span key="after">{text.substring(index + pattern.length)}</span>);
      }
      return <>{parts}</>;
    }

    // For fuzzy matches, just return the text
    return text;
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div
        className="relative flex items-center"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid',
          borderRadius: '8px',
        }}
      >
        <Search className="absolute left-3 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 rounded-lg outline-none"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
            border: '1px solid',
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.node.id}
              onClick={() => handleSelect(result.node.id)}
              className={`w-full px-4 py-3 text-left transition-colors ${
                index === selectedIndex ? 'bg-opacity-10' : ''
              }`}
              style={{
                backgroundColor: index === selectedIndex ? 'var(--accent-bg)' : 'transparent',
                borderBottom:
                  index < results.length - 1 ? '1px solid var(--border-secondary)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {highlightMatch(result.node.name, query)}
                  </div>
                  {result.node.tags && result.node.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {result.node.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="ml-3 text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {result.matchType}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query && results.length === 0 && (
        <div
          className="absolute z-50 w-full mt-2 rounded-lg shadow-lg p-4 text-center"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
            border: '1px solid',
            color: 'var(--text-secondary)',
          }}
        >
          No nodes found matching &quot;{query}&quot;
        </div>
      )}

      {/* Keyboard hints */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 rounded-lg shadow-lg px-4 py-2 flex justify-between text-xs"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            border: '1px solid',
            color: 'var(--text-tertiary)',
            top: '100%',
            marginTop: results.length > 0 ? `${Math.min(results.length * 60, 384) + 8}px` : '8px',
          }}
        >
          <span>↑↓ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      )}
    </div>
  );
};

export default GraphSearch;
