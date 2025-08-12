// Import our new sample plugins (the main ones we created)
import { enhancedWordCountPlugin } from './enhanced-word-count';
import { dailyNotesPlugin as newDailyNotesPlugin } from './daily-notes';
import { tableOfContentsPlugin } from './table-of-contents';
import { linkCheckerPlugin } from './link-checker';

// Import the new batch of plugins
import { taskManagerPlugin } from './task-manager';
import { moodTrackerPlugin, habitTrackerPlugin, seoOptimizerPlugin } from './diary-blogger-plugins';
import { projectTrackerPlugin, meetingNotesPlugin, blogTemplatePlugin, memoryKeeperPlugin } from './organization-plugins';
import { goalTrackerPlugin, socialMediaSchedulerPlugin, fileOrganizerPlugin, analyticsTrackerPlugin } from './additional-plugins';

// Import new category plugins
import { citationManagerPlugin, researchPaperPlugin, noteTakingSystemPlugin, pdfAnnotatorPlugin, literatureReviewPlugin } from './academic-research-plugins';
import { crmLitePlugin, invoiceGeneratorPlugin, expenseTrackerPlugin, contractTemplatesPlugin, businessPlanPlugin, timeTrackerPlugin } from './business-professional-plugins';
import { storyPlannerPlugin, screenplayFormatPlugin, poetryToolsPlugin, contentCalendarPlugin } from './creative-content-plugins';
import { fitnessTrackerPlugin, nutritionDiaryPlugin, sleepTrackerPlugin, mentalHealthJournalPlugin } from './health-wellness-plugins';

// Import a few key example plugins for demonstration
import { 
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin
} from './example-plugins';

// Plugin Registry - Comprehensive collection for all user types
export const AVAILABLE_PLUGINS = [
  // ✨ CORE SAMPLE PLUGINS (The original 4)
  enhancedWordCountPlugin,
  newDailyNotesPlugin,
  tableOfContentsPlugin,
  linkCheckerPlugin,
  
  // 📋 ORGANIZATION PLUGINS
  taskManagerPlugin,
  projectTrackerPlugin,
  meetingNotesPlugin,
  fileOrganizerPlugin,
  
  // 📝 BLOGGING PLUGINS
  seoOptimizerPlugin,
  blogTemplatePlugin,
  socialMediaSchedulerPlugin,
  analyticsTrackerPlugin,
  
  // 📖 DIARY & PERSONAL PLUGINS
  moodTrackerPlugin,
  habitTrackerPlugin,
  memoryKeeperPlugin,
  goalTrackerPlugin,
  
  // 🎓 ACADEMIC & RESEARCH PLUGINS
  citationManagerPlugin,
  researchPaperPlugin,
  noteTakingSystemPlugin,
  pdfAnnotatorPlugin,
  literatureReviewPlugin,
  
  // 💼 BUSINESS & PROFESSIONAL PLUGINS
  crmLitePlugin,
  invoiceGeneratorPlugin,
  expenseTrackerPlugin,
  contractTemplatesPlugin,
  businessPlanPlugin,
  timeTrackerPlugin,
  
  // 🎨 CREATIVE & CONTENT PLUGINS
  storyPlannerPlugin,
  screenplayFormatPlugin,
  poetryToolsPlugin,
  contentCalendarPlugin,
  
  // 🏃‍♂️ HEALTH & WELLNESS PLUGINS
  fitnessTrackerPlugin,
  nutritionDiaryPlugin,
  sleepTrackerPlugin,
  mentalHealthJournalPlugin,
  
  // 📚 EXAMPLE PLUGINS (Selected demos)
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin,
  
  // ✨ CORE SAMPLE PLUGINS (The original 4)
  enhancedWordCountPlugin,
  newDailyNotesPlugin,
  tableOfContentsPlugin,
  linkCheckerPlugin,
  
  // � ORGANIZATION PLUGINS
  taskManagerPlugin,
  projectTrackerPlugin,
  meetingNotesPlugin,
  fileOrganizerPlugin,
  
  // 📝 BLOGGING PLUGINS
  seoOptimizerPlugin,
  blogTemplatePlugin,
  socialMediaSchedulerPlugin,
  analyticsTrackerPlugin,
  
  // 📖 DIARY & PERSONAL PLUGINS
  moodTrackerPlugin,
  habitTrackerPlugin,
  memoryKeeperPlugin,
  goalTrackerPlugin,
  
  // �📚 EXAMPLE PLUGINS (Selected demos)
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin
];

// Plugin Categories - Organized by user type and functionality
export const PLUGIN_CATEGORIES = {
  '🌟 Core Features': [enhancedWordCountPlugin, newDailyNotesPlugin, tableOfContentsPlugin, linkCheckerPlugin],
  '� Organization': [taskManagerPlugin, projectTrackerPlugin, meetingNotesPlugin, fileOrganizerPlugin],
  '📝 Blogging': [seoOptimizerPlugin, blogTemplatePlugin, socialMediaSchedulerPlugin, analyticsTrackerPlugin],
  '📖 Personal & Diary': [moodTrackerPlugin, habitTrackerPlugin, memoryKeeperPlugin, goalTrackerPlugin],
  '📚 Examples': [wordCountPlugin, markdownExportPlugin, darkThemePlugin, aiWritingPlugin]
};

// Featured Plugins - Highlight the most useful ones for different user types
export const FEATURED_PLUGINS = [
  // Core functionality
  enhancedWordCountPlugin,
  newDailyNotesPlugin,
  tableOfContentsPlugin,
  linkCheckerPlugin,
  
  // Popular for organization
  taskManagerPlugin,
  projectTrackerPlugin,
  
  // Popular for bloggers
  seoOptimizerPlugin,
  blogTemplatePlugin,
  
  // Popular for diary users
  moodTrackerPlugin,
  habitTrackerPlugin,
  
  // Popular utilities
  fileOrganizerPlugin,
  goalTrackerPlugin
];

// Plugin metadata for the store - Comprehensive metadata for all plugins
export const PLUGIN_METADATA = {
  // 🌟 CORE FEATURES
  [enhancedWordCountPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 2500,
    rating: 4.9,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/enhanced-word-count-1.png'],
    tags: ['statistics', 'productivity', 'writing', 'analytics', 'enhanced'],
    userTypes: ['writers', 'bloggers', 'students']
  },
  [newDailyNotesPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 2200,
    rating: 4.8,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/daily-notes-auto-1.png'],
    tags: ['daily', 'journaling', 'templates', 'automation', 'calendar'],
    userTypes: ['diary-users', 'journalers', 'planners']
  },
  [tableOfContentsPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 1900,
    rating: 4.7,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/toc-auto-1.png'],
    tags: ['navigation', 'organization', 'headings', 'auto-generation', 'outline'],
    userTypes: ['writers', 'bloggers', 'researchers']
  },
  [linkCheckerPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 1600,
    rating: 4.6,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/link-checker-1.png'],
    tags: ['links', 'validation', 'monitoring', 'broken-links', 'health'],
    userTypes: ['bloggers', 'content-creators', 'researchers']
  },

  // 📋 ORGANIZATION
  [taskManagerPlugin.id]: {
    category: '📋 Organization',
    featured: true,
    downloadCount: 1800,
    rating: 4.8,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/task-manager-1.png'],
    tags: ['tasks', 'productivity', 'organization', 'deadlines', 'priorities'],
    userTypes: ['professionals', 'students', 'project-managers']
  },
  [projectTrackerPlugin.id]: {
    category: '📋 Organization',
    featured: true,
    downloadCount: 1400,
    rating: 4.7,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/project-tracker-1.png'],
    tags: ['projects', 'milestones', 'tracking', 'gantt', 'deadlines'],
    userTypes: ['project-managers', 'freelancers', 'teams']
  },
  [meetingNotesPlugin.id]: {
    category: '📋 Organization',
    featured: false,
    downloadCount: 1200,
    rating: 4.6,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/meeting-notes-1.png'],
    tags: ['meetings', 'notes', 'action-items', 'team', 'structure'],
    userTypes: ['professionals', 'managers', 'teams']
  },
  [fileOrganizerPlugin.id]: {
    category: '📋 Organization',
    featured: true,
    downloadCount: 1100,
    rating: 4.5,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/file-organizer-1.png'],
    tags: ['organization', 'auto-tag', 'categorization', 'cleanup', 'structure'],
    userTypes: ['everyone', 'researchers', 'writers']
  },

  // 📝 BLOGGING
  [seoOptimizerPlugin.id]: {
    category: '📝 Blogging',
    featured: true,
    downloadCount: 2100,
    rating: 4.9,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/seo-optimizer-1.png'],
    tags: ['seo', 'optimization', 'keywords', 'search', 'ranking'],
    userTypes: ['bloggers', 'content-creators', 'marketers']
  },
  [blogTemplatePlugin.id]: {
    category: '📝 Blogging',
    featured: true,
    downloadCount: 1700,
    rating: 4.7,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/blog-template-1.png'],
    tags: ['templates', 'blogging', 'structure', 'seo', 'writing'],
    userTypes: ['bloggers', 'content-creators', 'writers']
  },
  [socialMediaSchedulerPlugin.id]: {
    category: '📝 Blogging',
    featured: false,
    downloadCount: 1300,
    rating: 4.6,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/social-scheduler-1.png'],
    tags: ['social-media', 'scheduling', 'marketing', 'automation', 'promotion'],
    userTypes: ['bloggers', 'influencers', 'marketers']
  },
  [analyticsTrackerPlugin.id]: {
    category: '📝 Blogging',
    featured: false,
    downloadCount: 980,
    rating: 4.4,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/analytics-1.png'],
    tags: ['analytics', 'metrics', 'performance', 'tracking', 'insights'],
    userTypes: ['bloggers', 'content-creators', 'marketers']
  },

  // 📖 PERSONAL & DIARY
  [moodTrackerPlugin.id]: {
    category: '📖 Personal & Diary',
    featured: true,
    downloadCount: 1500,
    rating: 4.8,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/mood-tracker-1.png'],
    tags: ['mood', 'emotions', 'mental-health', 'tracking', 'wellness'],
    userTypes: ['diary-users', 'wellness-enthusiasts', 'mental-health']
  },
  [habitTrackerPlugin.id]: {
    category: '📖 Personal & Diary',
    featured: true,
    downloadCount: 1400,
    rating: 4.7,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/habit-tracker-1.png'],
    tags: ['habits', 'streaks', 'self-improvement', 'goals', 'tracking'],
    userTypes: ['self-improvement', 'goal-setters', 'productivity-enthusiasts']
  },
  [memoryKeeperPlugin.id]: {
    category: '📖 Personal & Diary',
    featured: false,
    downloadCount: 890,
    rating: 4.6,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/memory-keeper-1.png'],
    tags: ['memories', 'photos', 'reflections', 'personal', 'nostalgia'],
    userTypes: ['diary-users', 'memory-keepers', 'families']
  },
  [goalTrackerPlugin.id]: {
    category: '📖 Personal & Diary',
    featured: true,
    downloadCount: 1600,
    rating: 4.8,
    lastUpdated: '2025-08-11',
    screenshots: ['/plugins/goal-tracker-1.png'],
    tags: ['goals', 'smart-goals', 'achievement', 'motivation', 'progress'],
    userTypes: ['goal-setters', 'self-improvement', 'professionals']
  },

  // 📚 EXAMPLES
  [wordCountPlugin.id]: {
    category: '📚 Examples',
    featured: false,
    downloadCount: 1250,
    rating: 4.5,
    lastUpdated: '2025-01-06',
    screenshots: ['/plugins/word-count-1.png'],
    tags: ['statistics', 'basic', 'counting', 'simple'],
    userTypes: ['writers', 'students']
  },
  [markdownExportPlugin.id]: {
    category: '📚 Examples',
    featured: false,
    downloadCount: 2100,
    rating: 4.9,
    lastUpdated: '2025-01-05',
    screenshots: ['/plugins/export-1.png'],
    tags: ['export', 'pdf', 'sharing', 'conversion'],
    userTypes: ['everyone', 'professionals']
  },
  [darkThemePlugin.id]: {
    category: '📚 Examples',
    featured: false,
    downloadCount: 1200,
    rating: 4.2,
    lastUpdated: '2024-12-28',
    screenshots: ['/plugins/dark-theme-1.png'],
    tags: ['theme', 'dark-mode', 'customization', 'ui'],
    userTypes: ['everyone', 'night-users']
  },
  [aiWritingPlugin.id]: {
    category: '📚 Examples',
    featured: false,
    downloadCount: 890,
    rating: 4.9,
    lastUpdated: '2025-01-07',
    screenshots: ['/plugins/ai-writing-1.png'],
    tags: ['ai', 'writing', 'assistance', 'grammar', 'enhancement'],
    userTypes: ['writers', 'bloggers', 'students']
  }
};

// Plugin search functionality
export function searchPlugins(query: string) {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_PLUGINS.filter(plugin => 
    plugin.name.toLowerCase().includes(lowerQuery) ||
    plugin.description.toLowerCase().includes(lowerQuery) ||
    plugin.author.toLowerCase().includes(lowerQuery) ||
    PLUGIN_METADATA[plugin.id]?.tags.some(tag => tag.includes(lowerQuery))
  );
}

// Get plugins by category
export function getPluginsByCategory(category: keyof typeof PLUGIN_CATEGORIES) {
  return PLUGIN_CATEGORIES[category] || [];
}

// Get plugin details with metadata
export function getPluginDetails(pluginId: string) {
  const plugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
  const metadata = PLUGIN_METADATA[pluginId];
  
  if (!plugin) return null;
  
  return {
    ...plugin,
    metadata
  };
}
