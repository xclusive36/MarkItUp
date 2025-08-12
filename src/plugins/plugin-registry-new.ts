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
  aiWritingPlugin
];

// Plugin Categories - Organized by user type and functionality
export const PLUGIN_CATEGORIES = {
  '🌟 Core Features': [enhancedWordCountPlugin, newDailyNotesPlugin, tableOfContentsPlugin, linkCheckerPlugin],
  '📋 Organization': [taskManagerPlugin, projectTrackerPlugin, meetingNotesPlugin, fileOrganizerPlugin],
  '📝 Blogging': [seoOptimizerPlugin, blogTemplatePlugin, socialMediaSchedulerPlugin, analyticsTrackerPlugin],
  '📖 Personal & Diary': [moodTrackerPlugin, habitTrackerPlugin, memoryKeeperPlugin, goalTrackerPlugin],
  '🎓 Academic & Research': [citationManagerPlugin, researchPaperPlugin, noteTakingSystemPlugin, pdfAnnotatorPlugin, literatureReviewPlugin],
  '💼 Business & Professional': [crmLitePlugin, invoiceGeneratorPlugin, expenseTrackerPlugin, contractTemplatesPlugin, businessPlanPlugin, timeTrackerPlugin],
  '🎨 Creative & Content': [storyPlannerPlugin, screenplayFormatPlugin, poetryToolsPlugin, contentCalendarPlugin],
  '🏃‍♂️ Health & Wellness': [fitnessTrackerPlugin, nutritionDiaryPlugin, sleepTrackerPlugin, mentalHealthJournalPlugin],
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
  
  // Popular for academic users
  citationManagerPlugin,
  researchPaperPlugin,
  
  // Popular for business users
  crmLitePlugin,
  timeTrackerPlugin,
  
  // Popular for content creators
  storyPlannerPlugin,
  contentCalendarPlugin,
  
  // Popular for health & wellness
  fitnessTrackerPlugin,
  mentalHealthJournalPlugin,
  
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
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/enhanced-word-count-1.png'],
    tags: ['statistics', 'productivity', 'writing', 'analytics', 'enhanced'],
    userTypes: ['writers', 'bloggers', 'students']
  },
  
  [newDailyNotesPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 2200,
    rating: 4.8,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/daily-notes-auto-1.png'],
    tags: ['daily', 'journaling', 'templates', 'automation', 'calendar'],
    userTypes: ['diary-users', 'journalers', 'planners']
  },
  
  [tableOfContentsPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 1900,
    rating: 4.7,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/toc-auto-1.png'],
    tags: ['navigation', 'organization', 'headings', 'auto-generation', 'outline'],
    userTypes: ['writers', 'bloggers', 'researchers']
  },
  
  [linkCheckerPlugin.id]: {
    category: '🌟 Core Features',
    featured: true,
    downloadCount: 1600,
    rating: 4.6,
    lastUpdated: '2025-01-19',
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
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/task-manager-1.png'],
    tags: ['tasks', 'productivity', 'organization', 'deadlines', 'priorities'],
    userTypes: ['professionals', 'students', 'project-managers']
  },
  
  [projectTrackerPlugin.id]: {
    category: '📋 Organization',
    featured: true,
    downloadCount: 1400,
    rating: 4.7,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/project-tracker-1.png'],
    tags: ['projects', 'milestones', 'tracking', 'gantt', 'deadlines'],
    userTypes: ['project-managers', 'freelancers', 'teams']
  },

  // 🎓 ACADEMIC & RESEARCH
  [citationManagerPlugin.id]: {
    category: '🎓 Academic & Research',
    featured: true,
    downloadCount: 950,
    rating: 4.9,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/citation-manager-1.png'],
    tags: ['citations', 'research', 'bibliography', 'APA', 'MLA', 'Chicago'],
    userTypes: ['students', 'researchers', 'academics', 'faculty']
  },
  
  [researchPaperPlugin.id]: {
    category: '🎓 Academic & Research',
    featured: true,
    downloadCount: 820,
    rating: 4.8,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/research-paper-1.png'],
    tags: ['academic-writing', 'research', 'templates', 'structure', 'formatting'],
    userTypes: ['students', 'researchers', 'academics']
  },

  // 💼 BUSINESS & PROFESSIONAL
  [crmLitePlugin.id]: {
    category: '💼 Business & Professional',
    featured: true,
    downloadCount: 750,
    rating: 4.7,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/crm-lite-1.png'],
    tags: ['crm', 'contacts', 'business', 'relationships', 'tracking'],
    userTypes: ['freelancers', 'consultants', 'business-owners', 'sales']
  },
  
  [timeTrackerPlugin.id]: {
    category: '💼 Business & Professional',
    featured: true,
    downloadCount: 680,
    rating: 4.6,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/time-tracker-1.png'],
    tags: ['time-tracking', 'productivity', 'pomodoro', 'billing', 'project-time'],
    userTypes: ['freelancers', 'consultants', 'professionals', 'students']
  },

  // 🎨 CREATIVE & CONTENT
  [storyPlannerPlugin.id]: {
    category: '🎨 Creative & Content',
    featured: true,
    downloadCount: 650,
    rating: 4.8,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/story-planner-1.png'],
    tags: ['creative-writing', 'storytelling', 'characters', 'plot', 'world-building'],
    userTypes: ['writers', 'novelists', 'screenwriters', 'content-creators']
  },
  
  [contentCalendarPlugin.id]: {
    category: '🎨 Creative & Content',
    featured: true,
    downloadCount: 590,
    rating: 4.7,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/content-calendar-1.png'],
    tags: ['content-planning', 'editorial-calendar', 'scheduling', 'social-media', 'blogging'],
    userTypes: ['bloggers', 'content-creators', 'marketers', 'social-media-managers']
  },

  // 🏃‍♂️ HEALTH & WELLNESS
  [fitnessTrackerPlugin.id]: {
    category: '🏃‍♂️ Health & Wellness',
    featured: true,
    downloadCount: 520,
    rating: 4.6,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/fitness-tracker-1.png'],
    tags: ['fitness', 'workouts', 'exercise', 'health', 'tracking', 'wellness'],
    userTypes: ['fitness-enthusiasts', 'health-conscious', 'athletes', 'personal-trainers']
  },
  
  [mentalHealthJournalPlugin.id]: {
    category: '🏃‍♂️ Health & Wellness',
    featured: true,
    downloadCount: 480,
    rating: 4.8,
    lastUpdated: '2025-01-19',
    screenshots: ['/plugins/mental-health-1.png'],
    tags: ['mental-health', 'mood-tracking', 'wellness', 'self-care', 'mindfulness'],
    userTypes: ['wellness-focused', 'mental-health-aware', 'journalers', 'self-improvement']
  }
};

// User type recommendations - Curated plugin lists for different user personas
export const USER_TYPE_RECOMMENDATIONS = {
  'students': [
    enhancedWordCountPlugin,
    citationManagerPlugin,
    researchPaperPlugin,
    noteTakingSystemPlugin,
    taskManagerPlugin,
    timeTrackerPlugin,
    goalTrackerPlugin
  ],
  'researchers': [
    citationManagerPlugin,
    researchPaperPlugin,
    literatureReviewPlugin,
    pdfAnnotatorPlugin,
    linkCheckerPlugin,
    tableOfContentsPlugin,
    fileOrganizerPlugin
  ],
  'bloggers': [
    seoOptimizerPlugin,
    blogTemplatePlugin,
    contentCalendarPlugin,
    analyticsTrackerPlugin,
    socialMediaSchedulerPlugin,
    enhancedWordCountPlugin,
    linkCheckerPlugin
  ],
  'business-professionals': [
    crmLitePlugin,
    timeTrackerPlugin,
    invoiceGeneratorPlugin,
    expenseTrackerPlugin,
    contractTemplatesPlugin,
    businessPlanPlugin,
    meetingNotesPlugin
  ],
  'writers': [
    storyPlannerPlugin,
    screenplayFormatPlugin,
    poetryToolsPlugin,
    enhancedWordCountPlugin,
    tableOfContentsPlugin,
    goalTrackerPlugin,
    fileOrganizerPlugin
  ],
  'diary-users': [
    newDailyNotesPlugin,
    moodTrackerPlugin,
    habitTrackerPlugin,
    memoryKeeperPlugin,
    mentalHealthJournalPlugin,
    goalTrackerPlugin,
    fitnessTrackerPlugin
  ]
};

// Plugin statistics and analytics
export const PLUGIN_STATS = {
  totalPlugins: AVAILABLE_PLUGINS.length,
  totalCategories: Object.keys(PLUGIN_CATEGORIES).length,
  averageRating: 4.7,
  totalDownloads: Object.values(PLUGIN_METADATA).reduce((sum, plugin) => sum + (plugin.downloadCount || 0), 0),
  mostPopularCategory: '🌟 Core Features',
  newestPlugins: [
    citationManagerPlugin.id,
    crmLitePlugin.id,
    storyPlannerPlugin.id,
    fitnessTrackerPlugin.id
  ]
};
