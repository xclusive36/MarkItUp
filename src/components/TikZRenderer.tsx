'use client';

import React from 'react';

interface TikZRendererProps {
  content: string;
}

const TikZRenderer: React.FC<TikZRendererProps> = ({ content }) => {
  try {
    // Parse TikZ commands and convert to SVG
    const commands = content.trim().split('\n');
    const svgCommands: string[] = [];
    const viewBox = "0 0 100 100";

    for (const command of commands) {
      if (command.startsWith('\\draw')) {
        // Handle \draw commands
        if (command.includes('--')) {
          // Line
          const match = command.match(/\((.*?)\)\s*--\s*\((.*?)\)/);
          if (match) {
            const [start, end] = [match[1], match[2]];
            const [x1, y1] = start.split(',').map(n => parseFloat(n.trim()) * 50 + 50);
            const [x2, y2] = end.split(',').map(n => parseFloat(n.trim()) * 50 + 50);
            svgCommands.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="2"/>`);
          }
        } else if (command.includes('circle')) {
          // Circle
          const match = command.match(/\((.*?)\)\s*circle\s*\((.*?)\)/);
          if (match) {
            const [center, radius] = [match[1], match[2]];
            const [cx, cy] = center.split(',').map(n => parseFloat(n.trim()) * 50 + 50);
            const r = parseFloat(radius.replace('cm', '')) * 50;
            svgCommands.push(`<circle cx="${cx}" cy="${cy}" r="${r}" stroke="currentColor" fill="none" stroke-width="2"/>`);
          }
        }
      }
    }

    const svg = `
      <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="width: 200px; height: 200px;">
        ${svgCommands.join('\n        ')}
      </svg>
    `;

    return (
      <div className="tikz-renderer my-4 flex justify-center">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering TikZ:', error);
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        Error rendering TikZ diagram. Original code:
        <pre className="mt-2 bg-red-50 p-2 rounded">{content}</pre>
      </div>
    );
  }
};

export default TikZRenderer;
