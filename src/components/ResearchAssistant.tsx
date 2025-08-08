"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Link as LinkIcon, 
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  X,
  Zap,
  FileText,
  Bookmark,
  Globe
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note, SearchResult } from '@/lib/types';
import { analytics } from '@/lib/analytics';
import { SemanticSearchEngine, SemanticSearchResult } from '@/lib/ai/semantic-search';

interface ResearchQuery {
  id: string;
  query: string;
  intent: 'explore' | 'find' | 'connect' | 'analyze';
  results: SemanticSearchResult[];
  insights: {
    relatedTopics: string[];
    missingKnowledge: string[];
    suggestedConnections: Array<{
      from: string;
      to: string;
      reason: string;
    }>;
  };
  timestamp: string;
}

interface ResearchAssistantProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onCreateNote?: (title: string, content: string, tags: string[]) => void;
  onOpenNote?: (noteId: string) => void;
}

export default function ResearchAssistant({
  notes,
  isOpen,
  onClose,
  onCreateNote,
  onOpenNote
}: ResearchAssistantProps) {
  const { theme } = useSimpleTheme();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'insights' | 'connections'>('search');
  const [researchHistory, setResearchHistory] = useState<ResearchQuery[]>([]);
  const [currentResults, setCurrentResults] = useState<SemanticSearchResult[]>([]);
  const [searchInsights, setSearchInsights] = useState<{
    relatedTopics: string[];
    conceptualKeywords: string[];
    searchSuggestions: string[];
  } | null>(null);
  const [semanticSearch] = useState(() => new SemanticSearchEngine());

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen) {
      const searchInput = document.getElementById('research-search-input');
      searchInput?.focus();
    }
  }, [isOpen]);

  const performSemanticSearch = async () => {
    if (!searchQuery.trim() || notes.length === 0) return;
    
    setIsSearching(true);
    
    try {
      const result = await semanticSearch.semanticSearch(searchQuery, notes, {
        maxResults: 15,
        includeRelated: true,
        searchDepth: 'comprehensive'
      });

      setCurrentResults(result.results);
      setSearchInsights(result.insights);

      // Add to research history
      const newQuery: ResearchQuery = {
        id: `query_${Date.now()}`,
        query: searchQuery,
        intent: 'explore',
        results: result.results,
        insights: {
          relatedTopics: result.insights.relatedTopics,
          missingKnowledge: [],
          suggestedConnections: []
        },
        timestamp: new Date().toISOString()
      };

      setResearchHistory(prev => [newQuery, ...prev.slice(0, 9)]); // Keep last 10

      analytics.trackEvent('ai_analysis', {
        action: 'semantic_search',
        query: searchQuery,
        resultsCount: result.results.length
      });

    } catch (error) {
      console.error('Semantic search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateResearchSuggestions = async () => {
    if (notes.length === 0) return;

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `Research Assistant Analysis
          
Available notes: ${notes.slice(0, 10).map(n => n.name).join(', ')}
Available topics: ${Array.from(new Set(notes.flatMap(n => n.tags))).slice(0, 20).join(', ')}

Analyze this knowledge base and suggest research directions.`,
          analysisType: 'content'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Research suggestions:', data);
      }
    } catch (error) {
      console.error('Research suggestions error:', error);
    }
  };

  const exploreRelatedTopic = (topic: string) => {
    setSearchQuery(topic);
    performSemanticSearch();
  };

  const createResearchNote = (topic: string) => {
    if (!onCreateNote) return;

    const content = `# Research: ${topic}

## Research Question
What do I want to learn about ${topic}?

## Current Understanding
- [What I already know about this topic]

## Key Questions
- [Questions I want to answer]
- [Gaps in my knowledge]

## Related Notes
${currentResults.slice(0, 5).map(r => `- [[${r.noteName}]]`).join('\n')}

## Sources to Explore
- [Academic papers, books, articles]
- [Experts to follow]
- [Communities to join]

## Next Steps
- [ ] [Specific research tasks]
- [ ] [Notes to create]
- [ ] [Connections to make]

---
*Created by Research Assistant on ${new Date().toLocaleDateString()}*`;

    onCreateNote(`Research: ${topic}`, content, ['research', 'topic', topic.toLowerCase()]);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-y-0 right-0 w-96 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
      }}>
      
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 
            className="font-semibold text-gray-900 dark:text-white"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
            Research Assistant
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={generateResearchSuggestions}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Generate Research Suggestions">
            <Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700"
           style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <div className="flex gap-2">
          <input
            id="research-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
            placeholder="Research topic or question..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
              color: theme === 'dark' ? '#f9fafb' : '#111827'
            }}
          />
          <button
            onClick={performSemanticSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        {[
          { id: 'search', label: 'Results', icon: Search },
          { id: 'insights', label: 'Insights', icon: Lightbulb },
          { id: 'connections', label: 'Connect', icon: LinkIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Search Results Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {currentResults.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Found {currentResults.length} results
                </div>
                
                <div className="space-y-3">
                  {currentResults.map((result, index) => (
                    <div
                      key={result.noteId}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                      }}
                      onClick={() => onOpenNote?.(result.noteId)}>
                      
                      <div className="flex items-start justify-between mb-2">
                        <h3 
                          className="font-medium text-sm"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                          {result.noteName}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                              color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                            }}>
                            {Math.round(result.semanticScore * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {result.matches.slice(0, 2).map((match, matchIndex) => (
                        <div key={matchIndex} className="text-xs mb-1">
                          <span 
                            className="text-gray-600 dark:text-gray-400"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            ...{match.context.substring(0, 100)}...
                          </span>
                        </div>
                      ))}
                      
                      {result.conceptualMatches.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.conceptualMatches.slice(0, 3).map((concept, conceptIndex) => (
                            <span
                              key={conceptIndex}
                              className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : searchQuery ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  No Results Found
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Try different keywords or explore related topics
                </p>
                <button
                  onClick={() => createResearchNote(searchQuery)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Create Research Note
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  Start Your Research
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Enter a topic or question to search your knowledge base
                </p>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {searchInsights ? (
              <>
                {/* Related Topics */}
                {searchInsights.relatedTopics.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <TrendingUp className="w-4 h-4" />
                      Related Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchInsights.relatedTopics.slice(0, 8).map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => exploreRelatedTopic(topic)}
                          className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Suggestions */}
                {searchInsights.searchSuggestions.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Target className="w-4 h-4" />
                      Search Suggestions
                    </h3>
                    <div className="space-y-2">
                      {searchInsights.searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => exploreRelatedTopic(suggestion)}
                          className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}>
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-sm"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                              {suggestion}
                            </span>
                            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research History */}
                {researchHistory.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Bookmark className="w-4 h-4" />
                      Recent Research
                    </h3>
                    <div className="space-y-2">
                      {researchHistory.slice(0, 5).map((query) => (
                        <button
                          key={query.id}
                          onClick={() => {
                            setSearchQuery(query.query);
                            setCurrentResults(query.results);
                            setActiveTab('search');
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="text-sm font-medium"
                               style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                            {query.query}
                          </div>
                          <div className="text-xs"
                               style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {query.results.length} results • {new Date(query.timestamp).toLocaleDateString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  Research Insights
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Perform a search to see insights and suggestions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                Connection Discovery
              </h3>
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Coming soon: AI-powered connection suggestions between your notes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
