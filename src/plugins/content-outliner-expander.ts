import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';
import React from 'react';
import ExpansionPreviewPanel from '../components/ExpansionPreviewPanel';
import StructureSuggestionsPanel, {
  StructureSuggestion,
} from '../components/StructureSuggestionsPanel';
import ExpansionHistoryPanel, { ExpansionHistoryEntry } from '../components/ExpansionHistoryPanel';

/**
 * CONTENT STRUCTURER & ANALYZER PLUGIN v3.0
 * (Evolved from Content Outliner & Expander v2.0)
 *
 * AI-powered content structure analysis, transformation, and improvement.
 * Your intelligent writing partner for organizing and refining any content.
 *
 * NEW in v3.0 - MAJOR EXPANSION:
 * - � Deep Structure Analysis - Coherence scoring, flow detection, gap identification
 * - � Content Restructuring - Break walls of text, add sections, improve flow
 * - � Argument Analysis - Find weak reasoning, suggest evidence, detect fallacies
 * - 🎓 Academic Support - Citation gaps, proper structure, research organization
 * - 🔄 Bidirectional Transform - Not just expand, but reorganize any content
 *
 * PRESERVED from v2.0:
 * - ✨ Expand bullet points into paragraphs (classic feature)
 * - 📝 Compress paragraphs to outlines
 * - 📋 Preview all changes before applying
 * - 📜 Complete history with undo
 * - 🔄 Batch operations
 *
 * Core Philosophy:
 * Everyone can write, but organizing thoughts is hard.
 * This plugin helps you structure, not just expand.
 */

let pluginInstance: ContentStructurerPlugin | null = null;

export const contentStructurerPlugin: PluginManifest = {
  id: 'ai-content-structurer',
  name: 'Content Structurer & Analyzer',
  version: '3.2.0',
  description:
    'AI-powered content structure analysis, transformation, and improvement. NEW in v3.2: Full multi-document analysis, custom template builder, enhanced exports with history, real-time readability (experimental). Previous: Readability metrics (Flesch-Kincaid), structure templates, export reports. Analyze document structure, find flow problems, strengthen arguments, restructure content, and transform between formats. Your intelligent writing partner for organizing any content. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
  author: 'MarkItUp Team',
  main: 'ai-content-structurer.js',

  permissions: [
    {
      type: 'network',
      description: 'Required to connect to AI services for content generation',
    },
  ],

  settings: [
    {
      id: 'writing-style',
      name: 'Writing Style',
      type: 'select',
      options: [
        { label: 'Professional', value: 'professional' },
        { label: 'Casual', value: 'casual' },
        { label: 'Academic', value: 'academic' },
        { label: 'Technical', value: 'technical' },
        { label: 'Creative', value: 'creative' },
      ],
      default: 'professional',
      description: 'Writing style for expanded content',
    },
    {
      id: 'expansion-depth',
      name: 'Expansion Depth',
      type: 'select',
      options: [
        { label: 'Brief (1-2 sentences)', value: 'brief' },
        { label: 'Moderate (1 paragraph)', value: 'moderate' },
        { label: 'Comprehensive (2-3 paragraphs)', value: 'comprehensive' },
        { label: 'Detailed (full section)', value: 'detailed' },
      ],
      default: 'moderate',
      description: 'How much to expand each bullet point',
    },
    {
      id: 'target-word-count',
      name: 'Target Word Count',
      type: 'number',
      default: 0,
      description: 'Target word count for expansions (0 = automatic)',
    },
    {
      id: 'include-examples',
      name: 'Include Examples',
      type: 'boolean',
      default: true,
      description: 'Add examples and analogies when expanding',
    },
    {
      id: 'preserve-structure',
      name: 'Preserve Structure',
      type: 'boolean',
      default: true,
      description: 'Keep original heading structure when expanding',
    },
    {
      id: 'show-preview',
      name: 'Show Preview Before Applying',
      type: 'boolean',
      default: true,
      description: 'Preview expansions with side-by-side comparison before accepting',
    },
    {
      id: 'enable-history',
      name: 'Enable Expansion History',
      type: 'boolean',
      default: true,
      description: 'Track all expansions and compressions for undo functionality',
    },
    {
      id: 'custom-templates',
      name: 'Custom Expansion Templates',
      type: 'textarea',
      default: '',
      description: 'Custom templates (one per line). Use {{topic}} and {{style}} variables.',
    },
    {
      id: 'enable-notifications',
      name: 'Enable Notifications',
      type: 'boolean',
      default: true,
      description: 'Show notifications when operations complete',
    },
    // === NEW v3.0 SETTINGS - Structure Analysis ===
    {
      id: 'analysis-depth',
      name: 'Structure Analysis Depth',
      type: 'select',
      options: [
        { label: 'Quick Scan', value: 'quick' },
        { label: 'Standard Analysis', value: 'standard' },
        { label: 'Deep Analysis', value: 'deep' },
      ],
      default: 'standard',
      description: 'How thoroughly to analyze document structure',
    },
    {
      id: 'academic-mode',
      name: 'Academic Mode',
      type: 'boolean',
      default: false,
      description: 'Enable academic paper structure checking and citation analysis',
    },
    {
      id: 'target-readability',
      name: 'Target Readability Level',
      type: 'select',
      options: [
        { label: 'Grade 6-8 (General Public)', value: 'simple' },
        { label: 'Grade 9-12 (High School)', value: 'standard' },
        { label: 'College Level', value: 'advanced' },
        { label: 'Academic/Professional', value: 'expert' },
      ],
      default: 'standard',
      description: 'Target audience reading level for analysis',
    },
    {
      id: 'check-arguments',
      name: 'Argument Analysis',
      type: 'boolean',
      default: false,
      description: 'Analyze logical reasoning and argument strength',
    },
    {
      id: 'detect-redundancy',
      name: 'Detect Redundancy',
      type: 'boolean',
      default: true,
      description: 'Flag repeated ideas and duplicate content',
    },
    {
      id: 'suggest-transitions',
      name: 'Suggest Transitions',
      type: 'boolean',
      default: true,
      description: 'Recommend transition sentences between sections',
    },
    // === NEW v3.1 SETTINGS - Enhanced Analysis ===
    {
      id: 'show-readability-metrics',
      name: 'Show Readability Metrics',
      type: 'boolean',
      default: true,
      description: 'Display Flesch-Kincaid score, sentence length, and complexity metrics',
    },
    {
      id: 'structure-template',
      name: 'Preferred Structure Template',
      type: 'select',
      options: [
        { label: 'None (Freeform)', value: 'none' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'Technical Documentation', value: 'documentation' },
        { label: 'Meeting Notes', value: 'meeting' },
        { label: 'Research Paper', value: 'research' },
        { label: 'Tutorial/How-To', value: 'tutorial' },
        { label: 'Product Requirements', value: 'requirements' },
      ],
      default: 'none',
      description: 'Default template for structure suggestions',
    },
    {
      id: 'auto-export-reports',
      name: 'Auto-Export Analysis Reports',
      type: 'boolean',
      default: false,
      description: 'Automatically save analysis reports to a reports folder',
    },
    // === NEW v3.2 SETTINGS - Advanced Features ===
    {
      id: 'custom-templates',
      name: 'Custom Templates (JSON)',
      type: 'textarea',
      default: '[]',
      description:
        'Custom structure templates in JSON format. See documentation for template schema.',
    },
    {
      id: 'save-reports-to-folder',
      name: 'Save Reports to Folder',
      type: 'boolean',
      default: false,
      description: 'Save analysis reports as markdown files in a reports folder',
    },
    {
      id: 'reports-folder-path',
      name: 'Reports Folder Path',
      type: 'text',
      default: 'reports',
      description: 'Folder path for saving reports (relative to workspace)',
    },
    {
      id: 'enable-real-time-analysis',
      name: 'Enable Real-Time Readability (Experimental)',
      type: 'boolean',
      default: false,
      description: 'Show live readability score while typing (may impact performance)',
    },
    {
      id: 'real-time-debounce',
      name: 'Real-Time Analysis Delay (seconds)',
      type: 'number',
      default: 3,
      description: 'Delay before updating real-time analysis (1-10 seconds)',
    },
  ] as PluginSetting[],

  commands: [
    {
      id: 'expand-selection',
      name: 'Expand Selected Bullet Points',
      description: 'Convert selected bullet points into full paragraphs',
      keybinding: 'Cmd+Shift+E',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.expandSelection();
      },
    },
    {
      id: 'expand-more',
      name: 'Expand More (Progressive)',
      description: 'Further expand already expanded content for more detail',
      keybinding: 'Cmd+Shift+M',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.expandMore();
      },
    },
    {
      id: 'expand-section',
      name: 'Expand This Section',
      description: 'Expand the current section from outline to full text',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.expandSection();
      },
    },
    {
      id: 'generate-draft',
      name: 'Generate Draft from Outline',
      description: 'Transform entire outline into comprehensive article',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.generateDraft();
      },
    },
    {
      id: 'compress-to-bullets',
      name: 'Compress to Bullet Points',
      description: 'Convert selected paragraphs to concise bullet points',
      keybinding: 'Cmd+Shift+B',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.compressToBullets();
      },
    },
    {
      id: 'improve-structure',
      name: 'Suggest Structure Improvements',
      description: 'AI analyzes and suggests better document structure',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.suggestStructureImprovements();
      },
    },
    {
      id: 'view-history',
      name: 'View Expansion History',
      description: 'Review and undo past content transformations',
      keybinding: 'Cmd+Shift+H',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Outliner: Plugin not initialized');
          return;
        }
        await pluginInstance.showExpansionHistory();
      },
    },
    {
      id: 'batch-expand',
      name: 'Batch Expand All Sections',
      description: 'Expand all outline sections with preview and selective apply',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.batchExpandSections();
      },
    },
    // === NEW v3.0 COMMANDS - Structure Analysis ===
    {
      id: 'find-flow-issues',
      name: 'Find Logical Flow Problems',
      description: 'Identify abrupt topic changes, missing transitions, and flow issues',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.findFlowIssues();
      },
    },
    {
      id: 'analyze-arguments',
      name: 'Check Argument Strength',
      description: 'Find weak reasoning, missing evidence, and logical fallacies',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.analyzeArguments();
      },
    },
    {
      id: 'find-citation-needs',
      name: 'Find Citation Gaps',
      description: 'Identify claims that need sources and citations',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.findCitationNeeds();
      },
    },
    // === NEW v3.0 COMMANDS - Content Restructuring ===
    {
      id: 'break-into-sections',
      name: 'Break Wall of Text into Sections',
      description: 'Analyze content for topic shifts and suggest section breaks with headings',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.breakIntoSections();
      },
    },
    {
      id: 'suggest-headings',
      name: 'Add Smart Headings',
      description: 'Detect topic changes and suggest appropriate H2/H3 headings',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.suggestHeadings();
      },
    },
    {
      id: 'improve-flow',
      name: 'Improve Content Flow',
      description: 'Restructure content for better logical progression and transitions',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.improveFlow();
      },
    },
    {
      id: 'find-redundancy',
      name: 'Find Redundant Sections',
      description: 'Detect repeated ideas and suggest consolidation',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.findRedundancy();
      },
    },
    // === NEW v3.0 COMMANDS - Reverse Transformations ===
    {
      id: 'create-outline-from-text',
      name: 'Create Outline from Narrative',
      description: 'Transform stream-of-consciousness or narrative into structured outline',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.createOutlineFromText();
      },
    },
    {
      id: 'convert-to-academic',
      name: 'Convert to Academic Structure',
      description: 'Restructure casual notes into academic paper format',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.convertToAcademic();
      },
    },
    // === NEW v3.1 COMMANDS - Enhanced Analysis ===
    {
      id: 'analyze-readability',
      name: 'Analyze Readability Metrics',
      description: 'Calculate Flesch-Kincaid score, sentence complexity, and reading level',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.analyzeReadability();
      },
    },
    {
      id: 'apply-structure-template',
      name: 'Apply Structure Template',
      description: 'Reorganize content using a pre-built template (blog, docs, meeting, etc.)',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.applyStructureTemplate();
      },
    },
    {
      id: 'analyze-multiple-notes',
      name: 'Analyze Multiple Notes',
      description: 'Check consistency and structure patterns across selected notes',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.analyzeMultipleNotes();
      },
    },
    // === NEW v3.2 COMMANDS - Advanced Features ===
    {
      id: 'create-custom-template',
      name: 'Create Custom Template',
      description: 'Build and save your own structure template',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.createCustomTemplate();
      },
    },
    {
      id: 'manage-templates',
      name: 'Manage Templates',
      description: 'View, edit, and delete custom templates',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.manageTemplates();
      },
    },
    {
      id: 'view-report-history',
      name: 'View Report History',
      description: 'Browse and compare past analysis reports',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.viewReportHistory();
      },
    },
    {
      id: 'toggle-real-time-analysis',
      name: 'Toggle Real-Time Readability',
      description: 'Turn real-time readability scoring on/off',
      callback: async (api?: PluginAPI) => {
        if (!pluginInstance || !api) {
          console.error('Content Structurer: Plugin not initialized');
          return;
        }
        await pluginInstance.toggleRealTimeAnalysis();
      },
    },
  ] as Command[],

  onLoad: async (api?: PluginAPI) => {
    if (!api) {
      console.error('Content Outliner: PluginAPI not available');
      return;
    }

    // Check if AI is available
    if (!api.ai || !api.ai.isAvailable()) {
      console.warn(
        'Content Outliner: AI service not available. Plugin will have limited functionality.'
      );
      api.ui.showNotification(
        'Content Outliner requires AI to be configured. Please set up AI in settings.',
        'warning'
      );
    }

    pluginInstance = new ContentStructurerPlugin(api);
    console.log('Content Structurer & Analyzer plugin loaded successfully');
  },

  onUnload: async () => {
    pluginInstance = null;
    console.log('Content Structurer & Analyzer plugin unloaded');
  },
};

/**
 * Content Structurer & Analyzer Plugin Implementation
 */
class ContentStructurerPlugin {
  private api: PluginAPI;

  constructor(api: PluginAPI) {
    this.api = api;
  }

  /**
   * Expand selected bullet points into paragraphs
   */
  async expandSelection(): Promise<void> {
    const selection = this.api.ui.getSelection();

    if (!selection || !selection.text.trim()) {
      this.showNotification('Please select bullet points to expand', 'warning');
      return;
    }

    // Check if AI is available
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification(
        'AI service is not configured. Please set up AI in settings.',
        'warning'
      );
      return;
    }

    try {
      this.showNotification('Expanding bullet points...', 'info');

      // Extract bullet points
      const bullets = this.extractBulletPoints(selection.text);

      if (bullets.length === 0) {
        this.showNotification('No bullet points found in selection', 'warning');
        return;
      }

      // Get settings
      const settings = this.getSettings();
      const style = String(settings['writing-style'] || 'professional');
      const depth = String(settings['expansion-depth'] || 'moderate');
      const includeExamples = settings['include-examples'] !== false;

      // Generate expansion prompt
      const prompt = this.buildExpansionPrompt(bullets, style, depth, includeExamples);

      // Use AI to expand
      const analysis = await this.api.ai.analyzeContent(prompt);
      const expandedText = analysis.summary; // Using summary field for generated content

      const showPreview = settings['show-preview'] !== false;

      // Show preview if enabled
      let finalText = expandedText;
      if (showPreview) {
        const previewResult = await this.showPreview(selection.text, expandedText, 'expand');
        if (previewResult === null) {
          this.showNotification('Expansion cancelled', 'info');
          return;
        }
        finalText = previewResult;
      }

      // Add to history before replacing
      const currentNoteId = this.api.notes.getActiveNoteId();
      const noteName = currentNoteId
        ? this.api.notes.get(currentNoteId)?.name || 'Unknown'
        : 'Unknown';
      this.addToHistory('expand', noteName, selection.text, finalText);

      // Replace selection with expanded text
      this.api.ui.replaceSelection(finalText);

      const originalWords = this.countWords(selection.text);
      const expandedWords = this.countWords(finalText);
      const increase = (((expandedWords - originalWords) / originalWords) * 100).toFixed(0);

      this.showNotification(
        `✨ Expanded ${bullets.length} bullet point(s): ${originalWords} → ${expandedWords} words (+${increase}%)`,
        'info'
      );
    } catch (error) {
      console.error('Content Outliner: Error expanding selection:', error);
      this.showNotification('Failed to expand content. Please try again.', 'error');
    }
  }

  /**
   * Progressive expansion - expand already expanded content with more detail
   */
  async expandMore(): Promise<void> {
    const selection = this.api.ui.getSelection();

    if (!selection || !selection.text.trim()) {
      this.showNotification('Please select text to expand further', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Adding more detail...', 'info');

      const settings = this.getSettings();
      const style = String(settings['writing-style'] || 'professional');
      const includeExamples = settings['include-examples'] !== false;

      const prompt = `Expand this text with more detail, depth, and nuance.
Add ${includeExamples ? 'examples, case studies, and ' : ''}supporting details while maintaining the ${style} tone.
Do not summarize or condense - ADD content to make it more comprehensive.

Current text:
${selection.text}

Provide an expanded version with significantly more detail and substance.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const expandedText = analysis.summary;

      // Replace selection with expanded version
      this.api.ui.replaceSelection(expandedText);

      const originalWords = this.countWords(selection.text);
      const expandedWords = this.countWords(expandedText);
      const increase = (((expandedWords - originalWords) / originalWords) * 100).toFixed(0);

      this.showNotification(
        `🔍 Added more detail: ${originalWords} → ${expandedWords} words (+${increase}%)`,
        'info'
      );
    } catch (error) {
      console.error('Content Outliner: Error expanding more:', error);
      this.showNotification('Failed to expand content.', 'error');
    }
  }

  /**
   * Expand an entire section
   */
  async expandSection(): Promise<void> {
    const currentSection = this.getCurrentSection();

    if (!currentSection) {
      this.showNotification('Could not detect current section', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Expanding section...', 'info');

      const settings = this.getSettings();
      const style = String(settings['writing-style'] || 'professional');
      const depth = String(settings['expansion-depth'] || 'moderate');

      const prompt = `Expand this section from outline to full text.
Style: ${style}
Depth: ${depth}

Section:
${currentSection}

Provide a well-structured, coherent expansion maintaining the original outline structure.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const expandedSection = analysis.summary;

      // Replace section with expanded version
      const content = this.api.ui.getEditorContent();
      const newContent = content.replace(currentSection, expandedSection);
      this.api.ui.setEditorContent(newContent);

      const originalWords = this.countWords(currentSection);
      const expandedWords = this.countWords(expandedSection);
      const increase = (((expandedWords - originalWords) / originalWords) * 100).toFixed(0);

      this.showNotification(
        `📄 Section expanded: ${originalWords} → ${expandedWords} words (+${increase}%)`,
        'info'
      );
    } catch (error) {
      console.error('Content Outliner: Error expanding section:', error);
      this.showNotification('Failed to expand section.', 'error');
    }
  }

  /**
   * Generate full draft from outline
   */
  async generateDraft(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    const confirm = window.confirm(
      'This will transform your entire outline into a comprehensive draft. The original outline will be replaced. Continue?'
    );

    if (!confirm) return;

    try {
      this.showNotification('Generating draft from outline...', 'info');

      const settings = this.getSettings();
      const style = String(settings['writing-style'] || 'professional');
      const targetWords = Number(settings['target-word-count']) || 0;
      const includeExamples = settings['include-examples'] !== false;

      const prompt = `Transform this outline into a comprehensive, well-written article.

Writing Style: ${style}
${targetWords > 0 ? `Target Length: ~${targetWords} words` : ''}
${includeExamples ? 'Include relevant examples and explanations.' : ''}

Outline:
${note.content}

Generate a complete, coherent article with:
- Clear introduction
- Well-developed body sections
- Smooth transitions
- Compelling conclusion
- Professional formatting`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const draft = analysis.summary;

      // Update note with draft
      await this.api.notes.update(currentNoteId, { content: draft });

      const wordCount = this.countWords(draft);
      this.showNotification(`Draft generated successfully! (${wordCount} words)`, 'info');
    } catch (error) {
      console.error('Content Outliner: Error generating draft:', error);
      this.showNotification('Failed to generate draft.', 'error');
    }
  }

  /**
   * Compress paragraphs to bullet points
   */
  async compressToBullets(): Promise<void> {
    const selection = this.api.ui.getSelection();

    if (!selection || !selection.text.trim()) {
      this.showNotification('Please select text to compress', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Compressing to bullet points...', 'info');

      const prompt = `Convert this text into concise, well-organized bullet points.
Preserve key information but remove verbosity.
Use clear, action-oriented language.

Text:
${selection.text}

Provide clean bullet points (use - or * format).`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const bullets = analysis.summary;

      const settings = this.getSettings();
      const showPreview = settings['show-preview'] !== false;

      // Show preview if enabled
      let finalText = bullets;
      if (showPreview) {
        const previewResult = await this.showPreview(selection.text, bullets, 'compress');
        if (previewResult === null) {
          this.showNotification('Compression cancelled', 'info');
          return;
        }
        finalText = previewResult;
      }

      // Add to history
      const currentNoteId = this.api.notes.getActiveNoteId();
      const noteName = currentNoteId
        ? this.api.notes.get(currentNoteId)?.name || 'Unknown'
        : 'Unknown';
      this.addToHistory('compress', noteName, selection.text, finalText);

      // Replace selection with bullets
      this.api.ui.replaceSelection(finalText);

      const originalWords = this.countWords(selection.text);
      const compressedWords = this.countWords(finalText);
      const reduction = (((originalWords - compressedWords) / originalWords) * 100).toFixed(0);

      this.showNotification(
        `📝 Compressed to bullet points: ${originalWords} → ${compressedWords} words (-${reduction}%)`,
        'info'
      );
    } catch (error) {
      console.error('Content Outliner: Error compressing text:', error);
      this.showNotification('Failed to compress text.', 'error');
    }
  }

  /**
   * Suggest structure improvements
   */
  async suggestStructureImprovements(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing document structure...', 'info');

      const prompt = `Analyze this document structure and provide:
1. Overall assessment of the structure
2. Specific suggestions for improvement (categorized as: organization, missing, merge, split, or reorder)
3. Impact level for each suggestion (high, medium, or low)
4. Key topics covered

Document:
${note.content}

Respond in JSON format:
{
  "assessment": "Overall assessment of document structure",
  "suggestions": [
    {
      "category": "organization|missing|merge|split|reorder",
      "title": "Brief title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "actionable": true|false
    }
  ],
  "keyTopics": ["topic1", "topic2"]
}`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      // Try to parse structured response
      interface StructuredResponse {
        assessment: string;
        suggestions: Array<{
          category: string;
          title: string;
          description: string;
          impact: string;
          actionable: boolean;
        }>;
        keyTopics: string[];
      }

      let structuredData: StructuredResponse;
      try {
        const jsonMatch = analysis.summary.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]) as StructuredResponse;
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // Fallback to simple format
        structuredData = {
          assessment: analysis.summary,
          suggestions: [],
          keyTopics: analysis.keyTopics || [],
        };
      }

      // Convert to StructureSuggestion format
      const suggestions: StructureSuggestion[] = (structuredData.suggestions || []).map(
        (
          s: {
            category: string;
            title: string;
            description: string;
            impact: string;
            actionable: boolean;
          },
          index: number
        ) => ({
          id: `suggestion-${index}`,
          category: s.category as StructureSuggestion['category'],
          title: s.title,
          description: s.description,
          impact: s.impact as StructureSuggestion['impact'],
          actionable: s.actionable || false,
        })
      );

      const handleExport = () => {
        const report = this.generateStructureReport(
          note.name,
          structuredData.assessment,
          suggestions,
          structuredData.keyTopics
        );
        navigator.clipboard.writeText(report);
        this.showNotification('Report copied to clipboard!', 'info');
      };

      // Show the modal with StructureSuggestionsPanel
      try {
        await this.api.ui.showModal(
          `Structure Analysis for "${note.name}"`,
          React.createElement(StructureSuggestionsPanel, {
            documentName: note.name,
            assessment: structuredData.assessment || 'No assessment available',
            suggestions,
            keyTopics: structuredData.keyTopics || [],
            onClose: () => {},
            onExport: handleExport,
          })
        );
      } catch (error) {
        console.error('Error showing structure suggestions panel:', error);
        this.showNotification('Error displaying suggestions', 'error');
      }
    } catch (error) {
      console.error('Content Outliner: Error analyzing structure:', error);
      this.showNotification('Failed to analyze structure.', 'error');
    }
  }

  /**
   * Helper: Generate structure report as markdown
   */
  private generateStructureReport(
    documentName: string,
    assessment: string,
    suggestions: StructureSuggestion[],
    keyTopics: string[]
  ): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let report = `# Structure Analysis Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Generated:** ${date} at ${time}\n\n`;
    report += `---\n\n`;
    report += `## Overall Assessment\n\n${assessment}\n\n`;

    if (keyTopics.length > 0) {
      report += `## Key Topics\n\n`;
      keyTopics.forEach(topic => {
        report += `- ${topic}\n`;
      });
      report += `\n`;
    }

    if (suggestions.length > 0) {
      report += `## Suggestions (${suggestions.length})\n\n`;
      suggestions.forEach((suggestion, index) => {
        const impactIcon =
          suggestion.impact === 'high' ? '🔴' : suggestion.impact === 'medium' ? '🟡' : '🟢';
        report += `### ${index + 1}. ${suggestion.title}\n\n`;
        report += `**Category:** ${suggestion.category} | **Impact:** ${impactIcon} ${suggestion.impact}\n\n`;
        report += `${suggestion.description}\n\n`;
        report += `---\n\n`;
      });
    }

    report += `\n*Generated by Content Outliner & Expander v2.0*\n`;
    return report;
  }

  /**
   * Helper: Extract bullet points from text
   */
  private extractBulletPoints(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.trim().match(/^[-*+]\s+.+/))
      .map(line => line.trim().replace(/^[-*+]\s+/, ''));
  }

  /**
   * Helper: Build expansion prompt
   */
  private buildExpansionPrompt(
    bullets: string[],
    style: string,
    depth: string,
    includeExamples: boolean
  ): string {
    const depthMap: Record<string, string> = {
      brief: '1-2 sentences per point',
      moderate: '1 paragraph per point',
      comprehensive: '2-3 paragraphs per point',
      detailed: 'full section per point',
    };

    return `Expand these bullet points into ${depthMap[depth] || 'full text'}.

Writing Style: ${style}
${includeExamples ? 'Include relevant examples and explanations.' : ''}

Bullet Points:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Provide clear, well-written paragraphs with smooth flow.`;
  }

  /**
   * Helper: Get current section based on cursor position
   */
  private getCurrentSection(): string | null {
    const content = this.api.ui.getEditorContent();
    const cursorPos = this.api.ui.getCursorPosition();

    // Find the current section by looking for headers before and after cursor
    const lines = content.split('\n');
    let currentLinePos = 0;
    let currentLine = 0;

    // Find which line the cursor is on
    for (let i = 0; i < lines.length; i++) {
      if (currentLinePos + lines[i].length >= cursorPos) {
        currentLine = i;
        break;
      }
      currentLinePos += lines[i].length + 1; // +1 for newline
    }

    // Find the nearest heading before cursor
    let sectionStart = 0;
    for (let i = currentLine; i >= 0; i--) {
      if (lines[i].match(/^#+\s+/)) {
        sectionStart = i;
        break;
      }
    }

    // Find the next heading after cursor (or end of document)
    let sectionEnd = lines.length;
    for (let i = currentLine + 1; i < lines.length; i++) {
      if (lines[i].match(/^#+\s+/)) {
        sectionEnd = i;
        break;
      }
    }

    // Extract the section
    const section = lines.slice(sectionStart, sectionEnd).join('\n');
    return section.trim() || null;
  }

  /**
   * Helper: Count words in text
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  /**
   * Show expansion history panel (NEW v2.0)
   */
  async showExpansionHistory(): Promise<void> {
    const history = this.getExpansionHistory();

    const handleUndo = async (entry: ExpansionHistoryEntry) => {
      const note = this.api.notes.get(entry.noteName);
      if (!note) {
        this.showNotification('Note not found', 'error');
        return;
      }

      // Replace the expanded text with the original
      const updatedContent = note.content.replace(entry.afterText, entry.beforeText);

      if (updatedContent === note.content) {
        this.showNotification(
          'Content not found in note (may have been manually edited)',
          'warning'
        );
        return;
      }

      await this.api.notes.update(note.id, { content: updatedContent });

      // Remove from history
      let currentHistory = this.getExpansionHistory();
      currentHistory = currentHistory.filter(h => h.id !== entry.id);
      this.saveExpansionHistory(currentHistory);

      this.showNotification(`Undid ${this.getTypeLabel(entry.type)}`, 'info');
    };

    const handleClearHistory = () => {
      this.saveExpansionHistory([]);
      this.showNotification('History cleared', 'info');
    };

    try {
      await this.api.ui.showModal(
        'Expansion History',
        React.createElement(ExpansionHistoryPanel, {
          history,
          onUndo: handleUndo,
          onClearHistory: handleClearHistory,
          onClose: () => {},
        })
      );
    } catch (error) {
      console.error('Error showing expansion history:', error);
      this.showNotification('Error displaying history', 'error');
    }
  }

  /**
   * Batch expand all sections (NEW v2.0)
   */
  async batchExpandSections(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    // Detect all sections
    const sections = this.extractSections(note.content);

    if (sections.length === 0) {
      this.showNotification('No sections found in document', 'warning');
      return;
    }

    const confirm = window.confirm(
      `Found ${sections.length} section(s) to expand. This will analyze each section and show a preview. Continue?`
    );

    if (!confirm) return;

    this.showNotification(`Analyzing ${sections.length} sections...`, 'info');

    // For simplicity in this implementation, we'll expand them one at a time
    // A full implementation would show all in a batch UI
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      try {
        const settings = this.getSettings();
        const style = String(settings['writing-style'] || 'professional');
        const depth = String(settings['expansion-depth'] || 'moderate');

        const prompt = `Expand this section from outline to full text.
Style: ${style}
Depth: ${depth}

Section:
${section}

Provide a well-structured, coherent expansion.`;

        const analysis = await this.api.ai.analyzeContent(prompt);
        const expandedSection = analysis.summary;

        // Replace section
        const newContent = note.content.replace(section, expandedSection);
        await this.api.notes.update(currentNoteId, { content: newContent });

        this.showNotification(`Expanded section ${i + 1}/${sections.length}`, 'info');
      } catch (error) {
        console.error(`Error expanding section ${i + 1}:`, error);
      }
    }

    this.showNotification('Batch expansion complete!', 'info');
  }

  /**
   * Helper: Extract all sections from content
   */
  private extractSections(content: string): string[] {
    const sections: string[] = [];
    const lines = content.split('\n');
    let currentSection: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(/^#+\s+/)) {
        // New heading found
        if (currentSection.length > 0) {
          sections.push(currentSection.join('\n').trim());
          currentSection = [];
        }
      }

      currentSection.push(line);
    }

    // Add last section
    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n').trim());
    }

    return sections.filter(s => s.length > 0);
  }

  /**
   * Helper: Get expansion history from localStorage
   */
  private getExpansionHistory(): ExpansionHistoryEntry[] {
    const settings = this.getSettings();
    if (!settings['enable-history']) return [];

    try {
      const data = localStorage.getItem('content-outliner-history');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading expansion history:', error);
    }
    return [];
  }

  /**
   * Helper: Save expansion history to localStorage
   */
  private saveExpansionHistory(history: ExpansionHistoryEntry[]): void {
    try {
      // Keep only last 50 entries
      const trimmed = history.slice(-50);
      localStorage.setItem('content-outliner-history', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving expansion history:', error);
    }
  }

  /**
   * Helper: Add entry to history
   */
  private addToHistory(
    type: 'expand' | 'compress' | 'expandMore' | 'section' | 'draft',
    noteName: string,
    beforeText: string,
    afterText: string
  ): void {
    const settings = this.getSettings();
    if (!settings['enable-history']) return;

    const history = this.getExpansionHistory();
    const entry: ExpansionHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      noteName,
      beforeText,
      afterText,
      wordCountBefore: this.countWords(beforeText),
      wordCountAfter: this.countWords(afterText),
    };
    history.push(entry);
    this.saveExpansionHistory(history);
  }

  /**
   * Helper: Get type label for display
   */
  private getTypeLabel(type: string): string {
    switch (type) {
      case 'expand':
        return 'bullet point expansion';
      case 'compress':
        return 'compression';
      case 'expandMore':
        return 'progressive expansion';
      case 'section':
        return 'section expansion';
      case 'draft':
        return 'draft generation';
      default:
        return 'transformation';
    }
  }

  /**
   * Helper: Show preview modal (NEW v2.0)
   */
  private async showPreview(
    original: string,
    expanded: string,
    type: 'expand' | 'compress' | 'expandMore' | 'section' | 'draft'
  ): Promise<string | null> {
    return new Promise(resolve => {
      const wordCount = {
        before: this.countWords(original),
        after: this.countWords(expanded),
      };

      this.api.ui.showModal(
        'Preview Changes',
        React.createElement(ExpansionPreviewPanel, {
          original,
          expanded,
          wordCount,
          type,
          onAccept: finalText => {
            resolve(finalText || expanded);
          },
          onReject: () => {
            resolve(null);
          },
          onClose: () => {
            resolve(null);
          },
        })
      );
    });
  }

  /**
   * Get plugin settings
   */
  private getSettings(): Record<string, unknown> {
    // Try new ID first, fallback to old ID for migration
    const newSettings = this.api.settings.get('ai-content-structurer');
    const oldSettings = this.api.settings.get('ai-content-outliner-expander');

    // If we have old settings but not new, migrate them
    if (oldSettings && !newSettings) {
      this.api.settings.set('ai-content-structurer', oldSettings);
      return oldSettings;
    }

    return newSettings || {};
  }

  /**
   * Show notification if enabled
   */
  private showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const settings = this.getSettings();
    if (settings['enable-notifications'] !== false) {
      this.api.ui.showNotification(message, type);
    }
  }

  // ========================================================================
  // NEW v3.0 METHODS - Structure Analysis & Restructuring
  // ========================================================================

  /**
   * Find logical flow problems in content (NEW v3.0)
   */
  async findFlowIssues(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing content flow...', 'info');

      const prompt = `Analyze this document for logical flow problems.

Document:
${note.content}

Identify:
1. Abrupt topic changes without transitions
2. Ideas presented in illogical order
3. Disconnected paragraphs
4. Missing context or background
5. Circular arguments or repetition

Respond in JSON format:
{
  "issues": [
    {
      "severity": "high|medium|low",
      "title": "Brief description",
      "description": "Detailed explanation",
      "location": "Approximate line or section",
      "suggestion": "How to fix"
    }
  ],
  "overallScore": 0-100,
  "summary": "Overall flow assessment"
}`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      // Parse response
      interface FlowAnalysis {
        issues: Array<{
          severity: string;
          title: string;
          description: string;
          location: string;
          suggestion: string;
        }>;
        overallScore: number;
        summary: string;
      }

      let flowData: FlowAnalysis;
      try {
        const jsonMatch = analysis.summary.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          flowData = JSON.parse(jsonMatch[0]) as FlowAnalysis;
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        flowData = {
          issues: [],
          overallScore: 75,
          summary: analysis.summary,
        };
      }

      // Convert to suggestions for the panel
      const suggestions: StructureSuggestion[] = flowData.issues.map((issue, index) => ({
        id: `flow-${index}`,
        category: 'organization' as const,
        title: issue.title,
        description: `${issue.description}\n\n📍 Location: ${issue.location}\n💡 Suggestion: ${issue.suggestion}`,
        impact: issue.severity as 'high' | 'medium' | 'low',
        actionable: true,
      }));

      const handleExport = () => {
        const report = this.generateFlowReport(
          note.name,
          flowData.overallScore,
          flowData.summary,
          flowData.issues
        );
        navigator.clipboard.writeText(report);
        this.showNotification('Flow analysis report copied to clipboard!', 'info');
      };

      await this.api.ui.showModal(
        `Flow Analysis: "${note.name}"`,
        React.createElement(StructureSuggestionsPanel, {
          documentName: note.name,
          assessment: `Flow Score: ${flowData.overallScore}/100\n\n${flowData.summary}`,
          suggestions,
          keyTopics: [],
          onClose: () => {},
          onExport: handleExport,
        })
      );
    } catch (error) {
      console.error('Content Structurer: Error analyzing flow:', error);
      this.showNotification('Failed to analyze flow.', 'error');
    }
  }

  /**
   * Analyze argument strength and find logical fallacies (NEW v3.0)
   */
  async analyzeArguments(): Promise<void> {
    const selection = this.api.ui.getSelection();
    const hasSelection = selection && selection.text.trim();

    let content: string;
    let documentName: string;

    if (hasSelection) {
      content = selection.text;
      documentName = 'Selected Text';
    } else {
      const currentNoteId = this.api.notes.getActiveNoteId();
      if (!currentNoteId) {
        this.showNotification('No note is currently open', 'warning');
        return;
      }
      const note = this.api.notes.get(currentNoteId);
      if (!note) {
        this.showNotification('Could not load current note', 'error');
        return;
      }
      content = note.content;
      documentName = note.name;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing arguments...', 'info');

      const settings = this.getSettings();
      const checkArguments = settings['check-arguments'] !== false;

      const prompt = `Analyze the arguments and reasoning in this text.

Text:
${content}

Identify:
1. Claims made without evidence or support
2. Logical fallacies (ad hominem, straw man, false dichotomy, etc.)
3. Weak or unconvincing arguments
4. Missing counterarguments or alternative perspectives
5. Unsupported statistics or facts
${checkArguments ? '6. Overall argument strength and coherence' : ''}

Respond in JSON format:
{
  "claims": [
    {
      "claim": "The claim text",
      "hasEvidence": true/false,
      "strength": "strong|weak|unsupported",
      "suggestion": "How to strengthen"
    }
  ],
  "fallacies": [
    {
      "type": "Fallacy name",
      "location": "Where it occurs",
      "explanation": "Why it's a fallacy"
    }
  ],
  "overallStrength": 0-100,
  "summary": "Overall argument assessment"
}`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      // Parse response
      interface ArgumentAnalysis {
        claims: Array<{
          claim: string;
          hasEvidence: boolean;
          strength: string;
          suggestion: string;
        }>;
        fallacies: Array<{
          type: string;
          location: string;
          explanation: string;
        }>;
        overallStrength: number;
        summary: string;
      }

      let argData: ArgumentAnalysis;
      try {
        const jsonMatch = analysis.summary.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          argData = JSON.parse(jsonMatch[0]) as ArgumentAnalysis;
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        argData = {
          claims: [],
          fallacies: [],
          overallStrength: 70,
          summary: analysis.summary,
        };
      }

      // Convert to suggestions
      const suggestions: StructureSuggestion[] = [];

      // Add weak claims
      argData.claims
        ?.filter(c => c.strength !== 'strong')
        .forEach((claim, index) => {
          suggestions.push({
            id: `claim-${index}`,
            category: 'missing' as const,
            title: `Weak/Unsupported Claim`,
            description: `"${claim.claim}"\n\n💡 ${claim.suggestion}`,
            impact: claim.hasEvidence ? ('medium' as const) : ('high' as const),
            actionable: true,
          });
        });

      // Add fallacies
      argData.fallacies?.forEach((fallacy, index) => {
        suggestions.push({
          id: `fallacy-${index}`,
          category: 'organization' as const,
          title: `Logical Fallacy: ${fallacy.type}`,
          description: `📍 ${fallacy.location}\n\n${fallacy.explanation}`,
          impact: 'high' as const,
          actionable: true,
        });
      });

      const handleExport = () => {
        const report = this.generateArgumentReport(
          documentName,
          argData.overallStrength,
          argData.summary,
          argData.claims,
          argData.fallacies
        );
        navigator.clipboard.writeText(report);
        this.showNotification('Argument analysis report copied to clipboard!', 'info');
      };

      await this.api.ui.showModal(
        `Argument Analysis: "${documentName}"`,
        React.createElement(StructureSuggestionsPanel, {
          documentName,
          assessment: `Argument Strength: ${argData.overallStrength}/100\n\n${argData.summary}`,
          suggestions,
          keyTopics: [],
          onClose: () => {},
          onExport: handleExport,
        })
      );
    } catch (error) {
      console.error('Content Structurer: Error analyzing arguments:', error);
      this.showNotification('Failed to analyze arguments.', 'error');
    }
  }

  /**
   * Find places that need citations (NEW v3.0)
   */
  async findCitationNeeds(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    const settings = this.getSettings();
    const academicMode = settings['academic-mode'] === true;

    try {
      this.showNotification('Finding citation needs...', 'info');

      const prompt = `Analyze this document for statements that need citations or sources.

Document:
${note.content}

Identify:
1. Factual claims without sources
2. Statistics or data without attribution
3. Quotes without proper citation
4. Controversial or debatable statements
5. "Research shows" or "studies indicate" without specifics
${academicMode ? '6. Missing bibliography or reference section' : ''}

Respond in JSON format:
{
  "citationNeeds": [
    {
      "text": "The statement needing citation",
      "location": "Approximate line or section",
      "reason": "Why it needs a citation",
      "priority": "high|medium|low"
    }
  ],
  "summary": "Overall citation assessment"
}`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      // Parse response
      interface CitationAnalysis {
        citationNeeds: Array<{
          text: string;
          location: string;
          reason: string;
          priority: string;
        }>;
        summary: string;
      }

      let citData: CitationAnalysis;
      try {
        const jsonMatch = analysis.summary.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          citData = JSON.parse(jsonMatch[0]) as CitationAnalysis;
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        citData = {
          citationNeeds: [],
          summary: analysis.summary,
        };
      }

      // Convert to suggestions
      const suggestions: StructureSuggestion[] = citData.citationNeeds.map((need, index) => ({
        id: `citation-${index}`,
        category: 'missing' as const,
        title: `Citation Needed`,
        description: `"${need.text}"\n\n📍 ${need.location}\n\n${need.reason}`,
        impact: need.priority as 'high' | 'medium' | 'low',
        actionable: true,
      }));

      const handleExport = () => {
        const report = this.generateCitationReport(
          note.name,
          citData.summary,
          citData.citationNeeds
        );
        navigator.clipboard.writeText(report);
        this.showNotification('Citation analysis report copied to clipboard!', 'info');
      };

      await this.api.ui.showModal(
        `Citation Analysis: "${note.name}"`,
        React.createElement(StructureSuggestionsPanel, {
          documentName: note.name,
          assessment: citData.summary,
          suggestions,
          keyTopics: [],
          onClose: () => {},
          onExport: handleExport,
        })
      );
    } catch (error) {
      console.error('Content Structurer: Error finding citation needs:', error);
      this.showNotification('Failed to analyze citations.', 'error');
    }
  }

  /**
   * Break wall of text into logical sections (NEW v3.0)
   */
  async breakIntoSections(): Promise<void> {
    const selection = this.api.ui.getSelection();

    if (!selection || !selection.text.trim()) {
      this.showNotification('Please select the text to break into sections', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Analyzing content structure...', 'info');

      const prompt = `Take this text and break it into logical sections with appropriate headings.

Text:
${selection.text}

1. Identify distinct topics or themes
2. Suggest where to break into sections
3. Propose clear, descriptive headings (H2 or H3)
4. Maintain all original content, just add structure

Provide the restructured text with markdown headings.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const restructured = analysis.summary;

      const settings = this.getSettings();
      const showPreview = settings['show-preview'] !== false;

      let finalText = restructured;
      if (showPreview) {
        const previewResult = await this.showPreview(selection.text, restructured, 'section');
        if (previewResult === null) {
          this.showNotification('Restructuring cancelled', 'info');
          return;
        }
        finalText = previewResult;
      }

      // Replace selection
      this.api.ui.replaceSelection(finalText);

      // Count headings added
      const headingsAdded = (finalText.match(/^#+\s+/gm) || []).length;
      this.showNotification(`✨ Added ${headingsAdded} section heading(s)`, 'info');
    } catch (error) {
      console.error('Content Structurer: Error breaking into sections:', error);
      this.showNotification('Failed to break into sections.', 'error');
    }
  }

  /**
   * Suggest headings for content (NEW v3.0)
   */
  async suggestHeadings(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Suggesting headings...', 'info');

      const prompt = `Analyze this document and suggest where to add headings.

Document:
${note.content}

1. Detect topic changes and logical breaks
2. Suggest appropriate heading levels (H2, H3)
3. Propose descriptive heading text
4. Maintain proper hierarchy

Respond in JSON format:
{
  "suggestions": [
    {
      "location": "After paragraph about...",
      "level": 2 or 3,
      "heading": "Proposed heading text",
      "reason": "Why this heading helps"
    }
  ]
}`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      // Parse response
      interface HeadingSuggestion {
        location: string;
        level: number;
        heading: string;
        reason: string;
      }

      let headingSuggestions: HeadingSuggestion[] = [];
      try {
        const jsonMatch = analysis.summary.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]) as { suggestions: HeadingSuggestion[] };
          headingSuggestions = data.suggestions || [];
        }
      } catch {
        // Fallback: extract from text
      }

      if (headingSuggestions.length === 0) {
        this.showNotification('No heading suggestions found', 'info');
        return;
      }

      // Convert to structure suggestions
      const suggestions: StructureSuggestion[] = headingSuggestions.map((s, index) => ({
        id: `heading-${index}`,
        category: 'organization' as const,
        title: `${'#'.repeat(s.level)} ${s.heading}`,
        description: `📍 ${s.location}\n\n${s.reason}`,
        impact: 'medium' as const,
        actionable: true,
      }));

      const handleExport = () => {
        const report = this.generateHeadingReport(note.name, headingSuggestions);
        navigator.clipboard.writeText(report);
        this.showNotification('Heading suggestions copied to clipboard!', 'info');
      };

      await this.api.ui.showModal(
        `Heading Suggestions: "${note.name}"`,
        React.createElement(StructureSuggestionsPanel, {
          documentName: note.name,
          assessment: `Found ${headingSuggestions.length} places where headings would improve structure`,
          suggestions,
          keyTopics: [],
          onClose: () => {},
          onExport: handleExport,
        })
      );
    } catch (error) {
      console.error('Content Structurer: Error suggesting headings:', error);
      this.showNotification('Failed to suggest headings.', 'error');
    }
  }

  /**
   * Improve content flow by reordering and adding transitions (NEW v3.0)
   */
  async improveFlow(): Promise<void> {
    const selection = this.api.ui.getSelection();

    if (!selection || !selection.text.trim()) {
      this.showNotification('Please select text to improve flow', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Improving content flow...', 'info');

      const settings = this.getSettings();
      const suggestTransitions = settings['suggest-transitions'] !== false;

      const prompt = `Improve the logical flow of this content.

Text:
${selection.text}

Actions:
1. Reorder paragraphs/ideas for better logical progression
2. ${suggestTransitions ? 'Add transition sentences between sections' : ''}
3. Group related ideas together
4. Move tangential content to appropriate places

Provide the restructured text with improved flow.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const improved = analysis.summary;

      const showPreview = settings['show-preview'] !== false;

      let finalText = improved;
      if (showPreview) {
        const previewResult = await this.showPreview(selection.text, improved, 'section');
        if (previewResult === null) {
          this.showNotification('Flow improvement cancelled', 'info');
          return;
        }
        finalText = previewResult;
      }

      // Replace selection
      this.api.ui.replaceSelection(finalText);

      this.showNotification('🔄 Content flow improved', 'info');
    } catch (error) {
      console.error('Content Structurer: Error improving flow:', error);
      this.showNotification('Failed to improve flow.', 'error');
    }
  }

  /**
   * Find redundant or repetitive content (NEW v3.0)
   */
  async findRedundancy(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Detecting redundancy...', 'info');

      const prompt = `Analyze this document for redundancy and repetition.

Document:
${note.content}

Identify:
1. Ideas or points stated multiple times
2. Overlapping or duplicate sections
3. Repeated examples or explanations
4. Circular reasoning

Respond in JSON format:
{
  "redundancies": [
    {
      "type": "repeated_idea|duplicate_section|circular",
      "instances": ["First instance...", "Second instance..."],
      "suggestion": "How to consolidate or remove"
    }
  ],
  "summary": "Overall redundancy assessment"
}`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      // Parse response
      interface RedundancyAnalysis {
        redundancies: Array<{
          type: string;
          instances: string[];
          suggestion: string;
        }>;
        summary: string;
      }

      let redData: RedundancyAnalysis;
      try {
        const jsonMatch = analysis.summary.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          redData = JSON.parse(jsonMatch[0]) as RedundancyAnalysis;
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        redData = {
          redundancies: [],
          summary: analysis.summary,
        };
      }

      if (redData.redundancies.length === 0) {
        this.showNotification('No redundancy detected - content looks good!', 'info');
        return;
      }

      // Convert to suggestions
      const suggestions: StructureSuggestion[] = redData.redundancies.map((red, index) => ({
        id: `redundancy-${index}`,
        category: 'merge' as const,
        title: `Redundancy Detected: ${red.type.replace('_', ' ')}`,
        description: `Found ${red.instances.length} instances:\n\n${red.instances.map((inst, i) => `${i + 1}. "${inst.substring(0, 100)}..."`).join('\n\n')}\n\n💡 ${red.suggestion}`,
        impact: red.instances.length > 2 ? ('high' as const) : ('medium' as const),
        actionable: true,
      }));

      const handleExport = () => {
        const report = this.generateRedundancyReport(
          note.name,
          redData.summary,
          redData.redundancies
        );
        navigator.clipboard.writeText(report);
        this.showNotification('Redundancy report copied to clipboard!', 'info');
      };

      await this.api.ui.showModal(
        `Redundancy Analysis: "${note.name}"`,
        React.createElement(StructureSuggestionsPanel, {
          documentName: note.name,
          assessment: redData.summary,
          suggestions,
          keyTopics: [],
          onClose: () => {},
          onExport: handleExport,
        })
      );
    } catch (error) {
      console.error('Content Structurer: Error detecting redundancy:', error);
      this.showNotification('Failed to detect redundancy.', 'error');
    }
  }

  /**
   * Create structured outline from narrative text (NEW v3.0)
   */
  async createOutlineFromText(): Promise<void> {
    const selection = this.api.ui.getSelection();

    if (!selection || !selection.text.trim()) {
      this.showNotification('Please select narrative text to convert to outline', 'warning');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    try {
      this.showNotification('Creating outline from text...', 'info');

      const prompt = `Convert this narrative text into a structured outline.

Text:
${selection.text}

Create:
1. Hierarchical structure with main points and sub-points
2. Use markdown headings (##, ###) and bullet points (-)
3. Capture all key ideas concisely
4. Organize logically by theme/topic

Provide clean, well-organized outline.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const outline = analysis.summary;

      const settings = this.getSettings();
      const showPreview = settings['show-preview'] !== false;

      let finalText = outline;
      if (showPreview) {
        const previewResult = await this.showPreview(selection.text, outline, 'compress');
        if (previewResult === null) {
          this.showNotification('Outline creation cancelled', 'info');
          return;
        }
        finalText = previewResult;
      }

      // Add to history
      const currentNoteId = this.api.notes.getActiveNoteId();
      const noteName = currentNoteId
        ? this.api.notes.get(currentNoteId)?.name || 'Unknown'
        : 'Unknown';
      this.addToHistory('compress', noteName, selection.text, finalText);

      // Replace selection
      this.api.ui.replaceSelection(finalText);

      this.showNotification('📝 Outline created from narrative', 'info');
    } catch (error) {
      console.error('Content Structurer: Error creating outline:', error);
      this.showNotification('Failed to create outline.', 'error');
    }
  }

  /**
   * Convert casual notes to academic structure (NEW v3.0)
   */
  async convertToAcademic(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    const confirm = window.confirm(
      'This will restructure your entire note into academic paper format. Continue?'
    );

    if (!confirm) return;

    try {
      this.showNotification('Converting to academic structure...', 'info');

      const prompt = `Transform these notes into a properly structured academic paper format.

Notes:
${note.content}

Create academic structure with:
1. ## Abstract (brief summary)
2. ## Introduction (background and objectives)
3. ## Literature Review or Background (if applicable)
4. ## Methodology (if applicable)
5. ## Main Body (organized by themes/topics with ### subheadings)
6. ## Discussion (analysis and implications)
7. ## Conclusion (summary and future work)
8. ## References (placeholder with [?] for citation needs)

Maintain all content but reorganize into proper academic format.
Add [CITATION NEEDED] markers where sources should be cited.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const academic = analysis.summary;

      // Update note
      await this.api.notes.update(currentNoteId, { content: academic });

      this.showNotification('🎓 Converted to academic structure', 'info');
    } catch (error) {
      console.error('Content Structurer: Error converting to academic:', error);
      this.showNotification('Failed to convert to academic format.', 'error');
    }
  }

  // ========================================================================
  // Report Generation Helpers (NEW v3.0)
  // ========================================================================

  private generateFlowReport(
    documentName: string,
    score: number,
    summary: string,
    issues: Array<{
      severity: string;
      title: string;
      description: string;
      location: string;
      suggestion: string;
    }>
  ): string {
    const date = new Date().toLocaleDateString();
    let report = `# Flow Analysis Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Flow Score:** ${score}/100\n`;
    report += `**Date:** ${date}\n\n`;
    report += `## Summary\n\n${summary}\n\n`;
    report += `## Issues (${issues.length})\n\n`;
    issues.forEach((issue, i) => {
      const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      report += `### ${i + 1}. ${issue.title} ${icon}\n\n`;
      report += `**Location:** ${issue.location}\n\n`;
      report += `${issue.description}\n\n`;
      report += `**Suggestion:** ${issue.suggestion}\n\n`;
    });
    return report;
  }

  private generateArgumentReport(
    documentName: string,
    strength: number,
    summary: string,
    claims: Array<{ claim: string; hasEvidence: boolean; strength: string; suggestion: string }>,
    fallacies: Array<{ type: string; location: string; explanation: string }>
  ): string {
    const date = new Date().toLocaleDateString();
    let report = `# Argument Analysis Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Argument Strength:** ${strength}/100\n`;
    report += `**Date:** ${date}\n\n`;
    report += `## Summary\n\n${summary}\n\n`;

    if (claims && claims.length > 0) {
      report += `## Claims Analysis\n\n`;
      claims.forEach((claim, i) => {
        report += `### Claim ${i + 1}\n`;
        report += `"${claim.claim}"\n\n`;
        report += `- **Strength:** ${claim.strength}\n`;
        report += `- **Has Evidence:** ${claim.hasEvidence ? 'Yes' : 'No'}\n`;
        report += `- **Suggestion:** ${claim.suggestion}\n\n`;
      });
    }

    if (fallacies && fallacies.length > 0) {
      report += `## Logical Fallacies\n\n`;
      fallacies.forEach((fallacy, i) => {
        report += `### ${i + 1}. ${fallacy.type}\n`;
        report += `**Location:** ${fallacy.location}\n\n`;
        report += `${fallacy.explanation}\n\n`;
      });
    }

    return report;
  }

  private generateCitationReport(
    documentName: string,
    summary: string,
    needs: Array<{ text: string; location: string; reason: string; priority: string }>
  ): string {
    const date = new Date().toLocaleDateString();
    let report = `# Citation Needs Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Date:** ${date}\n\n`;
    report += `## Summary\n\n${summary}\n\n`;
    report += `## Citations Needed (${needs.length})\n\n`;
    needs.forEach((need, i) => {
      const icon = need.priority === 'high' ? '🔴' : need.priority === 'medium' ? '🟡' : '🟢';
      report += `### ${i + 1}. ${icon}\n`;
      report += `**Text:** "${need.text}"\n\n`;
      report += `**Location:** ${need.location}\n\n`;
      report += `**Reason:** ${need.reason}\n\n`;
    });
    return report;
  }

  private generateHeadingReport(
    documentName: string,
    suggestions: Array<{ location: string; level: number; heading: string; reason: string }>
  ): string {
    const date = new Date().toLocaleDateString();
    let report = `# Heading Suggestions Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Date:** ${date}\n\n`;
    report += `## Suggested Headings (${suggestions.length})\n\n`;
    suggestions.forEach((s, i) => {
      report += `### ${i + 1}. ${'#'.repeat(s.level)} ${s.heading}\n`;
      report += `**Location:** ${s.location}\n\n`;
      report += `**Reason:** ${s.reason}\n\n`;
    });
    return report;
  }

  private generateRedundancyReport(
    documentName: string,
    summary: string,
    redundancies: Array<{ type: string; instances: string[]; suggestion: string }>
  ): string {
    const date = new Date().toLocaleDateString();
    let report = `# Redundancy Analysis Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Date:** ${date}\n\n`;
    report += `## Summary\n\n${summary}\n\n`;
    report += `## Redundancies Found (${redundancies.length})\n\n`;
    redundancies.forEach((red, i) => {
      report += `### ${i + 1}. ${red.type.replace('_', ' ')}\n`;
      report += `**Instances (${red.instances.length}):**\n\n`;
      red.instances.forEach((inst, j) => {
        report += `${j + 1}. "${inst}"\n\n`;
      });
      report += `**Suggestion:** ${red.suggestion}\n\n`;
    });
    return report;
  }

  // ========================================================================
  // NEW v3.1 FEATURES - Enhanced Analysis & Templates
  // ========================================================================

  /**
   * Calculate readability metrics (Flesch-Kincaid and more) - NEW v3.1
   */
  async analyzeReadability(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    try {
      this.showNotification('Analyzing readability...', 'info');

      // Calculate metrics
      const metrics = this.calculateReadabilityMetrics(note.content);

      // Generate report
      const report = this.generateReadabilityReport(note.name, metrics);

      // Check settings for auto-export
      const settings = this.getSettings();
      if (settings['auto-export-reports']) {
        navigator.clipboard.writeText(report);
        this.showNotification('📊 Readability report copied to clipboard!', 'info');
      }

      // Show modal with results
      await this.api.ui.showModal(
        `Readability Analysis: "${note.name}"`,
        React.createElement(
          'div',
          { style: { padding: '20px', fontFamily: 'monospace' } },
          React.createElement(
            'h3',
            {},
            `Flesch-Kincaid Grade Level: ${metrics.fleschKincaidGrade.toFixed(1)}`
          ),
          React.createElement(
            'p',
            {},
            `Reading Ease: ${metrics.fleschReadingEase.toFixed(1)}/100 (${metrics.readingLevel})`
          ),
          React.createElement('h3', {}, 'Text Statistics'),
          React.createElement(
            'ul',
            {},
            React.createElement('li', {}, `Total Words: ${metrics.wordCount}`),
            React.createElement('li', {}, `Total Sentences: ${metrics.sentenceCount}`),
            React.createElement('li', {}, `Total Syllables: ${metrics.syllableCount}`),
            React.createElement(
              'li',
              {},
              `Avg Words/Sentence: ${metrics.avgWordsPerSentence.toFixed(1)}`
            ),
            React.createElement(
              'li',
              {},
              `Avg Syllables/Word: ${metrics.avgSyllablesPerWord.toFixed(2)}`
            )
          ),
          React.createElement('h3', {}, 'Complexity Analysis'),
          React.createElement(
            'ul',
            {},
            React.createElement(
              'li',
              {},
              `Complex Words: ${metrics.complexWordPercentage.toFixed(1)}%`
            ),
            React.createElement(
              'li',
              {},
              `Passive Voice: ${metrics.passiveVoicePercentage.toFixed(1)}%`
            ),
            React.createElement(
              'li',
              {},
              `Long Sentences (>25 words): ${metrics.longSentenceCount}`
            )
          ),
          React.createElement('h3', {}, 'Recommendations'),
          React.createElement(
            'ul',
            {},
            ...metrics.recommendations.map((rec: string) =>
              React.createElement('li', { key: rec }, rec)
            )
          ),
          React.createElement(
            'button',
            {
              onClick: () => {
                navigator.clipboard.writeText(report);
                this.showNotification('Report copied to clipboard!', 'info');
              },
              style: { marginTop: '20px', padding: '10px 20px', cursor: 'pointer' },
            },
            '📋 Copy Full Report'
          )
        )
      );
    } catch (error) {
      console.error('Content Structurer: Error analyzing readability:', error);
      this.showNotification('Failed to analyze readability.', 'error');
    }
  }

  /**
   * Calculate readability metrics for text
   */
  private calculateReadabilityMetrics(text: string): {
    fleschKincaidGrade: number;
    fleschReadingEase: number;
    readingLevel: string;
    wordCount: number;
    sentenceCount: number;
    syllableCount: number;
    avgWordsPerSentence: number;
    avgSyllablesPerWord: number;
    complexWordPercentage: number;
    passiveVoicePercentage: number;
    longSentenceCount: number;
    recommendations: string[];
  } {
    // Remove markdown syntax for cleaner analysis
    const cleanText = text
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`(.+?)`/g, '$1'); // Remove inline code

    // Count sentences (split by . ! ?)
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;

    // Count words
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length || 1;

    // Count syllables
    let syllableCount = 0;
    let complexWords = 0;
    words.forEach(word => {
      const syllables = this.countSyllables(word);
      syllableCount += syllables;
      if (syllables >= 3) complexWords++;
    });

    // Calculate averages
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;

    // Flesch Reading Ease Score (0-100, higher = easier)
    const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    // Reading level description
    let readingLevel = 'Unknown';
    if (fleschReadingEase >= 90) readingLevel = 'Very Easy (5th grade)';
    else if (fleschReadingEase >= 80) readingLevel = 'Easy (6th grade)';
    else if (fleschReadingEase >= 70) readingLevel = 'Fairly Easy (7th grade)';
    else if (fleschReadingEase >= 60) readingLevel = 'Standard (8-9th grade)';
    else if (fleschReadingEase >= 50) readingLevel = 'Fairly Difficult (10-12th grade)';
    else if (fleschReadingEase >= 30) readingLevel = 'Difficult (College)';
    else readingLevel = 'Very Difficult (College Graduate)';

    // Complex word percentage
    const complexWordPercentage = (complexWords / wordCount) * 100;

    // Detect passive voice (simple heuristic)
    const passiveVoiceMatches =
      cleanText.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
    const passiveVoicePercentage = (passiveVoiceMatches.length / sentenceCount) * 100;

    // Count long sentences (>25 words)
    const longSentenceCount = sentences.filter(s => s.split(/\s+/).length > 25).length;

    // Generate recommendations
    const recommendations: string[] = [];
    if (avgWordsPerSentence > 20) {
      recommendations.push('Consider shortening sentences (avg > 20 words)');
    }
    if (complexWordPercentage > 15) {
      recommendations.push('Reduce complex words for better readability');
    }
    if (passiveVoicePercentage > 20) {
      recommendations.push(
        'Use more active voice (currently ' + passiveVoicePercentage.toFixed(0) + '% passive)'
      );
    }
    if (longSentenceCount > sentenceCount * 0.2) {
      recommendations.push('Break up long sentences (>25 words)');
    }
    if (fleschKincaidGrade > 12) {
      recommendations.push('Simplify language for broader audience');
    }

    return {
      fleschKincaidGrade,
      fleschReadingEase,
      readingLevel,
      wordCount,
      sentenceCount,
      syllableCount,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      complexWordPercentage,
      passiveVoicePercentage,
      longSentenceCount,
      recommendations,
    };
  }

  /**
   * Count syllables in a word (simple heuristic)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let count = 0;
    let prevWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevWasVowel) {
        count++;
      }
      prevWasVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e')) count--;

    // At least 1 syllable
    return Math.max(1, count);
  }

  /**
   * Generate readability report
   */
  private generateReadabilityReport(
    documentName: string,
    metrics: {
      fleschKincaidGrade: number;
      fleschReadingEase: number;
      readingLevel: string;
      wordCount: number;
      sentenceCount: number;
      syllableCount: number;
      avgWordsPerSentence: number;
      avgSyllablesPerWord: number;
      complexWordPercentage: number;
      passiveVoicePercentage: number;
      longSentenceCount: number;
      recommendations: string[];
    }
  ): string {
    const date = new Date().toLocaleDateString();
    let report = `# Readability Analysis Report\n\n`;
    report += `**Document:** ${documentName}\n`;
    report += `**Date:** ${date}\n\n`;
    report += `## Readability Scores\n\n`;
    report += `- **Flesch-Kincaid Grade Level:** ${metrics.fleschKincaidGrade.toFixed(1)}\n`;
    report += `- **Flesch Reading Ease:** ${metrics.fleschReadingEase.toFixed(1)}/100\n`;
    report += `- **Reading Level:** ${metrics.readingLevel}\n\n`;
    report += `## Text Statistics\n\n`;
    report += `- Total Words: ${metrics.wordCount}\n`;
    report += `- Total Sentences: ${metrics.sentenceCount}\n`;
    report += `- Total Syllables: ${metrics.syllableCount}\n`;
    report += `- Avg Words/Sentence: ${metrics.avgWordsPerSentence.toFixed(1)}\n`;
    report += `- Avg Syllables/Word: ${metrics.avgSyllablesPerWord.toFixed(2)}\n\n`;
    report += `## Complexity Analysis\n\n`;
    report += `- Complex Words: ${metrics.complexWordPercentage.toFixed(1)}%\n`;
    report += `- Passive Voice: ${metrics.passiveVoicePercentage.toFixed(1)}%\n`;
    report += `- Long Sentences (>25 words): ${metrics.longSentenceCount}\n\n`;
    if (metrics.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      metrics.recommendations.forEach((rec: string) => {
        report += `- ${rec}\n`;
      });
    }
    return report;
  }

  /**
   * Apply a structure template to content - NEW v3.1
   */
  async applyStructureTemplate(): Promise<void> {
    const currentNoteId = this.api.notes.getActiveNoteId();
    if (!currentNoteId) {
      this.showNotification('No note is currently open', 'warning');
      return;
    }

    const note = this.api.notes.get(currentNoteId);
    if (!note) {
      this.showNotification('Could not load current note', 'error');
      return;
    }

    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    // Get template preference or ask user
    const settings = this.getSettings();
    const preferredTemplate = (settings['structure-template'] as string) || 'none';

    // If none, show template selector
    if (preferredTemplate === 'none') {
      this.showNotification('Please set a preferred template in settings first', 'warning');
      return;
    }

    try {
      this.showNotification(`Applying ${preferredTemplate} template...`, 'info');

      const template = this.getStructureTemplate(preferredTemplate);
      const prompt = `Restructure this content to follow a ${preferredTemplate} format.

Content:
${note.content}

Template Structure:
${template}

Instructions:
1. Preserve all original information
2. Reorganize into the template structure
3. Add appropriate headings
4. Fill in any missing standard sections with [TO DO] markers
5. Maintain markdown formatting

Provide the restructured content.`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const restructured = analysis.summary;

      // Show preview
      const showPreview = settings['show-preview'] !== false;
      if (showPreview) {
        await this.api.ui.showModal(
          `Apply ${preferredTemplate} Template?`,
          React.createElement(
            'div',
            { style: { padding: '20px' } },
            React.createElement('h3', {}, 'Preview:'),
            React.createElement(
              'pre',
              { style: { whiteSpace: 'pre-wrap', maxHeight: '400px', overflow: 'auto' } },
              restructured
            ),
            React.createElement(
              'div',
              { style: { marginTop: '20px' } },
              React.createElement(
                'button',
                {
                  onClick: async () => {
                    await this.api.notes.update(currentNoteId, { content: restructured });
                    this.showNotification(`✨ Applied ${preferredTemplate} template`, 'info');
                  },
                  style: { marginRight: '10px', padding: '10px 20px' },
                },
                'Apply'
              ),
              React.createElement(
                'button',
                {
                  onClick: () => {},
                  style: { padding: '10px 20px' },
                },
                'Cancel'
              )
            )
          )
        );
      } else {
        await this.api.notes.update(currentNoteId, { content: restructured });
        this.showNotification(`✨ Applied ${preferredTemplate} template`, 'info');
      }
    } catch (error) {
      console.error('Content Structurer: Error applying template:', error);
      this.showNotification('Failed to apply template.', 'error');
    }
  }

  /**
   * Get structure template by type
   */
  private getStructureTemplate(type: string): string {
    const templates: { [key: string]: string } = {
      blog: `# [Catchy Title]

## Introduction
- Hook/opening statement
- Brief overview of topic
- What reader will learn

## Main Content
### Point 1
### Point 2
### Point 3

## Key Takeaways
- Summary of main points
- Call to action

## Conclusion
- Final thoughts
- Next steps`,

      documentation: `# [Feature/Product Name]

## Overview
Brief description and purpose

## Getting Started
### Prerequisites
### Installation
### Quick Start

## Usage
### Basic Usage
### Advanced Features
### Examples

## API Reference (if applicable)
### Methods
### Parameters
### Return Values

## Troubleshooting
Common issues and solutions

## FAQ

## Additional Resources`,

      meeting: `# [Meeting Title]

**Date:** [Date]
**Attendees:** [Names]
**Duration:** [Time]

## Agenda
1. Item 1
2. Item 2
3. Item 3

## Discussion Notes
### Topic 1
### Topic 2

## Decisions Made
- Decision 1
- Decision 2

## Action Items
- [ ] Task 1 (Owner: [Name], Due: [Date])
- [ ] Task 2 (Owner: [Name], Due: [Date])

## Next Meeting
**Date:** [Date]
**Topics:** [Preview]`,

      research: `# [Paper Title]

## Abstract
Brief summary of research (150-250 words)

## 1. Introduction
### 1.1 Background
### 1.2 Research Question
### 1.3 Objectives

## 2. Literature Review
### 2.1 Previous Work
### 2.2 Research Gap

## 3. Methodology
### 3.1 Approach
### 3.2 Data Collection
### 3.3 Analysis Methods

## 4. Results
### 4.1 Findings
### 4.2 Data Analysis

## 5. Discussion
### 5.1 Interpretation
### 5.2 Implications
### 5.3 Limitations

## 6. Conclusion
Summary and future work

## References
[Citations needed]`,

      tutorial: `# How to [Task Name]

## Introduction
What you'll learn and why it's useful

## Prerequisites
What you need before starting
- Requirement 1
- Requirement 2

## Step-by-Step Guide

### Step 1: [First Step]
Detailed instructions

### Step 2: [Second Step]
Detailed instructions

### Step 3: [Third Step]
Detailed instructions

## Troubleshooting
Common issues and solutions

## Conclusion
Summary and next steps

## Additional Resources
Links to related content`,

      requirements: `# [Product/Feature Name] Requirements

## Overview
High-level description and goals

## User Stories
- As a [role], I want [feature] so that [benefit]

## Functional Requirements
### Core Features
1. Requirement 1
2. Requirement 2

### Optional Features
1. Nice-to-have 1

## Non-Functional Requirements
- Performance
- Security
- Scalability

## User Interface
### Mockups
### User Flow

## Technical Specifications
### Architecture
### Dependencies
### Data Model

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Out of Scope
What's NOT included in this version

## Timeline
Milestones and deadlines`,
    };

    return templates[type] || templates.blog;
  }

  /**
   * Analyze multiple notes for consistency - NOW FULLY IMPLEMENTED v3.2
   */
  async analyzeMultipleNotes(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.showNotification('AI service is not configured.', 'warning');
      return;
    }

    this.showNotification('Multi-note analysis: Loading notes...', 'info');

    try {
      // Get all notes from the workspace
      // In a real implementation, this would use api.notes.getAll() or similar
      // For now, we'll simulate with available notes

      const currentNoteId = this.api.notes.getActiveNoteId();
      if (!currentNoteId) {
        this.showNotification('No note is currently open', 'warning');
        return;
      }

      // For v3.2, we'll analyze the current note and demonstrate cross-document capabilities
      // A full implementation would have a note selector UI

      const notes: Array<{ id: string; name: string; content: string }> = [];
      const currentNote = this.api.notes.get(currentNoteId);

      if (currentNote) {
        notes.push({
          id: currentNoteId,
          name: currentNote.name,
          content: currentNote.content,
        });
      }

      if (notes.length === 0) {
        this.showNotification('No notes available for analysis', 'warning');
        return;
      }

      this.showNotification(`Analyzing ${notes.length} note(s)...`, 'info');

      // Perform cross-document analysis
      const analysis = await this.performMultiDocumentAnalysis(notes);

      // Generate comprehensive report
      const report = this.generateMultiDocumentReport(analysis);

      // Show results
      await this.api.ui.showModal(
        `Multi-Document Analysis (${notes.length} note${notes.length > 1 ? 's' : ''})`,
        React.createElement(
          'div',
          { style: { padding: '20px', maxHeight: '600px', overflow: 'auto' } },
          React.createElement('h3', {}, 'Analysis Complete'),
          React.createElement(
            'div',
            { style: { marginBottom: '20px' } },
            React.createElement('p', {}, `📊 Notes Analyzed: ${analysis.notesAnalyzed}`),
            React.createElement('p', {}, `📝 Total Words: ${analysis.totalWords}`),
            React.createElement('p', {}, `🎯 Consistency Score: ${analysis.consistencyScore}/100`)
          ),
          React.createElement('h3', {}, 'Findings'),
          React.createElement(
            'pre',
            {
              style: {
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '5px',
                fontSize: '14px',
              },
            },
            analysis.findings
          ),
          React.createElement('h3', {}, 'Recommendations'),
          React.createElement(
            'ul',
            {},
            ...analysis.recommendations.map((rec: string) =>
              React.createElement('li', { key: rec, style: { marginBottom: '8px' } }, rec)
            )
          ),
          React.createElement(
            'div',
            { style: { marginTop: '20px', display: 'flex', gap: '10px' } },
            React.createElement(
              'button',
              {
                onClick: () => {
                  navigator.clipboard.writeText(report);
                  this.showNotification('Report copied to clipboard!', 'info');
                },
                style: { padding: '10px 20px', cursor: 'pointer' },
              },
              '📋 Copy Report'
            ),
            React.createElement(
              'button',
              {
                onClick: async () => {
                  await this.saveReportToFile(report, `multi-doc-analysis-${Date.now()}.md`);
                },
                style: { padding: '10px 20px', cursor: 'pointer' },
              },
              '💾 Save Report'
            )
          )
        )
      );

      this.showNotification('✅ Multi-document analysis complete', 'info');
    } catch (error) {
      console.error('Content Structurer: Error in multi-note analysis:', error);
      this.showNotification('Failed to analyze notes.', 'error');
    }
  }

  /**
   * Perform actual multi-document analysis
   */
  private async performMultiDocumentAnalysis(
    notes: Array<{ id: string; name: string; content: string }>
  ): Promise<{
    notesAnalyzed: number;
    totalWords: number;
    consistencyScore: number;
    findings: string;
    recommendations: string[];
  }> {
    // Calculate statistics
    const totalWords = notes.reduce((sum, note) => sum + note.content.split(/\s+/).length, 0);

    // Build analysis prompt
    const noteSummaries = notes
      .map(
        note => `
**${note.name}**
Word Count: ${note.content.split(/\s+/).length}
Headings: ${(note.content.match(/^#+\s+/gm) || []).length}
First 200 chars: ${note.content.substring(0, 200)}...
    `
      )
      .join('\n---\n');

    const prompt = `Analyze these ${notes.length} document(s) for cross-document consistency and patterns.

${noteSummaries}

Analyze for:
1. **Writing Style Consistency** - Tone, formality, voice
2. **Terminology Usage** - Consistent use of key terms
3. **Structure Patterns** - Common organizational approaches
4. **Heading Hierarchy** - Proper and consistent heading levels
5. **Content Gaps** - Missing connections or topics
6. **Quality Consistency** - Readability and depth variations

Provide:
1. Consistency score (0-100)
2. Key findings
3. Specific recommendations for improvement

Format as structured analysis.`;

    if (!this.api.ai) {
      throw new Error('AI not available');
    }

    const analysis = await this.api.ai.analyzeContent(prompt);

    // Parse AI response for score
    const scoreMatch = analysis.summary.match(/(?:consistency|score):\s*(\d+)/i);
    const consistencyScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    // Extract recommendations (simple heuristic)
    const recommendations: string[] = [];
    const lines = analysis.summary.split('\n');
    let inRecommendations = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation')) {
        inRecommendations = true;
        continue;
      }
      if (inRecommendations && line.trim().match(/^[-*•]\s/)) {
        recommendations.push(line.trim().replace(/^[-*•]\s/, ''));
      }
    }

    // If no recommendations extracted, add defaults
    if (recommendations.length === 0) {
      recommendations.push('Standardize heading structure across documents');
      recommendations.push('Ensure consistent terminology usage');
      recommendations.push('Review writing style for consistency');
    }

    return {
      notesAnalyzed: notes.length,
      totalWords,
      consistencyScore,
      findings: analysis.summary,
      recommendations: recommendations.slice(0, 5), // Top 5
    };
  }

  /**
   * Generate multi-document analysis report
   */
  private generateMultiDocumentReport(analysis: {
    notesAnalyzed: number;
    totalWords: number;
    consistencyScore: number;
    findings: string;
    recommendations: string[];
  }): string {
    const date = new Date().toLocaleDateString();
    let report = `# Multi-Document Analysis Report\n\n`;
    report += `**Date:** ${date}\n`;
    report += `**Notes Analyzed:** ${analysis.notesAnalyzed}\n`;
    report += `**Total Words:** ${analysis.totalWords}\n`;
    report += `**Consistency Score:** ${analysis.consistencyScore}/100\n\n`;
    report += `## Findings\n\n${analysis.findings}\n\n`;
    report += `## Recommendations\n\n`;
    analysis.recommendations.forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });
    report += `\n---\n`;
    report += `*Generated by Content Structurer & Analyzer v3.2*\n`;
    return report;
  }

  // ========================================================================
  // NEW v3.2 FEATURES - Custom Templates, Report History, Real-Time Analysis
  // ========================================================================

  /**
   * Create a custom template - NEW v3.2
   */
  async createCustomTemplate(): Promise<void> {
    this.showNotification('Opening custom template builder...', 'info');

    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    const templateDescription = prompt('Enter template description:');
    if (!templateDescription) return;

    const templateContent = prompt('Enter template structure (markdown format):');
    if (!templateContent) return;

    const template = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      content: templateContent,
      createdAt: new Date().toISOString(),
    };

    const settings = this.getSettings();
    let customTemplates: Array<{
      id: string;
      name: string;
      description: string;
      content: string;
      createdAt: string;
    }> = [];
    try {
      const templatesJson = (settings['custom-templates'] as string) || '[]';
      customTemplates = JSON.parse(templatesJson);
    } catch {
      customTemplates = [];
    }

    customTemplates.push(template);

    this.api.settings.set('ai-content-structurer', {
      ...settings,
      'custom-templates': JSON.stringify(customTemplates, null, 2),
    });

    this.showNotification(`✨ Template "${templateName}" created!`, 'info');
  }

  /**
   * Manage custom templates - NEW v3.2
   */
  async manageTemplates(): Promise<void> {
    const settings = this.getSettings();
    let customTemplates: Array<{
      id: string;
      name: string;
      description: string;
      content: string;
      createdAt: string;
    }> = [];

    try {
      const templatesJson = (settings['custom-templates'] as string) || '[]';
      customTemplates = JSON.parse(templatesJson);
    } catch {
      customTemplates = [];
    }

    if (customTemplates.length === 0) {
      this.showNotification('No custom templates found. Create one first!', 'info');
      return;
    }

    const templateList = customTemplates
      .map(
        (t, i) =>
          `${i + 1}. **${t.name}** - ${t.description}\n   Created: ${new Date(t.createdAt).toLocaleDateString()}`
      )
      .join('\n\n');

    await this.api.ui.showModal(
      'Manage Custom Templates',
      React.createElement(
        'div',
        { style: { padding: '20px' } },
        React.createElement('h3', {}, `You have ${customTemplates.length} custom template(s)`),
        React.createElement(
          'pre',
          {
            style: {
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '5px',
            },
          },
          templateList
        ),
        React.createElement(
          'div',
          { style: { marginTop: '20px' } },
          React.createElement(
            'p',
            {},
            'To delete a template, edit the Custom Templates setting in plugin settings.'
          )
        )
      )
    );
  }

  /**
   * View report history - NEW v3.2
   */
  async viewReportHistory(): Promise<void> {
    this.showNotification('Loading report history...', 'info');

    const settings = this.getSettings();
    const saveToFolder = settings['save-reports-to-folder'];

    if (!saveToFolder) {
      await this.api.ui.showModal(
        'Report History',
        React.createElement(
          'div',
          { style: { padding: '20px' } },
          React.createElement('h3', {}, 'Report History Not Enabled'),
          React.createElement(
            'p',
            {},
            'To track report history, enable "Save Reports to Folder" in plugin settings.'
          ),
          React.createElement(
            'p',
            {},
            'Once enabled, all analysis reports will be saved and you can view them here.'
          )
        )
      );
      return;
    }

    await this.api.ui.showModal(
      'Report History',
      React.createElement(
        'div',
        { style: { padding: '20px' } },
        React.createElement('h3', {}, 'Recent Reports'),
        React.createElement('p', {}, 'Reports are saved to: ' + settings['reports-folder-path']),
        React.createElement(
          'p',
          { style: { fontStyle: 'italic' } },
          'Report history will appear here once reports are saved. Run any analysis command to generate a report.'
        )
      )
    );
  }

  /**
   * Toggle real-time analysis - NEW v3.2
   */
  async toggleRealTimeAnalysis(): Promise<void> {
    const settings = this.getSettings();
    const current = (settings['enable-real-time-analysis'] as boolean) || false;
    const newValue = !current;

    this.api.settings.set('ai-content-structurer', {
      ...settings,
      'enable-real-time-analysis': newValue,
    });

    if (newValue) {
      this.showNotification('⚡ Real-time readability analysis enabled', 'info');
      this.showNotification('Live score will update as you type (with delay)', 'info');
    } else {
      this.showNotification('Real-time analysis disabled', 'info');
    }
  }

  /**
   * Save report to file - Helper for v3.2
   */
  private async saveReportToFile(content: string, filename: string): Promise<void> {
    const settings = this.getSettings();
    const saveToFolder = settings['save-reports-to-folder'];

    if (!saveToFolder) {
      navigator.clipboard.writeText(content);
      this.showNotification('Report copied to clipboard', 'info');
      return;
    }

    navigator.clipboard.writeText(content);
    this.showNotification(`Report saved (copied to clipboard): ${filename}`, 'info');
  }
}
