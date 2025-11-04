'use client';

import React from 'react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

// Interfaces
interface TikZRendererProps {
  content: string;
}

interface Point {
  x: number;
  y: number;
}

interface StyleOptions {
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  dashArray?: string;
  opacity?: number;
}

// Color mapping for TikZ colors
const colorMap: { [key: string]: { light: string; dark: string } } = {
  red: { light: '#dc2626', dark: '#ef4444' },
  blue: { light: '#2563eb', dark: '#60a5fa' },
  green: { light: '#16a34a', dark: '#4ade80' },
  yellow: { light: '#ca8a04', dark: '#facc15' },
  purple: { light: '#9333ea', dark: '#c084fc' },
  orange: { light: '#ea580c', dark: '#fb923c' },
  black: { light: '#000000', dark: '#ffffff' },
  gray: { light: '#6b7280', dark: '#9ca3af' },
  white: { light: '#ffffff', dark: '#000000' },
};

// TikZ Renderer Component
const TikZRenderer: React.FC<TikZRendererProps> = ({ content }) => {
  const { theme } = useSimpleTheme();

  // Helper function to get theme-aware color
  const getColor = (colorName: string): string => {
    if (colorMap[colorName]) {
      return colorMap[colorName][theme === 'dark' ? 'dark' : 'light'];
    }
    return colorName;
  };

  // Helper function to parse coordinates
  const parseCoords = (coordStr: string): Point => {
    const coords = coordStr.split(',').map((n: string) => parseFloat(n.trim()));
    const x = coords[0] ?? 0;
    const y = coords[1] ?? 0;
    return {
      x: x * 50 + 150, // Scale and center in a larger viewport
      y: y * 50 + 150,
    };
  };

  // Helper function to parse color with opacity (e.g., "blue!20")
  const parseColorWithOpacity = (colorStr: string): { color: string; opacity: number } => {
    if (colorStr.includes('!')) {
      const parts = colorStr.split('!');
      const colorName = parts[0]?.trim();
      const opacityStr = parts[1];
      if (!colorName || !opacityStr) {
        return { color: getColor(colorStr), opacity: 1 };
      }
      const opacity = parseFloat(opacityStr) / 100; // Convert percentage to decimal
      return {
        color: getColor(colorName),
        opacity: opacity,
      };
    }
    return {
      color: getColor(colorStr),
      opacity: 1,
    };
  };

  // Helper function to parse TikZ style options
  const parseStyle = (styleStr?: string): StyleOptions => {
    if (!styleStr) return {};

    const style: StyleOptions = {};
    const options = styleStr
      .replace(/[\[\]]/g, '')
      .split(',')
      .map(s => s.trim());

    for (const option of options) {
      if (option.includes('=')) {
        const parts = option.split('=').map(s => s.trim());
        const key = parts[0];
        const value = parts[1];
        if (!key || !value) continue;

        switch (key) {
          case 'color': {
            const { color, opacity } = parseColorWithOpacity(value);
            style.stroke = color;
            style.fill = color;
            if (opacity < 1) style.opacity = opacity;
            break;
          }
          case 'fill': {
            const { color, opacity } = parseColorWithOpacity(value);
            style.fill = color;
            if (opacity < 1 && !style.opacity) style.opacity = opacity;
            break;
          }
          case 'draw': {
            const { color, opacity } = parseColorWithOpacity(value);
            style.stroke = color;
            if (opacity < 1 && !style.opacity) style.opacity = opacity;
            break;
          }
          case 'line width':
            style.strokeWidth = parseFloat(value);
            break;
          case 'opacity':
            style.opacity = parseFloat(value);
            break;
          case 'dashed':
            style.dashArray = '5,5';
            break;
          case 'dotted':
            style.dashArray = '1,5';
            break;
        }
      } else {
        // Handle simple color names directly (including with opacity)
        if (option.includes('!') || colorMap[option]) {
          const { color, opacity } = parseColorWithOpacity(option);
          style.stroke = color;
          style.fill = color;
          if (opacity < 1) style.opacity = opacity;
        } else {
          // Handle simple options
          switch (option) {
            case 'thick':
              style.strokeWidth = 2;
              break;
            case 'thin':
              style.strokeWidth = 0.5;
              break;
            case 'dashed':
              style.dashArray = '5,5';
              break;
            case 'dotted':
              style.dashArray = '1,5';
              break;
          }
        }
      }
    }
    return style;
  };

  // Process TikZ content and render SVG elements
  const processTikZ = (tikzContent: string): React.ReactNode[] => {
    const svgElements: React.ReactNode[] = [];

    try {
      const commands = tikzContent.trim().split('\n');

      for (const command of commands) {
        const styleMatch = command.match(/\[(.*?)\]/);
        const style = parseStyle(styleMatch?.[1]);

        if (command.startsWith('\\draw') || command.startsWith('\\path')) {
          if (command.includes('--')) {
            // Line or polyline
            const points = command.match(/\((.*?)\)/g)?.map((p: string) => p.slice(1, -1)) || [];
            if (points.length >= 2) {
              const coords = points.map(parseCoords);
              const firstCoord = coords[0];
              if (!firstCoord) continue;

              const pathData =
                `M ${firstCoord.x} ${firstCoord.y} ` +
                coords
                  .slice(1)
                  .map((p: Point) => `L ${p.x} ${p.y}`)
                  .join(' ');
              svgElements.push(
                <path
                  key={svgElements.length}
                  d={pathData}
                  stroke={style.stroke}
                  fill={style.fill ?? 'none'}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dashArray}
                  opacity={style.opacity}
                />
              );
            }
          } else if (command.includes('circle')) {
            // Circle
            const match = command.match(/\((.*?)\)\s*circle\s*\((.*?)\)/);
            const centerStr = match?.[1];
            const radiusStr = match?.[2];
            if (match && centerStr && radiusStr) {
              const center = parseCoords(centerStr);
              const r = parseFloat(radiusStr.replace(/cm/, '')) * 50;
              svgElements.push(
                <circle
                  key={svgElements.length}
                  cx={center.x}
                  cy={center.y}
                  r={r}
                  stroke={style.stroke}
                  fill={style.fill ?? 'none'}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dashArray}
                  opacity={style.opacity}
                />
              );
            }
          } else if (command.includes('arc')) {
            // Arc
            const match = command.match(/\((.*?)\)\s*arc\s*\((.*?)\)/);
            const centerStr = match?.[1];
            const arcParams = match?.[2];
            if (match && centerStr && arcParams) {
              const center = parseCoords(centerStr);
              const parts = arcParams.split(':').map((n: string) => parseFloat(n.trim()));
              const startAngle = parts[0] ?? 0;
              const endAngle = parts[1] ?? 0;
              const radius = parts[2] ?? 1;
              const r = radius * 50;
              const start = {
                x: center.x + r * Math.cos((startAngle * Math.PI) / 180),
                y: center.y + r * Math.sin((startAngle * Math.PI) / 180),
              };
              const end = {
                x: center.x + r * Math.cos((endAngle * Math.PI) / 180),
                y: center.y + r * Math.sin((endAngle * Math.PI) / 180),
              };
              const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
              const pathData = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
              svgElements.push(
                <path
                  key={svgElements.length}
                  d={pathData}
                  stroke={style.stroke}
                  fill={style.fill ?? 'none'}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dashArray}
                  opacity={style.opacity}
                />
              );
            }
          } else if (command.includes('rectangle')) {
            // Rectangle
            const match = command.match(/\((.*?)\)\s*rectangle\s*\((.*?)\)/);
            const startStr = match?.[1];
            const endStr = match?.[2];
            if (match && startStr && endStr) {
              const start = parseCoords(startStr);
              const end = parseCoords(endStr);
              svgElements.push(
                <rect
                  key={svgElements.length}
                  x={Math.min(start.x, end.x)}
                  y={Math.min(start.y, end.y)}
                  width={Math.abs(end.x - start.x)}
                  height={Math.abs(end.y - start.y)}
                  stroke={style.stroke}
                  fill={style.fill ?? 'none'}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dashArray}
                  opacity={style.opacity}
                />
              );
            }
          }
        } else if (command.startsWith('\\node')) {
          // Text nodes
          const match = command.match(/\\node\s*(?:\[(.*?)\])?\s*at\s*\((.*?)\)\s*{(.*?)};/);
          if (match) {
            const [, nodeStyle, coords, text] = match;
            if (!coords) continue;
            const point = parseCoords(coords);
            const textStyle = parseStyle(nodeStyle);
            svgElements.push(
              <text
                key={svgElements.length}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textStyle.fill || getColor('black')}
                fontSize="14px"
              >
                {text}
              </text>
            );
          }
        }
      }
    } catch (error) {
      console.error('Error processing TikZ content:', error);
    }

    return svgElements;
  };

  return (
    <svg
      viewBox="0 0 300 300"
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: '500px',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      }}
    >
      {processTikZ(content)}
    </svg>
  );
};

export default TikZRenderer;
