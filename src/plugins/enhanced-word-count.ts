import { PluginManifest, PluginAPI, Note } from '../lib/types';

// Global plugin instance - will be set in onLoad
let pluginInstance: EnhancedWordCountPlugin | null = null;

// Enhanced Word Count Plugin - Provides detailed writing statistics
export const enhancedWordCountPlugin: PluginManifest = {
  id: 'enhanced-word-count',
  name: 'Detailed Writing Statistics',
  version: '1.2.0',
  description: 'Advanced word counting with reading time, character count, and writing analytics',
  author: 'MarkItUp Team',
  main: 'enhanced-word-count.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read note content to calculate statistics',
    },
  ],

  settings: [
    {
      id: 'readingSpeed',
      name: 'Reading Speed (WPM)',
      type: 'number',
      default: 200,
      description: 'Words per minute for reading time calculation',
    },
    {
      id: 'showCharacterCount',
      name: 'Show Character Count',
      type: 'boolean',
      default: true,
      description: 'Display character count in statistics',
    },
    {
      id: 'showReadingTime',
      name: 'Show Reading Time',
      type: 'boolean',
      default: true,
      description: 'Display estimated reading time',
    },
  ],

  views: [
    {
      id: 'word-count-sidebar',
      name: 'Writing Statistics',
      type: 'sidebar',
      component: null as any, // Would be React component in real implementation
      icon: '📊',
    },
  ],

  processors: [
    {
      id: 'word-count-processor',
      name: 'Word Count Processor',
      type: 'markdown',
      process: async function (content: string, context?: any) {
        // This processor adds word count metadata to notes
        const stats = calculateWordStats(content);
        if (context?.note) {
          context.note.metadata = {
            ...context.note.metadata,
            wordCount: stats.words,
            characterCount: stats.characters,
            readingTime: stats.readingTime,
            paragraphs: stats.paragraphs,
            sentences: stats.sentences,
          };
        }
        return content;
      },
    },
  ],

  // Commands removed - statistics now displayed in StatusBar component's expandable panel
  commands: [],

  onLoad: async function (api?: PluginAPI) {
    console.log('Enhanced Word Count plugin loaded');
    if (api) {
      pluginInstance = new EnhancedWordCountPlugin(api);
      await pluginInstance.initialize();
    }
  },

  onUnload: async function () {
    console.log('Enhanced Word Count plugin unloaded');
    if (pluginInstance) {
      pluginInstance.dispose();
      pluginInstance = null;
    }
  },
};

// Statistics calculation functions
function calculateWordStats(content: string) {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/#+ /g, '') // Remove headers
    .trim();

  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  const readingTime = Math.max(1, Math.ceil(words / 200)); // Assume 200 WPM

  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    sentences,
    readingTime,
    averageWordsPerSentence: sentences > 0 ? Math.round(words / sentences) : 0,
    averageWordsPerParagraph: paragraphs > 0 ? Math.round(words / paragraphs) : 0,
  };
}

// Plugin implementation class
export class EnhancedWordCountPlugin {
  private api: PluginAPI;
  private settings: any;
  private isActive: boolean = false;

  constructor(api: PluginAPI) {
    this.api = api;
    this.settings = {
      readingSpeed: 200,
      showCharacterCount: true,
      showReadingTime: true,
    };
  }

  async initialize() {
    this.isActive = true;

    // Listen for note changes to update stats
    this.api.events.on('note-updated', this.handleNoteUpdate.bind(this));
    this.api.events.on('note-created', this.handleNoteUpdate.bind(this));

    // Add real-time content tracking (update stats as user types)
    this.api.events.on('editor-content-changed', this.handleEditorChange.bind(this));

    // Poll for content changes every 2 seconds as fallback
    setInterval(() => {
      if (this.isActive) {
        const content = this.api.ui.getEditorContent();
        if (content) {
          const stats = calculateWordStats(content);
          this.updateStatusBar(stats);
        }
      }
    }, 2000);

    // Add status bar item
    this.updateStatusBar();
  }

  private handleNoteUpdate(note: Note) {
    if (!this.isActive) return;

    const stats = calculateWordStats(note.content);

    // Update note metadata
    note.metadata = {
      ...note.metadata,
      wordCount: stats.words,
      characterCount: stats.characters,
      readingTime: stats.readingTime,
      paragraphs: stats.paragraphs,
      sentences: stats.sentences,
      lastStatsUpdate: new Date().toISOString(),
    };

    // Update status bar
    this.updateStatusBar(stats);

    // Emit analytics event
    this.api.events.emit('word-count-updated', {
      noteId: note.id,
      stats,
    });
  }

  private handleEditorChange(data: { content: string }) {
    if (!this.isActive) return;

    const stats = calculateWordStats(data.content);
    this.updateStatusBar(stats);

    // Emit analytics event
    this.api.events.emit('word-count-updated', {
      stats,
      source: 'editor',
    });
  }

  private updateStatusBar(stats?: any) {
    if (!stats) {
      this.api.ui.setStatusBarText('📊 Enhanced Word Count Active');
      return;
    }

    let statusText = `📊 ${stats.words} words`;

    if (this.settings.showCharacterCount) {
      statusText += ` • ${stats.characters} chars`;
    }

    if (this.settings.showReadingTime) {
      statusText += ` • ${stats.readingTime} min read`;
    }

    this.api.ui.setStatusBarText(statusText);
  }

  updateSettings(newSettings: any) {
    this.settings = { ...this.settings, ...newSettings };
    this.updateStatusBar();
  }

  dispose() {
    this.isActive = false;
    this.api.events.off('note-updated', this.handleNoteUpdate.bind(this));
    this.api.events.off('note-created', this.handleNoteUpdate.bind(this));
  }
}

export default enhancedWordCountPlugin;
