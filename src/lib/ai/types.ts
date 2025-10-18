// AI Service Types for MarkItUp
import { PluginManifest } from '../types';

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  apiKeyRequired: boolean;
  supportedModels: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: AICapability[];
  size?: number; // Model size in bytes (for Ollama)
  parameterSize?: string; // e.g., "7B", "13B" (for Ollama)
  quantization?: string; // e.g., "Q4_0", "Q8_0" (for Ollama)
  modifiedAt?: string; // Last modified date (for Ollama)
}

export type AICapability = 'chat' | 'completion' | 'embedding' | 'analysis' | 'summarization';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
  context?: AIContext;
}

export interface AIContext {
  relatedNotes: Array<{
    id: string;
    name: string;
    relevantContent: string;
    relevanceScore: number;
  }>;
  searchResults?: Array<{
    noteId: string;
    noteName: string;
    snippet: string;
    score: number;
  }>;
  conversationHistory: AIMessage[];
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  context: AIContext;
  timestamp: string;
  functionCall?: OpenAIFunctionCall; // Optional function call from OpenAI
}

export interface AISettings {
  provider: string;
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  enableContext: boolean;
  maxContextNotes: number;
  contextSearchDepth: number;
  enableUsageTracking: boolean;
  monthlyLimit: number;
  enableLocalFallback: boolean;
  ollamaUrl?: string; // Custom Ollama server URL (defaults to http://localhost:11434)
  ollamaPresets?: OllamaServerPreset[]; // Saved Ollama server configurations
  ollamaAdvancedOptions?: OllamaAdvancedOptions; // Advanced Ollama parameters
  enableStreaming?: boolean; // Enable real-time streaming responses (Ollama only)
  activeOllamaPreset?: string; // ID of currently active preset
  ollamaPerformanceTracking?: boolean; // Track performance metrics per model
  ollamaAutoDiscovery?: boolean; // Enable auto-discovery of Ollama servers
  ollamaShowModelLibrary?: boolean; // Show model library browser
  ollamaCheckUpdates?: boolean; // Automatically check for model updates
}

export interface ChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  noteContext?: string; // Current note being discussed
  totalTokens: number;
  totalCost: number;
}

export interface AIAnalysis {
  summary: string;
  keyTopics: string[];
  suggestedTags: string[];
  suggestedConnections: Array<{
    noteId: string;
    noteName: string;
    reason: string;
    confidence: number;
  }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: number;
  readabilityScore: number;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  requestsByModel: Record<string, number>;
  tokensByModel: Record<string, number>;
  costsByModel: Record<string, number>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  averageResponseTime: number;
  errorRate: number;
}

export interface AIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  model?: string;
  provider?: string;
}

// Plugin extension types
export interface AIPluginCapabilities {
  providesModels: boolean;
  requiresAPI: boolean;
  supportedTasks: AICapability[];
  customEndpoints?: string[];
}

export interface AIPlugin extends PluginManifest {
  aiCapabilities: AIPluginCapabilities;
}

// API request/response types
export interface ChatRequest {
  message: string;
  sessionId?: string;
  noteContext?: string;
  includeContext?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  success: boolean;
  data?: AIResponse;
  error?: AIError;
  sessionId: string;
}

export interface AnalysisRequest {
  content: string;
  noteId?: string;
  analysisType: 'summary' | 'topics' | 'tags' | 'connections' | 'full';
}

export interface AnalysisResponse {
  success: boolean;
  data?: AIAnalysis;
  error?: AIError;
}

// Ollama-specific types
export interface OllamaServerPreset {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
  createdAt: string;
  description?: string; // Optional description
  lastUsed?: string; // Last time this preset was used
  isDiscovered?: boolean; // Whether this was auto-discovered on network
}

export interface OllamaAdvancedOptions {
  num_ctx?: number; // Context window size (default varies by model)
  num_gpu?: number; // Number of GPU layers to offload
  num_thread?: number; // Number of threads to use
  repeat_penalty?: number; // Penalty for repetition (default 1.1)
  temperature?: number; // Override default temperature
  top_k?: number; // Top-k sampling (default 40)
  top_p?: number; // Top-p sampling (default 0.9)
  seed?: number; // Random seed for reproducibility
}

export interface OllamaPerformanceMetrics {
  modelId: string;
  averageResponseTime: number; // ms
  tokensPerSecond: number;
  totalRequests: number;
  successRate: number; // 0-100
  lastUsed: string;
  memoryUsage?: number; // MB
}

export interface OllamaModelLibraryEntry {
  name: string;
  displayName: string;
  description: string;
  tags: string[];
  pullCount: number;
  updatedAt: string;
  size?: string; // e.g., "4.1GB"
  parameterSize?: string; // e.g., "7B"
  capabilities: string[];
  isInstalled: boolean;
}

export interface OllamaDiscoveredServer {
  url: string;
  name?: string;
  version?: string;
  modelCount?: number;
  responseTime: number; // ms
  discoveredAt: string;
}

export interface OllamaModelUpdate {
  modelName: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  sizeChange?: number; // bytes
  releaseNotes?: string;
}

export interface OllamaContextUsage {
  used: number;
  limit: number;
  percentage: number;
  warning: boolean; // true if approaching limit (>80%)
}

export interface OllamaModelDetails {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaConnectionStatus {
  connected: boolean;
  version?: string;
  modelCount?: number;
  error?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
  tokens?: number;
}

// OpenAI-specific types
export interface OpenAIAdvancedOptions {
  frequency_penalty?: number; // -2.0 to 2.0, penalize frequent tokens
  presence_penalty?: number; // -2.0 to 2.0, penalize tokens that have appeared
  top_p?: number; // 0 to 1, nucleus sampling
  response_format?: { type: 'text' | 'json_object' }; // Force JSON output
  seed?: number; // For deterministic outputs
  logit_bias?: Record<string, number>; // Modify token likelihoods
  user?: string; // Unique user identifier for abuse monitoring
}

export interface OpenAIPerformanceMetrics {
  modelId: string;
  averageResponseTime: number; // ms
  tokensPerSecond: number;
  totalRequests: number;
  successRate: number; // 0-100
  lastUsed: string;
  averageCost: number; // Average cost per request
}

export interface OpenAIConnectionStatus {
  connected: boolean;
  apiKeyValid?: boolean;
  organizationId?: string;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  error?: string;
}

export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        enum?: string[];
      }
    >;
    required?: string[];
  };
}

export interface OpenAIFunctionCall {
  name: string;
  arguments: string; // JSON string
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: OpenAIFunctionCall;
}

export interface OpenAIImageContent {
  type: 'image_url';
  image_url: {
    url: string; // Can be base64 data URL or regular URL
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface OpenAITextContent {
  type: 'text';
  text: string;
}
