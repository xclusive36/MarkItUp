import {
  AIProvider,
  AIMessage,
  AIResponse,
  AIContext,
  AIError,
  StreamChunk,
  AnthropicAdvancedOptions,
  AnthropicTool,
  AnthropicToolUse,
  AnthropicPerformanceMetrics,
  AnthropicStreamEvent,
} from '../types';

export class AnthropicProvider implements AIProviderInterface {
  private apiKey: string;
  private baseURL: string = 'https://api.anthropic.com/v1';
  private advancedOptions?: AnthropicAdvancedOptions;
  private performanceMetrics: Map<string, AnthropicPerformanceMetrics> = new Map();
  private requestStartTime: number = 0;

  constructor(apiKey: string, advancedOptions?: AnthropicAdvancedOptions) {
    this.apiKey = apiKey;
    this.advancedOptions = advancedOptions;
  }

  private startPerformanceTracking(): void {
    this.requestStartTime = Date.now();
  }

  private recordPerformance(modelId: string, tokens: number, cost: number, success: boolean): void {
    const responseTime = Date.now() - this.requestStartTime;
    const existing = this.performanceMetrics.get(modelId);

    if (existing) {
      const totalRequests = existing.totalRequests + 1;
      const successfulRequests = existing.successRate * existing.totalRequests + (success ? 1 : 0);

      this.performanceMetrics.set(modelId, {
        modelId,
        averageResponseTime:
          (existing.averageResponseTime * existing.totalRequests + responseTime) / totalRequests,
        tokensPerSecond: tokens > 0 ? (tokens / responseTime) * 1000 : existing.tokensPerSecond,
        totalRequests,
        successRate: (successfulRequests / totalRequests) * 100,
        lastUsed: new Date().toISOString(),
        averageCost: (existing.averageCost * existing.totalRequests + cost) / totalRequests,
      });
    } else {
      this.performanceMetrics.set(modelId, {
        modelId,
        averageResponseTime: responseTime,
        tokensPerSecond: tokens > 0 ? (tokens / responseTime) * 1000 : 0,
        totalRequests: 1,
        successRate: success ? 100 : 0,
        lastUsed: new Date().toISOString(),
        averageCost: cost,
      });
    }
  }

  getPerformanceMetrics(
    modelId?: string
  ): AnthropicPerformanceMetrics | Map<string, AnthropicPerformanceMetrics> {
    if (modelId) {
      return (
        this.performanceMetrics.get(modelId) || {
          modelId,
          averageResponseTime: 0,
          tokensPerSecond: 0,
          totalRequests: 0,
          successRate: 0,
          lastUsed: new Date().toISOString(),
          averageCost: 0,
        }
      );
    }
    return this.performanceMetrics;
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
      stream?: boolean;
      onStream?: (chunk: StreamChunk) => void;
      tools?: AnthropicTool[];
      tool_choice?: { type: 'auto' | 'any' | 'tool'; name?: string };
    } = {}
  ): Promise<AIResponse> {
    const model = options.model || 'claude-3-5-sonnet-20241022';
    this.startPerformanceTracking();
    let success = false;

    try {
      const temperature =
        options.temperature !== undefined
          ? options.temperature
          : this.advancedOptions?.top_p !== undefined
            ? 0.7
            : 0.7;
      const maxTokens = options.maxTokens || 1000;
      const stream = options.stream || false;

      // Build system message with context
      const systemMessage = this.buildSystemMessage(context);

      // Convert to Anthropic format
      const anthropicMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

      // Build request body with advanced options
      const requestBody: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: anthropicMessages,
        stream,
      };

      // Apply advanced options
      if (this.advancedOptions?.top_k !== undefined) {
        requestBody.top_k = this.advancedOptions.top_k;
      }
      if (this.advancedOptions?.top_p !== undefined) {
        requestBody.top_p = this.advancedOptions.top_p;
      }
      if (this.advancedOptions?.stop_sequences) {
        requestBody.stop_sequences = this.advancedOptions.stop_sequences;
      }
      if (this.advancedOptions?.metadata) {
        requestBody.metadata = this.advancedOptions.metadata;
      }

      // Add tool support if provided
      if (options.tools && options.tools.length > 0) {
        requestBody.tools = options.tools;
        if (options.tool_choice) {
          requestBody.tool_choice = options.tool_choice;
        }
      }

      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Anthropic API error: ${response.status} ${errorData.error?.message || response.statusText}`
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

      const usage = data.usage || {};
      const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);
      const inputCost = modelInfo
        ? (usage.input_tokens || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const outputCost = modelInfo
        ? (usage.output_tokens || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const estimatedCost = inputCost + outputCost;

      // Extract content and tool uses
      const content = data.content || [];
      const textContent = content
        .filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('\n');

      const toolUses = content.filter((block: { type: string }) => block.type === 'tool_use');

      success = true;
      this.recordPerformance(
        model,
        (usage.input_tokens || 0) + (usage.output_tokens || 0),
        estimatedCost,
        success
      );

      const result: AIResponse = {
        id: data.id || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: textContent,
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

      // Add tool use information if present
      if (toolUses.length > 0) {
        (result as AIResponse & { toolUses: AnthropicToolUse[] }).toolUses = toolUses;
      }

      return result;
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
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let messageId = '';
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
          try {
            const event: AnthropicStreamEvent = JSON.parse(line);

            if (event.type === 'message_start') {
              if (event.message) {
                messageId = event.message.id;
                totalInputTokens = event.message.usage.input_tokens;
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta?.type === 'text_delta' && event.delta.text) {
                const text = event.delta.text;
                fullContent += text;

                if (onStream) {
                  onStream({
                    content: text,
                    done: false,
                    model,
                  });
                }
              }
            } else if (event.type === 'message_delta') {
              if (event.usage) {
                totalOutputTokens = event.usage.output_tokens;
              }
            } else if (event.type === 'message_stop') {
              if (onStream) {
                onStream({
                  content: '',
                  done: true,
                  model,
                  tokens: totalInputTokens + totalOutputTokens,
                });
              }
            }
          } catch {
            // Skip invalid JSON lines
            continue;
          }
        }
      }

      const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);
      const inputCost = modelInfo ? totalInputTokens * (modelInfo.costPer1kTokens / 1000) : 0;
      const outputCost = modelInfo ? totalOutputTokens * (modelInfo.costPer1kTokens / 1000) : 0;
      const estimatedCost = inputCost + outputCost;

      return {
        id: messageId || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: fullContent,
        model,
        usage: {
          promptTokens: totalInputTokens,
          completionTokens: totalOutputTokens,
          totalTokens: totalInputTokens + totalOutputTokens,
          estimatedCost,
        },
        context,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw this.createAIError(
        'STREAM_ERROR',
        error instanceof Error ? error.message : 'Streaming failed'
      );
    } finally {
      reader.releaseLock();
    }
  }

  async complete(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
      onStream?: (chunk: StreamChunk) => void;
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
    return match && match[1] ? match[1].trim() : null;
  }

  private extractListItems(text: string, section: string): string[] {
    const sectionMatch = text.match(
      new RegExp(`\\b${section}:?([^\\n]+(?:\\n[^\\n]*)*?)(?=\\n\\d+\\.|\\n[A-Z]|$)`, 'i')
    );
    if (!sectionMatch || !sectionMatch[1]) return [];

    return sectionMatch[1]
      .split(/[\n,]/)
      .map(item => item.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  private extractTags(text: string): string[] {
    const tagsMatch = text.match(/tags?:?\s*([^\n]+)/i);
    if (!tagsMatch || !tagsMatch[1]) return [];

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
    return complexityMatch && complexityMatch[1] ? parseInt(complexityMatch[1]) : 5;
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
