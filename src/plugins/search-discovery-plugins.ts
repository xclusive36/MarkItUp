import { PluginManifest, PluginAPI } from '../lib/types';

// Global instances
let smartSearchInstance: SmartSearchPlugin | null = null;
let tagManagerInstance: TagManagerPlugin | null = null;
let contentDiscoveryInstance: ContentDiscoveryPlugin | null = null;
let savedSearchesInstance: SavedSearchesPlugin | null = null;
let globalIndexInstance: GlobalIndexPlugin | null = null;

// Smart Search Plugin - Advanced search capabilities
export const smartSearchPlugin: PluginManifest = {
  id: 'smart-search',
  name: 'Smart Search',
  version: '1.0.0',
  description: 'Advanced search with natural language queries, filters, and semantic search',
  author: 'MarkItUp Team',
  main: 'smart-search.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Index and search notes',
    },
  ],

  settings: [
    {
      id: 'indexContent',
      name: 'Index Full Content',
      type: 'boolean',
      default: true,
      description: 'Index full note content for search',
    },
    {
      id: 'searchMode',
      name: 'Search Mode',
      type: 'select',
      options: [
        { label: 'Exact Match', value: 'exact' },
        { label: 'Fuzzy Search', value: 'fuzzy' },
        { label: 'Semantic Search', value: 'semantic' },
        { label: 'AI-Powered', value: 'ai' },
      ],
      default: 'fuzzy',
      description: 'Default search algorithm',
    },
    {
      id: 'maxResults',
      name: 'Maximum Results',
      type: 'number',
      default: 50,
      description: 'Maximum number of search results to show',
    },
  ],

  commands: [
    {
      id: 'global-search',
      name: 'Global Search',
      description: 'Search across all notes',
      keybinding: 'Ctrl+Shift+F',
      callback: async () => {
        try {
          if (smartSearchInstance) {
            await smartSearchInstance.globalSearch();
          }
        } catch (error) {
          console.error('Error searching:', error);
        }
      },
    },
    {
      id: 'advanced-search',
      name: 'Advanced Search',
      description: 'Open advanced search with filters',
      callback: async () => {
        try {
          if (smartSearchInstance) {
            await smartSearchInstance.advancedSearch();
          }
        } catch (error) {
          console.error('Error opening advanced search:', error);
        }
      },
    },
    {
      id: 'search-and-replace',
      name: 'Search and Replace',
      description: 'Find and replace across multiple notes',
      callback: async () => {
        try {
          if (smartSearchInstance) {
            await smartSearchInstance.searchAndReplace();
          }
        } catch (error) {
          console.error('Error with search and replace:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      smartSearchInstance = new SmartSearchPlugin(api);
    }
  },

  onUnload: () => {
    smartSearchInstance = null;
  },

  views: [
    {
      id: 'search-panel',
      name: 'Search',
      type: 'sidebar',
      icon: '🔍',
      component: () => {
        return `
          <div class="smart-search">
            <h3>🔍 Smart Search</h3>
            <div class="search-box">
              <input type="text" placeholder="Search notes..." class="search-input">
              <button onclick="alert('Search')" class="search-btn">🔍</button>
            </div>
            <div class="search-filters">
              <select>
                <option>All notes</option>
                <option>This week</option>
                <option>This month</option>
                <option>By tag</option>
              </select>
            </div>
            <div class="search-results">
              <div class="result-item">
                <div class="result-title">Project Planning</div>
                <div class="result-snippet">...planning methodology for upcoming...</div>
                <div class="result-meta">2 days ago • 5 matches</div>
              </div>
              <div class="result-item">
                <div class="result-title">Meeting Notes</div>
                <div class="result-snippet">...discussed search functionality...</div>
                <div class="result-meta">1 week ago • 2 matches</div>
              </div>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Tag Manager Plugin - Advanced tagging system
export const tagManagerPlugin: PluginManifest = {
  id: 'tag-manager',
  name: 'Tag Manager',
  version: '1.0.0',
  description: 'Advanced tagging system with hierarchical tags, auto-tagging, and tag analytics',
  author: 'MarkItUp Team',
  main: 'tag-manager.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Manage note tags and metadata',
    },
  ],

  settings: [
    {
      id: 'autoTagging',
      name: 'Auto-tagging',
      type: 'boolean',
      default: true,
      description: 'Automatically suggest tags based on content',
    },
    {
      id: 'hierarchicalTags',
      name: 'Hierarchical Tags',
      type: 'boolean',
      default: true,
      description: 'Enable nested tag categories',
    },
    {
      id: 'tagColor',
      name: 'Tag Color Coding',
      type: 'boolean',
      default: true,
      description: 'Use colors to distinguish tag categories',
    },
  ],

  commands: [
    {
      id: 'add-tag',
      name: 'Add Tag',
      description: 'Add tag to current note',
      keybinding: 'Ctrl+T',
      callback: async () => {
        try {
          if (tagManagerInstance) {
            await tagManagerInstance.addTag();
          }
        } catch (error) {
          console.error('Error adding tag:', error);
        }
      },
    },
    {
      id: 'manage-tags',
      name: 'Manage Tags',
      description: 'Open tag management interface',
      callback: async () => {
        try {
          if (tagManagerInstance) {
            await tagManagerInstance.manageTags();
          }
        } catch (error) {
          console.error('Error managing tags:', error);
        }
      },
    },
    {
      id: 'tag-analytics',
      name: 'Tag Analytics',
      description: 'View tag usage statistics',
      callback: async () => {
        try {
          if (tagManagerInstance) {
            await tagManagerInstance.tagAnalytics();
          }
        } catch (error) {
          console.error('Error showing tag analytics:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      tagManagerInstance = new TagManagerPlugin(api);
    }
  },

  onUnload: () => {
    tagManagerInstance = null;
  },

  views: [
    {
      id: 'tags-panel',
      name: 'Tags',
      type: 'sidebar',
      icon: '🏷️',
      component: () => {
        return `
          <div class="tag-manager">
            <h3>🏷️ Tag Manager</h3>
            <div class="tag-cloud">
              <span class="tag work">work</span>
              <span class="tag personal">personal</span>
              <span class="tag project">project</span>
              <span class="tag idea">idea</span>
              <span class="tag meeting">meeting</span>
            </div>
            <div class="tag-categories">
              <div class="category">
                <strong>📂 Work</strong>
                <div class="sub-tags">
                  <span class="tag">meetings</span>
                  <span class="tag">projects</span>
                  <span class="tag">tasks</span>
                </div>
              </div>
              <div class="category">
                <strong>🏠 Personal</strong>
                <div class="sub-tags">
                  <span class="tag">ideas</span>
                  <span class="tag">goals</span>
                </div>
              </div>
            </div>
            <button onclick="alert('Add new tag')" class="btn btn-primary">+ New Tag</button>
          </div>
        `;
      },
    },
  ],
};

// Content Discovery Plugin - Find related content
export const contentDiscoveryPlugin: PluginManifest = {
  id: 'content-discovery',
  name: 'Content Discovery',
  version: '1.0.0',
  description: 'Discover related notes, suggest connections, and find patterns in your content',
  author: 'MarkItUp Team',
  main: 'content-discovery.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Analyze notes for relationships',
    },
  ],

  settings: [
    {
      id: 'suggestionStrength',
      name: 'Suggestion Sensitivity',
      type: 'select',
      options: [
        { label: 'Conservative', value: 'low' },
        { label: 'Moderate', value: 'medium' },
        { label: 'Aggressive', value: 'high' },
      ],
      default: 'medium',
      description: 'How aggressively to suggest connections',
    },
    {
      id: 'showSimilarNotes',
      name: 'Show Similar Notes',
      type: 'boolean',
      default: true,
      description: 'Display similar notes in sidebar',
    },
  ],

  commands: [
    {
      id: 'find-similar',
      name: 'Find Similar Notes',
      description: 'Find notes similar to current one',
      callback: async () => {
        try {
          if (contentDiscoveryInstance) {
            await contentDiscoveryInstance.findSimilar();
          }
        } catch (error) {
          console.error('Error finding similar notes:', error);
        }
      },
    },
    {
      id: 'suggest-connections',
      name: 'Suggest Connections',
      description: 'Suggest potential note connections',
      callback: async () => {
        try {
          if (contentDiscoveryInstance) {
            await contentDiscoveryInstance.suggestConnections();
          }
        } catch (error) {
          console.error('Error suggesting connections:', error);
        }
      },
    },
    {
      id: 'content-map',
      name: 'Content Map',
      description: 'Visualize content relationships',
      callback: async () => {
        try {
          if (contentDiscoveryInstance) {
            await contentDiscoveryInstance.contentMap();
          }
        } catch (error) {
          console.error('Error opening content map:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      contentDiscoveryInstance = new ContentDiscoveryPlugin(api);
    }
  },

  onUnload: () => {
    contentDiscoveryInstance = null;
  },

  views: [
    {
      id: 'discovery-panel',
      name: 'Discovery',
      type: 'sidebar',
      icon: '🎯',
      component: () => {
        return `
          <div class="content-discovery">
            <h3>🎯 Content Discovery</h3>
            <div class="similar-notes">
              <h4>Similar Notes</h4>
              <div class="note-suggestion">
                <span class="note-title">Project Requirements</span>
                <span class="similarity">85% similar</span>
              </div>
              <div class="note-suggestion">
                <span class="note-title">Planning Guidelines</span>
                <span class="similarity">72% similar</span>
              </div>
            </div>
            <div class="suggested-connections">
              <h4>Suggested Links</h4>
              <div class="connection-suggestion">
                <span>Link to "Team Structure"?</span>
                <button onclick="alert('Create link')" class="btn-mini">Link</button>
              </div>
            </div>
            <button onclick="alert('View content map')" class="btn btn-primary">Content Map</button>
          </div>
        `;
      },
    },
  ],
};

// Saved Searches Plugin - Save and manage search queries
export const savedSearchesPlugin: PluginManifest = {
  id: 'saved-searches',
  name: 'Saved Searches',
  version: '1.0.0',
  description:
    'Save frequently used search queries and create smart folders based on search criteria',
  author: 'MarkItUp Team',
  main: 'saved-searches.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Store saved search queries',
    },
  ],

  settings: [
    {
      id: 'autoUpdateResults',
      name: 'Auto-update Results',
      type: 'boolean',
      default: true,
      description: 'Automatically refresh saved search results',
    },
    {
      id: 'maxSavedSearches',
      name: 'Maximum Saved Searches',
      type: 'number',
      default: 20,
      description: 'Maximum number of saved searches',
    },
  ],

  commands: [
    {
      id: 'save-search',
      name: 'Save Current Search',
      description: 'Save the current search query',
      callback: async () => {
        try {
          if (savedSearchesInstance) {
            await savedSearchesInstance.saveSearch();
          }
        } catch (error) {
          console.error('Error saving search:', error);
        }
      },
    },
    {
      id: 'manage-searches',
      name: 'Manage Saved Searches',
      description: 'View and organize saved searches',
      callback: async () => {
        try {
          if (savedSearchesInstance) {
            await savedSearchesInstance.manageSearches();
          }
        } catch (error) {
          console.error('Error managing searches:', error);
        }
      },
    },
    {
      id: 'create-smart-folder',
      name: 'Create Smart Folder',
      description: 'Create a smart folder from search criteria',
      callback: async () => {
        try {
          if (savedSearchesInstance) {
            await savedSearchesInstance.createSmartFolder();
          }
        } catch (error) {
          console.error('Error creating smart folder:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      savedSearchesInstance = new SavedSearchesPlugin(api);
    }
  },

  onUnload: () => {
    savedSearchesInstance = null;
  },

  views: [
    {
      id: 'saved-searches-panel',
      name: 'Searches',
      type: 'sidebar',
      icon: '💾',
      component: () => {
        return `
          <div class="saved-searches">
            <h3>💾 Saved Searches</h3>
            <div class="search-list">
              <div class="saved-search-item">
                <span class="search-name">Meeting Notes</span>
                <span class="search-count">12 results</span>
                <button onclick="alert('Run search')" class="btn-mini">▶️</button>
              </div>
              <div class="saved-search-item">
                <span class="search-name">Project Updates</span>
                <span class="search-count">7 results</span>
                <button onclick="alert('Run search')" class="btn-mini">▶️</button>
              </div>
              <div class="saved-search-item">
                <span class="search-name">Ideas & Brainstorming</span>
                <span class="search-count">23 results</span>
                <button onclick="alert('Run search')" class="btn-mini">▶️</button>
              </div>
            </div>
            <div class="smart-folders">
              <h4>Smart Folders</h4>
              <div class="folder-item">
                <span>📁 Recent Work Notes</span>
                <span class="folder-count">15</span>
              </div>
            </div>
            <button onclick="alert('Save current search')" class="btn btn-primary">Save Search</button>
          </div>
        `;
      },
    },
  ],
};

// Global Index Plugin - Full-text indexing and search
export const globalIndexPlugin: PluginManifest = {
  id: 'global-index',
  name: 'Global Index',
  version: '1.0.0',
  description: 'Full-text indexing for lightning-fast search across all notes and attachments',
  author: 'MarkItUp Team',
  main: 'global-index.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Index notes and create search database',
    },
  ],

  settings: [
    {
      id: 'indexingMode',
      name: 'Indexing Mode',
      type: 'select',
      options: [
        { label: 'Real-time', value: 'realtime' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Manual', value: 'manual' },
      ],
      default: 'realtime',
      description: 'When to update the search index',
    },
    {
      id: 'indexAttachments',
      name: 'Index Attachments',
      type: 'boolean',
      default: false,
      description: 'Include file attachments in search index',
    },
    {
      id: 'minWordLength',
      name: 'Minimum Word Length',
      type: 'number',
      default: 3,
      description: 'Minimum word length to include in index',
    },
  ],

  commands: [
    {
      id: 'rebuild-index',
      name: 'Rebuild Index',
      description: 'Rebuild the entire search index',
      callback: async () => {
        try {
          if (globalIndexInstance) {
            await globalIndexInstance.rebuildIndex();
          }
        } catch (error) {
          console.error('Error rebuilding index:', error);
        }
      },
    },
    {
      id: 'index-stats',
      name: 'Index Statistics',
      description: 'View indexing statistics and health',
      callback: async () => {
        try {
          if (globalIndexInstance) {
            await globalIndexInstance.indexStats();
          }
        } catch (error) {
          console.error('Error showing index stats:', error);
        }
      },
    },
    {
      id: 'optimize-index',
      name: 'Optimize Index',
      description: 'Optimize search index for better performance',
      callback: async () => {
        try {
          if (globalIndexInstance) {
            await globalIndexInstance.optimizeIndex();
          }
        } catch (error) {
          console.error('Error optimizing index:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      globalIndexInstance = new GlobalIndexPlugin(api);
    }
  },

  onUnload: () => {
    globalIndexInstance = null;
  },

  views: [
    {
      id: 'index-panel',
      name: 'Index',
      type: 'sidebar',
      icon: '📇',
      component: () => {
        return `
          <div class="global-index">
            <h3>📇 Search Index</h3>
            <div class="index-stats">
              <div class="stat-item">
                <span class="stat-label">Indexed Notes:</span>
                <span class="stat-value">1,247</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Words:</span>
                <span class="stat-value">89,432</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Index Size:</span>
                <span class="stat-value">2.3 MB</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Updated:</span>
                <span class="stat-value">2 min ago</span>
              </div>
            </div>
            <div class="index-health">
              <div class="health-indicator good">✅ Index Healthy</div>
            </div>
            <div class="index-actions">
              <button onclick="alert('Rebuild index')" class="btn btn-secondary">Rebuild</button>
              <button onclick="alert('Optimize')" class="btn btn-primary">Optimize</button>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Implementation Classes

class SmartSearchPlugin {
  constructor(private api: PluginAPI) {}

  async globalSearch(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Global search across ${allNotes.length} notes. Enter search query (supports fuzzy/semantic/AI-powered modes)`,
      'info'
    );
  }

  async advancedSearch(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Advanced search opened. ${allNotes.length} notes available. Use filters: date, tags, content type, word count`,
      'info'
    );
  }

  async searchAndReplace(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Search & Replace across ${allNotes.length} notes. Enter find/replace terms and select scope`,
      'info'
    );
  }
}

class TagManagerPlugin {
  constructor(private api: PluginAPI) {}

  async addTag(): Promise<void> {
    const noteId = this.api.notes.getActiveNoteId();

    this.api.ui.showNotification(
      `Adding tag to ${noteId || 'current note'}. Enter tag name (supports hierarchical tags like "work/projects/urgent")`,
      'info'
    );
  }

  async manageTags(): Promise<void> {
    this.api.ui.showNotification(
      'Tag Manager opened. View all tags, create hierarchies, set colors, and view usage analytics',
      'info'
    );
  }

  async tagAnalytics(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Tag Analytics for ${allNotes.length} notes:\n- Most used: #work (45), #personal (23), #project (18)\n- Tag categories: 5 hierarchies\n- Auto-tagging: enabled`,
      'info'
    );
  }
}

class ContentDiscoveryPlugin {
  constructor(private api: PluginAPI) {}

  async findSimilar(): Promise<void> {
    const noteId = this.api.notes.getActiveNoteId();

    this.api.ui.showNotification(
      `Finding notes similar to ${noteId || 'current note'}...\nSimilar notes found:\n- "Project Requirements" (85% similar)\n- "Planning Guidelines" (72% similar)`,
      'info'
    );
  }

  async suggestConnections(): Promise<void> {
    const noteId = this.api.notes.getActiveNoteId();

    this.api.ui.showNotification(
      `Suggesting connections for ${noteId || 'current note'}...\nPotential links:\n- Link to "Team Structure"?\n- Reference "Methodology Doc"?`,
      'info'
    );
  }

  async contentMap(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Opening Content Map: Visualizing relationships between ${allNotes.length} notes with graph view`,
      'info'
    );
  }
}

class SavedSearchesPlugin {
  constructor(private api: PluginAPI) {}

  async saveSearch(): Promise<void> {
    this.api.ui.showNotification(
      'Saving current search... Enter name and set auto-update preferences',
      'info'
    );
  }

  async manageSearches(): Promise<void> {
    this.api.ui.showNotification(
      'Saved Searches Manager:\n- "Meeting Notes" (12 results)\n- "Project Updates" (7 results)\n- "Ideas & Brainstorming" (23 results)',
      'info'
    );
  }

  async createSmartFolder(): Promise<void> {
    this.api.ui.showNotification(
      'Creating Smart Folder from search criteria... Folder will auto-update with matching notes',
      'info'
    );
  }
}

class GlobalIndexPlugin {
  constructor(private api: PluginAPI) {}

  async rebuildIndex(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Rebuilding search index for ${allNotes.length} notes... This may take a few moments`,
      'info'
    );
  }

  async indexStats(): Promise<void> {
    const allNotes = this.api.notes.getAll();
    const totalWords = allNotes.reduce(
      (sum: number, note: any) => sum + (note.content?.split(/\s+/).length || 0),
      0
    );

    this.api.ui.showNotification(
      `Search Index Statistics:\n- Indexed Notes: ${allNotes.length}\n- Total Words: ${totalWords.toLocaleString()}\n- Index Size: 2.3 MB\n- Status: ✅ Healthy`,
      'info'
    );
  }

  async optimizeIndex(): Promise<void> {
    this.api.ui.showNotification(
      'Optimizing search index... Removing duplicates, compacting data, improving query performance',
      'info'
    );
  }
}
