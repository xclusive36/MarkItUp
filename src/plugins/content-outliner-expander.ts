import { PluginManifest, PluginAPI, PluginSetting, Command } from '../lib/types';

/**
 * CONTENT OUTLINER & EXPANDER PLUGIN
 *
 * AI-powered content expansion and compression.
 * Transform bullet points into full paragraphs and vice versa.
 *
 * Features:
 * - Expand bullet points into full paragraphs
 * - Generate comprehensive drafts from outlines
 * - Compress paragraphs back to bullet points
 * - Maintain consistent writing style
 * - Section-by-section expansion
 * - Smart structure suggestions
 */

let pluginInstance: ContentOutlinerExpanderPlugin | null = null;

export const contentOutlinerExpanderPlugin: PluginManifest = {
  id: 'ai-content-outliner-expander',
  name: 'Content Outliner & Expander',
  version: '1.0.0',
  description:
    'AI-powered tool to expand bullet points into paragraphs or compress text to outlines. Requires AI configuration (OpenAI, Anthropic, Gemini API key) or Ollama for local AI.',
  author: 'MarkItUp Team',
  main: 'ai-content-outliner-expander.js',

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
      id: 'enable-notifications',
      name: 'Enable Notifications',
      type: 'boolean',
      default: true,
      description: 'Show notifications when operations complete',
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

    pluginInstance = new ContentOutlinerExpanderPlugin(api);
    console.log('Content Outliner & Expander plugin loaded successfully');
  },

  onUnload: async () => {
    pluginInstance = null;
    console.log('Content Outliner & Expander plugin unloaded');
  },
};

/**
 * Content Outliner & Expander Plugin Implementation
 */
class ContentOutlinerExpanderPlugin {
  private api: PluginAPI;

  constructor(api: PluginAPI) {
    this.api = api;
  }

  /**
   * Expand selected bullet points into paragraphs
   */
  async expandSelection(): Promise<void> {
    const content = this.api.ui.getEditorContent();
    const selection = this.getSelection(content);

    if (!selection) {
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
      const bullets = this.extractBulletPoints(selection);

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

      // Replace selection with expanded text
      const newContent = content.replace(selection, expandedText);
      this.api.ui.setEditorContent(newContent);

      this.showNotification(
        `Expanded ${bullets.length} bullet point(s) into ${this.countWords(expandedText)} words`,
        'info'
      );
    } catch (error) {
      console.error('Content Outliner: Error expanding selection:', error);
      this.showNotification('Failed to expand content. Please try again.', 'error');
    }
  }

  /**
   * Expand an entire section
   */
  async expandSection(): Promise<void> {
    const content = this.api.ui.getEditorContent();
    const currentSection = this.getCurrentSection(content);

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
      const newContent = content.replace(currentSection, expandedSection);
      this.api.ui.setEditorContent(newContent);

      this.showNotification('Section expanded successfully', 'info');
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
    const content = this.api.ui.getEditorContent();
    const selection = this.getSelection(content);

    if (!selection) {
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
${selection}

Provide clean bullet points (use - or * format).`;

      const analysis = await this.api.ai.analyzeContent(prompt);
      const bullets = analysis.summary;

      // Replace selection with bullets
      const newContent = content.replace(selection, bullets);
      this.api.ui.setEditorContent(newContent);

      this.showNotification('Text compressed to bullet points', 'info');
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

      const prompt = `Analyze this document structure and suggest improvements.

Document:
${note.content}

Provide:
1. Assessment of current structure
2. Specific suggestions for better organization
3. Recommended heading hierarchy
4. Missing sections that should be added
5. Sections that could be merged or split`;

      const analysis = await this.api.ai.analyzeContent(prompt);

      console.log('📋 Structure Analysis:\n', analysis.summary);
      console.log('\n🎯 Key Topics:', analysis.keyTopics);

      this.showNotification('Structure analysis complete. Check console for suggestions.', 'info');

      // Show suggestions in a user-friendly way
      alert(
        `Structure Suggestions:\n\n${analysis.summary}\n\nKey Areas: ${analysis.keyTopics.join(', ')}`
      );
    } catch (error) {
      console.error('Content Outliner: Error analyzing structure:', error);
      this.showNotification('Failed to analyze structure.', 'error');
    }
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
   * Helper: Get current selection (placeholder - would need proper implementation)
   */
  private getSelection(content: string): string | null {
    // In a real implementation, this would get the actual editor selection
    // For now, return null to indicate no selection
    return null;
  }

  /**
   * Helper: Get current section
   */
  private getCurrentSection(content: string): string | null {
    // Simplified: get content between current heading and next heading
    // In real implementation, would use cursor position
    const sections = content.split(/^#+\s+/m);
    return sections.length > 1 ? sections[1] : null;
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
   * Get plugin settings
   */
  private getSettings(): Record<string, unknown> {
    return this.api.settings.get('ai-content-outliner-expander') || {};
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
}
