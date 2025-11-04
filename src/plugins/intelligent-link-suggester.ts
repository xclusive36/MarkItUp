import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';
import React from 'react';
import LinkSuggestionsPanel, { LinkSuggestion } from '../components/LinkSuggestionsPanel';
import BridgeNoteSuggestionPanel from '../components/BridgeNoteSuggestionPanel';
import ConnectionMapPanel from '../components/ConnectionMapPanel';
import SuggestionHistoryPanel, {
  SuggestionHistoryEntry,
} from '../components/SuggestionHistoryPanel';

/**
 * INTELLIGENT LINK SUGGESTER PLUGIN v3.2
 *
 * AI-powered wikilink suggestions with interactive UI and advanced features.
 * Leverages the existing AI infrastructure to find connection opportunities.
 *
 * NEW in v3.2:
 * - 📜 Suggestion History & Undo: Review and undo past link decisions (Cmd+Shift+H)
 * - 📥 Export Suggestions Report: Download suggestions as markdown file
 * - ⚙️ Custom Debounce Timing: Configurable real-time delay (1-10 seconds)
 * - 📊 Enhanced Learning: Full history tracking for pattern analysis
 *
 * Features from v3.1:
 * - 🚀 Batch orphan analysis: Analyze all unconnected notes at once
 * - 💡 Link context visualization: See exactly where links would be inserted
 * - ⚡ Real-time suggestions: Optional auto-suggestions while typing (Cmd+Shift+R)
 *
 * Core Features:
 * - Interactive UI panels (no console output)
 * - Accept/reject individual suggestions
 * - Preview linked note content
 * - Intelligently inserts wikilinks inline where concepts are mentioned
 * - Suggests wikilinks to create connections
 * - Finds bidirectional link opportunities
 * - Visualizes connection strength
 * - Analyzes graph clusters and suggests bridge notes
 * - Caches analysis results for better performance
 * - Learns from user patterns
 * - Helps build a connected knowledge base
 */

let pluginInstance: IntelligentLinkSuggesterPlugin | null = null;

export const intelligentLinkSuggesterPlugin: PluginManifest = {
  id: 'ai-intelligent-link-suggester',
  name: 'Intelligent Link Suggester',
  version: '3.2.0',
  description:
    'AI-powered wikilink suggestions with history tracking, export reports, custom timing, batch orphan analysis, link context visualization, real-time suggestions, and pattern learning. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
  author: 'MarkItUp Team',
  main: 'ai-intelligent-link-suggester.js',

  permissions: [
    {
      type: 'network',
      description: 'Required to connect to AI services for content analysis',
    },
  ],

  settings: [
    {
      id: 'min-confidence',
      name: 'Minimum Confidence',
      type: 'number',
      default: 0.6,
      description:
        'Minimum confidence to suggest links (0-1). Higher values = fewer but more relevant suggestions.',
    },
    {
      id: 'max-suggestions',
      name: 'Max Link Suggestions',
      type: 'number',
      default: 10,
      description: 'Maximum number of link suggestions per note',
    },
    {
      id: 'max-links-per-paragraph',
      name: 'Max Links Per Paragraph',
      type: 'number',
      default: 2,
      description:
        'Maximum number of wikilinks to insert in a single paragraph (prevents over-linking)',
    },
    {
      id: 'auto-insert',
      name: 'Auto-Insert Links',
      type: 'boolean',
      default: false,
      description: 'Automatically insert high-confidence wikilinks inline (experimental)',
    },
    {
      id: 'show-bidirectional',
      name: 'Highlight Bidirectional Opportunities',
      type: 'boolean',
      default: true,
      description: 'Prioritize suggestions that would create bidirectional links',
    },
    {
      id: 'enable-notifications',
      name: 'Enable Notifications',
      type: 'boolean',
      default: true,
      description: 'Show notifications when link opportunities are found',
    },
    {
      id: 'enable-learning',
      name: 'Enable Pattern Learning',
      type: 'boolean',
      default: true,
      description: 'Learn from your accept/reject patterns to improve future suggestions',
    },
    {
      id: 'realtime-suggestions',
      name: 'Real-Time Suggestions (Experimental)',
      type: 'boolean',
      default: false,
      description:
        'Automatically analyze content while typing (3s debounce). Can be toggled with Cmd+Shift+R',
    },
    {
      id: 'realtime-debounce',
      name: 'Real-Time Debounce Delay (seconds)',
      type: 'number',
      default: 3,
      description: 'How long to wait after typing stops before analyzing (1-10 seconds)',
    },
  ] as PluginSetting[],

  commands: [
    {
      id: 'find-link-opportunities',
      name: 'Find Link Opportunities',
      description: 'Scan current note for potential wikilink connections',
      keybinding: 'Cmd+Shift+L',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        await pluginInstance.findLinkOpportunities();
      },
    },
    {
      id: 'toggle-realtime-suggestions',
      name: 'Toggle Real-Time Link Suggestions',
      description: 'Enable/disable automatic link suggestions while typing',
      keybinding: 'Cmd+Shift+R',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        pluginInstance.toggleRealtimeSuggestions();
      },
    },
    {
      id: 'view-suggestion-history',
      name: 'View Suggestion History',
      description: 'Review and undo past link suggestions',
      keybinding: 'Cmd+Shift+H',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        await pluginInstance.showSuggestionHistory();
      },
    },
    {
      id: 'export-suggestions',
      name: 'Export Link Suggestions Report',
      description: 'Download current suggestions as markdown report',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        await pluginInstance.exportSuggestionsReport();
      },
    },
    {
      id: 'scan-all-notes',
      name: 'Scan All Notes for Missing Links',
      description: 'Analyze all notes to find connection opportunities',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        await pluginInstance.scanAllNotes();
      },
    },
    {
      id: 'show-connection-map',
      name: 'Show Connection Strength Map',
      description: 'Visualize potential connections and their strength',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        await pluginInstance.showConnectionMap();
      },
    },
    {
      id: 'create-bridge-note',
      name: 'Suggest Bridge Note',
      description: 'AI suggests a new note to connect related clusters',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Intelligent Link Suggester: Plugin not initialized');
          return;
        }
        await pluginInstance.suggestBridgeNote();
      },
    },
  ] as Command[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Intelligent Link Suggester: PluginAPI not available');
      return;
    }

    // Check if AI is available
    if (!api.ai || !api.ai.isAvailable()) {
      console.warn(
        'Intelligent Link Suggester: AI service not available. Plugin will have limited functionality.'
      );
      api.ui.showNotification(
        'Intelligent Link Suggester requires AI to be configured. Please set up AI in settings.',
        'warning'
      );
    }

    pluginInstance = new IntelligentLinkSuggesterPlugin(api);
    console.log('Intelligent Link Suggester plugin loaded successfully');
  },

  onUnload: async () => {
    pluginInstance = null;
    console.log('Intelligent Link Suggester plugin unloaded');
  },
};

/**
 * Intelligent Link Suggester Plugin Implementation
 */
class IntelligentLinkSuggesterPlugin {
  private api: PluginAPI;
  private analysisCache: Map<
    string,
    {
      timestamp: number;
      analysis: {
        summary: string;
        keyTopics: string[];
        suggestedTags: string[];
        suggestedConnections: Array<{
          noteId: string;
          noteName: string;
          reason: string;
          confidence: number;
        }>;
        sentiment: 'positive' | 'neutral' | 'negative';
        complexity: number;
        readabilityScore: number;
      };
    }
  > = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private realtimeSuggestionsEnabled = false;
  private realtimeDebounceTimer: NodeJS.Timeout | null = null;
  private lastAnalyzedContent = '';
  private currentSuggestions: Array<{
    noteId: string;
    noteName: string;
    reason: string;
    confidence: number;
    context?: string;
  }> = [];
  private currentNoteId: string | null = null;

  constructor(api: PluginAPI) {
    this.api = api;
    this.setupRealtimeSuggestions();
  }

  /**
   * Setup real-time suggestion system (NEW FEATURE!)
   */
  private setupRealtimeSuggestions(): void {
    // Real-time suggestions are opt-in via command
    // We don't enable by default to avoid performance impact
  }

  /**
   * Toggle real-time suggestions on/off (NEW FEATURE!)
   */
  toggleRealtimeSuggestions(): void {
    this.realtimeSuggestionsEnabled = !this.realtimeSuggestionsEnabled;

    if (this.realtimeSuggestionsEnabled) {
      this.showNotification(
        '✨ Real-time link suggestions enabled! AI will analyze as you type.',
        'info'
      );
      this.startContentWatcher();
    } else {
      this.showNotification('Real-time link suggestions disabled', 'info');
      this.stopContentWatcher();
    }
  }

  /**
   * Start watching content changes for real-time suggestions
   */
  private startContentWatcher(): void {
    // Hook into the note editor's content change event
    // This is a simplified version - in production, you'd hook into the actual editor
    if (typeof window !== 'undefined') {
      (window as any).__linkSuggesterContentWatcher = this.handleContentChange.bind(this);
    }
  }

  /**
   * Stop watching content changes
   */
  private stopContentWatcher(): void {
    if (this.realtimeDebounceTimer) {
      clearTimeout(this.realtimeDebounceTimer);
      this.realtimeDebounceTimer = null;
    }

    if (typeof window !== 'undefined') {
      (window as any).__linkSuggesterContentWatcher = null;
    }
  }

  /**
   * Handle content changes with debouncing (NEW FEATURE!)
   */
  private handleContentChange(content: string): void {
    if (!this.realtimeSuggestionsEnabled) return;

    // Clear existing timer
    if (this.realtimeDebounceTimer) {
      clearTimeout(this.realtimeDebounceTimer);
    }

    // Get debounce delay from settings
    const settings = this.getSettings();
    const debounceSeconds = Number(settings['realtime-debounce']) || 3;
    const debounceMs = Math.max(1000, Math.min(10000, debounceSeconds * 1000)); // Clamp to 1-10 seconds

    // Debounce: Wait for user to stop typing
    this.realtimeDebounceTimer = setTimeout(async () => {
      // Only analyze if content has changed significantly
      if (content.length < 100) return; // Too short to analyze
      if (content === this.lastAnalyzedContent) return; // No change
      if (Math.abs(content.length - this.lastAnalyzedContent.length) < 50) return; // Minor change

      this.lastAnalyzedContent = content;

      // Show subtle notification
      this.showNotification('🔍 Analyzing for link opportunities...', 'info');

      try {
        await this.findLinkOpportunities();
      } catch (error) {
        console.error('Real-time suggestion error:', error);
      }
    }, debounceMs);
  }

  /**
   * Get suggestion history from localStorage (NEW FEATURE v3.2!)
   */
  private getSuggestionHistory(): SuggestionHistoryEntry[] {
    try {
      const data = localStorage.getItem('intelligent-link-suggester-history');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading suggestion history:', error);
    }
    return [];
  }

  /**
   * Save suggestion history to localStorage
   */
  private saveSuggestionHistory(history: SuggestionHistoryEntry[]): void {
    try {
      // Keep only last 100 entries
      const trimmed = history.slice(-100);
      localStorage.setItem('intelligent-link-suggester-history', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving suggestion history:', error);
    }
  }

  /**
   * Add entry to suggestion history
   */
  private addToHistory(
    action: 'accepted' | 'rejected',
    sourceNoteId: string,
    sourceNoteName: string,
    targetNoteId: string,
    targetNoteName: string,
    confidence: number,
    reason: string,
    insertedAt?: string
  ): void {
    const history = this.getSuggestionHistory();
    const entry: SuggestionHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      sourceNoteId,
      sourceNoteName,
      targetNoteId,
      targetNoteName,
      confidence,
      reason,
      insertedAt,
    };
    history.push(entry);
    this.saveSuggestionHistory(history);
  }

  /**
   * Show suggestion history panel (NEW FEATURE v3.2!)
   */
  async showSuggestionHistory(): Promise<void> {
    const history = this.getSuggestionHistory();

    const handleUndo = async (entry: SuggestionHistoryEntry) => {
      const note = this.api.notes.get(entry.sourceNoteId);
      if (!note) {
        this.showNotification('Source note not found', 'error');
        return;
      }

      // Remove the wikilink from the note
      const linkPattern = `[[${entry.targetNoteName}]]`;
      const updatedContent = note.content.replace(linkPattern, entry.targetNoteName);

      if (updatedContent === note.content) {
        this.showNotification('Link not found in note (may have been manually removed)', 'warning');
        return;
      }

      await this.api.notes.update(entry.sourceNoteId, { content: updatedContent });

      // Remove from history
      let currentHistory = this.getSuggestionHistory();
      currentHistory = currentHistory.filter(h => h.id !== entry.id);
      this.saveSuggestionHistory(currentHistory);

      this.showNotification(`Undid link to [[${entry.targetNoteName}]]`, 'info');
    };

    const handleClearHistory = () => {
      this.saveSuggestionHistory([]);
      this.showNotification('History cleared', 'info');
    };

    try {
      await this.api.ui.showModal(
        'Suggestion History',
        React.createElement(SuggestionHistoryPanel, {
          history,
          onUndo: handleUndo,
          onClearHistory: handleClearHistory,
          onClose: () => {},
        })
      );
    } catch (error) {
      console.error('Error showing suggestion history:', error);
      this.showNotification('Error displaying history', 'error');
    }
  }

  /**
   * Export suggestions report as markdown (NEW FEATURE v3.2!)
   */
  async exportSuggestionsReport(): Promise<void> {
    if (this.currentSuggestions.length === 0 || !this.currentNoteId) {
      this.showNotification(
        'No current suggestions to export. Run "Find Link Opportunities" first.',
        'warning'
      );
      return;
    }

    const note = this.api.notes.get(this.currentNoteId);
    if (!note) {
      this.showNotification('Current note not found', 'error');
      return;
    }

    // Generate markdown report
    const report = this.generateMarkdownReport(note.name, this.currentSuggestions);

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(report);
      this.showNotification('📋 Report copied to clipboard!', 'info');

      // Also offer to download
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `link-suggestions-${note.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification('📥 Report also downloaded as file', 'info');
    } catch (error) {
      console.error('Error exporting report:', error);
      this.showNotification('Error exporting report', 'error');
    }
  }

  /**
   * Generate markdown report from suggestions
   */
  private generateMarkdownReport(
    noteName: string,
    suggestions: Array<{
      noteId: string;
      noteName: string;
      reason: string;
      confidence: number;
      context?: string;
    }>
  ): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let report = `# Link Suggestions Report\n\n`;
    report += `**Note:** ${noteName}\n`;
    report += `**Generated:** ${date} at ${time}\n`;
    report += `**Total Suggestions:** ${suggestions.length}\n\n`;
    report += `---\n\n`;

    suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .forEach((suggestion, index) => {
        const stars = '⭐'.repeat(Math.ceil(suggestion.confidence * 5));
        const percent = (suggestion.confidence * 100).toFixed(0);

        report += `## ${index + 1}. [[${suggestion.noteName}]]\n\n`;
        report += `**Confidence:** ${stars} (${percent}%)\n\n`;
        report += `**Reason:** ${suggestion.reason}\n\n`;

        if (suggestion.context) {
          report += `**Context:**\n> ${suggestion.context}\n\n`;
        }

        report += `---\n\n`;
      });

    report += `\n*Generated by Intelligent Link Suggester v3.2*\n`;

    return report;
  }

  /**
   * Get learning data from localStorage
   */
  private getLearningData(): {
    acceptedLinks: Array<{ source: string; target: string; confidence: number; timestamp: number }>;
    rejectedLinks: Array<{ source: string; target: string; confidence: number; timestamp: number }>;
  } {
    try {
      const data = localStorage.getItem('intelligent-link-suggester-learning');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
    return { acceptedLinks: [], rejectedLinks: [] };
  }

  /**
   * Save learning data to localStorage
   */
  private saveLearningData(data: {
    acceptedLinks: Array<{ source: string; target: string; confidence: number; timestamp: number }>;
    rejectedLinks: Array<{ source: string; target: string; confidence: number; timestamp: number }>;
  }): void {
    try {
      localStorage.setItem('intelligent-link-suggester-learning', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  /**
   * Record an accepted link suggestion
   */
  private recordAcceptedLink(sourceNoteId: string, targetNoteId: string, confidence: number): void {
    const settings = this.getSettings();
    if (!settings['enable-learning']) return;

    const learningData = this.getLearningData();
    learningData.acceptedLinks.push({
      source: sourceNoteId,
      target: targetNoteId,
      confidence,
      timestamp: Date.now(),
    });

    // Keep only last 100 entries
    if (learningData.acceptedLinks.length > 100) {
      learningData.acceptedLinks = learningData.acceptedLinks.slice(-100);
    }

    this.saveLearningData(learningData);
  }

  /**
   * Record a rejected link suggestion
   */
  private recordRejectedLink(sourceNoteId: string, targetNoteId: string, confidence: number): void {
    const settings = this.getSettings();
    if (!settings['enable-learning']) return;

    const learningData = this.getLearningData();
    learningData.rejectedLinks.push({
      source: sourceNoteId,
      target: targetNoteId,
      confidence,
      timestamp: Date.now(),
    });

    // Keep only last 100 entries
    if (learningData.rejectedLinks.length > 100) {
      learningData.rejectedLinks = learningData.rejectedLinks.slice(-100);
    }

    this.saveLearningData(learningData);
  }

  /**
   * Apply learning filters to suggestions
   */
  private applyLearningFilter<T extends { noteId: string; noteName: string; confidence: number }>(
    suggestions: T[],
    sourceNoteId: string
  ): T[] {
    const settings = this.getSettings();
    if (!settings['enable-learning']) return suggestions;

    const learningData = this.getLearningData();

    // Filter out repeatedly rejected links
    return suggestions.filter(suggestion => {
      const rejectionCount = learningData.rejectedLinks.filter(
        rejected => rejected.source === sourceNoteId && rejected.target === suggestion.noteId
      ).length;

      // If rejected 3+ times, filter it out
      return rejectionCount < 3;
    });
  }

  /**
   * Get note preview content
   */
  private async getPreviewContent(noteId: string): Promise<string> {
    const note = this.api.notes.get(noteId);
    if (!note) return 'Note not found';

    // Return first 500 characters
    const preview = note.content.substring(0, 500);
    return preview + (note.content.length > 500 ? '...' : '');
  }

  /**
   * Find link opportunities in the current note
   */
  async findLinkOpportunities(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    // Check if AI is available
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification(
        'AI service is not configured. Please set up AI in settings.',
        'warning'
      );
      return;
    }

    try {
      this.showNotification('Analyzing content for link opportunities...', 'info');

      // Analyze content using AI (with caching)
      const analysis = await this.getAnalysisWithCache(note.content, note.id);

      // Get settings
      const settings = this.getSettings();
      const minConfidence = Number(settings['min-confidence']) || 0.6;
      const maxSuggestions = Number(settings['max-suggestions']) || 10;

      // Filter suggestions by confidence and exclude existing links
      const existingLinks = this.extractExistingLinks(note.content);
      const linkSuggestions = analysis.suggestedConnections
        .filter(conn => conn.confidence >= minConfidence)
        .filter(conn => !existingLinks.has(conn.noteName.toLowerCase()))
        .slice(0, maxSuggestions);

      if (linkSuggestions.length === 0) {
        this.showNotification('No link opportunities found in this note', 'info');
        return;
      }

      // Check for bidirectional opportunities
      const bidirectionalSuggestions = await this.findBidirectionalOpportunities(
        currentNoteId,
        linkSuggestions
      );

      // Show suggestions
      await this.showLinkSuggestions(note.id, linkSuggestions, bidirectionalSuggestions);
    } catch (error) {
      console.error('Intelligent Link Suggester: Error analyzing note:', error);
      this.showNotification('Failed to analyze content. Please try again.', 'error');
    }
  }

  /**
   * Find bidirectional link opportunities
   */
  private async findBidirectionalOpportunities(
    currentNoteId: string,
    suggestions: Array<{ noteId: string; noteName: string; confidence: number }>
  ): Promise<string[]> {
    const bidirectional: string[] = [];
    const settings = this.getSettings();

    if (!settings['show-bidirectional']) {
      return bidirectional;
    }

    // Check if graph API is available
    if (!this.api.graph) {
      return bidirectional;
    }

    for (const suggestion of suggestions) {
      // Check if the suggested note already links to us
      const targetLinks = this.api.graph.getLinks(suggestion.noteId);
      const hasBacklink = targetLinks.some(link => link.target === currentNoteId);

      if (hasBacklink) {
        bidirectional.push(suggestion.noteId);
      }
    }

    return bidirectional;
  }

  /**
   * Extract context around a potential link insertion point (NEW FEATURE!)
   */
  private extractLinkContext(content: string, noteName: string): string | undefined {
    const insertionPoints = this.findInsertionPoints(content, noteName);

    if (insertionPoints.length === 0) return undefined;

    const point = insertionPoints[0];
    if (!point) return undefined;

    const contextRadius = 50; // Characters before and after

    const start = Math.max(0, point.position - contextRadius);
    const end = Math.min(content.length, point.position + point.matchedText.length + contextRadius);

    let context = content.substring(start, end);

    // Highlight the matched text with markers
    const relativeMatchStart = point.position - start;
    const relativeMatchEnd = relativeMatchStart + point.matchedText.length;

    context =
      context.substring(0, relativeMatchStart) +
      '**' +
      context.substring(relativeMatchStart, relativeMatchEnd) +
      '**' +
      context.substring(relativeMatchEnd);

    // Clean up newlines for display
    context = context.replace(/\n+/g, ' ').trim();

    return context;
  }

  /**
   * Show link suggestions to the user
   */
  private async showLinkSuggestions(
    noteId: string,
    suggestions: Array<{ noteId: string; noteName: string; reason: string; confidence: number }>,
    bidirectional: string[]
  ): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    // Store for export feature
    this.currentSuggestions = suggestions;
    this.currentNoteId = noteId;

    // Apply learning filter
    const filteredSuggestions = this.applyLearningFilter(suggestions, noteId);

    if (filteredSuggestions.length === 0) {
      this.showNotification('No new link opportunities found (some filtered by learning)', 'info');
      return;
    }

    // Convert to LinkSuggestion format
    const linkSuggestions: LinkSuggestion[] = filteredSuggestions.map(s => ({
      noteId: s.noteId,
      noteName: s.noteName,
      reason: s.reason,
      confidence: s.confidence,
      isBidirectional: bidirectional.includes(s.noteId),
      context: this.extractLinkContext(note.content, s.noteName), // NEW: Add context!
    }));

    // Handle accept action
    const handleAccept = async (suggestion: LinkSuggestion) => {
      await this.insertWikilinks(noteId, [
        { noteName: suggestion.noteName, reason: suggestion.reason },
      ]);
      this.recordAcceptedLink(noteId, suggestion.noteId, suggestion.confidence);

      // Add to history (v3.2)
      this.addToHistory(
        'accepted',
        noteId,
        note.name,
        suggestion.noteId,
        suggestion.noteName,
        suggestion.confidence,
        suggestion.reason,
        suggestion.context
      );

      this.showNotification(`Added link to [[${suggestion.noteName}]]`, 'info');
    };

    // Handle reject action
    const handleReject = (suggestion: LinkSuggestion) => {
      this.recordRejectedLink(noteId, suggestion.noteId, suggestion.confidence);

      // Add to history (v3.2)
      this.addToHistory(
        'rejected',
        noteId,
        note.name,
        suggestion.noteId,
        suggestion.noteName,
        suggestion.confidence,
        suggestion.reason
      );
    };

    // Handle accept all action
    const handleAcceptAll = async () => {
      await this.insertWikilinks(
        noteId,
        filteredSuggestions.map(s => ({
          noteName: s.noteName,
          reason: s.reason,
        }))
      );

      // Record all as accepted
      filteredSuggestions.forEach(s => {
        this.recordAcceptedLink(noteId, s.noteId, s.confidence);

        // Add to history (v3.2)
        const context = this.extractLinkContext(note.content, s.noteName);
        this.addToHistory(
          'accepted',
          noteId,
          note.name,
          s.noteId,
          s.noteName,
          s.confidence,
          s.reason,
          context
        );
      });

      this.showNotification(`Added ${filteredSuggestions.length} links`, 'info');
    };

    // Show the modal with LinkSuggestionsPanel
    try {
      await this.api.ui.showModal(
        `Link Suggestions for "${note.name}"`,
        React.createElement(LinkSuggestionsPanel, {
          noteName: note.name,
          suggestions: linkSuggestions,
          onAccept: handleAccept,
          onReject: handleReject,
          onAcceptAll: handleAcceptAll,
          onClose: () => {},
          onPreview: (noteId: string) => this.getPreviewContent(noteId),
        })
      );
    } catch (error) {
      console.error('Error showing link suggestions panel:', error);
      this.showNotification('Error displaying suggestions', 'error');
    }
  }

  /**
   * Insert wikilinks into note content intelligently
   */
  private async insertWikilinks(
    noteId: string,
    suggestions: Array<{ noteName: string; reason: string }>
  ): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    let updatedContent = note.content;
    const existingLinks = this.extractExistingLinks(updatedContent);
    let insertCount = 0;

    // For each suggestion, find where the concept is mentioned and insert inline
    for (const suggestion of suggestions) {
      const noteName = suggestion.noteName;

      // Skip if link already exists
      if (existingLinks.has(noteName.toLowerCase())) {
        continue;
      }

      // Find potential insertion points
      const insertionPoints = this.findInsertionPoints(updatedContent, noteName);

      if (insertionPoints.length > 0) {
        // Insert at the first occurrence only (to avoid over-linking)
        const point = insertionPoints[0];
        if (point) {
          updatedContent = this.insertLinkAtPosition(updatedContent, point, noteName);
          insertCount++;
        }
      }
    }

    // If we couldn't insert any links inline, add a Related Notes section
    if (insertCount === 0 && suggestions.length > 0) {
      const linksSection = `\n\n## Related Notes\n${suggestions.map(s => `- [[${s.noteName}]]`).join('\n')}`;

      if (!updatedContent.includes('## Related Notes')) {
        updatedContent += linksSection;
        insertCount = suggestions.length;
      }
    }

    if (insertCount > 0) {
      await this.api.notes.update(noteId, { content: updatedContent });
    }
  }

  /**
   * Extract existing wikilinks from content
   */
  private extractExistingLinks(content: string): Set<string> {
    const links = new Set<string>();
    const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;

    while ((match = wikilinkRegex.exec(content)) !== null) {
      const matchText = match[1];
      if (!matchText) continue;

      const parts = matchText.split('|');
      const firstPart = parts[0];
      if (!firstPart) continue;

      const linkText = firstPart.trim().toLowerCase();
      links.add(linkText);
    }

    return links;
  }

  /**
   * Find potential insertion points for a wikilink
   */
  private findInsertionPoints(
    content: string,
    noteName: string
  ): Array<{
    position: number;
    matchedText: string;
    paragraph: string;
  }> {
    const points: Array<{ position: number; matchedText: string; paragraph: string }> = [];
    const paragraphs = content.split(/\n\n+/);
    let currentPosition = 0;

    // Get max links per paragraph setting
    const settings = this.getSettings();
    const maxLinksPerParagraph = Number(settings['max-links-per-paragraph']) || 2;

    // Create variations of the note name to search for
    const searchTerms = this.generateSearchTerms(noteName);

    for (const paragraph of paragraphs) {
      // Skip code blocks and headings
      if (paragraph.startsWith('```') || paragraph.startsWith('#')) {
        currentPosition += paragraph.length + 2;
        continue;
      }

      // Check if this paragraph already has links (avoid over-linking)
      const existingLinkCount = (paragraph.match(/\[\[/g) || []).length;
      if (existingLinkCount >= maxLinksPerParagraph) {
        currentPosition += paragraph.length + 2;
        continue;
      }

      // Search for mentions of the note name
      for (const term of searchTerms) {
        const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
        const match = regex.exec(paragraph);

        if (match) {
          points.push({
            position: currentPosition + match.index,
            matchedText: match[0],
            paragraph: paragraph,
          });
          break; // Only one match per paragraph
        }
      }

      currentPosition += paragraph.length + 2;
    }

    return points;
  }

  /**
   * Generate search terms from note name
   */
  private generateSearchTerms(noteName: string): string[] {
    const terms: string[] = [noteName];

    // Add lowercase version
    terms.push(noteName.toLowerCase());

    // Add capitalized version
    terms.push(noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase());

    // If multi-word, add individual words for partial matching
    if (noteName.includes(' ')) {
      const words = noteName.split(' ');
      if (words.length === 2) {
        // For two-word phrases, try both orders
        terms.push(`${words[1]} ${words[0]}`);
      }
    }

    // Remove duplicates
    return [...new Set(terms)];
  }

  /**
   * Insert a wikilink at a specific position
   */
  private insertLinkAtPosition(
    content: string,
    point: { position: number; matchedText: string },
    noteName: string
  ): string {
    const before = content.substring(0, point.position);
    const after = content.substring(point.position + point.matchedText.length);

    return `${before}[[${noteName}]]${after}`;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get analysis with caching
   */
  private async getAnalysisWithCache(
    content: string,
    noteId?: string
  ): Promise<{
    summary: string;
    keyTopics: string[];
    suggestedTags: string[];
    suggestedConnections: Array<{
      noteId: string;
      noteName: string;
      reason: string;
      confidence: number;
    }>;
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: number;
    readabilityScore: number;
  }> {
    const cacheKey = `${noteId || 'unknown'}-${this.hashContent(content)}`;
    const cached = this.analysisCache.get(cacheKey);

    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.analysis;
    }

    // Perform analysis
    if (!this.api.ai) {
      throw new Error('AI service not available');
    }

    const analysis = await this.api.ai.analyzeContent(content, noteId);

    // Cache the result
    this.analysisCache.set(cacheKey, {
      timestamp: Date.now(),
      analysis,
    });

    // Clean old cache entries
    this.cleanCache();

    return analysis;
  }

  /**
   * Simple hash function for content
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(content.length, 1000); i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.analysisCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.analysisCache.delete(key);
      }
    }
  }

  /**
   * Scan all notes for missing links
   */
  async scanAllNotes(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification(
        'AI service is not configured. Please set up AI in settings.',
        'warning'
      );
      return;
    }

    const allNotes = this.api.notes.getAll();

    const confirm = window.confirm(
      `This will analyze ${allNotes.length} notes for missing connections. This may take a while and consume AI tokens. Continue?`
    );

    if (!confirm) return;

    this.showNotification(`Starting scan of ${allNotes.length} notes...`, 'info');

    const linkOpportunities: Array<{
      noteId: string;
      noteName: string;
      suggestedLinks: number;
    }> = [];

    let processed = 0;
    const batchSize = 5; // Process in batches to show progress

    for (let i = 0; i < allNotes.length; i += batchSize) {
      const batch = allNotes.slice(i, Math.min(i + batchSize, allNotes.length));

      // Process batch
      for (const note of batch) {
        try {
          const analysis = await this.getAnalysisWithCache(note.content, note.id);
          const settings = this.getSettings();
          const minConfidence = Number(settings['min-confidence']) || 0.6;

          const existingLinks = this.extractExistingLinks(note.content);
          const suggestions = analysis.suggestedConnections.filter(
            (conn: { confidence: number; noteName: string }) =>
              conn.confidence >= minConfidence && !existingLinks.has(conn.noteName.toLowerCase())
          );

          if (suggestions.length > 0) {
            linkOpportunities.push({
              noteId: note.id,
              noteName: note.name,
              suggestedLinks: suggestions.length,
            });
          }
        } catch (error) {
          console.error(`Error scanning note ${note.id}:`, error);
        }

        processed++;
      }

      // Show progress
      const progress = Math.round((processed / allNotes.length) * 100);
      this.showNotification(`Scanning notes: ${progress}% complete`, 'info');
    }

    // Show summary
    const totalPotentialLinks = linkOpportunities.reduce((sum, opp) => sum + opp.suggestedLinks, 0);
    const topOpportunities = linkOpportunities
      .sort((a, b) => b.suggestedLinks - a.suggestedLinks)
      .slice(0, 10)
      .map((opp, i) => `${i + 1}. "${opp.noteName}" - ${opp.suggestedLinks} potential links`)
      .join('\n');

    const summaryMessage = `Scan Complete!\n\nScanned: ${allNotes.length} notes\nOpportunities: ${linkOpportunities.length} notes with missing links\nTotal potential links: ${totalPotentialLinks}\n\n${topOpportunities ? 'Top opportunities:\n' + topOpportunities : ''}`;

    alert(summaryMessage);
    this.showNotification(
      `Scan complete: ${linkOpportunities.length} notes have link opportunities`,
      'info'
    );
  }

  /**
   * Show connection strength map
   */
  async showConnectionMap(): Promise<void> {
    if (!this.api.graph) {
      this.showNotification('Graph API not available', 'warning');
      return;
    }

    const allLinks = this.api.graph.getAllLinks();
    const allNotes = this.api.notes.getAll();

    // Calculate connection metrics
    const connectionCounts: Record<string, number> = {};
    allLinks.forEach(link => {
      connectionCounts[link.source] = (connectionCounts[link.source] || 0) + 1;
      connectionCounts[link.target] = (connectionCounts[link.target] || 0) + 1;
    });

    // Find hub notes (highly connected)
    const hubNotes = allNotes
      .map(note => ({
        id: note.id,
        name: note.name,
        connections: connectionCounts[note.id] || 0,
      }))
      .filter(n => n.connections > 0)
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);

    // Find orphan notes (no connections)
    const orphanNotes = allNotes
      .filter(note => !connectionCounts[note.id])
      .map(note => ({ id: note.id, name: note.name }))
      .slice(0, 20);

    const avgConnections = allNotes.length > 0 ? (allLinks.length * 2) / allNotes.length : 0;

    // Handle finding links for orphan note
    const handleFindLinks = async (noteId: string) => {
      const note = this.api.notes.get(noteId);
      if (note) {
        // Switch to that note and run find link opportunities
        // For now, just show a notification
        this.showNotification(`Open "${note.name}" and use Cmd+Shift+L to find links`, 'info');
      }
    };

    // Handle batch orphan analysis - NEW FEATURE!
    const handleBatchAnalyzeOrphans = async () => {
      if (orphanNotes.length === 0) return;

      const confirm = window.confirm(
        `Batch analyze ${orphanNotes.length} orphan notes for link opportunities?\n\n` +
          `This will use AI to find connections for all notes with zero links. ` +
          `Estimated time: ${Math.ceil(orphanNotes.length * 2)} seconds.`
      );

      if (!confirm) return;

      this.showNotification(
        `Starting batch analysis of ${orphanNotes.length} orphan notes...`,
        'info'
      );

      let successCount = 0;
      let errorCount = 0;
      const results: Array<{ noteId: string; noteName: string; suggestionsFound: number }> = [];

      for (let i = 0; i < orphanNotes.length; i++) {
        const orphan = orphanNotes[i];
        if (!orphan) {
          errorCount++;
          continue;
        }

        const note = this.api.notes.get(orphan.id);

        if (!note) {
          errorCount++;
          continue;
        }

        try {
          // Show progress
          if (i % 5 === 0) {
            this.showNotification(
              `Analyzing orphan notes: ${i + 1}/${orphanNotes.length} (${Math.round((i / orphanNotes.length) * 100)}%)`,
              'info'
            );
          }

          // Analyze the note
          const analysis = await this.getAnalysisWithCache(note.content, note.id);
          const settings = this.getSettings();
          const minConfidence = Number(settings['min-confidence']) || 0.6;

          const existingLinks = this.extractExistingLinks(note.content);
          const suggestions = analysis.suggestedConnections.filter(
            (conn: { confidence: number; noteName: string }) =>
              conn.confidence >= minConfidence && !existingLinks.has(conn.noteName.toLowerCase())
          );

          if (suggestions.length > 0) {
            results.push({
              noteId: note.id,
              noteName: note.name,
              suggestionsFound: suggestions.length,
            });
            successCount++;
          }
        } catch (error) {
          console.error(`Error analyzing orphan note ${orphan.id}:`, error);
          errorCount++;
        }
      }

      // Show summary
      const summary =
        `Batch Analysis Complete!\n\n` +
        `✅ ${successCount} notes with link opportunities\n` +
        `❌ ${errorCount} notes with errors\n` +
        `📊 Total potential links: ${results.reduce((sum, r) => sum + r.suggestionsFound, 0)}\n\n` +
        (results.length > 0
          ? `Top opportunities:\n${results
              .sort((a, b) => b.suggestionsFound - a.suggestionsFound)
              .slice(0, 5)
              .map((r, i) => `${i + 1}. "${r.noteName}" - ${r.suggestionsFound} suggestions`)
              .join('\n')}`
          : 'No link opportunities found in orphan notes.');

      alert(summary);
      this.showNotification(
        `Batch analysis complete: ${successCount} orphans with opportunities`,
        'info'
      );
    };

    // Show the modal with ConnectionMapPanel
    try {
      await this.api.ui.showModal(
        'Knowledge Base Connection Map',
        React.createElement(ConnectionMapPanel, {
          totalNotes: allNotes.length,
          totalLinks: allLinks.length,
          averageConnections: avgConnections,
          hubNotes,
          orphanNotes,
          onFindLinksForOrphan: handleFindLinks,
          onBatchAnalyzeOrphans: handleBatchAnalyzeOrphans,
          onClose: () => {},
        })
      );
    } catch (error) {
      console.error('Error showing connection map panel:', error);
      this.showNotification('Error displaying connection map', 'error');
    }
  }

  /**
   * Suggest a bridge note to connect clusters
   */
  async suggestBridgeNote(): Promise<void> {
    if (!this.api.graph) {
      this.showNotification('Graph API not available', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is required for bridge note suggestions', 'warning');
      return;
    }

    this.showNotification('Analyzing graph for disconnected clusters...', 'info');

    try {
      const clusters = await this.identifyGraphClusters();

      if (clusters.length < 2) {
        this.showNotification(
          'Your knowledge base is well-connected! No disconnected clusters found.',
          'info'
        );
        return;
      }

      // Analyze clusters and suggest bridge note
      const bridgeSuggestion = await this.generateBridgeNoteSuggestion(clusters);

      // Handle create action
      const handleCreate = async () => {
        await this.createBridgeNote(bridgeSuggestion);
        this.showNotification(`Bridge note "${bridgeSuggestion.title}" created!`, 'info');
      };

      // Show the modal with BridgeNoteSuggestionPanel
      try {
        await this.api.ui.showModal(
          'Bridge Note Suggestion',
          React.createElement(BridgeNoteSuggestionPanel, {
            suggestion: bridgeSuggestion,
            totalClusters: clusters.length,
            onAccept: handleCreate,
            onReject: () => {},
            onClose: () => {},
          })
        );
      } catch (error) {
        console.error('Error showing bridge note panel:', error);
        this.showNotification('Error displaying bridge note suggestion', 'error');
      }
    } catch (error) {
      console.error('Error generating bridge note suggestion:', error);
      this.showNotification('Failed to generate bridge note suggestion', 'error');
    }
  }

  /**
   * Identify graph clusters using a simple connected components algorithm
   */
  private async identifyGraphClusters(): Promise<string[][]> {
    if (!this.api.graph) return [];

    const allLinks = this.api.graph.getAllLinks();
    const allNotes = this.api.notes.getAll();

    // Build adjacency list
    const adjacency: Map<string, Set<string>> = new Map();
    allNotes.forEach(note => adjacency.set(note.id, new Set()));

    allLinks.forEach(link => {
      adjacency.get(link.source)?.add(link.target);
      adjacency.get(link.target)?.add(link.source);
    });

    // Find connected components
    const visited = new Set<string>();
    const clusters: string[][] = [];

    const dfs = (nodeId: string, cluster: string[]) => {
      visited.add(nodeId);
      cluster.push(nodeId);

      const neighbors = adjacency.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, cluster);
        }
      }
    };

    for (const note of allNotes) {
      if (!visited.has(note.id)) {
        const cluster: string[] = [];
        dfs(note.id, cluster);
        if (cluster.length > 1) {
          // Only include clusters with more than one note
          clusters.push(cluster);
        }
      }
    }

    return clusters;
  }

  /**
   * Generate bridge note suggestion using AI
   */
  private async generateBridgeNoteSuggestion(clusters: string[][]): Promise<{
    title: string;
    purpose: string;
    contentOutline: string;
    suggestedTags: string[];
    suggestedLinks: string[];
    connectsClusters: string[][];
    improvementScore: number;
  }> {
    if (!this.api.ai) {
      throw new Error('AI service not available');
    }

    // Get note names for each cluster (limit to top 5 per cluster)
    const clusterNames = clusters.map(cluster =>
      cluster
        .slice(0, 5)
        .map(noteId => this.api.notes.get(noteId)?.name || 'Unknown')
        .filter(name => name !== 'Unknown')
    );

    // Get topics from notes in each cluster
    const clusterTopics = await Promise.all(
      clusters.slice(0, 3).map(async cluster => {
        const topics = new Set<string>();
        for (const noteId of cluster.slice(0, 3)) {
          const note = this.api.notes.get(noteId);
          if (note) {
            const analysis = await this.getAnalysisWithCache(note.content, note.id);
            analysis.keyTopics.forEach(topic => topics.add(topic));
          }
        }
        return Array.from(topics);
      })
    );

    const prompt = `I have a knowledge base with ${clusters.length} disconnected clusters of notes. 

Clusters:
${clusterNames.map((names, i) => `Cluster ${i + 1}: ${names.join(', ')}`).join('\n')}

Topics by cluster:
${clusterTopics.map((topics, i) => `Cluster ${i + 1} topics: ${topics.join(', ')}`).join('\n')}

Suggest a bridge note that would connect these clusters. The note should:
1. Have a title that relates to multiple clusters
2. Explain the purpose and how it connects the clusters
3. Provide a content outline
4. Suggest relevant tags
5. Suggest which notes to link to from each cluster

Respond in JSON format:
{
  "title": "Bridge Note Title",
  "purpose": "Why this note connects the clusters",
  "contentOutline": "## Introduction\\n\\n## Connection 1\\n\\n## Connection 2",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedLinks": ["Note 1", "Note 2", "Note 3"]
}`;

    try {
      const provider = (this.api.ai as any).getCurrentProvider?.() || this.api.ai;
      const response = await (provider.complete
        ? provider.complete(prompt, { model: 'gpt-4', temperature: 0.7 })
        : '{}');

      const parsed = JSON.parse(this.cleanJsonResponse(response));

      // Calculate improvement score
      const currentConnectivity = clusters.length;
      const potentialConnectivity = 1; // All clusters would be connected
      const improvementScore = Math.round(
        ((currentConnectivity - potentialConnectivity) / currentConnectivity) * 100
      );

      return {
        title: parsed.title || 'Connecting Ideas',
        purpose: parsed.purpose || 'This note connects multiple areas of your knowledge base',
        contentOutline: parsed.contentOutline || '## Overview\n\n## Connections',
        suggestedTags: parsed.suggestedTags || [],
        suggestedLinks: parsed.suggestedLinks || [],
        connectsClusters: clusterNames.slice(0, 3),
        improvementScore,
      };
    } catch (error) {
      console.error('Error generating bridge note suggestion:', error);
      return {
        title: 'Connecting Ideas',
        purpose: 'This note connects multiple areas of your knowledge base',
        contentOutline: '## Overview\n\nThis note bridges multiple topic areas.',
        suggestedTags: ['synthesis', 'connections'],
        suggestedLinks: clusterNames.flat().slice(0, 5),
        connectsClusters: clusterNames.slice(0, 3),
        improvementScore: 50,
      };
    }
  }

  /**
   * Create a bridge note
   */
  private async createBridgeNote(suggestion: {
    title: string;
    purpose: string;
    contentOutline: string;
    suggestedTags: string[];
    suggestedLinks: string[];
  }): Promise<void> {
    const content = `# ${suggestion.title}

> ${suggestion.purpose}

${suggestion.contentOutline}

## Related Notes
${suggestion.suggestedLinks.map(link => `- [[${link}]]`).join('\n')}

---
Tags: ${suggestion.suggestedTags.map(tag => `#${tag}`).join(' ')}
`;

    try {
      const newNote = await this.api.notes.create(suggestion.title, content);
      this.showNotification(`Bridge note "${suggestion.title}" created successfully!`, 'info');

      // Open the new note if possible
      if (newNote && newNote.id) {
        // Note: Opening the note would require additional API support
        console.log(`New bridge note created with ID: ${newNote.id}`);
      }
    } catch (error) {
      console.error('Error creating bridge note:', error);
      this.showNotification('Failed to create bridge note', 'error');
    }
  }

  /**
   * Clean JSON response from AI
   */
  private cleanJsonResponse(response: string): string {
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
  }

  /**
   * Get plugin settings
   */
  private getSettings(): Record<string, unknown> {
    const result = this.api.settings.get('ai-intelligent-link-suggester');
    return (result || {}) as unknown as Record<string, unknown>;
  }

  /**
   * Show notification if enabled
   */
  private showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const settings = this.getSettings();
    if (settings['enable-notifications'] !== false) {
      this.api.ui.showNotification(message, type);
    }
  }
}
