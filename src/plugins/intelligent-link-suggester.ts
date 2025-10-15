import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';

/**
 * INTELLIGENT LINK SUGGESTER PLUGIN
 *
 * AI-powered wikilink suggestions based on content analysis.
 * Leverages the existing AI infrastructure to find connection opportunities.
 *
 * Features:
 * - Scans notes for concepts mentioned in other notes
 * - Suggests wikilinks to create connections
 * - Finds bidirectional link opportunities
 * - Visualizes connection strength
 * - Helps build a connected knowledge base
 */

let pluginInstance: IntelligentLinkSuggesterPlugin | null = null;

export const intelligentLinkSuggesterPlugin: PluginManifest = {
  id: 'ai-intelligent-link-suggester',
  name: 'Intelligent Link Suggester',
  version: '1.0.0',
  description:
    'AI-powered wikilink suggestions to connect your knowledge base. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
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
      id: 'auto-insert',
      name: 'Auto-Insert Links',
      type: 'boolean',
      default: false,
      description: 'Automatically insert high-confidence wikilinks (experimental)',
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

  constructor(api: PluginAPI) {
    this.api = api;
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

      // Analyze content using AI
      const analysis = await this.api.ai.analyzeContent(note.content, note.id);

      // Get settings
      const settings = this.getSettings();
      const minConfidence = Number(settings['min-confidence']) || 0.6;
      const maxSuggestions = Number(settings['max-suggestions']) || 10;

      // Filter suggestions by confidence
      const linkSuggestions = analysis.suggestedConnections
        .filter(conn => conn.confidence >= minConfidence)
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
   * Show link suggestions to the user
   */
  private async showLinkSuggestions(
    noteId: string,
    suggestions: Array<{ noteId: string; noteName: string; reason: string; confidence: number }>,
    bidirectional: string[]
  ): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    // Create formatted message
    const message = `
## 🔗 Link Suggestions for "${note.name}"

Found ${suggestions.length} potential connection(s):

${suggestions
  .map((sugg, i) => {
    const isBidirectional = bidirectional.includes(sugg.noteId);
    const badge = isBidirectional ? '↔️ Bidirectional' : '';
    const stars = '⭐'.repeat(Math.ceil(sugg.confidence * 5));

    return `${i + 1}. **[[${sugg.noteName}]]** ${badge}
   ${stars} Confidence: ${(sugg.confidence * 100).toFixed(0)}%
   Reason: ${sugg.reason}`;
  })
  .join('\n\n')}

---
*Higher confidence = stronger connection*
${bidirectional.length > 0 ? `\n💡 ${bidirectional.length} bidirectional opportunities found!` : ''}
    `.trim();

    this.showNotification(
      `Found ${suggestions.length} link opportunities. Check console for details.`,
      'info'
    );

    console.log(message);
    console.log('\nSuggested wikilinks:');
    suggestions.forEach((sugg, i) => {
      console.log(
        `${i + 1}. [[${sugg.noteName}]] (${(sugg.confidence * 100).toFixed(0)}% confidence)`
      );
    });

    // Auto-insert if enabled and high confidence
    const settings = this.getSettings();
    if (settings['auto-insert']) {
      const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.9);
      if (highConfidenceSuggestions.length > 0) {
        await this.insertWikilinks(noteId, highConfidenceSuggestions);
        this.showNotification(
          `Auto-inserted ${highConfidenceSuggestions.length} high-confidence links`,
          'info'
        );
      }
    }
  }

  /**
   * Insert wikilinks into note content
   */
  private async insertWikilinks(
    noteId: string,
    suggestions: Array<{ noteName: string }>
  ): Promise<void> {
    const note = this.api.notes.get(noteId);
    if (!note) return;

    let updatedContent = note.content;

    // Insert wikilinks (simple implementation - just append to end)
    // In a real implementation, this would intelligently insert links where concepts are mentioned
    const linksSection = `\n\n## Related Notes\n${suggestions.map(s => `- [[${s.noteName}]]`).join('\n')}`;

    // Check if "Related Notes" section already exists
    if (!updatedContent.includes('## Related Notes')) {
      updatedContent += linksSection;
      await this.api.notes.update(noteId, { content: updatedContent });
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

    this.showNotification(`Scanning ${allNotes.length} notes...`, 'info');

    const linkOpportunities: Array<{
      noteId: string;
      noteName: string;
      suggestedLinks: number;
    }> = [];

    for (const note of allNotes) {
      try {
        const analysis = await this.api.ai.analyzeContent(note.content, note.id);
        const settings = this.getSettings();
        const minConfidence = Number(settings['min-confidence']) || 0.6;

        const suggestions = analysis.suggestedConnections.filter(
          conn => conn.confidence >= minConfidence
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
    }

    // Show summary
    const summary = `
## 📊 Link Opportunity Scan Complete

Scanned: ${allNotes.length} notes
Opportunities found: ${linkOpportunities.length} notes with missing links

Top opportunities:
${linkOpportunities
  .sort((a, b) => b.suggestedLinks - a.suggestedLinks)
  .slice(0, 10)
  .map((opp, i) => `${i + 1}. "${opp.noteName}" - ${opp.suggestedLinks} potential links`)
  .join('\n')}
    `.trim();

    console.log(summary);
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
    const orphanNotes = allNotes.filter(note => !connectionCounts[note.id]).slice(0, 10);

    const map = `
## 🗺️ Knowledge Base Connection Map

**Total Notes:** ${allNotes.length}
**Total Links:** ${allLinks.length}
**Average Connections:** ${((allLinks.length * 2) / allNotes.length).toFixed(1)} per note

### 🌟 Hub Notes (Most Connected)
${hubNotes.map((n, i) => `${i + 1}. "${n.name}" - ${n.connections} connections`).join('\n')}

### 🏝️ Orphan Notes (No Connections)
${orphanNotes.length > 0 ? orphanNotes.map((n, i) => `${i + 1}. "${n.name}"`).join('\n') : 'None! Great job connecting your notes!'}

💡 Tip: Use "Find Link Opportunities" on orphan notes to connect them to your knowledge base.
    `.trim();

    console.log(map);
    this.showNotification('Connection map generated. Check console for details.', 'info');
  }

  /**
   * Suggest a bridge note to connect clusters
   */
  async suggestBridgeNote(): Promise<void> {
    this.showNotification('Bridge note suggestions coming soon!', 'info');
    // This would analyze the graph to find disconnected clusters
    // and suggest a new note topic that would connect them
  }

  /**
   * Get plugin settings
   */
  private getSettings(): Record<string, unknown> {
    return this.api.settings.get('ai-intelligent-link-suggester') || {};
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
