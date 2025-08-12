import { PluginManifest, PluginSetting } from '../lib/types';

// IoT & Integration Tools Plugin Collection
// Internet of Things, smart devices, and system integration tools

export const iotDeviceManagerPlugin: PluginManifest = {
  id: 'iot-device-manager',
  name: 'IoT Device Manager',
  description: 'Manage and monitor IoT devices and sensors',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'iot-device-manager.js',
  permissions: [
    { type: 'network', description: 'Connect to IoT devices' },
    { type: 'file-system', description: 'Store device configurations' }
  ],
  commands: [
    {
      id: 'connect-device',
      name: 'Connect Device',
      description: 'Connect to IoT device',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'iotProtocol', name: 'IoT Protocol', type: 'select', default: 'MQTT', description: 'IoT communication protocol', options: [
      { label: 'MQTT', value: 'MQTT' },
      { label: 'CoAP', value: 'CoAP' },
      { label: 'HTTP', value: 'HTTP' }
    ]}
  ] as PluginSetting[]
};

export const smartHomeIntegrationPlugin: PluginManifest = {
  id: 'smart-home-integration',
  name: 'Smart Home Integration',
  description: 'Integrate with smart home systems and automation',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'smart-home-integration.js',
  permissions: [
    { type: 'network', description: 'Connect to smart home hubs' }
  ],
  commands: [
    {
      id: 'control-home',
      name: 'Control Home',
      description: 'Control smart home devices',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'homeSystem', name: 'Home System', type: 'select', default: 'HomeKit', description: 'Smart home platform', options: [
      { label: 'HomeKit', value: 'HomeKit' },
      { label: 'Alexa', value: 'Alexa' },
      { label: 'Google Home', value: 'Google Home' }
    ]}
  ] as PluginSetting[]
};

export const apiIntegratorPlugin: PluginManifest = {
  id: 'api-integrator',
  name: 'API Integrator',
  description: 'Connect to external APIs and web services',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'api-integrator.js',
  permissions: [
    { type: 'network', description: 'Make API calls to external services' },
    { type: 'file-system', description: 'Cache API responses' }
  ],
  commands: [
    {
      id: 'call-api',
      name: 'Call API',
      description: 'Make external API call',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'apiTimeout', name: 'API Timeout', type: 'number', default: 30, description: 'API request timeout in seconds' }
  ] as PluginSetting[]
};

export const cloudSyncPlugin: PluginManifest = {
  id: 'cloud-sync',
  name: 'Cloud Sync',
  description: 'Synchronize data across multiple cloud platforms',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'cloud-sync.js',
  permissions: [
    { type: 'network', description: 'Connect to cloud storage services' },
    { type: 'file-system', description: 'Sync local and cloud files' }
  ],
  commands: [
    {
      id: 'sync-cloud',
      name: 'Sync Cloud',
      description: 'Synchronize with cloud storage',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'cloudProvider', name: 'Cloud Provider', type: 'select', default: 'Multiple', description: 'Primary cloud service', options: [
      { label: 'Google Drive', value: 'Google Drive' },
      { label: 'Dropbox', value: 'Dropbox' },
      { label: 'OneDrive', value: 'OneDrive' },
      { label: 'Multiple', value: 'Multiple' }
    ]}
  ] as PluginSetting[]
};

export const webhookManagerPlugin: PluginManifest = {
  id: 'webhook-manager',
  name: 'Webhook Manager',
  description: 'Manage webhooks and real-time integrations',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'webhook-manager.js',
  permissions: [
    { type: 'network', description: 'Handle incoming and outgoing webhooks' },
    { type: 'file-system', description: 'Log webhook events' }
  ],
  commands: [
    {
      id: 'setup-webhook',
      name: 'Setup Webhook',
      description: 'Configure webhook endpoints',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'webhookPort', name: 'Webhook Port', type: 'number', default: 3001, description: 'Port for webhook listener' }
  ] as PluginSetting[]
};
