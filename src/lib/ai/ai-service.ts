import {
  AIProvider,
  AIMessage,
  AIResponse,
  AIContext,
  AISettings,
  ChatSession,
  AIError,
  ChatRequest,
  ChatResponse,
  FileOperationRequest,
  FileOperation,
} from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { OllamaProvider } from './providers/ollama';
import { GeminiProvider } from './providers/gemini';
import { Note, SearchResult } from '../types';
import { analytics } from '../analytics';

// Minimal PKM interface for AI service needs
interface PKMSystemInterface {
  getNote(id: string): Note | null | undefined;
  search?(query: string, options?: Record<string, unknown>): SearchResult[];
  getLinks?(noteId: string): Promise<Array<{ source: string; target: string }>>;
  getAllNotes?(): Note[];
}

export class AIService {
  private providers: Map<string, unknown> = new Map();
  private settings: AISettings;
  private chatSessions: Map<string, ChatSession> = new Map();
  private pkm?: PKMSystemInterface;

  constructor(settings: AISettings) {
    this.settings = settings;
    this.initializeProviders();
    this.loadChatSessions();
  }

  setPKMSystem(pkm: PKMSystemInterface) {
    this.pkm = pkm;
  }

  private initializeProviders() {
    // Initialize OpenAI provider if API key is provided
    if (this.settings.provider === 'openai' && this.settings.apiKey) {
      this.providers.set('openai', new OpenAIProvider(this.settings.apiKey));
    }

    // Initialize Anthropic provider if API key is provided
    if (this.settings.provider === 'anthropic' && this.settings.apiKey) {
      this.providers.set('anthropic', new AnthropicProvider(this.settings.apiKey));
    }

    // Initialize Gemini provider if API key is provided
    if (this.settings.provider === 'gemini' && this.settings.apiKey) {
      this.providers.set('gemini', new GeminiProvider(this.settings.apiKey));
    }

    // Initialize Ollama provider (no API key required)
    if (this.settings.provider === 'ollama') {
      const ollamaUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      this.providers.set(
        'ollama',
        new OllamaProvider(ollamaUrl, this.settings.ollamaAdvancedOptions)
      );
    }
  }

  private getCurrentProvider(): {
    getProviderInfo(): AIProvider;
    chat(
      messages: AIMessage[],
      context: AIContext,
      options?: Record<string, unknown>
    ): Promise<AIResponse>;
    complete(prompt: string, options?: Record<string, unknown>): Promise<string>;
    analyze(content: string, analysisType?: string): Promise<string | Record<string, unknown>>;
  } {
    const provider = this.providers.get(this.settings.provider);
    if (!provider) {
      throw new Error(
        `Provider ${this.settings.provider} not available. Please check your API key.`
      );
    }
    return provider as {
      getProviderInfo(): AIProvider;
      chat(
        messages: AIMessage[],
        context: AIContext,
        options?: Record<string, unknown>
      ): Promise<AIResponse>;
      complete(prompt: string, options?: Record<string, unknown>): Promise<string>;
      analyze(content: string, analysisType?: string): Promise<string | Record<string, unknown>>;
    };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Get or create chat session
      let session = this.chatSessions.get(request.sessionId || 'default');
      if (!session) {
        session = this.createNewSession(request.sessionId);
      }

      // Build context if enabled
      const context = await this.buildContext(request);

      // Create user message
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: request.message,
        timestamp: new Date().toISOString(),
        context,
      };

      // Add to session
      session.messages.push(userMessage);

      // Get recent conversation history (last 10 messages)
      const recentMessages = session.messages.slice(-10);

      // Call AI provider
      const provider = this.getCurrentProvider();
      const response = await provider.chat(recentMessages, context, {
        model: request.model || this.settings.model,
        temperature: request.temperature || this.settings.temperature,
        maxTokens: request.maxTokens || this.settings.maxTokens,
      });

      // Create assistant message
      const assistantMessage: AIMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        tokens: response.usage.totalTokens,
        model: response.model,
        context,
      };

      // Add to session
      session.messages.push(assistantMessage);
      session.totalTokens += response.usage.totalTokens;
      session.totalCost += response.usage.estimatedCost;
      session.updatedAt = new Date().toISOString();

      // Update session title if it's the first exchange
      if (session.messages.length === 2) {
        session.title = this.generateSessionTitle(request.message);
      }

      // Save session
      this.chatSessions.set(session.id, session);
      this.saveChatSessions();

      // Track analytics
      analytics.trackEvent('ai_chat', {
        sessionId: session.id,
        model: response.model,
        tokens: response.usage.totalTokens,
        cost: response.usage.estimatedCost,
        hasContext: context.relatedNotes.length > 0,
        contextNotes: context.relatedNotes.length,
        responseLength: response.content.length,
      });

      return {
        success: true,
        data: response,
        sessionId: session.id,
      };
    } catch (error) {
      console.error('AI Chat error:', error);

      const aiError: AIError = {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        provider: this.settings.provider,
      };

      analytics.trackEvent('ai_error', {
        error: aiError.code,
        message: aiError.message,
        provider: this.settings.provider,
      });

      return {
        success: false,
        error: aiError,
        sessionId: request.sessionId || 'default',
      };
    }
  }

  private async buildContext(request: ChatRequest): Promise<AIContext> {
    const context: AIContext = {
      relatedNotes: [],
      searchResults: [],
      conversationHistory: [],
    };

    if (!request.includeContext && !this.settings.enableContext) {
      return context;
    }

    try {
      // If a specific note is being discussed, get related notes
      if (request.noteContext && this.pkm) {
        const note = this.pkm.getNote(request.noteContext);
        if (note) {
          const relatedNotes = await this.getRelatedNotes(note);
          context.relatedNotes = relatedNotes.slice(0, this.settings.maxContextNotes || 5);
        }
      }

      // Search for relevant notes based on the message content
      if (this.pkm && this.pkm.search) {
        const searchResults = await this.pkm.search(request.message, {
          limit: this.settings.maxContextNotes || 5,
          includeContent: true,
        });

        context.searchResults = searchResults.map((result: SearchResult) => ({
          noteId: result.noteId,
          noteName: result.noteName,
          snippet: result.matches.length > 0 && result.matches[0] ? result.matches[0].context : '',
          score: result.score,
        }));

        // Convert high-scoring search results to related notes
        const highScoreResults = searchResults
          .filter((result: SearchResult) => result.score > 0.5)
          .slice(0, 3);

        for (const result of highScoreResults) {
          const note = this.pkm.getNote(result.noteId);
          if (note && !context.relatedNotes.find(rn => rn.id === note.id)) {
            context.relatedNotes.push({
              id: note.id,
              name: note.name,
              relevantContent: this.extractRelevantContent(note.content, request.message),
              relevanceScore: result.score,
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error building AI context:', error);
    }

    return context;
  }

  private async getRelatedNotes(note: Note): Promise<
    Array<{
      id: string;
      name: string;
      relevantContent: string;
      relevanceScore: number;
    }>
  > {
    const related: Array<{
      id: string;
      name: string;
      relevantContent: string;
      relevanceScore: number;
    }> = [];

    if (!this.pkm) return related;

    try {
      // Get notes linked to this note
      const links = this.pkm.getLinks ? await this.pkm.getLinks(note.id) : [];

      for (const link of links.slice(0, 3)) {
        const linkedNote = this.pkm.getNote(link.target !== note.id ? link.target : link.source);
        if (linkedNote) {
          related.push({
            id: linkedNote.id,
            name: linkedNote.name,
            relevantContent: linkedNote.content.substring(0, 300),
            relevanceScore: 0.8,
          });
        }
      }

      // Get notes with similar tags
      const similarNotes = this.pkm.getAllNotes
        ? this.pkm
            .getAllNotes()
            .filter((n: Note) => n.id !== note.id && n.tags.some(tag => note.tags.includes(tag)))
            .slice(0, 2)
        : [];

      for (const similarNote of similarNotes) {
        if (!related.find(r => r.id === similarNote.id)) {
          related.push({
            id: similarNote.id,
            name: similarNote.name,
            relevantContent: similarNote.content.substring(0, 300),
            relevanceScore: 0.6,
          });
        }
      }
    } catch (error) {
      console.warn('Error getting related notes:', error);
    }

    return related;
  }

  private extractRelevantContent(content: string, query: string): string {
    // Simple relevance extraction - find paragraphs containing query terms
    const queryTerms = query
      .toLowerCase()
      .split(' ')
      .filter(term => term.length > 2);
    const paragraphs = content.split('\n\n');

    const relevantParagraphs = paragraphs.filter(paragraph =>
      queryTerms.some(term => paragraph.toLowerCase().includes(term))
    );

    if (relevantParagraphs.length > 0) {
      return relevantParagraphs.slice(0, 2).join('\n\n').substring(0, 400);
    }

    return content.substring(0, 400);
  }

  private createNewSession(sessionId?: string): ChatSession {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: ChatSession = {
      id,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalTokens: 0,
      totalCost: 0,
    };

    return session;
  }

  private generateSessionTitle(firstMessage: string): string {
    // Extract a meaningful title from the first message
    const title = firstMessage.length > 50 ? firstMessage.substring(0, 47) + '...' : firstMessage;

    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Session management
  getChatSession(sessionId: string): ChatSession | null {
    return this.chatSessions.get(sessionId) || null;
  }

  getAllChatSessions(): ChatSession[] {
    return Array.from(this.chatSessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  deleteChatSession(sessionId: string): boolean {
    const deleted = this.chatSessions.delete(sessionId);
    if (deleted) {
      this.saveChatSessions();
    }
    return deleted;
  }

  // Settings management
  updateSettings(newSettings: Partial<AISettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.initializeProviders();
    this.saveSettings();
  }

  getSettings(): AISettings {
    return { ...this.settings };
  }

  // Provider management
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).map(provider => {
      const p = provider as {
        getProviderInfo(): AIProvider;
      };
      return p.getProviderInfo();
    });
  }

  // Persistence
  private loadChatSessions() {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('markitup-ai-sessions');
      if (saved) {
        const sessions = JSON.parse(saved);
        this.chatSessions = new Map(sessions);
      }
    } catch (error) {
      console.warn('Failed to load chat sessions:', error);
    }
  }

  private saveChatSessions() {
    if (typeof window === 'undefined') return;

    try {
      const sessions = Array.from(this.chatSessions.entries());
      localStorage.setItem('markitup-ai-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to save chat sessions:', error);
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('markitup-ai-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save AI settings:', error);
    }
  }

  static loadSettings(): AISettings {
    if (typeof window === 'undefined') {
      return AIService.getDefaultSettings();
    }

    try {
      const saved = localStorage.getItem('markitup-ai-settings');
      if (saved) {
        return { ...AIService.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load AI settings:', error);
    }

    return AIService.getDefaultSettings();
  }

  static getDefaultSettings(): AISettings {
    return {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: '',
      maxTokens: 1000,
      temperature: 0.7,
      enableContext: true,
      maxContextNotes: 5,
      contextSearchDepth: 10,
      enableUsageTracking: true,
      monthlyLimit: 10.0, // $10 USD
      enableLocalFallback: false,
      ollamaUrl: 'http://localhost:11434', // Default Ollama URL
      ollamaPresets: [],
      ollamaAdvancedOptions: {
        num_ctx: 2048,
        repeat_penalty: 1.1,
      },
    };
  }

  // PKM-Specific AI Features
  async findConnections(
    noteId: string,
    noteContent: string
  ): Promise<{
    success: boolean;
    connections?: Array<{
      noteId: string;
      noteName: string;
      reason: string;
      confidence: number;
    }>;
    error?: string;
  }> {
    try {
      if (!this.pkm?.getAllNotes) {
        return { success: false, error: 'PKM system not available' };
      }

      const allNotes = this.pkm.getAllNotes();
      const otherNotes = allNotes.filter(n => n.id !== noteId);

      if (otherNotes.length === 0) {
        return { success: true, connections: [] };
      }

      const provider = this.getCurrentProvider();

      const prompt = `Analyze this note and find connections to other notes in the knowledge base.

Current Note Content:
${noteContent.slice(0, 2000)}

Other Notes (ID | Title | Snippet):
${otherNotes
  .slice(0, 20)
  .map(n => `${n.id} | ${n.name} | ${n.content.slice(0, 100)}...`)
  .join('\n')}

Return a JSON array of connections with this format:
[
  {
    "noteId": "note-id",
    "noteName": "Note Title",
    "reason": "Brief explanation of connection",
    "confidence": 0.85
  }
]

Only include connections with confidence > 0.6. Limit to top 5 connections.`;

      const response = await provider.complete(prompt, {
        temperature: 0.3,
        maxTokens: 500,
      });

      // Parse JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, error: 'Invalid response format' };
      }

      const connections = JSON.parse(jsonMatch[0]);
      return { success: true, connections };
    } catch (error) {
      console.error('Failed to find connections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async suggestLinks(
    noteContent: string,
    existingNotes: Note[]
  ): Promise<{
    success: boolean;
    suggestions?: Array<{
      text: string;
      targetNote: string;
      targetNoteId: string;
      position: number;
      confidence: number;
    }>;
    error?: string;
  }> {
    try {
      const provider = this.getCurrentProvider();

      const prompt = `Analyze this note content and suggest wikilinks to existing notes.

Current Note:
${noteContent.slice(0, 1500)}

Existing Notes:
${existingNotes
  .slice(0, 30)
  .map(n => `- [[${n.name}]] (${n.id})`)
  .join('\n')}

Find phrases in the current note that should link to existing notes. Return JSON:
[
  {
    "text": "exact phrase to link",
    "targetNote": "Note Title",
    "targetNoteId": "note-id",
    "confidence": 0.9
  }
]

Only suggest links with confidence > 0.7. Limit to 10 suggestions.`;

      const response = await provider.complete(prompt, {
        temperature: 0.2,
        maxTokens: 400,
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, error: 'Invalid response format' };
      }

      const suggestions = JSON.parse(jsonMatch[0]) as Array<{
        text: string;
        targetNote: string;
        targetNoteId: string;
        confidence: number;
      }>;

      // Add position information
      const suggestionsWithPosition = suggestions
        .map(s => ({
          ...s,
          position: noteContent.indexOf(s.text),
        }))
        .filter(s => s.position !== -1);

      return { success: true, suggestions: suggestionsWithPosition };
    } catch (error) {
      console.error('Failed to suggest links:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async identifyKnowledgeGaps(
    noteContent: string,
    relatedNotes: Note[]
  ): Promise<{
    success: boolean;
    gaps?: Array<{
      topic: string;
      reason: string;
      suggestedQuestions: string[];
    }>;
    error?: string;
  }> {
    try {
      const provider = this.getCurrentProvider();

      const prompt = `Analyze this note and related notes to identify knowledge gaps.

Current Note:
${noteContent.slice(0, 1500)}

Related Notes:
${relatedNotes
  .slice(0, 10)
  .map(n => `## ${n.name}\n${n.content.slice(0, 200)}...`)
  .join('\n\n')}

Identify missing information, unexplored topics, or questions that arise. Return JSON:
[
  {
    "topic": "Missing Topic",
    "reason": "Why this is a gap",
    "suggestedQuestions": ["Question 1", "Question 2"]
  }
]

Limit to top 5 most important gaps.`;

      const response = await provider.complete(prompt, {
        temperature: 0.5,
        maxTokens: 600,
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, error: 'Invalid response format' };
      }

      const gaps = JSON.parse(jsonMatch[0]);
      return { success: true, gaps };
    } catch (error) {
      console.error('Failed to identify gaps:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateTags(
    noteContent: string,
    existingTags: string[]
  ): Promise<{
    success: boolean;
    tags?: Array<{
      tag: string;
      confidence: number;
      reason: string;
    }>;
    error?: string;
  }> {
    try {
      const provider = this.getCurrentProvider();

      const prompt = `Analyze this note and suggest relevant tags.

Note Content:
${noteContent.slice(0, 1500)}

Existing Tags in System:
${existingTags.slice(0, 50).join(', ')}

Suggest tags (prefer existing tags, but can suggest new ones). Return JSON:
[
  {
    "tag": "tag-name",
    "confidence": 0.85,
    "reason": "Why this tag fits"
  }
]

Limit to top 8 tags with confidence > 0.6.`;

      const response = await provider.complete(prompt, {
        temperature: 0.3,
        maxTokens: 300,
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { success: false, error: 'Invalid response format' };
      }

      const tags = JSON.parse(jsonMatch[0]);
      return { success: true, tags };
    } catch (error) {
      console.error('Failed to generate tags:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async expandSection(
    sectionText: string,
    context: string
  ): Promise<{
    success: boolean;
    expanded?: string;
    error?: string;
  }> {
    try {
      const provider = this.getCurrentProvider();

      const prompt = `Expand this section with more detail and examples.

Section to Expand:
${sectionText}

Context from Note:
${context.slice(0, 500)}

Write an expanded version that:
- Adds more detail and examples
- Maintains the original tone
- Stays focused on the topic
- Is 2-3x longer than original

Expanded Version:`;

      const response = await provider.complete(prompt, {
        temperature: 0.7,
        maxTokens: 500,
      });

      return { success: true, expanded: response.trim() };
    } catch (error) {
      console.error('Failed to expand section:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Detect if a user message contains a file operation request
   * and generate structured file operations
   */
  async detectFileOperations(
    message: string,
    allNotes: Note[]
  ): Promise<FileOperationRequest | null> {
    try {
      // Keywords that indicate file operations
      // const createKeywords = ['create', 'make', 'new', 'add', 'write']; // Commented out: not used
      // const modifyKeywords = ['modify', 'update', 'change', 'edit', 'rewrite', 'fix']; // Commented out: not used
      // const deleteKeywords = ['delete', 'remove', 'erase']; // Commented out: not used
      const folderKeywords = ['folder', 'directory', 'organize'];

      const lowerMessage = message.toLowerCase();

      // Check if message contains file operation keywords
      // const hasCreate = createKeywords.some(kw => lowerMessage.includes(kw)); // Commented out: not used
      // const hasModify = modifyKeywords.some(kw => lowerMessage.includes(kw)); // Commented out: not used
      // const hasDelete = deleteKeywords.some(kw => lowerMessage.includes(kw)); // Commented out: not used
      const hasFolder = folderKeywords.some(kw => lowerMessage.includes(kw));
      const hasFileRef = lowerMessage.includes('file') || lowerMessage.includes('note');

      if (!hasFileRef && !hasFolder) {
        return null; // Not a file operation request
      }

      // Use AI to parse the intent and generate operations
      const provider = this.getCurrentProvider();

      const notesList = allNotes
        .map(n => `- ${n.name.replace('.md', '')} (${n.folder || 'root'})`)
        .join('\n');

      const prompt = `You are a file operation assistant. Analyze the user's request and determine if they want to perform file operations (create, modify, delete files or create folders).

User Request: "${message}"

Existing Notes:
${notesList}

If the user wants to perform file operations, respond with a JSON object in this exact format:
{
  "hasOperations": true,
  "operations": [
    {
      "type": "create" | "modify" | "delete" | "create-folder",
      "path": "relative/path/from/markdown/folder",
      "content": "file content here (only for create/modify)",
      "reason": "explanation of why this operation is needed"
    }
  ],
  "summary": "Overall explanation of what will be done"
}

If this is NOT a file operation request, respond with:
{
  "hasOperations": false
}

Guidelines:
- For create operations, ensure .md extension
- For modify operations, file must exist in the notes list
- Include helpful, descriptive content when creating notes
- Provide clear reasons for each operation
- Keep paths relative to the markdown folder

Respond ONLY with valid JSON, no additional text.`;

      const response = await provider.complete(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });

      // Parse the AI response
      const cleanedResponse = response
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '');
      const parsed = JSON.parse(cleanedResponse);

      if (!parsed.hasOperations) {
        return null;
      }

      return {
        operations: parsed.operations.map((op: FileOperation) => ({
          ...op,
          timestamp: new Date().toISOString(),
        })),
        summary: parsed.summary || 'File operations requested',
        requiresApproval: true,
      };
    } catch (error) {
      console.error('Failed to detect file operations:', error);
      return null;
    }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    const settings = AIService.loadSettings();
    aiServiceInstance = new AIService(settings);
  }
  return aiServiceInstance;
}

export function initializeAIService(pkmSystem: PKMSystemInterface): AIService {
  const aiService = getAIService();
  aiService.setPKMSystem(pkmSystem);
  return aiService;
}
