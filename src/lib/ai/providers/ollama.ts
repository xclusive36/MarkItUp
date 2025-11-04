import {
  AIProvider,
  AIMessage,
  AIResponse,
  AIContext,
  AIError,
  AIModel,
  AICapability,
  OllamaModelDetails,
  OllamaConnectionStatus,
  OllamaAdvancedOptions,
  StreamChunk,
  OllamaPerformanceMetrics,
  OllamaModelLibraryEntry,
  OllamaDiscoveredServer,
  OllamaModelUpdate,
  OllamaContextUsage,
} from '../types';

export class OllamaProvider implements AIProviderInterface {
  private baseURL: string;
  private cachedModels: AIModel[] | null = null;
  private advancedOptions?: OllamaAdvancedOptions;
  private performanceMetrics: Map<string, OllamaPerformanceMetrics> = new Map();
  private requestStartTime: number = 0;

  constructor(baseURL: string = 'http://localhost:11434', advancedOptions?: OllamaAdvancedOptions) {
    // Normalize URL: remove trailing slash
    this.baseURL = baseURL.replace(/\/$/, '');
    this.advancedOptions = advancedOptions;
  }

  getProviderInfo(): AIProvider {
    return {
      id: 'ollama',
      name: 'Ollama (Local)',
      description: 'Local AI models via Ollama',
      apiKeyRequired: false,
      supportedModels: this.cachedModels || [],
    };
  }

  private async fetchAvailableModels(): Promise<AIModel[]> {
    // Return cached models if available
    if (this.cachedModels && this.cachedModels.length > 0) {
      return this.cachedModels;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch Ollama models, using empty list');
        this.cachedModels = [];
        return [];
      }

      const data = await response.json();
      const ollamaModels = data.models || [];

      // Convert Ollama models to our AIModel format with enhanced details
      this.cachedModels = ollamaModels.map((model: OllamaModelDetails) => ({
        id: model.name,
        name: this.formatModelName(model.name),
        description: `${model.details?.parameter_size || 'Unknown size'} - ${this.formatSize(model.size)}${model.details?.quantization_level ? ` (${model.details.quantization_level})` : ''}`,
        maxTokens: this.estimateMaxTokens(model.name),
        costPer1kTokens: 0, // Local, no cost
        capabilities: ['chat', 'completion', 'analysis', 'summarization'] as AICapability[],
        size: model.size,
        parameterSize: model.details?.parameter_size,
        quantization: model.details?.quantization_level,
        modifiedAt: model.modified_at,
      }));

      return this.cachedModels || [];
    } catch (error) {
      console.warn('Error fetching Ollama models:', error);
      this.cachedModels = [];
      return [];
    }
  }

  private formatModelName(name: string): string {
    // Convert model name like "llama3.2:latest" to "Llama 3.2"
    const baseName = name.split(':')[0];
    if (!baseName) return name;

    return baseName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatSize(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  }

  private estimateMaxTokens(modelName: string): number {
    // Estimate max tokens based on model name
    const lowerName = modelName.toLowerCase();
    if (lowerName.includes('codellama')) return 16384;
    if (lowerName.includes('llama3')) return 8192;
    if (lowerName.includes('mistral')) return 8192;
    if (lowerName.includes('gemma')) return 8192;
    if (lowerName.includes('phi')) return 4096;
    return 4096; // Default
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
    const model = options.model || 'llama3.2';
    this.startPerformanceTracking();
    let success = false;

    try {
      const temperature = options.temperature || this.advancedOptions?.temperature || 0.7;
      const stream = options.stream || false;

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

      // Merge advanced options
      const ollamaOptions = {
        temperature,
        num_predict: options.maxTokens || 1000,
        ...this.advancedOptions,
      };

      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: ollamaMessages,
          options: ollamaOptions,
          stream,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      if (stream && response.body) {
        const result = await this.handleStreamingResponse(
          response,
          model,
          context,
          options.onStream
        );
        success = true;
        this.recordPerformance(model, result.usage.totalTokens, success);
        return result;
      }

      const data = await response.json();

      // Ollama doesn't provide detailed token counts, estimate based on content
      const estimatedTokens = Math.ceil((data.message?.content?.length || 0) / 4);

      success = true;
      this.recordPerformance(model, estimatedTokens * 2, success);

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
      this.recordPerformance(model, 0, success);
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
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullContent += data.message.content;

              if (onStream) {
                onStream({
                  content: data.message.content,
                  done: data.done || false,
                  model,
                });
              }
            }

            if (data.done) {
              break;
            }
          } catch (e) {
            // Skip invalid JSON lines
            console.warn('Failed to parse streaming chunk:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const estimatedTokens = Math.ceil(fullContent.length / 4);

    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: fullContent,
      model,
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: estimatedTokens,
        totalTokens: estimatedTokens * 2,
        estimatedCost: 0,
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

    if (analysisType === 'full') {
      return this.parseFullAnalysis(result);
    }

    return result;
  }

  async checkConnection(): Promise<boolean> {
    const status = await this.getConnectionStatus();
    return status.connected;
  }

  async getConnectionStatus(): Promise<OllamaConnectionStatus> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          connected: false,
          error: `Server responded with ${response.status}`,
        };
      }

      const data = await response.json();
      const modelCount = data.models?.length || 0;

      // Try to get version info
      let version: string | undefined;
      try {
        const versionResponse = await fetch(`${this.baseURL}/api/version`);
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          version = versionData.version;
        }
      } catch {
        // Version endpoint might not exist in older Ollama versions
      }

      return {
        connected: true,
        version,
        modelCount,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async listAvailableModels(): Promise<string[]> {
    const models = await this.fetchAvailableModels();
    return models.map(model => model.id);
  }

  // Refresh cached models from Ollama server
  async refreshModels(): Promise<AIModel[]> {
    this.cachedModels = null; // Clear cache
    return this.fetchAvailableModels();
  }

  // Pull/download a model from Ollama library
  async pullModel(
    modelName: string,
    onProgress?: (progress: { status: string; completed?: number; total?: number }) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: true,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to pull model: ${response.status} ${response.statusText}`,
        };
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (onProgress && data.status) {
                onProgress({
                  status: data.status,
                  completed: data.completed,
                  total: data.total,
                });
              }

              if (data.error) {
                return {
                  success: false,
                  error: data.error,
                };
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Refresh models after successful pull
      await this.refreshModels();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Delete a model from local Ollama
  async deleteModel(modelName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to delete model: ${response.status} ${response.statusText}`,
        };
      }

      // Refresh models after successful deletion
      await this.refreshModels();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get detailed information about a specific model
  async getModelInfo(modelName: string): Promise<OllamaModelDetails | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching model info:', error);
      return null;
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
      provider: 'ollama',
    };
  }

  // ========================================
  // V3.0 Enhancement Methods
  // ========================================

  /**
   * Get performance metrics for a specific model
   */
  getModelPerformance(modelId: string): OllamaPerformanceMetrics | null {
    return this.performanceMetrics.get(modelId) || null;
  }

  /**
   * Get performance metrics for all models
   */
  getAllPerformanceMetrics(): OllamaPerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values());
  }

  /**
   * Track performance for a request (call before request)
   */
  private startPerformanceTracking(): void {
    this.requestStartTime = Date.now();
  }

  /**
   * Record performance metrics (call after request)
   */
  private recordPerformance(modelId: string, tokens: number, success: boolean): void {
    const responseTime = Date.now() - this.requestStartTime;
    const tokensPerSecond = tokens / (responseTime / 1000);

    const existing = this.performanceMetrics.get(modelId);

    if (existing) {
      // Update existing metrics
      const totalRequests = existing.totalRequests + 1;
      const avgResponseTime =
        (existing.averageResponseTime * existing.totalRequests + responseTime) / totalRequests;
      const avgTokensPerSecond =
        (existing.tokensPerSecond * existing.totalRequests + tokensPerSecond) / totalRequests;
      const successCount = Math.round((existing.successRate * existing.totalRequests) / 100);
      const newSuccessRate = ((successCount + (success ? 1 : 0)) / totalRequests) * 100;

      this.performanceMetrics.set(modelId, {
        modelId,
        averageResponseTime: avgResponseTime,
        tokensPerSecond: avgTokensPerSecond,
        totalRequests,
        successRate: newSuccessRate,
        lastUsed: new Date().toISOString(),
      });
    } else {
      // Create new metrics
      this.performanceMetrics.set(modelId, {
        modelId,
        averageResponseTime: responseTime,
        tokensPerSecond,
        totalRequests: 1,
        successRate: success ? 100 : 0,
        lastUsed: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear performance metrics for all models
   */
  clearPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  /**
   * Discover Ollama servers on the local network
   */
  async discoverServers(timeout: number = 5000): Promise<OllamaDiscoveredServer[]> {
    const discovered: OllamaDiscoveredServer[] = [];
    const commonPorts = [11434]; // Ollama default port
    const localIPs = this.generateLocalIPs();

    const checkServer = async (url: string): Promise<OllamaDiscoveredServer | null> => {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${url}/api/tags`, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          const modelCount = data.models?.length || 0;

          // Try to get version
          let version: string | undefined;
          try {
            const versionResponse = await fetch(`${url}/api/version`, {
              signal: controller.signal,
            });
            if (versionResponse.ok) {
              const versionData = await versionResponse.json();
              version = versionData.version;
            }
          } catch {
            // Version endpoint might not exist
          }

          return {
            url,
            name: `Ollama Server (${new URL(url).hostname})`,
            version,
            modelCount,
            responseTime,
            discoveredAt: new Date().toISOString(),
          };
        }
      } catch {
        // Server not found or timeout
      }
      return null;
    };

    // Check localhost first
    const localhostResult = await checkServer('http://localhost:11434');
    if (localhostResult) {
      discovered.push(localhostResult);
    }

    // Check local network IPs
    const checks = localIPs.flatMap(ip =>
      commonPorts.map(port => checkServer(`http://${ip}:${port}`))
    );

    const results = await Promise.all(checks);
    discovered.push(...results.filter((r): r is OllamaDiscoveredServer => r !== null));

    return discovered;
  }

  /**
   * Generate common local IP addresses to check
   */
  private generateLocalIPs(): string[] {
    const ips: string[] = [];
    // Generate 192.168.1.x range (common home network)
    for (let i = 2; i < 255; i++) {
      ips.push(`192.168.1.${i}`);
    }
    // Could add more ranges like 192.168.0.x, 10.0.0.x, etc.
    return ips;
  }

  /**
   * Get the Ollama model library (popular models)
   */
  async getModelLibrary(): Promise<OllamaModelLibraryEntry[]> {
    const installedModels = await this.listAvailableModels();

    // Curated list of popular Ollama models
    const library: OllamaModelLibraryEntry[] = [
      {
        name: 'llama3.2',
        displayName: 'Llama 3.2',
        description: "Meta's latest Llama model, excellent general-purpose AI",
        tags: ['general', 'chat', 'recommended'],
        pullCount: 1000000,
        updatedAt: '2024-09-25',
        size: '2.0 GB',
        parameterSize: '3B',
        capabilities: ['chat', 'completion', 'analysis'],
        isInstalled: installedModels.includes('llama3.2'),
      },
      {
        name: 'llama3.2:1b',
        displayName: 'Llama 3.2 (1B)',
        description: 'Lightweight Llama 3.2, fast and efficient',
        tags: ['general', 'chat', 'lightweight'],
        pullCount: 500000,
        updatedAt: '2024-09-25',
        size: '1.3 GB',
        parameterSize: '1B',
        capabilities: ['chat', 'completion'],
        isInstalled: installedModels.includes('llama3.2:1b'),
      },
      {
        name: 'llama3.1',
        displayName: 'Llama 3.1',
        description: 'Previous Llama version, very capable',
        tags: ['general', 'chat'],
        pullCount: 2000000,
        updatedAt: '2024-07-23',
        size: '4.7 GB',
        parameterSize: '8B',
        capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        isInstalled: installedModels.includes('llama3.1'),
      },
      {
        name: 'codellama',
        displayName: 'Code Llama',
        description: 'Specialized for code generation and programming tasks',
        tags: ['code', 'programming', 'development'],
        pullCount: 800000,
        updatedAt: '2024-08-15',
        size: '3.8 GB',
        parameterSize: '7B',
        capabilities: ['chat', 'completion', 'code'],
        isInstalled: installedModels.includes('codellama'),
      },
      {
        name: 'mistral',
        displayName: 'Mistral 7B',
        description: 'Efficient and powerful, great for general tasks',
        tags: ['general', 'chat', 'efficient'],
        pullCount: 1500000,
        updatedAt: '2024-09-10',
        size: '4.1 GB',
        parameterSize: '7B',
        capabilities: ['chat', 'completion', 'analysis'],
        isInstalled: installedModels.includes('mistral'),
      },
      {
        name: 'phi3',
        displayName: 'Phi-3',
        description: "Microsoft's compact but capable model",
        tags: ['general', 'compact', 'efficient'],
        pullCount: 400000,
        updatedAt: '2024-08-20',
        size: '2.3 GB',
        parameterSize: '3.8B',
        capabilities: ['chat', 'completion'],
        isInstalled: installedModels.includes('phi3'),
      },
      {
        name: 'gemma2:9b',
        displayName: 'Gemma 2 (9B)',
        description: "Google's Gemma 2, excellent performance",
        tags: ['general', 'chat', 'powerful'],
        pullCount: 600000,
        updatedAt: '2024-06-27',
        size: '5.4 GB',
        parameterSize: '9B',
        capabilities: ['chat', 'completion', 'analysis', 'summarization'],
        isInstalled: installedModels.includes('gemma2:9b'),
      },
      {
        name: 'qwen2.5',
        displayName: 'Qwen 2.5',
        description: "Alibaba's powerful multilingual model",
        tags: ['general', 'multilingual', 'chat'],
        pullCount: 300000,
        updatedAt: '2024-09-18',
        size: '4.7 GB',
        parameterSize: '7B',
        capabilities: ['chat', 'completion', 'multilingual'],
        isInstalled: installedModels.includes('qwen2.5'),
      },
      {
        name: 'deepseek-coder-v2',
        displayName: 'DeepSeek Coder v2',
        description: 'Advanced code generation and understanding',
        tags: ['code', 'programming', 'advanced'],
        pullCount: 250000,
        updatedAt: '2024-08-30',
        size: '8.9 GB',
        parameterSize: '16B',
        capabilities: ['chat', 'completion', 'code', 'analysis'],
        isInstalled: installedModels.includes('deepseek-coder-v2'),
      },
      {
        name: 'llama3.1:70b',
        displayName: 'Llama 3.1 (70B)',
        description: 'Large Llama model, highest quality but resource intensive',
        tags: ['general', 'chat', 'large', 'powerful'],
        pullCount: 150000,
        updatedAt: '2024-07-23',
        size: '40 GB',
        parameterSize: '70B',
        capabilities: ['chat', 'completion', 'analysis', 'summarization', 'reasoning'],
        isInstalled: installedModels.includes('llama3.1:70b'),
      },
    ];

    return library;
  }

  /**
   * Check for model updates
   */
  async checkForUpdates(): Promise<OllamaModelUpdate[]> {
    try {
      const installedModels = await this.fetchAvailableModels();
      const updates: OllamaModelUpdate[] = [];

      for (const model of installedModels) {
        // Check if a newer version exists in the registry
        // This is a simplified check - in reality, Ollama would need API support for this
        const updateAvailable = false; // Placeholder - needs Ollama API support

        updates.push({
          modelName: model.id,
          currentVersion: model.modifiedAt || 'unknown',
          latestVersion: model.modifiedAt || 'unknown',
          updateAvailable,
          sizeChange: 0,
        });
      }

      return updates;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return [];
    }
  }

  /**
   * Calculate context usage for the current conversation
   */
  calculateContextUsage(messages: AIMessage[], contextWindow: number = 2048): OllamaContextUsage {
    // Rough estimation: ~4 characters per token
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);
    const percentage = (estimatedTokens / contextWindow) * 100;

    return {
      used: estimatedTokens,
      limit: contextWindow,
      percentage: Math.min(percentage, 100),
      warning: percentage > 80,
    };
  }

  /**
   * Update base URL (useful for switching presets)
   */
  updateBaseURL(newURL: string): void {
    this.baseURL = newURL;
    this.cachedModels = null; // Clear cache when switching servers
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
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
