import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';

/**
 * KNOWLEDGE GRAPH AUTO-MAPPER PLUGIN
 *
 * AI-powered knowledge graph enhancement and organization.
 * Analyzes your notes to find hidden connections, suggest structure, and improve organization.
 *
 * Features:
 * - Discover hidden semantic connections between notes
 * - Automatic cluster detection and naming
 * - MOC (Map of Content) suggestions
 * - Bridge note recommendations to connect isolated clusters
 * - Relationship type categorization
 * - Orphan note connection suggestions
 * - Knowledge graph health metrics
 */

let pluginInstance: KnowledgeGraphAutoMapperPlugin | null = null;

export const knowledgeGraphAutoMapperPlugin: PluginManifest = {
  id: 'ai-knowledge-graph-auto-mapper',
  name: 'Knowledge Graph Auto-Mapper',
  version: '3.0.0',
  description:
    'AI-powered knowledge graph enhancement with visual graph integration, undo/redo, analytics dashboard, and advanced filtering. Discovers connections, creates MOC notes, tracks growth over time, and organizes your knowledge base with intelligent suggestions. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
  author: 'MarkItUp Team',
  main: 'ai-knowledge-graph-auto-mapper.js',

  permissions: [
    {
      type: 'network',
      description: 'Required to connect to AI services for content analysis',
    },
  ],

  settings: [
    {
      id: 'auto-discover',
      name: 'Auto-Discover Connections',
      type: 'boolean',
      default: false,
      description: 'Automatically suggest connections when notes are created/updated',
    },
    {
      id: 'min-similarity',
      name: 'Minimum Similarity Score',
      type: 'number',
      default: 0.7,
      description: 'Minimum semantic similarity to suggest connections (0-1)',
    },
    {
      id: 'cluster-min-size',
      name: 'Minimum Cluster Size',
      type: 'number',
      default: 3,
      description: 'Minimum notes required to form a cluster',
    },
    {
      id: 'suggest-mocs',
      name: 'Suggest MOCs',
      type: 'boolean',
      default: true,
      description: 'Automatically suggest creating Maps of Content for clusters',
    },
    {
      id: 'categorize-relationships',
      name: 'Categorize Relationships',
      type: 'boolean',
      default: true,
      description: 'AI categorizes link types (supports, extends, contradicts, etc.)',
    },
    {
      id: 'enable-notifications',
      name: 'Enable Notifications',
      type: 'boolean',
      default: true,
      description: 'Show notifications when discoveries are made',
    },
    {
      id: 'enable-caching',
      name: 'Enable Analysis Caching',
      type: 'boolean',
      default: true,
      description: 'Cache analysis results for better performance',
    },
    {
      id: 'cache-duration',
      name: 'Cache Duration (minutes)',
      type: 'number',
      default: 30,
      description: 'How long to cache analysis results before re-analyzing',
    },
    {
      id: 'save-reports',
      name: 'Auto-Save Analysis Reports',
      type: 'boolean',
      default: true,
      description: 'Automatically save analysis reports as markdown notes',
    },
    {
      id: 'confirm-actions',
      name: 'Confirm Before Applying Changes',
      type: 'boolean',
      default: true,
      description: 'Ask for confirmation before modifying notes',
    },
    {
      id: 'batch-min-confidence',
      name: 'Batch Apply Minimum Confidence',
      type: 'number',
      default: 0.8,
      description: 'Minimum confidence score for batch operations (0-1)',
    },
    {
      id: 'use-modern-ui',
      name: 'Use Modern UI',
      type: 'boolean',
      default: true,
      description: 'Use modern React dialogs instead of browser alerts',
    },
    {
      id: 'highlight-in-graph',
      name: 'Highlight Suggestions in Graph',
      type: 'boolean',
      default: true,
      description: 'Visually highlight suggested connections in graph view',
    },
    {
      id: 'max-history',
      name: 'Maximum History Items',
      type: 'number',
      default: 50,
      description: 'Maximum number of actions to track for undo (10-100)',
    },
    {
      id: 'show-analytics',
      name: 'Show Analytics Dashboard',
      type: 'boolean',
      default: true,
      description: 'Display analytics dashboard with growth metrics',
    },
    {
      id: 'track-effectiveness',
      name: 'Track MOC Effectiveness',
      type: 'boolean',
      default: true,
      description: 'Track how often MOCs are accessed and linked to',
    },
    {
      id: 'export-format',
      name: 'Export Format',
      type: 'select',
      default: 'json',
      options: ['json', 'csv', 'markdown'],
      description: 'Default format for exporting suggestions',
    },
  ] as PluginSetting[],

  commands: [
    {
      id: 'discover-connections',
      name: 'Discover Hidden Connections',
      description: 'AI analyzes notes to find semantic connections not yet linked',
      keybinding: 'Cmd+Shift+D',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.discoverConnections();
      },
    },
    {
      id: 'analyze-clusters',
      name: 'Analyze & Name Clusters',
      description: 'Detect note clusters and suggest meaningful names',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.analyzeClusters();
      },
    },
    {
      id: 'suggest-mocs',
      name: 'Suggest Maps of Content',
      description: 'AI recommends which notes should become hub/MOC notes',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.suggestMOCs();
      },
    },
    {
      id: 'find-bridge-notes',
      name: 'Find Bridge Note Opportunities',
      description: 'Identify gaps between clusters and suggest bridge topics',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.findBridgeNotes();
      },
    },
    {
      id: 'connect-orphans',
      name: 'Connect Orphan Notes',
      description: 'Suggest connections for isolated notes',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.connectOrphans();
      },
    },
    {
      id: 'graph-health-check',
      name: 'Knowledge Graph Health Check',
      description: 'Comprehensive analysis of graph structure and organization',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.healthCheck();
      },
    },
    {
      id: 'save-analysis-report',
      name: 'Save Analysis Report',
      description: 'Save the last analysis results as a markdown note',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.saveAnalysisReport();
      },
    },
    {
      id: 'clear-cache',
      name: 'Clear Analysis Cache',
      description: 'Clear all cached analysis results to force fresh analysis',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.clearCache();
      },
    },
    {
      id: 'apply-all-connections',
      name: 'Apply All Suggested Connections',
      description: 'Batch apply all connection suggestions above confidence threshold',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.applyAllConnections();
      },
    },
    {
      id: 'create-all-mocs',
      name: 'Create All Suggested MOCs',
      description: 'Batch create all MOC suggestions',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.createAllMOCs();
      },
    },
    {
      id: 'undo-last-action',
      name: 'Undo Last Graph Action',
      description: 'Undo the last applied connection or MOC creation',
      keybinding: 'Cmd+Shift+Z',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.undoLastAction();
      },
    },
    {
      id: 'show-analytics',
      name: 'Show Analytics Dashboard',
      description: 'Display graph growth metrics and effectiveness analytics',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.showAnalyticsDashboard();
      },
    },
    {
      id: 'export-suggestions',
      name: 'Export Suggestions',
      description: 'Export current suggestions to file (JSON/CSV/Markdown)',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.exportSuggestions();
      },
    },
    {
      id: 'import-suggestions',
      name: 'Import Suggestions',
      description: 'Import previously saved suggestions from file',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Knowledge Graph Auto-Mapper: Plugin not initialized');
          return;
        }
        await pluginInstance.importSuggestions();
      },
    },
  ] as Command[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Knowledge Graph Auto-Mapper: PluginAPI not available');
      return;
    }

    // Check if AI and Graph APIs are available
    if (!api.ai || !api.ai.isAvailable()) {
      console.warn('Knowledge Graph Auto-Mapper: AI service not available.');
      api.ui.showNotification(
        'Knowledge Graph Auto-Mapper requires AI to be configured.',
        'warning'
      );
    }

    if (!api.graph) {
      console.warn('Knowledge Graph Auto-Mapper: Graph API not available.');
      api.ui.showNotification(
        'Knowledge Graph Auto-Mapper requires graph functionality.',
        'warning'
      );
    }

    pluginInstance = new KnowledgeGraphAutoMapperPlugin(api);
    console.log('Knowledge Graph Auto-Mapper plugin loaded successfully');
  },

  onUnload: async () => {
    pluginInstance = null;
    console.log('Knowledge Graph Auto-Mapper plugin unloaded');
  },
};

/**
 * Action history item for undo functionality
 */
interface HistoryAction {
  type: 'connection' | 'moc' | 'batch-connections' | 'batch-mocs';
  timestamp: number;
  data: {
    sourceId?: string;
    targetId?: string;
    mocName?: string;
    mocContent?: string;
    previousContent?: string;
    connections?: Array<{ sourceId: string; targetId: string }>;
    mocs?: Array<{ name: string; content: string }>;
  };
}

/**
 * Analytics data structure
 */
interface AnalyticsData {
  totalConnections: number;
  totalMOCs: number;
  connectionsByDate: Record<string, number>;
  mocsByDate: Record<string, number>;
  avgConnectionsPerDay: number;
  graphGrowthRate: number;
  mostConnectedNotes: Array<{ id: string; name: string; count: number }>;
  mocEffectiveness: Array<{ name: string; accessCount: number; linkCount: number }>;
}

/**
 * Knowledge Graph Auto-Mapper Plugin Implementation (Enhanced v3.0)
 */
class KnowledgeGraphAutoMapperPlugin {
  private api: PluginAPI;
  private analysisCache: Map<
    string,
    {
      timestamp: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  > = new Map();
  private lastAnalysisReport: string = '';
  private pendingSuggestions: Array<{
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }> = [];
  private actionHistory: HistoryAction[] = [];
  private analyticsData: AnalyticsData = {
    totalConnections: 0,
    totalMOCs: 0,
    connectionsByDate: {},
    mocsByDate: {},
    avgConnectionsPerDay: 0,
    graphGrowthRate: 0,
    mostConnectedNotes: [],
    mocEffectiveness: [],
  };

  constructor(api: PluginAPI) {
    this.api = api;
    this.loadAnalyticsData();
  }

  /**
   * Clear all cached analysis results
   */
  async clearCache(): Promise<void> {
    this.analysisCache.clear();
    this.showNotification('Analysis cache cleared successfully', 'info');
  }

  /**
   * Save the last analysis report as a markdown note
   */
  async saveAnalysisReport(): Promise<void> {
    if (!this.lastAnalysisReport) {
      this.showNotification('No analysis report to save. Run an analysis first.', 'warning');
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const noteName = `Graph Analysis ${timestamp}.md`;

      await this.api.notes.create(noteName, this.lastAnalysisReport);
      this.showNotification(`Analysis report saved as "${noteName}"`, 'info');
    } catch (error) {
      console.error('Error saving analysis report:', error);
      this.showNotification('Failed to save analysis report', 'error');
    }
  }

  /**
   * Apply all connection suggestions above confidence threshold (batch operation)
   */
  async applyAllConnections(minConfidence?: number): Promise<void> {
    const settings = this.getSettings();
    const threshold = minConfidence ?? Number(settings['batch-min-confidence']) ?? 0.8;

    // Get cached connection suggestions
    const cached = this.getCachedData('discovered-connections');
    if (!cached || !Array.isArray(cached)) {
      this.showNotification(
        'No connection suggestions available. Run "Discover Hidden Connections" first.',
        'warning'
      );
      return;
    }

    const connections = cached.filter(
      (conn: { similarity: number }) => conn.similarity >= threshold
    );

    if (connections.length === 0) {
      this.showNotification(
        `No connections above ${(threshold * 100).toFixed(0)}% confidence threshold`,
        'info'
      );
      return;
    }

    this.showNotification(`Applying ${connections.length} connection(s)...`, 'info');

    let appliedCount = 0;
    let failedCount = 0;

    for (const conn of connections) {
      try {
        await this.applyConnection(conn.source, conn.target, conn.reason, true);
        appliedCount++;
      } catch (error) {
        console.error(`Failed to apply connection ${conn.source} -> ${conn.target}:`, error);
        failedCount++;
      }
    }

    this.showNotification(
      `Applied ${appliedCount} connection(s). ${failedCount > 0 ? `Failed: ${failedCount}` : ''}`,
      failedCount > 0 ? 'warning' : 'info'
    );

    // Emit event for graph updates
    this.api.events.emit('knowledgeGraphBatchUpdate', {
      action: 'connections-applied',
      count: appliedCount,
    });
  }

  /**
   * Create all MOC suggestions (batch operation)
   */
  async createAllMOCs(): Promise<void> {
    const suggestions = this.pendingSuggestions.filter(s => s.type === 'moc');

    if (suggestions.length === 0) {
      this.showNotification(
        'No MOC suggestions available. Run "Suggest Maps of Content" first.',
        'warning'
      );
      return;
    }

    this.showNotification(`Creating ${suggestions.length} MOC(s)...`, 'info');

    let createdCount = 0;
    let failedCount = 0;

    for (const suggestion of suggestions) {
      try {
        await this.createMOCNote(
          suggestion.data.suggestedTitle,
          suggestion.data.noteIds,
          suggestion.data.reason,
          true
        );
        createdCount++;
      } catch (error) {
        console.error(`Failed to create MOC ${suggestion.data.suggestedTitle}:`, error);
        failedCount++;
      }
    }

    this.showNotification(
      `Created ${createdCount} MOC(s). ${failedCount > 0 ? `Failed: ${failedCount}` : ''}`,
      failedCount > 0 ? 'warning' : 'info'
    );

    // Clear pending suggestions for created MOCs
    if (createdCount > 0) {
      this.pendingSuggestions = this.pendingSuggestions.filter(s => s.type !== 'moc');
    }

    // Emit event for graph updates
    this.api.events.emit('knowledgeGraphBatchUpdate', {
      action: 'mocs-created',
      count: createdCount,
    });
  }

  /**
   * Get cached data or null if expired
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getCachedData(key: string): any | null {
    const settings = this.getSettings();
    const enableCaching = settings['enable-caching'] !== false;

    if (!enableCaching) {
      return null;
    }

    const cached = this.analysisCache.get(key);
    if (!cached) {
      return null;
    }

    const cacheDuration = Number(settings['cache-duration']) || 30;
    const maxAge = cacheDuration * 60 * 1000; // Convert to milliseconds
    const age = Date.now() - cached.timestamp;

    if (age > maxAge) {
      this.analysisCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache data with timestamp
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setCachedData(key: string, data: any): void {
    const settings = this.getSettings();
    const enableCaching = settings['enable-caching'] !== false;

    if (enableCaching) {
      this.analysisCache.set(key, {
        timestamp: Date.now(),
        data,
      });
    }
  }

  /**
   * Apply a connection suggestion (add wikilink to note)
   */
  private async applyConnection(
    sourceId: string,
    targetId: string,
    reason: string,
    skipConfirmation = false
  ): Promise<void> {
    const settings = this.getSettings();
    const confirmActions = settings['confirm-actions'] !== false && !skipConfirmation;

    if (confirmActions) {
      const sourceNote = this.api.notes.get(sourceId);
      const targetNote = this.api.notes.get(targetId);

      if (!sourceNote || !targetNote) {
        this.showNotification('Note not found', 'error');
        return;
      }

      const confirmed = confirm(
        `Add connection from "${sourceNote.name}" to "${targetNote.name}"?\n\nReason: ${reason}`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const sourceNote = this.api.notes.get(sourceId);
      const targetNote = this.api.notes.get(targetId);

      if (!sourceNote || !targetNote) {
        this.showNotification('Note not found', 'error');
        return;
      }

      // Check if link already exists
      if (sourceNote.content.includes(`[[${targetNote.name.replace('.md', '')}]]`)) {
        this.showNotification('Connection already exists', 'warning');
        return;
      }

      // Store previous content for undo
      const previousContent = sourceNote.content;

      // Add connection at the end of the note
      const linkText = `\n\n## Related Notes\n- [[${targetNote.name.replace('.md', '')}]] - ${reason}`;
      const updatedContent = sourceNote.content + linkText;

      await this.api.notes.update(sourceId, { content: updatedContent });

      // Track in history for undo
      this.addToHistory({
        type: 'connection',
        timestamp: Date.now(),
        data: {
          sourceId,
          targetId,
          previousContent,
        },
      });

      // Track in analytics
      this.trackConnection();

      // If graph API supports addLink, use it
      if (
        this.api.graph &&
        typeof (this.api.graph as unknown as { addLink: unknown }).addLink === 'function'
      ) {
        await (
          this.api.graph as unknown as {
            addLink: (source: string, target: string, type: string) => Promise<void>;
          }
        ).addLink(sourceId, targetId, 'semantic');
      }

      this.showNotification('Connection applied successfully', 'info');

      // Emit event to update graph visualization
      this.api.events.emit('knowledgeGraphUpdate', {
        action: 'link-added',
        sourceId,
        targetId,
      });
    } catch (error) {
      console.error('Error applying connection:', error);
      this.showNotification('Failed to apply connection', 'error');
    }
  }

  /**
   * Create a MOC note from suggestions
   */
  private async createMOCNote(
    title: string,
    noteIds: string[],
    theme: string,
    skipConfirmation = false
  ): Promise<void> {
    const settings = this.getSettings();
    const confirmActions = settings['confirm-actions'] !== false && !skipConfirmation;

    if (confirmActions) {
      const confirmed = confirm(
        `Create MOC note "${title}"?\n\nThis will create a hub note connecting ${noteIds.length} related notes.`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const notes = noteIds.map(id => this.api.notes.get(id)).filter(n => n !== null);

      let mocContent = `# ${title}\n\n${theme}\n\n## Related Notes\n\n`;

      notes.forEach(note => {
        if (note) {
          mocContent += `- [[${note.name.replace('.md', '')}]]\n`;
        }
      });

      mocContent += `\n## Overview\n\nThis is a Map of Content (MOC) that connects related notes about ${title.toLowerCase()}.\n`;

      const mocName = `${title} MOC.md`;
      await this.api.notes.create(mocName, mocContent);

      // Track in history for undo
      this.addToHistory({
        type: 'moc',
        timestamp: Date.now(),
        data: {
          mocName,
          mocContent,
        },
      });

      // Track in analytics
      this.trackMOC(mocName);

      this.showNotification(`MOC "${title}" created successfully`, 'info');

      // Emit event to update graph
      this.api.events.emit('knowledgeGraphUpdate', {
        action: 'moc-created',
        mocTitle: title,
      });
    } catch (error) {
      console.error('Error creating MOC:', error);
      this.showNotification('Failed to create MOC note', 'error');
    }
  }

  /**
   * Discover hidden semantic connections between notes
   */
  async discoverConnections(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    if (!this.api.graph) {
      this.showNotification('Graph API is not available.', 'warning');
      return;
    }

    const allNotes = this.api.notes.getAll();

    if (allNotes.length < 2) {
      this.showNotification('Need at least 2 notes to discover connections', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing notes for hidden connections...', 'info');

      const settings = this.getSettings();
      const minSimilarity = Number(settings['min-similarity']) || 0.7;

      const connections: Array<{
        source: string;
        target: string;
        reason: string;
        similarity: number;
      }> = [];

      // Analyze each note
      for (const note of allNotes) {
        const analysis = await this.api.ai.analyzeContent(note.content, note.id);

        // Check suggested connections against threshold
        const validConnections = analysis.suggestedConnections.filter(
          conn => conn.confidence >= minSimilarity
        );

        validConnections.forEach(conn => {
          connections.push({
            source: note.id,
            target: conn.noteId,
            reason: conn.reason,
            similarity: conn.confidence,
          });
        });
      }

      if (connections.length === 0) {
        this.showNotification('No new connections discovered', 'info');
        return;
      }

      // Save to cache
      this.setCachedData('discovered-connections', connections);

      // Store for later action
      this.pendingSuggestions = connections.map(conn => ({
        type: 'connection',
        data: conn,
      }));

      // Display discoveries with actionable UI
      this.displayConnectionDiscoveriesActionable(connections);

      this.showNotification(`Discovered ${connections.length} potential connections!`, 'info');

      // Auto-save report if enabled
      const saveReports = settings['save-reports'] !== false;
      if (saveReports) {
        await this.saveAnalysisReport();
      }
    } catch (error) {
      console.error('Knowledge Graph Auto-Mapper: Error discovering connections:', error);
      this.showNotification('Failed to discover connections.', 'error');
    }
  }

  /**
   * Analyze and name clusters in the knowledge graph
   */
  async analyzeClusters(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    if (!this.api.graph) {
      this.showNotification('Graph API is not available.', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing knowledge graph clusters...', 'info');

      const allNotes = this.api.notes.getAll();
      const allLinks = this.api.graph.getAllLinks();

      // Simple cluster detection (notes that link to each other)
      const clusters = this.detectClusters(allNotes, allLinks);

      const settings = this.getSettings();
      const minClusterSize = Number(settings['cluster-min-size']) || 3;

      const significantClusters = clusters.filter(c => c.noteIds.length >= minClusterSize);

      if (significantClusters.length === 0) {
        this.showNotification('No significant clusters found', 'info');
        return;
      }

      // Name each cluster using AI
      const namedClusters: Array<{
        noteIds: string[];
        name: string;
        theme: string;
        keyTopics: string[];
      }> = [];

      for (const cluster of significantClusters) {
        const clusterNotes = cluster.noteIds
          .map(id => this.api.notes.get(id))
          .filter(n => n !== null);

        const combinedContent = clusterNotes
          .map(n => `Title: ${n!.name}\n${n!.content.substring(0, 200)}`)
          .join('\n\n');

        const analysis = await this.api.ai.analyzeContent(combinedContent);

        namedClusters.push({
          noteIds: cluster.noteIds,
          name: analysis.keyTopics[0] || 'Unnamed Cluster',
          theme: analysis.summary,
          keyTopics: analysis.keyTopics,
        });
      }

      // Display cluster analysis
      this.displayClusterAnalysis(namedClusters);

      this.showNotification(`Analyzed ${namedClusters.length} cluster(s)`, 'info');
    } catch (error) {
      console.error('Knowledge Graph Auto-Mapper: Error analyzing clusters:', error);
      this.showNotification('Failed to analyze clusters.', 'error');
    }
  }

  /**
   * Suggest Maps of Content (MOC) notes
   */
  async suggestMOCs(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    if (!this.api.graph) {
      this.showNotification('Graph API is not available.', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing graph for MOC opportunities...', 'info');

      const allNotes = this.api.notes.getAll();
      const allLinks = this.api.graph.getAllLinks();

      // Find highly connected notes (potential existing MOCs)
      const connectionCounts: Record<string, number> = {};
      allLinks.forEach(link => {
        connectionCounts[link.source] = (connectionCounts[link.source] || 0) + 1;
        connectionCounts[link.target] = (connectionCounts[link.target] || 0) + 1;
      });

      // Find clusters without a central hub
      const clusters = this.detectClusters(allNotes, allLinks);
      const mocSuggestions: Array<{
        clusterNotes: string[];
        noteIds: string[];
        suggestedTitle: string;
        reason: string;
        priority: 'high' | 'medium' | 'low';
      }> = [];

      for (const cluster of clusters) {
        if (cluster.noteIds.length < 3) continue;

        // Check if cluster already has a hub note
        const hasHub = cluster.noteIds.some(
          id => (connectionCounts[id] || 0) > cluster.noteIds.length * 0.5
        );

        if (!hasHub) {
          // Analyze cluster to suggest MOC title
          const clusterNotes = cluster.noteIds
            .map(id => this.api.notes.get(id))
            .filter(n => n !== null);

          const titles = clusterNotes.map(n => n!.name).join(', ');
          const analysis = await this.api.ai.analyzeContent(
            `These notes are related: ${titles}. Suggest a comprehensive MOC (Map of Content) title that would serve as a hub for these topics.`
          );

          mocSuggestions.push({
            clusterNotes: cluster.noteIds.map(id => {
              const note = this.api.notes.get(id);
              return note ? note.name : id;
            }),
            noteIds: cluster.noteIds,
            suggestedTitle: analysis.keyTopics[0] || 'Suggested MOC',
            reason: analysis.summary,
            priority: cluster.noteIds.length > 5 ? 'high' : 'medium',
          });
        }
      }

      if (mocSuggestions.length === 0) {
        this.showNotification('No MOC suggestions found. Your graph is well-organized!', 'info');
        return;
      }

      // Store for later action
      this.pendingSuggestions = mocSuggestions.map(sug => ({
        type: 'moc',
        data: sug,
      }));

      // Display MOC suggestions with actionable UI
      this.displayMOCSuggestionsActionable(mocSuggestions);

      this.showNotification(`Found ${mocSuggestions.length} MOC opportunity(ies)`, 'info');

      // Auto-save report if enabled
      const settings = this.getSettings();
      const saveReports = settings['save-reports'] !== false;
      if (saveReports) {
        await this.saveAnalysisReport();
      }
    } catch (error) {
      console.error('Knowledge Graph Auto-Mapper: Error suggesting MOCs:', error);
      this.showNotification('Failed to suggest MOCs.', 'error');
    }
  }

  /**
   * Find bridge note opportunities between clusters
   */
  async findBridgeNotes(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    if (!this.api.graph) {
      this.showNotification('Graph API is not available.', 'warning');
      return;
    }

    try {
      this.showNotification('Finding bridge note opportunities...', 'info');

      const allNotes = this.api.notes.getAll();
      const allLinks = this.api.graph.getAllLinks();
      const clusters = this.detectClusters(allNotes, allLinks);

      if (clusters.length < 2) {
        this.showNotification('Need at least 2 clusters to suggest bridge notes', 'info');
        return;
      }

      const bridgeSuggestions: Array<{
        cluster1Theme: string;
        cluster2Theme: string;
        suggestedBridgeTopic: string;
        reason: string;
      }> = [];

      // Compare each pair of clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const cluster1 = clusters[i];
          const cluster2 = clusters[j];

          // Get sample content from each cluster
          const sample1 = this.getClusterSample(cluster1.noteIds);
          const sample2 = this.getClusterSample(cluster2.noteIds);

          const prompt = `Analyze these two groups of notes and suggest a bridge topic that would connect them.

Group 1:
${sample1}

Group 2:
${sample2}

Provide a bridge note topic that would meaningfully connect these two groups.`;

          const analysis = await this.api.ai.analyzeContent(prompt);

          bridgeSuggestions.push({
            cluster1Theme: analysis.keyTopics[0] || 'Cluster 1',
            cluster2Theme: analysis.keyTopics[1] || 'Cluster 2',
            suggestedBridgeTopic: analysis.keyTopics[2] || 'Bridge Topic',
            reason: analysis.summary,
          });
        }
      }

      if (bridgeSuggestions.length === 0) {
        this.showNotification('No bridge note opportunities found', 'info');
        return;
      }

      // Display bridge suggestions
      this.displayBridgeSuggestions(bridgeSuggestions);

      this.showNotification(
        `Found ${bridgeSuggestions.length} bridge note opportunity(ies)`,
        'info'
      );
    } catch (error) {
      console.error('Knowledge Graph Auto-Mapper: Error finding bridge notes:', error);
      this.showNotification('Failed to find bridge notes.', 'error');
    }
  }

  /**
   * Connect orphan notes to the graph
   */
  async connectOrphans(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    if (!this.api.graph) {
      this.showNotification('Graph API is not available.', 'warning');
      return;
    }

    try {
      this.showNotification('Finding orphan notes...', 'info');

      const allNotes = this.api.notes.getAll();
      const allLinks = this.api.graph.getAllLinks();

      // Find notes with no connections
      const connectedNoteIds = new Set<string>();
      allLinks.forEach(link => {
        connectedNoteIds.add(link.source);
        connectedNoteIds.add(link.target);
      });

      const orphans = allNotes.filter(note => !connectedNoteIds.has(note.id));

      if (orphans.length === 0) {
        this.showNotification('No orphan notes found! Your graph is well-connected.', 'info');
        return;
      }

      const connectionSuggestions: Array<{
        orphanName: string;
        suggestedConnections: string[];
        reasons: string[];
      }> = [];

      // Analyze each orphan
      for (const orphan of orphans.slice(0, 10)) {
        // Limit to first 10
        const analysis = await this.api.ai.analyzeContent(orphan.content, orphan.id);

        const suggestions = analysis.suggestedConnections.slice(0, 3).map(conn => {
          const targetNote = this.api.notes.get(conn.noteId);
          return targetNote ? targetNote.name : conn.noteName;
        });

        connectionSuggestions.push({
          orphanName: orphan.name,
          suggestedConnections: suggestions,
          reasons: analysis.suggestedConnections.slice(0, 3).map(c => c.reason),
        });
      }

      // Display orphan connection suggestions
      this.displayOrphanSuggestions(connectionSuggestions);

      this.showNotification(
        `Found ${orphans.length} orphan note(s). Analyzed ${connectionSuggestions.length}.`,
        'info'
      );
    } catch (error) {
      console.error('Knowledge Graph Auto-Mapper: Error connecting orphans:', error);
      this.showNotification('Failed to analyze orphan notes.', 'error');
    }
  }

  /**
   * Comprehensive knowledge graph health check
   */
  async healthCheck(): Promise<void> {
    if (!this.api.graph) {
      this.showNotification('Graph API is not available.', 'warning');
      return;
    }

    try {
      this.showNotification('Performing health check...', 'info');

      const allNotes = this.api.notes.getAll();
      const allLinks = this.api.graph.getAllLinks();
      const allTags = this.api.graph.getTags();

      // Calculate metrics
      const totalNotes = allNotes.length;
      const totalLinks = allLinks.length;
      const avgConnectionsPerNote = totalNotes > 0 ? (totalLinks * 2) / totalNotes : 0;

      // Find orphans
      const connectedNoteIds = new Set<string>();
      allLinks.forEach(link => {
        connectedNoteIds.add(link.source);
        connectedNoteIds.add(link.target);
      });
      const orphanCount = allNotes.filter(n => !connectedNoteIds.has(n.id)).length;

      // Find hub notes (highly connected)
      const connectionCounts: Record<string, number> = {};
      allLinks.forEach(link => {
        connectionCounts[link.source] = (connectionCounts[link.source] || 0) + 1;
        connectionCounts[link.target] = (connectionCounts[link.target] || 0) + 1;
      });

      const hubNotes = Object.entries(connectionCounts)
        .filter(([, count]) => count > 5)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      // Detect clusters
      const clusters = this.detectClusters(allNotes, allLinks);

      // Display health report
      const healthReport = `# 📊 Knowledge Graph Health Report

*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Notes | ${totalNotes} |
| Total Links | ${totalLinks} |
| Total Tags | ${allTags.length} |
| Avg Connections/Note | ${avgConnectionsPerNote.toFixed(1)} |
| Health Score | **${this.calculateHealthScore(totalNotes, totalLinks, orphanCount)}%** |

## Connection Analysis

### Orphan Notes
- **Count**: ${orphanCount} (${((orphanCount / totalNotes) * 100).toFixed(1)}%)
- **Status**: ${orphanCount > totalNotes * 0.2 ? '⚠️ High orphan count' : '✅ Orphan count looks good'}
- **Recommendation**: ${orphanCount > totalNotes * 0.2 ? 'Run "Connect Orphan Notes" command' : 'Continue monitoring'}

### Hub Notes (Highly Connected)
${
  hubNotes.length > 0
    ? hubNotes
        .map(([id, count]) => {
          const note = this.api.notes.get(id);
          return `- **${note?.name || id}**: ${count} connections`;
        })
        .join('\n')
    : '- No hub notes detected (notes with 5+ connections)'
}

## Cluster Analysis

- **Total Clusters**: ${clusters.length}
- **Status**: ${clusters.length > 5 ? '💡 Consider creating MOCs for large clusters' : '✅ Cluster count is healthy'}

### Top Clusters
${clusters
  .slice(0, 5)
  .map((c, i) => `${i + 1}. Cluster ${i + 1}: ${c.noteIds.length} notes`)
  .join('\n')}

## Recommendations

${orphanCount > totalNotes * 0.2 ? '1. ⚠️ **High orphan count** - Run "Connect Orphan Notes" to link isolated notes\n' : ''}${clusters.length > 5 ? '2. 💡 **Many clusters detected** - Consider creating MOCs (Maps of Content) to organize related notes\n' : ''}${avgConnectionsPerNote < 2 ? '3. ⚠️ **Low connectivity** - Add more wikilinks between related notes\n' : ''}${orphanCount <= totalNotes * 0.2 && clusters.length <= 5 && avgConnectionsPerNote >= 2 ? '✅ **Your knowledge graph is healthy!** Keep up the good work.\n' : ''}

---

*Report generated by Knowledge Graph Auto-Mapper v2.0*
      `.trim();

      // Save report
      this.lastAnalysisReport = healthReport;

      console.log(healthReport);
      this.showNotification('Health check complete. See console for full report.', 'info');

      // Show summary dialog
      const summaryDialog = `📊 Knowledge Graph Health Check

Health Score: ${this.calculateHealthScore(totalNotes, totalLinks, orphanCount)}%

Notes: ${totalNotes}
Links: ${totalLinks}
Orphans: ${orphanCount}
Clusters: ${clusters.length}

${orphanCount > totalNotes * 0.2 ? '⚠️ High orphan count detected\n' : ''}${avgConnectionsPerNote < 2 ? '⚠️ Low connectivity detected\n' : ''}${orphanCount <= totalNotes * 0.2 && avgConnectionsPerNote >= 2 ? '✅ Graph is healthy!\n' : ''}
Check console for full report or save it as a note.`;

      alert(summaryDialog);

      // Auto-save report if enabled
      const settings = this.getSettings();
      const saveReports = settings['save-reports'] !== false;
      if (saveReports) {
        await this.saveAnalysisReport();
      }
    } catch (error) {
      console.error('Knowledge Graph Auto-Mapper: Error during health check:', error);
      this.showNotification('Failed to perform health check.', 'error');
    }
  }

  /**
   * Helper: Simple cluster detection
   */
  private detectClusters(
    notes: Array<{ id: string; name: string }>,
    links: Array<{ source: string; target: string }>
  ): Array<{ noteIds: string[] }> {
    // Simple connected components algorithm
    const adjacencyList: Record<string, Set<string>> = {};

    notes.forEach(note => {
      adjacencyList[note.id] = new Set();
    });

    links.forEach(link => {
      if (!adjacencyList[link.source]) adjacencyList[link.source] = new Set();
      if (!adjacencyList[link.target]) adjacencyList[link.target] = new Set();
      adjacencyList[link.source].add(link.target);
      adjacencyList[link.target].add(link.source);
    });

    const visited = new Set<string>();
    const clusters: Array<{ noteIds: string[] }> = [];

    const dfs = (nodeId: string, cluster: string[]) => {
      visited.add(nodeId);
      cluster.push(nodeId);

      adjacencyList[nodeId]?.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, cluster);
        }
      });
    };

    notes.forEach(note => {
      if (!visited.has(note.id)) {
        const cluster: string[] = [];
        dfs(note.id, cluster);
        if (cluster.length > 1) {
          clusters.push({ noteIds: cluster });
        }
      }
    });

    return clusters;
  }

  /**
   * Helper: Get sample content from cluster
   */
  private getClusterSample(noteIds: string[]): string {
    return noteIds
      .slice(0, 3)
      .map(id => {
        const note = this.api.notes.get(id);
        return note ? `${note.name}: ${note.content.substring(0, 100)}...` : '';
      })
      .join('\n');
  }

  /**
   * Helper: Calculate health score
   */
  private calculateHealthScore(
    totalNotes: number,
    totalLinks: number,
    orphanCount: number
  ): number {
    if (totalNotes === 0) return 0;

    const connectivityScore = Math.min((totalLinks / totalNotes) * 20, 50);
    const orphanPenalty = (orphanCount / totalNotes) * 50;

    return Math.round(Math.max(0, connectivityScore + (50 - orphanPenalty)));
  }

  /**
   * Display connection discoveries
   */
  private displayConnectionDiscoveries(
    connections: Array<{ source: string; target: string; reason: string; similarity: number }>
  ): void {
    console.log('🔗 Hidden Connections Discovered:\n');
    connections.forEach((conn, i) => {
      const sourceNote = this.api.notes.get(conn.source);
      const targetNote = this.api.notes.get(conn.target);
      console.log(`${i + 1}. "${sourceNote?.name}" ↔ "${targetNote?.name}"`);
      console.log(`   Similarity: ${(conn.similarity * 100).toFixed(0)}%`);
      console.log(`   Reason: ${conn.reason}\n`);
    });
  }

  /**
   * Display cluster analysis
   */
  private displayClusterAnalysis(
    clusters: Array<{ noteIds: string[]; name: string; theme: string; keyTopics: string[] }>
  ): void {
    console.log('🗂️  Cluster Analysis:\n');
    clusters.forEach((cluster, i) => {
      console.log(`${i + 1}. ${cluster.name} (${cluster.noteIds.length} notes)`);
      console.log(`   Theme: ${cluster.theme}`);
      console.log(`   Topics: ${cluster.keyTopics.join(', ')}\n`);
    });
  }

  /**
   * Display MOC suggestions
   */
  private displayMOCSuggestions(
    suggestions: Array<{
      clusterNotes: string[];
      suggestedTitle: string;
      reason: string;
      priority: string;
    }>
  ): void {
    console.log('📚 MOC (Map of Content) Suggestions:\n');
    suggestions.forEach((sug, i) => {
      console.log(`${i + 1}. Create MOC: "${sug.suggestedTitle}" [${sug.priority} priority]`);
      console.log(
        `   Would connect: ${sug.clusterNotes.slice(0, 5).join(', ')}${sug.clusterNotes.length > 5 ? '...' : ''}`
      );
      console.log(`   Reason: ${sug.reason}\n`);
    });
  }

  /**
   * Display bridge suggestions
   */
  private displayBridgeSuggestions(
    suggestions: Array<{
      cluster1Theme: string;
      cluster2Theme: string;
      suggestedBridgeTopic: string;
      reason: string;
    }>
  ): void {
    console.log('🌉 Bridge Note Suggestions:\n');
    suggestions.forEach((sug, i) => {
      console.log(`${i + 1}. "${sug.suggestedBridgeTopic}"`);
      console.log(`   Connects: "${sug.cluster1Theme}" ↔ "${sug.cluster2Theme}"`);
      console.log(`   Why: ${sug.reason}\n`);
    });
  }

  /**
   * Display orphan connection suggestions
   */
  private displayOrphanSuggestions(
    suggestions: Array<{
      orphanName: string;
      suggestedConnections: string[];
      reasons: string[];
    }>
  ): void {
    console.log('🏝️  Orphan Note Connection Suggestions:\n');
    suggestions.forEach((sug, i) => {
      console.log(`${i + 1}. "${sug.orphanName}"`);
      console.log(`   Suggested links:`);
      sug.suggestedConnections.forEach((conn, j) => {
        console.log(`   - [[${conn}]]: ${sug.reasons[j] || 'Related content'}`);
      });
      console.log('');
    });
  }

  /**
   * Display connection discoveries with actionable UI (ENHANCED v2.1)
   */
  private displayConnectionDiscoveriesActionable(
    connections: Array<{ source: string; target: string; reason: string; similarity: number }>
  ): void {
    const settings = this.getSettings();

    // Build report
    let report = `# 🔗 Hidden Connections Discovered\n\n`;
    report += `Found ${connections.length} potential connection(s).\n\n`;

    connections.forEach((conn, i) => {
      const sourceNote = this.api.notes.get(conn.source);
      const targetNote = this.api.notes.get(conn.target);

      report += `## ${i + 1}. "${sourceNote?.name}" ↔ "${targetNote?.name}"\n`;
      report += `- **Similarity**: ${(conn.similarity * 100).toFixed(0)}%\n`;
      report += `- **Reason**: ${conn.reason}\n\n`;
    });

    report += `\n---\n\n`;
    report += `**Next Steps:**\n`;
    report += `1. Review the suggestions above\n`;
    report += `2. Use the command palette to apply individual connections\n`;
    report += `3. Or run "Apply All Suggested Connections" for batch operations\n\n`;
    report += `*Generated by Knowledge Graph Auto-Mapper v2.1*\n`;

    // Save to lastAnalysisReport
    this.lastAnalysisReport = report;

    // Log to console (for developers)
    console.log(report);

    // Emit event for graph visualization highlighting (if enabled)
    const highlightInGraph = settings['highlight-in-graph'] !== false;
    if (highlightInGraph) {
      this.api.events.emit('knowledgeGraphSuggestions', {
        type: 'connections',
        suggestions: connections.map(conn => ({
          source: conn.source,
          target: conn.target,
          confidence: conn.similarity,
          reason: conn.reason,
        })),
      });
    }

    // Show summary using modern UI or fallback to alert
    const useModernUI = settings['use-modern-ui'] !== false;
    if (useModernUI) {
      // Emit event for modern UI component to display
      this.api.events.emit('showConnectionSuggestions', {
        connections: connections.map(conn => ({
          source: conn.source,
          target: conn.target,
          sourceName: this.api.notes.get(conn.source)?.name || conn.source,
          targetName: this.api.notes.get(conn.target)?.name || conn.target,
          reason: conn.reason,
          similarity: conn.similarity,
        })),
      });
    } else {
      // Fallback to alert/confirm dialogs
      const topConnections = connections.slice(0, 5);
      let dialogMessage = `🔗 Discovered ${connections.length} potential connections!\n\n`;
      dialogMessage += `Top suggestions:\n\n`;

      topConnections.forEach((conn, i) => {
        const sourceNote = this.api.notes.get(conn.source);
        const targetNote = this.api.notes.get(conn.target);
        dialogMessage += `${i + 1}. ${sourceNote?.name} ↔ ${targetNote?.name} (${(conn.similarity * 100).toFixed(0)}%)\n`;
      });

      if (connections.length > 5) {
        dialogMessage += `\n... and ${connections.length - 5} more\n`;
      }

      dialogMessage += `\nCheck the console for full details or save the analysis report.`;

      setTimeout(() => {
        alert(dialogMessage);

        // Prompt to apply first suggestion
        if (
          connections.length > 0 &&
          confirm(`\nWould you like to apply the first suggestion now?`)
        ) {
          const first = connections[0];
          this.applyConnection(first.source, first.target, first.reason);
        }
      }, 500);
    }
  }

  /**
   * Display MOC suggestions with actionable UI (ENHANCED v2.1)
   */
  private displayMOCSuggestionsActionable(
    suggestions: Array<{
      clusterNotes: string[];
      noteIds: string[];
      suggestedTitle: string;
      reason: string;
      priority: string;
    }>
  ): void {
    const settings = this.getSettings();

    // Build report
    let report = `# 📚 MOC (Map of Content) Suggestions\n\n`;
    report += `Found ${suggestions.length} MOC opportunity(ies).\n\n`;

    suggestions.forEach((sug, i) => {
      report += `## ${i + 1}. "${sug.suggestedTitle}" [${sug.priority} priority]\n`;
      report += `- **Would connect**: ${sug.clusterNotes.slice(0, 5).join(', ')}${sug.clusterNotes.length > 5 ? '...' : ''}\n`;
      report += `- **Reason**: ${sug.reason}\n\n`;
    });

    report += `\n---\n\n`;
    report += `*Generated by Knowledge Graph Auto-Mapper v2.1*\n`;

    // Save to lastAnalysisReport
    this.lastAnalysisReport = report;

    // Log to console
    console.log(report);

    // Show summary using modern UI or fallback to alert
    const useModernUI = settings['use-modern-ui'] !== false;
    if (useModernUI) {
      // Emit event for modern UI component to display
      this.api.events.emit('showMOCSuggestions', {
        suggestions: suggestions.map(sug => ({
          title: sug.suggestedTitle,
          noteIds: sug.noteIds,
          noteNames: sug.clusterNotes,
          reason: sug.reason,
          priority: sug.priority as 'high' | 'medium' | 'low',
        })),
      });
    } else {
      // Fallback to alert/confirm dialogs
      const topSuggestions = suggestions.slice(0, 3);
      let dialogMessage = `📚 Found ${suggestions.length} MOC opportunity(ies)!\n\n`;

      topSuggestions.forEach((sug, i) => {
        dialogMessage += `${i + 1}. "${sug.suggestedTitle}" (${sug.clusterNotes.length} notes, ${sug.priority} priority)\n`;
      });

      dialogMessage += `\nCheck the console for full details.`;

      setTimeout(() => {
        alert(dialogMessage);

        // Prompt to create first MOC
        if (suggestions.length > 0 && confirm(`\nWould you like to create the first MOC now?`)) {
          const first = suggestions[0];
          this.createMOCNote(first.suggestedTitle, first.noteIds, first.reason);
        }
      }, 500);
    }
  }

  /**
   * Get plugin settings
   */
  private getSettings(): Record<string, unknown> {
    return this.api.settings.get('ai-knowledge-graph-auto-mapper') || {};
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

  // ============================================================================
  // NEW v3.0 METHODS: Undo, Analytics, Export/Import
  // ============================================================================

  /**
   * Load analytics data from storage
   */
  private loadAnalyticsData(): void {
    try {
      const stored = localStorage.getItem('knowledge-graph-analytics');
      if (stored) {
        this.analyticsData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  /**
   * Save analytics data to storage
   */
  private saveAnalyticsData(): void {
    try {
      localStorage.setItem('knowledge-graph-analytics', JSON.stringify(this.analyticsData));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  /**
   * Add action to history for undo functionality
   */
  private addToHistory(action: HistoryAction): void {
    const settings = this.getSettings();
    const maxHistory = Number(settings['max-history']) || 50;

    this.actionHistory.push(action);

    // Trim history if it exceeds max
    if (this.actionHistory.length > maxHistory) {
      this.actionHistory = this.actionHistory.slice(-maxHistory);
    }
  }

  /**
   * Update analytics when connection is added
   */
  private trackConnection(): void {
    const today = new Date().toISOString().split('T')[0];

    this.analyticsData.totalConnections++;
    this.analyticsData.connectionsByDate[today] =
      (this.analyticsData.connectionsByDate[today] || 0) + 1;

    this.calculateAverages();
    this.saveAnalyticsData();
  }

  /**
   * Update analytics when MOC is created
   */
  private trackMOC(name: string): void {
    const today = new Date().toISOString().split('T')[0];

    this.analyticsData.totalMOCs++;
    this.analyticsData.mocsByDate[today] = (this.analyticsData.mocsByDate[today] || 0) + 1;

    // Initialize MOC effectiveness tracking
    this.analyticsData.mocEffectiveness.push({
      name,
      accessCount: 0,
      linkCount: 0,
    });

    this.calculateAverages();
    this.saveAnalyticsData();
  }

  /**
   * Calculate average statistics
   */
  private calculateAverages(): void {
    const dates = Object.keys(this.analyticsData.connectionsByDate);
    if (dates.length === 0) {
      this.analyticsData.avgConnectionsPerDay = 0;
      this.analyticsData.graphGrowthRate = 0;
      return;
    }

    const totalDays = dates.length;
    this.analyticsData.avgConnectionsPerDay = this.analyticsData.totalConnections / totalDays;

    // Calculate growth rate (connections in last 7 days vs previous 7 days)
    const today = new Date();
    const lastWeek: number[] = [];
    const previousWeek: number[] = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = this.analyticsData.connectionsByDate[dateStr] || 0;

      if (i < 7) {
        lastWeek.push(count);
      } else {
        previousWeek.push(count);
      }
    }

    const lastWeekTotal = lastWeek.reduce((a, b) => a + b, 0);
    const previousWeekTotal = previousWeek.reduce((a, b) => a + b, 0);

    if (previousWeekTotal > 0) {
      this.analyticsData.graphGrowthRate =
        ((lastWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
    }
  }

  /**
   * Undo the last applied action
   */
  async undoLastAction(): Promise<void> {
    if (this.actionHistory.length === 0) {
      this.showNotification('No actions to undo', 'warning');
      return;
    }

    const lastAction = this.actionHistory.pop()!;

    try {
      switch (lastAction.type) {
        case 'connection':
          await this.undoConnection(lastAction);
          break;
        case 'moc':
          await this.undoMOC(lastAction);
          break;
        case 'batch-connections':
          await this.undoBatchConnections(lastAction);
          break;
        case 'batch-mocs':
          await this.undoBatchMOCs(lastAction);
          break;
      }

      this.showNotification('Action undone successfully', 'info');
    } catch (error) {
      console.error('Failed to undo action:', error);
      this.showNotification('Failed to undo action', 'error');
      // Re-add to history if undo failed
      this.actionHistory.push(lastAction);
    }
  }

  /**
   * Undo a single connection
   */
  private async undoConnection(action: HistoryAction): Promise<void> {
    const { sourceId, previousContent } = action.data;
    if (!sourceId || !previousContent) return;

    const note = this.api.notes.get(sourceId);
    if (note) {
      await this.api.notes.update(sourceId, { content: previousContent });

      // Update analytics
      this.analyticsData.totalConnections--;
      this.saveAnalyticsData();

      // Emit graph update event
      this.api.events.emit('knowledgeGraphUpdate', {
        action: 'link-removed',
        sourceId,
      });
    }
  }

  /**
   * Undo a MOC creation
   */
  private async undoMOC(action: HistoryAction): Promise<void> {
    const { mocName } = action.data;
    if (!mocName) return;

    // Find and delete the MOC note
    const allNotes = this.api.notes.getAll();
    const mocNote = allNotes.find(n => n.name === mocName);

    if (mocNote) {
      await this.api.notes.delete(mocNote.id);

      // Update analytics
      this.analyticsData.totalMOCs--;
      this.analyticsData.mocEffectiveness = this.analyticsData.mocEffectiveness.filter(
        m => m.name !== mocName
      );
      this.saveAnalyticsData();

      // Emit graph update event
      this.api.events.emit('knowledgeGraphUpdate', {
        action: 'moc-deleted',
        mocTitle: mocName,
      });
    }
  }

  /**
   * Undo batch connections
   */
  private async undoBatchConnections(action: HistoryAction): Promise<void> {
    const { connections } = action.data;
    if (!connections) return;

    for (const conn of connections) {
      // This is simplified - in production, store previous content for each
      const note = this.api.notes.get(conn.sourceId);
      if (note) {
        // Remove the link from content (simplified approach)
        const targetNote = this.api.notes.get(conn.targetId);
        if (targetNote) {
          const linkPattern = new RegExp(
            `\\[\\[${targetNote.name.replace('.md', '')}\\]\\][^\\n]*\\n?`,
            'g'
          );
          const updatedContent = note.content.replace(linkPattern, '');
          await this.api.notes.update(conn.sourceId, { content: updatedContent });
        }
      }
    }

    this.analyticsData.totalConnections -= connections.length;
    this.saveAnalyticsData();
  }

  /**
   * Undo batch MOCs
   */
  private async undoBatchMOCs(action: HistoryAction): Promise<void> {
    const { mocs } = action.data;
    if (!mocs) return;

    const allNotes = this.api.notes.getAll();
    for (const moc of mocs) {
      const mocNote = allNotes.find(n => n.name === moc.name);
      if (mocNote) {
        await this.api.notes.delete(mocNote.id);
      }
    }

    this.analyticsData.totalMOCs -= mocs.length;
    this.saveAnalyticsData();
  }

  /**
   * Show analytics dashboard
   */
  async showAnalyticsDashboard(): Promise<void> {
    const settings = this.getSettings();
    const showAnalytics = settings['show-analytics'] !== false;

    if (!showAnalytics) {
      this.showNotification('Analytics dashboard is disabled in settings', 'warning');
      return;
    }

    // Update most connected notes
    await this.updateMostConnectedNotes();

    const useModernUI = settings['use-modern-ui'] !== false;

    if (useModernUI) {
      // Emit event for modern UI component to display
      this.api.events.emit('showAnalyticsDashboard', {
        analytics: this.analyticsData,
      });
    } else {
      // Fallback to text report
      const report = this.generateAnalyticsReport();
      console.log(report);
      alert('Analytics Dashboard\n\nSee console for full report');
    }
  }

  /**
   * Update most connected notes list
   */
  private async updateMostConnectedNotes(): Promise<void> {
    if (!this.api.graph) return;

    const allLinks = this.api.graph.getAllLinks();
    const connectionCounts: Record<string, number> = {};

    allLinks.forEach(link => {
      connectionCounts[link.source] = (connectionCounts[link.source] || 0) + 1;
      connectionCounts[link.target] = (connectionCounts[link.target] || 0) + 1;
    });

    this.analyticsData.mostConnectedNotes = Object.entries(connectionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id, count]) => {
        const note = this.api.notes.get(id);
        return {
          id,
          name: note?.name || id,
          count,
        };
      });
  }

  /**
   * Generate analytics report text
   */
  private generateAnalyticsReport(): string {
    const report = `# 📊 Knowledge Graph Analytics Dashboard

*Generated on ${new Date().toLocaleString()}*

## Overall Statistics

| Metric | Value |
|--------|-------|
| Total Connections Made | ${this.analyticsData.totalConnections} |
| Total MOCs Created | ${this.analyticsData.totalMOCs} |
| Avg Connections/Day | ${this.analyticsData.avgConnectionsPerDay.toFixed(1)} |
| Growth Rate (7d) | ${this.analyticsData.graphGrowthRate >= 0 ? '+' : ''}${this.analyticsData.graphGrowthRate.toFixed(1)}% |

## Most Connected Notes

${
  this.analyticsData.mostConnectedNotes.length > 0
    ? this.analyticsData.mostConnectedNotes
        .map((note, i) => `${i + 1}. **${note.name}** - ${note.count} connections`)
        .join('\n')
    : '- No data available yet'
}

## MOC Effectiveness

${
  this.analyticsData.mocEffectiveness.length > 0
    ? this.analyticsData.mocEffectiveness
        .slice(0, 10)
        .map(
          (moc, i) =>
            `${i + 1}. **${moc.name}** - ${moc.linkCount} links, ${moc.accessCount} accesses`
        )
        .join('\n')
    : '- No MOCs created yet'
}

## Activity Timeline (Last 7 Days)

${this.getRecentActivityText()}

---

*Analytics tracked by Knowledge Graph Auto-Mapper v3.0*
`;

    return report;
  }

  /**
   * Get recent activity text
   */
  private getRecentActivityText(): string {
    const today = new Date();
    const activity: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const connections = this.analyticsData.connectionsByDate[dateStr] || 0;
      const mocs = this.analyticsData.mocsByDate[dateStr] || 0;

      if (connections > 0 || mocs > 0) {
        activity.push(`- ${dateStr}: ${connections} connections, ${mocs} MOCs`);
      }
    }

    return activity.length > 0 ? activity.join('\n') : '- No recent activity';
  }

  /**
   * Export suggestions to file
   */
  async exportSuggestions(): Promise<void> {
    if (this.pendingSuggestions.length === 0) {
      this.showNotification('No suggestions to export. Run an analysis first.', 'warning');
      return;
    }

    const settings = this.getSettings();
    const format = (settings['export-format'] as string) || 'json';

    let content: string;
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        content = this.exportToCSV();
        filename = `graph-suggestions-${timestamp}.csv`;
        break;
      case 'markdown':
        content = this.exportToMarkdown();
        filename = `graph-suggestions-${timestamp}.md`;
        break;
      case 'json':
      default:
        content = JSON.stringify(this.pendingSuggestions, null, 2);
        filename = `graph-suggestions-${timestamp}.json`;
        break;
    }

    try {
      // Create a blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification(`Exported suggestions as ${filename}`, 'info');
    } catch (error) {
      console.error('Failed to export suggestions:', error);
      this.showNotification('Failed to export suggestions', 'error');
    }
  }

  /**
   * Export suggestions to CSV format
   */
  private exportToCSV(): string {
    let csv = 'Type,Source,Target,Reason,Confidence,Priority\n';

    this.pendingSuggestions.forEach(sug => {
      if (sug.type === 'connection') {
        const conn = sug.data;
        const sourceNote = this.api.notes.get(conn.source);
        const targetNote = this.api.notes.get(conn.target);
        csv += `connection,"${sourceNote?.name || conn.source}","${targetNote?.name || conn.target}","${conn.reason}",${conn.similarity || 0},\n`;
      } else if (sug.type === 'moc') {
        const moc = sug.data;
        csv += `moc,"${moc.suggestedTitle}","${moc.noteIds.length} notes","${moc.reason}",,${moc.priority}\n`;
      }
    });

    return csv;
  }

  /**
   * Export suggestions to Markdown format
   */
  private exportToMarkdown(): string {
    let md = `# Knowledge Graph Suggestions Export\n\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n`;

    const connections = this.pendingSuggestions.filter(s => s.type === 'connection');
    const mocs = this.pendingSuggestions.filter(s => s.type === 'moc');

    if (connections.length > 0) {
      md += `## Connection Suggestions (${connections.length})\n\n`;
      connections.forEach((sug, i) => {
        const conn = sug.data;
        const sourceNote = this.api.notes.get(conn.source);
        const targetNote = this.api.notes.get(conn.target);
        md += `${i + 1}. **${sourceNote?.name}** ↔ **${targetNote?.name}**\n`;
        md += `   - Confidence: ${((conn.similarity || 0) * 100).toFixed(0)}%\n`;
        md += `   - Reason: ${conn.reason}\n\n`;
      });
    }

    if (mocs.length > 0) {
      md += `## MOC Suggestions (${mocs.length})\n\n`;
      mocs.forEach((sug, i) => {
        const moc = sug.data;
        md += `${i + 1}. **${moc.suggestedTitle}** [${moc.priority} priority]\n`;
        md += `   - Notes: ${moc.clusterNotes?.slice(0, 5).join(', ')}${moc.clusterNotes?.length > 5 ? '...' : ''}\n`;
        md += `   - Reason: ${moc.reason}\n\n`;
      });
    }

    return md;
  }

  /**
   * Import suggestions from file
   */
  async importSuggestions(): Promise<void> {
    this.showNotification('Import functionality requires file picker dialog', 'info');
    // In a real implementation, this would open a file picker and parse the file
    // For now, just show a message
    alert(
      'To import suggestions:\n\n1. Use the browser file picker to select a JSON export file\n2. The suggestions will be loaded into the pending queue\n3. You can then review and apply them\n\nThis feature requires additional UI implementation.'
    );
  }
}
