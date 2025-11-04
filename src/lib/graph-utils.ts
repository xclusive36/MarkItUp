/**
 * Graph Utilities for Enhanced Knowledge Graph Features
 * Performance-optimized helper functions for graph operations
 */

import { Graph, GraphFilters, Note } from './types';

/**
 * Filter graph based on multiple criteria
 */
export function filterGraph(graph: Graph, filters: GraphFilters, notes: Map<string, Note>): Graph {
  let filteredNodes = [...graph.nodes];
  let filteredEdges = [...graph.edges];

  // Filter by date range
  if (filters.dateRange) {
    const [startDate, endDate] = filters.dateRange;
    filteredNodes = filteredNodes.filter(node => {
      const note = notes.get(node.id);
      if (!note) return false;
      const noteDate = new Date(note.createdAt);
      return noteDate >= startDate && noteDate <= endDate;
    });
  }

  // Filter by folders
  if (filters.folders && filters.folders.length > 0) {
    filteredNodes = filteredNodes.filter(node => {
      const note = notes.get(node.id);
      return note && filters.folders!.includes(note.folder || '');
    });
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filteredNodes = filteredNodes.filter(node => {
      const note = notes.get(node.id);
      return note && note.tags.some(tag => filters.tags!.includes(tag));
    });
  }

  // Filter by minimum connections
  if (filters.minConnections !== undefined) {
    const connectionCounts = new Map<string, number>();
    filteredEdges.forEach(edge => {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
      connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
    });

    filteredNodes = filteredNodes.filter(node => {
      return (connectionCounts.get(node.id) || 0) >= filters.minConnections!;
    });
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredNodes = filteredNodes.filter(node => {
      const note = notes.get(node.id);
      return (
        node.name.toLowerCase().includes(query) ||
        (note && note.content.toLowerCase().includes(query)) ||
        node.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }

  // Limit max nodes
  if (filters.maxNodes && filteredNodes.length > filters.maxNodes) {
    // Keep the most connected nodes
    const connectionCounts = new Map<string, number>();
    filteredEdges.forEach(edge => {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
      connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
    });

    filteredNodes = filteredNodes
      .sort((a, b) => (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0))
      .slice(0, filters.maxNodes);
  }

  // Filter edges to only include nodes that remain
  const nodeIds = new Set(filteredNodes.map(n => n.id));
  filteredEdges = filteredEdges.filter(
    edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}

/**
 * Calculate connection strength heatmap data
 */
export function calculateConnectionHeatmap(graph: Graph): Map<string, Map<string, number>> {
  const heatmap = new Map<string, Map<string, number>>();

  // Initialize heatmap for all nodes
  graph.nodes.forEach(node => {
    heatmap.set(node.id, new Map<string, number>());
  });

  // Calculate connection strengths
  graph.edges.forEach(edge => {
    const sourceMap = heatmap.get(edge.source);
    const targetMap = heatmap.get(edge.target);

    if (sourceMap) {
      sourceMap.set(edge.target, (sourceMap.get(edge.target) || 0) + edge.weight);
    }
    if (targetMap) {
      targetMap.set(edge.source, (targetMap.get(edge.source) || 0) + edge.weight);
    }
  });

  return heatmap;
}

/**
 * Find shortest path between two nodes using BFS
 */
export function findShortestPath(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): string[] | null {
  if (startNodeId === endNodeId) return [startNodeId];

  // Build adjacency list
  const adjacency = new Map<string, Set<string>>();
  graph.nodes.forEach(node => adjacency.set(node.id, new Set()));

  graph.edges.forEach(edge => {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source); // Undirected
  });

  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; path: string[] }> = [
    { nodeId: startNodeId, path: [startNodeId] },
  ];

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    if (nodeId === endNodeId) return path;

    const neighbors = adjacency.get(nodeId);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ nodeId: neighbor, path: [...path, neighbor] });
        }
      }
    }
  }

  return null; // No path found
}

/**
 * Calculate betweenness centrality for nodes
 * Identifies nodes that act as bridges in the graph
 */
export function calculateBetweennessCentrality(graph: Graph): Map<string, number> {
  const centrality = new Map<string, number>();
  graph.nodes.forEach(node => centrality.set(node.id, 0));

  // For each pair of nodes, find shortest paths
  for (let i = 0; i < graph.nodes.length; i++) {
    for (let j = i + 1; j < graph.nodes.length; j++) {
      const sourceNode = graph.nodes[i];
      const targetNode = graph.nodes[j];
      if (!sourceNode || !targetNode) continue;

      const source = sourceNode.id;
      const target = targetNode.id;

      const paths = findAllShortestPaths(graph, source, target);
      if (paths.length === 0) continue;

      // Count how many times each node appears in shortest paths
      const nodeAppearances = new Map<string, number>();
      paths.forEach(path => {
        // Exclude source and target
        for (let k = 1; k < path.length - 1; k++) {
          const nodeId = path[k];
          if (!nodeId) continue;
          nodeAppearances.set(nodeId, (nodeAppearances.get(nodeId) || 0) + 1);
        }
      });

      // Add to centrality scores
      nodeAppearances.forEach((count, nodeId) => {
        const score = count / paths.length;
        centrality.set(nodeId, (centrality.get(nodeId) || 0) + score);
      });
    }
  }

  return centrality;
}

/**
 * Find all shortest paths between two nodes
 */
function findAllShortestPaths(graph: Graph, startNodeId: string, endNodeId: string): string[][] {
  if (startNodeId === endNodeId) return [[startNodeId]];

  // Build adjacency list
  const adjacency = new Map<string, Set<string>>();
  graph.nodes.forEach(node => adjacency.set(node.id, new Set()));
  graph.edges.forEach(edge => {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  });

  const distances = new Map<string, number>();
  const predecessors = new Map<string, string[]>();

  graph.nodes.forEach(node => {
    distances.set(node.id, Infinity);
    predecessors.set(node.id, []);
  });

  distances.set(startNodeId, 0);

  const queue = [startNodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const currentDist = distances.get(current)!;
    const neighbors = adjacency.get(current);

    if (neighbors) {
      for (const neighbor of neighbors) {
        const newDist = currentDist + 1;
        const neighborDist = distances.get(neighbor)!;

        if (newDist < neighborDist) {
          distances.set(neighbor, newDist);
          predecessors.set(neighbor, [current]);
          queue.push(neighbor);
        } else if (newDist === neighborDist) {
          predecessors.get(neighbor)!.push(current);
        }
      }
    }
  }

  // Reconstruct all shortest paths
  const paths: string[][] = [];
  const reconstructPaths = (nodeId: string, currentPath: string[]) => {
    if (nodeId === startNodeId) {
      paths.push([startNodeId, ...currentPath]);
      return;
    }

    const preds = predecessors.get(nodeId);
    if (preds) {
      preds.forEach(pred => {
        reconstructPaths(pred, [nodeId, ...currentPath]);
      });
    }
  };

  if (distances.get(endNodeId) !== Infinity) {
    reconstructPaths(endNodeId, []);
  }

  return paths;
}

/**
 * Export graph data to CSV format
 */
export function exportGraphToCSV(graph: Graph, notes: Map<string, Note>): string {
  let csv = 'Node ID,Node Name,Folder,Tags,Connections,Size\n';

  // Count connections for each node
  const connectionCounts = new Map<string, number>();
  graph.edges.forEach(edge => {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
  });

  // Add node data
  graph.nodes.forEach(node => {
    const note = notes.get(node.id);
    const folder = note?.folder || '';
    const tags = node.tags.join(';');
    const connections = connectionCounts.get(node.id) || 0;
    const size = node.size;

    csv += `"${node.id}","${node.name}","${folder}","${tags}",${connections},${size}\n`;
  });

  csv += '\n\nEdge Source,Edge Target,Type,Weight\n';

  // Add edge data
  graph.edges.forEach(edge => {
    csv += `"${edge.source}","${edge.target}","${edge.type}",${edge.weight}\n`;
  });

  return csv;
}

/**
 * Export graph health metrics to CSV
 */
export function exportMetricsToCSV(
  metrics: {
    timestamp: string;
    healthScore: number;
    connectivity: number;
    avgConnections: number;
    clusterCount: number;
    gapCount: number;
    orphanCount: number;
  }[]
): string {
  let csv = 'Timestamp,Health Score,Connectivity %,Avg Connections,Clusters,Gaps,Orphans\n';

  metrics.forEach(m => {
    csv += `${m.timestamp},${m.healthScore},${m.connectivity},${m.avgConnections},${m.clusterCount},${m.gapCount},${m.orphanCount}\n`;
  });

  return csv;
}

/**
 * Calculate graph density (ratio of actual edges to possible edges)
 */
export function calculateGraphDensity(graph: Graph): number {
  const n = graph.nodes.length;
  if (n <= 1) return 0;

  const maxEdges = (n * (n - 1)) / 2; // For undirected graph
  const actualEdges = graph.edges.length;

  return actualEdges / maxEdges;
}

/**
 * Find communities using simple modularity-based algorithm
 * @param graph - The graph to analyze
 * @param _resolution - Resolution parameter (reserved for future Louvain algorithm enhancement)
 */
export function detectCommunities(graph: Graph, _resolution: number = 1.0): Map<string, number> {
  const communities = new Map<string, number>();

  // Initialize each node in its own community
  graph.nodes.forEach((node, index) => {
    communities.set(node.id, index);
  });

  // Build adjacency matrix
  const adjacency = new Map<string, Set<string>>();
  graph.nodes.forEach(node => adjacency.set(node.id, new Set()));
  graph.edges.forEach(edge => {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  });

  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (const node of graph.nodes) {
      const currentCommunity = communities.get(node.id)!;
      const neighborCommunities = new Map<number, number>();

      // Count connections to each neighboring community
      const neighbors = adjacency.get(node.id);
      if (neighbors) {
        neighbors.forEach(neighbor => {
          const community = communities.get(neighbor)!;
          neighborCommunities.set(community, (neighborCommunities.get(community) || 0) + 1);
        });
      }

      // Find best community to move to
      let bestCommunity = currentCommunity;
      let bestScore = neighborCommunities.get(currentCommunity) || 0;

      neighborCommunities.forEach((score, community) => {
        if (score > bestScore) {
          bestScore = score;
          bestCommunity = community;
        }
      });

      if (bestCommunity !== currentCommunity) {
        communities.set(node.id, bestCommunity);
        improved = true;
      }
    }
  }

  return communities;
}

/**
 * Calculate PageRank for nodes (importance based on connections)
 */
export function calculatePageRank(
  graph: Graph,
  dampingFactor: number = 0.85,
  iterations: number = 100
): Map<string, number> {
  const pageRank = new Map<string, number>();
  const n = graph.nodes.length;

  if (n === 0) return pageRank;

  // Initialize PageRank
  const initialRank = 1.0 / n;
  graph.nodes.forEach(node => pageRank.set(node.id, initialRank));

  // Build outgoing links map
  const outgoingLinks = new Map<string, string[]>();
  graph.nodes.forEach(node => outgoingLinks.set(node.id, []));
  graph.edges.forEach(edge => {
    outgoingLinks.get(edge.source)?.push(edge.target);
  });

  // Iterate PageRank calculation
  for (let i = 0; i < iterations; i++) {
    const newPageRank = new Map<string, number>();

    graph.nodes.forEach(node => {
      let rank = (1 - dampingFactor) / n;

      // Add contributions from incoming links
      graph.edges.forEach(edge => {
        if (edge.target === node.id) {
          const sourceRank = pageRank.get(edge.source)!;
          const sourceOutLinks = outgoingLinks.get(edge.source)!.length;
          if (sourceOutLinks > 0) {
            rank += dampingFactor * (sourceRank / sourceOutLinks);
          }
        }
      });

      newPageRank.set(node.id, rank);
    });

    // Update PageRank
    newPageRank.forEach((rank, nodeId) => pageRank.set(nodeId, rank));
  }

  return pageRank;
}
