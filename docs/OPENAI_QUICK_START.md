# OpenAI Provider Quick Start

## Installation

The OpenAI provider is already integrated into MarkItUp. Just add your API key!

## Basic Setup

```typescript
import { OpenAIProvider } from '@/lib/ai/providers/openai';

// Simple initialization
const provider = new OpenAIProvider(process.env.OPENAI_API_KEY);

// With advanced options
const provider = new OpenAIProvider(process.env.OPENAI_API_KEY, {
  response_format: { type: 'json_object' },
  frequency_penalty: 0.5,
  presence_penalty: 0.3
});
```

## Quick Examples

### 1. Simple Chat

```typescript
const response = await provider.chat(
  [{ id: '1', role: 'user', content: 'Hello!', timestamp: new Date().toISOString() }],
  { relatedNotes: [], conversationHistory: [] }
);
console.log(response.content);
```

### 2. Streaming Chat

```typescript
await provider.chat(messages, context, {
  stream: true,
  onStream: (chunk) => {
    if (!chunk.done) {
      process.stdout.write(chunk.content);
    }
  }
});
```

### 3. Using GPT-4o Mini (Recommended)

```typescript
const response = await provider.chat(messages, context, {
  model: 'gpt-4o-mini',  // Cheapest and fastest!
  temperature: 0.7
});
```

### 4. JSON Mode

```typescript
const provider = new OpenAIProvider(apiKey, {
  response_format: { type: 'json_object' }
});

const response = await provider.complete(
  'List 3 colors as JSON: {"colors": [...]}'
);
const data = JSON.parse(response);
```

### 5. Function Calling

```typescript
const response = await provider.chat(messages, context, {
  functions: [{
    name: 'get_weather',
    description: 'Get weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' }
      },
      required: ['location']
    }
  }],
  function_call: 'auto'
});

if (response.functionCall) {
  const args = JSON.parse(response.functionCall.arguments);
  // Call your function with args
}
```

### 6. Connection Check

```typescript
if (await provider.checkConnection()) {
  console.log('✅ Connected to OpenAI');
} else {
  console.log('❌ Connection failed');
}
```

### 7. Performance Metrics

```typescript
// After making requests
const metrics = provider.getModelPerformance('gpt-4o-mini');
console.log(`Avg response: ${metrics.averageResponseTime}ms`);
console.log(`Success rate: ${metrics.successRate}%`);
```

## Model Selection Guide

| Use Case | Model | Why |
|----------|-------|-----|
| Chat interface | gpt-4o-mini | Fast, cheap, good quality |
| Complex analysis | gpt-4o | Best reasoning, multimodal |
| High volume tasks | gpt-4o-mini | Most cost-effective |
| Legacy code | gpt-3.5-turbo | Backward compatibility |

## Cost Comparison

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| gpt-4o-mini | $0.150 | $0.600 |
| gpt-4o | $2.50 | $10.00 |
| gpt-3.5-turbo | $0.50 | $1.50 |

## Advanced Options

```typescript
const provider = new OpenAIProvider(apiKey, {
  frequency_penalty: 0.5,    // Reduce repetition
  presence_penalty: 0.3,      // Encourage new topics
  top_p: 0.9,                 // Nucleus sampling
  seed: 12345,                // Deterministic output
  response_format: {          // Force JSON
    type: 'json_object'
  }
});
```

## Best Practices

1. **Always use `gpt-4o-mini` as default** - It's the best value
2. **Enable streaming for chat UIs** - Better UX
3. **Check connection before requests** - Avoid failed calls
4. **Monitor performance metrics** - Optimize model selection
5. **Use function calling for structured tasks** - More reliable than parsing

## Common Patterns

### Error Handling

```typescript
try {
  const response = await provider.chat(messages, context);
} catch (error) {
  if (error.code === 'CHAT_ERROR') {
    console.error('API Error:', error.message);
  }
}
```

### Retry Logic

```typescript
async function chatWithRetry(messages, context, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await provider.chat(messages, context);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Streaming with React

```typescript
const [response, setResponse] = useState('');

await provider.chat(messages, context, {
  stream: true,
  onStream: (chunk) => {
    if (!chunk.done) {
      setResponse(prev => prev + chunk.content);
    }
  }
});
```

## Troubleshooting

**Issue:** "API key invalid"
- Check your `.env.local` file has `OPENAI_API_KEY=sk-...`
- Verify key at https://platform.openai.com/api-keys

**Issue:** "Rate limit exceeded"
- Check rate limits in connection status
- Implement exponential backoff
- Upgrade your OpenAI plan

**Issue:** Streaming not working
- Ensure `stream: true` is set
- Provide `onStream` callback
- Check network supports streaming

**Issue:** High costs
- Switch to `gpt-4o-mini`
- Reduce `maxTokens`
- Use caching where possible

## Next Steps

- Read [Full Enhancement Documentation](./OPENAI_PROVIDER_ENHANCEMENTS.md)
- Explore function calling examples
- Set up performance monitoring
- Implement streaming in your UI

## Support

For issues or questions:
- Check documentation in `/docs`
- Review type definitions in `src/lib/ai/types.ts`
- See implementation in `src/lib/ai/providers/openai.ts`
