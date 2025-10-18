# Gemini Provider Quick Start

## Basic Setup

```typescript
import { GeminiProvider } from '@/lib/ai/providers/gemini';

// Simple setup
const provider = new GeminiProvider('YOUR_API_KEY');

// With advanced options
const provider = new GeminiProvider('YOUR_API_KEY', {
  top_k: 30,
  top_p: 0.9,
  stop_sequences: ['\n\n', '###']
});
```

## Common Use Cases

### 1. Basic Chat

```typescript
const response = await provider.chat(
  [
    { id: '1', role: 'user', content: 'Hello!', timestamp: new Date().toISOString() }
  ],
  { relatedNotes: [], conversationHistory: [] },
  { model: 'gemini-1.5-flash' }
);

console.log(response.content);
```

### 2. Streaming Chat

```typescript
const response = await provider.chat(
  messages,
  context,
  {
    model: 'gemini-1.5-flash',
    stream: true,
    onStream: (chunk) => {
      if (!chunk.done) {
        process.stdout.write(chunk.content);
      }
    }
  }
);
```

### 3. Content Analysis

```typescript
// Full analysis
const analysis = await provider.analyze(noteContent, 'full');
console.log(analysis); // { summary, keyTopics, suggestedTags, ... }

// Summary only
const summary = await provider.analyze(noteContent, 'summary');
console.log(summary); // String summary
```

### 4. Check Connection

```typescript
// Before making requests
const status = await provider.getConnectionStatus();

if (status.connected) {
  console.log('Available models:', status.availableModels);
  // Proceed with requests
} else {
  console.error('Connection error:', status.error);
}
```

### 5. Monitor Performance

```typescript
// After some usage
const metrics = provider.getModelPerformance('gemini-1.5-flash');

console.log(`
  Average Response Time: ${metrics.averageResponseTime}ms
  Tokens/sec: ${metrics.tokensPerSecond.toFixed(2)}
  Success Rate: ${metrics.successRate.toFixed(1)}%
  Total Requests: ${metrics.totalRequests}
  Average Cost: $${metrics.averageCost.toFixed(4)}
`);
```

## Model Selection Guide

| Model | Best For | Context | Speed | Cost |
|-------|----------|---------|-------|------|
| `gemini-1.5-flash` | Most tasks | 1M tokens | Fast | $0.000075/1K |
| `gemini-1.5-pro` | Complex tasks | 1M tokens | Medium | $0.00125/1K |
| `gemini-pro` | Simple tasks | 32K tokens | Fast | $0.0005/1K |

## Error Handling

```typescript
try {
  const response = await provider.chat(messages, context);
} catch (error) {
  if (error.code === 'CHAT_ERROR') {
    console.error('Chat failed:', error.message);
  }
}
```

## Advanced Configuration

### Safety Settings

```typescript
const provider = new GeminiProvider(apiKey, {
  safety_settings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_ONLY_HIGH'
    }
  ]
});
```

### Multiple Candidates

```typescript
const provider = new GeminiProvider(apiKey, {
  candidate_count: 3 // Generate 3 response variants
});
```

## Tips

1. **Use Flash for Speed**: `gemini-1.5-flash` is fastest and cheapest
2. **Use Pro for Quality**: `gemini-1.5-pro` for complex reasoning
3. **Stream Long Responses**: Enable streaming for better UX
4. **Monitor Performance**: Track metrics to optimize usage
5. **Check Connection**: Validate API key before critical operations

## Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key"
4. Copy and store securely
