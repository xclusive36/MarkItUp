import { Note } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export interface AIPluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'ai-assistant' | 'content-generation' | 'analysis' | 'visualization' | 'automation' | 'integration' | 'utility';
  tags: string[];
  capabilities: {
    chat?: boolean;
    generation?: boolean;
    analysis?: boolean;
    visualization?: boolean;
    automation?: boolean;
    realtime?: boolean;
  };
  aiRequirements?: {
    requiresApiKey: boolean;
    supportedProviders?: string[];
    minTokens?: number;
  };
  settings?: Record<string, {
    type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'apikey';
    label?: string;
    description?: string;
    required?: boolean;
    default?: any;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  homepage?: string;
  repository?: string;
  license: string;
  pricing: 'free' | 'paid' | 'freemium';
  rating: number;
  downloads: number;
}

export interface AIPluginAPI {
  ai: {
    chat: (messages: Array<{ role: string; content: string }>) => Promise<string>;
    generate: (prompt: string, options?: any) => Promise<string>;
    analyze: (content: string, type: string) => Promise<any>;
  };
  notes: {
    get: (id: string) => Promise<Note | null>;
    getAll: () => Promise<Note[]>;
    create: (content: string, title?: string) => Promise<Note>;
    update: (id: string, updates: Partial<Note>) => Promise<Note>;
    search: (query: string) => Promise<any[]>;
  };
  ui: {
    showNotification: (message: string, type: 'info' | 'success' | 'error') => void;
  };
  settings: {
    get: (key: string) => any;
    set: (key: string, value: any) => Promise<void>;
  };
}

export interface AIPlugin {
  metadata: AIPluginMetadata;
  execute?: (action: string, params: any, api: AIPluginAPI) => Promise<any>;
}

export class AIPluginManager {
  private installedPlugins: Map<string, AIPlugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private pluginSettings: Map<string, Record<string, any>> = new Map();
  
  constructor() {
    this.loadPersistedState();
  }

  private loadPersistedState() {
    try {
      // Load installed plugins
      const installedData = localStorage.getItem('markitup-installed-plugins');
      if (installedData) {
        const installedIds = JSON.parse(installedData);
        for (const pluginId of installedIds) {
          const pluginMetadata = this.mockPlugins.find(p => p.id === pluginId);
          if (pluginMetadata) {
            const plugin: AIPlugin = {
              metadata: pluginMetadata,
              execute: async (action: string, params: any, api: AIPluginAPI) => {
                console.log(`Executing ${action} on ${pluginId}`, params);
                return { success: true };
              }
            };
            this.installedPlugins.set(pluginId, plugin);
            this.enabledPlugins.add(pluginId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load persisted plugin state:', error);
    }
  }

  private savePersistedState() {
    try {
      const installedIds = Array.from(this.installedPlugins.keys());
      localStorage.setItem('markitup-installed-plugins', JSON.stringify(installedIds));
    } catch (error) {
      console.error('Failed to save plugin state:', error);
    }
  }
  
  private mockPlugins: AIPluginMetadata[] = [
    {
      id: 'ai-writing-assistant',
      name: 'AI Writing Assistant',
      version: '2.1.0',
      description: 'Enhanced writing assistance with style analysis, grammar checking, and content suggestions',
      author: 'MarkItUp Team',
      category: 'ai-assistant',
      capabilities: {
        chat: true,
        generation: true,
        analysis: true,
        automation: true
      },
      settings: {
        writingStyle: {
          type: 'select',
          label: 'Writing Style',
          description: 'Preferred writing style for suggestions',
          default: 'professional',
          options: [
            { value: 'casual', label: 'Casual' },
            { value: 'professional', label: 'Professional' },
            { value: 'academic', label: 'Academic' },
            { value: 'creative', label: 'Creative' }
          ]
        },
        apiKey: {
          type: 'apikey',
          label: 'OpenAI API Key',
          description: 'Your OpenAI API key for enhanced features',
          required: true,
          placeholder: 'sk-...'
        },
        enableRealtime: {
          type: 'boolean',
          label: 'Real-time Suggestions',
          description: 'Show writing suggestions as you type',
          default: true
        }
      },
      tags: ['writing', 'ai', 'assistance', 'grammar'],
      rating: 4.8,
      downloads: 15420,
      pricing: 'free',
      license: 'MIT',
      aiRequirements: {
        requiresApiKey: true,
        supportedProviders: ['openai', 'anthropic'],
        minTokens: 1000
      },
      homepage: 'https://example.com/ai-writing-assistant',
      repository: 'https://github.com/example/ai-writing-assistant'
    },
    {
      id: 'smart-link-detector',
      name: 'Smart Link Detector',
      version: '1.3.2',
      description: 'Automatically detects and suggests relevant links between notes using AI analysis',
      author: 'Community',
      category: 'automation',
      capabilities: {
        analysis: true,
        automation: true
      },
      tags: ['linking', 'automation', 'ai', 'connections'],
      rating: 4.5,
      downloads: 8930,
      pricing: 'free',
      license: 'Apache-2.0',
      aiRequirements: {
        requiresApiKey: false,
        supportedProviders: ['openai'],
        minTokens: 500
      }
    },
    {
      id: 'knowledge-graph-analytics',
      name: 'Knowledge Graph Analytics',
      version: '1.0.5',
      description: 'Advanced analytics and insights for your knowledge graph with AI-powered recommendations',
      author: 'Analytics Pro',
      category: 'analysis',
      capabilities: {
        analysis: true,
        visualization: true
      },
      tags: ['analytics', 'visualization', 'insights', 'ai'],
      rating: 4.7,
      downloads: 6240,
      pricing: 'freemium',
      license: 'Commercial',
      aiRequirements: {
        requiresApiKey: true,
        supportedProviders: ['openai', 'anthropic'],
        minTokens: 2000
      }
    },
    {
      id: 'ai-content-generator',
      name: 'AI Content Generator',
      version: '3.0.1',
      description: 'Generate high-quality content including summaries, outlines, and full articles using advanced AI',
      author: 'Content AI Inc.',
      category: 'content-generation',
      capabilities: {
        generation: true,
        chat: true
      },
      tags: ['generation', 'content', 'ai', 'templates'],
      rating: 4.9,
      downloads: 22100,
      pricing: 'paid',
      license: 'Commercial',
      aiRequirements: {
        requiresApiKey: true,
        supportedProviders: ['openai', 'anthropic', 'google'],
        minTokens: 3000
      }
    }
  ];

  async discoverPlugins(query = '', category = ''): Promise<AIPluginMetadata[]> {
    let filtered = [...this.mockPlugins];
    
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(plugin =>
        plugin.name.toLowerCase().includes(searchLower) ||
        plugin.description.toLowerCase().includes(searchLower) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (category) {
      filtered = filtered.filter(plugin => plugin.category === category);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return filtered;
  }

  async suggestPlugins(context: { notes: Note[] }): Promise<AIPluginMetadata[]> {
    const suggestions: AIPluginMetadata[] = [];
    const noteCount = context.notes.length;
    const hasLongNotes = context.notes.some(note => note.content.length > 2000);
    
    if (noteCount > 20) {
      const analytics = this.mockPlugins.find(p => p.id === 'knowledge-graph-analytics');
      if (analytics) suggestions.push(analytics);
    }
    
    if (hasLongNotes) {
      const writing = this.mockPlugins.find(p => p.id === 'ai-writing-assistant');
      if (writing) suggestions.push(writing);
    }
    
    const linking = this.mockPlugins.find(p => p.id === 'smart-link-detector');
    if (linking) suggestions.push(linking);
    
    return suggestions;
  }

  async installPlugin(pluginId: string): Promise<boolean> {
    try {
      const pluginMetadata = this.mockPlugins.find(p => p.id === pluginId);
      if (!pluginMetadata) {
        throw new Error('Plugin not found');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const plugin: AIPlugin = {
        metadata: pluginMetadata,
        execute: async (action: string, params: any, api: AIPluginAPI) => {
          console.log(`Executing ${action} on ${pluginId}`, params);
          return { success: true };
        }
      };

      this.installedPlugins.set(pluginId, plugin);
      this.enabledPlugins.add(pluginId);

      // Save to localStorage
      this.savePersistedState();

      analytics.trackEvent('ai_analysis', {
        action: 'plugin_installed',
        pluginId,
        pluginName: pluginMetadata.name
      });

      return true;
    } catch (error) {
      console.error('Failed to install plugin:', error);
      return false;
    }
  }

  async uninstallPlugin(pluginId: string): Promise<boolean> {
    try {
      this.installedPlugins.delete(pluginId);
      this.enabledPlugins.delete(pluginId);
      this.pluginSettings.delete(pluginId);

      // Save to localStorage
      this.savePersistedState();

      analytics.trackEvent('ai_analysis', {
        action: 'plugin_uninstalled',
        pluginId
      });

      return true;
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      return false;
    }
  }

  isPluginInstalled(pluginId: string): boolean {
    return this.installedPlugins.has(pluginId);
  }

  isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  async enablePlugin(pluginId: string): Promise<void> {
    this.enabledPlugins.add(pluginId);
    analytics.trackEvent('ai_analysis', {
      action: 'plugin_enabled',
      pluginId
    });
  }

  async disablePlugin(pluginId: string): Promise<void> {
    this.enabledPlugins.delete(pluginId);
    analytics.trackEvent('ai_analysis', {
      action: 'plugin_disabled',
      pluginId
    });
  }

  async updatePluginSettings(pluginId: string, settings: Record<string, any>): Promise<void> {
    this.pluginSettings.set(pluginId, settings);
    analytics.trackEvent('ai_analysis', {
      action: 'plugin_settings_updated',
      pluginId
    });
  }

  async getInstalledPlugins(): Promise<AIPlugin[]> {
    return Array.from(this.installedPlugins.values());
  }
}
