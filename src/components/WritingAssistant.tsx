"use client";

import { useState, useEffect } from 'react';
import { 
  PenTool, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  X,
  ArrowRight,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { ContentAnalysis, WritingAssistance } from '@/lib/ai/analyzers';
import { analytics } from '@/lib/analytics';

interface WritingAssistantProps {
  content: string;
  noteId?: string;
  onContentChange?: (content: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function WritingAssistant({
  content,
  noteId,
  onContentChange,
  onClose,
  isOpen
}: WritingAssistantProps) {
  const { theme } = useSimpleTheme();
  
  // State
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [assistance, setAssistance] = useState<WritingAssistance | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'suggestions' | 'improvements'>('analysis');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Auto-analyze when content changes
  useEffect(() => {
    if (isOpen && content && content.length > 100) {
      const timer = setTimeout(() => {
        analyzeContent();
      }, 2000); // Debounce analysis
      
      return () => clearTimeout(timer);
    }
  }, [content, isOpen]);

  const analyzeContent = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call analysis API
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          noteId,
          analysisType: 'full'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.analysis);
          setAssistance(data.assistance);
          
          analytics.trackEvent('ai_analysis', {
            noteId: noteId || 'unknown',
            contentLength: content.length,
            analysisType: 'writing_assistant'
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Analysis failed:', errorData);
        
        if (errorData.requiresApiKey) {
          setAnalysis({
            summary: 'API Key Required',
            keyTopics: [],
            suggestedTags: [],
            suggestedConnections: [],
            sentiment: 'neutral',
            complexity: 0,
            readabilityScore: 0,
            writingStyle: {
              tone: 'N/A',
              formality: 'mixed',
              perspective: 'mixed'
            },
            improvements: []
          });
          
          setAssistance({
            suggestions: [{
              type: 'content',
              original: '',
              suggestion: 'Configure OpenAI API Key',
              explanation: 'To use AI analysis features, you need to configure your OpenAI API key. Create a .env.local file in your project root and add: OPENAI_API_KEY=your_api_key_here',
              position: { start: 0, end: 0 }
            }],
            expandablePoints: [],
            strengthenArguments: []
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestionId: string, original: string, replacement: string) => {
    if (!onContentChange) return;
    
    const newContent = content.replace(original, replacement);
    onContentChange(newContent);
    
    setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
    
    analytics.trackEvent('ai_analysis', {
      action: 'apply_suggestion',
      suggestionType: 'writing_improvement'
    });
  };

  const insertExpandedContent = (point: string, expansion: string) => {
    if (!onContentChange) return;
    
    const expandedText = `\n\n## ${point}\n\n${expansion}\n\n`;
    const newContent = content + expandedText;
    onContentChange(newContent);
    
    analytics.trackEvent('ai_analysis', {
      action: 'expand_content',
      contentType: 'writing_expansion'
    });
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
          <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 
            className="font-semibold text-gray-900 dark:text-white"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
            Writing Assistant
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={analyzeContent}
            disabled={isAnalyzing || !content.trim()}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Analyze Content">
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Close">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        {[
          { id: 'analysis', label: 'Analysis', icon: BarChart3 },
          { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'improvements', label: 'Improve', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-2" />
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Analyzing your content...
              </p>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-8">
            <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
              Writing Analysis Ready
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Start writing or click analyze to get AI-powered insights
            </p>
            {content.length > 0 && (
              <button
                onClick={analyzeContent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Analyze Content
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                {/* Summary */}
                <div 
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                  }}>
                  <h3 
                    className="font-medium text-sm mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                    Summary
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                    {analysis.summary}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    title="Complexity"
                    value={`${analysis.complexity}/10`}
                    icon={<Target className="w-4 h-4" />}
                    theme={theme}
                  />
                  <MetricCard
                    title="Readability"
                    value={`${analysis.readabilityScore}/10`}
                    icon={<BookOpen className="w-4 h-4" />}
                    theme={theme}
                  />
                </div>

                {/* Writing Style */}
                <div 
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                  }}>
                  <h3 
                    className="font-medium text-sm mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                    Writing Style
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Tone:</span>
                      <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        {analysis.writingStyle.tone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Formality:</span>
                      <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        {analysis.writingStyle.formality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Perspective:</span>
                      <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        {analysis.writingStyle.perspective}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Topics */}
                {analysis.keyTopics.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Key Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                            color: theme === 'dark' ? '#d1d5db' : '#374151'
                          }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Tags */}
                {analysis.suggestedTags.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Suggested Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggestedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && assistance && (
              <div className="space-y-4">
                {/* Expandable Points */}
                {assistance.expandablePoints.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Lightbulb className="w-4 h-4" />
                      Expand These Ideas
                    </h3>
                    <div className="space-y-3">
                      {assistance.expandablePoints.map((point, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}>
                          <p 
                            className="text-sm font-medium mb-2"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                            {point.point}
                          </p>
                          <div className="space-y-2">
                            {point.suggestions.map((suggestion, suggestionIndex) => (
                              <div
                                key={suggestionIndex}
                                className="flex items-start gap-2 text-sm">
                                <ArrowRight className="w-3 h-3 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                <span style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                                  {suggestion}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => insertExpandedContent(point.point, point.suggestions.join('\n\n'))}
                            className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors">
                            Add to Note
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengthen Arguments */}
                {assistance.strengthenArguments.length > 0 && (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Target className="w-4 h-4" />
                      Strengthen Arguments
                    </h3>
                    <div className="space-y-3">
                      {assistance.strengthenArguments.map((arg, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}>
                          <p 
                            className="text-sm font-medium mb-2"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                            {arg.argument}
                          </p>
                          
                          {arg.supportingEvidence.length > 0 && (
                            <div className="mb-2">
                              <p 
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                Supporting Evidence:
                              </p>
                              {arg.supportingEvidence.map((evidence, evidenceIndex) => (
                                <p 
                                  key={evidenceIndex}
                                  className="text-xs ml-2"
                                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                                  • {evidence}
                                </p>
                              ))}
                            </div>
                          )}
                          
                          {arg.counterarguments.length > 0 && (
                            <div>
                              <p 
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                Consider Addressing:
                              </p>
                              {arg.counterarguments.map((counter, counterIndex) => (
                                <p 
                                  key={counterIndex}
                                  className="text-xs ml-2"
                                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                                  • {counter}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Improvements Tab */}
            {activeTab === 'improvements' && assistance && (
              <div className="space-y-4">
                {assistance.suggestions.length > 0 ? (
                  <>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Zap className="w-4 h-4" />
                      Writing Improvements
                    </h3>
                    <div className="space-y-3">
                      {assistance.suggestions.map((suggestion, index) => {
                        const suggestionId = `${index}-${suggestion.type}`;
                        const isApplied = appliedSuggestions.has(suggestionId);
                        
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              isApplied ? 'opacity-50' : ''
                            }`}
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                            }}>
                            <div className="flex items-start justify-between mb-2">
                              <span 
                                className="text-xs px-2 py-1 rounded font-medium"
                                style={{
                                  backgroundColor: getTypeColor(suggestion.type, theme).bg,
                                  color: getTypeColor(suggestion.type, theme).text
                                }}>
                                {suggestion.type}
                              </span>
                              {isApplied && (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            
                            <div className="mb-2">
                              <p 
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                Original:
                              </p>
                              <p 
                                className="text-sm p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                                {suggestion.original}
                              </p>
                            </div>
                            
                            <div className="mb-2">
                              <p 
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                Suggestion:
                              </p>
                              <p 
                                className="text-sm p-2 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                                {suggestion.suggestion}
                              </p>
                            </div>
                            
                            <p 
                              className="text-xs mb-3"
                              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                              {suggestion.explanation}
                            </p>
                            
                            {!isApplied && (
                              <button
                                onClick={() => applySuggestion(suggestionId, suggestion.original, suggestion.suggestion)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                                Apply Suggestion
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Great Writing!
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      No specific improvements suggested. Your content is well-written.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper component for metrics
function MetricCard({ 
  title, 
  value, 
  icon, 
  theme 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  theme: string; 
}) {
  return (
    <div 
      className="p-3 rounded-lg border text-center"
      style={{
        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
      }}>
      <div className="flex items-center justify-center mb-1 text-purple-600 dark:text-purple-400">
        {icon}
      </div>
      <p 
        className="text-lg font-bold"
        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
        {value}
      </p>
      <p 
        className="text-xs"
        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
        {title}
      </p>
    </div>
  );
}

// Helper function for type colors
function getTypeColor(type: string, theme: string) {
  const colors = {
    clarity: {
      bg: theme === 'dark' ? '#1e40af' : '#dbeafe',
      text: theme === 'dark' ? '#93c5fd' : '#1e40af'
    },
    style: {
      bg: theme === 'dark' ? '#7c2d12' : '#fed7aa',
      text: theme === 'dark' ? '#fdba74' : '#7c2d12'
    },
    grammar: {
      bg: theme === 'dark' ? '#7f1d1d' : '#fecaca',
      text: theme === 'dark' ? '#fca5a5' : '#7f1d1d'
    },
    structure: {
      bg: theme === 'dark' ? '#581c87' : '#e9d5ff',
      text: theme === 'dark' ? '#c4b5fd' : '#581c87'
    },
    content: {
      bg: theme === 'dark' ? '#064e3b' : '#d1fae5',
      text: theme === 'dark' ? '#86efac' : '#064e3b'
    }
  };
  
  return colors[type as keyof typeof colors] || colors.clarity;
}
