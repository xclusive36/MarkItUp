import { AIProvider, AIMessage, AIResponse, AIContext, AIError } from '../types';

export class OllamaProvider implements AIProviderInterface {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:11434') {
    this.baseURL = baseURL;
  }

  getProviderInfo(): AIProvider {
    return {
      id: 'ollama',
      name: 'Ollama (Local)',
      description: 'Local AI models via Ollama',
      apiKeyRequired: false,
      supportedModels: [
        {
          id: 'llama3.2',
          name: 'Llama 3.2',
          description: "Meta's latest Llama model",
          maxTokens: 8192,
          costPer1kTokens: 0, // Local, no cost
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'llama3.1',
          name: 'Llama 3.1',
          description: "Meta's Llama 3.1 model",
          maxTokens: 8192,
          costPer1kTokens: 0,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'mistral',
          name: 'Mistral',
          description: 'Mistral 7B model',
          maxTokens: 8192,
          costPer1kTokens: 0,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'codellama',
          name: 'Code Llama',
          description: 'Specialized for code generation',
          maxTokens: 16384,
          costPer1kTokens: 0,
          capabilities: ['chat', 'completion', 'analysis'],
        },
        {
          id: 'gemma2',
          name: 'Gemma 2',
          description: "Google's Gemma 2 model",
          maxTokens: 8192,
          costPer1kTokens: 0,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'phi3',
          name: 'Phi-3',
          description: "Microsoft's Phi-3 small language model",
          maxTokens: 4096,
          costPer1kTokens: 0,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
      ],
    };
  }

  async chat(
    messages: AIMessage[],
    context: AIContext,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<AIResponse> {
    try {
      const model = options.model || 'llama3.2';
      const temperature = options.temperature || 0.7;

      // Build system message with context
      const systemMessage = this.buildSystemMessage(context);

      // Convert to Ollama format
      const ollamaMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: ollamaMessages,
          options: {
            temperature,
            num_predict: options.maxTokens || 1000,
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Ollama doesn't provide detailed token counts, estimate based on content
      const estimatedTokens = Math.ceil((data.message?.content?.length || 0) / 4);

      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.message?.content || '',
        model,
        usage: {
          promptTokens: estimatedTokens,
          completionTokens: estimatedTokens,
          totalTokens: estimatedTokens * 2,
          estimatedCost: 0, // Local, no cost
        },
        context,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw this.createAIError(
        'CHAT_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async complete(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const response = await this.chat(
      [
        {
          id: 'prompt',
          role: 'user',
          content: prompt,
          timestamp: new Date().toISOString(),
        },
      ],
      { relatedNotes: [], conversationHistory: [] },
      options
    );

    return response.content;
  }

  async analyze(
    content: string,
    analysisType: string = 'full'
  ): Promise<string | Record<string, unknown>> {
    const prompts = {
      summary: `Please provide a concise summary of the following content:\n\n${content}`,
      topics: `Extract the main topics and themes from this content:\n\n${content}`,
      tags: `Suggest relevant tags for this content (return as comma-separated list):\n\n${content}`,
      connections: `Based on this content, suggest what other notes or topics this might connect to:\n\n${content}`,
      full: `Analyze this content and provide:
1. A brief summary
2. Key topics and themes
3. Suggested tags (comma-separated)
4. Potential connections to other notes
5. Overall sentiment (positive/neutral/negative)
6. Complexity level (1-10)

Content:\n${content}`,
    };

    const prompt = prompts[analysisType as keyof typeof prompts] || prompts.full;
    const result = await this.complete(prompt);

    if (analysisType === 'full') {
      return this.parseFullAnalysis(result);
    }

    return result;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return (data.models || []).map((model: { name: string }) => model.name);
    } catch {
      return [];
    }
  }

  private buildSystemMessage(context: AIContext): string {
    let systemMessage = `You are an AI assistant integrated into MarkItUp, a personal knowledge management system. You help users with their notes, writing, and knowledge organization.

Current context:
- User has ${context.relatedNotes.length} related notes in their knowledge base
- This conversation may reference existing notes and their connections

Guidelines:
- Be helpful and concise
- Reference relevant notes when appropriate
- Suggest connections between ideas
- Help with writing, organizing, and expanding knowledge
- When mentioning specific notes, use their exact names`;

    if (context.relatedNotes.length > 0) {
      systemMessage += `\n\nRelevant notes from the user's knowledge base:\n`;
      context.relatedNotes.forEach(note => {
        systemMessage += `\n- "${note.name}": ${note.relevantContent.substring(0, 200)}${note.relevantContent.length > 200 ? '...' : ''}`;
      });
    }

    return systemMessage;
  }

  private parseFullAnalysis(result: string): Record<string, unknown> {
    const lines = result.split('\n').filter(line => line.trim());

    return {
      summary: this.extractSection(result, 'summary') || lines[0] || '',
      keyTopics: this.extractListItems(result, 'topics'),
      suggestedTags: this.extractTags(result),
      suggestedConnections: [],
      sentiment: this.extractSentiment(result),
      complexity: this.extractComplexity(result),
      readabilityScore: 7,
    };
  }

  private extractSection(text: string, section: string): string | null {
    const regex = new RegExp(`\\b${section}:?\\s*([^\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractListItems(text: string, section: string): string[] {
    const sectionMatch = text.match(
      new RegExp(`\\b${section}:?([^\\n]+(?:\\n[^\\n]*)*?)(?=\\n\\d+\\.|\\n[A-Z]|$)`, 'i')
    );
    if (!sectionMatch) return [];

    return sectionMatch[1]
      .split(/[\n,]/)
      .map(item => item.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  private extractTags(text: string): string[] {
    const tagsMatch = text.match(/tags?:?\s*([^\n]+)/i);
    if (!tagsMatch) return [];

    return tagsMatch[1]
      .split(',')
      .map(tag => tag.trim().replace(/^#/, ''))
      .filter(tag => tag.length > 0);
  }

  private extractSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const sentimentMatch = text.match(/sentiment:?\s*(positive|neutral|negative)/i);
    return (sentimentMatch?.[1]?.toLowerCase() as 'positive' | 'neutral' | 'negative') || 'neutral';
  }

  private extractComplexity(text: string): number {
    const complexityMatch = text.match(/complexity:?\s*(\d+)/i);
    return complexityMatch ? parseInt(complexityMatch[1]) : 5;
  }

  private createAIError(code: string, message: string): AIError {
    return {
      code,
      message,
      timestamp: new Date().toISOString(),
      provider: 'ollama',
    };
  }
}

interface AIProviderInterface {
  getProviderInfo(): AIProvider;
  chat(
    messages: AIMessage[],
    context: AIContext,
    options?: Record<string, unknown>
  ): Promise<AIResponse>;
  complete(prompt: string, options?: Record<string, unknown>): Promise<string>;
  analyze(content: string, analysisType?: string): Promise<string | Record<string, unknown>>;
}
