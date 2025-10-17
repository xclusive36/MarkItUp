'use client';

import React from 'react';
import { Home, Search, PlusCircle, Network, Menu } from 'lucide-react';

interface BottomNavProps {
  currentView: 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';
  onViewChange: (view: 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes') => void;
  onNewNote: () => void;
  onOpenMenu: () => void;
  theme: 'light' | 'dark';
}

export default function BottomNav({
  currentView,
  onViewChange,
  onNewNote,
  onOpenMenu,
  theme,
}: BottomNavProps) {
  const navItems = [
    {
      id: 'editor',
      label: 'Editor',
      icon: Home,
      action: () => onViewChange('editor'),
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: () => onViewChange('search'),
    },
    {
      id: 'new',
      label: 'New',
      icon: PlusCircle,
      action: onNewNote,
      isSpecial: true, // Makes it stand out
    },
    {
      id: 'graph',
      label: 'Graph',
      icon: Network,
      action: () => onViewChange('graph'),
    },
    {
      id: 'more',
      label: 'More',
      icon: Menu,
      action: onOpenMenu,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t safe-area-bottom"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.isSpecial && false); // New button never "active"

          return (
            <button
              key={item.id}
              onClick={item.action}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 active:scale-95"
              style={{
                color: isActive
                  ? theme === 'dark'
                    ? '#60a5fa'
                    : '#3b82f6'
                  : theme === 'dark'
                    ? '#9ca3af'
                    : '#6b7280',
              }}
            >
              {item.isSpecial ? (
                <div
                  className="rounded-full p-2 mb-1"
                  style={{
                    backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                    color: '#ffffff',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : ''}`} />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
