import { PluginManifest, PluginAPI } from '../lib/types';

// Global plugin instance - will be set in onLoad
let pluginInstance: TaskManagerPlugin | null = null;

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
      description: 'Read and write task data',
    },
    {
      type: 'notifications',
      description: 'Send task reminders',
    },
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
        { label: 'Urgent', value: 'urgent' },
      ],
      default: 'medium',
      description: 'Default priority for new tasks',
    },
    {
      id: 'reminderTime',
      name: 'Reminder Time (minutes before due)',
      type: 'number',
      default: 30,
      description: 'Minutes before due date to show reminder',
    },
    {
      id: 'showCompletedTasks',
      name: 'Show Completed Tasks',
      type: 'boolean',
      default: true,
      description: 'Display completed tasks in task list',
    },
  ],

  commands: [
    {
      id: 'add-task',
      name: 'Add Task',
      description: 'Add a new task to the current note',
      keybinding: 'Ctrl+Shift+T',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance) {
          console.error('Task Manager plugin instance not initialized');
          api?.ui.showNotification('Task Manager plugin not ready', 'error');
          return;
        }
        await pluginInstance.addTask();
      },
    },
    {
      id: 'toggle-task',
      name: 'Toggle Task Completion',
      description: 'Toggle task completion status',
      keybinding: 'Ctrl+Enter',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance) {
          console.error('Task Manager plugin instance not initialized');
          api?.ui.showNotification('Task Manager plugin not ready', 'error');
          return;
        }
        await pluginInstance.toggleTask();
      },
    },
    {
      id: 'show-task-overview',
      name: 'Task Overview',
      description: 'Show overview of all tasks',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance) {
          console.error('Task Manager plugin instance not initialized');
          api?.ui.showNotification('Task Manager plugin not ready', 'error');
          return;
        }
        await pluginInstance.showTaskOverview();
      },
    },
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
      },
    },
  ],

  processors: [
    {
      id: 'task-syntax-highlight',
      name: 'Task Syntax Highlighter',
      type: 'markdown',
      process: (content: string) => {
        return content
          .replace(
            /- \[ \] \*\*(.*?)\*\*/g,
            '<span class="task-pending">- [ ] <strong>$1</strong></span>'
          )
          .replace(
            /- \[x\] \*\*(.*?)\*\*/g,
            '<span class="task-completed">- [x] <strong>$1</strong></span>'
          )
          .replace(/\[urgent\]/g, '<span class="priority-urgent">[urgent]</span>')
          .replace(/\[high\]/g, '<span class="priority-high">[high]</span>')
          .replace(/\[medium\]/g, '<span class="priority-medium">[medium]</span>')
          .replace(/\[low\]/g, '<span class="priority-low">[low]</span>');
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Task Manager: PluginAPI not provided to onLoad');
      return;
    }

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
    pluginInstance = new TaskManagerPlugin(api);
    await pluginInstance.initialize();
  },

  onUnload: async () => {
    if (pluginInstance) {
      pluginInstance.dispose();
      pluginInstance = null;
    }
    console.log('Task Manager plugin unloaded');
  },
};

// Task Manager Plugin Implementation Class
export class TaskManagerPlugin {
  private settings: {
    defaultPriority: string;
    reminderTime: number;
    showCompletedTasks: boolean;
  };

  constructor(private api: PluginAPI) {
    this.settings = {
      defaultPriority: this.api.settings.get('defaultPriority') || 'medium',
      reminderTime: this.api.settings.get('reminderTime') || 30,
      showCompletedTasks: this.api.settings.get('showCompletedTasks') !== false,
    };
  }

  async initialize() {
    console.log('Task Manager plugin initialized');
  }

  async addTask() {
    const content = this.api.ui.getEditorContent();
    const activeNoteId = this.api.notes.getActiveNoteId();

    if (!activeNoteId) {
      this.api.ui.showNotification('No active note to add task to', 'warning');
      return;
    }

    // For now, add a simple task at the end of the document
    // In a real implementation, this would use a modal dialog
    const timestamp = new Date().toLocaleDateString();
    const priority = this.settings.defaultPriority;

    const taskMarkdown = `\n- [ ] **New Task** [${priority}]\n  - Created: ${timestamp}\n  - Status: pending\n`;

    const updatedContent = content + taskMarkdown;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Task added! Edit the "New Task" text to customize.', 'info');
  }

  async toggleTask() {
    const content = this.api.ui.getEditorContent();
    const activeNoteId = this.api.notes.getActiveNoteId();

    if (!activeNoteId) {
      this.api.ui.showNotification('No active note to toggle task in', 'warning');
      return;
    }

    // Simple implementation: toggle all uncompleted tasks to completed, or vice versa
    // In a real implementation, this would toggle the task at cursor position
    let updatedContent = content;

    if (content.includes('- [ ]')) {
      // Toggle first incomplete task to complete
      updatedContent = content.replace('- [ ]', '- [x]');
      this.api.ui.showNotification('Task marked as completed', 'info');
    } else if (content.includes('- [x]')) {
      // Toggle first complete task to incomplete
      updatedContent = content.replace('- [x]', '- [ ]');
      this.api.ui.showNotification('Task marked as incomplete', 'info');
    } else {
      this.api.ui.showNotification('No tasks found to toggle', 'warning');
      return;
    }

    this.api.ui.setEditorContent(updatedContent);
  }

  async showTaskOverview() {
    const allNotes = this.api.notes.getAll();

    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;

    // Count tasks across all notes
    for (const note of allNotes) {
      const incompleteTasks = (note.content.match(/- \[ \]/g) || []).length;
      const complete = (note.content.match(/- \[x\]/gi) || []).length;

      totalTasks += incompleteTasks + complete;
      completedTasks += complete;
      pendingTasks += incompleteTasks;
    }

    const overview = `
📊 Task Overview
═══════════════════
Total Tasks: ${totalTasks}
✅ Completed: ${completedTasks}
⏳ Pending: ${pendingTasks}
📈 Completion Rate: ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
`;

    console.log(overview);
    this.api.ui.showNotification(
      `Tasks: ${completedTasks}/${totalTasks} completed (${pendingTasks} pending)`,
      'info'
    );
  }

  dispose() {
    console.log('Task Manager plugin disposed');
  }
}

export default taskManagerPlugin;
