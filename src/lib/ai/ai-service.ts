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
} from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { OllamaProvider } from './providers/ollama';
import { GeminiProvider } from './providers/gemini';
import { Note, SearchResult } from '../types';
import { analytics } from '../analytics';

export class AIService {
  private providers: Map<string, unknown> = new Map();
  private settings: AISettings;
  private chatSessions: Map<string, ChatSession> = new Map();
  private pkm: unknown; // Will be injected

  constructor(settings: AISettings) {
    this.settings = settings;
    this.initializeProviders();
    this.loadChatSessions();
  }

  setPKMSystem(pkm: unknown) {
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
      this.providers.set('ollama', new OllamaProvider());
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
          snippet: result.matches.length > 0 ? result.matches[0].context : '',
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
    };
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

export function initializeAIService(pkmSystem: unknown): AIService {
  const aiService = getAIService();
  aiService.setPKMSystem(pkmSystem);
  return aiService;
}
