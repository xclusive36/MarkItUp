import { PluginManifest, PluginAPI, Note } from '../lib/types';

// Daily Notes Plugin - Automatic daily note creation and management
export const dailyNotesPlugin: PluginManifest = {
  id: 'daily-notes',
  name: 'Daily Notes',
  version: '2.1.0',
  description: 'Automatically create and manage daily notes with templates and calendar navigation',
  author: 'MarkItUp Team',
  main: 'daily-notes.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Create and manage daily note files'
    },
    {
      type: 'notifications',
      description: 'Show daily note reminders'
    }
  ],

  settings: [
    {
      id: 'dailyNoteTemplate',
      name: 'Daily Note Template',
      type: 'string',
      default: `# {{date}}

## Today's Goals
- [ ] 

## Notes


## Reflection
### What went well?


### What could be improved?


## Tomorrow's Priorities
- [ ] 

---
Created: {{time}}`,
      description: 'Template for new daily notes (supports {{date}}, {{time}}, {{day}}, {{month}}, {{year}} variables)'
    },
    {
      id: 'dailyNoteFolder',
      name: 'Daily Notes Folder',
      type: 'string',
      default: 'Daily Notes',
      description: 'Folder where daily notes are stored'
    },
    {
      id: 'autoCreateDaily',
      name: 'Auto-create Daily Note',
      type: 'boolean',
      default: true,
      description: 'Automatically create daily note on app startup'
    },
    {
      id: 'dailyReminder',
      name: 'Daily Reminder Time',
      type: 'string',
      default: '09:00',
      description: 'Time to show daily note reminder (HH:MM format)'
    },
    {
      id: 'weekendNotes',
      name: 'Create Weekend Notes',
      type: 'boolean',
      default: false,
      description: 'Create daily notes on weekends'
    }
  ],

  views: [
    {
      id: 'daily-notes-calendar',
      name: 'Daily Notes Calendar',
      type: 'sidebar',
      component: null as any, // Would be React component
      icon: '📅'
    }
  ],

  commands: [
    {
      id: 'open-today',
      name: 'Open Today\'s Note',
      description: 'Open or create today\'s daily note',
      keybinding: 'Ctrl+Shift+T',
      callback: async function() {
        console.log('Opening today\'s note...');
      }
    },
    {
      id: 'open-yesterday',
      name: 'Open Yesterday\'s Note',
      description: 'Open yesterday\'s daily note',
      keybinding: 'Ctrl+Shift+Y',
      callback: async function() {
        console.log('Opening yesterday\'s note...');
      }
    },
    {
      id: 'show-daily-calendar',
      name: 'Show Daily Notes Calendar',
      description: 'Display calendar view of daily notes',
      keybinding: 'Ctrl+Shift+C',
      callback: async function() {
        console.log('Showing daily notes calendar...');
      }
    }
  ],

  onLoad: async function() {
    console.log('Daily Notes plugin loaded');
  },

  onUnload: async function() {
    console.log('Daily Notes plugin unloaded');
  }
};

// Plugin implementation class
export class DailyNotesPlugin {
  private api: PluginAPI;
  private settings: any;
  private isActive: boolean = false;
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor(api: PluginAPI) {
    this.api = api;
    this.settings = {
      dailyNoteTemplate: `# {{date}}\n\n## Today's Goals\n- [ ] \n\n## Notes\n\n\n## Reflection\n### What went well?\n\n\n### What could be improved?\n\n\n## Tomorrow's Priorities\n- [ ] \n\n---\nCreated: {{time}}`,
      dailyNoteFolder: 'Daily Notes',
      autoCreateDaily: true,
      dailyReminder: '09:00',
      weekendNotes: false
    };
  }

  async initialize() {
    this.isActive = true;
    
    // Auto-create today's note if enabled
    if (this.settings.autoCreateDaily) {
      await this.createTodaysNote();
    }
    
    // Set up daily reminder
    this.setupDailyReminder();
    
    // Listen for date changes (midnight)
    this.setupMidnightChecker();
    
    this.api.ui.showNotification('Daily Notes plugin activated', 'info');
  }

  private async createTodaysNote(): Promise<Note | null> {
    const today = new Date();
    const dateString = this.formatDate(today);
    const fileName = `${dateString}.md`;
    
    // Check if today's note already exists
    const existingNotes = this.api.notes.getAll();
    const todaysNote = existingNotes.find(note => 
      note.name === fileName || note.name === dateString
    );
    
    if (todaysNote) {
      return todaysNote;
    }
    
    // Check if weekends are disabled
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    if (isWeekend && !this.settings.weekendNotes) {
      return null;
    }
    
    // Create new daily note
    const content = this.processTemplate(this.settings.dailyNoteTemplate, today);
    
    try {
      const note = await this.api.notes.create(
        dateString,
        content,
        this.settings.dailyNoteFolder
      );
      
      this.api.ui.showNotification(`Created daily note for ${dateString}`, 'info');
      
      // Emit analytics event
      this.api.events.emit('daily-note-created', {
        date: dateString,
        noteId: note.id
      });
      
      return note;
    } catch (error) {
      this.api.ui.showNotification('Failed to create daily note', 'error');
      console.error('Failed to create daily note:', error);
      return null;
    }
  }

  private async openDateNote(date: Date): Promise<void> {
    const dateString = this.formatDate(date);
    const existingNotes = this.api.notes.getAll();
    
    let note = existingNotes.find(n => 
      n.name === `${dateString}.md` || n.name === dateString
    );
    
    if (!note) {
      // Create the note if it doesn't exist
      const content = this.processTemplate(this.settings.dailyNoteTemplate, date);
      note = await this.api.notes.create(
        dateString,
        content,
        this.settings.dailyNoteFolder
      );
    }
    
    // Emit event to open the note
    this.api.events.emit('note-open-requested', { noteId: note.id });
  }

  private processTemplate(template: string, date: Date): string {
    const replacements = {
      '{{date}}': this.formatDate(date),
      '{{time}}': date.toLocaleTimeString(),
      '{{day}}': date.toLocaleDateString('en-US', { weekday: 'long' }),
      '{{month}}': date.toLocaleDateString('en-US', { month: 'long' }),
      '{{year}}': date.getFullYear().toString(),
      '{{dayNumber}}': date.getDate().toString(),
      '{{monthNumber}}': (date.getMonth() + 1).toString().padStart(2, '0'),
      '{{iso}}': date.toISOString().split('T')[0]
    };
    
    let processed = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return processed;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private setupDailyReminder(): void {
    const checkReminder = () => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5); // HH:MM format
      
      if (timeString === this.settings.dailyReminder) {
        this.api.ui.showNotification(
          'Daily Note Reminder: Don\'t forget to update your daily note!',
          'info'
        );
      }
    };
    
    // Check every minute
    this.reminderInterval = setInterval(checkReminder, 60000);
  }

  private setupMidnightChecker(): void {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        if (this.settings.autoCreateDaily) {
          this.createTodaysNote();
        }
      }
    };
    
    // Check every minute
    setInterval(checkMidnight, 60000);
  }

  // Public methods for commands
  async openToday(): Promise<void> {
    await this.openDateNote(new Date());
  }

  async openYesterday(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await this.openDateNote(yesterday);
  }

  async openSpecificDate(dateString: string): Promise<void> {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      await this.openDateNote(date);
    }
  }

  getAllDailyNotes(): Note[] {
    const allNotes = this.api.notes.getAll();
    const datePattern = /^\d{4}-\d{2}-\d{2}(\.md)?$/;
    
    return allNotes.filter(note => 
      datePattern.test(note.name) || 
      (note.folder === this.settings.dailyNoteFolder)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  updateSettings(newSettings: any): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // Restart reminder with new time
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.setupDailyReminder();
    }
  }

  dispose(): void {
    this.isActive = false;
    
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }
}

export default dailyNotesPlugin;
