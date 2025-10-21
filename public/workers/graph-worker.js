/**
 * Web Worker for Heavy Graph Calculations
 * Offloads computationally expensive graph operations to prevent UI blocking
 */

self.addEventListener('message', event => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'CALCULATE_BETWEENNESS':
        const betweenness = calculateBetweennessCentrality(data.graph);
        self.postMessage({ type: 'BETWEENNESS_RESULT', data: betweenness });
        break;

      case 'DETECT_COMMUNITIES':
        const communities = detectCommunities(data.graph, data.resolution || 1.0);
        self.postMessage({ type: 'COMMUNITIES_RESULT', data: communities });
        break;

      case 'CALCULATE_PAGERANK':
        const pageRank = calculatePageRank(data.graph, data.dampingFactor, data.iterations);
        self.postMessage({ type: 'PAGERANK_RESULT', data: pageRank });
        break;

      case 'FIND_SHORTEST_PATH':
        const path = findShortestPath(data.graph, data.startNodeId, data.endNodeId);
        self.postMessage({ type: 'PATH_RESULT', data: path });
        break;

      case 'CALCULATE_HEATMAP':
        const heatmap = calculateConnectionHeatmap(data.graph);
        self.postMessage({ type: 'HEATMAP_RESULT', data: heatmap });
        break;

      default:
        self.postMessage({ type: 'ERROR', error: `Unknown operation: ${type}` });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message });
  }
});

/**
 * Calculate connection strength heatmap
 */
function calculateConnectionHeatmap(graph) {
  const heatmap = {};

  // Initialize heatmap for all nodes
  graph.nodes.forEach(node => {
    heatmap[node.id] = {};
  });

  // Calculate connection strengths
  graph.edges.forEach(edge => {
    if (heatmap[edge.source]) {
      heatmap[edge.source][edge.target] = (heatmap[edge.source][edge.target] || 0) + edge.weight;
    }
    if (heatmap[edge.target]) {
      heatmap[edge.target][edge.source] = (heatmap[edge.target][edge.source] || 0) + edge.weight;
    }
  });

  return heatmap;
}

/**
 * Find shortest path between two nodes using BFS
 */
function findShortestPath(graph, startNodeId, endNodeId) {
  if (startNodeId === endNodeId) return [startNodeId];

  // Build adjacency list
  const adjacency = {};
  graph.nodes.forEach(node => {
    adjacency[node.id] = new Set();
  });

  graph.edges.forEach(edge => {
    adjacency[edge.source].add(edge.target);
    adjacency[edge.target].add(edge.source); // Undirected
  });

  const visited = new Set();
  const queue = [{ nodeId: startNodeId, path: [startNodeId] }];

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift();

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    if (nodeId === endNodeId) return path;

    const neighbors = adjacency[nodeId];
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
 */
function calculateBetweennessCentrality(graph) {
  const centrality = {};
  graph.nodes.forEach(node => {
    centrality[node.id] = 0;
  });

  // For each pair of nodes, find shortest paths
  for (let i = 0; i < graph.nodes.length; i++) {
    for (let j = i + 1; j < graph.nodes.length; j++) {
      const source = graph.nodes[i].id;
      const target = graph.nodes[j].id;

      const paths = findAllShortestPaths(graph, source, target);
      if (paths.length === 0) continue;

      // Count how many times each node appears in shortest paths
      const nodeAppearances = {};
      paths.forEach(path => {
        // Exclude source and target
        for (let k = 1; k < path.length - 1; k++) {
          const nodeId = path[k];
          nodeAppearances[nodeId] = (nodeAppearances[nodeId] || 0) + 1;
        }
      });

      // Add to centrality scores
      Object.entries(nodeAppearances).forEach(([nodeId, count]) => {
        const score = count / paths.length;
        centrality[nodeId] = (centrality[nodeId] || 0) + score;
      });
    }
  }

  return centrality;
}

/**
 * Find all shortest paths between two nodes
 */
function findAllShortestPaths(graph, startNodeId, endNodeId) {
  if (startNodeId === endNodeId) return [[startNodeId]];

  // Build adjacency list
  const adjacency = {};
  graph.nodes.forEach(node => {
    adjacency[node.id] = new Set();
  });
  graph.edges.forEach(edge => {
    adjacency[edge.source].add(edge.target);
    adjacency[edge.target].add(edge.source);
  });

  const distances = {};
  const predecessors = {};

  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = [];
  });

  distances[startNodeId] = 0;

  const queue = [startNodeId];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const currentDist = distances[current];
    const neighbors = adjacency[current];

    if (neighbors) {
      for (const neighbor of neighbors) {
        const newDist = currentDist + 1;
        const neighborDist = distances[neighbor];

        if (newDist < neighborDist) {
          distances[neighbor] = newDist;
          predecessors[neighbor] = [current];
          queue.push(neighbor);
        } else if (newDist === neighborDist) {
          predecessors[neighbor].push(current);
        }
      }
    }
  }

  // Reconstruct all shortest paths
  const paths = [];
  const reconstructPaths = (nodeId, currentPath) => {
    if (nodeId === startNodeId) {
      paths.push([startNodeId, ...currentPath]);
      return;
    }

    const preds = predecessors[nodeId];
    if (preds) {
      preds.forEach(pred => {
        reconstructPaths(pred, [nodeId, ...currentPath]);
      });
    }
  };

  if (distances[endNodeId] !== Infinity) {
    reconstructPaths(endNodeId, []);
  }

  return paths;
}

/**
 * Detect communities using simple modularity-based algorithm
 */
function detectCommunities(graph, resolution = 1.0) {
  const communities = {};

  // Initialize each node in its own community
  graph.nodes.forEach((node, index) => {
    communities[node.id] = index;
  });

  // Build adjacency matrix
  const adjacency = {};
  graph.nodes.forEach(node => {
    adjacency[node.id] = new Set();
  });
  graph.edges.forEach(edge => {
    adjacency[edge.source].add(edge.target);
    adjacency[edge.target].add(edge.source);
  });

  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (const node of graph.nodes) {
      const currentCommunity = communities[node.id];
      const neighborCommunities = {};

      // Count connections to each neighboring community
      const neighbors = adjacency[node.id];
      if (neighbors) {
        neighbors.forEach(neighbor => {
          const community = communities[neighbor];
          neighborCommunities[community] = (neighborCommunities[community] || 0) + 1;
        });
      }

      // Find best community to move to
      let bestCommunity = currentCommunity;
      let bestScore = neighborCommunities[currentCommunity] || 0;

      Object.entries(neighborCommunities).forEach(([community, score]) => {
        if (score > bestScore) {
          bestScore = score;
          bestCommunity = parseInt(community);
        }
      });

      if (bestCommunity !== currentCommunity) {
        communities[node.id] = bestCommunity;
        improved = true;
      }
    }
  }

  return communities;
}

/**
 * Calculate PageRank for nodes
 */
function calculatePageRank(graph, dampingFactor = 0.85, iterations = 100) {
  const pageRank = {};
  const n = graph.nodes.length;

  if (n === 0) return pageRank;

  // Initialize PageRank
  const initialRank = 1.0 / n;
  graph.nodes.forEach(node => {
    pageRank[node.id] = initialRank;
  });

  // Build outgoing links map
  const outgoingLinks = {};
  graph.nodes.forEach(node => {
    outgoingLinks[node.id] = [];
  });
  graph.edges.forEach(edge => {
    outgoingLinks[edge.source].push(edge.target);
  });

  // Iterate PageRank calculation
  for (let i = 0; i < iterations; i++) {
    const newPageRank = {};

    graph.nodes.forEach(node => {
      let rank = (1 - dampingFactor) / n;

      // Add contributions from incoming links
      graph.edges.forEach(edge => {
        if (edge.target === node.id) {
          const sourceRank = pageRank[edge.source];
          const sourceOutLinks = outgoingLinks[edge.source].length;
          if (sourceOutLinks > 0) {
            rank += dampingFactor * (sourceRank / sourceOutLinks);
          }
        }
      });

      newPageRank[node.id] = rank;
    });

    // Update PageRank
    Object.entries(newPageRank).forEach(([nodeId, rank]) => {
      pageRank[nodeId] = rank;
    });
  }

  return pageRank;
}
