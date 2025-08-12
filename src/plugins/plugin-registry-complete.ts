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
import { budgetPlannerPlugin, investmentTrackerPlugin, debtPayoffPlannerPlugin } from './finance-investment-plugins';
import { homeMaintenanceTrackerPlugin, recipeBookPlugin, giftPlannerPlugin } from './lifestyle-home-plugins';

// Import a few key example plugins for demonstration
import { 
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin,
  backupPlugin,
  citationsPlugin,
  kanbanPlugin,
  spacedRepetitionPlugin
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
  
  // 💰 FINANCE & INVESTMENT PLUGINS  
  budgetPlannerPlugin,
  investmentTrackerPlugin,
  debtPayoffPlannerPlugin,
  
  // 🏠 LIFESTYLE & HOME PLUGINS
  homeMaintenanceTrackerPlugin,
  recipeBookPlugin,
  giftPlannerPlugin,
  
  // 📚 EXAMPLE PLUGINS (Selected demos)
  wordCountPlugin,
  markdownExportPlugin,
  darkThemePlugin,
  aiWritingPlugin,
  
  // 🔧 UTILITY PLUGINS
  backupPlugin,
  citationsPlugin,
  kanbanPlugin,
  spacedRepetitionPlugin
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
  '💰 Finance & Investment': [budgetPlannerPlugin, investmentTrackerPlugin, debtPayoffPlannerPlugin],
  '🏠 Lifestyle & Home': [homeMaintenanceTrackerPlugin, recipeBookPlugin, giftPlannerPlugin],
  '📚 Examples': [wordCountPlugin, markdownExportPlugin, darkThemePlugin, aiWritingPlugin],
  '🔧 Utilities': [backupPlugin, citationsPlugin, kanbanPlugin, spacedRepetitionPlugin]
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
  
  // Useful utilities
  backupPlugin,
  kanbanPlugin
];

// Metadata for all plugins
export const PLUGIN_METADATA = {
  // Core Features
  enhancedWordCountPlugin: { category: 'Core', difficulty: 'beginner', timeToSetup: '1 min' },
  newDailyNotesPlugin: { category: 'Core', difficulty: 'beginner', timeToSetup: '1 min' },
  tableOfContentsPlugin: { category: 'Core', difficulty: 'beginner', timeToSetup: '1 min' },
  linkCheckerPlugin: { category: 'Core', difficulty: 'intermediate', timeToSetup: '2 min' },
  
  // Organization
  taskManagerPlugin: { category: 'Organization', difficulty: 'beginner', timeToSetup: '2 min' },
  projectTrackerPlugin: { category: 'Organization', difficulty: 'intermediate', timeToSetup: '3 min' },
  meetingNotesPlugin: { category: 'Organization', difficulty: 'beginner', timeToSetup: '2 min' },
  fileOrganizerPlugin: { category: 'Organization', difficulty: 'intermediate', timeToSetup: '3 min' },
  
  // Blogging & Content
  seoOptimizerPlugin: { category: 'Blogging', difficulty: 'intermediate', timeToSetup: '5 min' },
  blogTemplatePlugin: { category: 'Blogging', difficulty: 'beginner', timeToSetup: '2 min' },
  socialMediaSchedulerPlugin: { category: 'Blogging', difficulty: 'intermediate', timeToSetup: '5 min' },
  analyticsTrackerPlugin: { category: 'Blogging', difficulty: 'advanced', timeToSetup: '10 min' },
  
  // Personal & Diary
  moodTrackerPlugin: { category: 'Personal', difficulty: 'beginner', timeToSetup: '2 min' },
  habitTrackerPlugin: { category: 'Personal', difficulty: 'beginner', timeToSetup: '3 min' },
  memoryKeeperPlugin: { category: 'Personal', difficulty: 'beginner', timeToSetup: '2 min' },
  goalTrackerPlugin: { category: 'Personal', difficulty: 'intermediate', timeToSetup: '3 min' },
  
  // Academic & Research
  citationManagerPlugin: { category: 'Academic', difficulty: 'intermediate', timeToSetup: '5 min' },
  researchPaperPlugin: { category: 'Academic', difficulty: 'advanced', timeToSetup: '10 min' },
  noteTakingSystemPlugin: { category: 'Academic', difficulty: 'intermediate', timeToSetup: '5 min' },
  pdfAnnotatorPlugin: { category: 'Academic', difficulty: 'advanced', timeToSetup: '8 min' },
  literatureReviewPlugin: { category: 'Academic', difficulty: 'advanced', timeToSetup: '10 min' },
  
  // Business & Professional
  crmLitePlugin: { category: 'Business', difficulty: 'intermediate', timeToSetup: '8 min' },
  invoiceGeneratorPlugin: { category: 'Business', difficulty: 'intermediate', timeToSetup: '5 min' },
  expenseTrackerPlugin: { category: 'Business', difficulty: 'beginner', timeToSetup: '3 min' },
  contractTemplatesPlugin: { category: 'Business', difficulty: 'intermediate', timeToSetup: '5 min' },
  businessPlanPlugin: { category: 'Business', difficulty: 'advanced', timeToSetup: '15 min' },
  timeTrackerPlugin: { category: 'Business', difficulty: 'beginner', timeToSetup: '3 min' },
  
  // Creative & Content
  storyPlannerPlugin: { category: 'Creative', difficulty: 'intermediate', timeToSetup: '5 min' },
  screenplayFormatPlugin: { category: 'Creative', difficulty: 'intermediate', timeToSetup: '3 min' },
  poetryToolsPlugin: { category: 'Creative', difficulty: 'beginner', timeToSetup: '2 min' },
  contentCalendarPlugin: { category: 'Creative', difficulty: 'intermediate', timeToSetup: '5 min' },
  
  // Health & Wellness
  fitnessTrackerPlugin: { category: 'Health', difficulty: 'beginner', timeToSetup: '3 min' },
  nutritionDiaryPlugin: { category: 'Health', difficulty: 'intermediate', timeToSetup: '5 min' },
  sleepTrackerPlugin: { category: 'Health', difficulty: 'beginner', timeToSetup: '2 min' },
  mentalHealthJournalPlugin: { category: 'Health', difficulty: 'beginner', timeToSetup: '2 min' },
  
  // Finance & Investment
  budgetPlannerPlugin: { category: 'Finance', difficulty: 'intermediate', timeToSetup: '5 min' },
  investmentTrackerPlugin: { category: 'Finance', difficulty: 'advanced', timeToSetup: '10 min' },
  debtPayoffPlannerPlugin: { category: 'Finance', difficulty: 'intermediate', timeToSetup: '5 min' },
  
  // Lifestyle & Home
  homeMaintenanceTrackerPlugin: { category: 'Lifestyle', difficulty: 'beginner', timeToSetup: '3 min' },
  recipeBookPlugin: { category: 'Lifestyle', difficulty: 'beginner', timeToSetup: '2 min' },
  giftPlannerPlugin: { category: 'Lifestyle', difficulty: 'beginner', timeToSetup: '2 min' },
  
  // Example Plugins
  wordCountPlugin: { category: 'Example', difficulty: 'beginner', timeToSetup: '1 min' },
  markdownExportPlugin: { category: 'Example', difficulty: 'beginner', timeToSetup: '1 min' },
  darkThemePlugin: { category: 'Example', difficulty: 'beginner', timeToSetup: '1 min' },
  aiWritingPlugin: { category: 'Example', difficulty: 'intermediate', timeToSetup: '5 min' },
  
  // Utility Plugins
  backupPlugin: { category: 'Utility', difficulty: 'intermediate', timeToSetup: '3 min' },
  citationsPlugin: { category: 'Utility', difficulty: 'intermediate', timeToSetup: '5 min' },
  kanbanPlugin: { category: 'Utility', difficulty: 'intermediate', timeToSetup: '5 min' },
  spacedRepetitionPlugin: { category: 'Utility', difficulty: 'advanced', timeToSetup: '8 min' }
};
