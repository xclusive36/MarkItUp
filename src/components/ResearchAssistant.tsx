'use client';

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
  Bookmark,
  Check,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note } from '@/lib/types';
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

interface ConnectionSuggestion {
  fromNoteId: string;
  fromNoteName: string;
  toNoteId: string;
  toNoteName: string;
  reason: string;
  confidence: number;
  isBidirectional?: boolean;
  // Phase 3: Enhanced context
  contextSnippet?: string;
  sharedConcepts?: string[];
  strength?: 'strong' | 'moderate' | 'weak';
  suggestedTags?: string[];
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
  onOpenNote,
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
  const [discoveredConnections, setDiscoveredConnections] = useState<ConnectionSuggestion[]>([]);
  const [isAnalyzingConnections, setIsAnalyzingConnections] = useState(false);

  // Phase 2: Enhanced features
  const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set());
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.35);
  const [showBidirectional, setShowBidirectional] = useState(true);

  // Phase 3: Advanced features
  const [showContextPreviews, setShowContextPreviews] = useState(true);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());

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
        searchDepth: 'comprehensive',
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
          suggestedConnections: [],
        },
        timestamp: new Date().toISOString(),
      };

      setResearchHistory(prev => [newQuery, ...prev.slice(0, 9)]); // Keep last 10

      analytics.trackEvent('ai_analysis', {
        action: 'semantic_search',
        query: searchQuery,
        resultsCount: result.results.length,
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `Research Assistant Analysis
          
Available notes: ${notes
            .slice(0, 10)
            .map(n => n.name)
            .join(', ')}
Available topics: ${Array.from(new Set(notes.flatMap(n => n.tags)))
            .slice(0, 20)
            .join(', ')}

Analyze this knowledge base and suggest research directions.`,
          analysisType: 'content',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Research suggestions:', data);
      } else {
        const errorData = await response.json();
        if (errorData.requiresApiKey) {
          console.log(
            'Research Assistant: AI provider not configured. Configure in settings - Ollama (local, no API key) or cloud providers (API key required).'
          );
        }
      }
    } catch (error) {
      console.error('Research suggestions error:', error);
    }
  };

  const exploreRelatedTopic = (topic: string) => {
    setSearchQuery(topic);
    performSemanticSearch();
  };

  // Phase 3: Helper function to extract relevant context snippet
  const extractContextSnippet = (
    content: string,
    targetName: string,
    targetWords: string[]
  ): string => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);

    // Find sentences mentioning the target note or related words
    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return (
        lowerSentence.includes(targetName) ||
        targetWords.some(word => lowerSentence.includes(word.toLowerCase()))
      );
    });

    if (relevantSentences.length > 0) {
      const firstSentence = relevantSentences[0];
      if (firstSentence) {
        const snippet = firstSentence.trim();
        return snippet.length > 150 ? snippet.substring(0, 147) + '...' : snippet;
      }
    }

    return '';
  };

  // Phase 3: Generate tag suggestions based on shared content
  const generateSuggestedTags = (
    note1: Note,
    note2: Note,
    sharedTags: string[],
    commonWords: string[]
  ): string[] => {
    const suggestions = new Set<string>();

    // Add shared tags
    sharedTags.forEach(tag => suggestions.add(tag));

    // Extract potential tags from common important words
    const importantWords = commonWords.filter(
      word =>
        word.length > 5 &&
        !['about', 'which', 'would', 'could', 'should', 'their', 'there'].includes(word)
    );

    importantWords.slice(0, 3).forEach(word => {
      const tag = word.replace(/[^a-z0-9-]/gi, '').toLowerCase();
      if (tag.length >= 3) suggestions.add(tag);
    });

    // Check if both notes are about similar topics
    const note1Words = note1.name.toLowerCase().split(/\s+/);
    const note2Words = note2.name.toLowerCase().split(/\s+/);
    const titleOverlap = note1Words.filter(w => note2Words.includes(w) && w.length > 3);

    titleOverlap.forEach(word => suggestions.add(word));

    return Array.from(suggestions);
  };

  const analyzeConnections = async () => {
    console.log('analyzeConnections called', {
      currentResultsLength: currentResults.length,
      notesLength: notes.length,
    });

    if (currentResults.length === 0) {
      console.log('No current results to analyze');
      return;
    }

    setIsAnalyzingConnections(true);
    setDiscoveredConnections([]);

    try {
      // Get top search results to analyze
      const topResults = currentResults.slice(0, 10);
      console.log('Analyzing top results:', topResults.length);
      const connections: ConnectionSuggestion[] = [];

      // Analyze connections between search results
      for (let i = 0; i < topResults.length; i++) {
        const fromResult = topResults[i];
        if (!fromResult) continue;

        const fromNote = notes.find(n => n.id === fromResult.noteId);
        if (!fromNote) continue;

        // Find potential connections to other notes in results
        for (let j = i + 1; j < topResults.length; j++) {
          const toResult = topResults[j];
          if (!toResult) continue;

          const toNote = notes.find(n => n.id === toResult.noteId);
          if (!toNote) continue;

          // Check if notes share conceptual matches
          const sharedConcepts = fromResult.conceptualMatches.filter(concept =>
            toResult.conceptualMatches.includes(concept)
          );

          if (sharedConcepts.length > 0) {
            const confidence = Math.min(
              (sharedConcepts.length / Math.max(fromResult.conceptualMatches.length, 1)) * 0.8 +
                fromResult.semanticScore * 0.1 +
                toResult.semanticScore * 0.1,
              0.95
            );

            if (confidence > 0.5) {
              // Phase 3: Enhanced connection data
              const strength: 'strong' | 'moderate' | 'weak' =
                confidence > 0.7 ? 'strong' : confidence > 0.6 ? 'moderate' : 'weak';

              const contextSnippet = fromNote.content.split(/[.!?]+/)[0]?.trim() || '';
              const sharedTags = fromNote.tags?.filter(tag => toNote.tags?.includes(tag)) || [];
              const suggestedTags = [
                ...new Set([...sharedConcepts.slice(0, 2), ...sharedTags]),
              ].slice(0, 3);

              connections.push({
                fromNoteId: fromNote.id,
                fromNoteName: fromNote.name,
                toNoteId: toNote.id,
                toNoteName: toNote.name,
                reason: `Both discuss: ${sharedConcepts.slice(0, 3).join(', ')}`,
                confidence: confidence,
                isBidirectional: checkIfLinked(fromNote, toNote),
                contextSnippet:
                  contextSnippet.length > 150
                    ? contextSnippet.substring(0, 147) + '...'
                    : contextSnippet,
                sharedConcepts: sharedConcepts.slice(0, 5),
                strength,
                suggestedTags,
              });
            }
          }
        }

        // Also check connections to notes not in search results
        const otherNotes = notes.filter(
          n => !topResults.some(r => r.noteId === n.id) && n.id !== fromNote.id
        );

        for (const otherNote of otherNotes.slice(0, 50)) {
          // Check if fromNote mentions the other note's name or key concepts
          const fromContent = fromNote.content.toLowerCase();
          const otherContent = otherNote.content.toLowerCase();
          const otherNameWords = otherNote.name
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3);

          // Count mentions of the other note's name words
          const mentionsCount = otherNameWords.filter(word => fromContent.includes(word)).length;

          // Check if the note name appears directly
          const hasDirectMention = fromContent.includes(otherNote.name.toLowerCase());

          // Check for shared tags
          const sharedTags = fromNote.tags?.filter(tag => otherNote.tags?.includes(tag)) || [];

          // Extract common words (simple similarity check)
          const fromWords = fromContent.split(/\s+/).filter(w => w.length > 4);
          const otherWords = otherContent.split(/\s+/).filter(w => w.length > 4);
          const commonWords = fromWords.filter(w => otherWords.includes(w));
          const contentSimilarity = commonWords.length / Math.max(fromWords.length, 1);

          // Calculate confidence based on multiple factors
          let confidence = 0;
          const reasons: string[] = [];

          if (hasDirectMention) {
            confidence += 0.4;
            reasons.push(`mentions "${otherNote.name}"`);
          } else if (mentionsCount >= 2) {
            confidence += 0.25 + mentionsCount * 0.05;
            reasons.push(`discusses related concepts`);
          }

          if (sharedTags.length > 0) {
            confidence += 0.2;
            reasons.push(`shares tags: ${sharedTags.slice(0, 2).join(', ')}`);
          }

          if (contentSimilarity > 0.1) {
            confidence += Math.min(contentSimilarity * 0.3, 0.25);
            reasons.push(`${Math.round(contentSimilarity * 100)}% content overlap`);
          }

          // Add connection if confidence is above threshold
          if (confidence > 0.35 && reasons.length > 0) {
            // Phase 3: Extract context snippet
            const contextSnippet = extractContextSnippet(
              fromContent,
              otherNote.name.toLowerCase(),
              otherWords
            );

            // Phase 3: Determine connection strength
            const strength: 'strong' | 'moderate' | 'weak' =
              confidence > 0.7 ? 'strong' : confidence > 0.5 ? 'moderate' : 'weak';

            // Phase 3: Collect shared concepts
            const sharedConcepts = [
              ...sharedTags,
              ...commonWords.slice(0, 5).filter(w => w.length > 5),
            ];

            // Phase 3: Suggest tags based on shared topics
            const suggestedTags = generateSuggestedTags(
              fromNote,
              otherNote,
              sharedTags,
              commonWords
            );

            connections.push({
              fromNoteId: fromNote.id,
              fromNoteName: fromNote.name,
              toNoteId: otherNote.id,
              toNoteName: otherNote.name,
              reason: reasons.join(' • '),
              confidence: Math.min(confidence, 0.95),
              isBidirectional: checkIfLinked(fromNote, otherNote),
              contextSnippet,
              sharedConcepts: sharedConcepts.slice(0, 5),
              strength,
              suggestedTags: suggestedTags.slice(0, 3),
            });
          }
        }
      }

      // Sort by confidence and remove duplicates
      const uniqueConnections = connections
        .sort((a, b) => b.confidence - a.confidence)
        .filter(
          (conn, index, self) =>
            index ===
            self.findIndex(
              c =>
                (c.fromNoteId === conn.fromNoteId && c.toNoteId === conn.toNoteId) ||
                (c.fromNoteId === conn.toNoteId && c.toNoteId === conn.fromNoteId)
            )
        )
        .slice(0, 15);

      console.log('Found connections:', {
        total: connections.length,
        unique: uniqueConnections.length,
        connections: uniqueConnections,
        rawConnections: connections,
      });

      setDiscoveredConnections(uniqueConnections);

      // Show notification if no connections found
      if (uniqueConnections.length === 0) {
        console.log('No connections found above confidence threshold (0.35)');
        console.log('Try searching for topics that appear in multiple notes');
      }

      analytics.trackEvent('ai_analysis', {
        action: 'connection_discovery',
        connectionsFound: uniqueConnections.length,
      });
    } catch (error) {
      console.error('Connection analysis error:', error);
    } finally {
      setIsAnalyzingConnections(false);
    }
  };

  const checkIfLinked = (note1: Note, note2: Note): boolean => {
    const content1 = note1.content.toLowerCase();
    const content2 = note2.content.toLowerCase();
    const link1 = `[[${note2.name}]]`.toLowerCase();
    const link2 = `[[${note1.name}]]`.toLowerCase();
    return content1.includes(link1) || content2.includes(link2);
  };

  const applyConnection = async (
    connection: ConnectionSuggestion,
    bidirectional: boolean = false
  ) => {
    try {
      const fromNote = notes.find(n => n.id === connection.fromNoteId);
      if (!fromNote) return;

      // Add wikilink to the FROM note
      const wikilink = `[[${connection.toNoteName}]]`;
      const updatedContent = `${fromNote.content}\n\n${wikilink}`;

      // Update FROM note via API
      const response = await fetch(`/api/files/${fromNote.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: updatedContent,
          overwrite: true,
        }),
      });

      if (response.ok) {
        // If bidirectional, also add link in the TO note
        if (bidirectional) {
          const toNote = notes.find(n => n.id === connection.toNoteId);
          if (toNote) {
            const backlink = `[[${connection.fromNoteName}]]`;
            const toUpdatedContent = `${toNote.content}\n\n${backlink}`;

            await fetch(`/api/files/${toNote.name}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: toUpdatedContent,
                overwrite: true,
              }),
            });
          }
        }

        // Remove this connection from the list and selection
        setDiscoveredConnections(prev => prev.filter(c => c !== connection));
        setSelectedConnections(prev => {
          const next = new Set(prev);
          next.delete(connection.fromNoteId + '-' + connection.toNoteId);
          return next;
        });

        analytics.trackEvent('ai_analysis', {
          action: 'connection_applied',
          confidence: connection.confidence,
          bidirectional,
        });
      } else {
        console.error('Failed to apply connection:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error applying connection:', error);
    }
  };

  const applySelectedConnections = async () => {
    const connectionsToApply = discoveredConnections.filter(c =>
      selectedConnections.has(c.fromNoteId + '-' + c.toNoteId)
    );

    for (const connection of connectionsToApply) {
      await applyConnection(connection, showBidirectional);
    }

    // Clear selection after applying
    setSelectedConnections(new Set());
  };

  const toggleConnectionSelection = (connection: ConnectionSuggestion) => {
    const key = connection.fromNoteId + '-' + connection.toNoteId;
    setSelectedConnections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
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
${currentResults
  .slice(0, 5)
  .map(r => `- [[${r.noteName}]]`)
  .join('\n')}

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
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2
            className="font-semibold text-gray-900 dark:text-white"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Research Assistant
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={generateResearchSuggestions}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Generate Research Suggestions"
          >
            <Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div
        className="p-4 border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <div className="flex gap-2">
          <input
            id="research-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && performSemanticSearch()}
            placeholder="Research topic or question..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
            }}
          />
          <button
            onClick={performSemanticSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
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
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        {[
          { id: 'search', label: 'Results', icon: Search },
          { id: 'insights', label: 'Insights', icon: Lightbulb },
          { id: 'connections', label: 'Connect', icon: LinkIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'search' | 'insights' | 'connections')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
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
                  {currentResults.map(result => (
                    <div
                      key={result.noteId}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                      onClick={() => onOpenNote?.(result.noteId)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="font-medium text-sm"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          {result.noteName}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                              color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                            }}
                          >
                            {Math.round(result.semanticScore * 100)}%
                          </span>
                        </div>
                      </div>

                      {result.matches.slice(0, 2).map((match, matchIndex) => (
                        <div key={matchIndex} className="text-xs mb-1">
                          <span
                            className="text-gray-600 dark:text-gray-400"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            ...{match.context.substring(0, 100)}...
                          </span>
                        </div>
                      ))}

                      {result.conceptualMatches.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.conceptualMatches.slice(0, 3).map((concept, conceptIndex) => (
                            <span
                              key={conceptIndex}
                              className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            >
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
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  No Results Found
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Try different keywords or explore related topics
                </p>
                <button
                  onClick={() => createResearchNote(searchQuery)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Create Research Note
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Start Your Research
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Related Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchInsights.relatedTopics.slice(0, 8).map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => exploreRelatedTopic(topic)}
                          className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
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
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            >
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Bookmark className="w-4 h-4" />
                      Recent Research
                    </h3>
                    <div className="space-y-2">
                      {researchHistory.slice(0, 5).map(query => (
                        <button
                          key={query.id}
                          onClick={() => {
                            setSearchQuery(query.query);
                            setCurrentResults(query.results);
                            setActiveTab('search');
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div
                            className="text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            {query.query}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            {query.results.length} results •{' '}
                            {new Date(query.timestamp).toLocaleDateString()}
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
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Research Insights
                </h3>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Perform a search to see insights and suggestions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {/* Header with Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  {currentResults.length > 0
                    ? 'Discover connections between your search results'
                    : 'Perform a search first to discover connections'}
                </p>
                {currentResults.length > 0 && (
                  <button
                    onClick={analyzeConnections}
                    disabled={isAnalyzingConnections}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isAnalyzingConnections ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-3 h-3" />
                        Discover
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Phase 2: Controls Bar */}
              {discoveredConnections.length > 0 && (
                <div
                  className="p-3 rounded-lg border space-y-3"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  }}
                >
                  {/* Confidence Threshold Slider */}
                  <div>
                    <label
                      className="flex items-center justify-between text-xs font-medium mb-1"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <span>Confidence Threshold</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {Math.round(confidenceThreshold * 100)}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={confidenceThreshold * 100}
                      onChange={e => setConfidenceThreshold(Number(e.target.value) / 100)}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: '#2563eb' }}
                    />
                  </div>

                  {/* Options */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBidirectional}
                        onChange={e => setShowBidirectional(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        className="text-xs"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        Bidirectional links
                      </span>
                    </label>

                    {/* Phase 3: Context preview toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showContextPreviews}
                        onChange={e => setShowContextPreviews(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        className="text-xs"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        Show context
                      </span>
                    </label>

                    {/* Batch Apply Button */}
                    {selectedConnections.size > 0 && (
                      <button
                        onClick={applySelectedConnections}
                        className="ml-auto px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Apply {selectedConnections.size} Selected
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Discovered Connections */}
            {discoveredConnections.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="text-sm font-medium"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {discoveredConnections.filter(c => c.confidence >= confidenceThreshold).length}{' '}
                    connection
                    {discoveredConnections.filter(c => c.confidence >= confidenceThreshold)
                      .length !== 1
                      ? 's'
                      : ''}
                    {discoveredConnections.filter(c => c.confidence >= confidenceThreshold)
                      .length !== discoveredConnections.length && (
                      <span
                        className="text-xs ml-2"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        (
                        {discoveredConnections.length -
                          discoveredConnections.filter(c => c.confidence >= confidenceThreshold)
                            .length}{' '}
                        hidden by threshold)
                      </span>
                    )}
                  </div>
                  {discoveredConnections.filter(c => c.confidence >= confidenceThreshold).length >
                    1 && (
                    <button
                      onClick={() => {
                        const filtered = discoveredConnections.filter(
                          c => c.confidence >= confidenceThreshold && !c.isBidirectional
                        );
                        const allKeys = filtered.map(c => c.fromNoteId + '-' + c.toNoteId);
                        if (selectedConnections.size === allKeys.length) {
                          setSelectedConnections(new Set());
                        } else {
                          setSelectedConnections(new Set(allKeys));
                        }
                      }}
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      style={{
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {selectedConnections.size ===
                      discoveredConnections.filter(
                        c => c.confidence >= confidenceThreshold && !c.isBidirectional
                      ).length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>

                {discoveredConnections
                  .filter(c => c.confidence >= confidenceThreshold)
                  .map(connection => {
                    const isSelected = selectedConnections.has(
                      connection.fromNoteId + '-' + connection.toNoteId
                    );
                    const connectionKey = `${connection.fromNoteId}-${connection.toNoteId}`;
                    const isExpanded = expandedConnections.has(connectionKey);

                    return (
                      <div
                        key={connectionKey}
                        className="p-3 rounded-lg border transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? theme === 'dark'
                              ? '#1e3a5f'
                              : '#dbeafe'
                            : theme === 'dark'
                              ? '#374151'
                              : '#f9fafb',
                          borderColor: isSelected
                            ? theme === 'dark'
                              ? '#2563eb'
                              : '#3b82f6'
                            : theme === 'dark'
                              ? '#4b5563'
                              : '#e5e7eb',
                          borderWidth: isSelected ? '2px' : '1px',
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {/* Selection Checkbox */}
                            {!connection.isBidirectional && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleConnectionSelection(connection)}
                                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span
                                  className="font-medium text-sm"
                                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                                >
                                  {connection.fromNoteName}
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <span
                                  className="font-medium text-sm"
                                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                                >
                                  {connection.toNoteName}
                                </span>

                                {/* Phase 3: Strength indicator */}
                                {connection.strength && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded font-medium"
                                    style={{
                                      backgroundColor:
                                        connection.strength === 'strong'
                                          ? theme === 'dark'
                                            ? '#065f46'
                                            : '#d1fae5'
                                          : connection.strength === 'moderate'
                                            ? theme === 'dark'
                                              ? '#1e40af'
                                              : '#dbeafe'
                                            : theme === 'dark'
                                              ? '#78350f'
                                              : '#fef3c7',
                                      color:
                                        connection.strength === 'strong'
                                          ? theme === 'dark'
                                            ? '#6ee7b7'
                                            : '#065f46'
                                          : connection.strength === 'moderate'
                                            ? theme === 'dark'
                                              ? '#93c5fd'
                                              : '#1e40af'
                                            : theme === 'dark'
                                              ? '#fcd34d'
                                              : '#78350f',
                                    }}
                                  >
                                    {connection.strength}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {connection.isBidirectional && (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded inline-block">
                                    ↔️ Already linked
                                  </span>
                                )}

                                {/* Phase 3: Suggested tags */}
                                {connection.suggestedTags &&
                                  connection.suggestedTags.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {connection.suggestedTags.map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <span
                              className="text-xs px-2 py-1 rounded font-medium whitespace-nowrap"
                              style={{
                                backgroundColor:
                                  connection.confidence > 0.7
                                    ? theme === 'dark'
                                      ? '#065f46'
                                      : '#d1fae5'
                                    : connection.confidence > 0.6
                                      ? theme === 'dark'
                                        ? '#1e40af'
                                        : '#dbeafe'
                                      : theme === 'dark'
                                        ? '#92400e'
                                        : '#fef3c7',
                                color:
                                  connection.confidence > 0.7
                                    ? theme === 'dark'
                                      ? '#6ee7b7'
                                      : '#065f46'
                                    : connection.confidence > 0.6
                                      ? theme === 'dark'
                                        ? '#93c5fd'
                                        : '#1e40af'
                                      : theme === 'dark'
                                        ? '#fcd34d'
                                        : '#92400e',
                              }}
                            >
                              {Math.round(connection.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Reason */}
                        <p
                          className="text-xs mb-2 ml-6"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {connection.reason}
                        </p>

                        {/* Phase 3: Context Preview */}
                        {showContextPreviews && connection.contextSnippet && (
                          <div
                            className="ml-6 mb-3 p-2 rounded text-xs italic border-l-2"
                            style={{
                              backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                              borderColor: theme === 'dark' ? '#3b82f6' : '#60a5fa',
                              color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                            }}
                          >
                            "{connection.contextSnippet}"
                          </div>
                        )}

                        {/* Phase 3: Shared Concepts (expandable) */}
                        {connection.sharedConcepts && connection.sharedConcepts.length > 0 && (
                          <div className="ml-6 mb-3">
                            <button
                              onClick={() => {
                                setExpandedConnections(prev => {
                                  const next = new Set(prev);
                                  if (next.has(connectionKey)) {
                                    next.delete(connectionKey);
                                  } else {
                                    next.add(connectionKey);
                                  }
                                  return next;
                                });
                              }}
                              className="text-xs flex items-center gap-1 hover:underline"
                              style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                            >
                              {isExpanded ? '▼' : '▶'} {connection.sharedConcepts.length} shared
                              concept{connection.sharedConcepts.length !== 1 ? 's' : ''}
                            </button>
                            {isExpanded && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {connection.sharedConcepts.map((concept, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                                      color: theme === 'dark' ? '#93c5fd' : '#1e40af',
                                    }}
                                  >
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-6">
                          <button
                            onClick={() => applyConnection(connection, showBidirectional)}
                            disabled={connection.isBidirectional}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Add Link {showBidirectional && '(Both Ways)'}
                          </button>
                          <button
                            onClick={() => onOpenNote?.(connection.fromNoteId)}
                            className="px-3 py-1.5 border text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            style={{
                              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              setDiscoveredConnections(prev => prev.filter(c => c !== connection))
                            }
                            className="px-2 py-1.5 text-xs rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            style={{ color: theme === 'dark' ? '#ef4444' : '#dc2626' }}
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : isAnalyzingConnections ? (
              <div className="text-center py-8">
                <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Analyzing Connections
                </h3>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Discovering potential links between your notes...
                </p>
              </div>
            ) : currentResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  No Search Results
                </h3>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Perform a search to discover connections between your notes
                </p>
              </div>
            ) : discoveredConnections.length === 0 && !isAnalyzingConnections ? (
              <div className="text-center py-8">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  No Connections Found
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Your search results don't have strong connections yet. Try searching for different
                  topics or add more related content to your notes.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Connection Discovery
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Click "Discover" to find AI-powered connection suggestions between your notes
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
