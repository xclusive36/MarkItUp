'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Layers,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  // CheckCircle,
  // AlertTriangle,
  // Info,
  X,
  Target,
  FileText,
  // Tag,
  // Clock,
  // Users,
  // Search,
  Zap,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note } from '@/lib/types';
import { analytics } from '@/lib/analytics';

interface BatchAnalysisResult {
  noteId: string;
  noteName: string;
  wordCount: number;
  readingTime: number;
  complexity: 'simple' | 'moderate' | 'complex';
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  completeness: number; // 0-100%
  connections: number;
  lastModified: string;
  tags: string[];
  insights: {
    keyTerms: string[];
    suggestedImprovements: string[];
    missingConnections: string[];
    potentialTags: string[];
  };
}

interface BatchFilter {
  tags: string[];
  complexity: string[];
  sentiment: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  wordCountRange: {
    min?: number;
    max?: number;
  };
  completenessRange: {
    min?: number;
    max?: number;
  };
}

interface BatchAnalyzerProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onOpenNote?: (noteId: string) => void;
  onBulkUpdate?: (updates: Array<{ noteId: string; content: string; tags: string[] }>) => void;
}

export default function BatchAnalyzer({
  notes,
  isOpen,
  onClose,
  onOpenNote,
  // onBulkUpdate, // Not currently used
}: BatchAnalyzerProps) {
  const { theme } = useSimpleTheme();

  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<BatchAnalysisResult[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'insights' | 'filters'>(
    'overview'
  );
  const [filters] = useState<BatchFilter>({
    tags: [],
    complexity: [],
    sentiment: [],
    dateRange: {},
    wordCountRange: {},
    completenessRange: {},
  });
  const [sortBy, setSortBy] = useState<'name' | 'wordCount' | 'completeness' | 'lastModified'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Analytics summary
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalNotes: 0,
    totalWords: 0,
    averageComplexity: 0,
    averageCompleteness: 0,
    topTags: [] as Array<{ tag: string; count: number }>,
    topTopics: [] as Array<{ topic: string; count: number }>,
    sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  });

  // Initialize analysis when opened
  useEffect(() => {
    if (isOpen && notes.length > 0) {
      runBatchAnalysis();
    }
  }, [isOpen, notes]);

  const runBatchAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const results: BatchAnalysisResult[] = [];

      for (const note of notes) {
        // Basic analysis
        const wordCount = note.content.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 WPM

        // Complexity analysis based on sentence length, vocabulary
        const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength =
          sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
        const uniqueWords = new Set(note.content.toLowerCase().match(/\b\w+\b/g) || []);
        const vocabularyDiversity = uniqueWords.size / wordCount;

        let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
        if (avgSentenceLength > 20 || vocabularyDiversity > 0.7) {
          complexity = 'complex';
        } else if (avgSentenceLength > 15 || vocabularyDiversity > 0.5) {
          complexity = 'moderate';
        }

        // Extract topics (frequent meaningful words)
        const words = note.content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const stopWords = new Set([
          'that',
          'this',
          'with',
          'from',
          'they',
          'have',
          'been',
          'their',
          'said',
          'each',
          'which',
          'will',
          'would',
          'could',
          'should',
          'these',
          'those',
          'then',
          'than',
          'only',
          'also',
          'after',
          'back',
          'first',
          'well',
          'many',
          'some',
          'very',
          'when',
          'where',
          'more',
          'most',
          'much',
          'such',
        ]);
        const wordFreq: { [key: string]: number } = {};

        words.forEach(word => {
          if (!stopWords.has(word) && word.length > 3) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          }
        });

        const topics = Object.entries(wordFreq)
          .filter(([, count]) => count > 1)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([word]) => word);

        // Simple sentiment analysis
        const positiveWords = [
          'good',
          'great',
          'excellent',
          'amazing',
          'wonderful',
          'fantastic',
          'love',
          'like',
          'enjoy',
          'happy',
          'success',
          'achieve',
          'improve',
          'better',
          'best',
        ];
        const negativeWords = [
          'bad',
          'terrible',
          'awful',
          'hate',
          'dislike',
          'problem',
          'issue',
          'difficult',
          'hard',
          'fail',
          'failure',
          'wrong',
          'error',
          'mistake',
          'worse',
          'worst',
        ];

        let sentimentScore = 0;
        const noteWords = note.content.toLowerCase().split(/\s+/);
        noteWords.forEach(word => {
          if (positiveWords.includes(word)) sentimentScore++;
          if (negativeWords.includes(word)) sentimentScore--;
        });

        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (sentimentScore > 0) sentiment = 'positive';
        if (sentimentScore < 0) sentiment = 'negative';

        // Completeness based on structure, headers, content depth
        let completeness = 50; // Base score

        if (note.content.includes('#')) completeness += 15; // Has headers
        if (note.content.includes('[[')) completeness += 10; // Has wikilinks
        if (note.tags.length > 0) completeness += 10; // Has tags
        if (wordCount > 100) completeness += 10; // Substantial content
        if (wordCount > 500) completeness += 5; // Detailed content

        completeness = Math.min(100, completeness);

        // Extract key terms
        const keyTerms = Object.entries(wordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([word]) => word);

        // Generate suggestions
        const suggestedImprovements = [];
        if (wordCount < 50) suggestedImprovements.push('Add more detailed content');
        if (!note.content.includes('#'))
          suggestedImprovements.push('Add headers for better structure');
        if (note.tags.length === 0) suggestedImprovements.push('Add relevant tags');
        if (!note.content.includes('[['))
          suggestedImprovements.push('Create connections to other notes');
        if (sentences.length < 3)
          suggestedImprovements.push('Expand with more detailed explanations');

        // Suggest potential tags based on content
        const potentialTags = topics.slice(0, 3);

        const result: BatchAnalysisResult = {
          noteId: note.id,
          noteName: note.name,
          wordCount,
          readingTime,
          complexity,
          topics,
          sentiment,
          completeness,
          connections: (note.content.match(/\[\[[^\]]+\]\]/g) || []).length,
          lastModified: note.createdAt, // Fallback to createdAt
          tags: note.tags,
          insights: {
            keyTerms,
            suggestedImprovements,
            missingConnections: [],
            potentialTags,
          },
        };

        results.push(result);
      }

      setAnalysisResults(results);
      calculateAnalyticsSummary(results);

      analytics.trackEvent('ai_analysis', {
        action: 'batch_analysis_completed',
        notesAnalyzed: results.length,
        totalWords: results.reduce((sum, r) => sum + r.wordCount, 0),
      });
    } catch (error) {
      console.error('Batch analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateAnalyticsSummary = (results: BatchAnalysisResult[]) => {
    const totalNotes = results.length;
    const totalWords = results.reduce((sum, r) => sum + r.wordCount, 0);

    // Calculate average complexity
    const complexityScores = results.map(r => {
      switch (r.complexity) {
        case 'simple':
          return 1;
        case 'moderate':
          return 2;
        case 'complex':
          return 3;
        default:
          return 1;
      }
    });
    const averageComplexity = complexityScores.reduce((sum, score) => sum + score, 0) / totalNotes;

    const averageCompleteness = results.reduce((sum, r) => sum + r.completeness, 0) / totalNotes;

    // Calculate top tags
    const tagCounts: { [key: string]: number } = {};
    results.forEach(r => {
      r.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Calculate top topics
    const topicCounts: { [key: string]: number } = {};
    results.forEach(r => {
      r.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Sentiment distribution
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    results.forEach(r => {
      sentimentCounts[r.sentiment]++;
    });

    setAnalyticsSummary({
      totalNotes,
      totalWords,
      averageComplexity,
      averageCompleteness,
      topTags,
      topTopics,
      sentimentDistribution: sentimentCounts,
    });
  };

  // Filter and sort results
  const filteredResults = analysisResults
    .filter(result => {
      // Apply filters
      if (filters.tags.length > 0 && !filters.tags.some(tag => result.tags.includes(tag))) {
        return false;
      }
      if (filters.complexity.length > 0 && !filters.complexity.includes(result.complexity)) {
        return false;
      }
      if (filters.sentiment.length > 0 && !filters.sentiment.includes(result.sentiment)) {
        return false;
      }
      if (filters.wordCountRange.min && result.wordCount < filters.wordCountRange.min) {
        return false;
      }
      if (filters.wordCountRange.max && result.wordCount > filters.wordCountRange.max) {
        return false;
      }
      if (filters.completenessRange.min && result.completeness < filters.completenessRange.min) {
        return false;
      }
      if (filters.completenessRange.max && result.completeness > filters.completenessRange.max) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'wordCount':
          aVal = a.wordCount;
          bVal = b.wordCount;
          break;
        case 'completeness':
          aVal = a.completeness;
          bVal = b.completeness;
          break;
        case 'lastModified':
          aVal = new Date(a.lastModified).getTime();
          bVal = new Date(b.lastModified).getTime();
          break;
        default:
          aVal = a.noteName.toLowerCase();
          bVal = b.noteName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  const toggleNoteSelection = (noteId: string) => {
    const newSelection = new Set(selectedNotes);
    if (newSelection.has(noteId)) {
      newSelection.delete(noteId);
    } else {
      newSelection.add(noteId);
    }
    setSelectedNotes(newSelection);
  };

  const selectAll = () => {
    setSelectedNotes(new Set(filteredResults.map(r => r.noteId)));
  };

  const clearSelection = () => {
    setSelectedNotes(new Set());
  };

  const exportResults = () => {
    const data = filteredResults.map(result => ({
      'Note Name': result.noteName,
      'Word Count': result.wordCount,
      'Reading Time (min)': result.readingTime,
      Complexity: result.complexity,
      Sentiment: result.sentiment,
      'Completeness %': result.completeness,
      Connections: result.connections,
      Tags: result.tags.join(', '),
      'Key Terms': result.insights.keyTerms.join(', '),
      'Suggested Improvements': result.insights.suggestedImprovements.join('; '),
    }));

    if (data.length === 0) return;

    const firstRow = data[0];
    if (!firstRow) return;

    const csv = [
      Object.keys(firstRow).join(','),
      ...data.map(row =>
        Object.values(row)
          .map(val => `"${val}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    analytics.trackEvent('ai_analysis', {
      action: 'batch_analysis_exported',
      notesCount: filteredResults.length,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-7xl h-full max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2
              className="text-xl font-semibold text-gray-900 dark:text-white"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Batch Analyzer
            </h2>
            {!isAnalyzing && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                }}
              >
                {filteredResults.length} notes analyzed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedNotes.size > 0 && (
              <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {selectedNotes.size} selected
              </span>
            )}

            <button
              onClick={exportResults}
              disabled={isAnalyzing || filteredResults.length === 0}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export Results"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={runBatchAnalysis}
              disabled={isAnalyzing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Analysis"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isAnalyzing ? 'animate-spin' : ''}`}
              />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b border-gray-200 dark:border-gray-700"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'detailed', label: 'Detailed', icon: Layers },
            { id: 'insights', label: 'Insights', icon: Target },
            { id: 'filters', label: 'Filters', icon: Filter },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p
                  className="text-gray-600 dark:text-gray-400"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Analyzing {notes.length} notes...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                        >
                          Total Notes
                        </span>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {analyticsSummary.totalNotes}
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                        >
                          Total Words
                        </span>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {analyticsSummary.totalWords.toLocaleString()}
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                        >
                          Avg Completeness
                        </span>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {Math.round(analyticsSummary.averageCompleteness)}%
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                        >
                          Avg Complexity
                        </span>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {analyticsSummary.averageComplexity.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Charts placeholders */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <h3
                        className="font-medium mb-4"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        Top Tags
                      </h3>
                      <div className="space-y-2">
                        {analyticsSummary.topTags.slice(0, 5).map(tag => (
                          <div key={tag.tag} className="flex items-center justify-between">
                            <span
                              className="text-sm"
                              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                            >
                              {tag.tag}
                            </span>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 bg-blue-500 rounded"
                                style={{
                                  width: `${Math.max(20, (tag.count / (analyticsSummary.topTags[0]?.count || 1)) * 60)}px`,
                                }}
                              />
                              <span className="text-xs text-gray-500">{tag.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <h3
                        className="font-medium mb-4"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        Top Topics
                      </h3>
                      <div className="space-y-2">
                        {analyticsSummary.topTopics.slice(0, 5).map(topic => (
                          <div key={topic.topic} className="flex items-center justify-between">
                            <span
                              className="text-sm"
                              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                            >
                              {topic.topic}
                            </span>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 bg-green-500 rounded"
                                style={{
                                  width: `${Math.max(20, (topic.count / (analyticsSummary.topTopics[0]?.count || 1)) * 60)}px`,
                                }}
                              />
                              <span className="text-xs text-gray-500">{topic.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Tab */}
              {activeTab === 'detailed' && (
                <div className="space-y-4">
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border rounded-lg text-sm"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                          color: theme === 'dark' ? '#f9fafb' : '#111827',
                        }}
                      >
                        <option value="name">Sort by Name</option>
                        <option value="wordCount">Sort by Word Count</option>
                        <option value="completeness">Sort by Completeness</option>
                        <option value="lastModified">Sort by Last Modified</option>
                      </select>

                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                          color: theme === 'dark' ? '#f9fafb' : '#111827',
                        }}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAll}
                        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearSelection}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className="border-b"
                          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                        >
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Select
                          </th>
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Note
                          </th>
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Words
                          </th>
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Complexity
                          </th>
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Completeness
                          </th>
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Sentiment
                          </th>
                          <th
                            className="text-left p-3 text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map(result => (
                          <tr
                            key={result.noteId}
                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedNotes.has(result.noteId)}
                                onChange={() => toggleNoteSelection(result.noteId)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="p-3">
                              <div>
                                <button
                                  onClick={() => onOpenNote?.(result.noteId)}
                                  className="font-medium text-blue-600 hover:text-blue-700 text-left"
                                >
                                  {result.noteName}
                                </button>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {result.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{result.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td
                              className="p-3 text-sm"
                              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                            >
                              {result.wordCount}
                              <div className="text-xs text-gray-500">
                                {result.readingTime}m read
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  result.complexity === 'simple'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : result.complexity === 'moderate'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {result.complexity}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 bg-gray-200 dark:bg-gray-600 rounded flex-1"
                                  style={{ minWidth: '60px' }}
                                >
                                  <div
                                    className="h-2 bg-blue-500 rounded"
                                    style={{ width: `${result.completeness}%` }}
                                  />
                                </div>
                                <span
                                  className="text-xs"
                                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                                >
                                  {result.completeness}%
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  result.sentiment === 'positive'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : result.sentiment === 'negative'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {result.sentiment}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => onOpenNote?.(result.noteId)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                title="Open Note"
                              >
                                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3
                      className="text-lg font-medium mb-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Advanced Insights
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Detailed insights and recommendations coming soon
                    </p>
                  </div>
                </div>
              )}

              {/* Filters Tab */}
              {activeTab === 'filters' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3
                      className="text-lg font-medium mb-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Advanced Filters
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Sophisticated filtering options coming soon
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
