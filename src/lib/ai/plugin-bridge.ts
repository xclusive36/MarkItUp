// Plugin Bridge for MarkItUp PKM System
// Bridges between Phase 5 plugins and AI Plugin system

import { PluginManifest } from '../types';
import { AIPluginMetadata } from './plugin-manager-unified';
import { AVAILABLE_PLUGINS, PLUGIN_METADATA } from '../../plugins/plugin-registry';

export class PluginBridge {
  // Convert Phase 5 plugin to AI Plugin format
  static convertToAIPlugin(plugin: PluginManifest): AIPluginMetadata {
    const metadata = PLUGIN_METADATA[plugin.id as keyof typeof PLUGIN_METADATA];
    
    return {
      ...plugin,
      // Map category from Phase 5 to AI categories
      category: this.mapCategory(metadata?.category),
      enabled: false, // Default to disabled
      config: {},
      
      // AI-specific enhancements
      aiIntegration: this.detectAICapabilities(plugin),
      analytics: {
        trackUsage: true,
        collectMetrics: ['usage_count', 'execution_time', 'success_rate']
      },
      contentGeneration: this.hasContentGeneration(plugin),
      requiredPermissions: plugin.permissions?.map(p => p.type) || [],
      tags: metadata?.tags || [],
    };
  }

  // Convert AI Plugin back to Phase 5 format
  static convertToPhase5Plugin(aiPlugin: AIPluginMetadata): PluginManifest {
    const { category, enabled, config, aiIntegration, analytics, contentGeneration, requiredPermissions, tags, ...phase5Plugin } = aiPlugin;
    
    return {
      ...phase5Plugin,
      // Ensure required Phase 5 properties are present
      permissions: requiredPermissions?.map(type => ({
        type: type as any,
        description: `Required for ${type} operations`
      })) || [],
    };
  }

  // Map plugin categories between systems
  private static mapCategory(phase5Category?: string): AIPluginMetadata['category'] {
    const categoryMap: Record<string, AIPluginMetadata['category']> = {
      'Core': 'Core',
      'Productivity': 'Productivity', 
      'Utility': 'Utility',
      'AI & Learning': 'AI & Learning',
      'Theming': 'Theming',
      // Additional mappings
      'Writing': 'knowledge-enhancement',
      'Analysis': 'analysis',
      'Automation': 'automation',
      'Chat': 'ai-chat',
    };

    return categoryMap[phase5Category || ''] || 'Utility';
  }

  // Detect AI capabilities from plugin manifest
  private static detectAICapabilities(plugin: PluginManifest): AIPluginMetadata['aiIntegration'] {
    // Check plugin ID and description for AI-related keywords
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'claude', 'llm', 'language model'];
    const contentKeywords = ['generate', 'create', 'write', 'compose', 'enhance'];
    const analysisKeywords = ['analyze', 'summarize', 'extract', 'classify'];
    const automationKeywords = ['automate', 'schedule', 'trigger', 'batch'];

    const text = (plugin.name + ' ' + plugin.description + ' ' + plugin.id).toLowerCase();
    
    if (contentKeywords.some(keyword => text.includes(keyword))) {
      return {
        type: 'content-generation',
        description: 'Generates or enhances content using AI',
        inputTypes: ['text', 'markdown'],
        outputTypes: ['text', 'markdown']
      };
    }
    
    if (analysisKeywords.some(keyword => text.includes(keyword))) {
      return {
        type: 'analysis',
        description: 'Analyzes content and provides insights',
        inputTypes: ['text', 'markdown'],
        outputTypes: ['json', 'text']
      };
    }
    
    if (automationKeywords.some(keyword => text.includes(keyword))) {
      return {
        type: 'automation',
        description: 'Automates tasks and workflows',
        inputTypes: ['trigger', 'event'],
        outputTypes: ['action', 'result']
      };
    }
    
    return {
      type: 'enhancement',
      description: 'Enhances user experience and functionality',
      inputTypes: ['any'],
      outputTypes: ['any']
    };
  }

  // Check if plugin has content generation capabilities
  private static hasContentGeneration(plugin: PluginManifest): boolean {
    const contentKeywords = ['generate', 'create', 'write', 'compose', 'ai', 'gpt'];
    const text = (plugin.name + ' ' + plugin.description).toLowerCase();
    return contentKeywords.some(keyword => text.includes(keyword));
  }

  // Get all Phase 5 plugins as AI plugins
  static getAllAsAIPlugins(): AIPluginMetadata[] {
    return AVAILABLE_PLUGINS.map(plugin => this.convertToAIPlugin(plugin));
  }

  // Get AI-enhanced versions of specific plugin types
  static getAIPlugins(): AIPluginMetadata[] {
    return this.getAllAsAIPlugins().filter(plugin => 
      plugin.aiIntegration?.type === 'content-generation' || 
      plugin.aiIntegration?.type === 'analysis' ||
      plugin.id.includes('ai') ||
      plugin.name.toLowerCase().includes('ai')
    );
  }

  // Get productivity plugins that could benefit from AI enhancement
  static getEnhanceablePlugins(): AIPluginMetadata[] {
    return this.getAllAsAIPlugins().filter(plugin =>
      plugin.category === 'Productivity' || 
      plugin.category === 'Core' ||
      plugin.contentGeneration
    );
  }

  // Create a unified plugin registry that combines both systems
  static createUnifiedRegistry(): {
    phase5Plugins: PluginManifest[];
    aiPlugins: AIPluginMetadata[];
    bridgedPlugins: AIPluginMetadata[];
  } {
    const phase5Plugins = AVAILABLE_PLUGINS;
    const bridgedPlugins = this.getAllAsAIPlugins();
    
    // AI-specific plugins (these would be AI-native plugins)
    const aiPlugins: AIPluginMetadata[] = [
      {
        id: 'ai-content-generator',
        name: 'AI Content Generator',
        version: '1.0.0',
        description: 'Generate content using AI language models',
        author: 'MarkItUp AI Team',
        main: 'ai-content-generator.js',
        category: 'AI & Learning',
        enabled: false,
        config: {},
        aiIntegration: {
          type: 'content-generation',
          description: 'Generates content using OpenAI GPT or Claude',
          inputTypes: ['prompt', 'outline', 'template'],
          outputTypes: ['markdown', 'text', 'html']
        },
        analytics: {
          trackUsage: true,
          collectMetrics: ['generation_count', 'token_usage', 'user_satisfaction']
        },
        contentGeneration: true,
        tags: ['ai', 'content', 'generation', 'gpt', 'claude']
      },
      {
        id: 'ai-knowledge-extractor',
        name: 'AI Knowledge Extractor',
        version: '1.0.0',
        description: 'Extract key concepts and relationships from notes using AI',
        author: 'MarkItUp AI Team',
        main: 'ai-knowledge-extractor.js',
        category: 'analysis',
        enabled: false,
        config: {},
        aiIntegration: {
          type: 'analysis',
          description: 'Analyzes notes to extract entities, concepts, and relationships',
          inputTypes: ['markdown', 'text'],
          outputTypes: ['json', 'graph', 'tags']
        },
        analytics: {
          trackUsage: true,
          collectMetrics: ['analysis_count', 'entities_extracted', 'accuracy_score']
        },
        contentGeneration: false,
        tags: ['ai', 'analysis', 'knowledge', 'extraction', 'nlp']
      }
    ];

    return {
      phase5Plugins,
      aiPlugins,
      bridgedPlugins
    };
  }
}

// Export utility functions
export function isAIPlugin(plugin: PluginManifest | AIPluginMetadata): plugin is AIPluginMetadata {
  return 'aiIntegration' in plugin || 'analytics' in plugin || 'contentGeneration' in plugin;
}

export function isPhase5Plugin(plugin: PluginManifest | AIPluginMetadata): plugin is PluginManifest {
  return !isAIPlugin(plugin);
}

// Create the unified registry
export const unifiedPluginRegistry = PluginBridge.createUnifiedRegistry();
