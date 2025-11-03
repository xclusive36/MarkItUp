/**
 * AI Context Optimization Utilities
 * Reduces token usage and improves AI response quality by intelligently
 * selecting and formatting context data.
 */

export interface ContextOptimizationOptions {
  maxTokens?: number;
  preserveHeadings?: boolean;
  preserveLinks?: boolean;
  preserveTasks?: boolean;
  preserveCodeBlocks?: boolean;
  preserveTags?: boolean;
  includeMetadata?: boolean;
}

export interface OptimizedContext {
  content: string;
  tokenEstimate: number;
  truncated: boolean;
  originalLength: number;
  optimizedLength: number;
}

/**
 * Rough token estimation (approximately 1 token per 4 characters)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // More accurate estimation considering:
  // - Words are typically 1-2 tokens
  // - Punctuation and spaces
  // - Code/special characters
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;

  // Use word count as primary metric, add 20% for punctuation/formatting
  return Math.ceil(words * 1.3);
}

/**
 * Extract important lines from content based on patterns
 */
function extractImportantLines(content: string, options: ContextOptimizationOptions): string[] {
  const lines = content.split('\n');
  const important: string[] = [];

  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (const line of lines) {
    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (options.preserveCodeBlocks) {
        codeBlockContent.push(line);
        if (!inCodeBlock) {
          // End of code block
          important.push(...codeBlockContent);
          codeBlockContent = [];
        }
      }
      continue;
    }

    // If in code block, collect it
    if (inCodeBlock) {
      if (options.preserveCodeBlocks) {
        codeBlockContent.push(line);
      }
      continue;
    }

    const trimmed = line.trim();

    // Always keep non-empty lines with specific patterns
    if (
      (options.preserveHeadings && trimmed.startsWith('#')) ||
      (options.preserveLinks && (trimmed.includes('[[') || trimmed.includes(']('))) ||
      (options.preserveTasks && (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]'))) ||
      (options.preserveTags && trimmed.includes('#') && /\s#\w+/.test(trimmed)) ||
      (trimmed.length > 30 && trimmed.length < 500) // Keep substantial lines
    ) {
      important.push(line);
    }
  }

  return important;
}

/**
 * Optimize content for AI context
 */
export function optimizeContext(
  content: string,
  options: ContextOptimizationOptions = {}
): OptimizedContext {
  const defaults: ContextOptimizationOptions = {
    maxTokens: 2000,
    preserveHeadings: true,
    preserveLinks: true,
    preserveTasks: true,
    preserveCodeBlocks: false, // Code blocks can be very long
    preserveTags: true,
    includeMetadata: true,
  };

  const opts = { ...defaults, ...options };

  if (!content || content.trim().length === 0) {
    return {
      content: '',
      tokenEstimate: 0,
      truncated: false,
      originalLength: 0,
      optimizedLength: 0,
    };
  }

  const originalLength = content.length;
  const originalTokens = estimateTokens(content);

  // If already under token limit, return as-is
  if (originalTokens <= (opts.maxTokens || 2000)) {
    return {
      content,
      tokenEstimate: originalTokens,
      truncated: false,
      originalLength,
      optimizedLength: originalLength,
    };
  }

  // Extract important lines
  const importantLines = extractImportantLines(content, opts);
  let optimized = importantLines.join('\n');

  // If still too long, truncate intelligently
  let truncated = false;
  if (estimateTokens(optimized) > (opts.maxTokens || 2000)) {
    truncated = true;

    // Take first portion (beginning of content is usually most relevant)
    const lines = optimized.split('\n');
    const targetLines: string[] = [];
    let currentTokens = 0;

    for (const line of lines) {
      const lineTokens = estimateTokens(line);
      if (currentTokens + lineTokens > (opts.maxTokens || 2000)) {
        break;
      }
      targetLines.push(line);
      currentTokens += lineTokens;
    }

    optimized = targetLines.join('\n');

    // Add truncation notice
    if (opts.includeMetadata) {
      optimized += '\n\n[... content truncated for context optimization ...]';
    }
  }

  return {
    content: optimized,
    tokenEstimate: estimateTokens(optimized),
    truncated,
    originalLength,
    optimizedLength: optimized.length,
  };
}

/**
 * Optimize note content for AI context
 */
export function optimizeNoteContext(
  noteName: string,
  noteContent: string,
  options: ContextOptimizationOptions = {}
): string {
  const optimized = optimizeContext(noteContent, {
    maxTokens: 1500, // Leave room for other context
    ...options,
  });

  let context = `[Current Note: "${noteName}"`;

  if (optimized.truncated) {
    context += ` (optimized from ${Math.round(optimized.originalLength / 1000)}k to ${Math.round(optimized.optimizedLength / 1000)}k chars)`;
  }

  context += `]\n${optimized.content}\n[End of Note Context]`;

  return context;
}

/**
 * Optimize multiple notes context (e.g., for related notes)
 */
export function optimizeMultiNoteContext(
  notes: Array<{ name: string; content: string }>,
  options: ContextOptimizationOptions = {}
): string {
  if (notes.length === 0) return '';

  // Distribute tokens among notes
  const tokensPerNote = Math.floor((options.maxTokens || 2000) / notes.length);

  const optimizedNotes = notes.map(note => {
    const optimized = optimizeContext(note.content, {
      ...options,
      maxTokens: tokensPerNote,
    });

    return {
      name: note.name,
      content: optimized.content,
      truncated: optimized.truncated,
    };
  });

  let context = '[Related Notes Context]\n\n';

  optimizedNotes.forEach(note => {
    context += `## ${note.name}${note.truncated ? ' (summarized)' : ''}\n`;
    context += `${note.content}\n\n`;
  });

  context += '[End of Related Notes Context]';

  return context;
}

/**
 * Optimize conversation history for AI context
 */
export function optimizeConversationHistory(
  messages: Array<{ role: string; content: string }>,
  maxMessages: number = 10,
  maxTokensPerMessage: number = 200
): Array<{ role: string; content: string }> {
  // Keep system message and recent messages
  const recentMessages = messages.slice(-maxMessages);

  return recentMessages.map(msg => {
    if (msg.role === 'system') {
      return msg; // Don't optimize system messages
    }

    const optimized = optimizeContext(msg.content, {
      maxTokens: maxTokensPerMessage,
      preserveHeadings: false,
      preserveLinks: true,
      preserveTasks: true,
      includeMetadata: false,
    });

    return {
      role: msg.role,
      content: optimized.content,
    };
  });
}

/**
 * Calculate context budget for AI requests
 */
export interface ContextBudget {
  totalBudget: number;
  systemPrompt: number;
  currentNote: number;
  relatedNotes: number;
  conversationHistory: number;
  userMessage: number;
  reserved: number;
}

export function calculateContextBudget(
  modelMaxTokens: number = 8000,
  reserveForResponse: number = 2000
): ContextBudget {
  const availableTokens = modelMaxTokens - reserveForResponse;

  return {
    totalBudget: availableTokens,
    systemPrompt: Math.floor(availableTokens * 0.05), // 5%
    currentNote: Math.floor(availableTokens * 0.3), // 30%
    relatedNotes: Math.floor(availableTokens * 0.2), // 20%
    conversationHistory: Math.floor(availableTokens * 0.25), // 25%
    userMessage: Math.floor(availableTokens * 0.15), // 15%
    reserved: Math.floor(availableTokens * 0.05), // 5% buffer
  };
}

/**
 * Smart content summarization for when full content is too long
 */
export function summarizeContent(content: string, targetLength: number = 500): string {
  if (!content || content.length <= targetLength) {
    return content;
  }

  // Extract key sentences (simple approach)
  const sentences = content.split(/[.!?]\s+/);
  const important: string[] = [];

  // Prioritize:
  // 1. First sentence (usually context)
  // 2. Sentences with numbers/data
  // 3. Sentences with questions
  // 4. Shorter, impactful sentences

  if (sentences.length > 0) {
    important.push(sentences[0]); // Always keep first sentence
  }

  for (const sentence of sentences.slice(1)) {
    if (important.join('. ').length >= targetLength) break;

    if (
      /\d+/.test(sentence) || // Contains numbers
      sentence.includes('?') || // Contains question
      (sentence.length > 20 && sentence.length < 150) // Good length
    ) {
      important.push(sentence);
    }
  }

  return important.join('. ') + '.';
}
