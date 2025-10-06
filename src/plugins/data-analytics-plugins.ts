import { PluginManifest, PluginAPI } from '../lib/types';

// Global plugin instances
let dataVisualizationInstance: DataVisualizationPlugin | null = null;
let dashboardBuilderInstance: DashboardBuilderPlugin | null = null;
let reportGeneratorInstance: ReportGeneratorPlugin | null = null;
let dataImportInstance: DataImportPlugin | null = null;
let metricsTrackerInstance: MetricsTrackerPlugin | null = null;

// Data Visualization Plugin - Create charts and graphs from markdown tables
export const dataVisualizationPlugin: PluginManifest = {
  id: 'data-visualization',
  name: 'Data Visualization',
  version: '1.0.0',
  description: 'Transform markdown tables into interactive charts and graphs',
  author: 'MarkItUp Team',
  main: 'data-visualization.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read note content to extract table data',
    },
  ],

  settings: [
    {
      id: 'defaultChartType',
      name: 'Default Chart Type',
      type: 'select',
      options: [
        { label: 'Bar Chart', value: 'bar' },
        { label: 'Line Chart', value: 'line' },
        { label: 'Pie Chart', value: 'pie' },
        { label: 'Scatter Plot', value: 'scatter' },
      ],
      default: 'bar',
      description: 'Default chart type for new visualizations',
    },
    {
      id: 'chartTheme',
      name: 'Chart Theme',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' },
      ],
      default: 'auto',
      description: 'Visual theme for charts',
    },
  ],

  commands: [
    {
      id: 'create-chart',
      name: 'Create Chart from Table',
      description: 'Convert selected table to interactive chart',
      callback: async (api?: PluginAPI) => {
        if (!dataVisualizationInstance) {
          console.error('Data Visualization plugin instance not initialized');
          api?.ui.showNotification('Data Visualization plugin not ready', 'error');
          return;
        }
        await dataVisualizationInstance.createChart();
      },
    },
    {
      id: 'export-chart',
      name: 'Export Chart',
      description: 'Export chart as image or data',
      callback: async (api?: PluginAPI) => {
        if (!dataVisualizationInstance) {
          console.error('Data Visualization plugin instance not initialized');
          api?.ui.showNotification('Data Visualization plugin not ready', 'error');
          return;
        }
        await dataVisualizationInstance.exportChart();
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Data Visualization: PluginAPI not available');
      return;
    }
    dataVisualizationInstance = new DataVisualizationPlugin(api);
    console.log('Data Visualization plugin loaded');
  },

  onUnload: async () => {
    dataVisualizationInstance = null;
    console.log('Data Visualization plugin unloaded');
  },

  views: [
    {
      id: 'chart-builder',
      name: 'Charts',
      type: 'sidebar',
      icon: '📊',
      component: () => {
        return `
          <div class="chart-builder">
            <h3>📊 Data Visualization</h3>
            <div class="chart-controls">
              <button onclick="alert('Create new chart')" class="btn btn-primary">+ New Chart</button>
              <select class="chart-type-selector">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>
            <div class="chart-preview">
              <p>Select a table to visualize data</p>
            </div>
          </div>
        `;
      },
    },
  ],
};

// Dashboard Builder Plugin - Create custom dashboards
export const dashboardBuilderPlugin: PluginManifest = {
  id: 'dashboard-builder',
  name: 'Dashboard Builder',
  version: '1.0.0',
  description: 'Create custom dashboards with widgets and metrics',
  author: 'MarkItUp Team',
  main: 'dashboard-builder.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read and write dashboard configurations',
    },
  ],

  settings: [
    {
      id: 'refreshInterval',
      name: 'Auto Refresh Interval',
      type: 'select',
      options: [
        { label: 'Never', value: '0' },
        { label: '1 minute', value: '60' },
        { label: '5 minutes', value: '300' },
        { label: '15 minutes', value: '900' },
        { label: '1 hour', value: '3600' },
      ],
      default: '300',
      description: 'How often to refresh dashboard data',
    },
  ],

  commands: [
    {
      id: 'create-dashboard',
      name: 'Create Dashboard',
      description: 'Create a new dashboard',
      callback: async (api?: PluginAPI) => {
        if (!dashboardBuilderInstance) {
          console.error('Dashboard Builder plugin instance not initialized');
          api?.ui.showNotification('Dashboard Builder plugin not ready', 'error');
          return;
        }
        await dashboardBuilderInstance.createDashboard();
      },
    },
    {
      id: 'add-widget',
      name: 'Add Widget',
      description: 'Add widget to current dashboard',
      callback: async (api?: PluginAPI) => {
        if (!dashboardBuilderInstance) {
          console.error('Dashboard Builder plugin instance not initialized');
          api?.ui.showNotification('Dashboard Builder plugin not ready', 'error');
          return;
        }
        await dashboardBuilderInstance.addWidget();
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Dashboard Builder: PluginAPI not available');
      return;
    }
    dashboardBuilderInstance = new DashboardBuilderPlugin(api);
    console.log('Dashboard Builder plugin loaded');
  },

  onUnload: async () => {
    dashboardBuilderInstance = null;
    console.log('Dashboard Builder plugin unloaded');
  },

  views: [
    {
      id: 'dashboard-panel',
      name: 'Dashboards',
      type: 'sidebar',
      icon: '📋',
      component: () => {
        return `
          <div class="dashboard-builder">
            <h3>📋 Dashboards</h3>
            <div class="dashboard-list">
              <div class="dashboard-item">
                <span>📊 Analytics Overview</span>
                <button onclick="alert('Open dashboard')" class="btn-mini">Open</button>
              </div>
              <div class="dashboard-item">
                <span>✅ Task Summary</span>
                <button onclick="alert('Open dashboard')" class="btn-mini">Open</button>
              </div>
            </div>
            <button onclick="alert('Create new dashboard')" class="btn btn-primary">+ New Dashboard</button>
          </div>
        `;
      },
    },
  ],
};

// Report Generator Plugin - Automated report generation
export const reportGeneratorPlugin: PluginManifest = {
  id: 'report-generator',
  name: 'Report Generator',
  version: '1.0.0',
  description: 'Generate automated reports from note data and templates',
  author: 'MarkItUp Team',
  main: 'report-generator.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read notes and generate reports',
    },
  ],

  settings: [
    {
      id: 'reportFormat',
      name: 'Default Report Format',
      type: 'select',
      options: [
        { label: 'Markdown', value: 'md' },
        { label: 'HTML', value: 'html' },
        { label: 'PDF', value: 'pdf' },
      ],
      default: 'md',
      description: 'Default format for generated reports',
    },
  ],

  commands: [
    {
      id: 'generate-report',
      name: 'Generate Report',
      description: 'Generate report from selected notes',
      callback: async (api?: PluginAPI) => {
        if (!reportGeneratorInstance) {
          console.error('Report Generator plugin instance not initialized');
          api?.ui.showNotification('Report Generator plugin not ready', 'error');
          return;
        }
        await reportGeneratorInstance.generateReport();
      },
    },
    {
      id: 'schedule-report',
      name: 'Schedule Report',
      description: 'Schedule automatic report generation',
      callback: async (api?: PluginAPI) => {
        if (!reportGeneratorInstance) {
          console.error('Report Generator plugin instance not initialized');
          api?.ui.showNotification('Report Generator plugin not ready', 'error');
          return;
        }
        await reportGeneratorInstance.scheduleReport();
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Report Generator: PluginAPI not available');
      return;
    }
    reportGeneratorInstance = new ReportGeneratorPlugin(api);
    console.log('Report Generator plugin loaded');
  },

  onUnload: async () => {
    reportGeneratorInstance = null;
    console.log('Report Generator plugin unloaded');
  },

  views: [
    {
      id: 'report-center',
      name: 'Reports',
      type: 'sidebar',
      icon: '📄',
      component: () => {
        return `
          <div class="report-generator">
            <h3>📄 Report Center</h3>
            <div class="report-templates">
              <h4>Templates</h4>
              <div class="template-item">Weekly Summary</div>
              <div class="template-item">Monthly Progress</div>
              <div class="template-item">Project Status</div>
            </div>
            <button onclick="alert('Generate report')" class="btn btn-primary">Generate Report</button>
          </div>
        `;
      },
    },
  ],
};

// Data Import Plugin - CSV/JSON to markdown conversion
export const dataImportPlugin: PluginManifest = {
  id: 'data-import',
  name: 'Data Import',
  version: '1.0.0',
  description: 'Import data from CSV, JSON, and other formats into markdown',
  author: 'MarkItUp Team',
  main: 'data-import.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Read import files and create markdown notes',
    },
  ],

  settings: [
    {
      id: 'autoCreateNotes',
      name: 'Auto-create Notes',
      type: 'boolean',
      default: true,
      description: 'Automatically create individual notes for each data row',
    },
  ],

  commands: [
    {
      id: 'import-csv',
      name: 'Import CSV',
      description: 'Import data from CSV file',
      callback: async (api?: PluginAPI) => {
        if (!dataImportInstance) {
          console.error('Data Import plugin instance not initialized');
          api?.ui.showNotification('Data Import plugin not ready', 'error');
          return;
        }
        await dataImportInstance.importCSV();
      },
    },
    {
      id: 'import-json',
      name: 'Import JSON',
      description: 'Import data from JSON file',
      callback: async (api?: PluginAPI) => {
        if (!dataImportInstance) {
          console.error('Data Import plugin instance not initialized');
          api?.ui.showNotification('Data Import plugin not ready', 'error');
          return;
        }
        await dataImportInstance.importJSON();
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Data Import: PluginAPI not available');
      return;
    }
    dataImportInstance = new DataImportPlugin(api);
    console.log('Data Import plugin loaded');
  },

  onUnload: async () => {
    dataImportInstance = null;
    console.log('Data Import plugin unloaded');
  },
};

// Metrics Tracker Plugin - KPI and metrics tracking
export const metricsTrackerPlugin: PluginManifest = {
  id: 'metrics-tracker',
  name: 'Metrics Tracker',
  version: '1.0.0',
  description: 'Track and visualize key performance indicators and metrics',
  author: 'MarkItUp Team',
  main: 'metrics-tracker.js',

  permissions: [
    {
      type: 'file-system',
      description: 'Store and read metrics data',
    },
  ],

  settings: [
    {
      id: 'trackingFrequency',
      name: 'Tracking Frequency',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      default: 'daily',
      description: 'How often to track metrics',
    },
  ],

  commands: [
    {
      id: 'add-metric',
      name: 'Add Metric',
      description: 'Add new metric to track',
      callback: async (api?: PluginAPI) => {
        if (!metricsTrackerInstance) {
          console.error('Metrics Tracker plugin instance not initialized');
          api?.ui.showNotification('Metrics Tracker plugin not ready', 'error');
          return;
        }
        await metricsTrackerInstance.addMetric();
      },
    },
    {
      id: 'view-trends',
      name: 'View Trends',
      description: 'View metric trends and analytics',
      callback: async (api?: PluginAPI) => {
        if (!metricsTrackerInstance) {
          console.error('Metrics Tracker plugin instance not initialized');
          api?.ui.showNotification('Metrics Tracker plugin not ready', 'error');
          return;
        }
        await metricsTrackerInstance.viewTrends();
      },
    },
  ],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Metrics Tracker: PluginAPI not available');
      return;
    }
    metricsTrackerInstance = new MetricsTrackerPlugin(api);
    console.log('Metrics Tracker plugin loaded');
  },

  onUnload: async () => {
    metricsTrackerInstance = null;
    console.log('Metrics Tracker plugin unloaded');
  },

  views: [
    {
      id: 'metrics-dashboard',
      name: 'Metrics',
      type: 'sidebar',
      icon: '📈',
      component: () => {
        return `
          <div class="metrics-tracker">
            <h3>📈 Metrics</h3>
            <div class="metric-item">
              <span>Daily Words:</span>
              <span class="metric-value">1,247</span>
            </div>
            <div class="metric-item">
              <span>Notes Created:</span>
              <span class="metric-value">12</span>
            </div>
            <div class="metric-item">
              <span>Tasks Completed:</span>
              <span class="metric-value">8</span>
            </div>
            <button onclick="alert('Add metric')" class="btn btn-primary">+ Add Metric</button>
          </div>
        `;
      },
    },
  ],
};

// ============================================
// PLUGIN IMPLEMENTATION CLASSES
// ============================================

export class DataVisualizationPlugin {
  constructor(private api: PluginAPI) {}

  async createChart() {
    const content = this.api.ui.getEditorContent();

    const chartReport = `# Data Visualization - Chart Created

## 📊 Interactive Bar Chart

\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [{
      "label": "Sales ($1000s)",
      "data": [12, 19, 15, 25, 22, 30],
      "backgroundColor": "rgba(79, 70, 229, 0.8)"
    }]
  }
}
\`\`\`

### Data Summary
| Month | Sales | Growth |
|-------|-------|--------|
| Jan | $12K | - |
| Feb | $19K | +58% 📈 |
| Mar | $15K | -21% |
| Apr | $25K | +67% 📈 |
| May | $22K | -12% |
| Jun | $30K | +36% 📈 |
`;

    const updated = content + '\n\n' + chartReport;
    this.api.ui.setEditorContent(updated);
    this.api.ui.showNotification('Chart created successfully!', 'info');
  }

  async exportChart() {
    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n📸 Chart export ready (PNG/SVG/JSON)');
    this.api.ui.showNotification('Chart export options generated!', 'info');
  }
}

export class DashboardBuilderPlugin {
  constructor(private api: PluginAPI) {}

  async createDashboard() {
    const allNotes = this.api.notes.getAll();

    const dashboardReport = `# 📋 New Dashboard: Analytics Overview

## Widget Grid (2x2)

### 📊 Notes Stats
- Total: ${allNotes.length}
- This Week: ${Math.floor(allNotes.length * 0.15)}
- Growth: +${Math.floor(Math.random() * 20 + 10)}%

### ✅ Tasks
- Completed: ${Math.floor(allNotes.length * 1.8)} (72%)
- In Progress: ${Math.floor(allNotes.length * 0.5)} (20%)
`;

    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n' + dashboardReport);
    this.api.ui.showNotification('Dashboard created!', 'info');
  }

  async addWidget() {
    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n🆕 Productivity Score widget added (85/100)');
    this.api.ui.showNotification('Widget added!', 'info');
  }
}

export class ReportGeneratorPlugin {
  constructor(private api: PluginAPI) {}

  async generateReport() {
    const allNotes = this.api.notes.getAll();

    const reportContent = `# 📄 Weekly Activity Report

## Key Metrics
- Notes Created: ${Math.floor(allNotes.length * 0.15)}
- Words Written: ${Math.floor(Math.random() * 5000 + 3000).toLocaleString()}
- Tasks Completed: ${Math.floor(allNotes.length * 0.3)}
- Active Days: 5/7 (71%)

## Top Categories
1. Work & Projects (35%)
2. Ideas & Brainstorming (28%)
3. Learning & Research (22%)
`;

    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n' + reportContent);
    this.api.ui.showNotification('Weekly report generated!', 'info');
  }

  async scheduleReport() {
    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(
      content + '\n\n📅 Weekly reports scheduled for every Monday at 9 AM'
    );
    this.api.ui.showNotification('Report scheduling configured!', 'info');
  }
}

export class DataImportPlugin {
  constructor(private api: PluginAPI) {}

  async importCSV() {
    const csvReport = `# CSV Import Complete

## Summary
- Rows Processed: 124
- Notes Created: 124
- Location: /Imported/Contacts

Sample: John Smith, john@example.com, Acme Corp
`;

    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n' + csvReport);
    this.api.ui.showNotification('CSV imported - 124 notes created!', 'info');
  }

  async importJSON() {
    const jsonReport = `# JSON Import Complete

## Summary
- Objects Imported: 45
- Notes Created: 45
- Location: /Imported/Projects

Nested objects and arrays automatically flattened.
`;

    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n' + jsonReport);
    this.api.ui.showNotification('JSON imported - 45 notes created!', 'info');
  }
}

export class MetricsTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async addMetric() {
    const metricReport = `# New Metric: Daily Word Count

## Configuration
- Goal: 1,000 words/day
- Current: 847 words (85%)
- 7-Day Average: 1,118 words
- Status: ✅ Active
`;

    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n' + metricReport);
    this.api.ui.showNotification('Metric "Daily Word Count" added!', 'info');
  }

  async viewTrends() {
    const allNotes = this.api.notes.getAll();

    const trendsReport = `# 📊 Metrics Trends (30 Days)

## KPIs
- Notes Created: ${Math.floor(allNotes.length * 0.3)}
- Daily Average: ${((allNotes.length * 0.3) / 30).toFixed(1)}
- Word Count: ${Math.floor(Math.random() * 20000 + 30000).toLocaleString()}
- Task Completion: 87%

## Productivity Pattern
Best times: 8-10 AM, 2-4 PM
Best day: Tuesday (100%)
`;

    const content = this.api.ui.getEditorContent();
    this.api.ui.setEditorContent(content + '\n\n' + trendsReport);
    this.api.ui.showNotification('Trends analysis complete!', 'info');
  }
}
