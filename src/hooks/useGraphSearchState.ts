import { useState } from 'react';
import { Graph } from '@/lib/types';

export interface GraphStats {
  totalNotes: number;
  totalLinks: number;
  avgConnections: number;
  maxConnections: number;
  orphanCount: number;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface FolderCount {
  name: string;
  count: number;
}

export interface UseGraphSearchStateReturn {
  // Graph state
  graph: Graph;
  setGraph: (graph: Graph) => void;

  graphStats: GraphStats;
  setGraphStats: (stats: GraphStats) => void;

  // Search and organization state
  tags: TagCount[];
  setTags: (tags: TagCount[]) => void;

  folders: FolderCount[];
  setFolders: (folders: FolderCount[]) => void;
}

/**
 * Custom hook to manage graph and search-related state
 * Consolidates graph data, stats, tags, and folders
 */
export function useGraphSearchState(): UseGraphSearchStateReturn {
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [graphStats, setGraphStats] = useState<GraphStats>({
    totalNotes: 0,
    totalLinks: 0,
    avgConnections: 0,
    maxConnections: 0,
    orphanCount: 0,
  });
  const [tags, setTags] = useState<TagCount[]>([]);
  const [folders, setFolders] = useState<FolderCount[]>([]);

  return {
    graph,
    setGraph,
    graphStats,
    setGraphStats,
    tags,
    setTags,
    folders,
    setFolders,
  };
}
