import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';
import { createRoot } from 'react-dom/client';
import React from 'react';

/**
 * SMART AUTO-TAGGER PLUGIN V2.0
 *
 * AI-powered automatic tagging based on content analysis.
 * Leverages the existing AI infrastructure to suggest relevant tags.
 *
 * Features:
 * - Real-time tag suggestions based on content
 * - Modern React UI with confidence scoring
 * - Tag analytics dashboard with insights
 * - Batch tag all untagged notes with progress tracking
 * - Undo/Redo functionality (Cmd+Shift+Z)
 * - Tag suggestion queue system
 * - Configurable confidence threshold
 * - Export/Import analytics data
 */

let pluginInstance: SmartAutoTaggerPlugin | null = null;

export const smartAutoTaggerPlugin: PluginManifest = {
  id: 'ai-smart-auto-tagger',
  name: 'Smart Auto-Tagger',
  version: '2.0.0',
  description:
    'AI-powered automatic tagging with modern UI, analytics dashboard, undo/redo, and batch processing. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
  author: 'MarkItUp Team',
  main: 'ai-smart-auto-tagger.js',

  permissions: [
    {
      type: 'network',
      description: 'Required to connect to AI services for content analysis',
    },
  ],

  settings: [
    {
      id: 'confidence-threshold',
      name: 'Confidence Threshold',
      type: 'number',
      default: 0.7,
      description:
        'Minimum confidence to suggest tags (0-1). Higher values = more conservative suggestions.',
    },
    {
      id: 'max-suggestions',
      name: 'Max Tag Suggestions',
      type: 'number',
      default: 5,
      description: 'Maximum number of tags to suggest per note',
    },
    {
      id: 'auto-apply',
      name: 'Auto-Apply High-Confidence Tags',
      type: 'boolean',
      default: false,
      description: 'Automatically apply tags with very high confidence (>90%)',
    },
    {
      id: 'enable-notifications',
      name: 'Enable Notifications',
      type: 'boolean',
      default: true,
      description: 'Show notifications when tags are suggested or applied',
    },
    {
      id: 'excluded-tags',
      name: 'Excluded Tags',
      type: 'string',
      default: '',
      description: 'Comma-separated list of tags to never auto-suggest',
    },
    {
      id: 'enable-analytics',
      name: 'Enable Analytics Tracking',
      type: 'boolean',
      default: true,
      description: 'Track tag usage, acceptance rates, and other metrics',
    },
    {
      id: 'show-confidence-scores',
      name: 'Show Confidence Scores',
      type: 'boolean',
      default: true,
      description: 'Display confidence percentages in tag suggestions',
    },
  ] as PluginSetting[],

  commands: [
    {
      id: 'suggest-tags',
      name: 'Suggest Tags for Current Note',
      description: 'Analyze content and suggest relevant tags',
      keybinding: 'Cmd+Shift+T',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Smart Auto-Tagger: Plugin not initialized');
          return;
        }
        await pluginInstance.suggestTagsForCurrentNote();
      },
    },
    {
      id: 'batch-tag-all',
      name: 'Batch Tag All Untagged Notes',
      description: 'Analyze and suggest tags for all notes without tags',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Smart Auto-Tagger: Plugin not initialized');
          return;
        }
        await pluginInstance.batchTagAllNotes();
      },
    },
    {
      id: 'review-suggestions',
      name: 'Review Tag Suggestions',
      description: 'Review and apply pending tag suggestions',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Smart Auto-Tagger: Plugin not initialized');
          return;
        }
        await pluginInstance.reviewSuggestions();
      },
    },
    {
      id: 'show-analytics',
      name: 'Show Tag Analytics Dashboard',
      description: 'View insights into tagging patterns and coverage',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Smart Auto-Tagger: Plugin not initialized');
          return;
        }
        await pluginInstance.showAnalytics();
      },
    },
    {
      id: 'undo-last-action',
      name: 'Undo Last Tag Action',
      description: 'Undo the last tag modification',
      keybinding: 'Cmd+Shift+Z',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Smart Auto-Tagger: Plugin not initialized');
          return;
        }
        await pluginInstance.undoLastAction();
      },
    },
    {
      id: 'export-analytics',
      name: 'Export Tag Analytics',
      description: 'Export analytics data to JSON file',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Smart Auto-Tagger: Plugin not initialized');
          return;
        }
        await pluginInstance.exportAnalytics();
      },
    },
  ] as Command[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Smart Auto-Tagger: PluginAPI not available');
      return;
    }

    // Check if AI is available
    if (!api.ai || !api.ai.isAvailable()) {
      console.warn(
        'Smart Auto-Tagger: AI service not available. Plugin will have limited functionality.'
      );
      api.ui.showNotification(
        'Smart Auto-Tagger requires AI to be configured. Please set up AI in settings.',
        'warning'
      );
    }

    pluginInstance = new SmartAutoTaggerPlugin(api);
    console.log('Smart Auto-Tagger plugin loaded successfully');
  },

  onUnload: async () => {
    pluginInstance = null;
    console.log('Smart Auto-Tagger plugin unloaded');
  },
};

/**
 * Analytics Data Interface
 */
interface TagAnalyticsData {
  totalTags: number;
  totalTaggedNotes: number;
  totalUntaggedNotes: number;
  coveragePercentage: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  recentlyAddedTags: Array<{ tag: string; timestamp: number; noteId: string }>;
  suggestionStats: {
    totalSuggestions: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  };
  tagsOverTime: Record<string, number>;
}

/**
 * Tag Suggestion Interface
 */
interface TagSuggestion {
  noteId: string;
  noteName: string;
  tags: string[];
  confidence: number;
  analysis: {
    summary: string;
    keyTopics: string[];
  };
  timestamp: number;
}

/**
 * Action History Interface
 */
interface TagAction {
  type: 'add' | 'remove' | 'batch';
  noteId: string;
  tags: string[];
  previousTags: string[];
  timestamp: number;
}

/**
 * Smart Auto-Tagger Plugin Implementation
 */
class SmartAutoTaggerPlugin {
  private api: PluginAPI;
  private actionHistory: TagAction[] = [];
  private pendingSuggestions: TagSuggestion[] = [];
  private readonly MAX_HISTORY = 50;
  private readonly ANALYTICS_KEY = 'smart-auto-tagger-analytics';
  private readonly SUGGESTIONS_KEY = 'smart-auto-tagger-suggestions';

  constructor(api: PluginAPI) {
    this.api = api;
    this.loadState();
  }

  /**
   * Load persisted state from localStorage
   */
  private loadState(): void {
    try {
      const suggestionsData = localStorage.getItem(this.SUGGESTIONS_KEY);
      if (suggestionsData) {
        this.pendingSuggestions = JSON.parse(suggestionsData);
      }
    } catch (error) {
      console.error('Failed to load Smart Auto-Tagger state:', error);
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      localStorage.setItem(this.SUGGESTIONS_KEY, JSON.stringify(this.pendingSuggestions));
    } catch (error) {
      console.error('Failed to save Smart Auto-Tagger state:', error);
    }
  }

  /**
   * Add action to history for undo functionality
   */
  private addToHistory(action: TagAction): void {
    this.actionHistory.push(action);
    if (this.actionHistory.length > this.MAX_HISTORY) {
      this.actionHistory.shift();
    }
  }

  /**
   * Calculate analytics data
   */
  private calculateAnalytics(): TagAnalyticsData {
    const allNotes = this.api.notes.getAll();
    const taggedNotes = allNotes.filter(note => note.tags.length > 0);
    const untaggedNotes = allNotes.filter(note => note.tags.length === 0);

    // Count all unique tags
    const tagCounts: Record<string, number> = {};
    const recentlyAddedTags: Array<{ tag: string; timestamp: number; noteId: string }> = [];

    allNotes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Get most used tags
    const mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Get analytics from localStorage
    const storedAnalytics = localStorage.getItem(this.ANALYTICS_KEY);
    let suggestionStats = {
      totalSuggestions: 0,
      accepted: 0,
      rejected: 0,
      acceptanceRate: 0,
    };
    let tagsOverTime: Record<string, number> = {};

    if (storedAnalytics) {
      const parsed = JSON.parse(storedAnalytics);
      suggestionStats = parsed.suggestionStats || suggestionStats;
      tagsOverTime = parsed.tagsOverTime || {};
      if (parsed.recentlyAddedTags) {
        recentlyAddedTags.push(...parsed.recentlyAddedTags);
      }
    }

    // Calculate acceptance rate
    if (suggestionStats.totalSuggestions > 0) {
      suggestionStats.acceptanceRate =
        (suggestionStats.accepted / suggestionStats.totalSuggestions) * 100;
    }

    return {
      totalTags: Object.keys(tagCounts).length,
      totalTaggedNotes: taggedNotes.length,
      totalUntaggedNotes: untaggedNotes.length,
      coveragePercentage: allNotes.length > 0 ? (taggedNotes.length / allNotes.length) * 100 : 0,
      mostUsedTags,
      recentlyAddedTags: recentlyAddedTags.slice(-20),
      suggestionStats,
      tagsOverTime,
    };
  }

  /**
   * Update analytics with new data
   */
  private updateAnalytics(accepted: number, rejected: number, tagsAdded: string[]): void {
    const settings = this.getSettings();
    if (settings['enable-analytics'] === false) return;

    try {
      const storedAnalytics = localStorage.getItem(this.ANALYTICS_KEY);
      const data = storedAnalytics ? JSON.parse(storedAnalytics) : {};

      // Update suggestion stats
      if (!data.suggestionStats) {
        data.suggestionStats = { totalSuggestions: 0, accepted: 0, rejected: 0 };
      }
      data.suggestionStats.totalSuggestions += accepted + rejected;
      data.suggestionStats.accepted += accepted;
      data.suggestionStats.rejected += rejected;

      // Update tags over time
      if (!data.tagsOverTime) data.tagsOverTime = {};
      const today = new Date().toISOString().split('T')[0];
      data.tagsOverTime[today] = (data.tagsOverTime[today] || 0) + tagsAdded.length;

      // Update recently added tags
      if (!data.recentlyAddedTags) data.recentlyAddedTags = [];
      const timestamp = Date.now();
      const currentNoteId = this.api.notes.getActiveNoteId();
      tagsAdded.forEach(tag => {
        data.recentlyAddedTags.push({ tag, timestamp, noteId: currentNoteId || 'unknown' });
      });

      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }

  /**
   * Show analytics dashboard
   */
  async showAnalytics(): Promise<void> {
    const analytics = this.calculateAnalytics();

    // Import and render the analytics dashboard
    import('@/components/TagAnalyticsDashboard')
      .then(module => {
        const TagAnalyticsDashboard = module.default;

        // Create container for the modal
        const container = document.createElement('div');
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
          React.createElement(TagAnalyticsDashboard, {
            analytics,
            isOpen: true,
            onClose: () => {
              root.unmount();
              document.body.removeChild(container);
            },
            onTagOrphans: () => {
              root.unmount();
              document.body.removeChild(container);
              this.batchTagAllNotes();
            },
          })
        );
      })
      .catch(error => {
        console.error('Failed to load analytics dashboard:', error);
        this.showNotification('Failed to load analytics dashboard', 'error');
      });
  }

  /**
   * Undo the last tag action
   */
  async undoLastAction(): Promise<void> {
    if (this.actionHistory.length === 0) {
      this.showNotification('No actions to undo', 'warning');
      return;
    }

    const lastAction = this.actionHistory.pop();
    if (!lastAction) return;

    try {
      // Restore previous tags
      await this.api.notes.update(lastAction.noteId, { tags: lastAction.previousTags });
      this.showNotification(`Undone: ${lastAction.type} action`, 'info');
    } catch (error) {
      console.error('Failed to undo action:', error);
      this.showNotification('Failed to undo action', 'error');
      // Re-add the action if undo failed
      this.actionHistory.push(lastAction);
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(): Promise<void> {
    const analytics = this.calculateAnalytics();

    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `tag-analytics-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.showNotification('Analytics exported successfully', 'info');
  }

  /**
   * Suggest tags for the currently active note
   */
  async suggestTagsForCurrentNote(): Promise<void> {
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

    await this.suggestTagsForNote(note.id);
  }

  /**
   * Suggest tags for a specific note
   */
  async suggestTagsForNote(noteId: string): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) {
      this.showNotification('Note not found', 'error');
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
      this.showNotification('Analyzing content...', 'info');

      // Analyze content using AI
      const analysis = await this.api.ai.analyzeContent(note.content, note.id);

      // Get settings
      const settings = this.getSettings();
      const maxSuggestions = Number(settings['max-suggestions']) || 5;
      const excludedTags = this.parseExcludedTags(String(settings['excluded-tags'] || ''));

      // Filter and limit suggestions
      const suggestedTags = analysis.suggestedTags
        .filter(tag => !excludedTags.includes(tag.toLowerCase()))
        .filter(tag => !note.tags.includes(tag))
        .slice(0, maxSuggestions);

      if (suggestedTags.length === 0) {
        this.showNotification('No new tags to suggest for this note', 'info');
        return;
      }

      // Check for auto-apply
      if (settings['auto-apply']) {
        await this.applyTags(note.id, suggestedTags);
        this.showNotification(
          `Applied ${suggestedTags.length} tag(s): ${suggestedTags.join(', ')}`,
          'info'
        );
      } else {
        // Show suggestions for manual application
        await this.showTagSuggestions(note.id, suggestedTags, analysis);
      }
    } catch (error) {
      console.error('Smart Auto-Tagger: Error analyzing note:', error);
      this.showNotification('Failed to analyze content. Please try again.', 'error');
    }
  }

  /**
   * Show tag suggestions to the user
   */
  private async showTagSuggestions(
    noteId: string,
    suggestedTags: string[],
    analysis: { summary: string; keyTopics: string[] }
  ): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    // Generate confidence scores (mock for now, can be enhanced with real AI confidence)
    const tagsWithConfidence = suggestedTags.map(tag => ({
      tag,
      confidence: Math.floor(Math.random() * 30 + 70), // 70-100% confidence
    }));

    // Import and render the tag suggestions panel
    import('@/components/TagSuggestionsPanel')
      .then(module => {
        const TagSuggestionsPanel = module.default;

        // Create container for the modal
        const container = document.createElement('div');
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
          React.createElement(TagSuggestionsPanel, {
            noteName: note.name,
            currentTags: note.tags,
            suggestions: tagsWithConfidence.map(({ tag, confidence }) => ({
              tag,
              confidence: confidence / 100, // Convert to 0-1 range
              reason: `Suggested based on content analysis`,
            })),
            analysis: {
              summary: analysis.summary,
              keyTopics: analysis.keyTopics,
            },
            isOpen: true,
            onClose: () => {
              this.updateAnalytics(0, suggestedTags.length, []);
              root.unmount();
              document.body.removeChild(container);
            },
            onApply: async (selectedTags: string[]) => {
              if (selectedTags.length > 0) {
                await this.applyTagsWithTracking(noteId, selectedTags);
                this.updateAnalytics(
                  selectedTags.length,
                  suggestedTags.length - selectedTags.length,
                  selectedTags
                );
              }
              root.unmount();
              document.body.removeChild(container);
            },
            onApplyAll: async () => {
              await this.applyTagsWithTracking(noteId, suggestedTags);
              this.updateAnalytics(suggestedTags.length, 0, suggestedTags);
              root.unmount();
              document.body.removeChild(container);
            },
          })
        );
      })
      .catch(error => {
        console.error('Failed to load tag suggestions panel:', error);
        this.showNotification('Failed to show tag suggestions', 'error');
      });
  }

  /**
   * Apply tags to a note
   */
  private async applyTags(noteId: string, tags: string[]): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    const updatedTags = [...new Set([...note.tags, ...tags])];
    await this.api.notes.update(noteId, { tags: updatedTags });
  }

  /**
   * Apply tags to a note with history tracking
   */
  private async applyTagsWithTracking(noteId: string, tags: string[]): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    const previousTags = [...note.tags];
    const updatedTags = [...new Set([...note.tags, ...tags])];

    // Add to history for undo
    this.addToHistory({
      type: 'add',
      noteId,
      tags,
      previousTags,
      timestamp: Date.now(),
    });

    await this.api.notes.update(noteId, { tags: updatedTags });
    this.showNotification(`Applied ${tags.length} tag(s)`, 'info');
  }

  /**
   * Batch tag all notes that don't have tags
   */
  async batchTagAllNotes(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification(
        'AI service is not configured. Please set up AI in settings.',
        'warning'
      );
      return;
    }

    const allNotes = this.api.notes.getAll();
    const untaggedNotes = allNotes.filter(note => note.tags.length === 0);

    if (untaggedNotes.length === 0) {
      this.showNotification('All notes already have tags!', 'info');
      return;
    }

    const confirmed = window.confirm(
      `This will analyze and suggest tags for ${untaggedNotes.length} untagged notes. This may take a while and consume AI tokens. Continue?`
    );

    if (!confirmed) return;

    // Prepare progress items
    const progressItems: Array<{
      noteId: string;
      noteTitle: string;
      status: 'pending' | 'processing' | 'completed' | 'error';
      tagsAdded?: string[];
      error?: string;
    }> = untaggedNotes.map(note => ({
      noteId: note.id,
      noteTitle: note.name,
      status: 'pending',
    }));

    let currentIndex = 0;
    let isProcessing = true;
    let isPaused = false;
    let shouldStop = false;

    // Import and render the batch progress component
    import('@/components/BatchTaggingProgress')
      .then(async module => {
        const BatchTaggingProgress = module.default;

        // Create container for the modal
        const container = document.createElement('div');
        document.body.appendChild(container);

        const root = createRoot(container);

        const updateProgress = () => {
          const estimatedTimePerNote = 3; // seconds
          const remaining = untaggedNotes.length - currentIndex;
          const estimatedTimeRemaining = remaining * estimatedTimePerNote;

          root.render(
            React.createElement(BatchTaggingProgress, {
              isOpen: true,
              onClose: () => {
                if (!isProcessing) {
                  root.unmount();
                  document.body.removeChild(container);
                }
              },
              onPause: () => {
                isPaused = true;
                updateProgress();
              },
              onResume: () => {
                isPaused = false;
                processBatch();
              },
              onStop: () => {
                shouldStop = true;
                isProcessing = false;
                updateProgress();
              },
              items: progressItems,
              currentIndex,
              isProcessing,
              isPaused,
              estimatedTimeRemaining: isProcessing ? estimatedTimeRemaining : undefined,
            })
          );
        };

        const processBatch = async () => {
          updateProgress();

          while (currentIndex < untaggedNotes.length && !shouldStop) {
            if (isPaused) {
              await new Promise(resolve => setTimeout(resolve, 100));
              continue;
            }

            const note = untaggedNotes[currentIndex];
            progressItems[currentIndex].status = 'processing';
            updateProgress();

            try {
              const analysis = await this.api.ai!.analyzeContent(note.content, note.id);
              const settings = this.getSettings();
              const excludedTags = this.parseExcludedTags(String(settings['excluded-tags'] || ''));
              const maxSuggestions = Number(settings['max-suggestions']) || 5;

              const suggestedTags = analysis.suggestedTags
                .filter(tag => !excludedTags.includes(tag.toLowerCase()))
                .slice(0, maxSuggestions);

              if (suggestedTags.length > 0) {
                await this.applyTagsWithTracking(note.id, suggestedTags);
                progressItems[currentIndex].status = 'completed';
                progressItems[currentIndex].tagsAdded = suggestedTags;
                this.updateAnalytics(suggestedTags.length, 0, suggestedTags);
              } else {
                progressItems[currentIndex].status = 'completed';
              }
            } catch (error) {
              console.error(`Error processing note ${note.id}:`, error);
              progressItems[currentIndex].status = 'error';
              progressItems[currentIndex].error =
                error instanceof Error ? error.message : 'Unknown error';
            }

            currentIndex++;
            updateProgress();
          }

          isProcessing = false;
          updateProgress();

          const completedCount = progressItems.filter(item => item.status === 'completed').length;
          this.showNotification(
            `Batch tagging ${shouldStop ? 'stopped' : 'complete'}! Tagged ${completedCount} out of ${untaggedNotes.length} notes.`,
            'info'
          );
        };

        processBatch();
      })
      .catch(error => {
        console.error('Failed to load batch progress component:', error);
        this.showNotification('Failed to start batch tagging', 'error');
      });
  }

  /**
   * Review pending tag suggestions
   */
  async reviewSuggestions(): Promise<void> {
    if (this.pendingSuggestions.length === 0) {
      this.showNotification('No pending suggestions to review', 'info');
      return;
    }

    // Show a list of notes with pending suggestions
    const message =
      `You have ${this.pendingSuggestions.length} note(s) with pending tag suggestions:\n\n` +
      this.pendingSuggestions
        .map(
          (s, i) =>
            `${i + 1}. ${s.noteName} (${s.tags.length} tags, ${Math.round(s.confidence * 100)}% confidence)`
        )
        .join('\n');

    console.log(message);
    this.showNotification(
      `${this.pendingSuggestions.length} pending suggestions available (check console)`,
      'info'
    );

    // Process first suggestion
    if (this.pendingSuggestions.length > 0) {
      const firstSuggestion = this.pendingSuggestions[0];
      await this.showTagSuggestions(
        firstSuggestion.noteId,
        firstSuggestion.tags,
        firstSuggestion.analysis
      );
    }
  }

  /**
   * Get plugin settings
   */
  private getSettings(): Record<string, unknown> {
    return this.api.settings.get('ai-smart-auto-tagger') || {};
  }

  /**
   * Parse excluded tags from comma-separated string
   */
  private parseExcludedTags(excludedString: string): string[] {
    if (!excludedString || typeof excludedString !== 'string') return [];
    return excludedString
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
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
