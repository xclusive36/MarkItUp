import { PluginManifest, PluginAPI } from '../lib/types';

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
        { label: 'Completed', value: 'completed' }
      ],
      default: 'planning',
      description: 'Default status for new projects'
    }
  ],

  commands: [
    {
      id: 'create-project',
      name: 'Create Project',
      description: 'Create a new project tracking template',
      keybinding: 'Ctrl+Shift+P',
      callback: async () => {
        const projectName = prompt('Project name:');
        const deadline = prompt('Deadline (YYYY-MM-DD):');
        
        if (projectName) {
          const template = `# Project: ${projectName}

## Project Details
- **Status:** 🟡 Planning
- **Start Date:** ${new Date().toLocaleDateString()}
- **Deadline:** ${deadline || 'TBD'}
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
          console.log('Project template:', template);
        }
      }
    },
    {
      id: 'update-project-progress',
      name: 'Update Progress',
      description: 'Update project progress percentage',
      callback: async () => {
        const progress = prompt('Progress percentage (0-100):');
        if (progress && parseInt(progress) >= 0 && parseInt(progress) <= 100) {
          console.log(`Progress updated to: ${progress}%`);
        }
      }
    }
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
      }
    }
  ],

  onLoad: async () => {
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
  }
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
      callback: async () => {
        const meetingTitle = prompt('Meeting title:');
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        
        if (meetingTitle) {
          const template = `# ${meetingTitle}

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
- [ ] **[Assignee]** - [Action item] - Due: [date]
- [ ] **[Assignee]** - [Action item] - Due: [date]

## Next Steps
- [ ] [Next step 1]
- [ ] [Next step 2]

## Follow-up Meeting
**Date:** [date]  
**Purpose:** [purpose]
`;
          console.log('Meeting note template:', template);
        }
      }
    },
    {
      id: 'extract-action-items',
      name: 'Extract Action Items',
      description: 'Extract all action items from meeting notes',
      callback: async () => {
        console.log('Extract action items from current note');
      }
    }
  ],

  processors: [
    {
      id: 'meeting-formatter',
      name: 'Meeting Formatter',
      type: 'markdown',
      process: (content: string) => {
        return content
          .replace(/\*\*Date:\*\* (.+)/g, '<div class="meeting-info"><strong>Date:</strong> $1</div>')
          .replace(/\*\*Time:\*\* (.+)/g, '<div class="meeting-info"><strong>Time:</strong> $1</div>')
          .replace(/## Action Items/g, '<h2 class="action-items-header">🎯 Action Items</h2>')
          .replace(/## Decisions Made/g, '<h2 class="decisions-header">✅ Decisions Made</h2>');
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .meeting-info { padding: 0.25rem 0; color: #6b7280; }
      .action-items-header { color: #dc2626; border-left: 4px solid #dc2626; padding-left: 0.5rem; }
      .decisions-header { color: #059669; border-left: 4px solid #059669; padding-left: 0.5rem; }
    `;
    document.head.appendChild(style);
    console.log('Meeting Notes plugin loaded');
  }
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
          'Opinion Piece'
        ];
        
        const choice = prompt(`Choose template:\n${templates.map((t, i) => `${i + 1}. ${t}`).join('\n')}\nEnter number (1-7):`);
        
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
              
              api.ui.showNotification(`Blog template "${title}" created and loaded successfully!`, 'info');
            } catch (error) {
              console.error('Error creating blog template:', error);
              api.ui.showNotification('Failed to create blog template. Please try again.', 'error');
            }
          }
        }
      }
    }
  ],

  onLoad: async () => {
    console.log('Blog Template Generator plugin loaded');
  }
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
      callback: async () => {
        const memoryTitle = prompt('Memory title:');
        const location = prompt('Location (optional):');
        const people = prompt('People involved (optional):');
        
        if (memoryTitle) {
          const template = `# 💫 ${memoryTitle}

**Date:** ${new Date().toLocaleDateString()}  
**Location:** ${location || 'Not specified'}  
**People:** ${people || 'Not specified'}  

## What Happened
[Describe what happened in detail]

## How I Felt
[Describe your emotions and feelings]

## Why It's Special
[Explain why this memory is important to you]

## Photos
![Memory Photo](path/to/photo.jpg)

## Tags
#memory #special ${location ? `#${location.toLowerCase().replace(/\s+/g, '-')}` : ''}

---
*Captured on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*
`;
          console.log('Memory template:', template);
        }
      }
    },
    {
      id: 'memory-timeline',
      name: 'Memory Timeline',
      description: 'View memories in chronological order',
      callback: async () => {
        console.log('Show memory timeline');
      }
    }
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
      }
    }
  ],

  onLoad: async () => {
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
  }
};
