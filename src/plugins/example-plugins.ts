import { PluginManifest, ContentProcessor, Command, PluginSetting } from '../lib/types';

// Example: Word Count Plugin
export const wordCountPlugin: PluginManifest = {
  id: 'word-count-enhanced',
  name: 'Enhanced Word Count',
  version: '1.0.0',
  description: 'Provides detailed word count statistics and reading time estimates',
  author: 'MarkItUp Team',
  main: 'word-count-plugin.js',
  
  settings: [
    {
      id: 'reading-speed',
      name: 'Reading Speed (WPM)',
      type: 'number',
      default: 225,
      description: 'Average words per minute for reading time calculation'
    },
    {
      id: 'show-character-count',
      name: 'Show Character Count',
      type: 'boolean',
      default: true,
      description: 'Display character count in addition to word count'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'show-detailed-stats',
      name: 'Show Detailed Statistics',
      description: 'Display detailed statistics for the current note',
      keybinding: 'Cmd+Shift+S',
      callback: async function() {
        // This would be implemented when the plugin is loaded
        console.log('Showing detailed statistics...');
      }
    }
  ] as Command[],

  processors: [
    {
      id: 'word-count-processor',
      name: 'Word Count Processor',
      type: 'transform',
      process: async (content: string) => {
        // Add word count metadata to content
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = content.length;
        
        return content + `\n\n<!-- Word Count: ${wordCount}, Characters: ${charCount} -->`;
      }
    }
  ] as ContentProcessor[],

  onLoad: async function() {
    console.log('Enhanced Word Count plugin loaded');
  },

  onUnload: async function() {
    console.log('Enhanced Word Count plugin unloaded');
  }
};

// Example: Markdown Export Plugin
export const markdownExportPlugin: PluginManifest = {
  id: 'markdown-export',
  name: 'Markdown Export',
  version: '1.0.0',
  description: 'Export notes to various formats (PDF, HTML, DOCX)',
  author: 'MarkItUp Community',
  main: 'export-plugin.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Required to save exported files'
    }
  ],

  settings: [
    {
      id: 'export-format',
      name: 'Default Export Format',
      type: 'select',
      default: 'pdf',
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'HTML', value: 'html' },
        { label: 'DOCX', value: 'docx' }
      ],
      description: 'Default format for exports'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'export-current-note',
      name: 'Export Current Note',
      description: 'Export the current note to selected format',
      keybinding: 'Cmd+E',
      callback: async function() {
        console.log('Exporting current note...');
      }
    },
    {
      id: 'batch-export',
      name: 'Batch Export',
      description: 'Export multiple notes at once',
      callback: async function() {
        console.log('Starting batch export...');
      }
    }
  ] as Command[],

  processors: [
    {
      id: 'html-export-processor',
      name: 'HTML Export Processor',
      type: 'export',
      fileExtensions: ['.html'],
      process: async (content: string) => {
        // Convert markdown to HTML
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Note</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
      }
    }
  ] as ContentProcessor[],

  onLoad: async function() {
    console.log('Markdown Export plugin loaded');
  }
};

// Example: Theme Plugin
export const darkThemePlugin: PluginManifest = {
  id: 'dark-theme-advanced',
  name: 'Advanced Dark Theme',
  version: '1.0.0',
  description: 'Advanced dark theme with customization options',
  author: 'MarkItUp Themes',
  main: 'dark-theme-plugin.js',

  settings: [
    {
      id: 'accent-color',
      name: 'Accent Color',
      type: 'select',
      default: 'blue',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' }
      ]
    },
    {
      id: 'sidebar-opacity',
      name: 'Sidebar Opacity',
      type: 'number',
      default: 0.95,
      description: 'Opacity level for sidebar (0.1 - 1.0)'
    }
  ] as PluginSetting[],

  onLoad: async function() {
    // Apply theme styles
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .dark-theme-advanced {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --text-primary: #ffffff;
          --accent: var(--accent-color, #3b82f6);
        }
      `;
      document.head.appendChild(style);
    }
  },

  onUnload: async function() {
    // Remove theme styles
    console.log('Dark theme unloaded');
  }
};

// Example: Daily Notes Plugin
export const dailyNotesPlugin: PluginManifest = {
  id: 'daily-notes',
  name: 'Daily Notes',
  version: '1.0.0',
  description: 'Automatically create and manage daily notes with templates',
  author: 'MarkItUp Community',
  main: 'daily-notes-plugin.js',

  settings: [
    {
      id: 'notes-folder',
      name: 'Daily Notes Folder',
      type: 'string',
      default: 'Daily Notes',
      description: 'Folder where daily notes will be stored'
    },
    {
      id: 'template',
      name: 'Daily Note Template',
      type: 'string',
      default: '# {{date}}\n\n## Tasks\n- [ ] \n\n## Notes\n\n## Reflection\n',
      description: 'Template for new daily notes (use {{date}} for current date)'
    },
    {
      id: 'auto-create',
      name: 'Auto-create Today\'s Note',
      type: 'boolean',
      default: true,
      description: 'Automatically create today\'s note on startup'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'open-today',
      name: 'Open Today\'s Note',
      description: 'Open or create today\'s daily note',
      keybinding: 'Cmd+T',
      callback: async function() {
        console.log('Opening today\'s note...');
      }
    },
    {
      id: 'open-yesterday',
      name: 'Open Yesterday\'s Note',
      description: 'Open yesterday\'s daily note',
      keybinding: 'Cmd+Shift+T',
      callback: async function() {
        console.log('Opening yesterday\'s note...');
      }
    }
  ] as Command[],

  onLoad: async function() {
    console.log('Daily Notes plugin loaded');
  }
};

// Example: Table of Contents Plugin
export const tocPlugin: PluginManifest = {
  id: 'table-of-contents',
  name: 'Table of Contents',
  version: '1.0.0',
  description: 'Generate and insert table of contents for notes',
  author: 'MarkItUp Team',
  main: 'toc-plugin.js',

  settings: [
    {
      id: 'max-depth',
      name: 'Maximum Heading Depth',
      type: 'number',
      default: 3,
      description: 'Maximum heading level to include in TOC (1-6)'
    },
    {
      id: 'auto-update',
      name: 'Auto-update TOC',
      type: 'boolean',
      default: true,
      description: 'Automatically update TOC when content changes'
    },
    {
      id: 'include-numbers',
      name: 'Include Numbers',
      type: 'boolean',
      default: false,
      description: 'Include section numbers in TOC'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'insert-toc',
      name: 'Insert Table of Contents',
      description: 'Insert TOC at cursor position',
      keybinding: 'Cmd+Shift+O',
      callback: async function() {
        console.log('Inserting table of contents...');
      }
    },
    {
      id: 'update-toc',
      name: 'Update Table of Contents',
      description: 'Update existing TOC in current note',
      callback: async function() {
        console.log('Updating table of contents...');
      }
    }
  ] as Command[],

  processors: [
    {
      id: 'toc-processor',
      name: 'TOC Processor',
      type: 'transform',
      process: async (content: string) => {
        // Extract headings and generate TOC
        const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
        const toc = headings.map(heading => {
          const level = heading.match(/^#+/)?.[0].length || 1;
          const text = heading.replace(/^#+\s+/, '');
          const indent = '  '.repeat(level - 1);
          return `${indent}- [${text}](#${text.toLowerCase().replace(/\s+/g, '-')})`;
        }).join('\n');

        return content.replace(/<!-- TOC -->[\s\S]*?<!-- \/TOC -->/, `<!-- TOC -->\n${toc}\n<!-- /TOC -->`);
      }
    }
  ] as ContentProcessor[],

  onLoad: async function() {
    console.log('Table of Contents plugin loaded');
  }
};

// Example: Backup Plugin
export const backupPlugin: PluginManifest = {
  id: 'auto-backup',
  name: 'Auto Backup',
  version: '1.0.0',
  description: 'Automatically backup notes to cloud storage or local directory',
  author: 'MarkItUp Community',
  main: 'backup-plugin.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Required to create backup files'
    },
    {
      type: 'network',
      description: 'Required for cloud backup services'
    }
  ],

  settings: [
    {
      id: 'backup-interval',
      name: 'Backup Interval (minutes)',
      type: 'number',
      default: 30,
      description: 'How often to create backups'
    },
    {
      id: 'backup-location',
      name: 'Backup Location',
      type: 'select',
      default: 'local',
      options: [
        { label: 'Local Directory', value: 'local' },
        { label: 'Google Drive', value: 'gdrive' },
        { label: 'Dropbox', value: 'dropbox' },
        { label: 'GitHub', value: 'github' }
      ]
    },
    {
      id: 'max-backups',
      name: 'Maximum Backup Count',
      type: 'number',
      default: 10,
      description: 'Maximum number of backups to keep'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'backup-now',
      name: 'Backup Now',
      description: 'Create an immediate backup',
      callback: async function() {
        console.log('Creating backup...');
      }
    },
    {
      id: 'restore-backup',
      name: 'Restore from Backup',
      description: 'Restore notes from a backup',
      callback: async function() {
        console.log('Restoring from backup...');
      }
    }
  ] as Command[],

  onLoad: async function() {
    console.log('Auto Backup plugin loaded');
  }
};

// Example: Citations Plugin
export const citationsPlugin: PluginManifest = {
  id: 'citations',
  name: 'Citations & Bibliography',
  version: '1.0.0',
  description: 'Manage citations and generate bibliographies',
  author: 'Academic Community',
  main: 'citations-plugin.js',

  settings: [
    {
      id: 'citation-style',
      name: 'Citation Style',
      type: 'select',
      default: 'apa',
      options: [
        { label: 'APA', value: 'apa' },
        { label: 'MLA', value: 'mla' },
        { label: 'Chicago', value: 'chicago' },
        { label: 'Harvard', value: 'harvard' }
      ]
    },
    {
      id: 'bibliography-title',
      name: 'Bibliography Title',
      type: 'string',
      default: 'References',
      description: 'Title for the bibliography section'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'insert-citation',
      name: 'Insert Citation',
      description: 'Insert a citation at cursor position',
      keybinding: 'Cmd+Shift+C',
      callback: async function() {
        console.log('Inserting citation...');
      }
    },
    {
      id: 'generate-bibliography',
      name: 'Generate Bibliography',
      description: 'Generate bibliography for current note',
      callback: async function() {
        console.log('Generating bibliography...');
      }
    }
  ] as Command[],

  processors: [
    {
      id: 'citation-processor',
      name: 'Citation Processor',
      type: 'export',
      process: async (content: string) => {
        // Process citations and generate bibliography
        const citations = content.match(/@\w+/g) || [];
        const bibliography = citations.map(cite => 
          `${cite.substring(1)}. (2025). Sample Reference. Journal Name.`
        ).join('\n');

        return content + (bibliography ? `\n\n## References\n\n${bibliography}` : '');
      }
    }
  ] as ContentProcessor[],

  onLoad: async function() {
    console.log('Citations plugin loaded');
  }
};

// Example: Kanban Board Plugin
export const kanbanPlugin: PluginManifest = {
  id: 'kanban-board',
  name: 'Kanban Board',
  version: '1.0.0',
  description: 'Create kanban boards from task lists',
  author: 'Productivity Team',
  main: 'kanban-plugin.js',

  settings: [
    {
      id: 'default-columns',
      name: 'Default Columns',
      type: 'string',
      default: 'To Do,In Progress,Done',
      description: 'Default column names (comma-separated)'
    },
    {
      id: 'auto-archive',
      name: 'Auto-archive Completed',
      type: 'boolean',
      default: false,
      description: 'Automatically archive completed tasks'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'create-kanban',
      name: 'Create Kanban Board',
      description: 'Convert current note to kanban board',
      callback: async function() {
        console.log('Creating kanban board...');
      }
    },
    {
      id: 'toggle-kanban-view',
      name: 'Toggle Kanban View',
      description: 'Toggle between list and kanban view',
      keybinding: 'Cmd+K',
      callback: async function() {
        console.log('Toggling kanban view...');
      }
    }
  ] as Command[],

  onLoad: async function() {
    console.log('Kanban Board plugin loaded');
  }
};

// Example: AI Writing Assistant Plugin
export const aiWritingPlugin: PluginManifest = {
  id: 'ai-writing-assistant',
  name: 'AI Writing Assistant',
  version: '1.0.0',
  description: 'AI-powered writing suggestions, grammar checking, and content enhancement',
  author: 'AI Tools Team',
  main: 'ai-writing-plugin.js',

  permissions: [
    {
      type: 'network',
      description: 'Required to connect to AI services'
    }
  ],

  settings: [
    {
      id: 'ai-provider',
      name: 'AI Provider',
      type: 'select',
      default: 'openai',
      options: [
        { label: 'OpenAI GPT', value: 'openai' },
        { label: 'Claude', value: 'claude' },
        { label: 'Local Model', value: 'local' }
      ]
    },
    {
      id: 'api-key',
      name: 'API Key',
      type: 'string',
      default: '',
      description: 'API key for the selected AI provider'
    },
    {
      id: 'auto-suggestions',
      name: 'Auto Suggestions',
      type: 'boolean',
      default: true,
      description: 'Show writing suggestions automatically'
    },
    {
      id: 'suggestion-delay',
      name: 'Suggestion Delay (ms)',
      type: 'number',
      default: 2000,
      description: 'Delay before showing suggestions while typing'
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'improve-writing',
      name: 'Improve Writing',
      description: 'Get AI suggestions to improve selected text',
      keybinding: 'Cmd+Shift+I',
      callback: async function() {
        console.log('Getting AI writing suggestions...');
      }
    },
    {
      id: 'check-grammar',
      name: 'Check Grammar',
      description: 'Check grammar and spelling in current note',
      keybinding: 'Cmd+Shift+G',
      callback: async function() {
        console.log('Checking grammar...');
      }
    },
    {
      id: 'summarize-note',
      name: 'Summarize Note',
      description: 'Generate AI summary of current note',
      callback: async function() {
        console.log('Generating summary...');
      }
    },
    {
      id: 'expand-outline',
      name: 'Expand Outline',
      description: 'Expand bullet points into full paragraphs',
      callback: async function() {
        console.log('Expanding outline...');
      }
    }
  ] as Command[],

  processors: [
    {
      id: 'ai-enhancement-processor',
      name: 'AI Enhancement Processor',
      type: 'transform',
      process: async (content: string) => {
        // Simulate AI enhancement
        const enhanced = content
          .replace(/\bteh\b/g, 'the') // Fix common typos
          .replace(/\bi\b/g, 'I') // Capitalize 'i'
          .replace(/\. +/g, '. '); // Fix spacing

        return enhanced;
      }
    }
  ] as ContentProcessor[],

  onLoad: async function() {
    console.log('AI Writing Assistant plugin loaded');
  }
};

// Example: Spaced Repetition Plugin
export const spacedRepetitionPlugin: PluginManifest = {
  id: 'spaced-repetition',
  name: 'Spaced Repetition System',
  version: '1.0.0',
  description: 'Create and review flashcards with spaced repetition algorithm',
  author: 'Learning Tools Team',
  main: 'spaced-repetition-plugin.js',

  settings: [
    {
      id: 'review-time',
      name: 'Daily Review Time',
      type: 'string',
      default: '09:00',
      description: 'Preferred time for daily reviews (HH:MM format)'
    },
    {
      id: 'cards-per-session',
      name: 'Cards per Session',
      type: 'number',
      default: 20,
      description: 'Maximum number of cards to review per session'
    },
    {
      id: 'difficulty-algorithm',
      name: 'Difficulty Algorithm',
      type: 'select',
      default: 'sm2',
      options: [
        { label: 'SM-2 (SuperMemo 2)', value: 'sm2' },
        { label: 'Anki Algorithm', value: 'anki' },
        { label: 'Simple Intervals', value: 'simple' }
      ]
    }
  ] as PluginSetting[],

  commands: [
    {
      id: 'create-flashcard',
      name: 'Create Flashcard',
      description: 'Create flashcard from selected text',
      keybinding: 'Cmd+Shift+F',
      callback: async function() {
        console.log('Creating flashcard...');
      }
    },
    {
      id: 'start-review',
      name: 'Start Review Session',
      description: 'Begin reviewing due flashcards',
      keybinding: 'Cmd+R',
      callback: async function() {
        console.log('Starting review session...');
      }
    },
    {
      id: 'view-statistics',
      name: 'View Statistics',
      description: 'Show learning progress and statistics',
      callback: async function() {
        console.log('Showing statistics...');
      }
    }
  ] as Command[],

  onLoad: async function() {
    console.log('Spaced Repetition plugin loaded');
    // Initialize review scheduler
  }
};
