import { PluginManifest } from '../lib/types';

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
      description: 'Read note content to extract table data'
    }
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
        { label: 'Scatter Plot', value: 'scatter' }
      ],
      default: 'bar',
      description: 'Default chart type for new visualizations'
    },
    {
      id: 'chartTheme',
      name: 'Chart Theme',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' }
      ],
      default: 'auto',
      description: 'Visual theme for charts'
    }
  ],

  commands: [
    {
      id: 'create-chart',
      name: 'Create Chart from Table',
      description: 'Convert selected table to interactive chart',
      callback: async () => {
        const chartType = prompt('Chart type (bar/line/pie/scatter):') || 'bar';
        console.log(`Creating ${chartType} chart from table data`);
      }
    },
    {
      id: 'export-chart',
      name: 'Export Chart',
      description: 'Export chart as image or data',
      callback: async () => {
        const format = prompt('Export format (png/svg/json):') || 'png';
        console.log(`Exporting chart as ${format}`);
      }
    }
  ],

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
      }
    }
  ]
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
      description: 'Read and write dashboard configurations'
    }
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
        { label: '1 hour', value: '3600' }
      ],
      default: '300',
      description: 'How often to refresh dashboard data'
    }
  ],

  commands: [
    {
      id: 'create-dashboard',
      name: 'Create Dashboard',
      description: 'Create a new dashboard',
      callback: async () => {
        const name = prompt('Dashboard name:');
        if (name) {
          console.log(`Creating dashboard: ${name}`);
        }
      }
    },
    {
      id: 'add-widget',
      name: 'Add Widget',
      description: 'Add widget to current dashboard',
      callback: async () => {
        console.log('Adding new widget to dashboard');
      }
    }
  ],

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
      }
    }
  ]
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
      description: 'Read notes and generate reports'
    }
  ],

  settings: [
    {
      id: 'reportFormat',
      name: 'Default Report Format',
      type: 'select',
      options: [
        { label: 'Markdown', value: 'md' },
        { label: 'HTML', value: 'html' },
        { label: 'PDF', value: 'pdf' }
      ],
      default: 'md',
      description: 'Default format for generated reports'
    }
  ],

  commands: [
    {
      id: 'generate-report',
      name: 'Generate Report',
      description: 'Generate report from selected notes',
      callback: async () => {
        const reportType = prompt('Report type (weekly/monthly/custom):') || 'weekly';
        console.log(`Generating ${reportType} report`);
      }
    },
    {
      id: 'schedule-report',
      name: 'Schedule Report',
      description: 'Schedule automatic report generation',
      callback: async () => {
        console.log('Scheduling automatic report generation');
      }
    }
  ],

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
      }
    }
  ]
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
      description: 'Read import files and create markdown notes'
    }
  ],

  settings: [
    {
      id: 'autoCreateNotes',
      name: 'Auto-create Notes',
      type: 'boolean',
      default: true,
      description: 'Automatically create individual notes for each data row'
    }
  ],

  commands: [
    {
      id: 'import-csv',
      name: 'Import CSV',
      description: 'Import data from CSV file',
      callback: async () => {
        console.log('Importing CSV data');
      }
    },
    {
      id: 'import-json',
      name: 'Import JSON',
      description: 'Import data from JSON file',
      callback: async () => {
        console.log('Importing JSON data');
      }
    }
  ]
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
      description: 'Store and read metrics data'
    }
  ],

  settings: [
    {
      id: 'trackingFrequency',
      name: 'Tracking Frequency',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
      ],
      default: 'daily',
      description: 'How often to track metrics'
    }
  ],

  commands: [
    {
      id: 'add-metric',
      name: 'Add Metric',
      description: 'Add new metric to track',
      callback: async () => {
        const metric = prompt('Metric name:');
        const value = prompt('Current value:');
        if (metric && value) {
          console.log(`Adding metric: ${metric} = ${value}`);
        }
      }
    },
    {
      id: 'view-trends',
      name: 'View Trends',
      description: 'View metric trends and analytics',
      callback: async () => {
        console.log('Viewing metric trends');
      }
    }
  ],

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
      }
    }
  ]
};
