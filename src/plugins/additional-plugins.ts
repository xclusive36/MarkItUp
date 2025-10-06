import { PluginManifest, PluginAPI } from '../lib/types';

// Global plugin instances - will be set in onLoad
let goalTrackerInstance: GoalTrackerPlugin | null = null;
let socialMediaSchedulerInstance: SocialMediaSchedulerPlugin | null = null;
let fileOrganizerInstance: FileOrganizerPlugin | null = null;
let analyticsTrackerInstance: AnalyticsTrackerPlugin | null = null;

// Goal Tracker Plugin - Set and track personal and professional goals
export const goalTrackerPlugin: PluginManifest = {
  id: 'goal-tracker',
  name: 'Goal Tracker',
  version: '1.0.0',
  description: 'Set, track, and achieve personal and professional goals with progress monitoring',
  author: 'MarkItUp Team',
  main: 'goal-tracker.js',

  commands: [
    {
      id: 'create-goal',
      name: 'Create Goal',
      description: 'Create a new SMART goal',
      keybinding: 'Ctrl+Shift+G',
      callback: async (api?: PluginAPI) => {
        if (!goalTrackerInstance) {
          console.error('Goal Tracker plugin instance not initialized');
          api?.ui.showNotification('Goal Tracker plugin not ready', 'error');
          return;
        }
        await goalTrackerInstance.createGoal();
      },
    },
    {
      id: 'update-goal-progress',
      name: 'Update Goal Progress',
      description: 'Update progress on a goal',
      callback: async (api?: PluginAPI) => {
        if (!goalTrackerInstance) {
          console.error('Goal Tracker plugin instance not initialized');
          api?.ui.showNotification('Goal Tracker plugin not ready', 'error');
          return;
        }
        await goalTrackerInstance.reviewGoals();
      },
    },
  ],

  views: [
    {
      id: 'goal-dashboard',
      name: 'Goals',
      type: 'sidebar',
      icon: '🎯',
      component: () => {
        return `
          <div class="goal-tracker">
            <h3>🎯 Active Goals</h3>
            <div class="goal-list">
              <div class="goal-item">
                <div class="goal-title">Learn Spanish</div>
                <div class="goal-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 40%"></div>
                  </div>
                  <span>40%</span>
                </div>
                <div class="goal-deadline">Due: Dec 31</div>
              </div>
              <div class="goal-item">
                <div class="goal-title">Run Marathon</div>
                <div class="goal-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 75%"></div>
                  </div>
                  <span>75%</span>
                </div>
                <div class="goal-deadline">Due: Jun 15</div>
              </div>
            </div>
            <button onclick="alert('Create new goal')" class="new-goal-btn">+ New Goal</button>
          </div>
        `;
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Goal Tracker: PluginAPI not provided to onLoad');
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      .goal-tracker { padding: 1rem; }
      .goal-item { margin: 1rem 0; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px; }
      .goal-title { font-weight: bold; margin-bottom: 0.5rem; }
      .goal-progress { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
      .progress-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
      .progress-fill { height: 100%; background: #10b981; transition: width 0.3s; }
      .goal-deadline { font-size: 0.8em; color: #6b7280; }
      .new-goal-btn { width: 100%; padding: 0.5rem; margin-top: 1rem; background: #10b981; color: white; border: none; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    console.log('Goal Tracker plugin loaded');
    goalTrackerInstance = new GoalTrackerPlugin(api);
  },

  onUnload: async () => {
    goalTrackerInstance = null;
    console.log('Goal Tracker plugin unloaded');
  },
};

// Social Media Scheduler Plugin - Schedule social media posts
export const socialMediaSchedulerPlugin: PluginManifest = {
  id: 'social-media-scheduler',
  name: 'Social Media Scheduler',
  version: '1.0.0',
  description: 'Schedule and manage social media posts for multiple platforms',
  author: 'MarkItUp Team',
  main: 'social-media-scheduler.js',

  settings: [
    {
      id: 'platforms',
      name: 'Active Platforms',
      type: 'string',
      default: 'twitter,linkedin,facebook',
      description: 'Comma-separated list of platforms',
    },
  ],

  commands: [
    {
      id: 'create-social-post',
      name: 'Create Social Post',
      description: 'Create a social media post',
      keybinding: 'Ctrl+Shift+O',
      callback: async (api?: PluginAPI) => {
        if (!socialMediaSchedulerInstance) {
          console.error('Social Media Scheduler plugin instance not initialized');
          api?.ui.showNotification('Social Media Scheduler plugin not ready', 'error');
          return;
        }
        await socialMediaSchedulerInstance.schedulePosts();
      },
    },
    {
      id: 'analyze-hashtags',
      name: 'Analyze Hashtags',
      description: 'Analyze hashtags in current note',
      callback: async (api?: PluginAPI) => {
        if (!socialMediaSchedulerInstance) {
          console.error('Social Media Scheduler plugin instance not initialized');
          api?.ui.showNotification('Social Media Scheduler plugin not ready', 'error');
          return;
        }
        await socialMediaSchedulerInstance.generateHashtags();
      },
    },
  ],

  views: [
    {
      id: 'social-calendar',
      name: 'Social',
      type: 'sidebar',
      icon: '📱',
      component: () => {
        return `
          <div class="social-scheduler">
            <h3>📱 Upcoming Posts</h3>
            <div class="post-queue">
              <div class="scheduled-post">
                <div class="post-platform">Twitter</div>
                <div class="post-content">New blog post about...</div>
                <div class="post-time">Today 2:00 PM</div>
              </div>
              <div class="scheduled-post">
                <div class="post-platform">LinkedIn</div>
                <div class="post-content">Career advice thread...</div>
                <div class="post-time">Tomorrow 9:00 AM</div>
              </div>
            </div>
            <button onclick="alert('Create new post')" class="new-post-btn">+ Schedule Post</button>
          </div>
        `;
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Social Media Scheduler: PluginAPI not available');
      return;
    }

    socialMediaSchedulerInstance = new SocialMediaSchedulerPlugin(api);

    const style = document.createElement('style');
    style.textContent = `
      .social-scheduler { padding: 1rem; }
      .scheduled-post { margin: 0.5rem 0; padding: 0.5rem; background: #f3f4f6; border-radius: 4px; }
      .post-platform { font-weight: bold; color: #3b82f6; }
      .post-content { margin: 0.25rem 0; font-size: 0.9em; }
      .post-time { font-size: 0.8em; color: #6b7280; }
      .new-post-btn { width: 100%; padding: 0.5rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; }
    `;
    document.head.appendChild(style);
    console.log('Social Media Scheduler plugin loaded');
  },

  onUnload: async () => {
    socialMediaSchedulerInstance = null;
    console.log('Social Media Scheduler plugin unloaded');
  },
};

// File Organizer Plugin - Organize and categorize notes
export const fileOrganizerPlugin: PluginManifest = {
  id: 'file-organizer',
  name: 'File Organizer',
  version: '1.0.0',
  description: 'Auto-organize notes by topics, tags, and content analysis',
  author: 'MarkItUp Team',
  main: 'file-organizer.js',

  commands: [
    {
      id: 'organize-files',
      name: 'Organize Files',
      description: 'Auto-organize files by content',
      callback: async (api?: PluginAPI) => {
        if (!fileOrganizerInstance) {
          console.error('File Organizer plugin instance not initialized');
          api?.ui.showNotification('File Organizer plugin not ready', 'error');
          return;
        }
        await fileOrganizerInstance.organizeByTags();
      },
    },
    {
      id: 'suggest-tags',
      name: 'Suggest Tags',
      description: 'Suggest tags for current note',
      callback: async (api?: PluginAPI) => {
        if (!fileOrganizerInstance) {
          console.error('File Organizer plugin instance not initialized');
          api?.ui.showNotification('File Organizer plugin not ready', 'error');
          return;
        }
        await fileOrganizerInstance.cleanupDuplicates();
      },
    },
  ],

  views: [
    {
      id: 'file-organizer-panel',
      name: 'Organize',
      type: 'sidebar',
      icon: '📁',
      component: () => {
        return `
          <div class="file-organizer">
            <h3>📁 File Organization</h3>
            <div class="org-stats">
              <div class="stat">
                <span>Total Notes:</span>
                <span class="value">47</span>
              </div>
              <div class="stat">
                <span>Categories:</span>
                <span class="value">8</span>
              </div>
              <div class="stat">
                <span>Untagged:</span>
                <span class="value">12</span>
              </div>
            </div>
            <div class="quick-actions">
              <button onclick="alert('Auto-organize')" class="org-btn">🤖 Auto-Organize</button>
              <button onclick="alert('Tag suggestions')" class="org-btn">🏷️ Suggest Tags</button>
              <button onclick="alert('Clean duplicates')" class="org-btn">🧹 Clean Up</button>
            </div>
          </div>
        `;
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('File Organizer: PluginAPI not available');
      return;
    }

    fileOrganizerInstance = new FileOrganizerPlugin(api);

    const style = document.createElement('style');
    style.textContent = `
      .file-organizer { padding: 1rem; }
      .org-stats { margin: 1rem 0; }
      .stat { display: flex; justify-content: space-between; margin: 0.5rem 0; }
      .value { font-weight: bold; color: #059669; }
      .quick-actions { display: flex; flex-direction: column; gap: 0.5rem; }
      .org-btn { padding: 0.5rem; border: none; border-radius: 4px; background: #f3f4f6; cursor: pointer; }
      .org-btn:hover { background: #e5e7eb; }
    `;
    document.head.appendChild(style);
    console.log('File Organizer plugin loaded');
  },

  onUnload: async () => {
    fileOrganizerInstance = null;
    console.log('File Organizer plugin unloaded');
  },
};

// Analytics Tracker Plugin - Track blog and content analytics
export const analyticsTrackerPlugin: PluginManifest = {
  id: 'analytics-tracker',
  name: 'Analytics Tracker',
  version: '1.0.0',
  description: 'Track content performance, views, and engagement metrics',
  author: 'MarkItUp Team',
  main: 'analytics-tracker.js',

  commands: [
    {
      id: 'view-analytics',
      name: 'View Analytics',
      description: 'View content analytics dashboard',
      callback: async (api?: PluginAPI) => {
        if (!analyticsTrackerInstance) {
          console.error('Analytics Tracker plugin instance not initialized');
          api?.ui.showNotification('Analytics Tracker plugin not ready', 'error');
          return;
        }
        await analyticsTrackerInstance.trackMetrics();
      },
    },
  ],

  views: [
    {
      id: 'analytics-widget',
      name: 'Analytics',
      type: 'statusbar',
      icon: '📊',
      component: () => {
        return `
          <div class="analytics-widget">
            <span class="metric">👀 2.8k views</span>
            <span class="metric">📈 +15%</span>
          </div>
        `;
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Analytics Tracker: PluginAPI not available');
      return;
    }

    analyticsTrackerInstance = new AnalyticsTrackerPlugin(api);

    const style = document.createElement('style');
    style.textContent = `
      .analytics-widget { display: flex; gap: 1rem; font-size: 0.8em; }
      .metric { color: #6b7280; }
    `;
    document.head.appendChild(style);
    console.log('Analytics Tracker plugin loaded');
  },

  onUnload: async () => {
    analyticsTrackerInstance = null;
    console.log('Analytics Tracker plugin unloaded');
  },
};

// ============================================
// PLUGIN IMPLEMENTATION CLASSES
// ============================================

// Goal Tracker Plugin Implementation
export class GoalTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async createGoal() {
    const template = `# 🎯 Goal: New Goal

## Goal Details
- **Category:** General
- **Status:** 🔵 In Progress
- **Created:** ${new Date().toLocaleDateString()}
- **Deadline:** TBD
- **Progress:** 0%

## SMART Criteria
- **Specific:** [What exactly do you want to achieve?]
- **Measurable:** [How will you measure progress?]
- **Achievable:** [Is this goal realistic?]
- **Relevant:** [Why is this goal important?]
- **Time-bound:** [When will you achieve this?]

## Action Plan
### Milestones
- [ ] Milestone 1
- [ ] Milestone 2
- [ ] Milestone 3

### Weekly Tasks
- [ ] Week 1: [Task]
- [ ] Week 2: [Task]
- [ ] Week 3: [Task]

## Progress Log
*Track your progress here*
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification(
      'Goal template inserted! Edit the goal title and details.',
      'info'
    );
  }

  async reviewGoals() {
    const content = this.api.ui.getEditorContent();

    // Count goals and their status
    const totalGoals = (content.match(/# 🎯 Goal:/g) || []).length;
    const inProgress = (content.match(/\*\*Status:\*\* 🔵 In Progress/g) || []).length;
    const completed = (content.match(/\*\*Status:\*\* ✅ Completed/g) || []).length;

    console.log(`Goals: ${totalGoals} total, ${inProgress} in progress, ${completed} completed`);
    this.api.ui.showNotification(
      `Goals: ${totalGoals} total (${inProgress} active, ${completed} complete)`,
      'info'
    );
  }
}

// Social Media Scheduler Plugin Implementation
export class SocialMediaSchedulerPlugin {
  constructor(private api: PluginAPI) {}

  async schedulePosts() {
    const template = `# Social Media Schedule - ${new Date().toLocaleDateString()}

## Upcoming Posts

### Monday
- [ ] **Platform:** Twitter
  - **Time:** 9:00 AM
  - **Content:** [Post content]
  - **Hashtags:** #tag1 #tag2
  - **Media:** [Image/video link]

### Wednesday  
- [ ] **Platform:** LinkedIn
  - **Time:** 12:00 PM
  - **Content:** [Post content]
  - **Link:** [URL]

### Friday
- [ ] **Platform:** Instagram
  - **Time:** 6:00 PM
  - **Content:** [Caption]
  - **Hashtags:** #tag1 #tag2 #tag3
  - **Media:** [Image link]

## Content Ideas
- 
- 
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Social media schedule template inserted!', 'info');
  }

  async generateHashtags() {
    const content = this.api.ui.getEditorContent();

    // Extract existing hashtags
    const hashtagMatches = content.match(/#\w+/g) || [];
    const uniqueHashtags = [...new Set(hashtagMatches)];

    console.log('Hashtags found:', uniqueHashtags);
    this.api.ui.showNotification(
      `Found ${uniqueHashtags.length} unique hashtags in document`,
      'info'
    );
  }
}

// File Organizer Plugin Implementation
export class FileOrganizerPlugin {
  constructor(private api: PluginAPI) {}

  async organizeByTags() {
    const allNotes = this.api.notes.getAll();

    // Group notes by tags
    const tagGroups: Record<string, number> = {};

    for (const note of allNotes) {
      const tags = note.tags || [];
      tags.forEach(tag => {
        tagGroups[tag] = (tagGroups[tag] || 0) + 1;
      });
    }

    const summary = Object.entries(tagGroups)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => `  ${tag}: ${count} notes`)
      .join('\n');

    console.log('Tag Organization:\n' + summary);
    this.api.ui.showNotification(`Organized ${allNotes.length} notes by tags`, 'info');
  }

  async cleanupDuplicates() {
    const allNotes = this.api.notes.getAll();

    // Find potential duplicates (same name)
    const nameMap = new Map<string, number>();
    allNotes.forEach(note => {
      nameMap.set(note.name, (nameMap.get(note.name) || 0) + 1);
    });

    const duplicates = Array.from(nameMap.entries()).filter(([, count]) => count > 1);

    console.log(`Found ${duplicates.length} potential duplicate file names`);
    this.api.ui.showNotification(
      `Found ${duplicates.length} potential duplicates`,
      duplicates.length > 0 ? 'warning' : 'info'
    );
  }
}

// Analytics Tracker Plugin Implementation
export class AnalyticsTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async trackMetrics() {
    const allNotes = this.api.notes.getAll();
    const content = this.api.ui.getEditorContent();

    // Calculate metrics
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const totalWordCount = allNotes.reduce((sum, note) => {
      const words = note.content.split(/\s+/).filter(w => w.length > 0).length;
      return sum + words;
    }, 0);

    const metrics = `
📊 Writing Analytics
═══════════════════
Current Note:
  - Words: ${wordCount}
  - Characters: ${content.length}

Workspace:
  - Total Notes: ${allNotes.length}
  - Total Words: ${totalWordCount}
  - Average Words/Note: ${Math.round(totalWordCount / allNotes.length)}
`;

    console.log(metrics);
    this.api.ui.showNotification(
      `Analytics: ${allNotes.length} notes, ${totalWordCount} total words`,
      'info'
    );
  }
}
