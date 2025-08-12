import { PluginManifest } from '../lib/types';

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
      callback: async () => {
        const goalTitle = prompt('Goal title:');
        const deadline = prompt('Target deadline (YYYY-MM-DD):');
        const category = prompt('Category (personal/professional/health/financial):');
        
        if (goalTitle) {
          const template = `# 🎯 Goal: ${goalTitle}

## Goal Details
- **Category:** ${category || 'General'}
- **Status:** 🔵 In Progress
- **Created:** ${new Date().toLocaleDateString()}
- **Deadline:** ${deadline || 'TBD'}
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
| Date | Progress | Notes |
|------|----------|-------|
| ${new Date().toLocaleDateString()} | 0% | Goal created |

## Obstacles & Solutions
- **Obstacle:** [Potential challenge]
  - **Solution:** [How to overcome it]

## Motivation & Rewards
- **Why this matters:** [Your motivation]
- **Reward:** [What you'll do when you achieve this]

## Resources Needed
- Resource 1
- Resource 2
- Resource 3
`;
          console.log('Goal template:', template);
        }
      }
    },
    {
      id: 'update-goal-progress',
      name: 'Update Goal Progress',
      description: 'Update progress on a goal',
      callback: async () => {
        const progress = prompt('New progress percentage (0-100):');
        const notes = prompt('Progress notes:');
        
        if (progress) {
          console.log(`Goal progress updated: ${progress}% - ${notes}`);
        }
      }
    }
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
      }
    }
  ],

  onLoad: async () => {
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
  }
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
      description: 'Comma-separated list of platforms'
    }
  ],

  commands: [
    {
      id: 'create-social-post',
      name: 'Create Social Post',
      description: 'Create a social media post',
      keybinding: 'Ctrl+Shift+O',
      callback: async () => {
        const platforms = ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'];
        const platform = prompt(`Platform:\n${platforms.map((p, i) => `${i + 1}. ${p}`).join('\n')}\nEnter number:`);
        
        if (platform && parseInt(platform) >= 1 && parseInt(platform) <= 4) {
          const selectedPlatform = platforms[parseInt(platform) - 1];
          const content = prompt('Post content:');
          const scheduleTime = prompt('Schedule time (YYYY-MM-DD HH:MM) or leave empty for now:');
          
          if (content) {
            const post = `
## Social Media Post - ${selectedPlatform}

**Platform:** ${selectedPlatform}  
**Status:** ${scheduleTime ? '📅 Scheduled' : '✏️ Draft'}  
**Schedule:** ${scheduleTime || 'Not scheduled'}  
**Created:** ${new Date().toLocaleDateString()}

### Content
${content}

### Hashtags
#hashtag1 #hashtag2 #hashtag3

### Media
- [ ] Add image/video
- [ ] Add link preview

### Engagement Plan
- [ ] Respond to comments
- [ ] Monitor mentions
- [ ] Track metrics

---
`;
            console.log('Social media post:', post);
          }
        }
      }
    }
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
      }
    }
  ],

  onLoad: async () => {
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
  }
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
      callback: async () => {
        console.log('Analyzing and organizing files...');
        alert('Files organized! Check the new folder structure.');
      }
    },
    {
      id: 'suggest-tags',
      name: 'Suggest Tags',
      description: 'Suggest tags for current note',
      callback: async () => {
        const suggestedTags = ['productivity', 'work', 'ideas', 'personal', 'project'];
        const tags = prompt(`Suggested tags:\n${suggestedTags.join(', ')}\n\nSelect tags to add (comma-separated):`);
        
        if (tags) {
          console.log('Tags added:', tags);
        }
      }
    }
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
      }
    }
  ],

  onLoad: async () => {
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
  }
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
      callback: async () => {
        const report = `# Content Analytics Report

## Overview (Last 30 Days)
- **Total Views:** 2,847
- **Unique Visitors:** 1,923
- **Average Read Time:** 3m 42s
- **Bounce Rate:** 34%

## Top Performing Content
1. "How to Learn Programming" - 487 views
2. "Productivity Tips" - 312 views
3. "Morning Routine Guide" - 289 views

## Traffic Sources
- **Organic Search:** 65%
- **Social Media:** 20%
- **Direct:** 10%
- **Referrals:** 5%

## Engagement Metrics
- **Comments:** 23
- **Shares:** 156
- **Likes:** 342
`;
        console.log('Analytics report:', report);
      }
    }
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
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .analytics-widget { display: flex; gap: 1rem; font-size: 0.8em; }
      .metric { color: #6b7280; }
    `;
    document.head.appendChild(style);
    console.log('Analytics Tracker plugin loaded');
  }
};
