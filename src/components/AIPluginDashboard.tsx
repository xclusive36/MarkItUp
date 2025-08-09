"use client";

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Settings, 
  Sparkles, 
  Package,
  Download,
  Plus,
  X,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note } from '@/lib/types';
import { AIPluginManager } from '@/lib/ai/plugin-manager-simple';
import AIPluginStore from './AIPluginStore';
import PluginManager from './PluginManager';

interface AIPluginDashboardProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AIPluginDashboard({
  notes,
  isOpen,
  onClose
}: AIPluginDashboardProps) {
  const { theme } = useSimpleTheme();
  
  // State
  const [activeView, setActiveView] = useState<'overview' | 'store' | 'manager'>('overview');
  const [pluginManager] = useState(() => new AIPluginManager());
  const [installedCount, setInstalledCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load plugin stats
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  // Refresh stats when switching back to overview
  useEffect(() => {
    if (activeView === 'overview') {
      loadStats();
    }
  }, [activeView]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const installed = await pluginManager.getInstalledPlugins();
      setInstalledCount(installed.length);
    } catch (error) {
      console.error('Failed to load plugin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'ai-writing-assistant',
      name: 'AI Writing Assistant',
      description: 'Get writing help and suggestions',
      icon: Sparkles,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      id: 'smart-link-detector',
      name: 'Smart Link Detector',
      description: 'Auto-discover note connections',
      icon: ExternalLink,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    {
      id: 'knowledge-graph-analytics',
      name: 'Graph Analytics',
      description: 'Analyze your knowledge network',
      icon: Package,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    }
  ];

  const handleQuickInstall = async (pluginId: string) => {
    setIsLoading(true);
    try {
      await pluginManager.installPlugin(pluginId);
      await loadStats(); // Refresh stats immediately
    } catch (error) {
      console.error('Failed to install plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback for when plugins change in child components
  const handlePluginChange = async () => {
    await loadStats();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Dashboard */}
      {activeView === 'overview' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && onClose()}>
          
          <div 
            className="w-full max-w-4xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
            }}>
            
            {/* Header */}
            <div 
              className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
              style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                    AI Plugin Ecosystem
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Extend MarkItUp with powerful AI capabilities
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div 
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 
                      className="font-medium"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Installed Plugins
                    </h3>
                  </div>
                  <p 
                    className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                    style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}>
                    {installedCount}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Active and ready to use
                  </p>
                </div>

                <div 
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Store className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 
                      className="font-medium"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Available Plugins
                    </h3>
                  </div>
                  <p 
                    className="text-2xl font-bold text-green-600 dark:text-green-400"
                    style={{ color: theme === 'dark' ? '#34d399' : '#059669' }}>
                    50+
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Ready to discover
                  </p>
                </div>

                <div 
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 
                      className="font-medium"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Your Notes
                    </h3>
                  </div>
                  <p 
                    className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    style={{ color: theme === 'dark' ? '#a78bfa' : '#7c3aed' }}>
                    {notes.length}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Ready for AI analysis
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 
                  className="text-lg font-medium mb-4"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  Popular Plugins
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map(action => {
                    const isInstalled = pluginManager.isPluginInstalled(action.id);
                    
                    return (
                      <div
                        key={action.id}
                        className="p-4 rounded-lg border hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                        }}>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 
                              className="font-medium text-sm"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                              {action.name}
                            </h4>
                          </div>
                        </div>
                        
                        <p 
                          className="text-xs mb-4"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                          {action.description}
                        </p>
                        
                        {isInstalled ? (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Package className="w-3 h-3" />
                            Installed
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuickInstall(action.id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
                            <Download className="w-3 h-3" />
                            Install
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveView('store')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Store className="w-5 h-5" />
                  Browse Plugin Store
                </button>
                
                <button
                  onClick={() => setActiveView('manager')}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  style={{
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                  }}>
                  <Settings className="w-5 h-5" />
                  Manage Plugins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Store */}
      <AIPluginStore
        notes={notes}
        isOpen={activeView === 'store'}
        onClose={() => setActiveView('overview')}
        pluginManager={pluginManager}
        onPluginChange={handlePluginChange}
      />

      {/* Plugin Manager */}
      <PluginManager
        isOpen={activeView === 'manager'}
        onClose={() => setActiveView('overview')}
        pluginManager={pluginManager}
        onPluginChange={handlePluginChange}
      />
    </>
  );
}
