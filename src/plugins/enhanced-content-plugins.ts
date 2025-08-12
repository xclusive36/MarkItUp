import { PluginManifest } from '../lib/types';

// Advanced Markdown Editor Plugin - Enhanced editing features
export const advancedMarkdownEditorPlugin: PluginManifest = {
  id: 'advanced-markdown-editor',
  name: 'Advanced Markdown Editor',
  version: '1.0.0',
  description: 'Enhanced markdown editing with live preview, syntax highlighting, and advanced formatting',
  author: 'MarkItUp Team',
  main: 'advanced-markdown-editor.js',
  
  permissions: [
    {
      type: 'clipboard',
      description: 'Enhanced editor functionality'
    }
  ],

  settings: [
    {
      id: 'livePreview',
      name: 'Live Preview',
      type: 'boolean',
      default: true,
      description: 'Show live preview while editing'
    },
    {
      id: 'syntaxHighlighting',
      name: 'Syntax Highlighting',
      type: 'select',
      options: [
        { label: 'GitHub Style', value: 'github' },
        { label: 'VS Code Style', value: 'vscode' },
        { label: 'Sublime Style', value: 'sublime' }
      ],
      default: 'github',
      description: 'Choose syntax highlighting theme'
    },
    {
      id: 'autoComplete',
      name: 'Auto-complete',
      type: 'boolean',
      default: true,
      description: 'Enable markdown auto-completion'
    }
  ],

  commands: [
    {
      id: 'toggle-preview',
      name: 'Toggle Live Preview',
      description: 'Toggle live preview on/off',
      keybinding: 'Ctrl+Shift+P',
      callback: async () => {
        console.log('Toggling live preview');
      }
    },
    {
      id: 'format-document',
      name: 'Format Document',
      description: 'Auto-format current markdown document',
      keybinding: 'Ctrl+Shift+F',
      callback: async () => {
        console.log('Formatting document');
      }
    },
    {
      id: 'insert-table',
      name: 'Insert Table',
      description: 'Insert a markdown table',
      callback: async () => {
        const cols = prompt('Number of columns:');
        const rows = prompt('Number of rows:');
        console.log(`Inserting ${rows}x${cols} table`);
      }
    }
  ],

  views: [
    {
      id: 'markdown-toolbar',
      name: 'Formatting',
      type: 'toolbar',
      icon: '🎨',
      component: () => {
        return `
          <div class="markdown-toolbar">
            <button onclick="alert('Bold')" title="Bold">B</button>
            <button onclick="alert('Italic')" title="Italic">I</button>
            <button onclick="alert('Link')" title="Link">🔗</button>
            <button onclick="alert('Image')" title="Image">🖼️</button>
            <button onclick="alert('Code')" title="Code">💻</button>
            <button onclick="alert('Table')" title="Table">📊</button>
          </div>
        `;
      }
    }
  ]
};

// Template Engine Plugin - Custom templates and snippets
export const templateEnginePlugin: PluginManifest = {
  id: 'template-engine',
  name: 'Template Engine',
  version: '1.0.0',
  description: 'Create and manage custom templates and code snippets for faster content creation',
  author: 'MarkItUp Team',
  main: 'template-engine.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Store custom templates and snippets'
    }
  ],

  settings: [
    {
      id: 'templateFolder',
      name: 'Template Folder',
      type: 'string',
      default: 'templates/',
      description: 'Folder to store custom templates'
    },
    {
      id: 'autoExpand',
      name: 'Auto-expand Snippets',
      type: 'boolean',
      default: true,
      description: 'Automatically expand snippets as you type'
    }
  ],

  commands: [
    {
      id: 'create-template',
      name: 'Create Template',
      description: 'Create a new template from current note',
      callback: async () => {
        const name = prompt('Template name:');
        if (name) {
          console.log(`Creating template: ${name}`);
        }
      }
    },
    {
      id: 'insert-template',
      name: 'Insert Template',
      description: 'Insert a saved template',
      keybinding: 'Ctrl+Shift+T',
      callback: async () => {
        console.log('Showing template picker');
      }
    },
    {
      id: 'manage-snippets',
      name: 'Manage Snippets',
      description: 'Open snippet manager',
      callback: async () => {
        console.log('Opening snippet manager');
      }
    }
  ],

  views: [
    {
      id: 'templates-panel',
      name: 'Templates',
      type: 'sidebar',
      icon: '📋',
      component: () => {
        return `
          <div class="template-engine">
            <h3>📋 Templates</h3>
            <div class="template-list">
              <div class="template-item">
                <span>Meeting Notes</span>
                <button onclick="alert('Insert template')" class="btn-mini">Use</button>
              </div>
              <div class="template-item">
                <span>Blog Post</span>
                <button onclick="alert('Insert template')" class="btn-mini">Use</button>
              </div>
              <div class="template-item">
                <span>Project Proposal</span>
                <button onclick="alert('Insert template')" class="btn-mini">Use</button>
              </div>
            </div>
            <button onclick="alert('Create new template')" class="btn btn-primary">+ New Template</button>
          </div>
        `;
      }
    }
  ]
};

// Content Structure Plugin - Organize content with outlines
export const contentStructurePlugin: PluginManifest = {
  id: 'content-structure',
  name: 'Content Structure',
  version: '1.0.0',
  description: 'Create and manage content outlines, hierarchies, and document structures',
  author: 'MarkItUp Team',
  main: 'content-structure.js',
  
  permissions: [
    {
      type: 'clipboard',
      description: 'Analyze and modify document structure'
    }
  ],

  settings: [
    {
      id: 'autoOutline',
      name: 'Auto-generate Outline',
      type: 'boolean',
      default: true,
      description: 'Automatically generate outline from headings'
    },
    {
      id: 'maxDepth',
      name: 'Maximum Outline Depth',
      type: 'select',
      options: [
        { label: '3 levels', value: '3' },
        { label: '4 levels', value: '4' },
        { label: '5 levels', value: '5' },
        { label: '6 levels', value: '6' }
      ],
      default: '4',
      description: 'Maximum heading levels in outline'
    }
  ],

  commands: [
    {
      id: 'generate-outline',
      name: 'Generate Outline',
      description: 'Generate document outline from headings',
      callback: async () => {
        console.log('Generating document outline');
      }
    },
    {
      id: 'restructure-document',
      name: 'Restructure Document',
      description: 'Reorganize document sections',
      callback: async () => {
        console.log('Opening restructure tool');
      }
    },
    {
      id: 'validate-structure',
      name: 'Validate Structure',
      description: 'Check document structure for issues',
      callback: async () => {
        console.log('Validating document structure');
      }
    }
  ],

  views: [
    {
      id: 'outline-panel',
      name: 'Outline',
      type: 'sidebar',
      icon: '📝',
      component: () => {
        return `
          <div class="content-structure">
            <h3>📝 Document Outline</h3>
            <div class="outline-tree">
              <div class="outline-item level-1">
                <span>1. Introduction</span>
                <button onclick="alert('Jump to section')" class="btn-mini">→</button>
              </div>
              <div class="outline-item level-2">
                <span>1.1 Background</span>
                <button onclick="alert('Jump to section')" class="btn-mini">→</button>
              </div>
              <div class="outline-item level-1">
                <span>2. Methodology</span>
                <button onclick="alert('Jump to section')" class="btn-mini">→</button>
              </div>
              <div class="outline-item level-1">
                <span>3. Results</span>
                <button onclick="alert('Jump to section')" class="btn-mini">→</button>
              </div>
            </div>
            <button onclick="alert('Regenerate outline')" class="btn btn-primary">Refresh</button>
          </div>
        `;
      }
    }
  ]
};

// Multi-format Export Plugin - Export to various formats
export const multiFormatExportPlugin: PluginManifest = {
  id: 'multi-format-export',
  name: 'Multi-format Export',
  version: '1.0.0',
  description: 'Export notes to PDF, DOCX, HTML, LaTeX, and other formats',
  author: 'MarkItUp Team',
  main: 'multi-format-export.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Write exported files'
    },
    {
      type: 'network',
      description: 'Access export services'
    }
  ],

  settings: [
    {
      id: 'defaultFormat',
      name: 'Default Export Format',
      type: 'select',
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'Microsoft Word (.docx)', value: 'docx' },
        { label: 'HTML', value: 'html' },
        { label: 'LaTeX', value: 'latex' },
        { label: 'Plain Text', value: 'txt' }
      ],
      default: 'pdf',
      description: 'Default format for quick export'
    },
    {
      id: 'includeMetadata',
      name: 'Include Metadata',
      type: 'boolean',
      default: true,
      description: 'Include creation date, author, etc. in exports'
    },
    {
      id: 'exportQuality',
      name: 'Export Quality',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Standard', value: 'standard' },
        { label: 'High Quality', value: 'high' }
      ],
      default: 'standard',
      description: 'Quality setting for exports'
    }
  ],

  commands: [
    {
      id: 'export-pdf',
      name: 'Export to PDF',
      description: 'Export current note as PDF',
      keybinding: 'Ctrl+Shift+E',
      callback: async () => {
        console.log('Exporting to PDF');
      }
    },
    {
      id: 'export-docx',
      name: 'Export to Word',
      description: 'Export current note as Word document',
      callback: async () => {
        console.log('Exporting to DOCX');
      }
    },
    {
      id: 'bulk-export',
      name: 'Bulk Export',
      description: 'Export multiple notes at once',
      callback: async () => {
        console.log('Starting bulk export');
      }
    }
  ],

  views: [
    {
      id: 'export-panel',
      name: 'Export',
      type: 'sidebar',
      icon: '📤',
      component: () => {
        return `
          <div class="multi-format-export">
            <h3>📤 Export Options</h3>
            <div class="export-formats">
              <button onclick="alert('Export PDF')" class="export-btn">
                📄 PDF
              </button>
              <button onclick="alert('Export DOCX')" class="export-btn">
                📝 Word
              </button>
              <button onclick="alert('Export HTML')" class="export-btn">
                🌐 HTML
              </button>
              <button onclick="alert('Export LaTeX')" class="export-btn">
                📐 LaTeX
              </button>
            </div>
            <div class="export-settings">
              <label>
                <input type="checkbox" checked> Include images
              </label>
              <label>
                <input type="checkbox" checked> Include metadata
              </label>
            </div>
            <button onclick="alert('Bulk export')" class="btn btn-primary">Bulk Export</button>
          </div>
        `;
      }
    }
  ]
};

// Content Statistics Plugin - Detailed content analysis
export const contentStatisticsPlugin: PluginManifest = {
  id: 'content-statistics',
  name: 'Content Statistics',
  version: '1.0.0',
  description: 'Comprehensive content analysis including readability, SEO metrics, and writing statistics',
  author: 'MarkItUp Team',
  main: 'content-statistics.js',
  
  permissions: [
    {
      type: 'clipboard',
      description: 'Analyze document content'
    }
  ],

  settings: [
    {
      id: 'realTimeAnalysis',
      name: 'Real-time Analysis',
      type: 'boolean',
      default: true,
      description: 'Update statistics as you type'
    },
    {
      id: 'readabilityFormula',
      name: 'Readability Formula',
      type: 'select',
      options: [
        { label: 'Flesch-Kincaid', value: 'flesch-kincaid' },
        { label: 'Gunning Fog', value: 'gunning-fog' },
        { label: 'SMOG', value: 'smog' },
        { label: 'All Formulas', value: 'all' }
      ],
      default: 'flesch-kincaid',
      description: 'Choose readability calculation method'
    }
  ],

  commands: [
    {
      id: 'analyze-readability',
      name: 'Analyze Readability',
      description: 'Calculate readability scores',
      callback: async () => {
        console.log('Analyzing readability');
      }
    },
    {
      id: 'generate-report',
      name: 'Generate Statistics Report',
      description: 'Create detailed content analysis report',
      callback: async () => {
        console.log('Generating statistics report');
      }
    },
    {
      id: 'word-frequency',
      name: 'Word Frequency Analysis',
      description: 'Analyze word usage patterns',
      callback: async () => {
        console.log('Analyzing word frequency');
      }
    }
  ],

  views: [
    {
      id: 'statistics-panel',
      name: 'Stats',
      type: 'sidebar',
      icon: '📊',
      component: () => {
        return `
          <div class="content-statistics">
            <h3>📊 Content Stats</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Words:</span>
                <span class="stat-value">1,247</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Characters:</span>
                <span class="stat-value">7,891</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Paragraphs:</span>
                <span class="stat-value">23</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Reading Time:</span>
                <span class="stat-value">5.2 min</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Readability:</span>
                <span class="stat-value">Grade 8</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">SEO Score:</span>
                <span class="stat-value">78/100</span>
              </div>
            </div>
            <button onclick="alert('Generate report')" class="btn btn-primary">Full Report</button>
          </div>
        `;
      }
    }
  ]
};
