import { PluginManifest, PluginAPI } from '../lib/types';

// Global plugin instances - will be set in onLoad
let projectTrackerInstance: ProjectTrackerPlugin | null = null;
let meetingNotesInstance: MeetingNotesPlugin | null = null;
let blogTemplateInstance: BlogTemplatePlugin | null = null;
let memoryKeeperInstance: MemoryKeeperPlugin | null = null;

// Project Tracker Plugin - Track project progress and milestones
export const projectTrackerPlugin: PluginManifest = {
  id: 'project-tracker',
  name: 'Project Tracker',
  version: '1.0.0',
  description: 'Track project progress, milestones, and deadlines with Gantt-style visualization',
  author: 'MarkItUp Team',
  main: 'project-tracker.js',

  settings: [
    {
      id: 'defaultProjectStatus',
      name: 'Default Project Status',
      type: 'select',
      options: [
        { label: 'Planning', value: 'planning' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'On Hold', value: 'on-hold' },
        { label: 'Completed', value: 'completed' },
      ],
      default: 'planning',
      description: 'Default status for new projects',
    },
  ],

  commands: [
    {
      id: 'create-project',
      name: 'Create Project',
      description: 'Create a new project tracking template',
      keybinding: 'Ctrl+Shift+P',
      callback: async (api?: PluginAPI) => {
        if (!projectTrackerInstance) {
          console.error('Project Tracker plugin instance not initialized');
          api?.ui.showNotification('Project Tracker plugin not ready', 'error');
          return;
        }
        await projectTrackerInstance.createProject();
      },
    },
    {
      id: 'update-project-progress',
      name: 'Update Progress',
      description: 'Update project progress percentage',
      callback: async (api?: PluginAPI) => {
        if (!projectTrackerInstance) {
          console.error('Project Tracker plugin instance not initialized');
          api?.ui.showNotification('Project Tracker plugin not ready', 'error');
          return;
        }
        await projectTrackerInstance.updateProgress();
      },
    },
  ],

  views: [
    {
      id: 'project-dashboard',
      name: 'Projects',
      type: 'sidebar',
      icon: '📊',
      component: () => {
        return `
          <div class="project-tracker">
            <h3>📊 Active Projects</h3>
            <div class="project-list">
              <div class="project-item">
                <div class="project-name">Website Redesign</div>
                <div class="project-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 65%"></div>
                  </div>
                  <span>65%</span>
                </div>
              </div>
              <div class="project-item">
                <div class="project-name">Mobile App</div>
                <div class="project-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 30%"></div>
                  </div>
                  <span>30%</span>
                </div>
              </div>
            </div>
            <button onclick="alert('Create new project')" class="new-project-btn">+ New Project</button>
          </div>
        `;
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Project Tracker: PluginAPI not provided to onLoad');
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      .project-tracker { padding: 1rem; }
      .project-item { margin: 0.5rem 0; }
      .project-name { font-weight: bold; margin-bottom: 0.25rem; }
      .project-progress { display: flex; align-items: center; gap: 0.5rem; }
      .progress-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
      .progress-fill { height: 100%; background: #3b82f6; transition: width 0.3s; }
      .new-project-btn { width: 100%; padding: 0.5rem; margin-top: 1rem; }
    `;
    document.head.appendChild(style);

    console.log('Project Tracker plugin loaded');
    projectTrackerInstance = new ProjectTrackerPlugin(api);
  },

  onUnload: async () => {
    projectTrackerInstance = null;
    console.log('Project Tracker plugin unloaded');
  },
};

// Meeting Notes Plugin - Structure and organize meeting notes
export const meetingNotesPlugin: PluginManifest = {
  id: 'meeting-notes',
  name: 'Meeting Notes',
  version: '1.0.0',
  description: 'Create structured meeting notes with attendees, agenda, and action items',
  author: 'MarkItUp Team',
  main: 'meeting-notes.js',

  commands: [
    {
      id: 'create-meeting-note',
      name: 'Create Meeting Note',
      description: 'Create a structured meeting note template',
      keybinding: 'Ctrl+Shift+N',
      callback: async (api?: PluginAPI) => {
        if (!meetingNotesInstance) {
          console.error('Meeting Notes plugin instance not initialized');
          api?.ui.showNotification('Meeting Notes plugin not ready', 'error');
          return;
        }
        await meetingNotesInstance.createMeetingNote();
      },
    },
    {
      id: 'extract-action-items',
      name: 'Extract Action Items',
      description: 'Extract all action items from meeting notes',
      callback: async (api?: PluginAPI) => {
        if (!api) return;
        const content = api.ui.getEditorContent();
        const actionItems = content.match(/- \[ \] .+/g) || [];
        console.log('Action items found:', actionItems.length);
        api.ui.showNotification(`Found ${actionItems.length} action items`, 'info');
      },
    },
  ],

  processors: [
    {
      id: 'meeting-formatter',
      name: 'Meeting Formatter',
      type: 'markdown',
      process: (content: string) => {
        return content
          .replace(
            /\*\*Date:\*\* (.+)/g,
            '<div class="meeting-info"><strong>Date:</strong> $1</div>'
          )
          .replace(
            /\*\*Time:\*\* (.+)/g,
            '<div class="meeting-info"><strong>Time:</strong> $1</div>'
          )
          .replace(/## Action Items/g, '<h2 class="action-items-header">🎯 Action Items</h2>')
          .replace(/## Decisions Made/g, '<h2 class="decisions-header">✅ Decisions Made</h2>');
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Meeting Notes: PluginAPI not provided to onLoad');
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      .meeting-info { padding: 0.25rem 0; color: #6b7280; }
      .action-items-header { color: #dc2626; border-left: 4px solid #dc2626; padding-left: 0.5rem; }
      .decisions-header { color: #059669; border-left: 4px solid #059669; padding-left: 0.5rem; }
    `;
    document.head.appendChild(style);

    console.log('Meeting Notes plugin loaded');
    meetingNotesInstance = new MeetingNotesPlugin(api);
  },

  onUnload: async () => {
    meetingNotesInstance = null;
    console.log('Meeting Notes plugin unloaded');
  },
};

// Blog Template Generator Plugin - Generate blog post templates
export const blogTemplatePlugin: PluginManifest = {
  id: 'blog-template-generator',
  name: 'Blog Template Generator',
  version: '1.0.0',
  description: 'Generate SEO-optimized blog post templates for different content types',
  author: 'MarkItUp Team',
  main: 'blog-template.js',

  commands: [
    {
      id: 'generate-blog-template',
      name: 'Generate Blog Template',
      description: 'Generate a blog post template',
      keybinding: 'Ctrl+Shift+B',
      callback: async (api?: PluginAPI) => {
        if (!api) return;
        const templates = [
          'How-to Guide',
          'Listicle',
          'Product Review',
          'Personal Story',
          'Industry News',
          'Tutorial',
          'Opinion Piece',
        ];

        const choice = prompt(
          `Choose template:\n${templates.map((t, i) => `${i + 1}. ${t}`).join('\n')}\nEnter number (1-7):`
        );

        if (choice && parseInt(choice) >= 1 && parseInt(choice) <= 7) {
          const templateType = templates[parseInt(choice) - 1];
          const title = prompt('Blog post title:');

          if (title) {
            let template = '';

            switch (templateType) {
              case 'How-to Guide':
                template = `---
title: "${title}"
description: "Learn how to [brief description]"
keywords: "[keyword1, keyword2, keyword3]"
author: "Your Name"
date: "${new Date().toISOString().split('T')[0]}"
category: "Tutorial"
tags: ["how-to", "guide"]
---

# ${title}

## Introduction
Brief introduction explaining what readers will learn and why it's important.

## What You'll Need
- Requirement 1
- Requirement 2
- Requirement 3

## Step-by-Step Guide

### Step 1: [Step Title]
Detailed explanation of the first step.

### Step 2: [Step Title]
Detailed explanation of the second step.

### Step 3: [Step Title]
Detailed explanation of the third step.

## Tips and Best Practices
- Tip 1
- Tip 2
- Tip 3

## Common Mistakes to Avoid
- Mistake 1
- Mistake 2

## Conclusion
Summarize what readers have learned and encourage them to take action.

## Related Resources
- [Link 1](url)
- [Link 2](url)
`;
                break;

              case 'Listicle':
                template = `---
title: "${title}"
description: "[Number] [items] that will [benefit]"
keywords: "[keyword1, keyword2, keyword3]"
author: "Your Name"
date: "${new Date().toISOString().split('T')[0]}"
category: "List"
tags: ["listicle", "tips"]
---

# ${title}

## Introduction
Hook your readers with an engaging introduction that explains what they'll discover.

## 1. [First Item]
Description and explanation of the first item.

## 2. [Second Item]
Description and explanation of the second item.

## 3. [Third Item]
Description and explanation of the third item.

## 4. [Fourth Item]
Description and explanation of the fourth item.

## 5. [Fifth Item]
Description and explanation of the fifth item.

## Conclusion
Wrap up with a summary and call-to-action.

## Your Turn
What would you add to this list? Let me know in the comments!
`;
                break;

              default:
                template = `---
title: "${title}"
description: "[Brief description of the post]"
keywords: "[keyword1, keyword2, keyword3]"
author: "Your Name"
date: "${new Date().toISOString().split('T')[0]}"
category: "General"
tags: ["tag1", "tag2"]
---

# ${title}

## Introduction
Your engaging introduction goes here.

## Main Content
Your main content sections go here.

## Conclusion
Your conclusion and call-to-action go here.
`;
            }

            // Create a new note with the generated template
            const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
            try {
              console.log('Creating blog template file:', fileName);
              console.log('Template content:', template);

              await api.notes.create(fileName, template);

              api.ui.showNotification(
                `Blog template "${title}" created and loaded successfully!`,
                'info'
              );
            } catch (error) {
              console.error('Error creating blog template:', error);
              api.ui.showNotification('Failed to create blog template. Please try again.', 'error');
            }
          }
        }
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Blog Template: PluginAPI not provided to onLoad');
      return;
    }

    console.log('Blog Template Generator plugin loaded');
    blogTemplateInstance = new BlogTemplatePlugin(api);
  },

  onUnload: async () => {
    blogTemplateInstance = null;
    console.log('Blog Template Generator plugin unloaded');
  },
};

// Memory Keeper Plugin - Capture and organize special memories
export const memoryKeeperPlugin: PluginManifest = {
  id: 'memory-keeper',
  name: 'Memory Keeper',
  version: '1.0.0',
  description: 'Capture, tag, and organize special memories with photos and reflections',
  author: 'MarkItUp Team',
  main: 'memory-keeper.js',

  commands: [
    {
      id: 'capture-memory',
      name: 'Capture Memory',
      description: 'Capture a special memory',
      keybinding: 'Ctrl+Shift+R',
      callback: async (api?: PluginAPI) => {
        if (!memoryKeeperInstance) {
          console.error('Memory Keeper plugin instance not initialized');
          api?.ui.showNotification('Memory Keeper plugin not ready', 'error');
          return;
        }
        await memoryKeeperInstance.captureMemory();
      },
    },
    {
      id: 'memory-timeline',
      name: 'Memory Timeline',
      description: 'View memories in chronological order',
      callback: async () => {
        console.log('Show memory timeline');
      },
    },
  ],

  views: [
    {
      id: 'memory-sidebar',
      name: 'Memories',
      type: 'sidebar',
      icon: '💫',
      component: () => {
        return `
          <div class="memory-keeper">
            <h3>💫 Recent Memories</h3>
            <div class="memory-list">
              <div class="memory-item">
                <div class="memory-title">Trip to the Beach</div>
                <div class="memory-date">Yesterday</div>
              </div>
              <div class="memory-item">
                <div class="memory-title">Family Dinner</div>
                <div class="memory-date">3 days ago</div>
              </div>
            </div>
            <button onclick="alert('Capture new memory')" class="capture-btn">+ Capture Memory</button>
          </div>
        `;
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Memory Keeper: PluginAPI not provided to onLoad');
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      .memory-keeper { padding: 1rem; }
      .memory-item { padding: 0.5rem; margin: 0.5rem 0; border-left: 3px solid #f59e0b; background: #fef3c7; }
      .memory-title { font-weight: bold; }
      .memory-date { font-size: 0.8em; color: #92400e; }
      .capture-btn { width: 100%; padding: 0.5rem; margin-top: 1rem; background: #f59e0b; color: white; border: none; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    console.log('Memory Keeper plugin loaded');
    memoryKeeperInstance = new MemoryKeeperPlugin(api);
  },

  onUnload: async () => {
    memoryKeeperInstance = null;
    console.log('Memory Keeper plugin unloaded');
  },
};

// ============================================
// PLUGIN IMPLEMENTATION CLASSES
// ============================================

// Project Tracker Plugin Implementation
export class ProjectTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async createProject() {
    const template = `# Project: New Project

## Project Details
- **Status:** 🟡 Planning
- **Start Date:** ${new Date().toLocaleDateString()}
- **Deadline:** TBD
- **Progress:** 0%

## Milestones
- [ ] Project kickoff
- [ ] Requirements gathering
- [ ] Design phase
- [ ] Development phase
- [ ] Testing phase
- [ ] Launch

## Tasks
### Phase 1: Planning
- [ ] Define project scope
- [ ] Identify stakeholders
- [ ] Create timeline

### Phase 2: Execution
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Notes
*Add project notes and updates here*

## Resources
- [Documentation](#)
- [Repository](#)
- [Team Members](#)
`;

    // Insert at the current cursor position or end of document
    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification(
      'Project template inserted! Edit the project name and details.',
      'info'
    );
  }

  async updateProgress() {
    const currentContent = this.api.ui.getEditorContent();

    // Simple implementation: increment progress by 10%
    const progressMatch = currentContent.match(/\*\*Progress:\*\* (\d+)%/);

    if (progressMatch) {
      const progressStr = progressMatch[1];
      if (progressStr) {
        const currentProgress = parseInt(progressStr);
        const newProgress = Math.min(100, currentProgress + 10);
        const updatedContent = currentContent.replace(
          /\*\*Progress:\*\* \d+%/,
          `**Progress:** ${newProgress}%`
        );
        this.api.ui.setEditorContent(updatedContent);
        this.api.ui.showNotification(`Progress updated to ${newProgress}%`, 'info');
      }
    } else {
      this.api.ui.showNotification('No project progress found in current note', 'warning');
    }
  }
}

// Meeting Notes Plugin Implementation
export class MeetingNotesPlugin {
  constructor(private api: PluginAPI) {}

  async createMeetingNote() {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    const template = `# Meeting: New Meeting

**Date:** ${date}  
**Time:** ${time}  
**Duration:** [duration]  
**Location:** [location/video link]

## Attendees
- [ ] [Name 1] - [Role]
- [ ] [Name 2] - [Role]
- [ ] [Name 3] - [Role]

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Notes

### [Topic 1]
- 

### [Topic 2]
- 

## Decisions Made
- [ ] [Decision 1]
- [ ] [Decision 2]

## Action Items
- [ ] [Action 1] - Assigned to: [name] - Due: [date]
- [ ] [Action 2] - Assigned to: [name] - Due: [date]

## Next Steps
- 

## Notes
*Additional notes and observations*
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Meeting notes template inserted!', 'info');
  }
}

// Blog Template Plugin Implementation
export class BlogTemplatePlugin {
  constructor(private api: PluginAPI) {}

  async createBlogPost() {
    const date = new Date().toLocaleDateString();

    const template = `# Blog Post: [Your Title Here]

**Author:** [Your Name]  
**Date:** ${date}  
**Category:** [category]  
**Tags:** #tag1 #tag2 #tag3  
**Status:** 📝 Draft

## Introduction
*Hook your readers with an engaging opening paragraph*

## Main Content

### Section 1: [Heading]
Write your content here...

### Section 2: [Heading]
Write your content here...

### Section 3: [Heading]
Write your content here...

## Conclusion
*Summarize key points and include a call-to-action*

## SEO Metadata
- **Meta Title:** [60 characters max]
- **Meta Description:** [160 characters max]
- **Focus Keyword:** [keyword]
- **Slug:** [url-friendly-slug]

## Publishing Checklist
- [ ] Proofread for grammar and spelling
- [ ] Add images (with alt text)
- [ ] Check SEO optimization
- [ ] Add internal/external links
- [ ] Schedule social media posts
- [ ] Set publish date

## Notes
*Additional notes or ideas*
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Blog post template inserted!', 'info');
  }

  async insertSEOChecklist() {
    const checklist = `
## SEO Checklist
- [ ] Title is 50-60 characters
- [ ] Meta description is 150-160 characters
- [ ] Focus keyword appears in title
- [ ] Focus keyword appears in first paragraph
- [ ] Headers use H2, H3 hierarchy
- [ ] Images have alt text
- [ ] Internal links to related posts
- [ ] External links to authoritative sources
- [ ] URL slug is SEO-friendly
- [ ] Content is 300+ words
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + checklist;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('SEO checklist inserted!', 'info');
  }
}

// Memory Keeper Plugin Implementation
export class MemoryKeeperPlugin {
  constructor(private api: PluginAPI) {}

  async captureMemory() {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    const template = `# Memory: [Title]

**Date:** ${date}  
**Time:** ${time}  
**Location:** [where]  
**People:** [who was there]  
**Mood:** 😊

## What Happened
*Describe what happened...*

## Thoughts & Feelings
*How did this make you feel?*

## Photos & Media
- [Add photo references]

## Tags
#memory #${new Date().getFullYear()}
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Memory template inserted!', 'info');
  }
}
