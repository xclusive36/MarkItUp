import { PluginManifest, PluginSetting } from '../lib/types';

// Media & Publishing Tools Plugin Collection
// Content creation, publishing, and multimedia tools

export const contentPublisherPlugin: PluginManifest = {
  id: 'content-publisher',
  name: 'Content Publisher',
  description: 'Multi-platform content publishing and distribution',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'content-publisher.js',
  permissions: [
    { type: 'network', description: 'Publish to external platforms' },
    { type: 'file-system', description: 'Access content files' }
  ],
  commands: [
    {
      id: 'publish-content',
      name: 'Publish Content',
      description: 'Publish to multiple platforms',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'defaultPlatform', name: 'Default Platform', type: 'select', default: 'Blog', description: 'Default publishing platform', options: [
      { label: 'Blog', value: 'Blog' },
      { label: 'Medium', value: 'Medium' },
      { label: 'LinkedIn', value: 'LinkedIn' }
    ]}
  ] as PluginSetting[]
};

export const mediaManagerPlugin: PluginManifest = {
  id: 'media-manager',
  name: 'Media Manager',
  description: 'Manage images, videos, and multimedia content',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'media-manager.js',
  permissions: [
    { type: 'file-system', description: 'Access and organize media files' },
    { type: 'clipboard', description: 'Copy media references' }
  ],
  commands: [
    {
      id: 'insert-media',
      name: 'Insert Media',
      description: 'Insert multimedia content',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'imageQuality', name: 'Image Quality', type: 'select', default: 'High', description: 'Default image quality', options: [
      { label: 'High', value: 'High' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Low', value: 'Low' }
    ]}
  ] as PluginSetting[]
};

export const seoOptimizerPlugin: PluginManifest = {
  id: 'seo-optimizer',
  name: 'SEO Optimizer',
  description: 'Search engine optimization and content analysis',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'seo-optimizer.js',
  permissions: [
    { type: 'network', description: 'Check SEO metrics online' },
    { type: 'file-system', description: 'Save SEO reports' }
  ],
  commands: [
    {
      id: 'analyze-seo',
      name: 'Analyze SEO',
      description: 'Analyze content for SEO optimization',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'targetKeywords', name: 'Target Keywords', type: 'number', default: 5, description: 'Number of target keywords' }
  ] as PluginSetting[]
};

export const emailNewsletterPlugin: PluginManifest = {
  id: 'email-newsletter',
  name: 'Email Newsletter',
  description: 'Create and manage email newsletters and campaigns',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'email-newsletter.js',
  permissions: [
    { type: 'network', description: 'Send emails and access email services' },
    { type: 'file-system', description: 'Save newsletter templates' }
  ],
  commands: [
    {
      id: 'create-newsletter',
      name: 'Create Newsletter',
      description: 'Create email newsletter template',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'emailProvider', name: 'Email Provider', type: 'select', default: 'Mailchimp', description: 'Email service provider', options: [
      { label: 'Mailchimp', value: 'Mailchimp' },
      { label: 'ConvertKit', value: 'ConvertKit' },
      { label: 'SendGrid', value: 'SendGrid' }
    ]}
  ] as PluginSetting[]
};

export const socialMediaPlugin: PluginManifest = {
  id: 'social-media',
  name: 'Social Media Manager',
  description: 'Manage and schedule social media content',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'social-media.js',
  permissions: [
    { type: 'network', description: 'Post to social media platforms' },
    { type: 'clipboard', description: 'Copy social media content' }
  ],
  commands: [
    {
      id: 'schedule-post',
      name: 'Schedule Post',
      description: 'Schedule social media posts',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'defaultPlatforms', name: 'Default Platforms', type: 'select', default: 'Twitter', description: 'Primary social platforms', options: [
      { label: 'Twitter', value: 'Twitter' },
      { label: 'LinkedIn', value: 'LinkedIn' },
      { label: 'Facebook', value: 'Facebook' }
    ]}
  ] as PluginSetting[]
};
