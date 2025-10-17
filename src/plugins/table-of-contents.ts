import { PluginManifest, PluginAPI, Note } from '../lib/types';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import React from 'react';

// Global plugin instance - will be set in onLoad
let pluginInstance: TableOfContentsPlugin | null = null;

/**
 * TABLE OF CONTENTS PLUGIN V2.0
 *
 * Complete rewrite with live document outline and smart TOC generation.
 *
 * NEW in V2.0:
 * - 📋 Live Document Outline sidebar with click navigation
 * - 🎯 Real-time section highlighting
 * - 📊 Document structure statistics
 * - 🎨 Multiple TOC styles (Simple, Detailed, Numbered, Emoji)
 * - 📝 Collapsible sections in outline
 * - 📈 Word count per section
 * - ⌨️ Keyboard navigation shortcuts
 * - 🔄 Auto-refresh outline on content change
 * - 🎭 Full dark/light theme support
 */

// Table of Contents Plugin - Generate and manage table of contents for notes
export const tableOfContentsPlugin: PluginManifest = {
  id: 'table-of-contents',
  name: 'Table of Contents',
  version: '2.0.0',
  description:
    'Live document outline with click navigation + smart TOC generation. NEW in v2.0: Interactive sidebar outline, multiple TOC styles, real-time section tracking, structure analytics, collapsible sections, keyboard shortcuts. Navigate long documents with ease!',
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
      id: 'tocStyle',
      name: 'TOC Style',
      type: 'string',
      default: 'numbered',
      description: 'TOC generation style: numbered, simple, detailed, emoji',
    },
    {
      id: 'includeNumbers',
      name: 'Include Numbers',
      type: 'boolean',
      default: true,
      description: 'Include numbering in TOC entries (numbered style)',
    },
    {
      id: 'linkToHeadings',
      name: 'Link to Headings',
      type: 'boolean',
      default: true,
      description: 'Create clickable links to headings',
    },
    {
      id: 'showOutlineWordCounts',
      name: 'Show Word Counts in Outline',
      type: 'boolean',
      default: true,
      description: 'Display word counts per section in outline view',
    },
    {
      id: 'showOutlineLineNumbers',
      name: 'Show Line Numbers in Outline',
      type: 'boolean',
      default: false,
      description: 'Display line numbers in outline view',
    },
    {
      id: 'autoRefreshOutline',
      name: 'Auto-refresh Outline',
      type: 'boolean',
      default: true,
      description: 'Automatically update outline when content changes',
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
    {
      id: 'toggle-outline',
      name: 'Toggle Document Outline',
      description: 'Show/hide the document outline sidebar',
      keybinding: 'Ctrl+Shift+L',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.toggleOutline();
        } else {
          console.error('TOC Plugin instance not initialized');
        }
      },
    },
    {
      id: 'refresh-outline',
      name: 'Refresh Document Outline',
      description: 'Manually refresh the outline view',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.refreshOutline();
        } else {
          console.error('TOC Plugin instance not initialized');
        }
      },
    },
    {
      id: 'show-structure-stats',
      name: 'Show Document Structure Stats',
      description: 'Display document structure analysis',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.showStructureStats();
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
      component: null as unknown as React.ComponentType, // Rendered dynamically via React
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
  wordCount?: number;
}

interface TOCSettings {
  autoGenerate: boolean;
  minHeadings: number;
  maxDepth: number;
  tocMarker: string;
  tocStyle: string;
  includeNumbers: boolean;
  linkToHeadings: boolean;
  showOutlineWordCounts: boolean;
  showOutlineLineNumbers: boolean;
  autoRefreshOutline: boolean;
}

type TOCStyle = 'numbered' | 'simple' | 'detailed' | 'emoji';

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

  // Calculate word counts for each section
  headings.forEach((heading, index) => {
    const startLine = heading.line;
    const endLine = headings[index + 1]?.line || lines.length + 1;

    let wordCount = 0;
    for (let i = startLine; i < endLine; i++) {
      const line = lines[i - 1];
      if (line && !line.match(/^#{1,6}\s/)) {
        // Exclude heading lines
        const words = line
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 0);
        wordCount += words.length;
      }
    }

    heading.wordCount = wordCount;
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

// TOC Style Generators
function generateNumberedTOC(
  headings: HeadingInfo[],
  includeNumbers: boolean,
  linkToHeadings: boolean
): string {
  let tocContent = '\n## 📑 Table of Contents\n\n';
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

    const indent = '  '.repeat(heading.level - 1);
    const numberPrefix = includeNumbers ? numbering.slice(0, heading.level).join('.') + '. ' : '';
    const link = linkToHeadings ? `[${heading.text}](#${heading.id})` : heading.text;

    tocContent += `${indent}- ${numberPrefix}${link}\n`;
  });

  return tocContent + '\n';
}

function generateSimpleTOC(headings: HeadingInfo[], linkToHeadings: boolean): string {
  let tocContent = '\n## Table of Contents\n\n';

  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    const link = linkToHeadings ? `[${heading.text}](#${heading.id})` : heading.text;
    tocContent += `${indent}- ${link}\n`;
  });

  return tocContent + '\n';
}

function generateDetailedTOC(headings: HeadingInfo[], linkToHeadings: boolean): string {
  let tocContent = '\n## 📋 Table of Contents\n\n';

  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    const link = linkToHeadings ? `[${heading.text}](#${heading.id})` : heading.text;
    const wordInfo = heading.wordCount ? ` *(${heading.wordCount} words)*` : '';
    const lineInfo = ` *[Line ${heading.line}]*`;

    tocContent += `${indent}- ${link}${wordInfo}${lineInfo}\n`;
  });

  return tocContent + '\n';
}

function generateEmojiTOC(headings: HeadingInfo[], linkToHeadings: boolean): string {
  const emojis = ['📚', '📖', '📝', '📄', '📃', '📋'];
  let tocContent = '\n## 📑 Table of Contents\n\n';

  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    const emoji = emojis[Math.min(heading.level - 1, emojis.length - 1)];
    const link = linkToHeadings ? `[${heading.text}](#${heading.id})` : heading.text;

    tocContent += `${indent}- ${emoji} ${link}\n`;
  });

  return tocContent + '\n';
}

function generateTableOfContents(content: string, settings: Partial<TOCSettings> = {}): string {
  const {
    minHeadings = 3,
    maxDepth = 6,
    tocMarker = '<!-- TOC -->',
    tocStyle = 'numbered',
    includeNumbers = true,
    linkToHeadings = true,
  } = settings;

  const headings = extractHeadings(content).filter(h => h.level <= maxDepth);

  // Check if we have enough headings
  if (headings.length < minHeadings) {
    return content;
  }

  // Generate TOC content based on style
  let tocContent = '';

  switch (tocStyle as TOCStyle) {
    case 'emoji':
      tocContent = generateEmojiTOC(headings, linkToHeadings);
      break;
    case 'detailed':
      tocContent = generateDetailedTOC(headings, linkToHeadings);
      break;
    case 'simple':
      tocContent = generateSimpleTOC(headings, linkToHeadings);
      break;
    case 'numbered':
    default:
      tocContent = generateNumberedTOC(headings, includeNumbers, linkToHeadings);
      break;
  }

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

  private outlineContainer: HTMLElement | null = null;
  private outlineRoot: Root | null = null;

  constructor(api: PluginAPI) {
    this.api = api;
    this.settings = {
      autoGenerate: false,
      minHeadings: 3,
      maxDepth: 6,
      tocMarker: '<!-- TOC -->',
      tocStyle: 'numbered',
      includeNumbers: true,
      linkToHeadings: true,
      showOutlineWordCounts: true,
      showOutlineLineNumbers: false,
      autoRefreshOutline: true,
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
    const note = noteId ? this.api.notes.get(noteId) : this.getCurrentNote();
    console.log('[TOC DEBUG] Current note:', note?.id, note?.name);

    // If no note found, try to use current editor content
    if (!note) {
      console.log('[TOC DEBUG] No note found, checking editor content');
      const editorContent = this.api.ui.getEditorContent();
      console.log('[TOC DEBUG] Editor content length:', editorContent.length);

      if (!editorContent || editorContent.trim().length === 0) {
        console.log('[TOC DEBUG] Editor is empty');
        this.api.ui.showNotification('No note selected or editor is empty', 'warning');
        return;
      }

      // Generate TOC for unsaved content
      const updatedContent = generateTableOfContents(editorContent, this.settings);
      console.log(
        '[TOC DEBUG] Generated TOC for unsaved content, changed:',
        updatedContent !== editorContent
      );

      if (updatedContent === editorContent) {
        console.log('[TOC DEBUG] No headings found or TOC already exists');
        this.api.ui.showNotification('No headings found or TOC already exists', 'info');
        return;
      }

      // Update editor directly
      console.log('[TOC DEBUG] Updating editor content directly');
      this.api.ui.setEditorContent(updatedContent);
      this.api.ui.showNotification('Table of contents inserted (save note to persist)', 'info');
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

  /**
   * Toggle the document outline sidebar
   */
  async toggleOutline(): Promise<void> {
    if (this.outlineContainer) {
      // Hide outline
      if (this.outlineRoot) {
        this.outlineRoot.unmount();
        this.outlineRoot = null;
      }
      if (this.outlineContainer.parentNode) {
        this.outlineContainer.parentNode.removeChild(this.outlineContainer);
      }
      this.outlineContainer = null;
      this.api.ui.showNotification('Document outline hidden', 'info');
    } else {
      // Show outline
      await this.showOutline();
    }
  }

  /**
   * Show the document outline sidebar
   */
  private async showOutline(): Promise<void> {
    const content = this.api.ui.getEditorContent();
    if (!content) {
      this.api.ui.showNotification('No content to analyze', 'warning');
      return;
    }

    const headings = extractHeadings(content);

    if (headings.length === 0) {
      this.api.ui.showNotification('No headings found in document', 'info');
      return;
    }

    // Import and render the outline component
    import('@/components/DocumentOutline')
      .then(module => {
        const DocumentOutline = module.default;

        // Create container
        this.outlineContainer = document.createElement('div');
        this.outlineContainer.style.position = 'fixed';
        this.outlineContainer.style.right = '0';
        this.outlineContainer.style.top = '0';
        this.outlineContainer.style.bottom = '0';
        this.outlineContainer.style.width = '320px';
        this.outlineContainer.style.zIndex = '40';
        this.outlineContainer.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
        document.body.appendChild(this.outlineContainer);

        this.outlineRoot = createRoot(this.outlineContainer);
        this.outlineRoot.render(
          React.createElement(DocumentOutline, {
            headings,
            onHeadingClick: (heading: HeadingInfo) => {
              this.jumpToLine(heading.line);
            },
            onRefresh: () => {
              this.refreshOutline();
            },
            showWordCounts: this.settings.showOutlineWordCounts,
            showLineNumbers: this.settings.showOutlineLineNumbers,
          })
        );

        this.api.ui.showNotification('Document outline opened', 'info');
      })
      .catch(error => {
        console.error('Failed to load document outline:', error);
        this.api.ui.showNotification('Failed to show outline', 'error');
      });
  }

  /**
   * Refresh the document outline
   */
  async refreshOutline(): Promise<void> {
    if (!this.outlineContainer || !this.outlineRoot) {
      await this.showOutline();
      return;
    }

    const content = this.api.ui.getEditorContent();
    const headings = extractHeadings(content);

    import('@/components/DocumentOutline')
      .then(module => {
        const DocumentOutline = module.default;

        if (this.outlineRoot) {
          this.outlineRoot.render(
            React.createElement(DocumentOutline, {
              headings,
              onHeadingClick: (heading: HeadingInfo) => {
                this.jumpToLine(heading.line);
              },
              onRefresh: () => {
                this.refreshOutline();
              },
              showWordCounts: this.settings.showOutlineWordCounts,
              showLineNumbers: this.settings.showOutlineLineNumbers,
            })
          );
        }
      })
      .catch(error => {
        console.error('Failed to refresh outline:', error);
      });
  }

  /**
   * Jump to a specific line in the editor
   */
  private jumpToLine(line: number): void {
    // Try to find and focus the editor textarea
    const editor = document.querySelector('textarea');
    if (editor) {
      const lines = editor.value.split('\n');
      let position = 0;
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        position += lines[i].length + 1; // +1 for newline
      }

      editor.focus();
      editor.setSelectionRange(position, position);
      editor.scrollTop = Math.max(0, (line - 5) * 20); // Rough estimate
    }
  }

  /**
   * Show document structure statistics
   */
  async showStructureStats(): Promise<void> {
    const content = this.api.ui.getEditorContent();
    if (!content) {
      this.api.ui.showNotification('No content to analyze', 'warning');
      return;
    }

    const headings = extractHeadings(content);

    if (headings.length === 0) {
      this.api.ui.showNotification('No headings found in document', 'info');
      return;
    }

    // Calculate statistics
    const levelCounts: Record<number, number> = {};
    let totalWords = 0;
    let maxDepth = 0;

    headings.forEach(h => {
      levelCounts[h.level] = (levelCounts[h.level] || 0) + 1;
      totalWords += h.wordCount || 0;
      maxDepth = Math.max(maxDepth, h.level);
    });

    const avgWordsPerSection = Math.round(totalWords / headings.length);

    // Check for structure issues
    const issues: string[] = [];

    // Check for skipped levels
    const levels = Object.keys(levelCounts).map(Number).sort();
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        issues.push(`⚠️ Skipped heading level (jumped from H${levels[i - 1]} to H${levels[i]})`);
      }
    }

    // Check for single H1
    if (levelCounts[1] && levelCounts[1] > 1) {
      issues.push(
        `⚠️ Multiple H1 headings found (${levelCounts[1]}). Consider using only one H1 as title.`
      );
    }

    // Check depth
    if (maxDepth > 4) {
      issues.push(
        `⚠️ Deep nesting detected (H${maxDepth}). Consider simplifying document structure.`
      );
    }

    // Build message
    let message = `📊 Document Structure Analysis\n\n`;
    message += `📋 Total Headings: ${headings.length}\n`;
    message += `📝 Total Words in Sections: ${totalWords.toLocaleString()}\n`;
    message += `📏 Average Words per Section: ${avgWordsPerSection}\n`;
    message += `🎯 Deepest Level: H${maxDepth}\n\n`;
    message += `📈 Heading Distribution:\n`;

    Object.entries(levelCounts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([level, count]) => {
        message += `  H${level}: ${count}\n`;
      });

    if (issues.length > 0) {
      message += `\n🔍 Structure Issues:\n`;
      issues.forEach(issue => {
        message += `  ${issue}\n`;
      });
    } else {
      message += `\n✅ Document structure looks good!`;
    }

    // Show in alert (could be enhanced with a modal)
    alert(message);
    console.log(message);
  }

  dispose(): void {
    this.isActive = false;
    this.api.events.off('note-updated', this.handleNoteUpdate.bind(this));

    // Clean up outline if visible
    if (this.outlineRoot) {
      this.outlineRoot.unmount();
    }
    if (this.outlineContainer?.parentNode) {
      this.outlineContainer.parentNode.removeChild(this.outlineContainer);
    }
  }
}

export default tableOfContentsPlugin;
