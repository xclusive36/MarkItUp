'use client';

import { useState, useEffect } from 'react';
import {
  Compass,
  // Search, // Commented out: not used
  Link as LinkIcon,
  Plus,
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RefreshCw,
  X,
  // Zap, // Commented out: not used
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { KnowledgeGapAnalysis } from '@/lib/ai/analyzers';
import { Note, Tag } from '@/lib/types';
import { analytics } from '@/lib/analytics';

interface KnowledgeDiscoveryProps {
  notes: Note[];
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onCreateNote?: (title: string, content: string, tags: string[]) => void;
  onOpenNote?: (noteId: string) => void;
}

export default function KnowledgeDiscovery({
  notes,
  tags = [], // Default to empty array if tags is undefined
  isOpen,
  onClose,
  onCreateNote,
  onOpenNote,
}: KnowledgeDiscoveryProps) {
  const { theme } = useSimpleTheme();

  // State
  const [analysis, setAnalysis] = useState<KnowledgeGapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'gaps' | 'connections' | 'suggestions'>('gaps');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [suggestedNote, setSuggestedNote] = useState<{
    title: string;
    content: string;
    suggestedTags: string[];
    suggestedConnections: string[];
  } | null>(null);

  // Auto-analyze when component opens
  useEffect(() => {
    if (isOpen && notes.length > 0 && !analysis) {
      analyzeKnowledgeBase();
    }
  }, [isOpen, notes.length]);

  const analyzeWithOllama = async (settings: any) => {
    const ollamaUrl = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
    const model = settings.model || 'llama3.2';

    // Create comprehensive knowledge base summary
    const notesSummary = notes
      .slice(0, 30)
      .map(n => `- ${n.name}: ${n.content.substring(0, 200)}...`)
      .join('\n');
    const tagsSummary = tags.map(t => t.name).join(', ');

    const prompt = `You are a JSON API. Return ONLY valid JSON, no markdown, no explanations, no text before or after.

Analyze this knowledge base:

Notes:
${notesSummary}

Tags: ${tagsSummary}

Return this exact JSON structure (no markdown code blocks, no extra text):
{
  "missingTopics": ["topic1", "topic2"],
  "underExploredAreas": [{"topic": "name", "currentNoteCount": 0, "suggestedExpansion": "text"}],
  "orphanNotes": [{"noteId": "id", "title": "title", "suggestedConnections": ["topic1"]}],
  "clusteringOpportunities": [{"theme": "theme", "relatedNotes": ["note1"], "suggestedStructure": "text"}]
}

JSON only:`;

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error (${response.status})`);
    }

    const data = await response.json();

    // Extract JSON from response (handle markdown code blocks and prefixes)
    const extractJSON = (text: string) => {
      let cleaned = text.trim();

      // Remove common prefixes
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

      // Remove markdown code blocks
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
        cleaned = cleaned.replace(/\n?\s*```\s*$/, '');
      }

      // Try to find JSON object if response has extra text before/after
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      return cleaned.trim();
    };

    try {
      const jsonStr = extractJSON(data.response);
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Ollama JSON response:', parseError);
      console.error('Raw response:', data.response);
      console.error('Extracted string:', extractJSON(data.response));
      throw new Error(
        'Ollama returned invalid JSON format. Try a different model or adjust the prompt.'
      );
    }
  };

  const analyzeKnowledgeBase = async () => {
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

      // If Ollama is configured, call it directly from the client
      if (aiSettings?.provider === 'ollama') {
        const analysis = await analyzeWithOllama(aiSettings);
        setAnalysis(analysis);

        analytics.trackEvent('ai_analysis', {
          analysisType: 'knowledge_discovery',
          notesAnalyzed: notes.length,
          tagsAnalyzed: tags.length,
          provider: 'ollama',
        });

        setIsAnalyzing(false);
        return;
      }

      // Otherwise use the API route (for cloud providers)
      const response = await fetch('/api/ai/analyze-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: (notes || []).slice(0, 50), // Limit to prevent token overflow
          tags: (tags || []).slice(0, 20),
          analysisType: 'knowledge_gaps',
          settings: aiSettings, // Pass settings to server
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.analysis);

          analytics.trackEvent('ai_analysis', {
            analysisType: 'knowledge_discovery',
            notesAnalyzed: notes.length,
            tagsAnalyzed: tags.length,
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Knowledge analysis failed:', errorData);

        if (errorData.requiresApiKey) {
          // Set a helpful analysis result showing AI configuration requirement
          setAnalysis({
            missingTopics: ['AI Provider Configuration'],
            underExploredAreas: [
              {
                topic: 'AI Integration Setup',
                currentNoteCount: 0,
                suggestedExpansion:
                  'To use Knowledge Discovery features, configure your AI provider in settings. Click the Brain icon (🧠) in the header, then Settings. Options: OpenAI (API key required), Anthropic (API key required), Gemini (API key required), or Ollama (local, NO API key needed - just install and run locally).',
              },
            ],
            orphanNotes: [],
            clusteringOpportunities: [
              {
                theme: 'Setup Required',
                relatedNotes: ['Configuration Guide'],
                suggestedStructure:
                  'Configure your preferred AI provider to enable AI-powered knowledge analysis, gap detection, and note suggestions. Ollama is recommended for local use without API keys.',
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error('Knowledge analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNoteSuggestionWithOllama = async (settings: any, topic: string) => {
    const ollamaUrl = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
    const model = settings.model || 'llama3.2';

    const notesSummary = notes
      .slice(0, 10)
      .map(n => `- ${n.name}`)
      .join('\n');
    const tagsSummary = tags
      .slice(0, 10)
      .map(t => t.name)
      .join(', ');

    const prompt = `You are a JSON API. Return ONLY valid JSON, no markdown, no explanations.

Generate a comprehensive note about "${topic}".

Context - Existing notes:
${notesSummary}

Context - Existing tags: ${tagsSummary}

Return this exact JSON structure (no markdown blocks, no extra text):
{
  "title": "Note title here",
  "content": "# Title\\n\\nDetailed markdown content with multiple paragraphs and sections...",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedConnections": ["related-note-1", "related-note-2"]
}

JSON only:`;

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error (${response.status})`);
    }

    const data = await response.json();

    // Extract JSON using the same helper
    const extractJSON = (text: string) => {
      let cleaned = text.trim();

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

      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
        cleaned = cleaned.replace(/\n?\s*```\s*$/, '');
      }

      // Try to find JSON object if response has extra text before/after
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      return cleaned.trim();
    };

    try {
      const jsonStr = extractJSON(data.response);
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Ollama note suggestion:', parseError);
      console.error('Raw response:', data.response);
      throw new Error(
        'Ollama returned invalid JSON format for note suggestion. Try a different model.'
      );
    }
  };

  const generateNoteSuggestion = async (topic: string) => {
    console.log('🔵 generateNoteSuggestion called with topic:', topic);
    setSelectedTopic(topic);
    setActiveTab('suggestions'); // Switch to suggestions tab to show the result

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

      // If Ollama is configured, call it directly from the client
      if (aiSettings?.provider === 'ollama') {
        console.log('🔵 Using Ollama for note suggestion');
        const suggestion = await generateNoteSuggestionWithOllama(aiSettings, topic);
        console.log('🔵 Generated suggestion:', suggestion);
        setSuggestedNote(suggestion);

        analytics.trackEvent('ai_analysis', {
          action: 'generate_note_suggestion',
          topic: topic,
          provider: 'ollama',
        });

        return;
      }

      // Otherwise use the API route (for cloud providers)
      const requestBody = {
        topic,
        existingNotes: (notes || []).slice(0, 10),
        relatedTags: (tags || [])
          .slice(0, 10)
          .map(t => t?.name || '')
          .filter(Boolean),
        userInterests: (tags || [])
          .slice(0, 5)
          .map(t => t?.name || '')
          .filter(Boolean),
        settings: aiSettings, // Pass settings to server
      };

      const response = await fetch('/api/ai/suggest-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestedNote(data.suggestion);

          analytics.trackEvent('ai_analysis', {
            action: 'generate_note_suggestion',
            topic: topic,
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Note suggestion failed:', errorData);

        if (errorData.requiresApiKey) {
          // Set a helpful note suggestion showing AI provider configuration
          setSuggestedNote({
            title: `Getting Started: ${topic}`,
            content: `# ${topic}

## AI Provider Configuration Required

To generate AI-powered note suggestions, you need to configure an AI provider.

### Choose Your AI Provider:

#### Option 1: Ollama (Recommended - Local & Free)
**No API key required!** Runs entirely on your machine.

1. **Install Ollama**
   - Visit: https://ollama.ai
   - Download and install for your OS
   
2. **Pull a Model**
   - Open terminal and run: \`ollama pull llama3.2\`
   - Or use: \`ollama pull mistral\`

3. **Configure in MarkItUp**
   - Click the Brain icon (🧠) in the header
   - Go to Settings
   - Select "Ollama" as provider
   - Enter model name (e.g., llama3.2)

#### Option 2: Cloud AI Providers (Requires API Key)

**OpenAI:**
- Visit: https://platform.openai.com/api-keys
- Create API key and add to settings

**Anthropic, Gemini:**
- Similar process via their respective platforms

Once configured, you'll be able to generate intelligent note suggestions based on your existing knowledge base.

## Manual Note Creation

You can still create notes manually:
- Use the "New Note" form in the sidebar
- Link notes with [[Note Name]] syntax  
- Add #tags to organize your content

---
*This note was generated as a setup guide. Replace this content with your actual notes about ${topic}.*`,
            suggestedTags: ['setup', 'ai', 'getting-started'],
            suggestedConnections: [],
          });
        }
      }
    } catch (error) {
      console.error('Note suggestion error:', error);
    }
  };

  const createSuggestedNote = () => {
    if (!suggestedNote || !onCreateNote) return;

    onCreateNote(suggestedNote.title, suggestedNote.content, suggestedNote.suggestedTags);
    setSuggestedNote(null);
    setSelectedTopic('');

    analytics.trackEvent('ai_analysis', {
      action: 'create_suggested_note',
      title: suggestedNote.title,
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
          <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2
            className="font-semibold text-gray-900 dark:text-white"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Knowledge Discovery
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={analyzeKnowledgeBase}
            disabled={isAnalyzing}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh Analysis"
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
          { id: 'gaps', label: 'Gaps', icon: Target },
          { id: 'connections', label: 'Connect', icon: LinkIcon },
          { id: 'suggestions', label: 'Create', icon: Plus },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse mx-auto mb-2" />
              <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Analyzing your knowledge base...
              </p>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-8">
            <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Knowledge Explorer Ready
            </h3>
            <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Discover gaps and connections in your knowledge base
            </p>
            <button
              onClick={analyzeKnowledgeBase}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Start Analysis
            </button>
          </div>
        ) : (
          <>
            {/* Knowledge Gaps Tab */}
            {activeTab === 'gaps' && (
              <div className="space-y-4">
                {/* Missing Topics */}
                {analysis.missingTopics.length > 0 && (
                  <div>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Target className="w-4 h-4" />
                      Missing Topics
                    </h3>
                    <div className="space-y-2">
                      {analysis.missingTopics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          }}
                          onClick={() => generateNoteSuggestion(topic)}
                        >
                          <span
                            className="text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            {topic}
                          </span>
                          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Under-explored Areas */}
                {analysis.underExploredAreas.length > 0 && (
                  <div>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Under-explored Areas
                    </h3>
                    <div className="space-y-3">
                      {analysis.underExploredAreas.map((area, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-sm font-medium"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            >
                              {area.topic}
                            </span>
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                              }}
                            >
                              {area.currentNoteCount} notes
                            </span>
                          </div>
                          <p
                            className="text-xs mb-2"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            {area.suggestedExpansion}
                          </p>
                          <button
                            onClick={() => generateNoteSuggestion(area.topic)}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Expand
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clustering Opportunities */}
                {analysis.clusteringOpportunities.length > 0 && (
                  <div>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Organization Opportunities
                    </h3>
                    <div className="space-y-3">
                      {analysis.clusteringOpportunities.map((cluster, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          }}
                        >
                          <h4
                            className="text-sm font-medium mb-2"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            {cluster.theme}
                          </h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {cluster.relatedNotes.slice(0, 3).map((noteName, noteIndex) => (
                              <span
                                key={noteIndex}
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                                }}
                              >
                                {noteName}
                              </span>
                            ))}
                            {cluster.relatedNotes.length > 3 && (
                              <span
                                className="text-xs"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                              >
                                +{cluster.relatedNotes.length - 3} more
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                          >
                            {cluster.suggestedStructure}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-4">
                {analysis.orphanNotes.length > 0 ? (
                  <>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Disconnected Notes
                    </h3>
                    <div className="space-y-3">
                      {analysis.orphanNotes.map((orphan, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-sm font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                              onClick={() => onOpenNote?.(orphan.noteId)}
                            >
                              {orphan.noteName}
                            </span>
                          </div>

                          {orphan.suggestedConnections.length > 0 && (
                            <div>
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                              >
                                Suggested connections:
                              </p>
                              <div className="space-y-1">
                                {orphan.suggestedConnections.map((connection, connIndex) => (
                                  <div key={connIndex} className="flex items-center gap-2 text-xs">
                                    <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    <span
                                      style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                                    >
                                      {connection}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h3
                      className="text-lg font-medium mb-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Well Connected!
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Your notes are well-connected. No orphaned notes found.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {suggestedNote ? (
                  <div>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Lightbulb className="w-4 h-4" />
                      Suggested Note: {selectedTopic}
                    </h3>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      }}
                    >
                      <h4
                        className="text-sm font-medium mb-2"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {suggestedNote.title}
                      </h4>

                      <div
                        className="text-xs p-3 rounded mb-3 max-h-40 overflow-y-auto"
                        style={{
                          backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          color: theme === 'dark' ? '#d1d5db' : '#374151',
                        }}
                      >
                        <pre className="whitespace-pre-wrap font-mono">{suggestedNote.content}</pre>
                      </div>

                      {suggestedNote.suggestedTags.length > 0 && (
                        <div className="mb-3">
                          <p
                            className="text-xs font-medium mb-1"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            Suggested tags:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {suggestedNote.suggestedTags.map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={createSuggestedNote}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Create Note
                        </button>
                        <button
                          onClick={() => setSuggestedNote(null)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      <Plus className="w-4 h-4" />
                      Create New Notes
                    </h3>

                    <p
                      className="text-sm mb-4"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Click on any missing topic or under-explored area to generate a customized
                      note suggestion.
                    </p>

                    {analysis.missingTopics.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          Quick suggestions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingTopics.slice(0, 4).map((topic, index) => (
                            <button
                              key={index}
                              onClick={() => generateNoteSuggestion(topic)}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
