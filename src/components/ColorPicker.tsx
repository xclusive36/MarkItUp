'use client';

import { useState, useEffect } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [hex, setHex] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    setHex(value);
  }, [value]);

  useEffect(() => {
    // Load recent colors from localStorage
    const stored = localStorage.getItem('recent-colors');
    if (stored) {
      try {
        setRecentColors(JSON.parse(stored));
      } catch {
        setRecentColors([]);
      }
    }
  }, []);

  const handleColorChange = (newColor: string) => {
    setHex(newColor);
    onChange(newColor);

    // Add to recent colors
    const updated = [newColor, ...recentColors.filter(c => c !== newColor)].slice(0, 12);
    setRecentColors(updated);
    localStorage.setItem('recent-colors', JSON.stringify(updated));
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHex(newHex);

    // Validate hex before updating
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      handleColorChange(newHex);
    }
  };

  // Common color palette suggestions
  const suggestedColors = [
    // Grayscale
    '#000000',
    '#1a1a1a',
    '#333333',
    '#4d4d4d',
    '#666666',
    '#808080',
    '#999999',
    '#b3b3b3',
    '#cccccc',
    '#e6e6e6',
    '#f5f5f5',
    '#ffffff',
    // Primary colors
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#ff8800',
    '#8800ff',
    // Popular UI colors
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {label}
        {description && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
            {description}
          </span>
        )}
      </label>

      <div className="flex items-center gap-3">
        {/* Visual color picker */}
        <div className="relative">
          <input
            type="color"
            value={hex}
            onChange={e => handleColorChange(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            title="Pick a color"
          />
        </div>

        {/* Hex input */}
        <input
          type="text"
          value={hex}
          onChange={handleHexInput}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
        />

        {/* Palette toggle */}
        <button
          type="button"
          onClick={() => setShowPalette(!showPalette)}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
          title="Show color palette"
        >
          🎨
        </button>
      </div>

      {/* Color palette */}
      {showPalette && (
        <div className="mt-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Recent</p>
              <div className="grid grid-cols-12 gap-1">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-blue-500 transition-all"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suggested palette */}
          <div>
            <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Suggested</p>
            <div className="grid grid-cols-12 gap-1">
              {suggestedColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-blue-500 transition-all"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
