import { 
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  dailyNotesPlugin,
  tocPlugin,
  backupPlugin,
  citationsPlugin,
  kanbanPlugin,
  aiWritingPlugin,
  spacedRepetitionPlugin
} from './example-plugins';

// Plugin Registry
export const AVAILABLE_PLUGINS = [
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  dailyNotesPlugin,
  tocPlugin,
  backupPlugin,
  citationsPlugin,
  kanbanPlugin,
  aiWritingPlugin,
  spacedRepetitionPlugin
];

// Plugin Categories
export const PLUGIN_CATEGORIES = {
  'Core': [wordCountPlugin, markdownExportPlugin],
  'Productivity': [dailyNotesPlugin, tocPlugin, kanbanPlugin],
  'Utility': [backupPlugin, citationsPlugin],
  'AI & Learning': [aiWritingPlugin, spacedRepetitionPlugin],
  'Theming': [darkThemePlugin]
};

// Featured Plugins
export const FEATURED_PLUGINS = [
  wordCountPlugin,
  dailyNotesPlugin,
  markdownExportPlugin,
  tocPlugin,
  aiWritingPlugin
];

// Plugin metadata for the store
export const PLUGIN_METADATA = {
  [wordCountPlugin.id]: {
    category: 'Core',
    featured: true,
    downloadCount: 1250,
    rating: 4.8,
    lastUpdated: '2025-01-06',
    screenshots: ['/plugins/word-count-1.png', '/plugins/word-count-2.png'],
    tags: ['statistics', 'productivity', 'writing']
  },
  [markdownExportPlugin.id]: {
    category: 'Core',
    featured: true,
    downloadCount: 2100,
    rating: 4.9,
    lastUpdated: '2025-01-05',
    screenshots: ['/plugins/export-1.png'],
    tags: ['export', 'pdf', 'sharing']
  },
  [dailyNotesPlugin.id]: {
    category: 'Productivity',
    featured: true,
    downloadCount: 1800,
    rating: 4.7,
    lastUpdated: '2025-01-04',
    screenshots: ['/plugins/daily-notes-1.png'],
    tags: ['daily', 'journaling', 'templates']
  },
  [tocPlugin.id]: {
    category: 'Productivity',
    featured: true,
    downloadCount: 950,
    rating: 4.6,
    lastUpdated: '2025-01-03',
    screenshots: ['/plugins/toc-1.png'],
    tags: ['navigation', 'organization', 'headings']
  },
  [kanbanPlugin.id]: {
    category: 'Productivity',
    featured: false,
    downloadCount: 650,
    rating: 4.5,
    lastUpdated: '2025-01-02',
    screenshots: ['/plugins/kanban-1.png'],
    tags: ['kanban', 'tasks', 'project-management']
  },
  [backupPlugin.id]: {
    category: 'Utility',
    featured: false,
    downloadCount: 800,
    rating: 4.4,
    lastUpdated: '2025-01-01',
    screenshots: ['/plugins/backup-1.png'],
    tags: ['backup', 'cloud', 'safety']
  },
  [citationsPlugin.id]: {
    category: 'Utility',
    featured: false,
    downloadCount: 450,
    rating: 4.3,
    lastUpdated: '2024-12-30',
    screenshots: ['/plugins/citations-1.png'],
    tags: ['academic', 'references', 'bibliography']
  },
  [darkThemePlugin.id]: {
    category: 'Theming',
    featured: false,
    downloadCount: 1200,
    rating: 4.2,
    lastUpdated: '2024-12-28',
    screenshots: ['/plugins/dark-theme-1.png'],
    tags: ['theme', 'dark-mode', 'customization']
  },
  [aiWritingPlugin.id]: {
    category: 'AI & Learning',
    featured: true,
    downloadCount: 890,
    rating: 4.9,
    lastUpdated: '2025-01-07',
    screenshots: ['/plugins/ai-writing-1.png', '/plugins/ai-writing-2.png'],
    tags: ['ai', 'writing', 'assistance', 'grammar', 'enhancement']
  },
  [spacedRepetitionPlugin.id]: {
    category: 'AI & Learning',
    featured: false,
    downloadCount: 320,
    rating: 4.7,
    lastUpdated: '2025-01-06',
    screenshots: ['/plugins/spaced-repetition-1.png'],
    tags: ['learning', 'flashcards', 'memory', 'study', 'education']
  }
};

// Plugin search functionality
export function searchPlugins(query: string) {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_PLUGINS.filter(plugin => 
    plugin.name.toLowerCase().includes(lowerQuery) ||
    plugin.description.toLowerCase().includes(lowerQuery) ||
    plugin.author.toLowerCase().includes(lowerQuery) ||
    PLUGIN_METADATA[plugin.id]?.tags.some(tag => tag.includes(lowerQuery))
  );
}

// Get plugins by category
export function getPluginsByCategory(category: keyof typeof PLUGIN_CATEGORIES) {
  return PLUGIN_CATEGORIES[category] || [];
}

// Get plugin details with metadata
export function getPluginDetails(pluginId: string) {
  const plugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
  const metadata = PLUGIN_METADATA[pluginId];
  
  if (!plugin) return null;
  
  return {
    ...plugin,
    metadata
  };
}
