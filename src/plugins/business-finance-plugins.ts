import { PluginManifest, PluginSetting } from '../lib/types';

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
    { type: 'file-system', description: 'Save budget templates' }
  ],
  commands: [
    {
      id: 'create-budget',
      name: 'Create Budget Template',
      description: 'Insert a budget tracking template',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'currency', name: 'Currency', type: 'string', default: 'USD', description: 'Default currency' }
  ] as PluginSetting[]
};

export const projectManagerPlugin: PluginManifest = {
  id: 'project-manager',
  name: 'Project Manager',
  description: 'Advanced project management with timelines, milestones, and resource tracking',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'project-manager.js',
  permissions: [
    { type: 'file-system', description: 'Save project data' }
  ],
  commands: [
    {
      id: 'create-project',
      name: 'Create Project Template',
      description: 'Generate comprehensive project template',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'defaultDuration', name: 'Default Duration', type: 'string', default: '4 weeks', description: 'Default project duration' }
  ] as PluginSetting[]
};

export const invoiceGeneratorPlugin: PluginManifest = {
  id: 'invoice-generator-pro',
  name: 'Invoice Generator Pro',
  description: 'Generate professional invoices and track payments',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'invoice-generator-pro.js',
  permissions: [
    { type: 'clipboard', description: 'Copy invoice data' }
  ],
  commands: [
    {
      id: 'create-invoice',
      name: 'Create Invoice',
      description: 'Generate professional invoice template',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'companyName', name: 'Company Name', type: 'string', default: 'Your Company', description: 'Company name' }
  ] as PluginSetting[]
};

export const businessPlannerPlugin: PluginManifest = {
  id: 'business-planner',
  name: 'Business Planner',
  description: 'Comprehensive business planning tools and templates',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'business-planner.js',
  permissions: [
    { type: 'file-system', description: 'Save business plans' }
  ],
  commands: [
    {
      id: 'business-plan',
      name: 'Business Plan Template',
      description: 'Generate comprehensive business plan',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'industry', name: 'Industry', type: 'string', default: 'Technology', description: 'Business industry' }
  ] as PluginSetting[]
};

export const meetingNotesPlugin: PluginManifest = {
  id: 'meeting-notes-pro',
  name: 'Meeting Notes Pro',
  description: 'Professional meeting documentation and action item tracking',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'meeting-notes-pro.js',
  permissions: [
    { type: 'clipboard', description: 'Copy meeting notes' }
  ],
  commands: [
    {
      id: 'meeting-template',
      name: 'Meeting Template',
      description: 'Create structured meeting notes template',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'defaultDuration', name: 'Default Duration', type: 'string', default: '60 minutes', description: 'Default meeting duration' }
  ] as PluginSetting[]
};
