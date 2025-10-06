import { PluginManifest, PluginAPI, Note } from '../lib/types';

// Global plugin instance - will be set in onLoad
let pluginInstance: TableOfContentsPlugin | null = null;

// Table of Contents Plugin - Generate and manage table of contents for notes
export const tableOfContentsPlugin: PluginManifest = {
  id: 'table-of-contents',
  name: 'Table of Contents',
  version: '1.0.5',
  description: 'Automatically generate and insert table of contents for your markdown notes',
  author: 'MarkItUp Team',
  main: 'table-of-contents.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read and modify note content to insert TOC',
    },
  ],

  settings: [
    {
      id: 'autoGenerate',
      name: 'Auto-generate TOC',
      type: 'boolean',
      default: false,
      description: 'Automatically generate TOC when note is saved',
    },
    {
      id: 'minHeadings',
      name: 'Minimum Headings',
      type: 'number',
      default: 3,
      description: 'Minimum number of headings required to generate TOC',
    },
    {
      id: 'maxDepth',
      name: 'Maximum Heading Depth',
      type: 'number',
      default: 6,
      description: 'Maximum heading level to include (1-6)',
    },
    {
      id: 'tocMarker',
      name: 'TOC Marker',
      type: 'string',
      default: '<!-- TOC -->',
      description: 'Marker where TOC should be inserted',
    },
    {
      id: 'includeNumbers',
      name: 'Include Numbers',
      type: 'boolean',
      default: true,
      description: 'Include numbering in TOC entries',
    },
    {
      id: 'linkToHeadings',
      name: 'Link to Headings',
      type: 'boolean',
      default: true,
      description: 'Create clickable links to headings',
    },
  ],

  processors: [
    {
      id: 'toc-processor',
      name: 'TOC Content Processor',
      type: 'markdown',
      process: async function (content: string, context?: unknown) {
        // Auto-generate TOC if enabled
        const contextObj = context as { settings?: Partial<TOCSettings> } | undefined;
        const settings = contextObj?.settings || {};
        if (settings.autoGenerate) {
          return generateTableOfContents(content, settings);
        }
        return content;
      },
    },
  ],

  commands: [
    {
      id: 'insert-toc',
      name: 'Insert Table of Contents',
      description: 'Generate and insert TOC at cursor position',
      keybinding: 'Ctrl+Shift+O',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.insertTOC();
        } else {
          console.error('TOC Plugin instance not initialized');
        }
      },
    },
    {
      id: 'update-toc',
      name: 'Update Table of Contents',
      description: 'Update existing TOC in the current note',
      keybinding: 'Ctrl+Shift+U',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.updateTOC();
        } else {
          console.error('TOC Plugin instance not initialized');
        }
      },
    },
    {
      id: 'remove-toc',
      name: 'Remove Table of Contents',
      description: 'Remove TOC from the current note',
      keybinding: 'Ctrl+Shift+R',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.removeTOC();
        } else {
          console.error('TOC Plugin instance not initialized');
        }
      },
    },
  ],

  views: [
    {
      id: 'toc-outline',
      name: 'Document Outline',
      type: 'sidebar',
      component: null as unknown as React.ComponentType, // Would be React component
      icon: '📋',
    },
  ],

  onLoad: async function (api?: PluginAPI) {
    console.log('Table of Contents plugin loaded');
    if (api) {
      pluginInstance = new TableOfContentsPlugin(api);
      await pluginInstance.initialize();
    }
  },

  onUnload: async function () {
    console.log('Table of Contents plugin unloaded');
    if (pluginInstance) {
      pluginInstance.dispose();
      pluginInstance = null;
    }
  },
};

// TOC generation functions
interface HeadingInfo {
  level: number;
  text: string;
  id: string;
  line: number;
}

interface TOCSettings {
  autoGenerate: boolean;
  minHeadings: number;
  maxDepth: number;
  tocMarker: string;
  includeNumbers: boolean;
  linkToHeadings: boolean;
}

function extractHeadings(content: string): HeadingInfo[] {
  const lines = content.split('\n');
  const headings: HeadingInfo[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);

      headings.push({
        level,
        text,
        id,
        line: index + 1,
      });
    }
  });

  return headings;
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function generateTableOfContents(content: string, settings: Partial<TOCSettings> = {}): string {
  const {
    minHeadings = 3,
    maxDepth = 6,
    tocMarker = '<!-- TOC -->',
    includeNumbers = true,
    linkToHeadings = true,
  } = settings;

  const headings = extractHeadings(content).filter(h => h.level <= maxDepth);

  // Check if we have enough headings
  if (headings.length < minHeadings) {
    return content;
  }

  // Generate TOC content
  let tocContent = '\n## Table of Contents\n\n';
  const numbering: number[] = [];

  headings.forEach(heading => {
    // Update numbering
    while (numbering.length < heading.level) {
      numbering.push(0);
    }
    while (numbering.length > heading.level) {
      numbering.pop();
    }
    numbering[heading.level - 1]++;

    // Reset deeper levels
    for (let i = heading.level; i < numbering.length; i++) {
      numbering[i] = 0;
    }

    // Generate indent
    const indent = '  '.repeat(heading.level - 1);

    // Generate number prefix
    const numberPrefix = includeNumbers ? numbering.slice(0, heading.level).join('.') + '. ' : '';

    // Generate link
    const link = linkToHeadings ? `[${heading.text}](#${heading.id})` : heading.text;

    tocContent += `${indent}- ${numberPrefix}${link}\n`;
  });

  tocContent += '\n';

  // Find TOC marker and replace/insert
  if (content.includes(tocMarker)) {
    // Replace existing TOC
    const tocRegex = new RegExp(
      `${escapeRegex(tocMarker)}[\\s\\S]*?(?=${escapeRegex(tocMarker)}|$)`,
      'g'
    );
    return content.replace(tocRegex, `${tocMarker}\n${tocContent}${tocMarker}`);
  } else {
    // Insert at the beginning (after title if present)
    const lines = content.split('\n');
    let insertIndex = 0;

    // Skip front matter
    if (lines[0] === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          insertIndex = i + 1;
          break;
        }
      }
    }

    // Skip title (first H1)
    if (insertIndex < lines.length && lines[insertIndex].match(/^#\s+/)) {
      insertIndex++;
    }

    // Skip empty lines after title
    while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
      insertIndex++;
    }

    lines.splice(insertIndex, 0, `${tocMarker}`, ...tocContent.split('\n'), `${tocMarker}`);
    return lines.join('\n');
  }
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Plugin implementation class
export class TableOfContentsPlugin {
  private api: PluginAPI;
  private settings: TOCSettings;
  private isActive: boolean = false;

  constructor(api: PluginAPI) {
    this.api = api;
    this.settings = {
      autoGenerate: false,
      minHeadings: 3,
      maxDepth: 6,
      tocMarker: '<!-- TOC -->',
      includeNumbers: true,
      linkToHeadings: true,
    };
  }

  async initialize() {
    this.isActive = true;

    // Listen for note updates
    this.api.events.on('note-updated', this.handleNoteUpdate.bind(this));

    this.api.ui.showNotification('Table of Contents plugin activated', 'info');
  }

  private handleNoteUpdate(note: Note) {
    if (!this.isActive || !this.settings.autoGenerate) return;

    // Auto-generate TOC if enabled
    const updatedContent = generateTableOfContents(note.content, this.settings);
    if (updatedContent !== note.content) {
      // Update note with new TOC
      this.api.notes.update(note.id, { content: updatedContent });

      // Emit analytics event
      this.api.events.emit('toc-auto-generated', {
        noteId: note.id,
        headingCount: extractHeadings(note.content).length,
      });
    }
  }

  async insertTOC(noteId?: string): Promise<void> {
    console.log('[TOC DEBUG] insertTOC called with noteId:', noteId);
    const note = noteId ? this.api.notes.get(noteId) : this.getCurrentNote(); // Would get current active note
    console.log('[TOC DEBUG] Current note:', note?.id, note?.name);

    if (!note) {
      console.log('[TOC DEBUG] No note found!');
      this.api.ui.showNotification('No note selected', 'warning');
      return;
    }

    const updatedContent = generateTableOfContents(note.content, this.settings);
    console.log('[TOC DEBUG] Generated TOC, content changed:', updatedContent !== note.content);

    if (updatedContent === note.content) {
      console.log('[TOC DEBUG] No headings found or TOC already exists');
      this.api.ui.showNotification('No headings found or TOC already exists', 'info');
      return;
    }

    try {
      console.log('[TOC DEBUG] Calling api.notes.update for note:', note.id);
      await this.api.notes.update(note.id, { content: updatedContent });
      console.log('[TOC DEBUG] Update complete');
      this.api.ui.showNotification('Table of contents inserted', 'info');

      // Emit analytics event
      this.api.events.emit('toc-inserted', {
        noteId: note.id,
        headingCount: extractHeadings(note.content).length,
      });
    } catch (error) {
      this.api.ui.showNotification('Failed to insert TOC', 'error');
      console.error('Failed to insert TOC:', error);
    }
  }

  async updateTOC(noteId?: string): Promise<void> {
    const note = noteId ? this.api.notes.get(noteId) : this.getCurrentNote();

    if (!note) {
      this.api.ui.showNotification('No note selected', 'warning');
      return;
    }

    if (!note.content.includes(this.settings.tocMarker)) {
      this.api.ui.showNotification('No TOC marker found', 'warning');
      return;
    }

    const updatedContent = generateTableOfContents(note.content, this.settings);

    try {
      await this.api.notes.update(note.id, { content: updatedContent });
      this.api.ui.showNotification('Table of contents updated', 'info');
    } catch (error) {
      this.api.ui.showNotification('Failed to update TOC', 'error');
      console.error('Failed to update TOC:', error);
    }
  }

  async removeTOC(noteId?: string): Promise<void> {
    const note = noteId ? this.api.notes.get(noteId) : this.getCurrentNote();

    if (!note) {
      this.api.ui.showNotification('No note selected', 'warning');
      return;
    }

    const tocRegex = new RegExp(
      `${escapeRegex(this.settings.tocMarker)}[\\s\\S]*?${escapeRegex(this.settings.tocMarker)}`,
      'g'
    );

    const updatedContent = note.content.replace(tocRegex, '').trim();

    if (updatedContent === note.content) {
      this.api.ui.showNotification('No TOC found to remove', 'info');
      return;
    }

    try {
      await this.api.notes.update(note.id, { content: updatedContent });
      this.api.ui.showNotification('Table of contents removed', 'info');
    } catch (error) {
      this.api.ui.showNotification('Failed to remove TOC', 'error');
      console.error('Failed to remove TOC:', error);
    }
  }

  getDocumentOutline(content: string): HeadingInfo[] {
    return extractHeadings(content);
  }

  private getCurrentNote(): Note | null {
    // Get the currently active/selected note from the PKM system
    const activeNoteId = this.api.notes.getActiveNoteId();
    console.log('[TOC DEBUG] getCurrentNote - activeNoteId:', activeNoteId);
    if (!activeNoteId) {
      console.log('[TOC DEBUG] No active note ID');
      return null;
    }
    const note = this.api.notes.get(activeNoteId);
    console.log('[TOC DEBUG] Retrieved note:', note?.id, note?.name);
    return note;
  }

  updateSettings(newSettings: Partial<TOCSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  dispose(): void {
    this.isActive = false;
    this.api.events.off('note-updated', this.handleNoteUpdate.bind(this));
  }
}

export default tableOfContentsPlugin;
