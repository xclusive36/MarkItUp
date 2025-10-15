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
  version: '1.0.0',
  description:
    'AI-powered knowledge graph enhancement that discovers hidden connections, suggests structure, and organizes your notes. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
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
 * Knowledge Graph Auto-Mapper Plugin Implementation
 */
class KnowledgeGraphAutoMapperPlugin {
  private api: PluginAPI;

  constructor(api: PluginAPI) {
    this.api = api;
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

      // Display discoveries
      this.displayConnectionDiscoveries(connections);

      this.showNotification(`Discovered ${connections.length} potential connections!`, 'info');
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

      // Display MOC suggestions
      this.displayMOCSuggestions(mocSuggestions);

      this.showNotification(`Found ${mocSuggestions.length} MOC opportunity(ies)`, 'info');
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
      const healthReport = `
📊 Knowledge Graph Health Report
═════════════════════════════════

📝 Total Notes: ${totalNotes}
🔗 Total Links: ${totalLinks}
🏷️  Total Tags: ${allTags.length}
📊 Avg Connections per Note: ${avgConnectionsPerNote.toFixed(1)}

🏝️  Orphan Notes: ${orphanCount} (${((orphanCount / totalNotes) * 100).toFixed(1)}%)
🌟 Hub Notes: ${hubNotes.length}
${hubNotes
  .map(([id, count]) => {
    const note = this.api.notes.get(id);
    return `   - ${note?.name || id}: ${count} connections`;
  })
  .join('\n')}

🗂️  Clusters: ${clusters.length}
${clusters
  .slice(0, 5)
  .map((c, i) => `   ${i + 1}. ${c.noteIds.length} notes`)
  .join('\n')}

💡 Health Score: ${this.calculateHealthScore(totalNotes, totalLinks, orphanCount)}%

Recommendations:
${orphanCount > totalNotes * 0.2 ? '⚠️  High orphan count - run "Connect Orphan Notes"' : '✅ Orphan count looks good'}
${clusters.length > 5 ? '💡 Consider creating MOCs for large clusters' : '✅ Cluster count is healthy'}
${avgConnectionsPerNote < 2 ? '⚠️  Low connectivity - consider adding more links' : '✅ Good connectivity'}
      `.trim();

      console.log(healthReport);
      this.showNotification('Health check complete. See console for full report.', 'info');

      alert(healthReport);
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
}
