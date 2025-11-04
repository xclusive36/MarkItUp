/**
 * Vector Search Discovery Tooltip
 *
 * Shows first-time user guidance for vector search features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Brain, Zap, Info } from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

interface VectorSearchTooltipProps {
  trigger?: 'search' | 'related' | 'settings';
  onDismiss?: () => void;
}

export const VectorSearchTooltip: React.FC<VectorSearchTooltipProps> = ({
  trigger = 'search',
  onDismiss,
}) => {
  const { theme } = useSimpleTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen this tooltip before
    const storageKey = `vectorSearchTooltip_${trigger}_seen`;
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [trigger]);

  const handleDismiss = () => {
    const storageKey = `vectorSearchTooltip_${trigger}_seen`;
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getContent = () => {
    switch (trigger) {
      case 'search':
        return {
          icon: <Brain className="w-5 h-5 text-purple-500" />,
          title: 'Try Semantic Search! 🧠',
          description:
            'Switch to semantic mode to find notes by meaning, not just keywords. AI-powered search understands context.',
          tips: [
            'Click "Semantic" to enable AI search',
            'Find related concepts automatically',
            'Works even without exact matches',
          ],
        };
      case 'related':
        return {
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          title: 'Discover Related Notes ✨',
          description:
            'The Related tab shows notes similar to your current note. Perfect for discovering connections!',
          tips: [
            'Open the Related tab in the right panel',
            'Click any note to jump to it',
            'Similarity scores help prioritize',
          ],
        };
      case 'settings':
        return {
          icon: <Zap className="w-5 h-5 text-purple-500" />,
          title: 'Vector Search Settings ⚙️',
          description:
            'Configure auto-indexing, re-index notes, and manage your vector search database.',
          tips: [
            'Enable auto-index for seamless updates',
            'Re-index after importing many notes',
            'Monitor storage usage in settings',
          ],
        };
    }
  };

  const content = getContent();

  return (
    <div
      className="fixed bottom-4 right-4 max-w-sm rounded-lg shadow-xl border-2 p-4 z-50 
                 animate-slide-up backdrop-blur-sm"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937ee' : '#ffffffee',
        borderColor: theme === 'dark' ? '#7c3aed' : '#a78bfa',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 
                   transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: theme === 'dark' ? '#7c3aed30' : '#f3e8ff',
          }}
        >
          {content.icon}
        </div>
        <div className="flex-1">
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            {content.title}
          </h3>
          <p className="text-sm" style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
            {content.description}
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-2 mb-4">
        {content.tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2">
            <Info
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: theme === 'dark' ? '#a78bfa' : '#7c3aed' }}
            />
            <span className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {tip}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: theme === 'dark' ? '#7c3aed' : '#8b5cf6',
            color: '#ffffff',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#6d28d9' : '#7c3aed';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#7c3aed' : '#8b5cf6';
          }}
        >
          Got it!
        </button>
        <button
          onClick={() => {
            localStorage.setItem('vectorSearchTooltip_all_seen', 'true');
            handleDismiss();
          }}
          className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Don't show again
        </button>
      </div>
    </div>
  );
};

export default VectorSearchTooltip;
