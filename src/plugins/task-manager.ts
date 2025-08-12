import { PluginManifest } from '../lib/types';

// Task Manager Plugin - Complete task management within notes
export const taskManagerPlugin: PluginManifest = {
  id: 'task-manager',
  name: 'Task Manager',
  version: '1.0.0',
  description: 'Advanced task management with due dates, priorities, and progress tracking',
  author: 'MarkItUp Team',
  main: 'task-manager.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Read and write task data'
    },
    {
      type: 'notifications',
      description: 'Send task reminders'
    }
  ],

  settings: [
    {
      id: 'defaultPriority',
      name: 'Default Priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
      ],
      default: 'medium',
      description: 'Default priority for new tasks'
    },
    {
      id: 'reminderTime',
      name: 'Reminder Time (minutes before due)',
      type: 'number',
      default: 30,
      description: 'Minutes before due date to show reminder'
    },
    {
      id: 'showCompletedTasks',
      name: 'Show Completed Tasks',
      type: 'boolean',
      default: true,
      description: 'Display completed tasks in task list'
    }
  ],

  commands: [
    {
      id: 'add-task',
      name: 'Add Task',
      description: 'Add a new task to the current note',
      keybinding: 'Ctrl+Shift+T',
      callback: async () => {
        const title = prompt('Task title:');
        if (!title) return;
        
        const priority = prompt('Priority (low/medium/high/urgent):', 'medium');
        const dueDate = prompt('Due date (YYYY-MM-DD):');
        
        const taskMarkdown = `
- [ ] **${title}** ${priority ? `[${priority}]` : ''} ${dueDate ? `📅 ${dueDate}` : ''}
  - Created: ${new Date().toLocaleDateString()}
  - Status: pending
`;
        
        console.log('Task to add:', taskMarkdown);
      }
    },
    {
      id: 'toggle-task',
      name: 'Toggle Task Completion',
      description: 'Toggle task completion status',
      keybinding: 'Ctrl+Enter',
      callback: async () => {
        console.log('Toggle task completion');
      }
    },
    {
      id: 'show-task-overview',
      name: 'Task Overview',
      description: 'Show overview of all tasks',
      callback: async () => {
        console.log('Show task overview');
      }
    }
  ],

  views: [
    {
      id: 'task-sidebar',
      name: 'Tasks',
      type: 'sidebar',
      icon: '✓',
      component: () => {
        return `
          <div class="task-manager">
            <h3>📋 Tasks</h3>
            <div class="task-controls">
              <button onclick="alert('Add task functionality')" class="btn btn-primary">+ Add Task</button>
              <button onclick="alert('Show overview')" class="btn btn-secondary">Overview</button>
            </div>
            <div id="task-list">No tasks yet</div>
          </div>
        `;
      }
    }
  ],

  processors: [
    {
      id: 'task-syntax-highlight',
      name: 'Task Syntax Highlighter',
      type: 'markdown',
      process: (content: string) => {
        return content
          .replace(/- \[ \] \*\*(.*?)\*\*/g, '<span class="task-pending">- [ ] <strong>$1</strong></span>')
          .replace(/- \[x\] \*\*(.*?)\*\*/g, '<span class="task-completed">- [x] <strong>$1</strong></span>')
          .replace(/\[urgent\]/g, '<span class="priority-urgent">[urgent]</span>')
          .replace(/\[high\]/g, '<span class="priority-high">[high]</span>')
          .replace(/\[medium\]/g, '<span class="priority-medium">[medium]</span>')
          .replace(/\[low\]/g, '<span class="priority-low">[low]</span>');
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .task-pending { color: #f59e0b; }
      .task-completed { color: #10b981; text-decoration: line-through; }
      .priority-urgent { background: #ef4444; color: white; padding: 2px 4px; border-radius: 3px; font-size: 0.8em; }
      .priority-high { background: #f97316; color: white; padding: 2px 4px; border-radius: 3px; font-size: 0.8em; }
      .priority-medium { background: #eab308; color: white; padding: 2px 4px; border-radius: 3px; font-size: 0.8em; }
      .priority-low { background: #22c55e; color: white; padding: 2px 4px; border-radius: 3px; font-size: 0.8em; }
      .task-manager { padding: 1rem; }
      .task-controls { margin-bottom: 1rem; }
      .task-controls button { margin-right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.8em; }
    `;
    document.head.appendChild(style);
    console.log('Task Manager plugin loaded');
  },

  onUnload: async () => {
    console.log('Task Manager plugin unloaded');
  }
};
