'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Map,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Filter,
  Search,
  BookOpen,
  Tag,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note, SearchResult } from '@/lib/types';
import { analytics } from '@/lib/analytics';

interface ConceptNode {
  id: string;
  label: string;
  type: 'note' | 'tag' | 'concept';
  size: number;
  color: string;
  connections: number;
  relevance: number;
  data: {
    noteCount?: number;
    createdAt?: string;
    lastModified?: string;
    tags?: string[];
    content?: string;
  };
}

interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: 'wikilink' | 'tag' | 'semantic' | 'temporal';
  strength: number;
}

interface KnowledgeMapData {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  clusters: Array<{
    id: string;
    label: string;
    nodes: string[];
    color: string;
  }>;
}

interface KnowledgeMapProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onOpenNote?: (noteId: string) => void;
  onCreateNote?: (title: string, content: string, tags: string[]) => void;
  searchQuery?: string;
}

export default function KnowledgeMap({
  notes,
  isOpen,
  onClose,
  onOpenNote,
  onCreateNote,
  searchQuery,
}: KnowledgeMapProps) {
  const { theme } = useSimpleTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [mapData, setMapData] = useState<KnowledgeMapData>({ nodes: [], edges: [], clusters: [] });
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ConceptNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewOptions, setViewOptions] = useState({
    showTags: true,
    showConcepts: true,
    showConnections: true,
    clusterByTopic: true,
    timeWeighted: false,
  });

  // Canvas state
  const [canvasState, setCanvasState] = useState({
    zoom: 1,
    panX: 0,
    panY: 0,
    width: 800,
    height: 600,
  });

  // Generate knowledge map data
  const generateKnowledgeMap = async () => {
    if (notes.length === 0) return;

    setIsGenerating(true);

    try {
      // Extract concepts and relationships
      const nodes: ConceptNode[] = [];
      const edges: ConceptEdge[] = [];
      const conceptMap: { [key: string]: number } = {};
      const tagMap: { [key: string]: number } = {};

      // Create note nodes
      notes.forEach((note, index) => {
        nodes.push({
          id: `note-${note.id}`,
          label: note.name,
          type: 'note',
          size: Math.min(20, Math.max(8, note.content.length / 100)),
          color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          connections: 0,
          relevance: searchQuery
            ? note.content.toLowerCase().includes(searchQuery.toLowerCase())
              ? 1
              : 0.5
            : 1,
          data: {
            createdAt: note.createdAt,
            lastModified: note.createdAt, // Use createdAt as fallback
            tags: note.tags,
            content: note.content.substring(0, 200),
          },
        });

        // Extract concepts from content
        const words = note.content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        words.forEach(word => {
          conceptMap[word] = (conceptMap[word] || 0) + 1;
        });

        // Track tags
        note.tags.forEach(tag => {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        });
      });

      // Create tag nodes
      Object.entries(tagMap)
        .filter(([tag, count]) => count > 1) // Only show tags used multiple times
        .forEach(([tag, count]) => {
          nodes.push({
            id: `tag-${tag}`,
            label: tag,
            type: 'tag',
            size: Math.min(15, Math.max(6, count * 2)),
            color: theme === 'dark' ? '#34d399' : '#10b981',
            connections: count,
            relevance: 1,
            data: {
              noteCount: count,
            },
          });
        });

      // Create concept nodes for high-frequency terms
      Object.entries(conceptMap)
        .filter(([concept, count]) => count > 2 && concept.length > 4)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20) // Top 20 concepts
        .forEach(([concept, count]) => {
          nodes.push({
            id: `concept-${concept}`,
            label: concept,
            type: 'concept',
            size: Math.min(12, Math.max(4, count)),
            color: theme === 'dark' ? '#f59e0b' : '#d97706',
            connections: count,
            relevance: 1,
            data: {
              noteCount: count,
            },
          });
        });

      // Create edges (relationships)
      let edgeId = 0;

      // Note-to-tag relationships
      notes.forEach(note => {
        const noteNode = nodes.find(n => n.id === `note-${note.id}`);
        if (!noteNode) return;

        note.tags.forEach(tag => {
          const tagNode = nodes.find(n => n.id === `tag-${tag}`);
          if (tagNode) {
            edges.push({
              id: `edge-${edgeId++}`,
              source: noteNode.id,
              target: tagNode.id,
              weight: 1,
              type: 'tag',
              strength: 0.8,
            });
          }
        });

        // Note-to-concept relationships
        const words = note.content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const wordCounts: { [key: string]: number } = {};
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        Object.entries(wordCounts)
          .filter(([word, count]) => count > 1)
          .forEach(([word, count]) => {
            const conceptNode = nodes.find(n => n.id === `concept-${word}`);
            if (conceptNode) {
              edges.push({
                id: `edge-${edgeId++}`,
                source: noteNode.id,
                target: conceptNode.id,
                weight: count,
                type: 'semantic',
                strength: Math.min(1, count / 5),
              });
            }
          });
      });

      // Wiki-link relationships
      notes.forEach(note => {
        const noteNode = nodes.find(n => n.id === `note-${note.id}`);
        if (!noteNode) return;

        const wikiLinks = note.content.match(/\[\[([^\]]+)\]\]/g);
        if (wikiLinks) {
          wikiLinks.forEach(link => {
            const linkedNoteName = link.slice(2, -2);
            const linkedNote = notes.find(n => n.name === linkedNoteName);
            if (linkedNote) {
              const linkedNoteNode = nodes.find(n => n.id === `note-${linkedNote.id}`);
              if (linkedNoteNode) {
                edges.push({
                  id: `edge-${edgeId++}`,
                  source: noteNode.id,
                  target: linkedNoteNode.id,
                  weight: 2,
                  type: 'wikilink',
                  strength: 1,
                });
              }
            }
          });
        }
      });

      // Create clusters
      const clusters = [
        {
          id: 'notes',
          label: 'Notes',
          nodes: nodes.filter(n => n.type === 'note').map(n => n.id),
          color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
        },
        {
          id: 'tags',
          label: 'Tags',
          nodes: nodes.filter(n => n.type === 'tag').map(n => n.id),
          color: theme === 'dark' ? '#34d399' : '#10b981',
        },
        {
          id: 'concepts',
          label: 'Concepts',
          nodes: nodes.filter(n => n.type === 'concept').map(n => n.id),
          color: theme === 'dark' ? '#f59e0b' : '#d97706',
        },
      ];

      setMapData({ nodes, edges, clusters });

      analytics.trackEvent('ai_analysis', {
        action: 'knowledge_map_generated',
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });
    } catch (error) {
      console.error('Knowledge map generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas drawing
  const drawMap = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(canvasState.panX + canvas.width / 2, canvasState.panY + canvas.height / 2);
    ctx.scale(canvasState.zoom, canvasState.zoom);

    // Simple layout (circular for now)
    const centerX = 0;
    const centerY = 0;
    const radius = 200;

    // Draw edges
    if (viewOptions.showConnections) {
      mapData.edges.forEach(edge => {
        const sourceNode = mapData.nodes.find(n => n.id === edge.source);
        const targetNode = mapData.nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          const sourceIndex = mapData.nodes.indexOf(sourceNode);
          const targetIndex = mapData.nodes.indexOf(targetNode);

          const sourceAngle = (sourceIndex / mapData.nodes.length) * 2 * Math.PI;
          const targetAngle = (targetIndex / mapData.nodes.length) * 2 * Math.PI;

          const sourceX = centerX + Math.cos(sourceAngle) * radius;
          const sourceY = centerY + Math.sin(sourceAngle) * radius;
          const targetX = centerX + Math.cos(targetAngle) * radius;
          const targetY = centerY + Math.sin(targetAngle) * radius;

          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle =
            edge.type === 'wikilink'
              ? theme === 'dark'
                ? '#60a5fa'
                : '#3b82f6'
              : theme === 'dark'
                ? '#6b7280'
                : '#9ca3af';
          ctx.lineWidth = edge.strength * 2;
          ctx.globalAlpha = 0.6;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    }

    // Draw nodes
    mapData.nodes.forEach((node, index) => {
      if (!viewOptions.showTags && node.type === 'tag') return;
      if (!viewOptions.showConcepts && node.type === 'concept') return;

      const angle = (index / mapData.nodes.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, node.size, 0, 2 * Math.PI);

      if (hoveredNode?.id === node.id) {
        ctx.fillStyle = theme === 'dark' ? '#f59e0b' : '#d97706';
      } else if (selectedNode?.id === node.id) {
        ctx.fillStyle = theme === 'dark' ? '#ef4444' : '#dc2626';
      } else {
        ctx.fillStyle = node.color;
      }

      ctx.fill();

      // Node border
      ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Node label
      if (node.size > 8) {
        ctx.fillStyle = theme === 'dark' ? '#f9fafb' : '#111827';
        ctx.font = `${Math.min(12, node.size)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = node.size * 4;
        let label = node.label;
        if (ctx.measureText(label).width > maxWidth) {
          label =
            label.substring(
              0,
              Math.floor((label.length * maxWidth) / ctx.measureText(label).width)
            ) + '...';
        }

        ctx.fillText(label, x, y + node.size + 15);
      }
    });

    ctx.restore();
  };

  // Mouse interactions
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Transform coordinates based on zoom/pan
    const transformedX = (x - canvas.width / 2 - canvasState.panX) / canvasState.zoom;
    const transformedY = (y - canvas.height / 2 - canvasState.panY) / canvasState.zoom;

    // Find clicked node
    const radius = 200;
    const centerX = 0;
    const centerY = 0;

    for (let i = 0; i < mapData.nodes.length; i++) {
      const node = mapData.nodes[i];
      if (!node) continue;

      const angle = (i / mapData.nodes.length) * 2 * Math.PI;
      const nodeX = centerX + Math.cos(angle) * radius;
      const nodeY = centerY + Math.sin(angle) * radius;

      const distance = Math.sqrt((transformedX - nodeX) ** 2 + (transformedY - nodeY) ** 2);

      if (distance <= node.size) {
        setSelectedNode(node);

        if (node.type === 'note' && onOpenNote) {
          const noteId = node.id.replace('note-', '');
          onOpenNote(noteId);
        }

        analytics.trackEvent('ai_analysis', {
          action: 'knowledge_map_node_clicked',
          nodeType: node.type,
          nodeLabel: node.label,
        });

        break;
      }
    }
  };

  // Initialize map when opened
  useEffect(() => {
    if (isOpen && notes.length > 0) {
      generateKnowledgeMap();
    }
  }, [isOpen, notes]);

  // Redraw canvas when data or theme changes
  useEffect(() => {
    drawMap();
  }, [mapData, canvasState, theme, viewOptions, selectedNode, hoveredNode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2
              className="text-xl font-semibold text-gray-900 dark:text-white"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Knowledge Map
            </h2>
            {mapData.nodes.length > 0 && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                }}
              >
                {mapData.nodes.length} nodes • {mapData.edges.length} connections
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Options */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewOptions(prev => ({ ...prev, showTags: !prev.showTags }))}
                className={`p-2 rounded-lg transition-colors ${
                  viewOptions.showTags
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title="Toggle Tags"
              >
                <Tag className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setViewOptions(prev => ({ ...prev, showConcepts: !prev.showConcepts }))
                }
                className={`p-2 rounded-lg transition-colors ${
                  viewOptions.showConcepts
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title="Toggle Concepts"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-2">
              <button
                onClick={() =>
                  setCanvasState(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))
                }
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={() =>
                  setCanvasState(prev => ({ ...prev, zoom: Math.max(0.3, prev.zoom / 1.2) }))
                }
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={() =>
                  setCanvasState({ zoom: 1, panX: 0, panY: 0, width: 800, height: 600 })
                }
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div ref={containerRef} className="flex-1 relative overflow-hidden">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p
                    className="text-gray-600 dark:text-gray-400"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Generating knowledge map...
                  </p>
                </div>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-pointer"
                style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
              />
            )}
          </div>

          {/* Side Panel */}
          {selectedNode && (
            <div
              className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto"
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
              }}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {selectedNode.type === 'note' && (
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                  {selectedNode.type === 'tag' && (
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  {selectedNode.type === 'concept' && (
                    <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  )}

                  <h3
                    className="font-semibold"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {selectedNode.label}
                  </h3>
                </div>

                <div
                  className="flex items-center gap-4 text-sm mb-3"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span>Type: {selectedNode.type}</span>
                  <span>Connections: {selectedNode.connections}</span>
                  <span>Size: {selectedNode.size}</span>
                </div>
              </div>

              {selectedNode.data.content && (
                <div className="mb-4">
                  <h4
                    className="font-medium mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Preview
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                  >
                    {selectedNode.data.content}...
                  </p>
                </div>
              )}

              {selectedNode.data.tags && selectedNode.data.tags.length > 0 && (
                <div className="mb-4">
                  <h4
                    className="font-medium mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.data.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.type === 'note' && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const noteId = selectedNode.id.replace('note-', '');
                      onOpenNote?.(noteId);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
