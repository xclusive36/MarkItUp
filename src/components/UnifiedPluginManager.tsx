'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Package,
  Zap,
  Brain,
  BarChart3,
  Wand2,
  X,
  Save,
  Eye,
  EyeOff,
  Key,
  Search,
  Filter,
  Star,
  Download,
  Tag,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { AVAILABLE_PLUGINS, FEATURED_PLUGINS, PLUGIN_CATEGORIES, PLUGIN_METADATA } from '../plugins/plugin-registry';
import { PluginManager } from '../lib/plugin-manager';
import { initializePluginSystem, getPluginManager } from '../lib/plugin-init';
import { PluginManifest } from '../lib/types';
import { analytics } from '../lib/analytics';

interface UnifiedPluginManagerProps {
  pluginManager?: PluginManager;
}

interface LoadedPlugin {
  manifest: PluginManifest;
  isActive: boolean;
  isAIPlugin?: boolean;
  category?: string;
  tags?: string[];
  rating?: number;
  downloads?: number;
  pricing?: 'free' | 'freemium' | 'paid';
  featured?: boolean;
}

interface PluginStats {
  totalPlugins: number;
  activePlugins: number;
  regularPlugins: number;
  aiPlugins: number;
  healthyPlugins: number;
  pluginsWithIssues: number;
  featuredPlugins: number;
}

type ViewMode = 'all' | 'regular' | 'ai' | 'featured';
type SortMode = 'name' | 'rating' | 'downloads' | 'category';

const categoryIcons: Record<string, any> = {
  'ai': Brain,
  'content-generation': Wand2,
  'analysis': BarChart3,
  'visualization': BarChart3,
  'automation': Zap,
  'integration': ExternalLink,
  'utility': Package,
  'core': Cpu,
  'productivity': Sparkles
};

export function UnifiedPluginManager({ pluginManager }: UnifiedPluginManagerProps) {
  const { theme } = useSimpleTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'store' | 'installed' | 'settings'>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [loadedPlugins, setLoadedPlugins] = useState<LoadedPlugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PluginStats>({
    totalPlugins: AVAILABLE_PLUGINS.length,
    activePlugins: 0,
    regularPlugins: 0,
    aiPlugins: 0,
    healthyPlugins: 0,
    pluginsWithIssues: 0,
    featuredPlugins: FEATURED_PLUGINS.length
  });

  // Initialize plugin manager if not provided
  const [manager, setManager] = useState<PluginManager | null>(pluginManager || null);

  const initializePluginManager = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!manager) {
        const existingManager = getPluginManager();
        if (existingManager) {
          setManager(existingManager);
        } else {
          await initializePluginSystem();
          const newManager = getPluginManager();
          setManager(newManager);
        }
      }
      
      refreshPlugins();
    } catch (error) {
      console.error('Failed to initialize plugin manager:', error);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  const refreshPlugins = useCallback(() => {
    if (!manager) return;

    try {
      const loaded = manager.getLoadedPlugins();
      const enhancedPlugins: LoadedPlugin[] = loaded.map(plugin => {
        // Enhance plugins with metadata
        const metadata = PLUGIN_METADATA[plugin.id] || {};
        const isAI = plugin.id.includes('ai-') || plugin.id.includes('ml-') || 
                   plugin.id.includes('neural-') || plugin.id.includes('chatbot');
        
        return {
          manifest: plugin,
          isActive: true, // Loaded plugins are active
          isAIPlugin: isAI,
          category: metadata.category || 'Utility',
          tags: metadata.tags || [],
          rating: parseFloat(metadata.rating) || 4.0,
          downloads: parseInt(metadata.downloadCount?.replace(/k/g, '000') || '0') || 0,
          pricing: 'free' as const,
          featured: metadata.featured || false
        };
      });

      setLoadedPlugins(enhancedPlugins);
      
      // Update stats
      const regularCount = enhancedPlugins.filter(p => !p.isAIPlugin).length;
      const aiCount = enhancedPlugins.filter(p => p.isAIPlugin).length;
      
      setStats({
        totalPlugins: AVAILABLE_PLUGINS.length,
        activePlugins: enhancedPlugins.length,
        regularPlugins: regularCount,
        aiPlugins: aiCount,
        healthyPlugins: enhancedPlugins.length, // Assume loaded = healthy
        pluginsWithIssues: 0,
        featuredPlugins: FEATURED_PLUGINS.length
      });

      analytics.trackEvent('mode_switched', {
        view: 'plugin_refresh',
        total: enhancedPlugins.length,
        regular: regularCount,
        ai: aiCount
      });
      
    } catch (error) {
      console.error('Failed to refresh plugins:', error);
    }
  }, [manager]);

  useEffect(() => {
    initializePluginManager();
  }, [initializePluginManager]);

  // Filter and sort plugins
  const filteredPlugins = AVAILABLE_PLUGINS.filter(plugin => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!plugin.name.toLowerCase().includes(query) && 
          !plugin.description.toLowerCase().includes(query) &&
          !plugin.author.toLowerCase().includes(query)) {
        return false;
      }
    }

    // View mode filter
    const isAI = plugin.id.includes('ai-') || plugin.id.includes('ml-') || 
                plugin.id.includes('neural-') || plugin.id.includes('chatbot');
    
    if (viewMode === 'ai' && !isAI) return false;
    if (viewMode === 'regular' && isAI) return false;
    if (viewMode === 'featured' && !FEATURED_PLUGINS.includes(plugin)) return false;

    // Category filter
    if (selectedCategory !== 'all') {
      const metadata = PLUGIN_METADATA[plugin.id];
      if (!metadata || metadata.category !== selectedCategory) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortMode) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        const ratingA = parseFloat(PLUGIN_METADATA[a.id]?.rating || '4.0');
        const ratingB = parseFloat(PLUGIN_METADATA[b.id]?.rating || '4.0');
        return ratingB - ratingA;
      case 'downloads':
        const downloadsA = parseInt(PLUGIN_METADATA[a.id]?.downloadCount?.replace(/k/g, '000') || '0');
        const downloadsB = parseInt(PLUGIN_METADATA[b.id]?.downloadCount?.replace(/k/g, '000') || '0');
        return downloadsB - downloadsA;
      case 'category':
        const categoryA = PLUGIN_METADATA[a.id]?.category || 'Utility';
        const categoryB = PLUGIN_METADATA[b.id]?.category || 'Utility';
        return categoryA.localeCompare(categoryB);
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(Object.values(PLUGIN_METADATA).map(m => m.category).filter(Boolean)));

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Unified Plugin Manager
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Manage all {stats.totalPlugins} plugins from one unified interface
            </p>
          </div>
          <button
            onClick={refreshPlugins}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            title="Total Plugins"
            value={stats.totalPlugins}
            icon={Package}
            color="blue"
            theme={theme}
          />
          <StatCard
            title="Active"
            value={stats.activePlugins}
            icon={CheckCircle}
            color="green"
            theme={theme}
          />
          <StatCard
            title="Regular"
            value={stats.regularPlugins}
            icon={Cpu}
            color="purple"
            theme={theme}
          />
          <StatCard
            title="AI Plugins"
            value={stats.aiPlugins}
            icon={Brain}
            color="pink"
            theme={theme}
          />
          <StatCard
            title="Featured"
            value={stats.featuredPlugins}
            icon={Star}
            color="yellow"
            theme={theme}
          />
          <StatCard
            title="Healthy"
            value={stats.healthyPlugins}
            icon={CheckCircle}
            color="green"
            theme={theme}
          />
          <StatCard
            title="Issues"
            value={stats.pluginsWithIssues}
            icon={AlertTriangle}
            color="red"
            theme={theme}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'store', label: 'Plugin Store', icon: Package },
            { id: 'installed', label: 'Installed', icon: CheckCircle },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? theme === 'dark'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-blue-500 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      {(activeTab === 'store' || activeTab === 'installed') && (
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All', icon: Package },
                { id: 'regular', label: 'Regular', icon: Cpu },
                { id: 'ai', label: 'AI', icon: Brain },
                { id: 'featured', label: 'Featured', icon: Star }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    viewMode === mode.id
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 border rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className={`px-3 py-2 border rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="downloads">Sort by Downloads</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats}
            loadedPlugins={loadedPlugins}
            isLoading={isLoading}
            theme={theme}
          />
        )}

        {activeTab === 'store' && (
          <PluginStoreTab 
            plugins={filteredPlugins}
            loadedPlugins={loadedPlugins}
            manager={manager}
            theme={theme}
            onPluginAction={refreshPlugins}
          />
        )}

        {activeTab === 'installed' && (
          <InstalledPluginsTab 
            plugins={filteredPlugins.filter(p => loadedPlugins.some(l => l.manifest.id === p.id))}
            loadedPlugins={loadedPlugins}
            manager={manager}
            theme={theme}
            onPluginAction={refreshPlugins}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            theme={theme}
            manager={manager}
          />
        )}
      </div>
    </div>
  );
}

// Individual tab components would be implemented here...
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red';
  theme: string;
}

function StatCard({ title, value, icon: Icon, color, theme }: StatCardProps) {
  const colorClasses: Record<typeof color, string> = {
    blue: theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-700',
    green: theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-50 text-green-700',
    purple: theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-700',
    pink: theme === 'dark' ? 'bg-pink-900 text-pink-300' : 'bg-pink-50 text-pink-700',
    yellow: theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-50 text-yellow-700',
    red: theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-700'
  };

  return (
    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-70">{title}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
    </div>
  );
}

// Placeholder tab components (would be fully implemented)
function OverviewTab({ stats, loadedPlugins, isLoading, theme }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Plugin System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="font-semibold mb-2">System Status</h3>
          <p>✅ Plugin system operational</p>
          <p>📊 {stats.totalPlugins} plugins available</p>
          <p>🔌 {stats.activePlugins} plugins loaded</p>
          <p>🤖 {stats.aiPlugins} AI-powered plugins</p>
        </div>
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p>Last refresh: Just now</p>
          <p>Health: All systems green</p>
          <p>Updates: None available</p>
        </div>
      </div>
    </div>
  );
}

function PluginStoreTab({ plugins, loadedPlugins, manager, theme, onPluginAction }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Plugin Store ({plugins.length} plugins)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin: PluginManifest) => (
          <PluginCard 
            key={plugin.id}
            plugin={plugin}
            isLoaded={loadedPlugins.some((l: any) => l.manifest.id === plugin.id)}
            theme={theme}
            onAction={onPluginAction}
            manager={manager}
          />
        ))}
      </div>
    </div>
  );
}

function InstalledPluginsTab({ plugins, loadedPlugins, manager, theme, onPluginAction }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Installed Plugins ({plugins.length} active)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin: PluginManifest) => (
          <PluginCard 
            key={plugin.id}
            plugin={plugin}
            isLoaded={true}
            theme={theme}
            onAction={onPluginAction}
            manager={manager}
            showAdvanced={true}
          />
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ theme, manager }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Plugin System Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="font-semibold mb-4">API Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className={`w-full px-3 py-2 border rounded-md ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anthropic API Key</label>
              <input
                type="password"
                placeholder="sk-ant-..."
                className={`w-full px-3 py-2 border rounded-md ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="font-semibold mb-4">System Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Auto-update plugins
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Enable plugin analytics
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Beta plugin access
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PluginCard({ plugin, isLoaded, theme, onAction, manager, showAdvanced = false }: any) {
  const metadata = PLUGIN_METADATA[plugin.id] || {};
  const isAI = plugin.id.includes('ai-') || plugin.id.includes('ml-') || 
              plugin.id.includes('neural-') || plugin.id.includes('chatbot');

  const handleLoad = async () => {
    if (manager && !isLoaded) {
      try {
        await manager.loadPlugin(plugin);
        onAction?.();
      } catch (error) {
        console.error('Failed to load plugin:', error);
      }
    }
  };

  const handleUnload = async () => {
    if (manager && isLoaded) {
      try {
        await manager.unloadPlugin(plugin.id);
        onAction?.();
      } catch (error) {
        console.error('Failed to unload plugin:', error);
      }
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{plugin.name}</h3>
            {isAI && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                AI
              </span>
            )}
            {metadata.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          <p className="text-sm opacity-70 line-clamp-2">{plugin.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs opacity-70 mb-3">
        <span>{plugin.author}</span>
        <span>v{plugin.version}</span>
      </div>

      {metadata.rating && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-sm ml-1">{metadata.rating}</span>
          </div>
          {metadata.downloadCount && (
            <div className="flex items-center">
              <Download className="h-3 w-3" />
              <span className="text-sm ml-1">{metadata.downloadCount}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs opacity-70">
          {metadata.category || 'Utility'}
        </div>
        <div className="flex gap-2">
          {isLoaded ? (
            <>
              {showAdvanced && (
                <button
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Plugin Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleUnload}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Unload
              </button>
            </>
          ) : (
            <button
              onClick={handleLoad}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Load
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnifiedPluginManager;
