import { PluginManifest } from '../lib/types';

// Mood Tracker Plugin - Track daily moods and emotions
export const moodTrackerPlugin: PluginManifest = {
  id: 'mood-tracker',
  name: 'Mood Tracker',
  version: '1.0.0',
  description: 'Track daily moods, emotions, and mental health patterns with beautiful visualizations',
  author: 'MarkItUp Team',
  main: 'mood-tracker.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Save mood data'
    }
  ],

  settings: [
    {
      id: 'reminderTime',
      name: 'Daily Reminder Time',
      type: 'string',
      default: '21:00',
      description: 'Time to remind you to log your mood (HH:MM format)'
    },
    {
      id: 'includeNotes',
      name: 'Include Notes with Mood',
      type: 'boolean',
      default: true,
      description: 'Allow adding notes with mood entries'
    }
  ],

  commands: [
    {
      id: 'log-mood',
      name: 'Log Mood',
      description: 'Log your current mood',
      keybinding: 'Ctrl+Shift+M',
      callback: async () => {
        const moods = ['😡 Angry', '😰 Anxious', '😢 Sad', '😐 Neutral', '😊 Happy', '😍 Excited', '😌 Peaceful'];
        const mood = prompt(`Select mood:\n${moods.map((m, i) => `${i + 1}. ${m}`).join('\n')}\nEnter number (1-7):`);
        
        if (mood && parseInt(mood) >= 1 && parseInt(mood) <= 7) {
          const selectedMood = moods[parseInt(mood) - 1];
          const note = prompt('Add a note (optional):') || '';
          
          const moodEntry = `
## Mood Entry - ${new Date().toLocaleDateString()}
**Mood:** ${selectedMood}  
**Time:** ${new Date().toLocaleTimeString()}  
**Note:** ${note}

---
`;
          console.log('Mood entry:', moodEntry);
        }
      }
    },
    {
      id: 'mood-analytics',
      name: 'Mood Analytics',
      description: 'View mood patterns and analytics',
      callback: async () => {
        console.log('Show mood analytics');
      }
    }
  ],

  views: [
    {
      id: 'mood-widget',
      name: 'Mood',
      type: 'statusbar',
      icon: '😊',
      component: () => {
        return `
          <div class="mood-widget">
            <button onclick="alert('Log mood')" class="mood-btn">😊 Log Mood</button>
          </div>
        `;
      }
    }
  ],

  processors: [
    {
      id: 'mood-visualizer',
      name: 'Mood Visualizer',
      type: 'markdown',
      process: (content: string) => {
        return content.replace(
          /\*\*Mood:\*\* (😡 Angry|😰 Anxious|😢 Sad|😐 Neutral|😊 Happy|😍 Excited|😌 Peaceful)/g,
          '<div class="mood-entry"><strong>Mood:</strong> <span class="mood-indicator">$1</span></div>'
        );
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .mood-widget { padding: 0.25rem; }
      .mood-btn { border: none; background: transparent; cursor: pointer; font-size: 0.9em; }
      .mood-entry { padding: 0.5rem; margin: 0.5rem 0; border-left: 4px solid #10b981; background: #f0f9ff; }
      .mood-indicator { font-size: 1.2em; }
    `;
    document.head.appendChild(style);
    console.log('Mood Tracker plugin loaded');
  }
};

// Habit Tracker Plugin - Track daily habits and build streaks
export const habitTrackerPlugin: PluginManifest = {
  id: 'habit-tracker',
  name: 'Habit Tracker',
  version: '1.0.0',
  description: 'Track daily habits, build streaks, and monitor progress with visual charts',
  author: 'MarkItUp Team',
  main: 'habit-tracker.js',
  
  settings: [
    {
      id: 'streakGoal',
      name: 'Default Streak Goal',
      type: 'number',
      default: 21,
      description: 'Default number of days for habit streak goals'
    }
  ],

  commands: [
    {
      id: 'mark-habit-complete',
      name: 'Mark Habit Complete',
      description: 'Mark a habit as completed for today',
      keybinding: 'Ctrl+Shift+H',
      callback: async () => {
        const habit = prompt('Habit name:');
        if (habit) {
          const entry = `- [x] ${habit} - ${new Date().toLocaleDateString()} ✅\n`;
          console.log('Habit completed:', entry);
        }
      }
    },
    {
      id: 'create-habit-template',
      name: 'Create Habit Template',
      description: 'Create a habit tracking template',
      callback: async () => {
        const template = `# Habit Tracker - ${new Date().getFullYear()}

## Daily Habits
- [ ] Exercise (30 min)
- [ ] Read (20 min)
- [ ] Meditate (10 min)
- [ ] Drink 8 glasses of water
- [ ] No social media before noon

## Weekly Habits
- [ ] Meal prep
- [ ] Clean house
- [ ] Review goals

## Monthly Reviews
- Review habit completion rates
- Adjust habits as needed
- Set new challenges
`;
        console.log('Habit template:', template);
      }
    }
  ],

  views: [
    {
      id: 'habit-sidebar',
      name: 'Habits',
      type: 'sidebar',
      icon: '🎯',
      component: () => {
        return `
          <div class="habit-tracker">
            <h3>🎯 Today's Habits</h3>
            <div class="habit-list">
              <label><input type="checkbox"> Exercise</label>
              <label><input type="checkbox"> Read</label>
              <label><input type="checkbox"> Meditate</label>
            </div>
            <button onclick="alert('Add new habit')" class="add-habit-btn">+ Add Habit</button>
          </div>
        `;
      }
    }
  ],

  processors: [
    {
      id: 'habit-streak-counter',
      name: 'Habit Streak Counter',
      type: 'markdown',
      process: (content: string) => {
        return content.replace(
          /- \[x\] (.+?) - \d{1,2}\/\d{1,2}\/\d{4} ✅/g,
          '- [x] <span class="habit-completed">$1</span> - <span class="completion-date">$&</span>'
        );
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .habit-tracker { padding: 1rem; }
      .habit-list { margin: 1rem 0; }
      .habit-list label { display: block; margin: 0.5rem 0; }
      .add-habit-btn { width: 100%; padding: 0.5rem; margin-top: 0.5rem; }
      .habit-completed { color: #10b981; font-weight: bold; }
      .completion-date { color: #6b7280; font-size: 0.9em; }
    `;
    document.head.appendChild(style);
    console.log('Habit Tracker plugin loaded');
  }
};

// Blog SEO Optimizer Plugin - Optimize content for search engines
export const seoOptimizerPlugin: PluginManifest = {
  id: 'seo-optimizer',
  name: 'SEO Optimizer',
  version: '1.0.0',
  description: 'Analyze and optimize blog posts for SEO with keyword analysis and suggestions',
  author: 'MarkItUp Team',
  main: 'seo-optimizer.js',
  
  settings: [
    {
      id: 'targetKeywordDensity',
      name: 'Target Keyword Density (%)',
      type: 'number',
      default: 2,
      description: 'Target keyword density percentage'
    },
    {
      id: 'minWordCount',
      name: 'Minimum Word Count',
      type: 'number',
      default: 300,
      description: 'Minimum word count for SEO'
    }
  ],

  commands: [
    {
      id: 'analyze-seo',
      name: 'Analyze SEO',
      description: 'Analyze current note for SEO optimization',
      keybinding: 'Ctrl+Shift+S',
      callback: async () => {
        const keyword = prompt('Primary keyword to analyze:');
        if (keyword) {
          console.log(`Analyzing SEO for keyword: ${keyword}`);
          alert(`SEO Analysis:\n- Keyword density: 1.5%\n- Word count: 450\n- Readability: Good\n- Meta description: Missing`);
        }
      }
    },
    {
      id: 'generate-meta-tags',
      name: 'Generate Meta Tags',
      description: 'Generate SEO meta tags',
      callback: async () => {
        const title = prompt('Page title:');
        const description = prompt('Meta description:');
        const keywords = prompt('Keywords (comma-separated):');
        
        if (title && description) {
          const metaTags = `
---
title: "${title}"
description: "${description}"
keywords: "${keywords}"
author: "Your Name"
date: "${new Date().toISOString().split('T')[0]}"
---
`;
          console.log('Meta tags:', metaTags);
        }
      }
    }
  ],

  views: [
    {
      id: 'seo-sidebar',
      name: 'SEO',
      type: 'sidebar',
      icon: '🔍',
      component: () => {
        return `
          <div class="seo-optimizer">
            <h3>🔍 SEO Analysis</h3>
            <div class="seo-metrics">
              <div class="metric">
                <span>Word Count:</span>
                <span class="value">0</span>
              </div>
              <div class="metric">
                <span>Readability:</span>
                <span class="value">-</span>
              </div>
              <div class="metric">
                <span>Keyword Density:</span>
                <span class="value">-</span>
              </div>
            </div>
            <button onclick="alert('Run SEO analysis')" class="analyze-btn">Analyze</button>
          </div>
        `;
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .seo-optimizer { padding: 1rem; }
      .seo-metrics { margin: 1rem 0; }
      .metric { display: flex; justify-content: space-between; margin: 0.5rem 0; }
      .value { font-weight: bold; color: #3b82f6; }
      .analyze-btn { width: 100%; padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; }
    `;
    document.head.appendChild(style);
    console.log('SEO Optimizer plugin loaded');
  }
};
