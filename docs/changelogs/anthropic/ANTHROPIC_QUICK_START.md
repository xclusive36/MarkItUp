# Anthropic Provider Quick Start

**Updated:** October 18, 2025  
**Version:** 2.0  

Quick guide to using the enhanced Anthropic (Claude) provider with streaming, tool calling, and advanced features.

---

## 📋 Prerequisites

- ✅ MarkItUp installed
- ✅ Anthropic API key ([Get one here](https://console.anthropic.com/))
- ✅ Node.js 18+ (for development/testing)

---

## 🚀 Basic Setup

### 1. Configure API Key

```typescript
import { AnthropicProvider } from '@/lib/ai/providers/anthropic';

const provider = new AnthropicProvider('your-api-key-here');
```

### 2. Simple Chat

```typescript
const response = await provider.chat(
  [
    {
      id: '1',
      role: 'user',
      content: 'Explain quantum computing in simple terms',
      timestamp: new Date().toISOString()
    }
  ],
  { relatedNotes: [], conversationHistory: [] },
  {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 500
  }
);

console.log(response.content);
```

---

## 🌊 Streaming Responses

### Real-time Chat

```typescript
await provider.chat(
  messages,
  context,
  {
    model: 'claude-3-5-sonnet-20241022',
    stream: true,
    onStream: (chunk) => {
      if (chunk.done) {
        console.log(`\n✅ Complete! Used ${chunk.tokens} tokens`);
      } else {
        // Display in real-time
        process.stdout.write(chunk.content);
      }
    }
  }
);
```

### React Component Example

```tsx
import { useState } from 'react';

function StreamingChat() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (message: string) => {
    setIsStreaming(true);
    setResponse('');

    await provider.chat(
      [{ id: '1', role: 'user', content: message, timestamp: new Date().toISOString() }],
      { relatedNotes: [], conversationHistory: [] },
      {
        stream: true,
        onStream: (chunk) => {
          if (chunk.done) {
            setIsStreaming(false);
          } else {
            setResponse(prev => prev + chunk.content);
          }
        }
      }
    );
  };

  return (
    <div>
      <pre>{response}</pre>
      {isStreaming && <span>⏳ Streaming...</span>}
    </div>
  );
}
```

---

## 🛠️ Tool/Function Calling

### Define Tools

```typescript
import { AnthropicTool } from '@/lib/ai/types';

const tools: AnthropicTool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather information for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City and state, e.g., "San Francisco, CA"'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit'
        }
      },
      required: ['location']
    }
  }
];
```

### Use Tools in Conversation

```typescript
const response = await provider.chat(
  [
    {
      id: '1',
      role: 'user',
      content: 'What\'s the weather like in Tokyo?',
      timestamp: new Date().toISOString()
    }
  ],
  { relatedNotes: [], conversationHistory: [] },
  {
    tools: tools,
    tool_choice: { type: 'auto' } // Let Claude decide
  }
);

// Check if Claude wants to use a tool
if (response.toolUses && response.toolUses.length > 0) {
  const toolUse = response.toolUses[0];
  
  console.log(`Claude wants to use: ${toolUse.name}`);
  console.log('With parameters:', toolUse.input);
  
  // Execute the tool
  const toolResult = await executeWeatherAPI(toolUse.input);
  
  // Send result back to Claude (multi-turn)
  // ... continue conversation with tool result
}
```

### Complete Tool Use Example

```typescript
async function chatWithTools(userMessage: string) {
  // Initial request
  let response = await provider.chat(
    [{ id: '1', role: 'user', content: userMessage, timestamp: new Date().toISOString() }],
    { relatedNotes: [], conversationHistory: [] },
    { tools, tool_choice: { type: 'auto' } }
  );

  // If tool use requested
  if (response.toolUses && response.toolUses.length > 0) {
    const toolUse = response.toolUses[0];
    
    // Execute tool
    const toolResult = {
      type: 'tool_result' as const,
      tool_use_id: toolUse.id,
      content: JSON.stringify(await executeWeatherAPI(toolUse.input))
    };

    // Continue conversation with tool result
    response = await provider.chat(
      [
        { id: '1', role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { id: '2', role: 'assistant', content: response.content, timestamp: response.timestamp },
        // Include tool result in context
      ],
      { relatedNotes: [], conversationHistory: [] },
      {}
    );
  }

  return response.content;
}
```

---

## ⚙️ Advanced Parameters

### Fine-tune Generation

```typescript
import { AnthropicAdvancedOptions } from '@/lib/ai/types';

const advancedOptions: AnthropicAdvancedOptions = {
  top_k: 40,              // Sample from top 40 tokens
  top_p: 0.9,             // Nucleus sampling threshold
  stop_sequences: ['\n\n---\n\n'], // Stop at separator
  metadata: {
    user_id: 'user_123'   // For tracking
  }
};

const provider = new AnthropicProvider(apiKey, advancedOptions);
```

### Use Cases for Parameters

**More Focused Responses (Factual):**
```typescript
const provider = new AnthropicProvider(apiKey, {
  top_k: 10,  // Very focused
  top_p: 0.7  // Less random
});
```

**More Creative Responses (Creative Writing):**
```typescript
const provider = new AnthropicProvider(apiKey, {
  top_k: 100, // More options
  top_p: 0.95 // More random
});
```

**Control Output Length:**
```typescript
const provider = new AnthropicProvider(apiKey, {
  stop_sequences: [
    '\n\n---\n\n',
    'THE END',
    'Summary:'
  ]
});
```

---

## 📊 Performance Monitoring

### Track Metrics

```typescript
// After making requests
const metrics = provider.getPerformanceMetrics('claude-3-5-sonnet-20241022');

console.log('Performance Stats:');
console.log(`- Average Response Time: ${metrics.averageResponseTime}ms`);
console.log(`- Tokens/Second: ${metrics.tokensPerSecond.toFixed(2)}`);
console.log(`- Success Rate: ${metrics.successRate.toFixed(1)}%`);
console.log(`- Average Cost: $${metrics.averageCost.toFixed(4)}`);
console.log(`- Total Requests: ${metrics.totalRequests}`);
```

### Monitor All Models

```typescript
const allMetrics = provider.getPerformanceMetrics();

allMetrics.forEach((metrics, modelId) => {
  console.log(`\n${modelId}:`);
  console.log(`  Requests: ${metrics.totalRequests}`);
  console.log(`  Avg Cost: $${metrics.averageCost.toFixed(4)}`);
  console.log(`  Success Rate: ${metrics.successRate.toFixed(1)}%`);
});
```

---

## 💡 Common Use Cases

### Use Case 1: Real-time Chat Interface

```typescript
async function streamingChat(userInput: string, setOutput: (text: string) => void) {
  let fullText = '';
  
  await provider.chat(
    [{ id: Date.now().toString(), role: 'user', content: userInput, timestamp: new Date().toISOString() }],
    { relatedNotes: [], conversationHistory: [] },
    {
      model: 'claude-3-5-sonnet-20241022',
      stream: true,
      onStream: (chunk) => {
        if (!chunk.done) {
          fullText += chunk.content;
          setOutput(fullText);
        }
      }
    }
  );
}
```

### Use Case 2: Extract Structured Data

```typescript
const extractionTools: AnthropicTool[] = [{
  name: 'extract_person_info',
  description: 'Extract person information from text',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      company: { type: 'string' }
    },
    required: ['name']
  }
}];

const response = await provider.chat(
  [{ 
    id: '1', 
    role: 'user', 
    content: 'Extract info: John Doe, john@example.com, works at Acme Corp',
    timestamp: new Date().toISOString()
  }],
  { relatedNotes: [], conversationHistory: [] },
  { tools: extractionTools, tool_choice: { type: 'any' } }
);

const personInfo = response.toolUses[0].input;
console.log(personInfo);
// { name: 'John Doe', email: 'john@example.com', company: 'Acme Corp' }
```

### Use Case 3: Code Generation with Streaming

```typescript
async function generateCode(prompt: string) {
  console.log('Generating code...\n');
  
  await provider.chat(
    [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
    { relatedNotes: [], conversationHistory: [] },
    {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.3, // Lower for code
      stream: true,
      onStream: (chunk) => {
        if (!chunk.done) {
          process.stdout.write(chunk.content);
        } else {
          console.log(`\n\n✅ Generated ${chunk.tokens} tokens`);
        }
      }
    }
  );
}

await generateCode('Write a TypeScript function to validate email addresses');
```

### Use Case 4: Batch Processing with Metrics

```typescript
async function batchAnalysis(documents: string[]) {
  const results = [];
  
  for (const doc of documents) {
    const response = await provider.chat(
      [{ id: Date.now().toString(), role: 'user', content: `Summarize: ${doc}`, timestamp: new Date().toISOString() }],
      { relatedNotes: [], conversationHistory: [] },
      { model: 'claude-3-haiku-20240307', maxTokens: 200 } // Use faster model
    );
    
    results.push(response.content);
  }
  
  // Check performance
  const metrics = provider.getPerformanceMetrics('claude-3-haiku-20240307');
  console.log(`Processed ${documents.length} docs in ${metrics.averageResponseTime * documents.length}ms`);
  console.log(`Total cost: $${(metrics.averageCost * documents.length).toFixed(4)}`);
  
  return results;
}
```

---

## 🎓 Best Practices

### 1. Choose the Right Model

- **Claude 3.5 Sonnet:** Complex reasoning, best quality
- **Claude 3 Opus:** Most powerful, highest cost
- **Claude 3 Haiku:** Fast responses, low cost
- **Claude 3 Sonnet:** Balanced performance

### 2. Optimize for Speed

```typescript
// Use streaming for better UX
{ stream: true, onStream: callback }

// Use faster models for simple tasks
{ model: 'claude-3-haiku-20240307' }

// Limit token count
{ maxTokens: 200 }
```

### 3. Optimize for Cost

```typescript
// Use Haiku for bulk operations
{ model: 'claude-3-haiku-20240307' }

// Use stop sequences to avoid overgeneration
advancedOptions: { stop_sequences: ['END', '\n\n---'] }

// Monitor costs
const metrics = provider.getPerformanceMetrics();
```

### 4. Tool Use Tips

- ✅ Keep tool count under 15
- ✅ Use clear, descriptive names
- ✅ Validate tool inputs
- ✅ Handle tool errors gracefully
- ✅ Test with `tool_choice: auto` first

### 5. Error Handling

```typescript
try {
  const response = await provider.chat(messages, context, options);
  // ... handle success
} catch (error) {
  if (error.code === 'STREAM_ERROR') {
    console.error('Streaming failed:', error.message);
  } else if (error.code === 'CHAT_ERROR') {
    console.error('API error:', error.message);
  }
  // ... handle error
}
```

---

## 🐛 Troubleshooting

### Streaming Not Working

```typescript
// Ensure stream flag is true
{ stream: true, onStream: callback }

// Check callback is provided
onStream: (chunk) => {
  console.log('Received:', chunk);
}
```

### Tool Use Not Triggered

```typescript
// Try forcing tool use
{ tool_choice: { type: 'any' } }

// Or force specific tool
{ tool_choice: { type: 'tool', name: 'your_tool_name' } }
```

### High Latency

```typescript
// Use faster model
{ model: 'claude-3-haiku-20240307' }

// Reduce max tokens
{ maxTokens: 500 }

// Check metrics
const metrics = provider.getPerformanceMetrics();
console.log('Avg response time:', metrics.averageResponseTime);
```

### High Costs

```typescript
// Switch to Haiku
{ model: 'claude-3-haiku-20240307' } // 60x cheaper than Opus

// Use stop sequences
advancedOptions: { stop_sequences: ['END'] }

// Monitor spending
const metrics = provider.getPerformanceMetrics();
console.log('Total spent:', metrics.averageCost * metrics.totalRequests);
```

---

## 📚 Additional Resources

- 📖 [Full Changelog](./ANTHROPIC_ENHANCEMENTS_V2.md)
- 📖 [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/messages_post)
- 📖 [Tool Use Guide](https://docs.anthropic.com/claude/docs/tool-use)
- 📖 [Streaming Guide](https://docs.anthropic.com/claude/docs/streaming)
- 📖 [Best Practices](https://docs.anthropic.com/claude/docs/best-practices)

---

## 🎉 You're Ready!

You now have access to:
- ✅ Real-time streaming responses
- ✅ Structured outputs via tool calling
- ✅ Fine-tuned control with advanced parameters
- ✅ Performance monitoring and optimization

Start building amazing AI-powered features with Claude! 🚀
