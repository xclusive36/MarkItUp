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
  LogOut,
  UserCircle,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SimpleDropdown } from './SimpleDropdown';
import ThemeToggle from './ThemeToggle';
import { ViewMode, MainView, ButtonAction } from '@/types/ui';

interface HeaderProps {
  theme: 'light' | 'dark';
  currentView: MainView;
  viewMode: ViewMode;
  // Removed unused settings prop to fix TS error
  isMounted: boolean;
  isDailyNotesLoaded?: boolean; // Whether Daily Notes plugin is loaded
  onViewChange: (view: MainView) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onButtonClick: (buttonType: ButtonAction) => void;
  onAnalyticsTrack: (event: string, data?: Record<string, unknown>) => void;
}

export function AppHeader({
  theme,
  currentView,
  isDailyNotesLoaded = false,
  // isMounted, // Currently unused
  onViewChange,
  onButtonClick,
  onAnalyticsTrack,
}: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [isAuthEnabled, setIsAuthEnabled] = useState(true);

  // Check if authentication is enabled and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      // Check if auth is disabled via env variable
      const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
      setIsAuthEnabled(!disableAuth);

      if (disableAuth) {
        return; // Don't fetch user if auth is disabled
      }

      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserMenuItems = () => {
    if (!isAuthEnabled) {
      return []; // No user menu if auth is disabled
    }

    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        onClick: () => router.push('/dashboard'),
      },
      {
        id: 'profile',
        label: 'User Profile',
        icon: <UserCircle className="w-4 h-4" />,
        onClick: () => onButtonClick('user-profile'),
      },
      {
        id: 'collab-settings',
        label: 'Collaboration Settings',
        icon: <Users className="w-4 h-4" />,
        onClick: () => onButtonClick('collab-settings'),
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <LogOut className="w-4 h-4" />,
        onClick: handleLogout,
      },
    ];
  };
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
        // Open global search panel instead of changing view
        window.dispatchEvent(new CustomEvent('openGlobalSearch'));
        onAnalyticsTrack('global_search_opened', { trigger: 'header_button' });
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
        className="text-xl sm:text-2xl font-bold shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 no-underline hover:no-underline"
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

        {/* User Menu - Only show when auth is enabled */}
        {isAuthEnabled && (
          <SimpleDropdown
            trigger={{
              icon: <UserCircle className="w-4 h-4" />,
              title: user ? user.email : 'Account',
            }}
            items={getUserMenuItems()}
            theme={theme}
          />
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}
