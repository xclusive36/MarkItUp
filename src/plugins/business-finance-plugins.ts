import { PluginManifest, PluginSetting, PluginAPI } from '../lib/types';

// Global plugin instances
let budgetTrackerInstance: BudgetTrackerPlugin | null = null;
let projectManagerInstance: ProjectManagerPlugin | null = null;
let invoiceGeneratorInstance: InvoiceGeneratorPlugin | null = null;
let businessPlannerInstance: BusinessPlannerPlugin | null = null;
let meetingNotesInstance: MeetingNotesProPlugin | null = null;

// Business & Finance Tools Plugin Collection (Simplified)
// Professional tools for business planning, financial analysis, and project management

export const budgetTrackerPlugin: PluginManifest = {
  id: 'budget-tracker',
  name: 'Budget Tracker',
  description: 'Track budgets, expenses, and financial planning within your notes',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'budget-tracker.js',
  permissions: [
    { type: 'clipboard', description: 'Copy budget data' },
    { type: 'file-system', description: 'Save budget templates' },
  ],
  commands: [
    {
      id: 'create-budget',
      name: 'Create Budget Template',
      description: 'Insert a budget tracking template',
      callback: async (api?: PluginAPI) => {
        if (!budgetTrackerInstance) {
          console.error('Budget Tracker plugin instance not initialized');
          api?.ui.showNotification('Budget Tracker plugin not ready', 'error');
          return;
        }
        await budgetTrackerInstance.createBudget();
      },
    },
  ],
  settings: [
    {
      id: 'currency',
      name: 'Currency',
      type: 'string',
      default: 'USD',
      description: 'Default currency',
    },
  ] as PluginSetting[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Budget Tracker: PluginAPI not available');
      return;
    }
    budgetTrackerInstance = new BudgetTrackerPlugin(api);
    console.log('Budget Tracker plugin loaded');
  },

  onUnload: async () => {
    budgetTrackerInstance = null;
    console.log('Budget Tracker plugin unloaded');
  },
};

export const projectManagerPlugin: PluginManifest = {
  id: 'project-manager',
  name: 'Project Manager',
  description: 'Advanced project management with timelines, milestones, and resource tracking',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'project-manager.js',
  permissions: [{ type: 'file-system', description: 'Save project data' }],
  commands: [
    {
      id: 'create-project',
      name: 'Create Project Template',
      description: 'Generate comprehensive project template',
      callback: async (api?: PluginAPI) => {
        if (!projectManagerInstance) {
          console.error('Project Manager plugin instance not initialized');
          api?.ui.showNotification('Project Manager plugin not ready', 'error');
          return;
        }
        await projectManagerInstance.createProject();
      },
    },
  ],
  settings: [
    {
      id: 'defaultDuration',
      name: 'Default Duration',
      type: 'string',
      default: '4 weeks',
      description: 'Default project duration',
    },
  ] as PluginSetting[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Project Manager: PluginAPI not available');
      return;
    }
    projectManagerInstance = new ProjectManagerPlugin(api);
    console.log('Project Manager plugin loaded');
  },

  onUnload: async () => {
    projectManagerInstance = null;
    console.log('Project Manager plugin unloaded');
  },
};

export const invoiceGeneratorPlugin: PluginManifest = {
  id: 'invoice-generator-pro',
  name: 'Invoice Generator Pro',
  description: 'Generate professional invoices and track payments',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'invoice-generator-pro.js',
  permissions: [{ type: 'clipboard', description: 'Copy invoice data' }],
  commands: [
    {
      id: 'create-invoice',
      name: 'Create Invoice',
      description: 'Generate professional invoice template',
      callback: async (api?: PluginAPI) => {
        if (!invoiceGeneratorInstance) {
          console.error('Invoice Generator plugin instance not initialized');
          api?.ui.showNotification('Invoice Generator plugin not ready', 'error');
          return;
        }
        await invoiceGeneratorInstance.createInvoice();
      },
    },
  ],
  settings: [
    {
      id: 'companyName',
      name: 'Company Name',
      type: 'string',
      default: 'Your Company',
      description: 'Company name',
    },
  ] as PluginSetting[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Invoice Generator: PluginAPI not available');
      return;
    }
    invoiceGeneratorInstance = new InvoiceGeneratorPlugin(api);
    console.log('Invoice Generator plugin loaded');
  },

  onUnload: async () => {
    invoiceGeneratorInstance = null;
    console.log('Invoice Generator plugin unloaded');
  },
};

export const businessPlannerPlugin: PluginManifest = {
  id: 'business-planner',
  name: 'Business Planner',
  description: 'Comprehensive business planning tools and templates',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'business-planner.js',
  permissions: [{ type: 'file-system', description: 'Save business plans' }],
  commands: [
    {
      id: 'business-plan',
      name: 'Business Plan Template',
      description: 'Generate comprehensive business plan',
      callback: async (api?: PluginAPI) => {
        if (!businessPlannerInstance) {
          console.error('Business Planner plugin instance not initialized');
          api?.ui.showNotification('Business Planner plugin not ready', 'error');
          return;
        }
        await businessPlannerInstance.createBusinessPlan();
      },
    },
  ],
  settings: [
    {
      id: 'industry',
      name: 'Industry',
      type: 'string',
      default: 'Technology',
      description: 'Business industry',
    },
  ] as PluginSetting[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Business Planner: PluginAPI not available');
      return;
    }
    businessPlannerInstance = new BusinessPlannerPlugin(api);
    console.log('Business Planner plugin loaded');
  },

  onUnload: async () => {
    businessPlannerInstance = null;
    console.log('Business Planner plugin unloaded');
  },
};

export const meetingNotesPlugin: PluginManifest = {
  id: 'meeting-notes-pro',
  name: 'Meeting Notes Pro',
  description: 'Professional meeting documentation and action item tracking',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'meeting-notes-pro.js',
  permissions: [{ type: 'clipboard', description: 'Copy meeting notes' }],
  commands: [
    {
      id: 'meeting-template',
      name: 'Meeting Template',
      description: 'Create structured meeting notes template',
      callback: async (api?: PluginAPI) => {
        if (!meetingNotesInstance) {
          console.error('Meeting Notes Pro plugin instance not initialized');
          api?.ui.showNotification('Meeting Notes Pro plugin not ready', 'error');
          return;
        }
        await meetingNotesInstance.createMeetingNotes();
      },
    },
  ],
  settings: [
    {
      id: 'defaultDuration',
      name: 'Default Duration',
      type: 'string',
      default: '60 minutes',
      description: 'Default meeting duration',
    },
  ] as PluginSetting[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Meeting Notes Pro: PluginAPI not available');
      return;
    }
    meetingNotesInstance = new MeetingNotesProPlugin(api);
    console.log('Meeting Notes Pro plugin loaded');
  },

  onUnload: async () => {
    meetingNotesInstance = null;
    console.log('Meeting Notes Pro plugin unloaded');
  },
};

// ============================================
// PLUGIN IMPLEMENTATION CLASSES
// ============================================

// Budget Tracker Plugin Implementation
export class BudgetTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async createBudget() {
    const template = `# Budget Tracker - ${new Date().toLocaleDateString()}

## Income
| Source | Amount | Frequency |
|--------|--------|-----------|
| Salary | $0.00  | Monthly   |
| Freelance | $0.00 | Varies |
| **Total Income** | **$0.00** | |

## Fixed Expenses
| Category | Amount | Due Date |
|----------|--------|----------|
| Rent/Mortgage | $0.00 | 1st |
| Utilities | $0.00 | 15th |
| Insurance | $0.00 | 1st |
| **Total Fixed** | **$0.00** | |

## Variable Expenses
| Category | Budgeted | Actual | Difference |
|----------|----------|--------|------------|
| Groceries | $0.00 | $0.00 | $0.00 |
| Entertainment | $0.00 | $0.00 | $0.00 |
| Transportation | $0.00 | $0.00 | $0.00 |
| **Total Variable** | **$0.00** | **$0.00** | **$0.00** |

## Summary
- **Total Income**: $0.00
- **Total Expenses**: $0.00
- **Net**: $0.00
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Budget tracker template inserted!', 'info');
  }
}

// Project Manager Plugin Implementation
export class ProjectManagerPlugin {
  constructor(private api: PluginAPI) {}

  async createProject() {
    const template = `# Project: [Project Name]

## Overview
- **Status**: Planning
- **Start Date**: ${new Date().toLocaleDateString()}
- **Target Completion**: [Date]
- **Project Manager**: [Name]

## Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## Milestones
- [ ] **Phase 1**: [Description] - [Date]
- [ ] **Phase 2**: [Description] - [Date]
- [ ] **Phase 3**: [Description] - [Date]

## Tasks
### Phase 1
- [ ] Task 1
- [ ] Task 2

### Phase 2
- [ ] Task 1
- [ ] Task 2

## Resources
- **Team**: [Team members]
- **Budget**: $[Amount]
- **Tools**: [Tools/software needed]

## Risks
1. **Risk**: [Description] | **Mitigation**: [Strategy]
2. **Risk**: [Description] | **Mitigation**: [Strategy]
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Project template inserted!', 'info');
  }
}

// Invoice Generator Plugin Implementation
export class InvoiceGeneratorPlugin {
  constructor(private api: PluginAPI) {}

  async createInvoice() {
    const invoiceNumber = `INV-${Date.now()}`;
    const template = `# INVOICE

**Invoice #**: ${invoiceNumber}
**Date**: ${new Date().toLocaleDateString()}
**Due Date**: [Payment due date]

## From
**[Your Company Name]**
[Your Address]
[City, State ZIP]
[Email]
[Phone]

## Bill To
**[Client Name]**
[Client Address]
[City, State ZIP]

## Services
| Description | Quantity | Rate | Amount |
|-------------|----------|------|--------|
| [Service 1] | 1 | $0.00 | $0.00 |
| [Service 2] | 1 | $0.00 | $0.00 |

**Subtotal**: $0.00
**Tax (0%)**: $0.00
**Total Due**: **$0.00**

## Payment Terms
Payment due within 30 days.

## Payment Methods
- Bank Transfer: [Account details]
- PayPal: [Email]
- Check: Payable to [Company Name]

## Notes
[Additional notes or terms]
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification(`Invoice ${invoiceNumber} created!`, 'info');
  }
}

// Business Planner Plugin Implementation
export class BusinessPlannerPlugin {
  constructor(private api: PluginAPI) {}

  async createBusinessPlan() {
    const template = `# Business Plan

## Executive Summary
[Brief overview of your business concept and goals]

## Company Description
- **Company Name**: [Name]
- **Industry**: [Industry]
- **Founded**: [Date]
- **Mission Statement**: [Mission]

## Market Analysis
### Target Market
- **Demographics**: [Target audience]
- **Market Size**: [Estimated market size]
- **Trends**: [Industry trends]

### Competition
1. **Competitor 1**: [Analysis]
2. **Competitor 2**: [Analysis]

## Products/Services
1. **[Product/Service 1]**: [Description]
2. **[Product/Service 2]**: [Description]

## Marketing Strategy
- **Positioning**: [How you'll position in market]
- **Pricing**: [Pricing strategy]
- **Promotion**: [Marketing channels]
- **Distribution**: [How you'll reach customers]

## Operations Plan
- **Location**: [Business location]
- **Equipment**: [Equipment needed]
- **Suppliers**: [Key suppliers]

## Financial Projections
### Year 1
- **Revenue**: $[Amount]
- **Expenses**: $[Amount]
- **Profit**: $[Amount]

## Funding Requirements
- **Amount Needed**: $[Amount]
- **Use of Funds**: [How funds will be used]
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Business plan template inserted!', 'info');
  }
}

// Meeting Notes Pro Plugin Implementation
export class MeetingNotesProPlugin {
  constructor(private api: PluginAPI) {}

  async createMeetingNotes() {
    const template = `# Meeting Notes - ${new Date().toLocaleDateString()}

## Meeting Info
- **Date**: ${new Date().toLocaleDateString()}
- **Time**: [Start time] - [End time]
- **Location**: [Location/Video link]
- **Attendees**: [Names]
- **Facilitator**: [Name]

## Agenda
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

## Discussion Points

### Topic 1: [Title]
- [Key point]
- [Key point]

### Topic 2: [Title]
- [Key point]
- [Key point]

## Action Items
- [ ] **[Person]**: [Action item] - Due: [Date]
- [ ] **[Person]**: [Action item] - Due: [Date]

## Decisions Made
1. [Decision 1]
2. [Decision 2]

## Next Meeting
- **Date**: [Date]
- **Topics**: [Topics to discuss]
`;

    const currentContent = this.api.ui.getEditorContent();
    const updatedContent = currentContent + '\n\n' + template;
    this.api.ui.setEditorContent(updatedContent);

    this.api.ui.showNotification('Meeting notes template inserted!', 'info');
  }
}
