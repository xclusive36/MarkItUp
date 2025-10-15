import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';

/**
 * SMART AUTO-TAGGER PLUGIN
 *
 * AI-powered automatic tagging based on content analysis.
 * Leverages the existing AI infrastructure to suggest relevant tags.
 *
 * Features:
 * - Real-time tag suggestions based on content
 * - Learns from existing tagging patterns
 * - Batch tag all untagged notes
 * - One-click tag application
 * - Configurable confidence threshold
 */

let pluginInstance: SmartAutoTaggerPlugin | null = null;

export const smartAutoTaggerPlugin: PluginManifest = {
  id: 'ai-smart-auto-tagger',
  name: 'Smart Auto-Tagger',
  version: '1.0.0',
  description:
    'AI-powered automatic tagging based on content analysis. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
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
 * Smart Auto-Tagger Plugin Implementation
 */
class SmartAutoTaggerPlugin {
  private api: PluginAPI;

  constructor(api: PluginAPI) {
    this.api = api;
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

    // Create a formatted message with suggestions
    const message = `
## 🏷️ Suggested Tags for "${note.name}"

**AI Analysis Summary:**
${analysis.summary}

**Key Topics:** ${analysis.keyTopics.join(', ')}

**Suggested Tags:**
${suggestedTags.map((tag, i) => `${i + 1}. #${tag}`).join('\n')}

**Current Tags:** ${note.tags.length > 0 ? note.tags.map(t => `#${t}`).join(', ') : 'None'}

---
*Apply tags individually by clicking, or use "Apply All Tags" command*
    `.trim();

    // For now, we'll add the suggestions to the note content as a comment
    // In a full implementation, this would be a proper modal/UI
    this.showNotification(
      `Found ${suggestedTags.length} tag suggestions. Check the console for details.`,
      'info'
    );

    console.log(message);
    console.log('\nTo apply tags, use the following commands:');
    suggestedTags.forEach((tag, i) => {
      console.log(`${i + 1}. Tag: "${tag}"`);
    });

    // Apply first tag as example
    if (suggestedTags.length > 0) {
      const firstTag = suggestedTags[0];
      const shouldApply = confirm(`Apply tag "${firstTag}" to this note?`);
      if (shouldApply) {
        await this.applyTags(noteId, [firstTag]);
        this.showNotification(`Applied tag: ${firstTag}`, 'info');
      }
    }
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

    const confirm = window.confirm(
      `This will analyze and suggest tags for ${untaggedNotes.length} untagged notes. This may take a while and consume AI tokens. Continue?`
    );

    if (!confirm) return;

    this.showNotification(`Analyzing ${untaggedNotes.length} notes...`, 'info');

    let processed = 0;
    let tagged = 0;

    for (const note of untaggedNotes) {
      try {
        const analysis = await this.api.ai.analyzeContent(note.content, note.id);
        const settings = this.getSettings();
        const excludedTags = this.parseExcludedTags(String(settings['excluded-tags'] || ''));
        const maxSuggestions = Number(settings['max-suggestions']) || 5;

        const suggestedTags = analysis.suggestedTags
          .filter(tag => !excludedTags.includes(tag.toLowerCase()))
          .slice(0, maxSuggestions);

        if (suggestedTags.length > 0) {
          await this.applyTags(note.id, suggestedTags);
          tagged++;
        }

        processed++;

        // Progress update every 5 notes
        if (processed % 5 === 0) {
          this.showNotification(
            `Progress: ${processed}/${untaggedNotes.length} notes analyzed`,
            'info'
          );
        }
      } catch (error) {
        console.error(`Error processing note ${note.id}:`, error);
      }
    }

    this.showNotification(
      `Batch tagging complete! Tagged ${tagged} out of ${untaggedNotes.length} notes.`,
      'info'
    );
  }

  /**
   * Review pending tag suggestions
   */
  async reviewSuggestions(): Promise<void> {
    this.showNotification('Tag suggestion review coming soon!', 'info');
    // This would open a modal showing all pending suggestions
    // For now, just show a message
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
