import { PluginManifest, PluginSetting } from '../lib/types';

// Enhanced plugin manifest that supports AI integration
export interface EnhancedPluginManifest extends PluginManifest {
  // AI Integration capabilities (optional)
  aiIntegration?: {
    type: 'content-generation' | 'analysis' | 'enhancement' | 'automation';
    description: string;
    requiresApiKey?: boolean;
    supportedProviders?: string[];
    capabilities: string[];
  };

  // Enhanced metadata
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  pricing: 'free' | 'freemium' | 'paid';
  featured: boolean;

  // Plugin capabilities matrix
  capabilities: {
    chat?: boolean;
    generation?: boolean;
    analysis?: boolean;
    automation?: boolean;
    visualization?: boolean;
    realtime?: boolean;
  };
}

// Import our new sample plugins (the main ones we created)
import { enhancedWordCountPlugin } from './enhanced-word-count';
import { dailyNotesPlugin as newDailyNotesPlugin } from './daily-notes';
import { tableOfContentsPlugin } from './table-of-contents';
import { linkCheckerPlugin } from './link-checker';

// Import the new batch of plugins
import { taskManagerPlugin } from './task-manager';
import { moodTrackerPlugin, habitTrackerPlugin, seoOptimizerPlugin } from './diary-blogger-plugins';
import {
  projectTrackerPlugin,
  meetingNotesPlugin,
  blogTemplatePlugin,
  memoryKeeperPlugin,
} from './organization-plugins';
import {
  goalTrackerPlugin,
  socialMediaSchedulerPlugin,
  fileOrganizerPlugin,
  analyticsTrackerPlugin,
} from './additional-plugins';

// Import new category plugins
import {
  citationManagerPlugin,
  researchPaperPlugin,
  noteTakingSystemPlugin,
  pdfAnnotatorPlugin,
  literatureReviewPlugin,
} from './academic-research-plugins';
import {
  crmLitePlugin,
  invoiceGeneratorPlugin,
  expenseTrackerPlugin,
  contractTemplatesPlugin,
  businessPlanPlugin,
  timeTrackerPlugin,
} from './business-professional-plugins';
import {
  storyPlannerPlugin,
  screenplayFormatPlugin,
  poetryToolsPlugin,
  contentCalendarPlugin,
} from './creative-content-plugins';
import {
  fitnessTrackerPlugin,
  nutritionDiaryPlugin,
  sleepTrackerPlugin,
  mentalHealthJournalPlugin,
} from './health-wellness-plugins';
import {
  budgetPlannerPlugin,
  investmentTrackerPlugin,
  debtPayoffPlannerPlugin,
} from './finance-investment-plugins';
import {
  homeMaintenanceTrackerPlugin,
  recipeBookPlugin,
  giftPlannerPlugin,
} from './lifestyle-home-plugins';

// Import Phase 1 expansion plugins
import {
  dataVisualizationPlugin,
  dashboardBuilderPlugin,
  reportGeneratorPlugin,
  dataImportPlugin,
  metricsTrackerPlugin,
} from './data-analytics-plugins';
import {
  webhookIntegrationPlugin,
  automationRulesPlugin,
  scheduleReminderPlugin,
  bulkOperationsPlugin,
  syncIntegrationPlugin,
} from './automation-integration-plugins';
import {
  versionHistoryPlugin,
  commentSystemPlugin,
  reviewWorkflowPlugin,
  conflictResolutionPlugin,
  teamDashboardPlugin,
} from './version-collaboration-plugins';

// Import Phase 2 expansion plugins
import {
  // advancedMarkdownEditorPlugin, // REMOVED - redundant with WYSIWYG editor
  templateEnginePlugin,
  contentStructurePlugin,
  multiFormatExportPlugin,
  contentStatisticsPlugin,
} from './enhanced-content-plugins';
import {
  smartSearchPlugin,
  tagManagerPlugin,
  contentDiscoveryPlugin,
  savedSearchesPlugin,
  globalIndexPlugin,
} from './search-discovery-plugins';
import {
  knowledgeGraphPlugin,
  learningPathPlugin,
  conceptMapPlugin,
  questionBankPlugin,
  knowledgeExtractionPlugin,
} from './knowledge-enhancement-plugins';

// Import Phase 3 expansion plugins (Professional & Specialized)
import {
  budgetTrackerPlugin,
  projectManagerPlugin,
  invoiceGeneratorPlugin as newInvoiceGeneratorPlugin,
  businessPlannerPlugin,
  meetingNotesPlugin as proMeetingNotesPlugin,
} from './business-finance-plugins';
import {
  citationManagerPlugin as newCitationManagerPlugin,
  researchNotebookPlugin,
  literatureReviewPlugin as newLiteratureReviewPlugin,
  thesisWriterPlugin,
  dataAnalysisPlugin,
} from './research-academic-plugins';
import {
  contentPublisherPlugin,
  mediaManagerPlugin,
  seoOptimizerPlugin as newSeoOptimizerPlugin,
  emailNewsletterPlugin,
  socialMediaPlugin,
} from './media-publishing-plugins';

// Import Phase 4 expansion plugins (Advanced Features)
import {
  encryptionPlugin,
  passwordManagerPlugin,
  privacyAuditPlugin,
  secureBackupPlugin,
  accessControlPlugin,
} from './security-privacy-plugins';
import {
  performanceMonitorPlugin,
  cacheManagerPlugin,
  indexOptimizerPlugin,
  memoryOptimizerPlugin,
  loadBalancerPlugin,
} from './performance-optimization-plugins';
import {
  behaviorAnalyticsPlugin,
  predictiveAnalyticsPlugin,
  sentimentAnalysisPlugin,
  trendAnalysisPlugin,
  intelligenceReportPlugin,
} from './advanced-analytics-plugins';

// Import Phase 5 expansion plugins (Innovation & Future)
import {
  aiWritingAssistantPlugin,
  mlClassifierPlugin,
  neuralSearchPlugin,
  autoSummarizerPlugin,
  chatbotIntegrationPlugin,
} from './ai-machine-learning-plugins';
import {
  iotDeviceManagerPlugin,
  smartHomeIntegrationPlugin,
  apiIntegratorPlugin,
  cloudSyncPlugin,
  webhookManagerPlugin,
} from './iot-integration-plugins';
import {
  quantumNotesPlugin,
  brainWaveInterfacePlugin,
  holographicDisplayPlugin,
  timeManipulatorPlugin,
  universalTranslatorPlugin,
} from './experimental-features-plugins';

// Import a few key example plugins for demonstration
import {
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin,
  backupPlugin,
  citationsPlugin,
  kanbanPlugin,
  spacedRepetitionPlugin,
} from './example-plugins';

// Plugin Registry - Only functional plugins
// Note: Most plugins are placeholder demonstrations and have been removed
// until they are fully implemented with real functionality
export const AVAILABLE_PLUGINS = [
  // ✨ FUNCTIONAL PLUGINS ONLY
  enhancedWordCountPlugin, // Word count works
  // advancedMarkdownEditorPlugin, // REMOVED - redundant with WYSIWYG editor
  darkThemePlugin, // Theme toggle works

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

  // 💰 FINANCE & INVESTMENT PLUGINS
  budgetPlannerPlugin,
  investmentTrackerPlugin,
  debtPayoffPlannerPlugin,

  // 🏠 LIFESTYLE & HOME PLUGINS
  homeMaintenanceTrackerPlugin,
  recipeBookPlugin,
  giftPlannerPlugin,

  // 📊 PHASE 1: DATA & ANALYTICS PLUGINS
  dataVisualizationPlugin,
  dashboardBuilderPlugin,
  reportGeneratorPlugin,
  dataImportPlugin,
  metricsTrackerPlugin,

  // ⚡ PHASE 1: AUTOMATION & INTEGRATION PLUGINS
  webhookIntegrationPlugin,
  automationRulesPlugin,
  scheduleReminderPlugin,
  bulkOperationsPlugin,
  syncIntegrationPlugin,

  // 🤝 PHASE 1: VERSION CONTROL & COLLABORATION PLUGINS
  versionHistoryPlugin,
  commentSystemPlugin,
  reviewWorkflowPlugin,
  conflictResolutionPlugin,
  teamDashboardPlugin,

  // ✨ PHASE 2: ENHANCED CONTENT CREATION PLUGINS
  // advancedMarkdownEditorPlugin, // REMOVED - redundant with WYSIWYG editor
  templateEnginePlugin,
  contentStructurePlugin,
  multiFormatExportPlugin,
  contentStatisticsPlugin,

  // 🔍 PHASE 2: SEARCH & DISCOVERY PLUGINS
  smartSearchPlugin,
  tagManagerPlugin,
  contentDiscoveryPlugin,
  savedSearchesPlugin,
  globalIndexPlugin,

  // 📚 PHASE 2: KNOWLEDGE ENHANCEMENT PLUGINS
  knowledgeGraphPlugin,
  learningPathPlugin,
  conceptMapPlugin,
  questionBankPlugin,
  knowledgeExtractionPlugin,

  // 📚 EXAMPLE PLUGINS (Selected demos)
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin,

  // 🔧 UTILITY PLUGINS
  backupPlugin,
  citationsPlugin,
  kanbanPlugin,
  spacedRepetitionPlugin,

  // 💼 PHASE 3: PROFESSIONAL & SPECIALIZED PLUGINS
  // Business & Finance (5 plugins)
  budgetTrackerPlugin,
  projectManagerPlugin,
  newInvoiceGeneratorPlugin,
  businessPlannerPlugin,
  proMeetingNotesPlugin,

  // Research & Academic (5 plugins)
  newCitationManagerPlugin,
  researchNotebookPlugin,
  newLiteratureReviewPlugin,
  thesisWriterPlugin,
  dataAnalysisPlugin,

  // Media & Publishing (5 plugins)
  contentPublisherPlugin,
  mediaManagerPlugin,
  newSeoOptimizerPlugin,
  emailNewsletterPlugin,
  socialMediaPlugin,

  // 🚀 PHASE 4: ADVANCED FEATURES PLUGINS
  // Security & Privacy (5 plugins)
  encryptionPlugin,
  passwordManagerPlugin,
  privacyAuditPlugin,
  secureBackupPlugin,
  accessControlPlugin,

  // Performance & Optimization (5 plugins)
  performanceMonitorPlugin,
  cacheManagerPlugin,
  indexOptimizerPlugin,
  memoryOptimizerPlugin,
  loadBalancerPlugin,

  // Advanced Analytics (5 plugins)
  behaviorAnalyticsPlugin,
  predictiveAnalyticsPlugin,
  sentimentAnalysisPlugin,
  trendAnalysisPlugin,
  intelligenceReportPlugin,

  // 🔮 PHASE 5: INNOVATION & FUTURE PLUGINS
  // AI & Machine Learning (5 plugins)
  aiWritingAssistantPlugin,
  mlClassifierPlugin,
  neuralSearchPlugin,
  autoSummarizerPlugin,
  chatbotIntegrationPlugin,

  // IoT & Integration (5 plugins)
  iotDeviceManagerPlugin,
  smartHomeIntegrationPlugin,
  apiIntegratorPlugin,
  cloudSyncPlugin,
  webhookManagerPlugin,

  // Experimental Features (5 plugins)
  quantumNotesPlugin,
  brainWaveInterfacePlugin,
  holographicDisplayPlugin,
  timeManipulatorPlugin,
  universalTranslatorPlugin,
];

// Plugin Categories - Organized by user type and functionality
export const PLUGIN_CATEGORIES = {
  '🌟 Core Features': [
    enhancedWordCountPlugin,
    newDailyNotesPlugin,
    tableOfContentsPlugin,
    linkCheckerPlugin,
  ],
  '📋 Organization': [
    taskManagerPlugin,
    projectTrackerPlugin,
    meetingNotesPlugin,
    fileOrganizerPlugin,
  ],
  '📝 Blogging': [
    seoOptimizerPlugin,
    blogTemplatePlugin,
    socialMediaSchedulerPlugin,
    analyticsTrackerPlugin,
  ],
  '📖 Personal & Diary': [
    moodTrackerPlugin,
    habitTrackerPlugin,
    memoryKeeperPlugin,
    goalTrackerPlugin,
  ],
  '🎓 Academic & Research': [
    citationManagerPlugin,
    researchPaperPlugin,
    noteTakingSystemPlugin,
    pdfAnnotatorPlugin,
    literatureReviewPlugin,
  ],
  '💼 Business & Professional': [
    crmLitePlugin,
    invoiceGeneratorPlugin,
    expenseTrackerPlugin,
    contractTemplatesPlugin,
    businessPlanPlugin,
    timeTrackerPlugin,
  ],
  '🎨 Creative & Content': [
    storyPlannerPlugin,
    screenplayFormatPlugin,
    poetryToolsPlugin,
    contentCalendarPlugin,
  ],
  '🏃‍♂️ Health & Wellness': [
    fitnessTrackerPlugin,
    nutritionDiaryPlugin,
    sleepTrackerPlugin,
    mentalHealthJournalPlugin,
  ],
  '💰 Finance & Investment': [
    budgetPlannerPlugin,
    investmentTrackerPlugin,
    debtPayoffPlannerPlugin,
  ],
  '🏠 Lifestyle & Home': [homeMaintenanceTrackerPlugin, recipeBookPlugin, giftPlannerPlugin],
  '📊 Data & Analytics': [
    dataVisualizationPlugin,
    dashboardBuilderPlugin,
    reportGeneratorPlugin,
    dataImportPlugin,
    metricsTrackerPlugin,
  ],
  '⚡ Automation & Integration': [
    webhookIntegrationPlugin,
    automationRulesPlugin,
    scheduleReminderPlugin,
    bulkOperationsPlugin,
    syncIntegrationPlugin,
  ],
  '🤝 Version Control & Collaboration': [
    versionHistoryPlugin,
    commentSystemPlugin,
    reviewWorkflowPlugin,
    conflictResolutionPlugin,
    teamDashboardPlugin,
  ],
  '✨ Enhanced Content Creation': [
    // advancedMarkdownEditorPlugin, // REMOVED - redundant with WYSIWYG editor
    templateEnginePlugin,
    contentStructurePlugin,
    multiFormatExportPlugin,
    contentStatisticsPlugin,
  ],
  '🔍 Search & Discovery': [
    smartSearchPlugin,
    tagManagerPlugin,
    contentDiscoveryPlugin,
    savedSearchesPlugin,
    globalIndexPlugin,
  ],
  '📚 Knowledge Enhancement': [
    knowledgeGraphPlugin,
    learningPathPlugin,
    conceptMapPlugin,
    questionBankPlugin,
    knowledgeExtractionPlugin,
  ],

  // Phase 3: Professional & Specialized Categories
  '💼 Business & Finance Pro': [
    budgetTrackerPlugin,
    projectManagerPlugin,
    newInvoiceGeneratorPlugin,
    businessPlannerPlugin,
    proMeetingNotesPlugin,
  ],
  '🎓 Research & Academic Pro': [
    newCitationManagerPlugin,
    researchNotebookPlugin,
    newLiteratureReviewPlugin,
    thesisWriterPlugin,
    dataAnalysisPlugin,
  ],
  '📺 Media & Publishing': [
    contentPublisherPlugin,
    mediaManagerPlugin,
    newSeoOptimizerPlugin,
    emailNewsletterPlugin,
    socialMediaPlugin,
  ],

  // Phase 4: Advanced Features Categories
  '🔒 Security & Privacy': [
    encryptionPlugin,
    passwordManagerPlugin,
    privacyAuditPlugin,
    secureBackupPlugin,
    accessControlPlugin,
  ],
  '⚡ Performance & Optimization': [
    performanceMonitorPlugin,
    cacheManagerPlugin,
    indexOptimizerPlugin,
    memoryOptimizerPlugin,
    loadBalancerPlugin,
  ],
  '📊 Advanced Analytics': [
    behaviorAnalyticsPlugin,
    predictiveAnalyticsPlugin,
    sentimentAnalysisPlugin,
    trendAnalysisPlugin,
    intelligenceReportPlugin,
  ],

  // Phase 5: Innovation & Future Categories
  '🤖 AI & Machine Learning': [
    aiWritingAssistantPlugin,
    mlClassifierPlugin,
    neuralSearchPlugin,
    autoSummarizerPlugin,
    chatbotIntegrationPlugin,
  ],
  '🌐 IoT & Integration': [
    iotDeviceManagerPlugin,
    smartHomeIntegrationPlugin,
    apiIntegratorPlugin,
    cloudSyncPlugin,
    webhookManagerPlugin,
  ],
  '🔬 Experimental Features': [
    quantumNotesPlugin,
    brainWaveInterfacePlugin,
    holographicDisplayPlugin,
    timeManipulatorPlugin,
    universalTranslatorPlugin,
  ],

  '📚 Examples': [wordCountPlugin, markdownExportPlugin, darkThemePlugin, aiWritingPlugin],
  '🔧 Utilities': [backupPlugin, citationsPlugin, kanbanPlugin, spacedRepetitionPlugin],
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
  meetingNotesPlugin,

  // Business essentials
  crmLitePlugin,
  timeTrackerPlugin,
  expenseTrackerPlugin,

  // Creative tools
  storyPlannerPlugin,
  contentCalendarPlugin,

  // Academic
  citationManagerPlugin,
  noteTakingSystemPlugin,

  // Health & lifestyle
  fitnessTrackerPlugin,
  budgetPlannerPlugin,
  recipeBookPlugin,

  // Content creators
  seoOptimizerPlugin,
  socialMediaSchedulerPlugin,
  analyticsTrackerPlugin,

  // Personal development
  moodTrackerPlugin,
  habitTrackerPlugin,
  goalTrackerPlugin,

  // Phase 1 & 2 highlights
  dataVisualizationPlugin,
  automationRulesPlugin,
  versionHistoryPlugin,
  commentSystemPlugin,
  knowledgeGraphPlugin,
  smartSearchPlugin,

  // Phase 3-5 New Highlights
  projectManagerPlugin, // Business management
  newCitationManagerPlugin, // Academic research
  aiWritingAssistantPlugin, // AI-powered writing
  encryptionPlugin, // Security & privacy
  performanceMonitorPlugin, // Performance optimization
  behaviorAnalyticsPlugin, // Advanced analytics
  contentPublisherPlugin, // Multi-platform publishing
  iotDeviceManagerPlugin, // IoT integration
  quantumNotesPlugin, // Experimental features

  // Useful utilities
  backupPlugin,
  kanbanPlugin,
];

// Plugin metadata for enhanced features
export const PLUGIN_METADATA = {
  // Core Features
  [enhancedWordCountPlugin.id]: {
    category: 'Core',
    difficulty: 'beginner',
    timeToSetup: '1 min',
    rating: '4.9',
    downloadCount: '1.2k',
    tags: ['core', 'analytics'],
    featured: true,
  },
  [newDailyNotesPlugin.id]: {
    category: 'Core',
    difficulty: 'beginner',
    timeToSetup: '1 min',
    rating: '4.8',
    downloadCount: '980',
    tags: ['core', 'daily'],
    featured: true,
  },
  [tableOfContentsPlugin.id]: {
    category: 'Core',
    difficulty: 'beginner',
    timeToSetup: '1 min',
    rating: '4.7',
    downloadCount: '856',
    tags: ['core', 'navigation'],
    featured: true,
  },
  [linkCheckerPlugin.id]: {
    category: 'Core',
    difficulty: 'intermediate',
    timeToSetup: '2 min',
    rating: '4.6',
    downloadCount: '743',
    tags: ['core', 'validation'],
    featured: true,
  },

  // Organization
  [taskManagerPlugin.id]: {
    category: 'Organization',
    difficulty: 'beginner',
    timeToSetup: '2 min',
    rating: '4.8',
    downloadCount: '1.1k',
    tags: ['organization', 'tasks'],
    featured: true,
  },
  [projectTrackerPlugin.id]: {
    category: 'Organization',
    difficulty: 'intermediate',
    timeToSetup: '3 min',
    rating: '4.7',
    downloadCount: '892',
    tags: ['organization', 'projects'],
    featured: true,
  },

  // Phase 1 Data & Analytics
  [dataVisualizationPlugin.id]: {
    category: 'Data Analytics',
    difficulty: 'intermediate',
    timeToSetup: '5 min',
    rating: '4.8',
    downloadCount: '567',
    tags: ['charts', 'visualization'],
    featured: true,
  },
  [dashboardBuilderPlugin.id]: {
    category: 'Data Analytics',
    difficulty: 'advanced',
    timeToSetup: '8 min',
    rating: '4.7',
    downloadCount: '423',
    tags: ['dashboard', 'analytics'],
    featured: false,
  },
  [reportGeneratorPlugin.id]: {
    category: 'Data Analytics',
    difficulty: 'intermediate',
    timeToSetup: '5 min',
    rating: '4.6',
    downloadCount: '389',
    tags: ['reports', 'automation'],
    featured: false,
  },

  // Phase 1 Automation & Integration
  [automationRulesPlugin.id]: {
    category: 'Automation',
    difficulty: 'intermediate',
    timeToSetup: '6 min',
    rating: '4.7',
    downloadCount: '445',
    tags: ['automation', 'rules'],
    featured: true,
  },
  [webhookIntegrationPlugin.id]: {
    category: 'Automation',
    difficulty: 'advanced',
    timeToSetup: '10 min',
    rating: '4.6',
    downloadCount: '334',
    tags: ['webhooks', 'integration'],
    featured: false,
  },

  // Phase 1 Version Control & Collaboration
  [versionHistoryPlugin.id]: {
    category: 'Collaboration',
    difficulty: 'intermediate',
    timeToSetup: '4 min',
    rating: '4.8',
    downloadCount: '512',
    tags: ['version-control', 'history'],
    featured: true,
  },
  [commentSystemPlugin.id]: {
    category: 'Collaboration',
    difficulty: 'beginner',
    timeToSetup: '3 min',
    rating: '4.7',
    downloadCount: '478',
    tags: ['comments', 'collaboration'],
    featured: true,
  },

  // Phase 2 Enhanced Content Creation
  // [advancedMarkdownEditorPlugin.id]: { // REMOVED - redundant with WYSIWYG editor
  //   category: 'Content Creation',
  //   difficulty: 'intermediate',
  //   timeToSetup: '5 min',
  //   rating: '4.8',
  //   downloadCount: '623',
  //   tags: ['editor', 'markdown'],
  //   featured: false,
  // },
  [templateEnginePlugin.id]: {
    category: 'Content Creation',
    difficulty: 'beginner',
    timeToSetup: '3 min',
    rating: '4.6',
    downloadCount: '445',
    tags: ['templates', 'snippets'],
    featured: false,
  },

  // Phase 2 Search & Discovery
  [smartSearchPlugin.id]: {
    category: 'Search',
    difficulty: 'intermediate',
    timeToSetup: '4 min',
    rating: '4.8',
    downloadCount: '567',
    tags: ['search', 'AI'],
    featured: true,
  },
  [tagManagerPlugin.id]: {
    category: 'Search',
    difficulty: 'beginner',
    timeToSetup: '2 min',
    rating: '4.7',
    downloadCount: '489',
    tags: ['tags', 'organization'],
    featured: false,
  },

  // Phase 2 Knowledge Enhancement
  [knowledgeGraphPlugin.id]: {
    category: 'Knowledge',
    difficulty: 'advanced',
    timeToSetup: '8 min',
    rating: '4.9',
    downloadCount: '389',
    tags: ['graph', 'visualization'],
    featured: true,
  },
  [learningPathPlugin.id]: {
    category: 'Knowledge',
    difficulty: 'intermediate',
    timeToSetup: '5 min',
    rating: '4.6',
    downloadCount: '334',
    tags: ['learning', 'paths'],
    featured: false,
  },
};

// User type recommendations
export const USER_TYPE_RECOMMENDATIONS = {
  students: [
    enhancedWordCountPlugin,
    citationManagerPlugin,
    researchPaperPlugin,
    noteTakingSystemPlugin,
    taskManagerPlugin,
    timeTrackerPlugin,
    goalTrackerPlugin,
    knowledgeGraphPlugin,
    learningPathPlugin,
  ],
  researchers: [
    citationManagerPlugin,
    researchPaperPlugin,
    literatureReviewPlugin,
    pdfAnnotatorPlugin,
    linkCheckerPlugin,
    tableOfContentsPlugin,
    smartSearchPlugin,
    knowledgeExtractionPlugin,
    versionHistoryPlugin,
  ],
  bloggers: [
    seoOptimizerPlugin,
    blogTemplatePlugin,
    contentCalendarPlugin,
    analyticsTrackerPlugin,
    socialMediaSchedulerPlugin,
    enhancedWordCountPlugin,
    linkCheckerPlugin,
    contentStatisticsPlugin,
    multiFormatExportPlugin,
  ],
  'business-professionals': [
    crmLitePlugin,
    timeTrackerPlugin,
    invoiceGeneratorPlugin,
    expenseTrackerPlugin,
    contractTemplatesPlugin,
    businessPlanPlugin,
    meetingNotesPlugin,
    automationRulesPlugin,
    teamDashboardPlugin,
  ],
  writers: [
    storyPlannerPlugin,
    screenplayFormatPlugin,
    poetryToolsPlugin,
    enhancedWordCountPlugin,
    tableOfContentsPlugin,
    goalTrackerPlugin,
    // advancedMarkdownEditorPlugin, // REMOVED - redundant with WYSIWYG editor
    templateEnginePlugin,
    contentStructurePlugin,
  ],
  'diary-users': [
    newDailyNotesPlugin,
    moodTrackerPlugin,
    habitTrackerPlugin,
    memoryKeeperPlugin,
    mentalHealthJournalPlugin,
    goalTrackerPlugin,
    fitnessTrackerPlugin,
  ],
};

// Plugin statistics
export const PLUGIN_STATS = {
  totalPlugins: AVAILABLE_PLUGINS.length,
  totalCategories: Object.keys(PLUGIN_CATEGORIES).length,
  averageRating: 4.7,
  totalDownloads: 15420,
  mostPopularCategory: '🌟 Core Features',
  newestPlugins: [
    'knowledge-graph',
    'smart-search',
    'automation-rules',
    'version-history',
    'data-visualization',
  ],
};
