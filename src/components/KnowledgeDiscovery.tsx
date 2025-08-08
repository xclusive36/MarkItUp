"use client";

import { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
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
  Zap
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
  onOpenNote
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

  const analyzeKnowledgeBase = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/analyze-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: (notes || []).slice(0, 50), // Limit to prevent token overflow
          tags: (tags || []).slice(0, 20),
          analysisType: 'knowledge_gaps'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.analysis);
          
          analytics.trackEvent('ai_analysis', {
            analysisType: 'knowledge_discovery',
            notesAnalyzed: notes.length,
            tagsAnalyzed: tags.length
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Knowledge analysis failed:', errorData);
        
        if (errorData.requiresApiKey) {
          // Set a helpful analysis result showing API key requirement
          setAnalysis({
            missingTopics: ['OpenAI API Key Configuration'],
            underExploredAreas: [{
              topic: 'AI Integration Setup',
              currentNoteCount: 0,
              suggestedExpansion: 'To use Knowledge Discovery features, you need to configure your OpenAI API key. Create a .env.local file in your project root and add: OPENAI_API_KEY=your_api_key_here'
            }],
            orphanNotes: [],
            clusteringOpportunities: [{
              theme: 'Setup Required',
              relatedNotes: ['Configuration Guide'],
              suggestedStructure: 'Add your OpenAI API key to enable AI-powered knowledge analysis, gap detection, and note suggestions.'
            }]
          });
        }
      }
    } catch (error) {
      console.error('Knowledge analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNoteSuggestion = async (topic: string) => {
    setSelectedTopic(topic);
    
    try {
      const requestBody = {
        topic,
        existingNotes: (notes || []).slice(0, 10),
        relatedTags: (tags || []).slice(0, 10).map(t => t?.name || '').filter(Boolean),
        userInterests: (tags || []).slice(0, 5).map(t => t?.name || '').filter(Boolean)
      };

      console.log('Generating note suggestion for:', topic, requestBody);

      const response = await fetch('/api/ai/suggest-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestedNote(data.suggestion);
          
          analytics.trackEvent('ai_analysis', {
            action: 'generate_note_suggestion',
            topic: topic
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Note suggestion failed:', errorData);
        
        if (errorData.requiresApiKey) {
          // Set a helpful note suggestion showing API key requirement
          setSuggestedNote({
            title: `Getting Started: ${topic}`,
            content: `# ${topic}

## Setup Required

To generate AI-powered note suggestions, you need to configure your OpenAI API key.

### Steps to Enable AI Features:

1. **Get an OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create a new secret key

2. **Add to Your Project**
   - Create a file called \`.env.local\` in your project root
   - Add: \`OPENAI_API_KEY=your_api_key_here\`

3. **Restart the Server**
   - Stop the development server (Ctrl+C)
   - Run \`npm run dev\` again

Once configured, you'll be able to generate intelligent note suggestions based on your existing knowledge base and identify gaps in your understanding.

## Manual Note Creation

While setting up AI features, you can still create notes manually by:
- Using the "New Note" form in the sidebar
- Linking notes with [[Note Name]] syntax  
- Adding #tags to organize your content

---
*This note was generated as a setup guide. Replace this content with your actual notes about ${topic}.*`,
            suggestedTags: ['setup', 'ai', 'getting-started'],
            suggestedConnections: []
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
      title: suggestedNote.title
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
          <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 
            className="font-semibold text-gray-900 dark:text-white"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
            Knowledge Discovery
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={analyzeKnowledgeBase}
            disabled={isAnalyzing}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh Analysis">
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
          { id: 'gaps', label: 'Gaps', icon: Target },
          { id: 'connections', label: 'Connect', icon: LinkIcon },
          { id: 'suggestions', label: 'Create', icon: Plus }
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
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse mx-auto mb-2" />
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Analyzing your knowledge base...
              </p>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-8">
            <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
              Knowledge Explorer Ready
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Discover gaps and connections in your knowledge base
            </p>
            <button
              onClick={analyzeKnowledgeBase}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
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
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}
                          onClick={() => generateNoteSuggestion(topic)}>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
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
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}>
                          <div className="flex items-center justify-between mb-2">
                            <span 
                              className="text-sm font-medium"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                              {area.topic}
                            </span>
                            <span 
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                              }}>
                              {area.currentNoteCount} notes
                            </span>
                          </div>
                          <p 
                            className="text-xs mb-2"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                            {area.suggestedExpansion}
                          </p>
                          <button
                            onClick={() => generateNoteSuggestion(area.topic)}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
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
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}>
                          <h4 
                            className="text-sm font-medium mb-2"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                            {cluster.theme}
                          </h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {cluster.relatedNotes.slice(0, 3).map((noteName, noteIndex) => (
                              <span
                                key={noteIndex}
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                  color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                                }}>
                                {noteName}
                              </span>
                            ))}
                            {cluster.relatedNotes.length > 3 && (
                              <span 
                                className="text-xs"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                +{cluster.relatedNotes.length - 3} more
                              </span>
                            )}
                          </div>
                          <p 
                            className="text-xs"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
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
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                          }}>
                          <div className="flex items-center justify-between mb-2">
                            <span 
                              className="text-sm font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                              onClick={() => onOpenNote?.(orphan.noteId)}>
                              {orphan.noteName}
                            </span>
                          </div>
                          
                          {orphan.suggestedConnections.length > 0 && (
                            <div>
                              <p 
                                className="text-xs font-medium mb-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                Suggested connections:
                              </p>
                              <div className="space-y-1">
                                {orphan.suggestedConnections.map((connection, connIndex) => (
                                  <div 
                                    key={connIndex}
                                    className="flex items-center gap-2 text-xs">
                                    <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    <span style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Well Connected!
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
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
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Lightbulb className="w-4 h-4" />
                      Suggested Note: {selectedTopic}
                    </h3>
                    
                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                      }}>
                      <h4 
                        className="text-sm font-medium mb-2"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                        {suggestedNote.title}
                      </h4>
                      
                      <div 
                        className="text-xs p-3 rounded mb-3 max-h-40 overflow-y-auto"
                        style={{
                          backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}>
                        <pre className="whitespace-pre-wrap font-mono">
                          {suggestedNote.content}
                        </pre>
                      </div>
                      
                      {suggestedNote.suggestedTags.length > 0 && (
                        <div className="mb-3">
                          <p 
                            className="text-xs font-medium mb-1"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            Suggested tags:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {suggestedNote.suggestedTags.map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={createSuggestedNote}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                          Create Note
                        </button>
                        <button
                          onClick={() => setSuggestedNote(null)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 
                      className="font-medium text-sm mb-3 flex items-center gap-2"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      <Plus className="w-4 h-4" />
                      Create New Notes
                    </h3>
                    
                    <p 
                      className="text-sm mb-4"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Click on any missing topic or under-explored area to generate a customized note suggestion.
                    </p>
                    
                    {analysis.missingTopics.length > 0 && (
                      <div>
                        <p 
                          className="text-xs font-medium mb-2"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                          Quick suggestions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingTopics.slice(0, 4).map((topic, index) => (
                            <button
                              key={index}
                              onClick={() => generateNoteSuggestion(topic)}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
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
