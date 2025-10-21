import {
  Note,
  Link,
  Graph,
  GraphNode,
  GraphEdge,
  GraphCluster,
  CoverageGap,
  TemporalAnalysis,
  BridgeNote,
  GraphHealthMetrics,
} from './types';
import { MarkdownParser } from './parser';

export class GraphBuilder {
  private notes: Map<string, Note> = new Map();
  private links: Map<string, Link[]> = new Map();

  // Add note to graph
  addNote(note: Note): void {
    this.notes.set(note.id, note);
    this.updateNoteLinks(note);
  }

  // Remove note from graph
  removeNote(noteId: string): void {
    // Remove all links involving this note
    this.links.delete(noteId);

    // Remove links from other notes to this note
    for (const [id, linkArray] of this.links) {
      this.links.set(
        id,
        linkArray.filter(link => link.target !== noteId)
      );
    }

    this.notes.delete(noteId);
  }

  // Update note and its links
  updateNote(note: Note): void {
    this.notes.set(note.id, note);
    this.updateNoteLinks(note);
  }

  // Update links for a specific note
  private updateNoteLinks(note: Note): void {
    const parsed = MarkdownParser.parseNote(note.content);
    const links: Link[] = [];

    // Process wikilinks and markdown links
    for (const parsedLink of parsed.links) {
      const targetNoteId = this.resolveNoteId(parsedLink.target);
      if (targetNoteId) {
        links.push({
          id: `${note.id}->${targetNoteId}`,
          source: note.id,
          target: targetNoteId,
          type: parsedLink.type === 'wikilink' ? 'wikilink' : 'backlink',
          anchorText: parsedLink.displayText,
        });
      }
    }

    // Process tag links
    for (const tag of parsed.tags) {
      const taggedNotes = this.findNotesByTag(tag);
      for (const taggedNoteId of taggedNotes) {
        if (taggedNoteId !== note.id) {
          links.push({
            id: `${note.id}-tag-${taggedNoteId}`,
            source: note.id,
            target: taggedNoteId,
            type: 'tag',
            anchorText: tag,
          });
        }
      }
    }

    this.links.set(note.id, links);
  }

  // Resolve note name to note ID
  private resolveNoteId(noteName: string): string | null {
    // Try exact match first
    const exactMatch = Array.from(this.notes.values()).find(
      note =>
        note.name.toLowerCase() === noteName.toLowerCase() ||
        note.name.toLowerCase().replace(/\.md$/, '') === noteName.toLowerCase()
    );
    if (exactMatch) return exactMatch.id;

    // Try alias match
    for (const note of this.notes.values()) {
      const parsed = MarkdownParser.parseNote(note.content);
      if (
        parsed.frontmatter.aliases?.some(alias => alias.toLowerCase() === noteName.toLowerCase())
      ) {
        return note.id;
      }
    }

    // Try partial match
    const partialMatch = Array.from(this.notes.values()).find(note =>
      note.name.toLowerCase().includes(noteName.toLowerCase())
    );
    if (partialMatch) return partialMatch.id;

    return null;
  }

  // Find notes by tag
  private findNotesByTag(tag: string): string[] {
    const noteIds: string[] = [];
    for (const note of this.notes.values()) {
      if (note.tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        noteIds.push(note.id);
      }
    }
    return noteIds;
  }

  // Build complete graph
  buildGraph(options: GraphOptions = {}): Graph {
    const {
      includeOrphans = true,
      maxNodes = 1000,
      centerNode = null,
      maxDistance = 3,
      minConnections = 0,
    } = options;

    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];

    // If centering on a specific node, use BFS to find connected nodes
    if (centerNode) {
      const connected = this.getConnectedNodes(centerNode, maxDistance);
      nodes = this.buildNodes(Array.from(connected));
      edges = this.buildEdges(nodes.map(n => n.id));
    } else {
      // Build full graph
      const allNodeIds = Array.from(this.notes.keys()).slice(0, maxNodes);
      nodes = this.buildNodes(allNodeIds);
      edges = this.buildEdges(allNodeIds);
    }

    // Filter out nodes with too few connections if specified
    if (minConnections > 0) {
      const connectionCounts = new Map<string, number>();
      edges.forEach(edge => {
        connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
        connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
      });

      nodes = nodes.filter(
        node => includeOrphans || (connectionCounts.get(node.id) || 0) >= minConnections
      );

      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    }

    return { nodes, edges };
  }

  // Get nodes connected to a center node within max distance
  private getConnectedNodes(centerNodeId: string, maxDistance: number): Set<string> {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; distance: number }> = [
      { nodeId: centerNodeId, distance: 0 },
    ];

    while (queue.length > 0) {
      const { nodeId, distance } = queue.shift()!;

      if (visited.has(nodeId) || distance > maxDistance) continue;
      visited.add(nodeId);

      // Add connected nodes
      const nodeLinks = this.links.get(nodeId) || [];
      for (const link of nodeLinks) {
        if (!visited.has(link.target)) {
          queue.push({ nodeId: link.target, distance: distance + 1 });
        }
      }

      // Also add nodes that link TO this node (backlinks)
      for (const [sourceId, linkArray] of this.links) {
        if (linkArray.some(link => link.target === nodeId) && !visited.has(sourceId)) {
          queue.push({ nodeId: sourceId, distance: distance + 1 });
        }
      }
    }

    return visited;
  }

  // Build node array
  private buildNodes(nodeIds: string[]): GraphNode[] {
    const nodes: GraphNode[] = [];

    for (const nodeId of nodeIds) {
      const note = this.notes.get(nodeId);
      if (!note) continue;

      const linkCount = (this.links.get(nodeId) || []).length;
      const backLinkCount = this.getBacklinkCount(nodeId);
      const totalConnections = linkCount + backLinkCount;

      nodes.push({
        id: nodeId,
        name: note.name,
        group: note.folder || 'root',
        size: Math.max(5, Math.min(50, totalConnections * 3 + note.wordCount / 100)),
        color: this.getNodeColor(note),
        tags: note.tags,
      });
    }

    return nodes;
  }

  // Build edge array
  private buildEdges(nodeIds: string[]): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const nodeIdSet = new Set(nodeIds);

    for (const nodeId of nodeIds) {
      const nodeLinks = this.links.get(nodeId) || [];

      for (const link of nodeLinks) {
        // Only include edges between nodes in our set
        if (nodeIdSet.has(link.target)) {
          edges.push({
            source: link.source,
            target: link.target,
            type: link.type === 'tag' ? 'tag' : 'link',
            weight: link.type === 'wikilink' ? 3 : link.type === 'tag' ? 2 : 1,
          });
        }
      }
    }

    return edges;
  }

  // Get count of notes that link to this note
  private getBacklinkCount(noteId: string): number {
    let count = 0;
    for (const linkArray of this.links.values()) {
      count += linkArray.filter(link => link.target === noteId).length;
    }
    return count;
  }

  // Get backlinks for a note
  getBacklinks(noteId: string): Link[] {
    const backlinks: Link[] = [];
    for (const linkArray of this.links.values()) {
      for (const link of linkArray) {
        if (link.target === noteId) {
          backlinks.push(link);
        }
      }
    }
    return backlinks;
  }

  // Get outgoing links for a note
  getOutgoingLinks(noteId: string): Link[] {
    return this.links.get(noteId) || [];
  }

  // Get node color based on note properties
  private getNodeColor(note: Note): string {
    // Color by folder
    if (note.folder) {
      const folderHash = this.hashString(note.folder);
      return this.getColorFromHash(folderHash);
    }

    // Color by primary tag
    if (note.tags.length > 0) {
      const tagHash = this.hashString(note.tags[0]);
      return this.getColorFromHash(tagHash);
    }

    // Default color
    return '#6366f1'; // Indigo
  }

  // Simple hash function for consistent colors
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get color from hash
  private getColorFromHash(hash: number): string {
    const colors = [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#eab308',
      '#84cc16',
      '#22c55e',
      '#10b981',
      '#14b8a6',
      '#06b6d4',
      '#0ea5e9',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
      '#f43f5e',
    ];
    return colors[hash % colors.length];
  }

  // Find shortest path between two notes
  findPath(startNodeId: string, endNodeId: string): string[] | null {
    if (startNodeId === endNodeId) return [startNodeId];

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: startNodeId, path: [startNodeId] },
    ];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Check if we reached the target
      if (nodeId === endNodeId) return path;

      // Add connected nodes
      const nodeLinks = this.links.get(nodeId) || [];
      for (const link of nodeLinks) {
        if (!visited.has(link.target)) {
          queue.push({
            nodeId: link.target,
            path: [...path, link.target],
          });
        }
      }

      // Also check backlinks
      const backlinks = this.getBacklinks(nodeId);
      for (const backlink of backlinks) {
        if (!visited.has(backlink.source)) {
          queue.push({
            nodeId: backlink.source,
            path: [...path, backlink.source],
          });
        }
      }
    }

    return null; // No path found
  }

  // Get graph statistics
  getStats(): GraphStats {
    const totalNotes = this.notes.size;
    const totalLinks = Array.from(this.links.values()).reduce(
      (sum, links) => sum + links.length,
      0
    );

    const connectionCounts = new Map<string, number>();
    for (const [nodeId, links] of this.links) {
      connectionCounts.set(nodeId, links.length + this.getBacklinkCount(nodeId));
    }

    const connections = Array.from(connectionCounts.values());
    const avgConnections =
      connections.length > 0
        ? connections.reduce((sum, count) => sum + count, 0) / connections.length
        : 0;

    const maxConnections = Math.max(...connections, 0);
    const orphanCount = Array.from(this.notes.keys()).filter(
      id => (connectionCounts.get(id) || 0) === 0
    ).length;

    return {
      totalNotes,
      totalLinks,
      avgConnections: Math.round(avgConnections * 10) / 10,
      maxConnections,
      orphanCount,
    };
  }

  // Get connection strength between two nodes
  getConnectionStrength(sourceId: string, targetId: string): number {
    const directLinks = (this.links.get(sourceId) || []).filter(
      link => link.target === targetId
    ).length;
    const reverseLinks = (this.links.get(targetId) || []).filter(
      link => link.target === sourceId
    ).length;

    // Calculate shared tags
    const sourceNote = this.notes.get(sourceId);
    const targetNote = this.notes.get(targetId);
    const sharedTags =
      sourceNote && targetNote
        ? sourceNote.tags.filter(tag => targetNote.tags.includes(tag)).length
        : 0;

    return directLinks * 3 + reverseLinks * 3 + sharedTags * 1;
  }

  // Detect clusters using community detection algorithm
  detectClusters(minSize: number = 3): GraphCluster[] {
    const visited = new Set<string>();
    const clusters: GraphCluster[] = [];

    for (const nodeId of this.notes.keys()) {
      if (visited.has(nodeId)) continue;

      // BFS to find connected component
      const cluster = new Set<string>();
      const queue = [nodeId];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;

        visited.add(current);
        cluster.add(current);

        // Add connected nodes
        const links = this.links.get(current) || [];
        links.forEach(link => {
          if (!visited.has(link.target)) {
            queue.push(link.target);
          }
        });

        // Add backlinks
        this.getBacklinks(current).forEach(backlink => {
          if (!visited.has(backlink.source)) {
            queue.push(backlink.source);
          }
        });
      }

      if (cluster.size >= minSize) {
        const nodes = Array.from(cluster);
        const clusterNotes = nodes.map(id => this.notes.get(id)!).filter(Boolean);

        // Calculate cluster density
        let internalLinks = 0;
        nodes.forEach(nodeId => {
          const nodeLinks = this.links.get(nodeId) || [];
          internalLinks += nodeLinks.filter(link => cluster.has(link.target)).length;
        });

        const density = (internalLinks * 2) / (cluster.size * (cluster.size - 1));

        // Generate cluster label from common tags or folder
        const allTags = clusterNotes.flatMap(note => note.tags);
        const tagCounts = new Map<string, number>();
        allTags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));

        const mostCommonTag = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])[0];

        const label = mostCommonTag
          ? mostCommonTag[0]
          : clusterNotes[0].folder || `Cluster ${clusters.length + 1}`;

        clusters.push({
          id: `cluster-${clusters.length}`,
          label,
          nodes,
          density,
          size: cluster.size,
        });
      }
    }

    return clusters;
  }

  // Find coverage gaps (unconnected topic areas)
  findCoverageGaps(): CoverageGap[] {
    const gaps: CoverageGap[] = [];
    const allTags = new Set<string>();
    const allFolders = new Set<string>();

    // Collect all tags and folders
    for (const note of this.notes.values()) {
      note.tags.forEach(tag => allTags.add(tag));
      if (note.folder) allFolders.add(note.folder);
    }

    // Find orphaned tags (tags with only 1 note)
    const tagCounts = new Map<string, number>();
    for (const note of this.notes.values()) {
      note.tags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
    }

    tagCounts.forEach((count, tag) => {
      if (count === 1) {
        gaps.push({
          type: 'isolated-tag',
          identifier: tag,
          suggestions: [
            `Create more notes tagged with #${tag}`,
            `Link the existing note to related topics`,
          ],
        });
      }
    });

    // Find folders with no cross-folder links
    const folderConnections = new Map<string, Set<string>>();
    for (const [nodeId, links] of this.links) {
      const sourceNote = this.notes.get(nodeId);
      if (!sourceNote?.folder) continue;

      links.forEach(link => {
        const targetNote = this.notes.get(link.target);
        if (targetNote?.folder && targetNote.folder !== sourceNote.folder) {
          if (!folderConnections.has(sourceNote.folder!)) {
            folderConnections.set(sourceNote.folder!, new Set());
          }
          folderConnections.get(sourceNote.folder!)!.add(targetNote.folder);
        }
      });
    }

    allFolders.forEach(folder => {
      if (!folderConnections.has(folder)) {
        gaps.push({
          type: 'isolated-folder',
          identifier: folder,
          suggestions: [
            `Create links from "${folder}" to other topic areas`,
            `Consider if this folder should be merged with another`,
          ],
        });
      }
    });

    return gaps;
  }

  // Get temporal analysis (when notes were created and linked)
  getTemporalAnalysis(): TemporalAnalysis {
    const notesByDate = new Map<string, number>();
    const linksByDate = new Map<string, number>();

    for (const note of this.notes.values()) {
      const date = new Date(note.createdAt).toISOString().split('T')[0];
      notesByDate.set(date, (notesByDate.get(date) || 0) + 1);
    }

    // Approximate link creation dates from note dates
    for (const [nodeId, links] of this.links) {
      const sourceNote = this.notes.get(nodeId);
      if (!sourceNote) continue;

      const date = new Date(sourceNote.updatedAt || sourceNote.createdAt)
        .toISOString()
        .split('T')[0];
      linksByDate.set(date, (linksByDate.get(date) || 0) + links.length);
    }

    return {
      notesByDate: Object.fromEntries(notesByDate),
      linksByDate: Object.fromEntries(linksByDate),
      totalDays: notesByDate.size,
      avgNotesPerDay:
        Array.from(notesByDate.values()).reduce((a, b) => a + b, 0) / notesByDate.size,
      avgLinksPerDay:
        Array.from(linksByDate.values()).reduce((a, b) => a + b, 0) / linksByDate.size,
    };
  }

  // Get local graph (nodes within N steps of a center node)
  getLocalGraph(centerNodeId: string, depth: number = 2): Graph {
    const connectedNodes = this.getConnectedNodes(centerNodeId, depth);
    const nodeIds = Array.from(connectedNodes);

    return {
      nodes: this.buildNodes(nodeIds),
      edges: this.buildEdges(nodeIds),
    };
  }

  // Find bridge notes (notes connecting different clusters)
  findBridgeNotes(clusters: GraphCluster[]): BridgeNote[] {
    const bridges: BridgeNote[] = [];
    const clusterMap = new Map<string, string>();

    // Map each note to its cluster
    clusters.forEach(cluster => {
      cluster.nodes.forEach((nodeId: string) => clusterMap.set(nodeId, cluster.id));
    });

    // Find notes that connect to multiple clusters
    for (const [nodeId, links] of this.links) {
      const sourceCluster = clusterMap.get(nodeId);
      if (!sourceCluster) continue;

      const connectedClusters = new Set<string>();
      links.forEach(link => {
        const targetCluster = clusterMap.get(link.target);
        if (targetCluster && targetCluster !== sourceCluster) {
          connectedClusters.add(targetCluster);
        }
      });

      if (connectedClusters.size >= 2) {
        const note = this.notes.get(nodeId);
        if (note) {
          bridges.push({
            noteId: nodeId,
            noteName: note.name,
            connectsClusters: Array.from(connectedClusters),
            bridgeStrength: connectedClusters.size,
          });
        }
      }
    }

    return bridges.sort((a, b) => b.bridgeStrength - a.bridgeStrength);
  }

  // Calculate graph health metrics
  getHealthMetrics(): GraphHealthMetrics {
    const stats = this.getStats();
    const clusters = this.detectClusters();
    const gaps = this.findCoverageGaps();

    // Calculate health score (0-100)
    let healthScore = 0;

    // Connectivity (40 points max)
    const connectivityRatio = (stats.totalNotes - stats.orphanCount) / stats.totalNotes;
    healthScore += connectivityRatio * 40;

    // Average connections (30 points max)
    const avgConnectionScore = Math.min(stats.avgConnections / 5, 1) * 30;
    healthScore += avgConnectionScore;

    // Clustering (20 points max)
    const clusterScore = Math.min(clusters.length / 10, 1) * 20;
    healthScore += clusterScore;

    // Low gaps (10 points max)
    const gapScore = Math.max(0, 1 - gaps.length / 20) * 10;
    healthScore += gapScore;

    return {
      healthScore: Math.round(healthScore),
      connectivity: Math.round(connectivityRatio * 100),
      avgConnections: stats.avgConnections,
      clusterCount: clusters.length,
      gapCount: gaps.length,
      orphanCount: stats.orphanCount,
    };
  }

  // Rebuild entire graph from notes
  rebuildGraph(notes: Note[]): void {
    this.notes.clear();
    this.links.clear();

    // First pass: add all notes
    notes.forEach(note => this.notes.set(note.id, note));

    // Second pass: build links
    notes.forEach(note => this.updateNoteLinks(note));
  }
}

interface GraphOptions {
  includeOrphans?: boolean;
  maxNodes?: number;
  centerNode?: string | null;
  maxDistance?: number;
  minConnections?: number;
}

interface GraphStats {
  totalNotes: number;
  totalLinks: number;
  avgConnections: number;
  maxConnections: number;
  orphanCount: number;
}
