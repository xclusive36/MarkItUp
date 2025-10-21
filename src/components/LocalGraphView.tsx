'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '@/lib/types';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Network, Loader2 } from 'lucide-react';

interface LocalGraphViewProps {
  noteId: string;
  depth?: number;
  onNodeClick?: (noteId: string) => void;
  className?: string;
  compact?: boolean;
}

/**
 * LocalGraphView - Mini graph showing connections within N steps of current note
 * Perfect for sidebar or quick view
 */
export default function LocalGraphView({
  noteId,
  depth = 2,
  onNodeClick,
  className = '',
  compact = false,
}: LocalGraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useSimpleTheme();

  const [graph, setGraph] = useState<Graph | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  // Fetch local graph data
  useEffect(() => {
    const fetchLocalGraph = async () => {
      if (!noteId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/graph/local?noteId=${noteId}&depth=${depth}`);
        if (response.ok) {
          const data = await response.json();
          setGraph(data.graph);
        }
      } catch (error) {
        console.error('Failed to fetch local graph:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalGraph();
  }, [noteId, depth]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw graph on canvas
  useEffect(() => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (graph.nodes.length === 0) {
      // Show empty state
      ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No connections', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Simple radial layout
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    // Position nodes
    const positions = new Map<string, { x: number; y: number }>();

    // Center node (current note)
    const centerNode = graph.nodes.find(n => n.id === noteId);
    if (centerNode) {
      positions.set(centerNode.id, { x: centerX, y: centerY });
    }

    // Other nodes in a circle
    const otherNodes = graph.nodes.filter(n => n.id !== noteId);
    otherNodes.forEach((node, index) => {
      const angle = (index / otherNodes.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      positions.set(node.id, { x, y });
    });

    // Draw edges
    ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#d1d5db';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    graph.edges.forEach(edge => {
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);

      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);

        // Highlight edges connected to hovered node
        if (hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode)) {
          ctx.strokeStyle = theme === 'dark' ? '#60a5fa' : '#3b82f6';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.8;
        } else {
          ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#d1d5db';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5;
        }

        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;

    // Draw nodes
    graph.nodes.forEach(node => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const isCenter = node.id === noteId;
      const isHovered = node.id === hoveredNode;
      const nodeSize = isCenter ? 8 : 5;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI);

      if (isHovered) {
        ctx.fillStyle = theme === 'dark' ? '#f59e0b' : '#d97706';
      } else if (isCenter) {
        ctx.fillStyle = theme === 'dark' ? '#3b82f6' : '#2563eb';
      } else {
        ctx.fillStyle = node.color || (theme === 'dark' ? '#6b7280' : '#9ca3af');
      }

      ctx.fill();

      // Node border
      ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label for center node or hovered node
      if ((isCenter || isHovered) && !compact) {
        ctx.fillStyle = theme === 'dark' ? '#f9fafb' : '#111827';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const label = node.name.replace('.md', '');
        const maxWidth = 80;
        let displayLabel = label;

        // Truncate if too long
        if (ctx.measureText(label).width > maxWidth) {
          const avgCharWidth = ctx.measureText(label).width / label.length;
          const maxChars = Math.floor(maxWidth / avgCharWidth) - 3;
          displayLabel = label.substring(0, maxChars) + '...';
        }

        ctx.fillText(displayLabel, pos.x, pos.y + nodeSize + 5);
      }
    });
  }, [graph, dimensions, theme, hoveredNode, noteId, compact]);

  // Handle mouse interactions
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    // Check center node
    const centerNode = graph.nodes.find(n => n.id === noteId);
    if (centerNode) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distance <= 8) {
        setHoveredNode(centerNode.id);
        return;
      }
    }

    // Check other nodes
    const otherNodes = graph.nodes.filter(n => n.id !== noteId);
    for (let i = 0; i < otherNodes.length; i++) {
      const angle = (i / otherNodes.length) * 2 * Math.PI;
      const nodeX = centerX + Math.cos(angle) * radius;
      const nodeY = centerY + Math.sin(angle) * radius;

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance <= 5) {
        setHoveredNode(otherNodes[i].id);
        return;
      }
    }

    setHoveredNode(null);
  };

  const handleClick = () => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-32' : 'h-48'} ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-secondary)' }} />
      </div>
    );
  }

  const height = compact ? 150 : 200;

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height: `${height}px` }}>
      {!compact && (
        <div className="flex items-center gap-2 mb-2 px-2">
          <Network className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Local Graph
          </h3>
          {graph && (
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {graph.nodes.length} nodes, {graph.edges.length} connections
            </span>
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="rounded-lg border cursor-pointer"
        style={{
          width: '100%',
          height: compact ? '100%' : 'calc(100% - 32px)',
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      />

      {hoveredNode && graph && (
        <div
          className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            borderLeft: '2px solid var(--accent-primary)',
          }}
        >
          {graph.nodes.find(n => n.id === hoveredNode)?.name.replace('.md', '')}
        </div>
      )}
    </div>
  );
}
