import {
  AIProvider,
  AIMessage,
  AIResponse,
  AIContext,
  AIError,
  StreamChunk,
  GeminiAdvancedOptions,
  GeminiPerformanceMetrics,
  GeminiConnectionStatus,
  GeminiStreamEvent,
} from '../types';

export class GeminiProvider implements AIProviderInterface {
  private apiKey: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta';
  private advancedOptions?: GeminiAdvancedOptions;
  private performanceMetrics: Map<string, GeminiPerformanceMetrics> = new Map();
  private requestStartTime: number = 0;

  constructor(apiKey: string, advancedOptions?: GeminiAdvancedOptions) {
    this.apiKey = apiKey;
    this.advancedOptions = advancedOptions;
  }

  getProviderInfo(): AIProvider {
    return {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Gemini models from Google',
      apiKeyRequired: true,
      supportedModels: [
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable multimodal model',
          maxTokens: 1000000,
          costPer1kTokens: 0.00125,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient for most tasks',
          maxTokens: 1000000,
          costPer1kTokens: 0.000075,
          capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          description: 'Best for text-based tasks',
          maxTokens: 32768,
          costPer1kTokens: 0.0005,
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
    } = {}
  ): Promise<AIResponse> {
    const model = options.model || 'gemini-1.5-flash';
    this.startPerformanceTracking();
    let success = false;

    try {
      const temperature =
        options.temperature !== undefined
          ? options.temperature
          : this.advancedOptions?.top_p !== undefined
            ? 0.7
            : 0.7;
      const maxTokens = options.maxTokens || this.advancedOptions?.max_output_tokens || 1000;
      const stream = options.stream || false;

      // Build system instruction with context
      const systemInstruction = this.buildSystemMessage(context);

      // Convert to Gemini format (combine user/assistant messages)
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Build generation config with advanced options
      const generationConfig: Record<string, unknown> = {
        temperature,
        maxOutputTokens: maxTokens,
        topP: this.advancedOptions?.top_p ?? 0.95,
        topK: this.advancedOptions?.top_k ?? 40,
      };

      if (this.advancedOptions?.candidate_count) {
        generationConfig.candidateCount = this.advancedOptions.candidate_count;
      }

      if (this.advancedOptions?.stop_sequences) {
        generationConfig.stopSequences = this.advancedOptions.stop_sequences;
      }

      // Build request body
      const requestBody: Record<string, unknown> = {
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig,
      };

      // Add safety settings if provided
      if (this.advancedOptions?.safety_settings) {
        requestBody.safetySettings = this.advancedOptions.safety_settings;
      }

      const endpoint = stream
        ? `${this.baseURL}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`
        : `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} ${errorData.error?.message || response.statusText}`
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

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const candidate = data.candidates[0];
      const content = candidate.content?.parts?.[0]?.text || '';

      // Gemini provides token counts
      const usage = data.usageMetadata || {};
      const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);
      const inputCost = modelInfo
        ? (usage.promptTokenCount || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const outputCost = modelInfo
        ? (usage.candidatesTokenCount || 0) * (modelInfo.costPer1kTokens / 1000)
        : 0;
      const estimatedCost = inputCost + outputCost;

      success = true;
      this.recordPerformance(model, usage.totalTokenCount || 0, estimatedCost, success);

      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        model,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
          estimatedCost,
        },
        context,
        timestamp: new Date().toISOString(),
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
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
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
          .map(line => line.replace('data: ', '').trim());

        for (const line of lines) {
          if (!line || line === '[DONE]') continue;

          try {
            const event: GeminiStreamEvent = JSON.parse(line);

            if (event.candidates && event.candidates.length > 0) {
              const candidate = event.candidates[0];
              if (!candidate) continue;

              const text = candidate.content?.parts?.[0]?.text || '';

              if (text) {
                fullContent += text;

                if (onStream) {
                  onStream({
                    content: text,
                    done: false,
                    model,
                  });
                }
              }

              // Update token counts from usage metadata
              if (event.usageMetadata) {
                totalInputTokens = event.usageMetadata.promptTokenCount || 0;
                totalOutputTokens = event.usageMetadata.candidatesTokenCount || 0;
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
            console.warn('Failed to parse Gemini streaming chunk:', e);
          }
        }
      }

      if (onStream) {
        onStream({
          content: '',
          done: true,
          model,
          tokens: totalInputTokens + totalOutputTokens,
        });
      }
    } finally {
      reader.releaseLock();
    }

    const modelInfo = this.getProviderInfo().supportedModels.find(m => m.id === model);
    const inputCost = modelInfo ? totalInputTokens * (modelInfo.costPer1kTokens / 1000) : 0;
    const outputCost = modelInfo ? totalOutputTokens * (modelInfo.costPer1kTokens / 1000) : 0;
    const estimatedCost = inputCost + outputCost;

    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  /**
   * Check connection to Gemini API
   */
  async checkConnection(): Promise<boolean> {
    const status = await this.getConnectionStatus();
    return status.connected;
  }

  /**
   * Get detailed connection status
   */
  async getConnectionStatus(): Promise<GeminiConnectionStatus> {
    try {
      // Try to list available models to verify API key and connection
      const response = await fetch(`${this.baseURL}/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          connected: false,
          apiKeyValid: response.status !== 401 && response.status !== 403,
          error: errorData.error?.message || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const availableModels =
        data.models?.map((model: { name: string }) => model.name.split('/').pop()) || [];

      return {
        connected: true,
        apiKeyValid: true,
        availableModels,
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
  getModelPerformance(modelId: string): GeminiPerformanceMetrics | null {
    return this.performanceMetrics.get(modelId) || null;
  }

  /**
   * Get performance metrics for all models
   */
  getAllPerformanceMetrics(): GeminiPerformanceMetrics[] {
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
    const tokensPerSecond = tokens > 0 ? (tokens / responseTime) * 1000 : 0;

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
      provider: 'gemini',
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
