'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as d3Force from 'd3-force';
import { Graph, GraphNode, GraphEdge } from '@/lib/types';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import EmptyState from './EmptyState';
import { Network } from 'lucide-react';

// Define a proper D3Node type that extends GraphNode and includes simulation properties
interface D3Node extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

// Properly type the D3Edge to work with D3's force simulation
interface D3Edge extends Omit<GraphEdge, 'source' | 'target'> {
  source: D3Node;
  target: D3Node;
  index?: number;
}

interface GraphViewProps {
  graph: Graph;
  centerNode?: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  className?: string;
}

const GraphView: React.FC<GraphViewProps> = ({
  graph,
  centerNode,
  onNodeClick,
  onNodeHover,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useSimpleTheme();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isInitialized, setIsInitialized] = useState(false);
  const simulationRef = useRef<ReturnType<typeof d3Force.forceSimulation<D3Node>> | null>(null);

  // Stabilize graph reference - only update when actual node/edge content changes
  // This prevents D3 from re-animating on every render
  const nodeIds = graph?.nodes?.map(n => n.id).join(',') || '';
  const edgeIds = graph?.edges?.map(e => `${e.source}-${e.target}`).join(',') || '';

  const stableGraph = useMemo(() => {
    if (!graph) return null;
    return {
      nodes: graph.nodes,
      edges: graph.edges,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeIds, edgeIds]);

  // Handle resize and initial dimensions
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          setDimensions({ width: rect.width, height: rect.height });
          if (!isInitialized) {
            setIsInitialized(true);
          }
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

  // Main graph rendering effect
  useEffect(() => {
    // Don't render until we have actual dimensions from the container
    if (!svgRef.current || !stableGraph?.nodes.length || !isInitialized) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create container groups
    const container = svg.append('g').attr('class', 'graph-container');
    const linksGroup = container.append('g').attr('class', 'links');
    const nodesGroup = container.append('g').attr('class', 'nodes');

    // Prepare data
    const nodes: D3Node[] = stableGraph.nodes.map(node => ({ ...node }));
    const edges: D3Edge[] = stableGraph.edges.map(edge => ({
      ...edge,
      source: nodes.find(n => n.id === edge.source)!,
      target: nodes.find(n => n.id === edge.target)!,
    }));

    // Create force simulation
    const simulation = d3Force
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3Force
          .forceLink<D3Node, D3Edge>(edges)
          .id((d: D3Node) => d.id)
          .distance((d: D3Edge) => (d.type === 'tag' ? 100 : 150))
          .strength((d: D3Edge) => (d.type === 'tag' ? 0.3 : 0.8))
      )
      .force('charge', d3Force.forceManyBody<D3Node>().strength(-300))
      .force('center', d3Force.forceCenter<D3Node>(width / 2, height / 2))
      .force(
        'collision',
        d3Force.forceCollide<D3Node>().radius((d: D3Node) => (d.size || 5) + 5)
      );

    simulationRef.current = simulation;

    // Color scheme based on theme
    const colors = {
      node: theme === 'dark' ? '#e5e7eb' : '#374151',
      nodeHighlight: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      link: theme === 'dark' ? '#4b5563' : '#9ca3af',
      linkHighlight: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      text: theme === 'dark' ? '#f9fafb' : '#111827',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
    };

    // Create links
    const link = linksGroup
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('class', 'graph-link')
      .attr('stroke', d => (d.type === 'tag' ? colors.linkHighlight : colors.link))
      .attr('stroke-width', d => d.weight)
      .attr('stroke-opacity', d => (d.type === 'tag' ? 0.6 : 0.8))
      .attr('stroke-dasharray', d => (d.type === 'tag' ? '5,5' : null));

    // Create nodes
    const node = nodesGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'graph-node')
      .style('cursor', 'pointer');

    // Node circles
    node
      .append('circle')
      .attr('r', d => Math.sqrt(d.size) * 2)
      .attr('fill', d => d.color || colors.node)
      .attr('stroke', colors.background)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Node labels
    node
      .append('text')
      .text(d => d.name.replace('.md', ''))
      .attr('x', 0)
      .attr('y', d => Math.sqrt(d.size) * 2 + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'var(--text-primary)')
      .attr('opacity', 0.8)
      .style('user-select', 'none')
      .style('pointer-events', 'none');

    // Drag behavior
    const drag = d3
      .drag<any, D3Node>()
      .on('start', (event: any, d: D3Node) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: D3Node) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: D3Node) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // @ts-ignore - d3 types are not fully compatible
    node.call(drag);

    // Event handlers
    node
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d.id);
      })
      .on('mouseenter', (_event, d) => {
        onNodeHover?.(d.id);

        // Highlight connected nodes and links
        const connectedNodeIds = new Set([d.id]);
        edges.forEach(edge => {
          if (edge.source.id === d.id || edge.target.id === d.id) {
            connectedNodeIds.add(edge.source.id);
            connectedNodeIds.add(edge.target.id);
          }
        });

        // Fade non-connected elements
        node.attr('opacity', n => (connectedNodeIds.has(n.id) ? 1 : 0.3));
        link.attr('opacity', l => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.1));
      })
      .on('mouseleave', () => {
        onNodeHover?.(null);

        // Reset opacity
        node.attr('opacity', 0.8);
        link.attr('opacity', d => (d.type === 'tag' ? 0.6 : 0.8));
      });

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Center on specific node if provided
    if (centerNode) {
      const targetNode = nodes.find(n => n.id === centerNode);
      if (targetNode) {
        // Highlight the center node
        node
          .select('circle')
          .attr('stroke', d => (d.id === centerNode ? colors.nodeHighlight : colors.background))
          .attr('stroke-width', d => (d.id === centerNode ? 4 : 2));

        // Move center node to center after simulation stabilizes
        setTimeout(() => {
          const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(1.2)
            .translate(-targetNode.x!, -targetNode.y!);

          svg.transition().duration(750).call(zoom.transform, transform);
        }, 1000);
      }
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [stableGraph, dimensions, theme, centerNode, onNodeClick, onNodeHover, isInitialized]);

  // Show empty state if no nodes
  if (!stableGraph?.nodes.length) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <EmptyState
          icon={Network}
          title="No Knowledge Graph Yet"
          description="Create notes and link them using [[Note Name]] syntax to build your knowledge graph. The graph will visualize connections between your notes."
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
        }}
      />

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            if (simulationRef.current) {
              simulationRef.current.alpha(1).restart();
            }
          }}
          className="px-3 py-2 text-xs rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          }}
        >
          Reheat
        </button>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 p-3 rounded-md shadow-sm text-xs"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid',
        }}
      >
        <div className="font-semibold mb-2">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-0.5 bg-gray-500"></div>
          <span>Link</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-0.5 bg-blue-500 opacity-60"
            style={{ strokeDasharray: '2,2' }}
          ></div>
          <span>Tag connection</span>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
