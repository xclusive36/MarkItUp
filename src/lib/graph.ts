import { Note, Link, Graph, GraphNode, GraphEdge } from './types';
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
      this.links.set(id, linkArray.filter(link => link.target !== noteId));
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
          anchorText: parsedLink.displayText
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
            anchorText: tag
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
      note => note.name.toLowerCase() === noteName.toLowerCase() ||
               note.name.toLowerCase().replace(/\.md$/, '') === noteName.toLowerCase()
    );
    if (exactMatch) return exactMatch.id;

    // Try alias match
    for (const note of this.notes.values()) {
      const parsed = MarkdownParser.parseNote(note.content);
      if (parsed.frontmatter.aliases?.some(alias => 
        alias.toLowerCase() === noteName.toLowerCase()
      )) {
        return note.id;
      }
    }

    // Try partial match
    const partialMatch = Array.from(this.notes.values()).find(
      note => note.name.toLowerCase().includes(noteName.toLowerCase())
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
      minConnections = 0
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

      nodes = nodes.filter(node => 
        includeOrphans || (connectionCounts.get(node.id) || 0) >= minConnections
      );
      
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    }

    return { nodes, edges };
  }

  // Get nodes connected to a center node within max distance
  private getConnectedNodes(centerNodeId: string, maxDistance: number): Set<string> {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; distance: number }> = [{ nodeId: centerNodeId, distance: 0 }];
    
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
        tags: note.tags
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
            weight: link.type === 'wikilink' ? 3 : link.type === 'tag' ? 2 : 1
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
    for (const [sourceId, linkArray] of this.links) {
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
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get color from hash
  private getColorFromHash(hash: number): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    return colors[hash % colors.length];
  }

  // Find shortest path between two notes
  findPath(startNodeId: string, endNodeId: string): string[] | null {
    if (startNodeId === endNodeId) return [startNodeId];
    
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: startNodeId, path: [startNodeId] }
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
            path: [...path, link.target]
          });
        }
      }
      
      // Also check backlinks
      const backlinks = this.getBacklinks(nodeId);
      for (const backlink of backlinks) {
        if (!visited.has(backlink.source)) {
          queue.push({
            nodeId: backlink.source,
            path: [...path, backlink.source]
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
      (sum, links) => sum + links.length, 0
    );
    
    const connectionCounts = new Map<string, number>();
    for (const [nodeId, links] of this.links) {
      connectionCounts.set(nodeId, links.length + this.getBacklinkCount(nodeId));
    }
    
    const connections = Array.from(connectionCounts.values());
    const avgConnections = connections.length > 0 ? 
      connections.reduce((sum, count) => sum + count, 0) / connections.length : 0;
    
    const maxConnections = Math.max(...connections, 0);
    const orphanCount = Array.from(this.notes.keys())
      .filter(id => (connectionCounts.get(id) || 0) === 0).length;
    
    return {
      totalNotes,
      totalLinks,
      avgConnections: Math.round(avgConnections * 10) / 10,
      maxConnections,
      orphanCount
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
