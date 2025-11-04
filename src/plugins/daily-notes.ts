import { PluginManifest, PluginAPI, Note } from '../lib/types';

// Global plugin instance - will be set in onLoad
let pluginInstance: DailyNotesPlugin | null = null;

// Template library with predefined templates
export const DAILY_NOTE_TEMPLATES = {
  default: {
    id: 'default',
    name: 'Default Journal',
    description: 'Comprehensive daily journal with goals and reflection',
    template: `# {{date}}

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
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple daily note with just a date heading',
    template: `# {{date}}

`,
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity Focus',
    description: 'Focus on tasks, time blocking, and achievements',
    template: `# {{date}} - {{day}}

## 🎯 Top 3 Priorities
1. [ ] 
2. [ ] 
3. [ ] 

## ⏰ Time Blocks
- 09:00 - 10:00: 
- 10:00 - 12:00: 
- 13:00 - 15:00: 
- 15:00 - 17:00: 

## ✅ Completed Tasks
- [ ] 

## 📝 Notes & Ideas


## 💡 Learnings
- 

---
Energy Level: ⚪⚪⚪⚪⚪
Created: {{time}}`,
  },
  gratitude: {
    id: 'gratitude',
    name: 'Gratitude Journal',
    description: 'Focus on gratitude and positive experiences',
    template: `# {{date}} - {{day}}

## 🙏 Three Things I'm Grateful For
1. 
2. 
3. 

## ✨ Positive Moments Today


## 💪 Personal Wins
- 

## 🌱 Growth & Learning


## 💭 Evening Reflection


---
Mood: 😊
Created: {{time}}`,
  },
  developer: {
    id: 'developer',
    name: 'Developer Log',
    description: 'Track coding progress, bugs, and learning',
    template: `# {{date}} - Development Log

## 💻 Projects Worked On
- 

## ✅ Completed
- [ ] 

## 🐛 Bugs Fixed
- 

## 🎯 In Progress
- [ ] 

## 🚧 Blockers


## 💡 Learnings & Discoveries


## 🔗 Resources
- 

## 📋 Tomorrow's Plan
- [ ] 

---
Commits: 0 | PRs: 0 | Code Reviews: 0
Created: {{time}}`,
  },
  writer: {
    id: 'writer',
    name: "Writer's Journal",
    description: 'Track writing progress and ideas',
    template: `# {{date}}

## ✍️ Writing Session
**Words Written:** 0
**Time Spent:** 
**Projects:** 

## 📖 What I Wrote Today


## 💡 Story Ideas & Inspiration


## 📝 Character Development


## 🎯 Tomorrow's Writing Goals
- [ ] 

## 📚 Reading Notes


---
Total Words This Week: 0
Created: {{time}}`,
  },
  wellness: {
    id: 'wellness',
    name: 'Wellness Tracker',
    description: 'Track health, fitness, and self-care',
    template: `# {{date}} - Wellness Log

## 🏃 Physical Activity
- **Exercise:** 
- **Duration:** 
- **Steps:** 

## 🥗 Nutrition
- **Breakfast:** 
- **Lunch:** 
- **Dinner:** 
- **Water:** 💧💧💧💧💧💧💧💧

## 😴 Sleep
- **Hours:** 
- **Quality:** ⭐⭐⭐⭐⭐

## 🧘 Mental Health
- **Mood:** 😊
- **Stress Level:** ⚪⚪⚪⚪⚪
- **Meditation/Mindfulness:** 

## 💭 Notes


---
Energy: ⚡⚡⚡⚡⚡
Created: {{time}}`,
  },
};

// Daily Notes Plugin - Automatic daily note creation and management
export const dailyNotesPlugin: PluginManifest = {
  id: 'daily-notes',
  name: 'Daily Notes Enhanced',
  version: '3.0.0',
  description: 'Advanced daily journaling with templates, streaks, analytics, and calendar view',
  author: 'MarkItUp Team',
  main: 'daily-notes.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Create and manage daily note files',
    },
    {
      type: 'notifications',
      description: 'Show daily note reminders and streak updates',
    },
  ],

  settings: [
    {
      id: 'selectedTemplate',
      name: 'Active Template',
      type: 'string',
      default: 'default',
      description: 'Template to use for new daily notes',
    },
    {
      id: 'customTemplates',
      name: 'Custom Templates',
      type: 'string',
      default: '[]',
      description: 'User-created custom templates (JSON array)',
    },
    {
      id: 'dailyNoteFolder',
      name: 'Daily Notes Folder',
      type: 'string',
      default: 'Daily Notes',
      description: 'Folder where daily notes are stored',
    },
    {
      id: 'autoCreateDaily',
      name: 'Auto-create Daily Note',
      type: 'boolean',
      default: true,
      description: 'Automatically create daily note on app startup',
    },
    {
      id: 'dailyReminder',
      name: 'Daily Reminder Time',
      type: 'string',
      default: '09:00',
      description: 'Time to show daily note reminder (HH:MM format)',
    },
    {
      id: 'weekendNotes',
      name: 'Create Weekend Notes',
      type: 'boolean',
      default: true,
      description: 'Create daily notes on weekends',
    },
    {
      id: 'showStreakInHeader',
      name: 'Show Streak Badge',
      type: 'boolean',
      default: true,
      description: 'Display current streak in the app header',
    },
    {
      id: 'linkConsecutiveDays',
      name: 'Link Consecutive Days',
      type: 'boolean',
      default: true,
      description: 'Automatically add navigation links to previous/next day',
    },
    {
      id: 'enableAnalytics',
      name: 'Enable Analytics',
      type: 'boolean',
      default: true,
      description: 'Track writing patterns and show insights',
    },
  ],

  views: [
    {
      id: 'daily-notes-calendar',
      name: 'Daily Notes Calendar',
      type: 'sidebar',
      component: (() => null) as unknown as React.ComponentType,
      icon: '📅',
    },
    {
      id: 'daily-notes-dashboard',
      name: 'Daily Notes Analytics',
      type: 'sidebar',
      component: (() => null) as unknown as React.ComponentType,
      icon: '📊',
    },
    {
      id: 'template-manager',
      name: 'Template Manager',
      type: 'modal',
      component: (() => null) as unknown as React.ComponentType,
      icon: '�',
    },
  ],

  commands: [
    {
      id: 'open-today',
      name: "Open Today's Note",
      description: "Open or create today's daily note",
      keybinding: 'Ctrl+Shift+T',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.openToday();
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'open-yesterday',
      name: "Open Yesterday's Note",
      description: "Open yesterday's daily note",
      keybinding: 'Ctrl+Shift+Y',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.openYesterday();
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'open-tomorrow',
      name: "Open Tomorrow's Note",
      description: "Open or create tomorrow's daily note for planning ahead",
      keybinding: 'Ctrl+Shift+N',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.openTomorrow();
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'show-daily-calendar',
      name: 'Show Daily Notes Calendar',
      description: 'Display calendar view of daily notes',
      keybinding: 'Ctrl+Shift+C',
      callback: async function () {
        if (pluginInstance) {
          const dailyNotes = pluginInstance.getAllDailyNotes();
          console.log('📅 Daily Notes Calendar - Daily notes found:', dailyNotes.length);

          // Get streak data for display
          const currentStreak = await pluginInstance.getCurrentStreak();
          const analytics = await pluginInstance.getAnalytics();

          // For now, emit an event that the UI can listen to
          pluginInstance.api.events.emit('show-daily-notes-calendar', {
            dailyNotes,
            currentStreak,
            longestStreak: analytics.longestStreak,
          });

          // Show notification with basic info
          pluginInstance.api.ui.showNotification(
            `📅 Calendar: ${dailyNotes.length} notes | 🔥 ${currentStreak} day streak`,
            'info'
          );
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'quick-capture',
      name: 'Quick Capture to Today',
      description: "Quickly add content to today's note without opening it",
      keybinding: 'Ctrl+Shift+Q',
      callback: async function () {
        if (pluginInstance) {
          await pluginInstance.quickCapture();
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'show-streak',
      name: 'Show Current Streak',
      description: 'Display your current daily notes streak',
      keybinding: 'Ctrl+Shift+S',
      callback: async function () {
        if (pluginInstance) {
          const streak = await pluginInstance.getCurrentStreak();
          pluginInstance.api.ui.showNotification(
            `🔥 Current Streak: ${streak} ${streak === 1 ? 'day' : 'days'}!`,
            'info'
          );
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'show-analytics',
      name: 'Show Daily Notes Analytics',
      description: 'View insights about your journaling habits',
      callback: async function () {
        if (pluginInstance) {
          const analytics = await pluginInstance.getAnalytics();
          console.log('Daily Notes Analytics:', analytics);
          pluginInstance.api.ui.showNotification('Analytics dashboard opened', 'info');
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'manage-templates',
      name: 'Manage Templates',
      description: 'Create and edit daily note templates',
      callback: async function () {
        if (pluginInstance) {
          pluginInstance.openTemplateManager();
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
    {
      id: 'jump-to-date',
      name: 'Jump to Specific Date',
      description: 'Open a daily note for a specific date',
      callback: async function () {
        if (pluginInstance) {
          // This would open a date picker dialog
          pluginInstance.api.ui.showNotification('Date picker - coming soon!', 'info');
        } else {
          console.error('Daily Notes plugin instance not initialized');
        }
      },
    },
  ],

  onLoad: async function (api?: PluginAPI) {
    console.log('Daily Notes plugin loaded');
    if (api) {
      pluginInstance = new DailyNotesPlugin(api);
      await pluginInstance.initialize();
    }
  },

  onUnload: async function () {
    console.log('Daily Notes plugin unloaded');
    if (pluginInstance) {
      pluginInstance.dispose();
      pluginInstance = null;
    }
  },
};

// Plugin implementation class
interface DailyNotesSettings {
  selectedTemplate: string;
  customTemplates: string;
  dailyNoteFolder: string;
  autoCreateDaily: boolean;
  dailyReminder: string;
  weekendNotes: boolean;
  showStreakInHeader: boolean;
  linkConsecutiveDays: boolean;
  enableAnalytics: boolean;
}

interface StreakData {
  current: number;
  longest: number;
  lastNoteDate: string | null;
  totalNotes: number;
}

interface DailyAnalytics {
  totalNotes: number;
  currentStreak: number;
  longestStreak: number;
  averageWordsPerDay: number;
  mostProductiveDay: string;
  mostProductiveTime: string;
  notesThisWeek: number;
  notesThisMonth: number;
  weekdayDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export class DailyNotesPlugin {
  public api: PluginAPI;
  private settings: DailyNotesSettings;
  private isActive: boolean = false;
  private reminderInterval: NodeJS.Timeout | null = null;
  private streakData: StreakData;

  constructor(api: PluginAPI) {
    this.api = api;
    this.settings = {
      selectedTemplate: 'default',
      customTemplates: '[]',
      dailyNoteFolder: 'Daily Notes',
      autoCreateDaily: true,
      dailyReminder: '09:00',
      weekendNotes: true,
      showStreakInHeader: true,
      linkConsecutiveDays: true,
      enableAnalytics: true,
    };
    this.streakData = {
      current: 0,
      longest: 0,
      lastNoteDate: null,
      totalNotes: 0,
    };
  }

  async initialize() {
    this.isActive = true;

    // Load streak data
    await this.loadStreakData();

    // Auto-create today's note if enabled
    if (this.settings.autoCreateDaily) {
      await this.createTodaysNote();
    }

    // Set up daily reminder
    this.setupDailyReminder();

    // Listen for date changes (midnight)
    this.setupMidnightChecker();

    // Show streak notification if enabled
    if (this.settings.showStreakInHeader && this.streakData.current > 0) {
      this.api.ui.showNotification(`🔥 ${this.streakData.current} day streak!`, 'info');
    }

    this.api.ui.showNotification('Daily Notes Enhanced plugin activated', 'info');
  }

  private async loadStreakData(): Promise<void> {
    try {
      // Calculate streak from existing daily notes
      const dailyNotes = this.getAllDailyNotes();

      if (dailyNotes.length === 0) {
        this.streakData = {
          current: 0,
          longest: 0,
          lastNoteDate: null,
          totalNotes: 0,
        };
        return;
      }

      // Sort notes by date (newest first)
      const sortedDates = dailyNotes
        .map(note => {
          const match = note.name.match(/(\d{4}-\d{2}-\d{2})/);
          return match ? match[1] : null;
        })
        .filter((date): date is string => date !== null)
        .sort()
        .reverse();

      this.streakData.totalNotes = sortedDates.length;
      this.streakData.lastNoteDate = sortedDates[0] || null;

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = sortedDates[i];
        if (!dateStr) continue;

        const noteDate = new Date(dateStr);
        noteDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        // Skip weekends if not enabled
        if (!this.settings.weekendNotes) {
          while (expectedDate.getDay() === 0 || expectedDate.getDay() === 6) {
            expectedDate.setDate(expectedDate.getDate() - 1);
          }
        }

        if (noteDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      this.streakData.current = currentStreak;

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const currentDateStr = sortedDates[i];
        const prevDateStr = sortedDates[i - 1];
        if (!currentDateStr || !prevDateStr) continue;

        const currentDate = new Date(currentDateStr);
        const prevDate = new Date(prevDateStr);

        const dayDiff = Math.floor(
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      this.streakData.longest = Math.max(longestStreak, tempStreak, currentStreak);
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  }

  private async createTodaysNote(): Promise<Note | null> {
    const today = new Date();
    const dateString = this.formatDate(today);
    const fileName = `${dateString}.md`;

    // Check if today's note already exists
    const existingNotes = this.api.notes.getAll();
    const todaysNote = existingNotes.find(
      note => note.name === fileName || note.name === dateString
    );

    if (todaysNote) {
      return todaysNote;
    }

    // Check if weekends are disabled
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    if (isWeekend && !this.settings.weekendNotes) {
      return null;
    }

    // Get the active template
    const template = this.getActiveTemplate();
    const content = this.processTemplate(template, today);

    // Add navigation links if enabled
    const finalContent = this.settings.linkConsecutiveDays
      ? this.addNavigationLinks(content, today)
      : content;

    try {
      const note = await this.api.notes.create(
        dateString,
        finalContent,
        this.settings.dailyNoteFolder
      );

      this.api.ui.showNotification(`Created daily note for ${dateString}`, 'info');

      // Update streak
      await this.loadStreakData();

      // Emit analytics event
      this.api.events.emit('daily-note-created', {
        date: dateString,
        noteId: note.id,
        streak: this.streakData.current,
      });

      return note;
    } catch (error) {
      this.api.ui.showNotification('Failed to create daily note', 'error');
      console.error('Failed to create daily note:', error);
      return null;
    }
  }

  private getActiveTemplate(): string {
    const templateId = this.settings.selectedTemplate;

    // Check if it's a built-in template
    if (DAILY_NOTE_TEMPLATES[templateId as keyof typeof DAILY_NOTE_TEMPLATES]) {
      return DAILY_NOTE_TEMPLATES[templateId as keyof typeof DAILY_NOTE_TEMPLATES].template;
    }

    // Check custom templates
    try {
      const customTemplates = JSON.parse(this.settings.customTemplates);
      const customTemplate = customTemplates.find((t: { id: string }) => t.id === templateId);
      if (customTemplate) {
        return customTemplate.template;
      }
    } catch (error) {
      console.error('Failed to parse custom templates:', error);
    }

    // Fallback to default
    return DAILY_NOTE_TEMPLATES.default.template;
  }

  private addNavigationLinks(content: string, date: Date): string {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterdayLink = `[[${this.formatDate(yesterday)}]]`;
    const tomorrowLink = `[[${this.formatDate(tomorrow)}]]`;

    const navigation = `\n\n---\n← ${yesterdayLink} | ${tomorrowLink} →\n`;

    return content + navigation;
  }

  private async openDateNote(date: Date): Promise<void> {
    const dateString = this.formatDate(date);
    const existingNotes = this.api.notes.getAll();

    let note = existingNotes.find(n => n.name === `${dateString}.md` || n.name === dateString);

    if (!note) {
      // Create the note if it doesn't exist
      const template = this.getActiveTemplate();
      const content = this.processTemplate(template, date);
      const finalContent = this.settings.linkConsecutiveDays
        ? this.addNavigationLinks(content, date)
        : content;

      note = await this.api.notes.create(dateString, finalContent, this.settings.dailyNoteFolder);

      this.api.ui.showNotification(`Created daily note for ${dateString}`, 'info');

      // Update streak
      await this.loadStreakData();
    } else {
      // Open existing note
      this.api.ui.openNote(note.id);
      this.api.ui.showNotification(`Opened daily note for ${dateString}`, 'info');
    }
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
      '{{iso}}': date.toISOString().split('T')[0],
    };

    let processed = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      if (value !== undefined) {
        processed = processed.replace(new RegExp(placeholder, 'g'), value);
      }
    }

    return processed;
  }

  private formatDate(date: Date): string {
    const formatted = date.toISOString().split('T')[0];
    return formatted || ''; // YYYY-MM-DD format
  }

  private setupDailyReminder(): void {
    const checkReminder = () => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5); // HH:MM format

      if (timeString === this.settings.dailyReminder) {
        this.api.ui.showNotification(
          "Daily Note Reminder: Don't forget to update your daily note!",
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

  async openTomorrow(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await this.openDateNote(tomorrow);
  }

  async openSpecificDate(dateString: string): Promise<void> {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      await this.openDateNote(date);
    }
  }

  // NEW FEATURE: Quick Capture
  async quickCapture(): Promise<void> {
    // This would open a dialog/modal to quickly add content
    // For now, we'll use a simple notification
    this.api.ui.showNotification(
      "Quick Capture: This feature will open a dialog to add content to today's note",
      'info'
    );

    // Quick capture UI implementation reserved for future enhancement
  }

  // NEW FEATURE: Get Current Streak
  async getCurrentStreak(): Promise<number> {
    await this.loadStreakData();
    return this.streakData.current;
  }

  // NEW FEATURE: Get Analytics
  async getAnalytics(): Promise<DailyAnalytics> {
    const dailyNotes = this.getAllDailyNotes();

    // Calculate analytics
    const weekdayDistribution: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    const monthlyCount: Record<string, number> = {};
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let totalWords = 0;
    let mostProductiveDay = 'Monday';
    let maxNotes = 0;

    dailyNotes.forEach(note => {
      const match = note.name.match(/(\d{4}-\d{2}-\d{2})/);
      if (match && match[1]) {
        const date = new Date(match[1]);
        const dayIndex = date.getDay();
        const dayName = weekdays[dayIndex];
        if (dayName && weekdayDistribution[dayName] !== undefined) {
          weekdayDistribution[dayName]++;
        }

        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;

        // Count words in note
        const wordCount = note.content.split(/\s+/).length;
        totalWords += wordCount;
      }
    });

    // Find most productive day
    Object.entries(weekdayDistribution).forEach(([day, count]) => {
      if (count > maxNotes) {
        maxNotes = count;
        mostProductiveDay = day;
      }
    });

    // Get notes for time periods
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const notesThisWeek = dailyNotes.filter(note => {
      const match = note.name.match(/(\d{4}-\d{2}-\d{2})/);
      if (match && match[1]) {
        const date = new Date(match[1]);
        return date >= weekAgo;
      }
      return false;
    }).length;

    const notesThisMonth = dailyNotes.filter(note => {
      const match = note.name.match(/(\d{4}-\d{2}-\d{2})/);
      if (match && match[1]) {
        const date = new Date(match[1]);
        return date >= monthAgo;
      }
      return false;
    }).length;

    const monthlyTrend = Object.entries(monthlyCount)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months

    return {
      totalNotes: dailyNotes.length,
      currentStreak: this.streakData.current,
      longestStreak: this.streakData.longest,
      averageWordsPerDay: dailyNotes.length > 0 ? Math.round(totalWords / dailyNotes.length) : 0,
      mostProductiveDay,
      mostProductiveTime: '09:00', // Would need to parse creation times
      notesThisWeek,
      notesThisMonth,
      weekdayDistribution,
      monthlyTrend,
    };
  }

  // NEW FEATURE: Open Template Manager
  openTemplateManager(): void {
    this.api.ui.showNotification('Template Manager - Opening...', 'info');
    // Template manager UI reserved for future enhancement
  }

  // NEW FEATURE: Get Available Templates
  getAvailableTemplates() {
    const builtInTemplates = Object.values(DAILY_NOTE_TEMPLATES);

    try {
      const customTemplates = JSON.parse(this.settings.customTemplates);
      return {
        builtIn: builtInTemplates,
        custom: customTemplates,
      };
    } catch {
      return {
        builtIn: builtInTemplates,
        custom: [],
      };
    }
  }

  // NEW FEATURE: Create Custom Template
  createCustomTemplate(name: string, description: string, template: string): void {
    try {
      const customTemplates = JSON.parse(this.settings.customTemplates);
      const newTemplate = {
        id: `custom-${Date.now()}`,
        name,
        description,
        template,
      };
      customTemplates.push(newTemplate);
      this.settings.customTemplates = JSON.stringify(customTemplates);
      this.api.ui.showNotification(`Template "${name}" created successfully`, 'info');
    } catch (error) {
      this.api.ui.showNotification('Failed to create template', 'error');
      console.error('Failed to create custom template:', error);
    }
  }

  getAllDailyNotes(): Note[] {
    const allNotes = this.api.notes.getAll();
    const datePattern = /^\d{4}-\d{2}-\d{2}(\.md)?$/;

    return allNotes
      .filter(note => datePattern.test(note.name) || note.folder === this.settings.dailyNoteFolder)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  updateSettings(newSettings: Partial<DailyNotesSettings>): void {
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
