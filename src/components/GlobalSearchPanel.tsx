'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  X,
  Clock,
  Star,
  Filter,
  Hash,
  Folder,
  Calendar,
  FileText,
  Sparkles,
  Brain,
  Zap,
  Save,
  History,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileDown,
  Replace,
  CheckSquare,
  Square,
  Tag,
  Trash2,
  AlertCircle,
  Code,
  Sliders,
  Lightbulb,
} from 'lucide-react';
import { SearchResult, Note } from '@/lib/types';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { SearchMode } from './SearchBox';
import {
  isAIAvailable,
  getAIProvider,
  ParsedQuery,
  SearchSuggestion,
  QueryCorrection,
} from '@/lib/ai/search-ai';

interface GlobalSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (
    query: string,
    options?: {
      mode?: SearchMode | 'regex';
      limit?: number;
      includeContent?: boolean;
      tags?: string[];
      folders?: string[];
    }
  ) => Promise<SearchResult[]>;
  onSelectNote: (noteId: string) => void;
  onUpdateNote?: (noteId: string, content: string) => Promise<void>;
  onBulkUpdateNotes?: (
    updates: Array<{ noteId: string; tags?: string[]; folder?: string }>
  ) => Promise<void>;
  onBulkDeleteNotes?: (noteIds: string[]) => Promise<void>;
  notes: Note[];
}

interface SearchHistory {
  query: string;
  mode: SearchMode | 'regex';
  timestamp: number;
  resultCount: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  mode: SearchMode | 'regex';
  tags?: string[];
  folders?: string[];
  createdAt: number;
}

interface ReplaceOperation {
  noteId: string;
  noteName: string;
  find: string;
  replace: string;
  matchCount: number;
  preview: string;
}

type SortOption = 'relevance' | 'date' | 'name' | 'folder';

interface UserPreferences {
  sortBy: SortOption;
  showPreview: boolean;
  searchMode: SearchMode | 'regex';
  showFilters: boolean;
}

const GlobalSearchPanel: React.FC<GlobalSearchPanelProps> = ({
  isOpen,
  onClose,
  onSearch,
  onSelectNote,
  onUpdateNote,
  onBulkUpdateNotes,
  onBulkDeleteNotes,
  notes,
}) => {
  const { theme } = useSimpleTheme();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode | 'regex'>('hybrid');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // New enhancement states
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showPreview, setShowPreview] = useState(false);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  // Search & Replace
  const [showReplacePanel, setShowReplacePanel] = useState(false);
  const [replaceText, setReplaceText] = useState('');
  const [replacePreview, setReplacePreview] = useState<ReplaceOperation[]>([]);
  const [isReplacing, setIsReplacing] = useState(false);

  // Bulk Operations
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  // Search Refinement
  const [refinementQuery, setRefinementQuery] = useState('');
  const [showRefinement, setShowRefinement] = useState(false);
  const [baseResults, setBaseResults] = useState<SearchResult[]>([]);

  // Smart Filters
  const [showSmartFilters, setShowSmartFilters] = useState(false);
  const [wordCountRange, setWordCountRange] = useState<[number, number]>([0, 10000]);
  const [filterUntagged, setFilterUntagged] = useState(false);
  const [filterOrphans, setFilterOrphans] = useState(false);

  // Regex validation
  const [regexError, setRegexError] = useState<string | null>(null);

  // AI Enhancement states (V4)
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>('none');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SearchSuggestion[]>([]);
  const [queryCorrection, setQueryCorrection] = useState<QueryCorrection | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);

  // Filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // History & Saved
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Extract unique tags and folders from notes
  const availableTags = Array.from(new Set(notes.flatMap(note => note.tags || []))).sort();

  const availableFolders = Array.from(new Set(notes.map(note => note.folder || 'root'))).sort();

  // Load history and saved searches from localStorage
  useEffect(() => {
    if (isOpen) {
      const history = localStorage.getItem('globalSearchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history).slice(0, 10)); // Keep last 10
      }
      const saved = localStorage.getItem('savedSearches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }

      // Load user preferences
      const prefs = localStorage.getItem('globalSearchPreferences');
      if (prefs) {
        const preferences: UserPreferences = JSON.parse(prefs);
        setSortBy(preferences.sortBy || 'relevance');
        setShowPreview(preferences.showPreview || false);
        setSearchMode(preferences.searchMode || 'hybrid');
        setShowFilters(preferences.showFilters || false);
      }

      // Check AI availability
      const aiCheck = isAIAvailable();
      setAiAvailable(aiCheck);
      if (aiCheck) {
        setAiProvider(getAIProvider());
      }

      // Focus input when opened
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Persist user preferences
  useEffect(() => {
    if (isOpen) {
      const preferences: UserPreferences = {
        sortBy,
        showPreview,
        searchMode,
        showFilters,
      };
      localStorage.setItem('globalSearchPreferences', JSON.stringify(preferences));
    }
  }, [isOpen, sortBy, showPreview, searchMode, showFilters]);

  // Save search to history
  const saveToHistory = useCallback(
    (query: string, mode: SearchMode | 'regex', resultCount: number) => {
      const newHistory: SearchHistory = {
        query,
        mode,
        timestamp: Date.now(),
        resultCount,
      };

      setSearchHistory(prevHistory => {
        const updated = [newHistory, ...prevHistory.filter(h => h.query !== query)].slice(0, 10);
        localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Perform search
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await onSearch(query, {
        mode: searchMode,
        limit: 50,
        includeContent: true,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        folders: selectedFolders.length > 0 ? selectedFolders : undefined,
      });

      setResults(searchResults);
      saveToHistory(query, searchMode, searchResults.length);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchMode, selectedTags, selectedFolders, onSearch, saveToHistory]);

  // Auto-search on query/mode/filter changes
  useEffect(() => {
    if (query.trim()) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults([]);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, searchMode, selectedTags, selectedFolders]);

  // Save current search
  const saveCurrentSearch = () => {
    if (!query.trim()) return;

    const newSaved: SavedSearch = {
      id: Date.now().toString(),
      name: query,
      query,
      mode: searchMode,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      folders: selectedFolders.length > 0 ? selectedFolders : undefined,
      createdAt: Date.now(),
    };

    const updated = [...savedSearches, newSaved];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Load saved search
  const loadSavedSearch = (saved: SavedSearch) => {
    setQuery(saved.query);
    setSearchMode(saved.mode);
    setSelectedTags(saved.tags || []);
    setSelectedFolders(saved.folders || []);
    setShowSaved(false);
  };

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Sort results
  const sortResults = useCallback(
    (resultsToSort: SearchResult[]): SearchResult[] => {
      const sorted = [...resultsToSort];

      switch (sortBy) {
        case 'relevance':
          // Already sorted by score from search
          return sorted.sort((a, b) => b.score - a.score);

        case 'date':
          // Sort by updated date (most recent first)
          return sorted.sort((a, b) => {
            const noteA = notes.find(n => n.id === a.noteId);
            const noteB = notes.find(n => n.id === b.noteId);
            const dateA = noteA?.updatedAt ? new Date(noteA.updatedAt).getTime() : 0;
            const dateB = noteB?.updatedAt ? new Date(noteB.updatedAt).getTime() : 0;
            return dateB - dateA;
          });

        case 'name':
          // Sort alphabetically by note name
          return sorted.sort((a, b) => a.noteName.localeCompare(b.noteName));

        case 'folder':
          // Sort by folder, then by name within folder
          return sorted.sort((a, b) => {
            const noteA = notes.find(n => n.id === a.noteId);
            const noteB = notes.find(n => n.id === b.noteId);
            const folderA = noteA?.folder || 'root';
            const folderB = noteB?.folder || 'root';

            if (folderA === folderB) {
              return a.noteName.localeCompare(b.noteName);
            }
            return folderA.localeCompare(folderB);
          });

        default:
          return sorted;
      }
    },
    [sortBy, notes]
  );

  // Get sorted results
  const sortedResults = sortResults(results);

  // Export search results to markdown
  const exportResults = useCallback(() => {
    if (sortedResults.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const exportContent = [
      `# Search Results: "${query}"`,
      ``,
      `**Search Date:** ${new Date().toLocaleString()}`,
      `**Mode:** ${searchMode}`,
      `**Results:** ${sortedResults.length}`,
      `**Sort:** ${sortBy}`,
      ``,
      `---`,
      ``,
      ...sortedResults.map((result, idx) => {
        const note = notes.find(n => n.id === result.noteId);
        return [
          `## ${idx + 1}. ${result.noteName}`,
          ``,
          `- **Match Score:** ${Math.round(result.score * 100)}%`,
          `- **Matches:** ${result.matches.length}`,
          note?.folder ? `- **Folder:** ${note.folder}` : '',
          note?.tags && note.tags.length > 0
            ? `- **Tags:** ${note.tags.map(t => `#${t}`).join(', ')}`
            : '',
          ``,
          result.matches.length > 0 ? `**Top Matches:**` : '',
          ...result.matches
            .slice(0, 3)
            .map(match => `- Line ${match.lineNumber}: ${match.context || match.text}`),
          ``,
        ]
          .filter(Boolean)
          .join('\n');
      }),
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sortedResults, query, searchMode, sortBy, notes]);

  // Load preview for selected result
  const loadPreview = useCallback(
    (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setPreviewNote(note);
      }
    },
    [notes]
  );

  // Search & Replace functionality
  const generateReplacePreview = useCallback(() => {
    if (!query.trim() || !replaceText.trim() || !onUpdateNote) return;

    const preview: ReplaceOperation[] = [];

    sortedResults.forEach(result => {
      const note = notes.find(n => n.id === result.noteId);
      if (!note) return;

      let matchCount = 0;
      let previewText = note.content;

      if (searchMode === 'regex') {
        try {
          const regex = new RegExp(query, 'gi');
          matchCount = (note.content.match(regex) || []).length;
          previewText = note.content.replace(regex, replaceText);
        } catch {
          return;
        }
      } else {
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        matchCount = (note.content.match(regex) || []).length;
        previewText = note.content.replace(regex, replaceText);
      }

      if (matchCount > 0) {
        preview.push({
          noteId: result.noteId,
          noteName: result.noteName,
          find: query,
          replace: replaceText,
          matchCount,
          preview: previewText.slice(0, 200) + '...',
        });
      }
    });

    setReplacePreview(preview);
  }, [query, replaceText, searchMode, sortedResults, notes, onUpdateNote]);

  const executeReplace = useCallback(async () => {
    if (!onUpdateNote || replacePreview.length === 0) return;

    setIsReplacing(true);
    try {
      for (const operation of replacePreview) {
        const note = notes.find(n => n.id === operation.noteId);
        if (!note) continue;

        let newContent: string;
        if (searchMode === 'regex') {
          const regex = new RegExp(query, 'gi');
          newContent = note.content.replace(regex, replaceText);
        } else {
          const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          newContent = note.content.replace(regex, replaceText);
        }

        await onUpdateNote(operation.noteId, newContent);
      }

      // Refresh search results
      await performSearch();
      setShowReplacePanel(false);
      setReplaceText('');
      setReplacePreview([]);
    } catch (error) {
      console.error('Replace failed:', error);
    } finally {
      setIsReplacing(false);
    }
  }, [onUpdateNote, replacePreview, notes, searchMode, query, replaceText, performSearch]);

  // Bulk operations
  const toggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedNotes.size === sortedResults.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(sortedResults.map(r => r.noteId)));
    }
  }, [selectedNotes.size, sortedResults]);

  const executeBulkTag = useCallback(
    async (tags: string[]) => {
      if (!onBulkUpdateNotes || selectedNotes.size === 0) return;

      const updates = Array.from(selectedNotes).map(noteId => ({
        noteId,
        tags,
      }));

      try {
        await onBulkUpdateNotes(updates);
        setSelectedNotes(new Set());
        setBulkMode(false);
        await performSearch();
      } catch (error) {
        console.error('Bulk tag failed:', error);
      }
    },
    [onBulkUpdateNotes, selectedNotes, performSearch]
  );

  const executeBulkMove = useCallback(
    async (folder: string) => {
      if (!onBulkUpdateNotes || selectedNotes.size === 0) return;

      const updates = Array.from(selectedNotes).map(noteId => ({
        noteId,
        folder,
      }));

      try {
        await onBulkUpdateNotes(updates);
        setSelectedNotes(new Set());
        setBulkMode(false);
        await performSearch();
      } catch (error) {
        console.error('Bulk move failed:', error);
      }
    },
    [onBulkUpdateNotes, selectedNotes, performSearch]
  );

  const executeBulkDelete = useCallback(async () => {
    if (!onBulkDeleteNotes || selectedNotes.size === 0) return;

    if (!confirm(`Delete ${selectedNotes.size} notes? This cannot be undone.`)) {
      return;
    }

    try {
      await onBulkDeleteNotes(Array.from(selectedNotes));
      setSelectedNotes(new Set());
      setBulkMode(false);
      await performSearch();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  }, [onBulkDeleteNotes, selectedNotes, performSearch]);

  // Search refinement
  const refineResults = useCallback(() => {
    if (!refinementQuery.trim() || baseResults.length === 0) return;

    const refined = baseResults.filter(result => {
      const note = notes.find(n => n.id === result.noteId);
      if (!note) return false;

      const searchText = `${result.noteName} ${note.content}`.toLowerCase();
      return searchText.includes(refinementQuery.toLowerCase());
    });

    setResults(refined);
  }, [refinementQuery, baseResults, notes]);

  const startRefinement = useCallback(() => {
    setBaseResults(results);
    setShowRefinement(true);
  }, [results]);

  const clearRefinement = useCallback(() => {
    setResults(baseResults);
    setRefinementQuery('');
    setShowRefinement(false);
  }, [baseResults]);

  // AI Enhancement Functions (V4)

  // Parse natural language query using AI
  const parseNaturalLanguageQuery = useCallback(async () => {
    if (!query.trim() || !aiAvailable || !naturalLanguageMode) return;

    setIsAIProcessing(true);
    try {
      const aiSettings = JSON.parse(
        localStorage.getItem('markitup-ai-settings') || localStorage.getItem('aiSettings') || '{}'
      );
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse',
          query,
          aiSettings,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const parsed: ParsedQuery = data.data;
        setParsedQuery(parsed);

        // Apply parsed filters
        if (parsed.filters.tags) setSelectedTags(parsed.filters.tags);
        if (parsed.filters.folders) setSelectedFolders(parsed.filters.folders);
        if (parsed.suggestedMode) setSearchMode(parsed.suggestedMode);

        // Update query to just keywords if different
        if (parsed.keywords.length > 0) {
          const keywordsQuery = parsed.keywords.join(' ');
          if (keywordsQuery !== query) {
            setQuery(keywordsQuery);
          }
        }
      }
    } catch (error) {
      console.error('[AI Search] Parse error:', error);
    } finally {
      setIsAIProcessing(false);
    }
  }, [query, aiAvailable, naturalLanguageMode]);

  // Generate AI search suggestions
  const generateAISuggestions = useCallback(async () => {
    if (!query.trim() || !aiAvailable || !aiEnabled || results.length === 0) return;

    setIsAIProcessing(true);
    try {
      const aiSettings = JSON.parse(
        localStorage.getItem('markitup-ai-settings') || localStorage.getItem('aiSettings') || '{}'
      );
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest',
          query,
          results: results.slice(0, 10), // Send top 10 results
          notes,
          aiSettings,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAiSuggestions(data.data);
        setShowAISuggestions(true);
      }
    } catch (error) {
      console.error('[AI Search] Suggestions error:', error);
    } finally {
      setIsAIProcessing(false);
    }
  }, [query, aiAvailable, aiEnabled, results, notes]);

  // Analyze query for corrections
  const analyzeQueryWithAI = useCallback(async () => {
    if (!query.trim() || query.length < 3 || !aiAvailable || !aiEnabled) {
      setQueryCorrection(null);
      return;
    }

    try {
      const aiSettings = JSON.parse(
        localStorage.getItem('markitup-ai-settings') || localStorage.getItem('aiSettings') || '{}'
      );
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          query,
          aiSettings,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setQueryCorrection(data.data);
      }
    } catch (error) {
      console.error('[AI Search] Analyze error:', error);
    }
  }, [query, aiAvailable, aiEnabled]);

  // AI-powered semantic refinement
  const semanticRefinement = useCallback(async () => {
    if (!refinementQuery.trim() || !aiAvailable || !aiEnabled) {
      // Fallback to text matching
      refineResults();
      return;
    }

    setIsAIProcessing(true);
    try {
      const aiSettings = JSON.parse(
        localStorage.getItem('markitup-ai-settings') || localStorage.getItem('aiSettings') || '{}'
      );
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine',
          query,
          refinementQuery,
          results,
          notes,
          aiSettings,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('[AI Search] Semantic refinement error:', error);
      // Fallback to text matching
      refineResults();
    } finally {
      setIsAIProcessing(false);
    }
  }, [query, refinementQuery, results, notes, aiAvailable, aiEnabled, refineResults]);

  // Apply natural language query parsing when in NL mode
  useEffect(() => {
    if (naturalLanguageMode && query.trim() && aiAvailable) {
      const timer = setTimeout(() => {
        parseNaturalLanguageQuery();
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [query, naturalLanguageMode, aiAvailable, parseNaturalLanguageQuery]);

  // Generate suggestions when results are available and AI is enabled
  useEffect(() => {
    if (aiEnabled && results.length > 0 && !isSearching) {
      const timer = setTimeout(() => {
        generateAISuggestions();
      }, 1000); // Wait 1s after search completes
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [aiEnabled, results, isSearching, generateAISuggestions]);

  // Analyze query for corrections
  useEffect(() => {
    if (aiEnabled && query.trim().length >= 3) {
      const timer = setTimeout(() => {
        analyzeQueryWithAI();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setQueryCorrection(null);
      return undefined;
    }
  }, [query, aiEnabled, analyzeQueryWithAI]);

  // Smart filters
  const applySmartFilters = useCallback(() => {
    let filtered = [...results];

    // Word count filter
    filtered = filtered.filter(result => {
      const note = notes.find(n => n.id === result.noteId);
      if (!note) return false;
      return note.wordCount >= wordCountRange[0] && note.wordCount <= wordCountRange[1];
    });

    // Untagged filter
    if (filterUntagged) {
      filtered = filtered.filter(result => {
        const note = notes.find(n => n.id === result.noteId);
        return note && note.tags.length === 0;
      });
    }

    // Orphans filter (notes with no wikilinks)
    if (filterOrphans) {
      filtered = filtered.filter(result => {
        const note = notes.find(n => n.id === result.noteId);
        if (!note) return false;
        const hasWikilinks = /\[\[([^\]]+)\]\]/.test(note.content);
        return !hasWikilinks;
      });
    }

    setResults(filtered);
  }, [results, notes, wordCountRange, filterUntagged, filterOrphans]);

  // Regex validation
  useEffect(() => {
    if (searchMode === 'regex' && query.trim()) {
      try {
        new RegExp(query);
        setRegexError(null);
      } catch (error) {
        setRegexError((error as Error).message);
      }
    } else {
      setRegexError(null);
    }
  }, [searchMode, query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedResultIndex(0);
    resultRefs.current = [];
  }, [sortedResults]);

  // Scroll selected result into view
  useEffect(() => {
    if (resultRefs.current[selectedResultIndex]) {
      resultRefs.current[selectedResultIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedResultIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape') {
        if (showPreview) {
          setShowPreview(false);
          e.preventDefault();
        } else {
          onClose();
        }
        return;
      }

      // Search on Cmd/Ctrl + Enter
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        performSearch();
        return;
      }

      // Navigate results with arrow keys
      if (sortedResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedResultIndex(prev => (prev < sortedResults.length - 1 ? prev + 1 : prev));
          const nextResult = sortedResults[selectedResultIndex + 1];
          if (showPreview && nextResult) {
            loadPreview(nextResult.noteId);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedResultIndex(prev => (prev > 0 ? prev - 1 : prev));
          const prevResult = sortedResults[selectedResultIndex - 1];
          if (showPreview && prevResult) {
            loadPreview(prevResult.noteId);
          }
        } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
          // Open selected result on Enter
          e.preventDefault();
          const selectedResult = sortedResults[selectedResultIndex];
          if (selectedResult) {
            onSelectNote(selectedResult.noteId);
            onClose();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [
    isOpen,
    onClose,
    performSearch,
    sortedResults,
    selectedResultIndex,
    showPreview,
    loadPreview,
    onSelectNote,
  ]);

  if (!isOpen) return null;

  const getModeIcon = (mode: SearchMode | 'regex') => {
    switch (mode) {
      case 'keyword':
        return <Search className="w-4 h-4" />;
      case 'semantic':
        return <Brain className="w-4 h-4" />;
      case 'hybrid':
        return <Sparkles className="w-4 h-4" />;
      case 'regex':
        return <Code className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          maxHeight: 'calc(100vh - 8rem)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Global Search
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {notes.length} notes indexed
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search Input & Modes */}
        <div
          className="p-4 border-b"
          style={{
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search across all notes... (⌘+Enter to search)"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  outlineColor: 'var(--accent-primary)',
                }}
              />
            </div>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border-secondary)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
            )}
          </div>

          {/* Search Modes */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Mode:
            </span>
            {(['keyword', 'semantic', 'hybrid', 'regex'] as (SearchMode | 'regex')[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSearchMode(mode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={
                  searchMode === mode
                    ? {
                        backgroundColor:
                          mode === 'keyword'
                            ? '#3b82f6'
                            : mode === 'semantic'
                              ? '#8b5cf6'
                              : mode === 'hybrid'
                                ? '#10b981'
                                : '#f97316',
                        color: '#ffffff',
                      }
                    : {
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                      }
                }
                onMouseEnter={e => {
                  if (searchMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (searchMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }
                }}
              >
                {getModeIcon(mode)}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}

            {/* Regex Error */}
            {regexError && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--error-color)',
                  color: '#ffffff',
                  opacity: 0.9,
                }}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Invalid regex: {regexError}</span>
              </div>
            )}

            {/* AI Features Toggle (V4) - Only shown if AI is configured */}
            {aiAvailable && (
              <div
                className="flex items-center gap-2 ml-4 pl-4 border-l"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg"
                  style={
                    aiEnabled
                      ? {
                          backgroundColor: '#8b5cf6',
                          color: '#ffffff',
                        }
                      : {
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                        }
                  }
                  onMouseEnter={e => {
                    if (!aiEnabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!aiEnabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }
                  }}
                  title={`AI Enhancement (${aiProvider}) - ${aiEnabled ? 'Enabled' : 'Disabled'}`}
                >
                  <Sparkles className={`w-4 h-4 ${aiEnabled ? 'animate-pulse' : ''}`} />
                  AI {aiEnabled ? 'On' : 'Off'}
                </button>

                {aiEnabled && (
                  <button
                    onClick={() => setNaturalLanguageMode(!naturalLanguageMode)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    style={
                      naturalLanguageMode
                        ? {
                            backgroundColor: '#6366f1',
                            color: '#ffffff',
                          }
                        : {
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                          }
                    }
                    onMouseEnter={e => {
                      if (!naturalLanguageMode) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!naturalLanguageMode) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      }
                    }}
                    title="Natural language query mode"
                  >
                    <Brain className="w-4 h-4" />
                    NL
                  </button>
                )}
              </div>
            )}

            {/* Prompt to configure AI if not available */}
            {!aiAvailable && (
              <button
                onClick={() => {
                  alert(
                    'Please configure an AI provider in Settings (Brain icon) to enable AI-powered search features.\n\nRecommended: Ollama (free, local, no API key required!)'
                  );
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors"
                style={{
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent-primary)',
                  borderColor: 'var(--accent-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                }}
                title="Configure AI for enhanced search"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">Configure AI</span>
              </button>
            )}

            <div className="flex-1" />

            {/* New Action Buttons */}
            {onUpdateNote && results.length > 0 && (
              <button
                onClick={() => setShowReplacePanel(!showReplacePanel)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(251, 146, 60, 0.15)',
                  color: '#f97316',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Replace className="w-4 h-4" />
                Replace
              </button>
            )}
            {(onBulkUpdateNotes || onBulkDeleteNotes) && results.length > 0 && (
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {bulkMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                Bulk ({bulkMode ? selectedNotes.size : 'Off'})
              </button>
            )}
            {results.length > 0 && (
              <button
                onClick={startRefinement}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  color: '#14b8a6',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Search className="w-4 h-4" />
                Refine
              </button>
            )}
            <button
              onClick={() => setShowSmartFilters(!showSmartFilters)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#6366f1',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Sliders className="w-4 h-4" />
              Smart
            </button>

            <div className="flex-1" />

            {/* Action Buttons */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
            >
              <Star className="w-4 h-4" />
              Saved ({savedSearches.length})
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {query && (
              <button
                onClick={saveCurrentSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Save className="w-4 h-4" />
                Save Search
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tags Filter */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Hash className="w-4 h-4" />
                  Tags
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableTags.map(tag => (
                    <label key={tag} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          }
                        }}
                        className="rounded"
                      />
                      <span style={{ color: 'var(--text-primary)' }}>#{tag}</span>
                    </label>
                  ))}
                  {availableTags.length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      No tags available
                    </p>
                  )}
                </div>
              </div>

              {/* Folders Filter */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Folder className="w-4 h-4" />
                  Folders
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableFolders.map(folder => (
                    <label key={folder} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFolders.includes(folder)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedFolders([...selectedFolders, folder]);
                          } else {
                            setSelectedFolders(selectedFolders.filter(f => f !== folder));
                          }
                        }}
                        className="rounded"
                      />
                      <span style={{ color: 'var(--text-primary)' }}>{folder}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedTags.length > 0 || selectedFolders.length > 0) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Active filters:
                </span>
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6',
                    }}
                  >
                    #{tag}
                    <button onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedFolders.map(folder => (
                  <span
                    key={folder}
                    className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                    }}
                  >
                    {folder}
                    <button
                      onClick={() => setSelectedFolders(selectedFolders.filter(f => f !== folder))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setSelectedFolders([]);
                  }}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--error-color)' }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search & Replace Panel */}
        {showReplacePanel && onUpdateNote && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3
              className="text-sm font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Replace className="w-4 h-4" />
              Search & Replace in {sortedResults.length} results
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs"
                  style={{
                    color: theme === 'dark' ? '#9a3412' : '#4b5563',
                  }}
                >
                  Replace with:
                </label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                  placeholder="Replacement text..."
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generateReplacePreview}
                  disabled={!replaceText.trim()}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                  }}
                  onMouseEnter={e => {
                    if (replaceText.trim()) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Preview Changes
                </button>
                {replacePreview.length > 0 && (
                  <button
                    onClick={executeReplace}
                    disabled={isReplacing}
                    className="px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                    style={{
                      backgroundColor: 'var(--error-color)',
                      color: '#ffffff',
                    }}
                    onMouseEnter={e => {
                      if (!isReplacing) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {isReplacing ? 'Replacing...' : `Replace in ${replacePreview.length} notes`}
                  </button>
                )}
              </div>
              {replacePreview.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                  {replacePreview.map(op => (
                    <div
                      key={op.noteId}
                      className="text-xs p-2 rounded border"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-secondary)',
                      }}
                    >
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {op.noteName}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {op.matchCount} matches will be replaced
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Actions Panel */}
        {bulkMode && selectedNotes.size > 0 && (onBulkUpdateNotes || onBulkDeleteNotes) && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3
              className="text-sm font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <CheckSquare className="w-4 h-4" />
              Bulk Actions ({selectedNotes.size} selected)
            </h3>
            <div className="flex gap-2 flex-wrap">
              {onBulkUpdateNotes && (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tags..."
                      className="px-3 py-1.5 border rounded-lg text-sm"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-primary)',
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const tags = e.currentTarget.value.split(',').map(t => t.trim());
                          executeBulkTag(tags);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Tag className="w-4 h-4 self-center" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        executeBulkMove(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">Move to folder...</option>
                    {availableFolders.map(folder => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {onBulkDeleteNotes && (
                <button
                  onClick={executeBulkDelete}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--error-color)',
                    color: '#ffffff',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedNotes.size})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search Refinement Panel */}
        {showRefinement && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'rgba(20, 184, 166, 0.1)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3
              className="text-sm font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Search className="w-4 h-4" />
              Refine Results (searching within {baseResults.length} results)
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={refinementQuery}
                onChange={e => setRefinementQuery(e.target.value)}
                placeholder="Refine search..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    refineResults();
                  }
                }}
              />
              <button
                onClick={() => {
                  if (aiEnabled) {
                    semanticRefinement();
                  } else {
                    refineResults();
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                disabled={isAIProcessing}
                style={{
                  backgroundColor: '#14b8a6',
                  color: '#ffffff',
                  opacity: isAIProcessing ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!isAIProcessing) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={e => {
                  if (!isAIProcessing) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {isAIProcessing ? 'Processing...' : 'Apply'}
              </button>
              <button
                onClick={clearRefinement}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* AI Query Correction Panel (V4) */}
        {aiEnabled && queryCorrection && (
          <div
            className="p-3 border-b"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-start gap-3">
              <Lightbulb
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: 'var(--warning-color)' }}
              />
              <div className="flex-1">
                <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                  {queryCorrection.reason}
                </p>
                <button
                  onClick={() => {
                    setQuery(queryCorrection.suggested);
                    setQueryCorrection(null);
                  }}
                  className="text-sm hover:underline font-medium"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Did you mean: "{queryCorrection.suggested}"?
                </button>
              </div>
              <button
                onClick={() => setQueryCorrection(null)}
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* AI Suggestions Panel (V4) */}
        {aiEnabled && showAISuggestions && aiSuggestions.length > 0 && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.08)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI Suggestions
              </h3>
              <button
                onClick={() => setShowAISuggestions(false)}
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (suggestion.type === 'query') {
                      setQuery(suggestion.value);
                      setShowAISuggestions(false);
                    } else if (suggestion.type === 'tag') {
                      if (!selectedTags.includes(suggestion.value)) {
                        setSelectedTags([...selectedTags, suggestion.value]);
                      }
                    } else if (suggestion.type === 'folder') {
                      if (!selectedFolders.includes(suggestion.value)) {
                        setSelectedFolders([...selectedFolders, suggestion.value]);
                      }
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')
                  }
                >
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#a855f7' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {suggestion.value}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {suggestion.reason}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        color: '#a855f7',
                      }}
                    >
                      {suggestion.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Natural Language Query Info (V4) */}
        {naturalLanguageMode && parsedQuery && (
          <div
            className="p-3 border-b"
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#6366f1' }} />
              <div className="flex-1">
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Parsed Query (AI Interpretation):
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {parsedQuery.keywords.length > 0 && (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                      }}
                    >
                      Keywords: {parsedQuery.keywords.join(', ')}
                    </span>
                  )}
                  {parsedQuery.suggestedMode && (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                      }}
                    >
                      Mode: {parsedQuery.suggestedMode}
                    </span>
                  )}
                  <span
                    className="px-2 py-1 rounded"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.15)',
                      color: '#a855f7',
                    }}
                  >
                    Confidence: {Math.round(parsedQuery.confidence * 100)}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => setParsedQuery(null)}
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Smart Filters Panel */}
        {showSmartFilters && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3
              className="text-sm font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Sliders className="w-4 h-4" />
              Smart Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-primary)' }}>
                  Word Count Range: {wordCountRange[0]} - {wordCountRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={wordCountRange[0]}
                    onChange={e =>
                      setWordCountRange([parseInt(e.target.value) || 0, wordCountRange[1]])
                    }
                    className="w-20 px-2 py-1 border rounded text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <span className="self-center" style={{ color: 'var(--text-primary)' }}>
                    to
                  </span>
                  <input
                    type="number"
                    value={wordCountRange[1]}
                    onChange={e =>
                      setWordCountRange([wordCountRange[0], parseInt(e.target.value) || 10000])
                    }
                    className="w-20 px-2 py-1 border rounded text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterUntagged}
                    onChange={e => setFilterUntagged(e.target.checked)}
                    className="rounded"
                  />
                  <span style={{ color: 'var(--text-primary)' }}>Only untagged notes</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterOrphans}
                    onChange={e => setFilterOrphans(e.target.checked)}
                    className="rounded"
                  />
                  <span style={{ color: 'var(--text-primary)' }}>Only orphan notes (no links)</span>
                </label>
              </div>
            </div>
            <button
              onClick={applySmartFilters}
              className="mt-3 px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
              }}
            >
              Apply Smart Filters
            </button>
          </div>
        )}

        {/* History Panel */}
        {showHistory && searchHistory.length > 0 && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Recent Searches
            </h3>
            <div className="space-y-1">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item.query);
                    setSearchMode(item.mode);
                    setShowHistory(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {item.query}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {item.resultCount} results
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.mode}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Searches Panel */}
        {showSaved && savedSearches.length > 0 && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Saved Searches
            </h3>
            <div className="space-y-1">
              {savedSearches.map(saved => (
                <div
                  key={saved.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  <button
                    onClick={() => loadSavedSearch(saved)}
                    className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300"
                  >
                    {saved.name}
                  </button>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">
                    {saved.mode}
                  </span>
                  <button
                    onClick={() => deleteSavedSearch(saved.id)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <X className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 flex overflow-hidden">
          {/* Results List */}
          <div
            ref={resultsContainerRef}
            className={`overflow-y-auto ${showPreview ? 'w-1/2' : 'w-full'}`}
            style={{ maxHeight: 'calc(100vh - 32rem)' }}
          >
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: 'var(--accent-primary)' }}
                />
                <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>
                  Searching...
                </span>
              </div>
            ) : sortedResults.length > 0 ? (
              <div className="p-4 space-y-3">
                {/* Results Header with Controls */}
                <div
                  className="flex items-center justify-between mb-3 pb-3 border-b"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <div className="flex items-center gap-3">
                    {bulkMode && (
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 rounded transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={e =>
                          (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')
                        }
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {selectedNotes.size === sortedResults.length ? (
                          <CheckSquare
                            className="w-5 h-5"
                            style={{ color: 'var(--accent-primary)' }}
                          />
                        ) : (
                          <Square className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        )}
                      </button>
                    )}
                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Found {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''}
                      {bulkMode && selectedNotes.size > 0 && ` (${selectedNotes.size} selected)`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search Mode Badge */}
                    <div
                      className="flex items-center gap-2 text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {getModeIcon(searchMode)}
                      <span>{searchMode}</span>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-1.5 text-xs border rounded-lg"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                      }}
                    >
                      <option value="relevance">Sort: Relevance</option>
                      <option value="date">Sort: Date</option>
                      <option value="name">Sort: Name</option>
                      <option value="folder">Sort: Folder</option>
                    </select>

                    {/* Preview Toggle */}
                    <button
                      onClick={() => {
                        setShowPreview(!showPreview);
                        if (!showPreview && sortedResults[selectedResultIndex]) {
                          loadPreview(sortedResults[selectedResultIndex].noteId);
                        }
                      }}
                      className="p-1.5 rounded-lg text-xs border hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{
                        backgroundColor: showPreview
                          ? theme === 'dark'
                            ? '#374151'
                            : '#e5e7eb'
                          : 'transparent',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      }}
                      title="Toggle preview"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {/* Export Button */}
                    <button
                      onClick={exportResults}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      }}
                      title="Export results to markdown"
                    >
                      <FileDown className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Results List */}
                {sortedResults.map((result, idx) => (
                  <div key={result.noteId} className="flex items-start gap-2">
                    {bulkMode && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleNoteSelection(result.noteId);
                        }}
                        className="mt-4 p-1"
                      >
                        {selectedNotes.has(result.noteId) ? (
                          <CheckSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    )}
                    <button
                      ref={el => {
                        resultRefs.current[idx] = el;
                      }}
                      onClick={() => {
                        if (!bulkMode) {
                          onSelectNote(result.noteId);
                          onClose();
                        }
                      }}
                      onMouseEnter={() => {
                        setSelectedResultIndex(idx);
                        if (showPreview) {
                          loadPreview(result.noteId);
                        }
                      }}
                      className={`flex-1 p-4 rounded-lg border text-left transition-all ${
                        selectedResultIndex === idx
                          ? 'shadow-md ring-2 ring-blue-500'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor:
                          selectedResultIndex === idx
                            ? '#3b82f6'
                            : theme === 'dark'
                              ? '#4b5563'
                              : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {result.noteName}
                          </h4>
                          {(() => {
                            const note = notes.find(n => n.id === result.noteId);
                            return (
                              note?.folder && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <Folder className="w-3 h-3 inline mr-1" />
                                  {note.folder}
                                </p>
                              )
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {Math.round(result.score * 100)}% match
                          </span>
                        </div>
                      </div>
                      {result.matches.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {result.matches.slice(0, 3).map((match, matchIdx) => (
                            <div
                              key={matchIdx}
                              className="text-sm text-gray-600 dark:text-gray-400 truncate"
                            >
                              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                Line {match.lineNumber}:
                              </span>
                              {match.context || match.text}
                            </div>
                          ))}
                          {result.matches.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{result.matches.length - 3} more matches
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {result.matches.length} matches
                        </span>
                        {selectedResultIndex === idx && (
                          <span className="text-blue-600 dark:text-blue-400">
                            Press Enter to open
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No results found for &quot;{query}&quot;
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try different keywords or change the search mode
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a search query to get started
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try keyword, semantic, or hybrid search modes
                </p>
              </div>
            )}
          </div>

          {/* Preview Pane */}
          {showPreview && previewNote && (
            <div
              className="w-1/2 border-l overflow-y-auto p-4"
              style={{
                maxHeight: 'calc(100vh - 32rem)',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {previewNote.name}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {previewNote.folder && (
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      {previewNote.folder}
                    </span>
                  )}
                  {previewNote.tags && previewNote.tags.length > 0 && (
                    <span className="flex items-center gap-1 flex-wrap">
                      <Hash className="w-3 h-3" />
                      {previewNote.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                  <span>{previewNote.wordCount} words</span>
                  <span>{previewNote.readingTime} min read</span>
                </div>
              </div>
              <div
                className="prose dark:prose-invert max-w-none text-sm"
                style={{
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                }}
              >
                <pre className="whitespace-pre-wrap font-sans">
                  {previewNote.content.slice(0, 2000)}
                  {previewNote.content.length > 2000 && '\n\n... (preview truncated)'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t text-xs text-gray-500 dark:text-gray-400"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span>⌘+Enter to search</span>
            <span>↑↓ to navigate</span>
            <span>Enter to open</span>
            <span>Esc to close</span>
            {sortedResults.length > 0 && (
              <>
                {onUpdateNote && (
                  <span className="text-orange-600 dark:text-orange-400">• Replace available</span>
                )}
                {(onBulkUpdateNotes || onBulkDeleteNotes) && (
                  <span className="text-purple-600 dark:text-purple-400">
                    • Bulk actions available
                  </span>
                )}
                <span className="text-teal-600 dark:text-teal-400">• Refine search</span>
                <span className="text-indigo-600 dark:text-indigo-400">• Smart filters</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Global Search V4 {aiEnabled ? '(AI Enhanced)' : ''} • Ctrl+Shift+F</span>
            {aiAvailable && !aiEnabled && (
              <span className="text-purple-600 dark:text-purple-400">• AI Available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchPanel;
