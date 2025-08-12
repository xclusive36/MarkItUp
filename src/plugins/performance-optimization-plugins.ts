import { PluginManifest, PluginSetting } from '../lib/types';

// Performance & Optimization Tools Plugin Collection
// System optimization, performance monitoring, and efficiency tools

export const performanceMonitorPlugin: PluginManifest = {
  id: 'performance-monitor',
  name: 'Performance Monitor',
  description: 'Monitor system performance and resource usage',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'performance-monitor.js',
  permissions: [
    { type: 'file-system', description: 'Log performance metrics' }
  ],
  commands: [
    {
      id: 'show-metrics',
      name: 'Show Metrics',
      description: 'Display performance metrics',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'monitoringInterval', name: 'Monitoring Interval', type: 'number', default: 30, description: 'Monitoring interval in seconds' }
  ] as PluginSetting[]
};

export const cacheManagerPlugin: PluginManifest = {
  id: 'cache-manager',
  name: 'Cache Manager',
  description: 'Intelligent caching and memory optimization',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'cache-manager.js',
  permissions: [
    { type: 'file-system', description: 'Manage cache files' }
  ],
  commands: [
    {
      id: 'clear-cache',
      name: 'Clear Cache',
      description: 'Clear system cache',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'cacheSize', name: 'Cache Size', type: 'number', default: 100, description: 'Maximum cache size in MB' }
  ] as PluginSetting[]
};

export const indexOptimizerPlugin: PluginManifest = {
  id: 'index-optimizer',
  name: 'Index Optimizer',
  description: 'Optimize search indices and database performance',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'index-optimizer.js',
  permissions: [
    { type: 'file-system', description: 'Rebuild search indices' }
  ],
  commands: [
    {
      id: 'rebuild-index',
      name: 'Rebuild Index',
      description: 'Rebuild search index',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'indexingMode', name: 'Indexing Mode', type: 'select', default: 'Incremental', description: 'Index update strategy', options: [
      { label: 'Full', value: 'Full' },
      { label: 'Incremental', value: 'Incremental' }
    ]}
  ] as PluginSetting[]
};

export const memoryOptimizerPlugin: PluginManifest = {
  id: 'memory-optimizer',
  name: 'Memory Optimizer',
  description: 'Optimize memory usage and prevent memory leaks',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'memory-optimizer.js',
  permissions: [
    { type: 'file-system', description: 'Log memory usage' }
  ],
  commands: [
    {
      id: 'optimize-memory',
      name: 'Optimize Memory',
      description: 'Run memory optimization',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'autoOptimize', name: 'Auto Optimize', type: 'boolean', default: true, description: 'Enable automatic memory optimization' }
  ] as PluginSetting[]
};

export const loadBalancerPlugin: PluginManifest = {
  id: 'load-balancer',
  name: 'Load Balancer',
  description: 'Balance processing load across multiple threads',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'load-balancer.js',
  permissions: [
    { type: 'file-system', description: 'Manage processing queues' }
  ],
  commands: [
    {
      id: 'balance-load',
      name: 'Balance Load',
      description: 'Redistribute processing load',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'maxThreads', name: 'Max Threads', type: 'number', default: 4, description: 'Maximum number of processing threads' }
  ] as PluginSetting[]
};
