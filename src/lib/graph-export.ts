/**
 * Graph Export Utilities
 * Export knowledge graph visualizations to PNG and SVG formats
 */

import { Graph } from './types';

export interface ExportOptions {
  format: 'png' | 'svg';
  width?: number;
  height?: number;
  quality?: number; // For PNG (0-1)
  backgroundColor?: string;
  includeLegend?: boolean;
  includeStats?: boolean;
  title?: string;
}

/**
 * Export graph to PNG image
 */
export const exportGraphToPNG = async (
  svgElement: SVGSVGElement,
  options: ExportOptions = { format: 'png' }
): Promise<void> => {
  const {
    width = 1920,
    height = 1080,
    quality = 0.95,
    backgroundColor = '#ffffff',
    title = 'knowledge-graph',
  } = options;

  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Load SVG as image
    const img = new Image();
    img.onload = () => {
      // Calculate aspect-preserving dimensions
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;

      // Draw image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Convert to PNG and download
      canvas.toBlob(
        blob => {
          if (blob) {
            downloadBlob(blob, `${title}.png`);
          }
          URL.revokeObjectURL(svgUrl);
        },
        'image/png',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      throw new Error('Failed to load SVG image');
    };

    img.src = svgUrl;
  } catch (error) {
    console.error('Failed to export graph to PNG:', error);
    throw error;
  }
};

/**
 * Export graph to SVG file
 */
export const exportGraphToSVG = (
  svgElement: SVGSVGElement,
  options: ExportOptions = { format: 'svg' }
): void => {
  const { width, height, backgroundColor = 'transparent', title = 'knowledge-graph' } = options;

  try {
    // Clone SVG element
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    // Set dimensions if specified
    if (width) clonedSvg.setAttribute('width', width.toString());
    if (height) clonedSvg.setAttribute('height', height.toString());

    // Add background if not transparent
    if (backgroundColor !== 'transparent') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', backgroundColor);
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);
    }

    // Add metadata
    const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
    metadata.textContent = `
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <rdf:Description rdf:about="">
          <dc:title>${title}</dc:title>
          <dc:creator>MarkItUp Knowledge Graph</dc:creator>
          <dc:date>${new Date().toISOString()}</dc:date>
        </rdf:Description>
      </rdf:RDF>
    `;
    clonedSvg.insertBefore(metadata, clonedSvg.firstChild);

    // Serialize and download
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(svgBlob, `${title}.svg`);
  } catch (error) {
    console.error('Failed to export graph to SVG:', error);
    throw error;
  }
};

/**
 * Export graph data to JSON
 */
export const exportGraphToJSON = (graph: Graph, title = 'knowledge-graph'): void => {
  try {
    const data = {
      metadata: {
        title,
        exportDate: new Date().toISOString(),
        version: '1.0',
      },
      graph: {
        nodes: graph.nodes,
        edges: graph.edges,
      },
      stats: {
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        groups: [...new Set(graph.nodes.map(n => n.group))],
      },
    };

    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(jsonBlob, `${title}.json`);
  } catch (error) {
    console.error('Failed to export graph to JSON:', error);
    throw error;
  }
};

/**
 * Export graph data to CSV
 */
export const exportGraphToCSV = (graph: Graph, title = 'knowledge-graph'): void => {
  try {
    // Nodes CSV
    const nodeHeaders = ['id', 'name', 'group', 'size', 'color', 'tags'];
    const nodeRows = graph.nodes.map(node => [
      node.id,
      `"${node.name.replace(/"/g, '""')}"`,
      `"${node.group}"`,
      node.size || '',
      node.color || '',
      `"${(node.tags || []).join(',')}"`,
    ]);

    const nodesCSV = [nodeHeaders.join(','), ...nodeRows.map(r => r.join(','))].join('\n');

    // Edges CSV
    const edgeHeaders = ['source', 'target', 'type', 'weight'];
    const edgeRows = graph.edges.map(edge => [
      edge.source,
      edge.target,
      edge.type,
      edge.weight || '',
    ]);

    const edgesCSV = [edgeHeaders.join(','), ...edgeRows.map(r => r.join(','))].join('\n');

    // Download both files
    const nodesBlob = new Blob([nodesCSV], { type: 'text/csv' });
    downloadBlob(nodesBlob, `${title}-nodes.csv`);

    const edgesBlob = new Blob([edgesCSV], { type: 'text/csv' });
    downloadBlob(edgesBlob, `${title}-edges.csv`);
  } catch (error) {
    console.error('Failed to export graph to CSV:', error);
    throw error;
  }
};

/**
 * Helper function to download blob
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate graph preview thumbnail
 */
export const generateGraphThumbnail = async (
  svgElement: SVGSVGElement,
  size = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Fill background
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, size, size);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        const thumbnail = canvas.toDataURL('image/png');
        URL.revokeObjectURL(svgUrl);
        resolve(thumbnail);
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create graph visualization with custom styling
 */
export const createStyledGraph = (
  graph: Graph,
  width: number,
  height: number,
  theme: 'light' | 'dark' = 'light'
): SVGSVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', theme === 'dark' ? '#111827' : '#f9fafb');
  svg.appendChild(bg);

  // Simple force layout
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  // Draw edges
  graph.edges.forEach(edge => {
    const sourceNode = graph.nodes.find(n => n.id === edge.source);
    const targetNode = graph.nodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const sourceIdx = graph.nodes.indexOf(sourceNode);
      const targetIdx = graph.nodes.indexOf(targetNode);

      const sourceAngle = (sourceIdx / graph.nodes.length) * 2 * Math.PI;
      const targetAngle = (targetIdx / graph.nodes.length) * 2 * Math.PI;

      line.setAttribute('x1', (centerX + Math.cos(sourceAngle) * radius).toString());
      line.setAttribute('y1', (centerY + Math.sin(sourceAngle) * radius).toString());
      line.setAttribute('x2', (centerX + Math.cos(targetAngle) * radius).toString());
      line.setAttribute('y2', (centerY + Math.sin(targetAngle) * radius).toString());
      line.setAttribute('stroke', edge.type === 'tag' ? '#10b981' : '#6366f1');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.3');

      svg.appendChild(line);
    }
  });

  // Draw nodes
  graph.nodes.forEach((node, i) => {
    const angle = (i / graph.nodes.length) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', (node.size || 5).toString());
    circle.setAttribute('fill', node.color || '#6366f1');
    circle.setAttribute('stroke', theme === 'dark' ? '#ffffff' : '#000000');
    circle.setAttribute('stroke-width', '1');

    svg.appendChild(circle);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', (y - (node.size || 5) - 5).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '10');
    text.setAttribute('fill', theme === 'dark' ? '#ffffff' : '#000000');
    text.textContent = node.name.substring(0, 15);

    svg.appendChild(text);
  });

  return svg;
};
