'use client';

import {
  Network,
  Search,
  Activity,
  Settings,
  Brain,
  Users,
  Command,
  PenTool,
  Compass,
  BookOpen,
  Map,
  BarChart3,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { SimpleDropdown } from './SimpleDropdown';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  theme: 'light' | 'dark';
  currentView: string;
  viewMode: string;
  settings: {
    enableCollaboration: boolean;
  };
  isMounted: boolean;
  isDailyNotesLoaded?: boolean; // Whether Daily Notes plugin is loaded
  onViewChange: (view: string) => void;
  onViewModeChange: (mode: string) => void;
  onButtonClick: (buttonType: string) => void;
  onAnalyticsTrack: (event: string, data?: Record<string, unknown>) => void;
}

export function AppHeader({
  theme,
  currentView,
  settings,
  isDailyNotesLoaded = false,
  // isMounted, // Currently unused
  onViewChange,
  onButtonClick,
  onAnalyticsTrack,
}: HeaderProps) {
  // Get dropdown items
  const getViewsItems = () => [
    {
      id: 'graph',
      label: 'Knowledge Graph',
      icon: <Network className="w-4 h-4" />,
      active: currentView === 'graph',
      onClick: () => {
        onViewChange('graph');
        onAnalyticsTrack('mode_switched', { view: 'graph' });
        onAnalyticsTrack('graph_viewed', {});
      },
    },
    {
      id: 'search',
      label: 'Global Search',
      icon: <Search className="w-4 h-4" />,
      active: currentView === 'search',
      onClick: () => {
        onViewChange('search');
        onAnalyticsTrack('mode_switched', { view: 'search' });
      },
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <Activity className="w-4 h-4" />,
      active: currentView === 'analytics',
      onClick: () => {
        onViewChange('analytics');
        onAnalyticsTrack('mode_switched', { view: 'analytics' });
      },
    },
    {
      id: 'plugins',
      label: 'Plugin Manager',
      icon: <Settings className="w-4 h-4" />,
      active: currentView === 'plugins',
      onClick: () => {
        onViewChange('plugins');
        onAnalyticsTrack('mode_switched', { view: 'plugins' });
      },
    },
  ];

  const getAIToolsItems = () => [
    {
      id: 'ai-chat',
      label: 'AI Assistant',
      icon: <Brain className="w-4 h-4" />,
      onClick: () => onButtonClick('ai-chat'),
    },
    {
      id: 'writing-assistant',
      label: 'Writing Assistant',
      icon: <PenTool className="w-4 h-4" />,
      onClick: () => onButtonClick('writing-assistant'),
    },
    {
      id: 'knowledge-discovery',
      label: 'Knowledge Discovery',
      icon: <Compass className="w-4 h-4" />,
      onClick: () => onButtonClick('knowledge-discovery'),
    },
    {
      id: 'research-assistant',
      label: 'Research Assistant',
      icon: <BookOpen className="w-4 h-4" />,
      onClick: () => onButtonClick('research-assistant'),
    },
    {
      id: 'knowledge-map',
      label: 'Knowledge Map',
      icon: <Map className="w-4 h-4" />,
      onClick: () => onButtonClick('knowledge-map'),
    },
    {
      id: 'batch-analyzer',
      label: 'Batch Analyzer',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: () => onButtonClick('batch-analyzer'),
    },
  ];

  const getCollabItems = () => [
    {
      id: 'user-profile',
      label: 'User Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => onButtonClick('user-profile'),
    },
    {
      id: 'collab-settings',
      label: 'Collaboration Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => onButtonClick('collab-settings'),
    },
  ];

  const getCurrentViewIcon = () => {
    switch (currentView) {
      case 'graph':
        return <Network className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      case 'analytics':
        return <Activity className="w-4 h-4" />;
      case 'plugins':
        return <Settings className="w-4 h-4" />;
      default:
        return <Network className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
      {/* App Title as Home Link */}
      <Link
        href="/"
        className="text-xl sm:text-2xl font-bold flex-shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 no-underline hover:no-underline"
        style={{ color: 'var(--text-primary)' }}
        onClick={e => {
          e.preventDefault();
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('setCurrentView', { detail: 'editor' });
            window.dispatchEvent(event);
          }
        }}
      >
        MarkItUp PKM
      </Link>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-2 ml-auto">
        {/* Views Dropdown */}
        <SimpleDropdown
          trigger={{
            icon: getCurrentViewIcon(),
            title: `Views & Tools${currentView !== 'editor' ? ` - Current: ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}` : ''}`,
          }}
          items={getViewsItems()}
          theme={theme}
        />

        {/* AI Tools Dropdown */}
        <SimpleDropdown
          trigger={{
            icon: <Brain className="w-4 h-4" />,
            title: 'AI Tools',
          }}
          items={getAIToolsItems()}
          theme={theme}
        />

        {/* Collaboration Dropdown */}
        <SimpleDropdown
          trigger={{
            icon: <Users className="w-4 h-4" />,
            title: `Collaboration - ${settings.enableCollaboration ? 'Active' : 'Solo Mode'}`,
          }}
          items={getCollabItems()}
          theme={theme}
        />

        {/* Command Palette Button */}
        <button
          onClick={() => onButtonClick('command-palette')}
          className="p-2 rounded-md hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
          title="Command Palette (Alt+P)"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Daily Notes Calendar Button - Only show when Daily Notes plugin is loaded */}
        {isDailyNotesLoaded && (
          <button
            onClick={() => onButtonClick('calendar')}
            className="p-2 rounded-md hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
            }}
            title="Daily Notes Calendar"
          >
            <span className="text-sm">📅</span>
          </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}
