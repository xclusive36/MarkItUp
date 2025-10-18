# Migrating to Anthropic Provider v2.0

**For developers upgrading from v1.0 to v2.0**

---

## ✅ Good News: Zero Breaking Changes!

Version 2.0 is **100% backward compatible**. Your existing code will continue to work without any modifications.

---

## 📊 What Changed

### Before v2.0 (Still Works)
```typescript
import { AnthropicProvider } from '@/lib/ai/providers/anthropic';

// Simple initialization
const provider = new AnthropicProvider(apiKey);

// Basic chat
const response = await provider.chat(
  messages,
  context,
  {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 1000
  }
);

console.log(response.content);
```

### After v2.0 (New Features Available)
```typescript
import { AnthropicProvider } from '@/lib/ai/providers/anthropic';
import { AnthropicAdvancedOptions } from '@/lib/ai/types';

// Enhanced initialization (optional)
const advancedOptions: AnthropicAdvancedOptions = {
  top_k: 40,
  top_p: 0.9,
  stop_sequences: ['\n\n---\n\n'],
  metadata: { user_id: 'user123' }
};
const provider = new AnthropicProvider(apiKey, advancedOptions);

// Enhanced chat with streaming (optional)
const response = await provider.chat(
  messages,
  context,
  {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 1000,
    stream: true,  // NEW
    onStream: (chunk) => {  // NEW
      if (!chunk.done) {
        console.log(chunk.content);
      }
    },
    tools: tools,  // NEW
    tool_choice: { type: 'auto' }  // NEW
  }
);
```

---

## 🚀 Migration Steps

### Step 1: No Changes Required! ✅

Your existing code continues to work:

```typescript
// This still works exactly as before
const provider = new AnthropicProvider(apiKey);
const response = await provider.chat(messages, context, options);
```

### Step 2: Optionally Add Streaming (Recommended)

To improve UX, add streaming:

```typescript
const response = await provider.chat(
  messages,
  context,
  {
    ...existingOptions,
    stream: true,
    onStream: (chunk) => {
      if (!chunk.done) {
        // Update UI in real-time
        updateUI(chunk.content);
      }
    }
  }
);
```

### Step 3: Optionally Add Tool Calling

If you need structured outputs:

```typescript
import { AnthropicTool } from '@/lib/ai/types';

const tools: AnthropicTool[] = [{
  name: 'extract_data',
  description: 'Extract structured data',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      value: { type: 'string' }
    },
    required: ['name']
  }
}];

const response = await provider.chat(
  messages,
  context,
  {
    ...existingOptions,
    tools: tools,
    tool_choice: { type: 'auto' }
  }
);
```

### Step 4: Optionally Add Advanced Options

For fine-tuned control:

```typescript
import { AnthropicAdvancedOptions } from '@/lib/ai/types';

const advancedOptions: AnthropicAdvancedOptions = {
  top_k: 40,
  top_p: 0.9,
  stop_sequences: ['\n\n---\n\n']
};

const provider = new AnthropicProvider(apiKey, advancedOptions);
```

### Step 5: Optionally Monitor Performance

To track metrics:

```typescript
// After making requests
const metrics = provider.getPerformanceMetrics('claude-3-5-sonnet-20241022');

console.log('Performance:', {
  avgResponseTime: metrics.averageResponseTime,
  tokensPerSecond: metrics.tokensPerSecond,
  successRate: metrics.successRate,
  avgCost: metrics.averageCost,
  totalRequests: metrics.totalRequests
});
```

---

## 🎯 Quick Wins

### 1. Add Streaming for Better UX (5 minutes)

```diff
const response = await provider.chat(
  messages,
  context,
  {
    model: 'claude-3-5-sonnet-20241022',
+   stream: true,
+   onStream: (chunk) => {
+     if (!chunk.done) {
+       appendToDisplay(chunk.content);
+     }
+   }
  }
);
```

**Benefit:** Users see responses immediately instead of waiting

### 2. Add Performance Monitoring (2 minutes)

```diff
+ // After your existing chat calls
+ const metrics = provider.getPerformanceMetrics();
+ console.log('Performance stats:', metrics);
```

**Benefit:** Understand costs and optimize model selection

### 3. Use Tool Calling for Forms (10 minutes)

Replace your JSON parsing with tool calling:

```diff
- // Old way: Parse JSON from text
- const response = await provider.chat(...);
- const data = JSON.parse(response.content);

+ // New way: Use tool calling
+ const response = await provider.chat(messages, context, {
+   tools: [formExtractionTool],
+   tool_choice: { type: 'any' }
+ });
+ const data = response.toolUses[0].input; // Already structured!
```

**Benefit:** 95%+ accuracy, no parsing errors

---

## 📋 Checklist

Use this to track your migration:

- [ ] Existing code verified working (no changes needed)
- [ ] Streaming added to chat interfaces
- [ ] Performance monitoring set up
- [ ] Tool calling implemented for structured data
- [ ] Advanced options configured (if needed)
- [ ] Documentation reviewed
- [ ] Tests updated (if applicable)

---

## ⚠️ Common Pitfalls

### Pitfall 1: Expecting Tool Results in Same Response

❌ **Wrong:**
```typescript
const response = await provider.chat(messages, context, { tools });
// response.content will NOT have final answer if tool was used
```

✅ **Right:**
```typescript
const response = await provider.chat(messages, context, { tools });
if (response.toolUses) {
  // Execute tools
  const toolResults = await executeTools(response.toolUses);
  // Continue conversation with results (multi-turn)
  const finalResponse = await provider.chat(updatedMessages, context, {});
}
```

### Pitfall 2: Not Handling Stream Completion

❌ **Wrong:**
```typescript
onStream: (chunk) => {
  appendToDisplay(chunk.content); // Will append empty string on done
}
```

✅ **Right:**
```typescript
onStream: (chunk) => {
  if (!chunk.done) {
    appendToDisplay(chunk.content);
  } else {
    console.log('Stream complete!', chunk.tokens);
  }
}
```

### Pitfall 3: Forgetting to Initialize Provider with Advanced Options

❌ **Wrong:**
```typescript
const provider = new AnthropicProvider(apiKey);
// Can't use advancedOptions later
```

✅ **Right:**
```typescript
const provider = new AnthropicProvider(apiKey, advancedOptions);
// Advanced options applied to all requests
```

---

## 🧪 Testing Your Migration

### Test 1: Existing Functionality

```typescript
// Should work exactly as before
const response = await provider.chat(messages, context, {
  model: 'claude-3-5-sonnet-20241022'
});
console.assert(response.content.length > 0, 'Got response');
```

### Test 2: Streaming

```typescript
let receivedChunks = 0;
await provider.chat(messages, context, {
  stream: true,
  onStream: (chunk) => {
    if (!chunk.done) receivedChunks++;
  }
});
console.assert(receivedChunks > 0, 'Received streaming chunks');
```

### Test 3: Tool Calling

```typescript
const response = await provider.chat(messages, context, {
  tools: [testTool],
  tool_choice: { type: 'any' }
});
console.assert(response.toolUses?.length > 0, 'Tool was used');
```

### Test 4: Performance Metrics

```typescript
await provider.chat(messages, context, {});
const metrics = provider.getPerformanceMetrics();
console.assert(metrics instanceof Map, 'Metrics available');
```

---

## 📚 Resources

- 📖 [Full Changelog](./docs/changelogs/anthropic/ANTHROPIC_ENHANCEMENTS_V2.md)
- 📖 [Quick Start Guide](./docs/changelogs/anthropic/ANTHROPIC_QUICK_START.md)
- 📖 [Complete Summary](./ANTHROPIC_ENHANCEMENTS_COMPLETE.md)

---

## 💡 Tips

### Tip 1: Start with Streaming

It's the easiest win and has the biggest UX impact.

### Tip 2: Use Haiku for Testing

```typescript
{ model: 'claude-3-haiku-20240307' } // Fastest & cheapest
```

### Tip 3: Monitor Costs Early

```typescript
const metrics = provider.getPerformanceMetrics();
console.log(`Avg cost: $${metrics.averageCost.toFixed(4)}`);
```

### Tip 4: Read the Examples

The Quick Start guide has tons of real-world examples.

### Tip 5: Ask for Help

If you're stuck, reference the documentation or check the examples.

---

## 🎉 You're Done!

Your migration is complete. Enjoy the new features:

- ✅ Backward compatible (zero breaking changes)
- ✅ Streaming for better UX
- ✅ Tool calling for structured data
- ✅ Advanced controls for fine-tuning
- ✅ Performance monitoring for optimization

**Happy coding!** 🚀
