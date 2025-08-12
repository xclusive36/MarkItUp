import { PluginManifest, PluginSetting } from '../lib/types';

// Security & Privacy Tools Plugin Collection
// Data protection, encryption, and privacy management tools

export const encryptionPlugin: PluginManifest = {
  id: 'encryption-manager',
  name: 'Encryption Manager',
  description: 'Encrypt and decrypt sensitive notes and data',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'encryption-manager.js',
  permissions: [
    { type: 'file-system', description: 'Encrypt and decrypt files' },
    { type: 'clipboard', description: 'Handle encrypted content' }
  ],
  commands: [
    {
      id: 'encrypt-note',
      name: 'Encrypt Note',
      description: 'Encrypt sensitive note content',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'encryptionLevel', name: 'Encryption Level', type: 'select', default: 'AES-256', description: 'Encryption algorithm', options: [
      { label: 'AES-256', value: 'AES-256' },
      { label: 'AES-128', value: 'AES-128' }
    ]}
  ] as PluginSetting[]
};

export const passwordManagerPlugin: PluginManifest = {
  id: 'password-manager',
  name: 'Password Manager',
  description: 'Secure password storage and generation',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'password-manager.js',
  permissions: [
    { type: 'file-system', description: 'Store encrypted passwords' },
    { type: 'clipboard', description: 'Copy passwords securely' }
  ],
  commands: [
    {
      id: 'generate-password',
      name: 'Generate Password',
      description: 'Generate secure passwords',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'passwordLength', name: 'Password Length', type: 'number', default: 16, description: 'Default password length' }
  ] as PluginSetting[]
};

export const privacyAuditPlugin: PluginManifest = {
  id: 'privacy-audit',
  name: 'Privacy Audit',
  description: 'Audit notes for sensitive information and privacy compliance',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'privacy-audit.js',
  permissions: [
    { type: 'file-system', description: 'Scan files for sensitive data' }
  ],
  commands: [
    {
      id: 'scan-privacy',
      name: 'Privacy Scan',
      description: 'Scan for personally identifiable information',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'scanLevel', name: 'Scan Level', type: 'select', default: 'Standard', description: 'Privacy scanning sensitivity', options: [
      { label: 'Basic', value: 'Basic' },
      { label: 'Standard', value: 'Standard' },
      { label: 'Strict', value: 'Strict' }
    ]}
  ] as PluginSetting[]
};

export const secureBackupPlugin: PluginManifest = {
  id: 'secure-backup',
  name: 'Secure Backup',
  description: 'Encrypted backup and recovery system',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'secure-backup.js',
  permissions: [
    { type: 'file-system', description: 'Create and restore backups' },
    { type: 'network', description: 'Upload to secure cloud storage' }
  ],
  commands: [
    {
      id: 'create-backup',
      name: 'Create Backup',
      description: 'Create encrypted backup',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'backupFrequency', name: 'Backup Frequency', type: 'select', default: 'Daily', description: 'Automatic backup schedule', options: [
      { label: 'Hourly', value: 'Hourly' },
      { label: 'Daily', value: 'Daily' },
      { label: 'Weekly', value: 'Weekly' }
    ]}
  ] as PluginSetting[]
};

export const accessControlPlugin: PluginManifest = {
  id: 'access-control',
  name: 'Access Control',
  description: 'Manage user permissions and access levels',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'access-control.js',
  permissions: [
    { type: 'file-system', description: 'Manage file permissions' }
  ],
  commands: [
    {
      id: 'set-permissions',
      name: 'Set Permissions',
      description: 'Configure access permissions',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'defaultPermission', name: 'Default Permission', type: 'select', default: 'Read', description: 'Default access level', options: [
      { label: 'Read', value: 'Read' },
      { label: 'Write', value: 'Write' },
      { label: 'Admin', value: 'Admin' }
    ]}
  ] as PluginSetting[]
};
