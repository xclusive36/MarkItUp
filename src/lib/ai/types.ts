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
  details?: any;
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
