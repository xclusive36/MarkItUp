import { PluginManifest } from '../lib/types';
import { PluginAPI } from '../lib/PluginAPI';

// Global instances
let webhookIntegrationInstance: WebhookIntegrationPlugin | null = null;
let automationRulesInstance: AutomationRulesPlugin | null = null;
let scheduleReminderInstance: ScheduleReminderPlugin | null = null;
let bulkOperationsInstance: BulkOperationsPlugin | null = null;
let syncIntegrationInstance: SyncIntegrationPlugin | null = null;

// Webhook Integration Plugin - Connect to external services
export const webhookIntegrationPlugin: PluginManifest = {
  id: 'webhook-integration',
  name: 'Webhook Integration',
  version: '1.0.0',
  description: 'Connect MarkItUp to external services via webhooks and APIs',
  author: 'MarkItUp Team',
  main: 'webhook-integration.js',

  permissions: [
    {
      type: 'network',
      description: 'Send data to external webhooks',
    },
    {
      type: 'file-system',
      description: 'Read note data for integration',
    },
  ],

  settings: [
    {
      id: 'webhookUrl',
      name: 'Default Webhook URL',
      type: 'string',
      default: '',
      description: 'Default webhook endpoint for integrations',
    },
    {
      id: 'retryAttempts',
      name: 'Retry Attempts',
      type: 'number',
      default: 3,
      description: 'Number of retry attempts for failed webhook calls',
    },
  ],

  commands: [
    {
      id: 'send-to-webhook',
      name: 'Send to Webhook',
      description: 'Send current note to configured webhook',
      callback: async () => {
        try {
          if (webhookIntegrationInstance) {
            await webhookIntegrationInstance.sendToWebhook();
          }
        } catch (error) {
          console.error('Error sending to webhook:', error);
        }
      },
    },
    {
      id: 'configure-integration',
      name: 'Configure Integration',
      description: 'Set up integration with external service',
      callback: async () => {
        try {
          if (webhookIntegrationInstance) {
            await webhookIntegrationInstance.configureIntegration();
          }
        } catch (error) {
          console.error('Error configuring integration:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      webhookIntegrationInstance = new WebhookIntegrationPlugin(api);
    }
  },

  onUnload: () => {
    webhookIntegrationInstance = null;
  },

  views: [
    {
      id: 'integrations-panel',
      name: 'Integrations',
      type: 'sidebar',
      icon: '🔗',
      component: () => {
        return `
          <div class="webhook-integration">
            <h3>🔗 Integrations</h3>
            <div class="integration-list">
              <div class="integration-item">
                <span>📧 Email</span>
                <button onclick="alert('Configure email')" class="btn-mini">Setup</button>
              </div>
              <div class="integration-item">
                <span>💬 Slack</span>
                <button onclick="alert('Configure Slack')" class="btn-mini">Setup</button>
              </div>
              <div class="integration-item">
                <span>⚡ Zapier</span>
                <button onclick="alert('Configure Zapier')" class="btn-mini">Setup</button>
              </div>
            </div>
            <button onclick="alert('Add integration')" class="btn btn-primary">+ Add Integration</button>
          </div>
        `;
      },
    },
  ],
};

// Automation Rules Plugin - If-then automation rules
export const automationRulesPlugin: PluginManifest = {
  id: 'automation-rules',
  name: 'Automation Rules',
  version: '1.0.0',
  description: 'Create if-then automation rules for notes and tasks',
  author: 'MarkItUp Team',
  main: 'automation-rules.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Monitor and modify notes based on rules',
    },
  ],

  settings: [
    {
      id: 'rulesEnabled',
      name: 'Enable Automation Rules',
      type: 'boolean',
      default: true,
      description: 'Enable or disable all automation rules',
    },
    {
      id: 'executionDelay',
      name: 'Execution Delay (ms)',
      type: 'number',
      default: 1000,
      description: 'Delay before executing automation rules',
    },
  ],

  commands: [
    {
      id: 'create-rule',
      name: 'Create Automation Rule',
      description: 'Create new automation rule',
      callback: async () => {
        try {
          if (automationRulesInstance) {
            await automationRulesInstance.createRule();
          }
        } catch (error) {
          console.error('Error creating rule:', error);
        }
      },
    },
    {
      id: 'view-rules',
      name: 'View All Rules',
      description: 'View and manage all automation rules',
      callback: async () => {
        try {
          if (automationRulesInstance) {
            await automationRulesInstance.viewRules();
          }
        } catch (error) {
          console.error('Error viewing rules:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      automationRulesInstance = new AutomationRulesPlugin(api);
    }
  },

  onUnload: () => {
    automationRulesInstance = null;
  },

  views: [
    {
      id: 'automation-center',
      name: 'Automation',
      type: 'sidebar',
      icon: '⚡',
      component: () => {
        return `
          <div class="automation-rules">
            <h3>⚡ Automation Rules</h3>
            <div class="rule-list">
              <div class="rule-item">
                <div class="rule-trigger">When: Tag #urgent added</div>
                <div class="rule-action">Then: Move to Priority folder</div>
                <button onclick="alert('Edit rule')" class="btn-mini">Edit</button>
              </div>
              <div class="rule-item">
                <div class="rule-trigger">When: Task completed</div>
                <div class="rule-action">Then: Add completion date</div>
                <button onclick="alert('Edit rule')" class="btn-mini">Edit</button>
              </div>
            </div>
            <button onclick="alert('Create rule')" class="btn btn-primary">+ Create Rule</button>
          </div>
        `;
      },
    },
  ],
};

// Schedule Reminder Plugin - Smart reminders and notifications
export const scheduleReminderPlugin: PluginManifest = {
  id: 'schedule-reminder',
  name: 'Schedule Reminder',
  version: '1.0.0',
  description: 'Smart reminders and notifications for notes, tasks, and events',
  author: 'MarkItUp Team',
  main: 'schedule-reminder.js',

  permissions: [
    {
      type: 'notifications',
      description: 'Send reminder notifications',
    },
    {
      type: 'file-system',
      description: 'Monitor notes for reminder triggers',
    },
  ],

  settings: [
    {
      id: 'reminderSound',
      name: 'Reminder Sound',
      type: 'boolean',
      default: true,
      description: 'Play sound with reminders',
    },
    {
      id: 'defaultSnooze',
      name: 'Default Snooze (minutes)',
      type: 'select',
      options: [
        { label: '5 minutes', value: '5' },
        { label: '15 minutes', value: '15' },
        { label: '30 minutes', value: '30' },
        { label: '1 hour', value: '60' },
      ],
      default: '15',
      description: 'Default snooze duration',
    },
  ],

  commands: [
    {
      id: 'add-reminder',
      name: 'Add Reminder',
      description: 'Add reminder to current note',
      callback: async () => {
        try {
          if (scheduleReminderInstance) {
            await scheduleReminderInstance.addReminder();
          }
        } catch (error) {
          console.error('Error adding reminder:', error);
        }
      },
    },
    {
      id: 'view-reminders',
      name: 'View All Reminders',
      description: 'View all active reminders',
      callback: async () => {
        try {
          if (scheduleReminderInstance) {
            await scheduleReminderInstance.viewReminders();
          }
        } catch (error) {
          console.error('Error viewing reminders:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      scheduleReminderInstance = new ScheduleReminderPlugin(api);
    }
  },

  onUnload: () => {
    scheduleReminderInstance = null;
  },

  views: [
    {
      id: 'reminder-panel',
      name: 'Reminders',
      type: 'sidebar',
      icon: '⏰',
      component: () => {
        return `
          <div class="schedule-reminder">
            <h3>⏰ Reminders</h3>
            <div class="reminder-list">
              <div class="reminder-item">
                <div class="reminder-time">Today 3:00 PM</div>
                <div class="reminder-text">Review weekly goals</div>
                <button onclick="alert('Snooze')" class="btn-mini">Snooze</button>
              </div>
              <div class="reminder-item">
                <div class="reminder-time">Tomorrow 9:00 AM</div>
                <div class="reminder-text">Team meeting prep</div>
                <button onclick="alert('Snooze')" class="btn-mini">Snooze</button>
              </div>
            </div>
            <button onclick="alert('Add reminder')" class="btn btn-primary">+ Add Reminder</button>
          </div>
        `;
      },
    },
  ],
};

// Bulk Operations Plugin - Batch file operations
export const bulkOperationsPlugin: PluginManifest = {
  id: 'bulk-operations',
  name: 'Bulk Operations',
  version: '1.0.0',
  description: 'Perform batch operations on multiple notes and files',
  author: 'MarkItUp Team',
  main: 'bulk-operations.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read and modify multiple files',
    },
  ],

  settings: [
    {
      id: 'confirmBulkActions',
      name: 'Confirm Bulk Actions',
      type: 'boolean',
      default: true,
      description: 'Ask for confirmation before bulk operations',
    },
    {
      id: 'maxBatchSize',
      name: 'Max Batch Size',
      type: 'number',
      default: 100,
      description: 'Maximum number of files to process at once',
    },
  ],

  commands: [
    {
      id: 'bulk-tag-add',
      name: 'Bulk Add Tags',
      description: 'Add tags to multiple notes',
      callback: async () => {
        try {
          if (bulkOperationsInstance) {
            await bulkOperationsInstance.bulkAddTags();
          }
        } catch (error) {
          console.error('Error adding tags:', error);
        }
      },
    },
    {
      id: 'bulk-move-files',
      name: 'Bulk Move Files',
      description: 'Move multiple files to a folder',
      callback: async () => {
        try {
          if (bulkOperationsInstance) {
            await bulkOperationsInstance.bulkMoveFiles();
          }
        } catch (error) {
          console.error('Error moving files:', error);
        }
      },
    },
    {
      id: 'bulk-find-replace',
      name: 'Bulk Find & Replace',
      description: 'Find and replace text across multiple notes',
      callback: async () => {
        try {
          if (bulkOperationsInstance) {
            await bulkOperationsInstance.bulkFindReplace();
          }
        } catch (error) {
          console.error('Error with find & replace:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      bulkOperationsInstance = new BulkOperationsPlugin(api);
    }
  },

  onUnload: () => {
    bulkOperationsInstance = null;
  },

  views: [
    {
      id: 'bulk-operations-panel',
      name: 'Bulk Ops',
      type: 'sidebar',
      icon: '📦',
      component: () => {
        return `
          <div class="bulk-operations">
            <h3>📦 Bulk Operations</h3>
            <div class="operation-buttons">
              <button onclick="alert('Select files')" class="btn btn-secondary">Select Files</button>
              <button onclick="alert('Add tags')" class="btn btn-primary">Add Tags</button>
              <button onclick="alert('Move files')" class="btn btn-primary">Move Files</button>
              <button onclick="alert('Find & replace')" class="btn btn-primary">Find & Replace</button>
            </div>
            <div class="selection-info">
              <p>0 files selected</p>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Sync Integration Plugin - Sync with popular tools
export const syncIntegrationPlugin: PluginManifest = {
  id: 'sync-integration',
  name: 'Sync Integration',
  version: '1.0.0',
  description: 'Sync notes with popular tools like Notion, Obsidian, and more',
  author: 'MarkItUp Team',
  main: 'sync-integration.js',

  permissions: [
    {
      type: 'network',
      description: 'Connect to external sync services',
    },
    {
      type: 'file-system',
      description: 'Read and write notes for sync',
    },
  ],

  settings: [
    {
      id: 'autoSync',
      name: 'Auto Sync',
      type: 'boolean',
      default: false,
      description: 'Automatically sync changes',
    },
    {
      id: 'syncInterval',
      name: 'Sync Interval (minutes)',
      type: 'select',
      options: [
        { label: '5 minutes', value: '5' },
        { label: '15 minutes', value: '15' },
        { label: '30 minutes', value: '30' },
        { label: '1 hour', value: '60' },
      ],
      default: '15',
      description: 'How often to sync automatically',
    },
  ],

  commands: [
    {
      id: 'sync-now',
      name: 'Sync Now',
      description: 'Sync all notes immediately',
      callback: async () => {
        try {
          if (syncIntegrationInstance) {
            await syncIntegrationInstance.syncNow();
          }
        } catch (error) {
          console.error('Error syncing:', error);
        }
      },
    },
    {
      id: 'configure-sync',
      name: 'Configure Sync',
      description: 'Set up sync with external service',
      callback: async () => {
        try {
          if (syncIntegrationInstance) {
            await syncIntegrationInstance.configureSync();
          }
        } catch (error) {
          console.error('Error configuring sync:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      syncIntegrationInstance = new SyncIntegrationPlugin(api);
    }
  },

  onUnload: () => {
    syncIntegrationInstance = null;
  },

  views: [
    {
      id: 'sync-status',
      name: 'Sync',
      type: 'sidebar',
      icon: '🔄',
      component: () => {
        return `
          <div class="sync-integration">
            <h3>🔄 Sync Status</h3>
            <div class="sync-services">
              <div class="service-item">
                <span>📝 Notion</span>
                <span class="status connected">Connected</span>
              </div>
              <div class="service-item">
                <span>🗂️ Obsidian</span>
                <span class="status disconnected">Disconnected</span>
              </div>
            </div>
            <div class="sync-controls">
              <button onclick="alert('Sync now')" class="btn btn-primary">Sync Now</button>
              <button onclick="alert('Add service')" class="btn btn-secondary">+ Add Service</button>
            </div>
            <div class="sync-stats">
              <p>Last sync: 5 minutes ago</p>
              <p>Files synced: 127</p>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Implementation Classes

class WebhookIntegrationPlugin {
  constructor(private api: PluginAPI) {}

  async sendToWebhook(): Promise<void> {
    const noteId = this.api.getActiveNoteId();
    const content = this.api.getEditorContent();

    if (!content) {
      this.api.ui.showNotification('No content to send', 'info');
      return;
    }

    // Simulated webhook sending
    this.api.ui.showNotification(
      `Sending ${noteId || 'note'} to webhook... (In production, this would make an actual HTTP request)`,
      'info'
    );
  }

  async configureIntegration(): Promise<void> {
    this.api.ui.showNotification(
      'Integration configuration opened. Choose from: Slack, Discord, Zapier, or custom webhook',
      'info'
    );
  }
}

class AutomationRulesPlugin {
  constructor(private api: PluginAPI) {}

  async createRule(): Promise<void> {
    this.api.ui.showNotification(
      'Creating automation rule: Configure triggers (file-created, tag-added, task-completed) and actions (add-tag, move-file, send-notification)',
      'info'
    );
  }

  async viewRules(): Promise<void> {
    this.api.ui.showNotification(
      'Viewing automation rules:\n1. When tag #urgent added → Move to Priority folder\n2. When task completed → Add completion date',
      'info'
    );
  }
}

class ScheduleReminderPlugin {
  constructor(private api: PluginAPI) {}

  async addReminder(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Adding reminder to ${noteId || 'current note'}. Enter time (YYYY-MM-DD HH:MM) and message`,
      'info'
    );
  }

  async viewReminders(): Promise<void> {
    this.api.ui.showNotification(
      'Active reminders:\n- Today 3:00 PM: Review weekly goals\n- Tomorrow 9:00 AM: Team meeting prep',
      'info'
    );
  }
}

class BulkOperationsPlugin {
  constructor(private api: PluginAPI) {}

  async bulkAddTags(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Ready to add tags to ${allNotes.length} notes. Enter comma-separated tags`,
      'info'
    );
  }

  async bulkMoveFiles(): Promise<void> {
    this.api.ui.showNotification('Bulk move: Select destination folder for selected files', 'info');
  }

  async bulkFindReplace(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Find & Replace across ${allNotes.length} notes. Enter search and replacement text`,
      'info'
    );
  }
}

class SyncIntegrationPlugin {
  constructor(private api: PluginAPI) {}

  async syncNow(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Syncing ${allNotes.length} notes with external services... (Notion: connected, Obsidian: disconnected)`,
      'info'
    );
  }

  async configureSync(): Promise<void> {
    this.api.ui.showNotification(
      'Configure sync: Choose service (Notion, Obsidian, Roam) and set sync interval',
      'info'
    );
  }
}
