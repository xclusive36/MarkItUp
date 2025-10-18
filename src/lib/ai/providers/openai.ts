import {
  AIProvider,
  AIMessage,
  AIResponse,
  AIContext,
  AIError,
  StreamChunk,
  OpenAIAdvancedOptions,
  OpenAIPerformanceMetrics,
  OpenAIConnectionStatus,
  OpenAIFunction,
} from '../types';

export class OpenAIProvider implements AIProviderInterface {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';
  private advancedOptions?: OpenAIAdvancedOptions;
  private performanceMetrics: Map<string, OpenAIPerformanceMetrics> = new Map();
  private requestStartTime: number = 0;

  constructor(apiKey: string, advancedOptions?: OpenAIAdvancedOptions) {
    this.apiKey = apiKey;
    this.advancedOptions = advancedOptions;
  }

  getProviderInfo(): AIProvider {
    return {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models from OpenAI',
      apiKeyRequired: true,
      supportedModels: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description:
            'Most advanced multimodal model with vision, faster and cheaper than GPT-4 Turbo',
          maxTokens: 128000,
          costPer1kTokens: 0.0025, // Input: $2.50, Output: $10.00 per 1M tokens (averaged)
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Affordable small model for fast, lightweight tasks',
          maxTokens: 128000,
          costPer1kTokens: 0.00015, // Input: $0.15, Output: $0.60 per 1M tokens (averaged)
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'Previous generation turbo model with vision capabilities',
          maxTokens: 128000,
          costPer1kTokens: 0.01, // Input: $10, Output: $30 per 1M tokens (averaged)
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Original GPT-4, highly capable but more expensive',
          maxTokens: 8192,
          costPer1kTokens: 0.03, // Input: $30, Output: $60 per 1M tokens (averaged)
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and cost-effective for most tasks',
          maxTokens: 16385,
          costPer1kTokens: 0.0005, // Input: $0.50, Output: $1.50 per 1M tokens (averaged)
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
      stream?: boolean;
      onStream?: (chunk: StreamChunk) => void;
      functions?: OpenAIFunction[];
      function_call?: 'auto' | 'none' | { name: string };
    } = {}
  ): Promise<AIResponse> {
    const model = options.model || 'gpt-4o-mini';
    this.startPerformanceTracking();
    let success = false;

    try {
      const temperature =
        options.temperature || this.advancedOptions?.frequency_penalty !== undefined ? 0.7 : 0.7;
      const maxTokens = options.maxTokens || 1000;
      const stream = options.stream || false;

      // Build system message with context
      const systemMessage = this.buildSystemMessage(context);

      // Convert to OpenAI format
      const openAIMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ];

      // Build request body with advanced options
      const requestBody: Record<string, unknown> = {
        model,
        messages: openAIMessages,
        temperature,
        max_tokens: maxTokens,
        stream,
        ...this.advancedOptions,
      };

      // Add function calling if provided
      if (options.functions && options.functions.length > 0) {
        requestBody.functions = options.functions;
        if (options.function_call) {
          requestBody.function_call = options.function_call;
        }
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`
        );
      }

      if (stream && response.body) {
        const result = await this.handleStreamingResponse(
          response,
          model,
          context,
          options.onStream
        );
        success = true;
        this.recordPerformance(
          model,
          result.usage.totalTokens,
          result.usage.estimatedCost,
          success
        );
        return result;
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const usage = data.usage || {};
      const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);

      // More accurate cost calculation with input/output pricing
      const inputCost = modelInfo
        ? (usage.prompt_tokens || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const outputCost = modelInfo
        ? (usage.completion_tokens || 0) * (modelInfo.costPer1kTokens / 1000) * 2
        : 0; // Output typically 2-4x input
      const estimatedCost = inputCost + outputCost;

      success = true;
      this.recordPerformance(model, usage.total_tokens || 0, estimatedCost, success);

      return {
        id: data.id || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.choices[0]?.message?.content || '',
        model,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          estimatedCost,
        },
        context,
        timestamp: new Date().toISOString(),
        functionCall: data.choices[0]?.message?.function_call,
      };
    } catch (error) {
      this.recordPerformance(model, 0, 0, success);
      throw this.createAIError(
        'CHAT_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async handleStreamingResponse(
    response: Response,
    model: string,
    context: AIContext,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    let fullContent = '';
    let totalTokens = 0;
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter(line => line.trim().startsWith('data: '))
          .map(line => line.replace('data: ', ''));

        for (const line of lines) {
          if (line === '[DONE]') {
            break;
          }

          try {
            const data = JSON.parse(line);
            const delta = data.choices[0]?.delta?.content || '';

            if (delta) {
              fullContent += delta;
              totalTokens++;

              if (onStream) {
                onStream({
                  content: delta,
                  done: false,
                  model,
                });
              }
            }

            if (data.choices[0]?.finish_reason) {
              break;
            }
          } catch (e) {
            // Skip invalid JSON lines
            console.warn('Failed to parse streaming chunk:', e);
          }
        }
      }

      if (onStream) {
        onStream({
          content: '',
          done: true,
          model,
          tokens: totalTokens,
        });
      }
    } finally {
      reader.releaseLock();
    }

    const estimatedTokens = Math.ceil(fullContent.length / 4);
    const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);
    const estimatedCost = modelInfo ? estimatedTokens * (modelInfo.costPer1kTokens / 1000) * 2 : 0;

    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: fullContent,
      model,
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: estimatedTokens,
        totalTokens: totalTokens || estimatedTokens * 2,
        estimatedCost,
      },
      context,
      timestamp: new Date().toISOString(),
    };
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

    // For full analysis, try to parse structured response
    if (analysisType === 'full') {
      return this.parseFullAnalysis(result);
    }

    return result;
  }

  /**
   * Check connection to OpenAI API
   */
  async checkConnection(): Promise<boolean> {
    const status = await this.getConnectionStatus();
    return status.connected;
  }

  /**
   * Get detailed connection status
   */
  async getConnectionStatus(): Promise<OpenAIConnectionStatus> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          connected: false,
          apiKeyValid: response.status !== 401,
          error: errorData.error?.message || `HTTP ${response.status}`,
        };
      }

      // Check rate limit headers if available
      const rateLimit = response.headers.get('x-ratelimit-limit-requests');
      const tokenLimit = response.headers.get('x-ratelimit-limit-tokens');

      return {
        connected: true,
        apiKeyValid: true,
        rateLimit:
          rateLimit && tokenLimit
            ? {
                requestsPerMinute: parseInt(rateLimit),
                tokensPerMinute: parseInt(tokenLimit),
              }
            : undefined,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Get performance metrics for a specific model
   */
  getModelPerformance(modelId: string): OpenAIPerformanceMetrics | null {
    return this.performanceMetrics.get(modelId) || null;
  }

  /**
   * Get performance metrics for all models
   */
  getAllPerformanceMetrics(): OpenAIPerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values());
  }

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  /**
   * Start tracking request performance
   */
  private startPerformanceTracking(): void {
    this.requestStartTime = Date.now();
  }

  /**
   * Record performance metrics for a request
   */
  private recordPerformance(modelId: string, tokens: number, cost: number, success: boolean): void {
    const responseTime = Date.now() - this.requestStartTime;
    const tokensPerSecond = tokens / (responseTime / 1000);

    const existing = this.performanceMetrics.get(modelId);

    if (existing) {
      const totalRequests = existing.totalRequests + 1;
      const avgResponseTime =
        (existing.averageResponseTime * existing.totalRequests + responseTime) / totalRequests;
      const avgTokensPerSecond =
        (existing.tokensPerSecond * existing.totalRequests + tokensPerSecond) / totalRequests;
      const avgCost = (existing.averageCost * existing.totalRequests + cost) / totalRequests;
      const successCount = Math.round((existing.successRate * existing.totalRequests) / 100);
      const newSuccessRate = ((successCount + (success ? 1 : 0)) / totalRequests) * 100;

      this.performanceMetrics.set(modelId, {
        modelId,
        averageResponseTime: avgResponseTime,
        tokensPerSecond: avgTokensPerSecond,
        totalRequests,
        successRate: newSuccessRate,
        lastUsed: new Date().toISOString(),
        averageCost: avgCost,
      });
    } else {
      this.performanceMetrics.set(modelId, {
        modelId,
        averageResponseTime: responseTime,
        tokensPerSecond,
        totalRequests: 1,
        successRate: success ? 100 : 0,
        lastUsed: new Date().toISOString(),
        averageCost: cost,
      });
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
    // Simple parsing - in production, you might want more sophisticated parsing
    const lines = result.split('\n').filter(line => line.trim());

    return {
      summary: this.extractSection(result, 'summary') || lines[0] || '',
      keyTopics: this.extractListItems(result, 'topics'),
      suggestedTags: this.extractTags(result),
      suggestedConnections: [],
      sentiment: this.extractSentiment(result),
      complexity: this.extractComplexity(result),
      readabilityScore: 7, // Default score
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
      provider: 'openai',
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
