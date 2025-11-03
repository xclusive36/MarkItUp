'use client';

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
  TrendingUp,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { ContentAnalysis, WritingAssistance } from '@/lib/ai/analyzers';
import { analytics } from '@/lib/analytics';
import { optimizeContext, estimateTokens } from '@/lib/ai-context-optimizer';

interface WritingAssistantProps {
  content: string;
  noteId?: string;
  onContentChange?: (content: string) => void;
  onSave?: (contentToSave?: string) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export default function WritingAssistant({
  content,
  noteId,
  onContentChange,
  onSave,
  onClose,
  isOpen,
}: WritingAssistantProps) {
  const { theme } = useSimpleTheme();

  // State
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [assistance, setAssistance] = useState<WritingAssistance | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'suggestions' | 'improvements'>(
    'analysis'
  );
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

  const analyzeWithOllama = async (settings: any) => {
    try {
      const ollamaUrl = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
      const model = settings.model || 'llama3.2';

      // Optimize content for analysis (reduce tokens while keeping important parts)
      const optimizedContent = optimizeContext(content, {
        maxTokens: 2000, // Reasonable limit for writing analysis
        preserveHeadings: true,
        preserveLinks: false, // Not needed for writing analysis
        preserveTasks: true,
        preserveCodeBlocks: true, // Keep code for style analysis
        preserveTags: true,
      });

      console.log('[WritingAssistant] Content optimization:', {
        original: content.length,
        optimized: optimizedContent.content.length,
        tokens: optimizedContent.tokenEstimate,
        truncated: optimizedContent.truncated,
      });

      // Create prompts for analysis
      const analysisPrompt = `Analyze this content and provide a JSON response with: summary, keyTopics (array), suggestedTags (array), sentiment (positive/negative/neutral), complexity (0-10), readabilityScore (0-100), and writingStyle (tone, formality, perspective).

Content:
${optimizedContent.content}

Respond with valid JSON only.`;

      const assistancePrompt = `Analyze this content and provide writing suggestions in JSON format with: suggestions array (each with type, original text, suggestion, explanation, position), expandablePoints array (points that could be expanded), and strengthenArguments array.

Content:
${optimizedContent.content}

Respond with valid JSON only.`;

      // Call Ollama directly from browser (works for network Ollama servers)
      const analysisResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: analysisPrompt,
          stream: false,
        }),
      });

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        throw new Error(`Ollama API error (${analysisResponse.status}): ${errorText}`);
      }

      const analysisData = await analysisResponse.json();

      // Call Ollama for writing assistance
      const assistanceResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: assistancePrompt,
          stream: false,
        }),
      });

      if (!assistanceResponse.ok) {
        const errorText = await assistanceResponse.text();
        throw new Error(`Ollama API error (${assistanceResponse.status}): ${errorText}`);
      }

      const assistanceData = await assistanceResponse.json();

      // Parse the responses - strip markdown code blocks if present
      try {
        // Helper function to extract JSON from markdown code blocks
        const extractJSON = (text: string) => {
          // Remove markdown code blocks if present
          let cleaned = text.trim();

          // Handle various prefixes that Ollama might add - be very flexible!
          // Match anything like "Here is...", "Here's...", "JSON...", etc. before the actual JSON
          const prefixPatterns = [
            /^Here\s+is\s+(?:a\s+|the\s+)?JSON(?:\s+response)?(?:\s+based\s+on[^:]*)?:\s*/i,
            /^Here's\s+(?:a\s+|the\s+)?JSON(?:\s+response)?:\s*/i,
            /^JSON\s*(?:Output|Response):\s*/i,
            /^Json\s*(?:Output|Response):\s*/i,
          ];

          for (const pattern of prefixPatterns) {
            if (pattern.test(cleaned)) {
              cleaned = cleaned.replace(pattern, '').trim();
              break;
            }
          }

          // Remove markdown code blocks (```json or just ```)
          if (cleaned.startsWith('```')) {
            // Remove opening ```json or ``` (with optional newline)
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
            // Remove closing ``` (with optional newline)
            cleaned = cleaned.replace(/\n?\s*```\s*$/, '');
          }

          return cleaned.trim();
        };

        const analysisJSON = extractJSON(analysisData.response);
        const assistanceJSON = extractJSON(assistanceData.response);

        const analysis = JSON.parse(analysisJSON);
        const assistance = JSON.parse(assistanceJSON);

        setAnalysis(analysis);
        setAssistance(assistance);

        analytics.trackEvent('ai_analysis', {
          noteId: noteId || 'unknown',
          contentLength: content.length,
          analysisType: 'writing_assistant',
          provider: 'ollama',
        });
      } catch (parseError) {
        throw new Error('AI returned invalid format. Please try again.');
      }
    } catch (error) {
      console.error('Ollama analysis error:', error);

      // Show helpful error message
      setAnalysis({
        summary: 'Connection Error',
        keyTopics: [],
        suggestedTags: [],
        suggestedConnections: [],
        sentiment: 'neutral',
        complexity: 0,
        readabilityScore: 0,
        writingStyle: {
          tone: 'N/A',
          formality: 'mixed',
          perspective: 'mixed',
        },
        improvements: [],
      });

      setAssistance({
        suggestions: [
          {
            type: 'content',
            original: '',
            suggestion: 'Ollama Connection Failed',
            explanation:
              error instanceof Error
                ? `Error: ${error.message}. Check: 1) Ollama is running at the configured URL, 2) The URL in settings is correct (currently using the configured address), 3) CORS is enabled on Ollama server.`
                : 'Failed to connect to Ollama. Check settings and server availability.',
            position: { start: 0, end: 0 },
          },
        ],
        expandablePoints: [],
        strengthenArguments: [],
      });
    }
  };

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);

    try {
      // Load AI settings from localStorage
      let aiSettings = null;
      try {
        const saved = localStorage.getItem('markitup-ai-settings');
        if (saved) {
          aiSettings = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load AI settings:', e);
      }

      // For Ollama, call directly from client to avoid server-side localhost issues
      if (aiSettings?.provider === 'ollama') {
        await analyzeWithOllama(aiSettings);
        return;
      }

      // For cloud providers, use the API route
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          noteId,
          analysisType: 'full',
          settings: aiSettings, // Pass settings to server
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.analysis);
          setAssistance(data.assistance);

          analytics.trackEvent('ai_analysis', {
            noteId: noteId || 'unknown',
            contentLength: content.length,
            analysisType: 'writing_assistant',
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Analysis failed:', errorData);

        if (errorData.requiresApiKey) {
          setAnalysis({
            summary: 'AI Provider Not Configured',
            keyTopics: [],
            suggestedTags: [],
            suggestedConnections: [],
            sentiment: 'neutral',
            complexity: 0,
            readabilityScore: 0,
            writingStyle: {
              tone: 'N/A',
              formality: 'mixed',
              perspective: 'mixed',
            },
            improvements: [],
          });

          setAssistance({
            suggestions: [
              {
                type: 'content',
                original: '',
                suggestion: 'Configure AI Provider',
                explanation:
                  'To use AI Writing Assistant features, configure your AI provider in settings. Click the Brain icon (🧠) in the header, then Settings. Options: OpenAI (API key required), Anthropic (API key required), Gemini (API key required), or Ollama (local, NO API key needed - just install and run).',
                position: { start: 0, end: 0 },
              },
            ],
            expandablePoints: [],
            strengthenArguments: [],
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = async (suggestionId: string, original: string, replacement: string) => {
    if (!onContentChange) {
      console.error('[WritingAssistant] onContentChange callback is not available');
      return;
    }

    console.log('[WritingAssistant] Applying suggestion:', { original, replacement });
    console.log('[WritingAssistant] Current content length:', content.length);

    let newContent;

    // Check if we have original text to replace
    if (original && original.trim().length > 0) {
      // Normal replacement mode (for cloud providers)
      newContent = content.replace(original, replacement);

      if (newContent === content) {
        console.warn('[WritingAssistant] Content unchanged - original text not found in content');
        console.log('[WritingAssistant] Looking for:', original);
        console.log('[WritingAssistant] In content:', content.substring(0, 200) + '...');
        // Fall back to appending if not found
        newContent = content + '\n\n' + replacement;
        console.log('[WritingAssistant] Falling back to append mode');
      } else {
        console.log('[WritingAssistant] Content replaced successfully');
      }
    } else {
      // Ollama mode - no original text, so append the suggestion
      console.log('[WritingAssistant] No original text provided, appending suggestion');
      newContent = content + '\n\n' + replacement;
    }

    console.log('[WritingAssistant] New content length:', newContent.length);

    // Update state first
    onContentChange(newContent);
    setAppliedSuggestions(prev => new Set([...prev, suggestionId]));

    // Wait a tick for state to update, then save
    if (onSave) {
      console.log('[WritingAssistant] Waiting for state update before saving...');
      // Use setTimeout to ensure state updates are flushed
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[WritingAssistant] Auto-saving note with new content...');
      await onSave();
      console.log('[WritingAssistant] Note saved');
    }

    analytics.trackEvent('ai_analysis', {
      action: 'apply_suggestion',
      suggestionType: 'writing_improvement',
    });
  };

  const insertExpandedContent = async (point: string, expansion: string) => {
    if (!onContentChange) {
      console.error('[WritingAssistant] onContentChange callback is not available');
      return;
    }

    console.log('[WritingAssistant] Inserting expanded content:', { point, expansion });
    const expandedText = `\n\n## ${point}\n\n${expansion}\n\n`;
    const newContent = content + expandedText;
    console.log(
      '[WritingAssistant] New content length:',
      newContent.length,
      'Old:',
      content.length
    );

    // Update state first
    onContentChange(newContent);

    // Wait a tick for state to update, then save
    if (onSave) {
      console.log('[WritingAssistant] Waiting for state update before saving...');
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[WritingAssistant] Auto-saving note with expanded content...');
      await onSave();
      console.log('[WritingAssistant] Note saved');
    }

    analytics.trackEvent('ai_analysis', {
      action: 'expand_content',
      contentType: 'writing_expansion',
    });
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
          <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2
            className="font-semibold text-gray-900 dark:text-white"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Writing Assistant
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={analyzeContent}
            disabled={isAnalyzing || !content.trim()}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Analyze Content"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isAnalyzing ? 'animate-spin' : ''}`}
            />
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

      {/* Tabs */}
      <div
        className="flex border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        {[
          { id: 'analysis', label: 'Analysis', icon: BarChart3 },
          { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'improvements', label: 'Improve', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
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
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Analyzing your content...
              </p>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-8">
            <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Writing Analysis Ready
            </h3>
            <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Start writing or click analyze to get AI-powered insights
            </p>
            {content.length > 0 && (
              <button
                onClick={analyzeContent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
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
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  }}
                >
                  <h3
                    className="font-medium text-sm mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Summary
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                  >
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
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  }}
                >
                  <h3
                    className="font-medium text-sm mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
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
                      <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        Formality:
                      </span>
                      <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        {analysis.writingStyle.formality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        Perspective:
                      </span>
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Key Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                            color: theme === 'dark' ? '#d1d5db' : '#374151',
                          }}
                        >
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Suggested Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggestedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Lightbulb className="w-4 h-4" />
                      Expand These Ideas
                    </h3>
                    <div className="space-y-3">
                      {assistance.expandablePoints.map((point, index) => {
                        // Handle different response formats - Ollama returns different structures each time
                        // Try to extract meaningful text from whatever structure we get
                        let pointText = '';
                        let hasSuggestions = false;
                        let suggestions: string[] = [];

                        if (typeof point === 'string') {
                          // Simple string format
                          pointText = point;
                        } else if (typeof point === 'object' && point !== null) {
                          // Object format - try different common property names
                          // Priority order: title > suggestion > point > text
                          const obj = point as any;
                          pointText = obj.title || obj.suggestion || obj.point || obj.text || '';

                          // Look for explanation/description as suggestions
                          const explanationText =
                            obj.description || obj.explanation || obj.details || '';
                          if (explanationText) {
                            hasSuggestions = true;
                            suggestions = [explanationText];
                          }

                          // Also check for explicit suggestions array
                          if (
                            obj.suggestions &&
                            Array.isArray(obj.suggestions) &&
                            obj.suggestions.length > 0
                          ) {
                            hasSuggestions = true;
                            suggestions = obj.suggestions;
                          }
                        }

                        return (
                          <div
                            key={index}
                            className="p-3 rounded-lg border"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                            }}
                          >
                            <p
                              className="text-sm font-medium mb-2"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            >
                              {pointText}
                            </p>
                            {hasSuggestions && (
                              <div className="space-y-2">
                                {suggestions.map((suggestion, suggestionIndex) => (
                                  <div
                                    key={suggestionIndex}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <ArrowRight className="w-3 h-3 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                    <span
                                      style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                                    >
                                      {suggestion}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() =>
                                insertExpandedContent(
                                  pointText,
                                  hasSuggestions ? suggestions.join('\n\n') : pointText
                                )
                              }
                              className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                            >
                              Add to Note
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Strengthen Arguments */}
                {assistance.strengthenArguments.length > 0 && (
                  <div>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Target className="w-4 h-4" />
                      Strengthen Arguments
                    </h3>
                    <div className="space-y-3">
                      {assistance.strengthenArguments.map((arg, index) => {
                        // Handle different response formats
                        // String format: "Consider adding more evidence..."
                        // Ollama object format: {id, text}
                        // Cloud provider format: {argument, supportingEvidence, counterarguments}
                        let argumentText = '';
                        let supportingEvidence: string[] = [];
                        let counterarguments: string[] = [];

                        if (typeof arg === 'string') {
                          // Simple string format
                          argumentText = arg;
                        } else if (typeof arg === 'object' && arg !== null) {
                          // Object format
                          if ('text' in arg && !('argument' in arg)) {
                            // Ollama format: {id, text}
                            argumentText = arg.text || '';
                          } else if ('argument' in arg) {
                            // Cloud provider format
                            argumentText = arg.argument || '';
                            // Ensure supportingEvidence is always an array
                            const evidence = arg.supportingEvidence;
                            if (Array.isArray(evidence)) {
                              supportingEvidence = evidence;
                            } else if (typeof evidence === 'string') {
                              supportingEvidence = [evidence];
                            } else if (evidence) {
                              // If it's an object, try to extract text
                              supportingEvidence = [String(evidence)];
                            }
                            // Ensure counterarguments is always an array
                            const counter = arg.counterarguments;
                            if (Array.isArray(counter)) {
                              counterarguments = counter;
                            } else if (typeof counter === 'string') {
                              counterarguments = [counter];
                            } else if (counter) {
                              counterarguments = [String(counter)];
                            }
                          }
                        }

                        return (
                          <div
                            key={index}
                            className="p-3 rounded-lg border"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                            }}
                          >
                            <p
                              className="text-sm font-medium mb-2"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            >
                              {argumentText}
                            </p>

                            {supportingEvidence.length > 0 && (
                              <div className="mb-2">
                                <p
                                  className="text-xs font-medium mb-1"
                                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                >
                                  Supporting Evidence:
                                </p>
                                {supportingEvidence.map((evidence, evidenceIndex) => (
                                  <p
                                    key={evidenceIndex}
                                    className="text-xs ml-2"
                                    style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                                  >
                                    • {evidence}
                                  </p>
                                ))}
                              </div>
                            )}

                            {counterarguments.length > 0 && (
                              <div>
                                <p
                                  className="text-xs font-medium mb-1"
                                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                >
                                  Consider Addressing:
                                </p>
                                {counterarguments.map((counter, counterIndex) => (
                                  <p
                                    key={counterIndex}
                                    className="text-xs ml-2"
                                    style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                                  >
                                    • {counter}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Zap className="w-4 h-4" />
                      Writing Improvements
                    </h3>
                    <div className="space-y-3">
                      {assistance.suggestions.map((suggestion, index) => {
                        const suggestionId = `${index}-${suggestion.type}`;
                        const isApplied = appliedSuggestions.has(suggestionId);

                        // Handle different property names from different providers
                        const originalText =
                          (suggestion as any).original || (suggestion as any).originalText || '';
                        const suggestionText =
                          (suggestion as any).suggestion ||
                          (suggestion as any).replacementText ||
                          '';

                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${isApplied ? 'opacity-50' : ''}`}
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span
                                className="text-xs px-2 py-1 rounded font-medium"
                                style={{
                                  backgroundColor: getTypeColor(suggestion.type, theme).bg,
                                  color: getTypeColor(suggestion.type, theme).text,
                                }}
                              >
                                {suggestion.type}
                              </span>
                              {isApplied && (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>

                            {originalText && originalText.trim().length > 0 && (
                              <div className="mb-2">
                                <p
                                  className="text-xs font-medium mb-1"
                                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                >
                                  Original:
                                </p>
                                <p className="text-sm p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                                  {originalText}
                                </p>
                              </div>
                            )}

                            <div className="mb-2">
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                              >
                                Suggestion:
                              </p>
                              <p className="text-sm p-2 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                                {suggestionText}
                              </p>
                            </div>

                            <p
                              className="text-xs mb-3"
                              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                            >
                              {suggestion.explanation}
                            </p>

                            {!isApplied && (
                              <button
                                onClick={() =>
                                  applySuggestion(suggestionId, originalText, suggestionText)
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                              >
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Great Writing!
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
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
  theme,
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
        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
      }}
    >
      <div className="flex items-center justify-center mb-1 text-purple-600 dark:text-purple-400">
        {icon}
      </div>
      <p className="text-lg font-bold" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
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
      text: theme === 'dark' ? '#93c5fd' : '#1e40af',
    },
    style: {
      bg: theme === 'dark' ? '#7c2d12' : '#fed7aa',
      text: theme === 'dark' ? '#fdba74' : '#7c2d12',
    },
    grammar: {
      bg: theme === 'dark' ? '#7f1d1d' : '#fecaca',
      text: theme === 'dark' ? '#fca5a5' : '#7f1d1d',
    },
    structure: {
      bg: theme === 'dark' ? '#581c87' : '#e9d5ff',
      text: theme === 'dark' ? '#c4b5fd' : '#581c87',
    },
    content: {
      bg: theme === 'dark' ? '#064e3b' : '#d1fae5',
      text: theme === 'dark' ? '#86efac' : '#064e3b',
    },
  };

  return colors[type as keyof typeof colors] || colors.clarity;
}
