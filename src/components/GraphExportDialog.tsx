'use client';

import React, { useState } from 'react';
import { Download, FileImage, FileCode, FileJson, Table, X } from 'lucide-react';
import { Graph } from '@/lib/types';
import {
  exportGraphToPNG,
  exportGraphToSVG,
  exportGraphToJSON,
  exportGraphToCSV,
  ExportOptions,
} from '@/lib/graph-export';

interface GraphExportDialogProps {
  graph: Graph;
  svgElement: SVGSVGElement | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const GraphExportDialog: React.FC<GraphExportDialogProps> = ({
  graph,
  svgElement,
  isOpen,
  onClose,
  title = 'knowledge-graph',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'svg' | 'json' | 'csv'>('png');
  const [exportWidth, setExportWidth] = useState(1920);
  const [exportHeight, setExportHeight] = useState(1080);
  const [quality, setQuality] = useState(0.95);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const options: ExportOptions = {
        format: selectedFormat as 'png' | 'svg',
        width: exportWidth,
        height: exportHeight,
        quality,
        backgroundColor,
        title,
      };

      switch (selectedFormat) {
        case 'png':
          if (svgElement) {
            await exportGraphToPNG(svgElement, options);
          }
          break;
        case 'svg':
          if (svgElement) {
            exportGraphToSVG(svgElement, options);
          }
          break;
        case 'json':
          exportGraphToJSON(graph, title);
          break;
        case 'csv':
          exportGraphToCSV(graph, title);
          break;
      }

      // Close dialog after successful export
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export graph. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'png', label: 'PNG Image', icon: FileImage, description: 'High-quality raster image' },
    { value: 'svg', label: 'SVG Vector', icon: FileCode, description: 'Scalable vector graphic' },
    { value: 'json', label: 'JSON Data', icon: FileJson, description: 'Graph data structure' },
    { value: 'csv', label: 'CSV Tables', icon: Table, description: 'Spreadsheet format' },
  ];

  const presetSizes = [
    { label: 'HD (1920x1080)', width: 1920, height: 1080 },
    { label: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { label: '4K (3840x2160)', width: 3840, height: 2160 },
    { label: 'Square (2000x2000)', width: 2000, height: 2000 },
    { label: 'Instagram (1080x1080)', width: 1080, height: 1080 },
    { label: 'Twitter (1200x675)', width: 1200, height: 675 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className="w-full max-w-2xl rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Export Knowledge Graph
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map(format => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value as typeof selectedFormat)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedFormat === format.value ? 'border-opacity-100' : 'border-opacity-0'
                  }`}
                  style={{
                    backgroundColor:
                      selectedFormat === format.value ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                    borderColor:
                      selectedFormat === format.value
                        ? 'var(--accent-primary)'
                        : 'var(--border-secondary)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <format.icon
                      className="w-5 h-5 mt-0.5"
                      style={{
                        color:
                          selectedFormat === format.value
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                      }}
                    />
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          color:
                            selectedFormat === format.value
                              ? 'var(--accent-primary)'
                              : 'var(--text-primary)',
                        }}
                      >
                        {format.label}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {format.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Export Options */}
          {(selectedFormat === 'png' || selectedFormat === 'svg') && (
            <>
              {/* Preset Sizes */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Preset Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetSizes.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setExportWidth(preset.width);
                        setExportHeight(preset.height);
                      }}
                      className="px-3 py-1.5 text-xs rounded transition-colors"
                      style={{
                        backgroundColor:
                          exportWidth === preset.width && exportHeight === preset.height
                            ? 'var(--accent-bg)'
                            : 'var(--bg-tertiary)',
                        color:
                          exportWidth === preset.width && exportHeight === preset.height
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={exportWidth}
                    onChange={e => setExportWidth(parseInt(e.target.value) || 1920)}
                    min="100"
                    max="10000"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={exportHeight}
                    onChange={e => setExportHeight(parseInt(e.target.value) || 1080)}
                    min="100"
                    max="10000"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={e => setBackgroundColor(e.target.value)}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={e => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border font-mono text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Quality (PNG only) */}
              {selectedFormat === 'png' && (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Quality: {(quality * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}

          {/* Data Export Info */}
          {(selectedFormat === 'json' || selectedFormat === 'csv') && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-secondary)',
                border: '1px solid',
              }}
            >
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {selectedFormat === 'json' ? (
                  <>
                    <strong>JSON Export includes:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Complete graph structure</li>
                      <li>All node properties (id, name, group, tags, etc.)</li>
                      <li>All edge connections</li>
                      <li>Metadata and statistics</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <strong>CSV Export includes:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Two files: nodes.csv and edges.csv</li>
                      <li>Spreadsheet-friendly format</li>
                      <li>Easy to analyze in Excel/Google Sheets</li>
                      <li>Compatible with other graph tools</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div
            className="p-4 rounded-lg flex justify-between items-center"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Graph contains <strong>{graph.nodes.length} nodes</strong> and{' '}
              <strong>{graph.edges.length} edges</strong>
            </div>
            {(selectedFormat === 'png' || selectedFormat === 'svg') && (
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {exportWidth} × {exportHeight}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 p-4 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={
              isExporting || ((selectedFormat === 'png' || selectedFormat === 'svg') && !svgElement)
            }
            className="px-4 py-2 rounded transition-opacity disabled:opacity-50 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
            }}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphExportDialog;
