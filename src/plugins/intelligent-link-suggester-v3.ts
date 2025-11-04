import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';

/**
 * INTELLIGENT LINK SUGGESTER PLUGIN v3.0
 *
 * AI-powered wikilink suggestions with interactive UI.
 * Leverages the existing AI infrastructure to find connection opportunities.
 *
 * Features:
 * - Interactive UI panels (no console output)
 * - Accept/reject individual suggestions
 * - Preview linked note content
 * - Intelligently inserts wikilinks inline where concepts are mentioned
 * - Suggests wikilinks to create connections
 * - Finds bidirectional link opportunities
 * - Visualizes connection strength with interactive dashboard
 * - Analyzes graph clusters and suggests bridge notes
 * - Caches analysis results for better performance
 * - Learns from user patterns to improve suggestions
 * - Helps build a connected knowledge base
 */

let pluginInstance: IntelligentLinkSuggesterPlugin | null = null;

export const intelligentLinkSuggesterPlugin: PluginManifest = {
  id: 'ai-intelligent-link-suggester',
  name: 'Intelligent Link Suggester',
  version: '3.0.0',
  description:
    'AI-powered wikilink suggestions with interactive UI, accept/reject controls, link previews, and learning capabilities. Requires AI configuration.',
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
      name: 'Auto-Insert High-Confidence Links',
      type: 'boolean',
      default: false,
      description: 'Automatically insert links with >90% confidence',
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
      description: 'Show notifications for operations',
    },
    {
      id: 'enable-learning',
      name: 'Enable Pattern Learning',
      type: 'boolean',
      default: true,
      description: 'Learn from your accept/reject patterns to improve future suggestions',
    },
  ] as PluginSetting[],

  commands: [
    {
      id: 'find-link-opportunities',
      name: 'Find Link Opportunities',
      description: 'Scan current note for potential wikilink connections',
      keybinding: 'Cmd+Shift+L',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) return;
        await pluginInstance.findLinkOpportunities();
      },
    },
    {
      id: 'scan-all-notes',
      name: 'Scan All Notes for Missing Links',
      description: 'Analyze all notes to find connection opportunities',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) return;
        await pluginInstance.scanAllNotes();
      },
    },
    {
      id: 'show-connection-map',
      name: 'Show Connection Strength Map',
      description: 'Visualize potential connections and their strength',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) return;
        await pluginInstance.showConnectionMap();
      },
    },
    {
      id: 'create-bridge-note',
      name: 'Suggest Bridge Note',
      description: 'AI suggests a new note to connect related clusters',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) return;
        await pluginInstance.suggestBridgeNote();
      },
    },
  ] as Command[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) return;

    // Check if AI is available
    if (!api.ai || !api.ai.isAvailable()) {
      api.ui.showNotification(
        'Intelligent Link Suggester requires AI to be configured. Please set up AI in settings.',
        'warning'
      );
    }

    pluginInstance = new IntelligentLinkSuggesterPlugin(api);
  },

  onUnload: async () => {
    if (pluginInstance) {
      pluginInstance.cleanup();
      pluginInstance = null;
    }
  },
};

/**
 * User Learning Data
 */
interface UserLearningData {
  acceptedLinks: Array<{ source: string; target: string; confidence: number }>;
  rejectedLinks: Array<{ source: string; target: string; confidence: number; reason?: string }>;
  patterns: {
    minAcceptedConfidence: number;
    maxRejectedConfidence: number;
    preferredTopics: string[];
    avoidedTopics: string[];
  };
}

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
  private userLearning: UserLearningData;
  private panelContainer: HTMLElement | null = null;

  constructor(api: PluginAPI) {
    this.api = api;
    this.userLearning = this.loadUserLearning();
    this.createPanelContainer();
  }

  /**
   * Create container for UI panels
   */
  private createPanelContainer(): void {
    this.panelContainer = document.createElement('div');
    this.panelContainer.id = 'intelligent-link-suggester-panels';
    document.body.appendChild(this.panelContainer);
  }

  /**
   * Cleanup on unload
   */
  cleanup(): void {
    if (this.panelContainer && this.panelContainer.parentNode) {
      this.panelContainer.parentNode.removeChild(this.panelContainer);
    }
    this.saveUserLearning();
  }

  /**
   * Load user learning data from localStorage
   */
  private loadUserLearning(): UserLearningData {
    try {
      const stored = localStorage.getItem('intelligent-link-suggester-learning');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // Ignore errors, will return default
    }

    return {
      acceptedLinks: [],
      rejectedLinks: [],
      patterns: {
        minAcceptedConfidence: 0.6,
        maxRejectedConfidence: 1.0,
        preferredTopics: [],
        avoidedTopics: [],
      },
    };
  }

  /**
   * Save user learning data to localStorage
   */
  private saveUserLearning(): void {
    try {
      localStorage.setItem(
        'intelligent-link-suggester-learning',
        JSON.stringify(this.userLearning)
      );
      this.updateLearningPatterns();
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Update learning patterns based on historical data
   */
  private updateLearningPatterns(): void {
    const settings = this.getSettings();
    if (!settings['enable-learning']) return;

    // Calculate min accepted confidence
    if (this.userLearning.acceptedLinks.length > 0) {
      const confidences = this.userLearning.acceptedLinks.map(l => l.confidence);
      this.userLearning.patterns.minAcceptedConfidence = Math.min(...confidences);
    }

    // Calculate max rejected confidence
    if (this.userLearning.rejectedLinks.length > 0) {
      const confidences = this.userLearning.rejectedLinks.map(l => l.confidence);
      this.userLearning.patterns.maxRejectedConfidence = Math.max(...confidences);
    }

    // Keep only last 100 entries
    if (this.userLearning.acceptedLinks.length > 100) {
      this.userLearning.acceptedLinks = this.userLearning.acceptedLinks.slice(-100);
    }
    if (this.userLearning.rejectedLinks.length > 100) {
      this.userLearning.rejectedLinks = this.userLearning.rejectedLinks.slice(-100);
    }
  }

  /**
   * Apply learning to filter suggestions
   */
  private applyLearning(
    suggestions: Array<{ noteId: string; noteName: string; confidence: number; reason: string }>
  ): Array<{ noteId: string; noteName: string; confidence: number; reason: string }> {
    const settings = this.getSettings();
    if (!settings['enable-learning']) return suggestions;

    // Filter based on learned patterns
    return suggestions.filter(suggestion => {
      // If user has consistently rejected similar suggestions, filter them out
      const similarRejections = this.userLearning.rejectedLinks.filter(
        rej => rej.target === suggestion.noteName && rej.confidence > suggestion.confidence
      );

      if (similarRejections.length > 2) {
        return false; // User has rejected this link multiple times
      }

      return true;
    });
  }

  /**
   * Record user decision
   */
  private recordDecision(
    decision: 'accept' | 'reject',
    sourceNoteId: string,
    targetNoteName: string,
    confidence: number
  ): void {
    const settings = this.getSettings();
    if (!settings['enable-learning']) return;

    if (decision === 'accept') {
      this.userLearning.acceptedLinks.push({
        source: sourceNoteId,
        target: targetNoteName,
        confidence,
      });
    } else {
      this.userLearning.rejectedLinks.push({
        source: sourceNoteId,
        target: targetNoteName,
        confidence,
      });
    }

    this.saveUserLearning();
  }

  /**
   * Show UI panel with dynamic import
   */
  private async showPanel(panelType: 'links' | 'bridge' | 'map', props: unknown): Promise<void> {
    if (!this.panelContainer) return;

    try {
      if (panelType === 'links') {
        const LinkSuggestionsPanel = (await import('../components/LinkSuggestionsPanel')).default;
        const { createRoot } = await import('react-dom/client');
        const React = (await import('react')).default;

        const root = createRoot(this.panelContainer);

        root.render(React.createElement(LinkSuggestionsPanel, props as any));
      } else if (panelType === 'bridge') {
        const BridgeNoteSuggestionPanel = (await import('../components/BridgeNoteSuggestionPanel'))
          .default;
        const { createRoot } = await import('react-dom/client');
        const React = (await import('react')).default;

        const root = createRoot(this.panelContainer);

        root.render(React.createElement(BridgeNoteSuggestionPanel, props as any));
      } else if (panelType === 'map') {
        const ConnectionMapPanel = (await import('../components/ConnectionMapPanel')).default;
        const { createRoot } = await import('react-dom/client');
        const React = (await import('react')).default;

        const root = createRoot(this.panelContainer);

        root.render(React.createElement(ConnectionMapPanel, props as any));
      }
    } catch (error) {
      this.showNotification('Failed to load UI panel', 'error');
    }
  }

  /**
   * Clear panel
   */
  private clearPanel(): void {
    if (this.panelContainer) {
      this.panelContainer.innerHTML = '';
    }
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
      let linkSuggestions = analysis.suggestedConnections
        .filter(conn => conn.confidence >= minConfidence)
        .filter(conn => !existingLinks.has(conn.noteName.toLowerCase()))
        .slice(0, maxSuggestions);

      // Apply learning
      linkSuggestions = this.applyLearning(linkSuggestions);

      if (linkSuggestions.length === 0) {
        this.showNotification('No link opportunities found in this note', 'info');
        return;
      }

      // Check for bidirectional opportunities
      const bidirectionalSuggestions = await this.findBidirectionalOpportunities(
        currentNoteId,
        linkSuggestions
      );

      // Add bidirectional flag to suggestions
      const enrichedSuggestions = linkSuggestions.map(s => ({
        ...s,
        isBidirectional: bidirectionalSuggestions.includes(s.noteId),
      }));

      // Show UI panel
      await this.showPanel('links', {
        noteName: note.name,
        suggestions: enrichedSuggestions,
        onAccept: (suggestion: { noteId: string; noteName: string; confidence: number }) => {
          this.acceptSuggestion(currentNoteId, suggestion);
        },
        onReject: (suggestion: { noteId: string; noteName: string; confidence: number }) => {
          this.rejectSuggestion(currentNoteId, suggestion);
        },
        onAcceptAll: () => {
          this.acceptAllSuggestions(currentNoteId, enrichedSuggestions);
        },
        onClose: () => {
          this.clearPanel();
        },
        onPreview: async (noteId: string) => {
          return this.getPreviewContent(noteId);
        },
      });

      this.showNotification(`Found ${linkSuggestions.length} link opportunities`, 'info');
    } catch (error) {
      this.showNotification('Failed to analyze content. Please try again.', 'error');
    }
  }

  /**
   * Accept a suggestion
   */
  private async acceptSuggestion(
    noteId: string,
    suggestion: { noteName: string; confidence: number }
  ): Promise<void> {
    await this.insertWikilinks(noteId, [
      {
        noteName: suggestion.noteName,
        reason: `Accepted with ${Math.round(suggestion.confidence * 100)}% confidence`,
      },
    ]);
    this.recordDecision('accept', noteId, suggestion.noteName, suggestion.confidence);
    this.showNotification(`Added link to [[${suggestion.noteName}]]`, 'info');
  }

  /**
   * Reject a suggestion
   */
  private rejectSuggestion(
    noteId: string,
    suggestion: { noteName: string; confidence: number }
  ): void {
    this.recordDecision('reject', noteId, suggestion.noteName, suggestion.confidence);
  }

  /**
   * Accept all suggestions
   */
  private async acceptAllSuggestions(
    noteId: string,
    suggestions: Array<{ noteName: string; confidence: number; reason: string }>
  ): Promise<void> {
    await this.insertWikilinks(noteId, suggestions);
    suggestions.forEach(s => {
      this.recordDecision('accept', noteId, s.noteName, s.confidence);
    });
    this.showNotification(`Added ${suggestions.length} links`, 'info');
    this.clearPanel();
  }

  /**
   * Get preview content for a note
   */
  private async getPreviewContent(noteId: string): Promise<string> {
    const note = this.api.notes.get(noteId);
    if (!note) return 'Note not found';
    return note.content.slice(0, 500); // First 500 characters
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
        if (!point) continue;

        updatedContent = this.insertLinkAtPosition(updatedContent, point, noteName);
        insertCount++;
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
          // Continue with next note
        }

        processed++;
      }

      // Show progress
      const progress = Math.round((processed / allNotes.length) * 100);
      this.showNotification(`Progress: ${progress}% (${processed}/${allNotes.length})`, 'info');
    }

    // Show summary notification
    const totalLinks = linkOpportunities.reduce((sum, opp) => sum + opp.suggestedLinks, 0);
    this.showNotification(
      `Scan complete: Found ${linkOpportunities.length} notes with ${totalLinks} total link opportunities`,
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

    const totalLinks = allLinks.length;
    const averageConnections = allNotes.length > 0 ? (totalLinks * 2) / allNotes.length : 0;

    // Show UI panel
    await this.showPanel('map', {
      totalNotes: allNotes.length,
      totalLinks,
      averageConnections,
      hubNotes,
      orphanNotes,
      onFindLinksForOrphan: async (noteId: string) => {
        // Switch to that note and find opportunities
        this.api.notes.getActiveNoteId = () => noteId;
        await this.findLinkOpportunities();
      },
      onClose: () => {
        this.clearPanel();
      },
    });
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

      // Show UI panel
      await this.showPanel('bridge', {
        suggestion: bridgeSuggestion,
        totalClusters: clusters.length,
        onAccept: async () => {
          await this.createBridgeNote(bridgeSuggestion);
          this.clearPanel();
        },
        onReject: () => {
          this.clearPanel();
        },
        onClose: () => {
          this.clearPanel();
        },
      });
    } catch (error) {
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
      await this.api.notes.create(suggestion.title, content);
      this.showNotification(`Bridge note "${suggestion.title}" created successfully!`, 'info');
    } catch (error) {
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
