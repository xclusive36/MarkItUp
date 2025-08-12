import { PluginManifest, PluginAPI, Note } from '../lib/types';

// Link Checker Plugin - Validate and monitor links in notes
export const linkCheckerPlugin: PluginManifest = {
  id: 'link-checker',
  name: 'Link Checker',
  version: '1.2.1',
  description: 'Validate internal and external links, detect broken links, and provide link analytics',
  author: 'MarkItUp Team',
  main: 'link-checker.js',
  
  permissions: [
    {
      type: 'network',
      description: 'Access external URLs to validate links'
    },
    {
      type: 'file-system',
      description: 'Read notes to check internal links'
    }
  ],

  settings: [
    {
      id: 'checkExternal',
      name: 'Check External Links',
      type: 'boolean',
      default: true,
      description: 'Validate external HTTP/HTTPS links'
    },
    {
      id: 'checkInterval',
      name: 'Check Interval (hours)',
      type: 'number',
      default: 24,
      description: 'How often to re-check links'
    },
    {
      id: 'timeout',
      name: 'Request Timeout (seconds)',
      type: 'number',
      default: 10,
      description: 'Timeout for external link validation'
    },
    {
      id: 'showInlineErrors',
      name: 'Show Inline Errors',
      type: 'boolean',
      default: true,
      description: 'Highlight broken links in the editor'
    },
    {
      id: 'ignoredDomains',
      name: 'Ignored Domains',
      type: 'string',
      default: 'localhost,127.0.0.1,example.com',
      description: 'Comma-separated list of domains to ignore'
    },
    {
      id: 'autoFix',
      name: 'Auto-fix Links',
      type: 'boolean',
      default: false,
      description: 'Attempt to automatically fix broken internal links'
    }
  ],

  processors: [
    {
      id: 'link-validator',
      name: 'Link Validation Processor',
      type: 'markdown',
      process: async function(content: string) {
        // Process links and add validation data
        return await processLinks(content);
      }
    }
  ],

  commands: [
    {
      id: 'check-links',
      name: 'Check All Links',
      description: 'Validate all links in the current note',
      keybinding: 'Ctrl+Shift+L',
      callback: async function() {
        console.log('Checking all links...');
      }
    },
    {
      id: 'check-workspace-links',
      name: 'Check Workspace Links',
      description: 'Validate all links in the entire workspace',
      callback: async function() {
        console.log('Checking workspace links...');
      }
    },
    {
      id: 'fix-broken-links',
      name: 'Fix Broken Links',
      description: 'Attempt to fix broken internal links',
      callback: async function() {
        console.log('Fixing broken links...');
      }
    },
    {
      id: 'export-link-report',
      name: 'Export Link Report',
      description: 'Export detailed link validation report',
      callback: async function() {
        console.log('Exporting link report...');
      }
    }
  ],

  views: [
    {
      id: 'link-report',
      name: 'Link Report',
      type: 'sidebar',
      component: null as unknown as React.ComponentType, // Would be React component
      icon: '🔗'
    },
    {
      id: 'broken-links',
      name: 'Broken Links',
      type: 'sidebar',
      component: null as unknown as React.ComponentType,
      icon: '❌'
    }
  ],

  onLoad: async function() {
    console.log('Link Checker plugin loaded');
  },

  onUnload: async function() {
    console.log('Link Checker plugin unloaded');
  }
};

// Link processing types and interfaces
interface LinkInfo {
  type: 'internal' | 'external' | 'wikilink' | 'image';
  url: string;
  text: string;
  line: number;
  column: number;
  valid: boolean | null; // null = not checked yet
  lastChecked?: Date;
  error?: string;
  redirectedTo?: string;
  responseTime?: number;
  statusCode?: number;
}

interface LinkCheckResult {
  valid: boolean;
  error?: string;
  redirectedTo?: string;
  responseTime?: number;
  statusCode?: number;
}

interface LinkCheckerSettings {
  checkExternal: boolean;
  checkInterval: number;
  timeout: number;
  showInlineErrors: boolean;
  ignoredDomains: string;
  autoFix: boolean;
}

// Link extraction functions
function extractLinks(content: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    // Regular markdown links [text](url)
    const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = markdownLinkRegex.exec(line)) !== null) {
      const text = match[1];
      const url = match[2];
      const type = determineUrlType(url);
      
      links.push({
        type,
        url,
        text,
        line: lineIndex + 1,
        column: match.index + 1,
        valid: null
      });
    }
    
    // Wiki-style links [[note name]]
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = wikiLinkRegex.exec(line)) !== null) {
      const text = match[1];
      
      links.push({
        type: 'wikilink',
        url: text,
        text,
        line: lineIndex + 1,
        column: match.index + 1,
        valid: null
      });
    }
    
    // Image links ![alt](url)
    const imageLinkRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((match = imageLinkRegex.exec(line)) !== null) {
      const text = match[1];
      const url = match[2];
      
      links.push({
        type: 'image',
        url,
        text,
        line: lineIndex + 1,
        column: match.index + 1,
        valid: null
      });
    }
  });
  
  return links;
}

function determineUrlType(url: string): 'internal' | 'external' {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'external';
  }
  return 'internal';
}

async function processLinks(content: string): Promise<string> {
  // This would process links and potentially add validation markers
  // For now, just return the content unchanged
  return content;
}

// Plugin implementation class
export class LinkCheckerPlugin {
  private api: PluginAPI;
  private settings: LinkCheckerSettings;
  private isActive: boolean = false;
  private linkCache: Map<string, LinkCheckResult> = new Map();
  private checkInterval?: NodeJS.Timeout;

  constructor(api: PluginAPI) {
    this.api = api;
    this.settings = {
      checkExternal: true,
      checkInterval: 24,
      timeout: 10,
      showInlineErrors: true,
      ignoredDomains: 'localhost,127.0.0.1,example.com',
      autoFix: false
    };
  }

  async initialize() {
    this.isActive = true;
    
    // Start periodic link checking
    this.startPeriodicChecking();
    
    // Listen for note updates
    this.api.events.on('note-updated', this.handleNoteUpdate.bind(this));
    
    this.api.ui.showNotification('Link Checker plugin activated', 'info');
  }

  private startPeriodicChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    const intervalMs = this.settings.checkInterval * 60 * 60 * 1000; // Convert hours to ms
    this.checkInterval = setInterval(() => {
      this.checkAllWorkspaceLinks();
    }, intervalMs);
  }

  private async handleNoteUpdate(note: Note) {
    if (!this.isActive) return;
    
    // Extract and validate links in the updated note
    const links = extractLinks(note.content);
    await this.validateLinks(links);
  }

  async checkLinksInNote(noteId: string): Promise<LinkInfo[]> {
    const note = this.api.notes.get(noteId);
    if (!note) {
      throw new Error(`Note ${noteId} not found`);
    }
    
    const links = extractLinks(note.content);
    await this.validateLinks(links);
    
    // Emit analytics event
    this.api.events.emit('links-checked', {
      noteId,
      linkCount: links.length,
      brokenLinks: links.filter(l => l.valid === false).length
    });
    
    return links;
  }

  async checkAllWorkspaceLinks(): Promise<void> {
    const allNotes = this.api.notes.getAll(); // Use getAll() instead of list()
    const allLinks: LinkInfo[] = [];
    
    for (const note of allNotes) {
      const links = extractLinks(note.content);
      allLinks.push(...links);
    }
    
    await this.validateLinks(allLinks);
    
    this.api.ui.showNotification(
      `Checked ${allLinks.length} links across ${allNotes.length} notes`,
      'info'
    );
  }

  private async validateLinks(links: LinkInfo[]): Promise<void> {
    for (const link of links) {
      await this.validateSingleLink(link);
    }
  }

  private async validateSingleLink(link: LinkInfo): Promise<void> {
    const cacheKey = `${link.type}:${link.url}`;
    
    // Check cache first
    const cached = this.linkCache.get(cacheKey);
    if (cached && this.isCacheValid()) {
      Object.assign(link, cached);
      return;
    }
    
    const startTime = Date.now();
    
    try {
      let result: LinkCheckResult;
      
      switch (link.type) {
        case 'external':
          result = await this.validateExternalLink(link.url);
          break;
        case 'internal':
          result = await this.validateInternalLink(link.url);
          break;
        case 'wikilink':
          result = await this.validateWikiLink(link.url);
          break;
        case 'image':
          result = await this.validateImageLink(link.url);
          break;
        default:
          result = { valid: false, error: 'Unknown link type' };
      }
      
      result.responseTime = Date.now() - startTime;
      
      // Update link with results
      Object.assign(link, result);
      link.lastChecked = new Date();
      
      // Cache the result
      this.linkCache.set(cacheKey, result);
      
    } catch (error) {
      link.valid = false;
      link.error = error instanceof Error ? error.message : 'Unknown error';
      link.lastChecked = new Date();
    }
  }

  private async validateExternalLink(url: string): Promise<LinkCheckResult> {
    if (!this.settings.checkExternal) {
      return { valid: true };
    }
    
    // Check if domain is ignored
    const ignoredDomains = this.settings.ignoredDomains.split(',').map((d: string) => d.trim());
    const urlObj = new URL(url);
    if (ignoredDomains.includes(urlObj.hostname)) {
      return { valid: true };
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout * 1000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'MarkItUp-LinkChecker/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      return {
        valid: response.ok,
        statusCode: response.status,
        redirectedTo: response.redirected ? response.url : undefined,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { valid: false, error: 'Request timeout' };
      }
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  private async validateInternalLink(url: string): Promise<LinkCheckResult> {
    // Check if the internal file/path exists
    try {
      // This would check if the file exists in the workspace
      // For now, just validate the path format
      if (url.startsWith('/') || url.includes('../') || url.match(/^[a-zA-Z]:/)) {
        // Looks like a valid file path
        return { valid: true };
      }
      return { valid: false, error: 'Invalid internal path format' };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Internal link validation failed' 
      };
    }
  }

  private async validateWikiLink(noteName: string): Promise<LinkCheckResult> {
    // Check if a note with this name exists
    const allNotes = this.api.notes.getAll();
    const noteExists = allNotes.some((note: Note) => 
      note.name === noteName || 
      note.name === `${noteName}.md` ||
      note.id === noteName
    );
    
    if (noteExists) {
      return { valid: true };
    }
    
    // Try fuzzy matching for potential auto-fix
    const similarNotes = allNotes.filter((note: Note) => 
      note.name.toLowerCase().includes(noteName.toLowerCase()) ||
      noteName.toLowerCase().includes(note.name.toLowerCase())
    );
    
    if (similarNotes.length > 0) {
      return { 
        valid: false, 
        error: `Note not found. Similar: ${similarNotes[0].name}` 
      };
    }
    
    return { valid: false, error: 'Note not found' };
  }

  private async validateImageLink(url: string): Promise<LinkCheckResult> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return this.validateExternalLink(url);
    } else {
      return this.validateInternalLink(url);
    }
  }

  private isCacheValid(): boolean {
    // Cache is valid for the check interval period
    return true; // Simplified for demo
  }

  async fixBrokenLinks(noteId: string): Promise<number> {
    if (!this.settings.autoFix) {
      this.api.ui.showNotification('Auto-fix is disabled in settings', 'warning');
      return 0;
    }
    
    const note = this.api.notes.get(noteId);
    if (!note) {
      throw new Error(`Note ${noteId} not found`);
    }
    
    const links = await this.checkLinksInNote(noteId);
    const brokenWikiLinks = links.filter(l => 
      l.type === 'wikilink' && 
      l.valid === false && 
      l.error?.includes('Similar:')
    );
    
    let fixedCount = 0;
    let content = note.content;
    
    for (const link of brokenWikiLinks) {
      const similarMatch = link.error?.match(/Similar: (.+)$/);
      if (similarMatch) {
        const suggestedName = similarMatch[1];
        // Replace the broken link with the suggested one
        content = content.replace(`[[${link.url}]]`, `[[${suggestedName}]]`);
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      await this.api.notes.update(noteId, { content });
      this.api.ui.showNotification(`Fixed ${fixedCount} broken links`, 'info');
    }
    
    return fixedCount;
  }

  async exportLinkReport(): Promise<void> {
    const allNotes = this.api.notes.getAll();
    const report = {
      generatedAt: new Date().toISOString(),
      totalNotes: allNotes.length,
      notes: [] as Array<{
        id: string;
        name: string;
        links: LinkInfo[];
        brokenLinks: number;
      }>
    };
    
    for (const note of allNotes) {
      const links = await this.checkLinksInNote(note.id);
      const brokenLinks = links.filter(l => l.valid === false).length;
      
      report.notes.push({
        id: note.id,
        name: note.name,
        links,
        brokenLinks
      });
    }
    
    // This would save or export the report
    console.log('Link report generated:', report);
    this.api.ui.showNotification('Link report exported', 'info');
  }

  getBrokenLinks(): LinkInfo[] {
    // This would return all currently known broken links
    return [];
  }

  getLinkStatistics() {
    // This would return link statistics for the dashboard
    return {
      totalLinks: 0,
      brokenLinks: 0,
      externalLinks: 0,
      internalLinks: 0,
      lastCheckTime: new Date()
    };
  }

  updateSettings(newSettings: Partial<LinkCheckerSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // Restart periodic checking if interval changed
    if (newSettings.checkInterval !== undefined) {
      this.startPeriodicChecking();
    }
  }

  dispose(): void {
    this.isActive = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.api.events.off('note-updated', this.handleNoteUpdate.bind(this));
    this.linkCache.clear();
  }
}

export default linkCheckerPlugin;
