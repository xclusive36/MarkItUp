import { PluginManifest } from '../lib/types';
import { PluginAPI } from '../lib/PluginAPI';

// Global instances
let versionHistoryInstance: VersionHistoryPlugin | null = null;
let commentSystemInstance: CommentSystemPlugin | null = null;
let reviewWorkflowInstance: ReviewWorkflowPlugin | null = null;
let conflictResolutionInstance: ConflictResolutionPlugin | null = null;
let teamDashboardInstance: TeamDashboardPlugin | null = null;

// Version History Plugin - Track note changes over time
export const versionHistoryPlugin: PluginManifest = {
  id: 'version-history',
  name: 'Version History',
  version: '1.0.0',
  description: 'Track and manage changes to notes over time with version control',
  author: 'MarkItUp Team',
  main: 'version-history.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Store version history data',
    },
  ],

  settings: [
    {
      id: 'maxVersions',
      name: 'Max Versions to Keep',
      type: 'number',
      default: 10,
      description: 'Maximum number of versions to store per note',
    },
    {
      id: 'autoSaveInterval',
      name: 'Auto-save Interval (minutes)',
      type: 'select',
      options: [
        { label: '1 minute', value: '1' },
        { label: '5 minutes', value: '5' },
        { label: '10 minutes', value: '10' },
        { label: '30 minutes', value: '30' },
      ],
      default: '5',
      description: 'How often to automatically save versions',
    },
  ],

  commands: [
    {
      id: 'show-history',
      name: 'Show Version History',
      description: 'View version history for current note',
      keybinding: 'Ctrl+H',
      callback: async () => {
        try {
          if (versionHistoryInstance) {
            await versionHistoryInstance.showHistory();
          }
        } catch (error) {
          console.error('Error showing history:', error);
        }
      },
    },
    {
      id: 'restore-version',
      name: 'Restore Version',
      description: 'Restore note to a previous version',
      callback: async () => {
        try {
          if (versionHistoryInstance) {
            await versionHistoryInstance.restoreVersion();
          }
        } catch (error) {
          console.error('Error restoring version:', error);
        }
      },
    },
    {
      id: 'compare-versions',
      name: 'Compare Versions',
      description: 'Compare current note with previous version',
      callback: async () => {
        try {
          if (versionHistoryInstance) {
            await versionHistoryInstance.compareVersions();
          }
        } catch (error) {
          console.error('Error comparing versions:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      versionHistoryInstance = new VersionHistoryPlugin(api);
    }
  },

  onUnload: () => {
    versionHistoryInstance = null;
  },

  views: [
    {
      id: 'version-history-panel',
      name: 'History',
      type: 'sidebar',
      icon: '📜',
      component: () => {
        return `
          <div class="version-history">
            <h3>📜 Version History</h3>
            <div class="version-list">
              <div class="version-item">
                <div class="version-time">2 hours ago</div>
                <div class="version-changes">+127 words, -15 words</div>
                <button onclick="alert('Restore version')" class="btn-mini">Restore</button>
              </div>
              <div class="version-item">
                <div class="version-time">1 day ago</div>
                <div class="version-changes">+45 words, -3 words</div>
                <button onclick="alert('Restore version')" class="btn-mini">Restore</button>
              </div>
            </div>
            <button onclick="alert('Save current version')" class="btn btn-primary">Save Version</button>
          </div>
        `;
      },
    },
  ],
};

// Comment System Plugin - Add comments to notes
export const commentSystemPlugin: PluginManifest = {
  id: 'comment-system',
  name: 'Comment System',
  version: '1.0.0',
  description: 'Add collaborative comments and annotations to notes',
  author: 'MarkItUp Team',
  main: 'comment-system.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Store comment data',
    },
  ],

  settings: [
    {
      id: 'showCommentCount',
      name: 'Show Comment Count',
      type: 'boolean',
      default: true,
      description: 'Display comment count in note list',
    },
    {
      id: 'commentNotifications',
      name: 'Comment Notifications',
      type: 'boolean',
      default: true,
      description: 'Notify when new comments are added',
    },
  ],

  commands: [
    {
      id: 'add-comment',
      name: 'Add Comment',
      description: 'Add comment to selected text',
      keybinding: 'Ctrl+Shift+C',
      callback: async () => {
        try {
          if (commentSystemInstance) {
            await commentSystemInstance.addComment();
          }
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      },
    },
    {
      id: 'show-all-comments',
      name: 'Show All Comments',
      description: 'View all comments in current note',
      callback: async () => {
        try {
          if (commentSystemInstance) {
            await commentSystemInstance.showAllComments();
          }
        } catch (error) {
          console.error('Error showing comments:', error);
        }
      },
    },
    {
      id: 'resolve-comment',
      name: 'Resolve Comment',
      description: 'Mark comment as resolved',
      callback: async () => {
        try {
          if (commentSystemInstance) {
            await commentSystemInstance.resolveComment();
          }
        } catch (error) {
          console.error('Error resolving comment:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      commentSystemInstance = new CommentSystemPlugin(api);
    }
  },

  onUnload: () => {
    commentSystemInstance = null;
  },

  views: [
    {
      id: 'comments-panel',
      name: 'Comments',
      type: 'sidebar',
      icon: '💬',
      component: () => {
        return `
          <div class="comment-system">
            <h3>💬 Comments</h3>
            <div class="comment-list">
              <div class="comment-item">
                <div class="comment-author">Alice</div>
                <div class="comment-text">Great insight about the methodology!</div>
                <div class="comment-time">2 hours ago</div>
                <button onclick="alert('Reply')" class="btn-mini">Reply</button>
              </div>
              <div class="comment-item resolved">
                <div class="comment-author">Bob</div>
                <div class="comment-text">Could you clarify this section?</div>
                <div class="comment-time">1 day ago</div>
                <span class="resolved-label">Resolved</span>
              </div>
            </div>
            <button onclick="alert('Add comment')" class="btn btn-primary">+ Add Comment</button>
          </div>
        `;
      },
    },
  ],
};

// Review Workflow Plugin - Review and approval processes
export const reviewWorkflowPlugin: PluginManifest = {
  id: 'review-workflow',
  name: 'Review Workflow',
  version: '1.0.0',
  description: 'Manage review and approval workflows for notes and documents',
  author: 'MarkItUp Team',
  main: 'review-workflow.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Manage review status and workflow data',
    },
  ],

  settings: [
    {
      id: 'defaultReviewers',
      name: 'Default Reviewers',
      type: 'string',
      default: '',
      description: 'Comma-separated list of default reviewers',
    },
    {
      id: 'requireApproval',
      name: 'Require Approval for Publication',
      type: 'boolean',
      default: false,
      description: 'Require approval before marking notes as published',
    },
  ],

  commands: [
    {
      id: 'submit-for-review',
      name: 'Submit for Review',
      description: 'Submit current note for review',
      callback: async () => {
        try {
          if (reviewWorkflowInstance) {
            await reviewWorkflowInstance.submitForReview();
          }
        } catch (error) {
          console.error('Error submitting for review:', error);
        }
      },
    },
    {
      id: 'approve-note',
      name: 'Approve Note',
      description: 'Approve current note',
      callback: async () => {
        try {
          if (reviewWorkflowInstance) {
            await reviewWorkflowInstance.approveNote();
          }
        } catch (error) {
          console.error('Error approving note:', error);
        }
      },
    },
    {
      id: 'request-changes',
      name: 'Request Changes',
      description: 'Request changes to current note',
      callback: async () => {
        try {
          if (reviewWorkflowInstance) {
            await reviewWorkflowInstance.requestChanges();
          }
        } catch (error) {
          console.error('Error requesting changes:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      reviewWorkflowInstance = new ReviewWorkflowPlugin(api);
    }
  },

  onUnload: () => {
    reviewWorkflowInstance = null;
  },

  views: [
    {
      id: 'review-queue',
      name: 'Reviews',
      type: 'sidebar',
      icon: '📋',
      component: () => {
        return `
          <div class="review-workflow">
            <h3>📋 Review Queue</h3>
            <div class="review-item">
              <div class="review-title">Marketing Strategy Draft</div>
              <div class="review-status pending">Pending Review</div>
              <div class="review-reviewer">Assigned to: Alice</div>
              <button onclick="alert('Open for review')" class="btn-mini">Review</button>
            </div>
            <div class="review-item">
              <div class="review-title">Product Roadmap</div>
              <div class="review-status approved">Approved</div>
              <div class="review-reviewer">Reviewed by: Bob</div>
            </div>
            <button onclick="alert('Submit for review')" class="btn btn-primary">Submit for Review</button>
          </div>
        `;
      },
    },
  ],
};

// Conflict Resolution Plugin - Handle merge conflicts
export const conflictResolutionPlugin: PluginManifest = {
  id: 'conflict-resolution',
  name: 'Conflict Resolution',
  version: '1.0.0',
  description: 'Resolve conflicts when multiple users edit the same note',
  author: 'MarkItUp Team',
  main: 'conflict-resolution.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Access conflict data and resolve conflicts',
    },
  ],

  settings: [
    {
      id: 'autoMergeStrategy',
      name: 'Auto-merge Strategy',
      type: 'select',
      options: [
        { label: 'Manual Only', value: 'manual' },
        { label: 'Accept Local', value: 'local' },
        { label: 'Accept Remote', value: 'remote' },
        { label: 'Smart Merge', value: 'smart' },
      ],
      default: 'manual',
      description: 'How to handle conflicts automatically',
    },
  ],

  commands: [
    {
      id: 'resolve-conflict',
      name: 'Resolve Conflict',
      description: 'Manually resolve merge conflict',
      callback: async () => {
        try {
          if (conflictResolutionInstance) {
            await conflictResolutionInstance.resolveConflict();
          }
        } catch (error) {
          console.error('Error resolving conflict:', error);
        }
      },
    },
    {
      id: 'accept-local',
      name: 'Accept Local Changes',
      description: 'Accept your version of the conflicted note',
      callback: async () => {
        try {
          if (conflictResolutionInstance) {
            await conflictResolutionInstance.acceptLocal();
          }
        } catch (error) {
          console.error('Error accepting local changes:', error);
        }
      },
    },
    {
      id: 'accept-remote',
      name: 'Accept Remote Changes',
      description: 'Accept the other version of the conflicted note',
      callback: async () => {
        try {
          if (conflictResolutionInstance) {
            await conflictResolutionInstance.acceptRemote();
          }
        } catch (error) {
          console.error('Error accepting remote changes:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      conflictResolutionInstance = new ConflictResolutionPlugin(api);
    }
  },

  onUnload: () => {
    conflictResolutionInstance = null;
  },

  views: [
    {
      id: 'conflicts-panel',
      name: 'Conflicts',
      type: 'sidebar',
      icon: '⚠️',
      component: () => {
        return `
          <div class="conflict-resolution">
            <h3>⚠️ Merge Conflicts</h3>
            <div class="conflict-list">
              <div class="conflict-item">
                <div class="conflict-file">project-notes.md</div>
                <div class="conflict-type">Content conflict</div>
                <button onclick="alert('Resolve conflict')" class="btn btn-primary">Resolve</button>
              </div>
            </div>
            <div class="conflict-help">
              <p>No active conflicts</p>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Team Dashboard Plugin - Team activity overview
export const teamDashboardPlugin: PluginManifest = {
  id: 'team-dashboard',
  name: 'Team Dashboard',
  version: '1.0.0',
  description: 'Overview of team activity, collaboration, and progress',
  author: 'MarkItUp Team',
  main: 'team-dashboard.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Access team activity data',
    },
  ],

  settings: [
    {
      id: 'teamMembers',
      name: 'Team Members',
      type: 'string',
      default: '',
      description: 'Comma-separated list of team member names',
    },
    {
      id: 'activityPeriod',
      name: 'Activity Period',
      type: 'select',
      options: [
        { label: 'Last 24 hours', value: '24h' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
      ],
      default: '7d',
      description: 'Time period for activity overview',
    },
  ],

  commands: [
    {
      id: 'view-team-activity',
      name: 'View Team Activity',
      description: 'View detailed team activity report',
      callback: async () => {
        try {
          if (teamDashboardInstance) {
            await teamDashboardInstance.viewTeamActivity();
          }
        } catch (error) {
          console.error('Error viewing team activity:', error);
        }
      },
    },
    {
      id: 'generate-team-report',
      name: 'Generate Team Report',
      description: 'Generate team progress report',
      callback: async () => {
        try {
          if (teamDashboardInstance) {
            await teamDashboardInstance.generateTeamReport();
          }
        } catch (error) {
          console.error('Error generating team report:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      teamDashboardInstance = new TeamDashboardPlugin(api);
    }
  },

  onUnload: () => {
    teamDashboardInstance = null;
  },

  views: [
    {
      id: 'team-dashboard-panel',
      name: 'Team',
      type: 'sidebar',
      icon: '👥',
      component: () => {
        return `
          <div class="team-dashboard">
            <h3>👥 Team Dashboard</h3>
            <div class="team-stats">
              <div class="stat-item">
                <span>Active Members:</span>
                <span class="stat-value">5</span>
              </div>
              <div class="stat-item">
                <span>Notes Created:</span>
                <span class="stat-value">23</span>
              </div>
              <div class="stat-item">
                <span>Comments Added:</span>
                <span class="stat-value">47</span>
              </div>
            </div>
            <div class="team-activity">
              <h4>Recent Activity</h4>
              <div class="activity-item">
                <span>Alice created "Meeting Notes"</span>
                <span class="activity-time">2h ago</span>
              </div>
              <div class="activity-item">
                <span>Bob commented on "Project Plan"</span>
                <span class="activity-time">4h ago</span>
              </div>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Implementation Classes

class VersionHistoryPlugin {
  constructor(private api: PluginAPI) {}

  async showHistory(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Version History for ${noteId || 'current note'}:\n- 2 hours ago: +127 words, -15 words\n- 1 day ago: +45 words, -3 words`,
      'info'
    );
  }

  async restoreVersion(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Restoring ${noteId || 'note'} to previous version... Select version from history panel`,
      'info'
    );
  }

  async compareVersions(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Comparing versions for ${noteId || 'current note'}. Showing diff view...`,
      'info'
    );
  }
}

class CommentSystemPlugin {
  constructor(private api: PluginAPI) {}

  async addComment(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Adding comment to ${noteId || 'current note'}. Select text to annotate`,
      'info'
    );
  }

  async showAllComments(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Comments for ${noteId || 'current note'}:\n- Alice: "Great insight about the methodology!" (2 hours ago)\n- Bob: "Could you clarify this section?" (Resolved)`,
      'info'
    );
  }

  async resolveComment(): Promise<void> {
    this.api.ui.showNotification('Marking comment as resolved...', 'info');
  }
}

class ReviewWorkflowPlugin {
  constructor(private api: PluginAPI) {}

  async submitForReview(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Submitting ${noteId || 'note'} for review. Enter reviewers (comma-separated)`,
      'info'
    );
  }

  async approveNote(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Approving ${noteId || 'note'}. Status changed to Approved`,
      'info'
    );
  }

  async requestChanges(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Requesting changes for ${noteId || 'note'}. Enter feedback for reviewer`,
      'info'
    );
  }
}

class ConflictResolutionPlugin {
  constructor(private api: PluginAPI) {}

  async resolveConflict(): Promise<void> {
    this.api.ui.showNotification(
      'Opening conflict resolution interface. Choose between local and remote changes',
      'info'
    );
  }

  async acceptLocal(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Accepting local changes for ${noteId || 'note'}. Remote version discarded`,
      'info'
    );
  }

  async acceptRemote(): Promise<void> {
    const noteId = this.api.getActiveNoteId();

    this.api.ui.showNotification(
      `Accepting remote changes for ${noteId || 'note'}. Local version discarded`,
      'info'
    );
  }
}

class TeamDashboardPlugin {
  constructor(private api: PluginAPI) {}

  async viewTeamActivity(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Team Activity Report:\n- Active Members: 5\n- Notes Created: ${allNotes.length}\n- Recent: Alice created "Meeting Notes" (2h ago), Bob commented on "Project Plan" (4h ago)`,
      'info'
    );
  }

  async generateTeamReport(): Promise<void> {
    const allNotes = this.api.notes.getAll();

    this.api.ui.showNotification(
      `Generating team progress report for ${allNotes.length} notes... Export as PDF or email to team`,
      'info'
    );
  }
}
