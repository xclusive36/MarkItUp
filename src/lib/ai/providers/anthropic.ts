import { AIProvider, AIMessage, AIResponse, AIContext, AIError, AIAnalysis } from '../types';

export class AnthropicProvider implements AIProviderInterface {
  private apiKey: string;
  private baseURL: string = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderInfo(): AIProvider {
    return {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Claude models from Anthropic',
      apiKeyRequired: true,
      supportedModels: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Most intelligent model with best performance',
          maxTokens: 200000,
          costPer1kTokens: 0.003,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Powerful model for complex tasks',
          maxTokens: 200000,
          costPer1kTokens: 0.015,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced performance and speed',
          maxTokens: 200000,
          costPer1kTokens: 0.003,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fastest and most compact model',
          maxTokens: 200000,
          costPer1kTokens: 0.00025,
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
      const model = options.model || 'claude-3-5-sonnet-20241022';
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 1000;

      // Build system message with context
      const systemMessage = this.buildSystemMessage(context);

      // Convert to Anthropic format
      const anthropicMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemMessage,
          messages: anthropicMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Anthropic API error: ${response.status} ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      const usage = data.usage || {};
      const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);
      const inputCost = modelInfo
        ? (usage.input_tokens || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const outputCost = modelInfo
        ? (usage.output_tokens || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const estimatedCost = inputCost + outputCost;

      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content[0]?.text || '',
        model,
        usage: {
          promptTokens: usage.input_tokens || 0,
          completionTokens: usage.output_tokens || 0,
          totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
          estimatedCost,
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
      provider: 'anthropic',
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
