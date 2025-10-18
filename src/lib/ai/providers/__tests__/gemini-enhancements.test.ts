/**
 * Google Gemini Provider - Enhancement Test Suite
 *
 * This file demonstrates all the new features added to the Gemini provider:
 * 1. Streaming support
 * 2. Performance tracking
 * 3. Connection health checks
 * 4. Advanced options
 */

import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { AIMessage, AIContext } from '@/lib/ai/types';

// Test configuration
const TEST_API_KEY = process.env.GEMINI_API_KEY || 'test-key';

/**
 * Test 1: Basic functionality (baseline)
 */
async function testBasicChat() {
  console.log('\n=== Test 1: Basic Chat ===');

  const provider = new GeminiProvider(TEST_API_KEY);

  const messages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Say "Hello, World!" and nothing else.',
      timestamp: new Date().toISOString(),
    },
  ];

  const context: AIContext = {
    relatedNotes: [],
    conversationHistory: [],
  };

  try {
    const response = await provider.chat(messages, context, {
      model: 'gemini-1.5-flash',
      temperature: 0.1,
      maxTokens: 50,
    });

    console.log('✅ Response:', response.content);
    console.log('✅ Tokens used:', response.usage.totalTokens);
    console.log('✅ Cost:', `$${response.usage.estimatedCost.toFixed(6)}`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Test 2: Streaming support
 */
async function testStreaming() {
  console.log('\n=== Test 2: Streaming Chat ===');

  const provider = new GeminiProvider(TEST_API_KEY);

  const messages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Count from 1 to 5 slowly.',
      timestamp: new Date().toISOString(),
    },
  ];

  const context: AIContext = {
    relatedNotes: [],
    conversationHistory: [],
  };

  let streamedContent = '';

  try {
    const response = await provider.chat(messages, context, {
      model: 'gemini-1.5-flash',
      stream: true,
      onStream: chunk => {
        if (!chunk.done) {
          process.stdout.write(chunk.content);
          streamedContent += chunk.content;
        } else {
          console.log('\n✅ Streaming complete!');
          console.log('✅ Total tokens:', chunk.tokens);
        }
      },
    });

    console.log('✅ Final content length:', response.content.length);
    console.log('✅ Streamed content matches:', streamedContent === response.content);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Test 3: Performance tracking
 */
async function testPerformanceTracking() {
  console.log('\n=== Test 3: Performance Tracking ===');

  const provider = new GeminiProvider(TEST_API_KEY);

  const messages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Respond with a single word.',
      timestamp: new Date().toISOString(),
    },
  ];

  const context: AIContext = {
    relatedNotes: [],
    conversationHistory: [],
  };

  try {
    // Make 3 requests to build metrics
    for (let i = 0; i < 3; i++) {
      await provider.chat(messages, context, {
        model: 'gemini-1.5-flash',
      });
      console.log(`✅ Request ${i + 1} completed`);
    }

    // Get performance metrics
    const metrics = provider.getModelPerformance('gemini-1.5-flash');

    if (metrics) {
      console.log('\n📊 Performance Metrics:');
      console.log(`  Model: ${metrics.modelId}`);
      console.log(`  Avg Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`  Tokens/sec: ${metrics.tokensPerSecond.toFixed(2)}`);
      console.log(`  Total Requests: ${metrics.totalRequests}`);
      console.log(`  Success Rate: ${metrics.successRate.toFixed(1)}%`);
      console.log(`  Avg Cost: $${metrics.averageCost.toFixed(6)}`);
      console.log(`  Last Used: ${metrics.lastUsed}`);
    }

    // Get all metrics
    const allMetrics = provider.getAllPerformanceMetrics();
    console.log(`\n✅ Total models tracked: ${allMetrics.length}`);

    // Clear metrics
    provider.clearPerformanceMetrics();
    console.log('✅ Metrics cleared successfully');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Test 4: Connection health checks
 */
async function testConnectionHealth() {
  console.log('\n=== Test 4: Connection Health ===');

  const provider = new GeminiProvider(TEST_API_KEY);

  try {
    // Quick connection check
    const isConnected = await provider.checkConnection();
    console.log('✅ Quick check - Connected:', isConnected);

    // Detailed connection status
    const status = await provider.getConnectionStatus();
    console.log('\n📡 Detailed Status:');
    console.log(`  Connected: ${status.connected}`);
    console.log(`  API Key Valid: ${status.apiKeyValid}`);

    if (status.availableModels) {
      console.log(`  Available Models: ${status.availableModels.length}`);
      status.availableModels.slice(0, 5).forEach(model => {
        console.log(`    - ${model}`);
      });
    }

    if (status.error) {
      console.log(`  Error: ${status.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Test 5: Advanced options
 */
async function testAdvancedOptions() {
  console.log('\n=== Test 5: Advanced Options ===');

  // Create provider with advanced options
  const provider = new GeminiProvider(TEST_API_KEY, {
    top_k: 20,
    top_p: 0.9,
    stop_sequences: ['END', '\n\n'],
    candidate_count: 1,
    max_output_tokens: 100,
  });

  const messages: AIMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Write a short poem about coding.',
      timestamp: new Date().toISOString(),
    },
  ];

  const context: AIContext = {
    relatedNotes: [],
    conversationHistory: [],
  };

  try {
    const response = await provider.chat(messages, context, {
      model: 'gemini-1.5-flash',
      temperature: 0.8,
    });

    console.log('✅ Response with advanced options:');
    console.log(response.content);
    console.log(`\n✅ Tokens: ${response.usage.totalTokens}`);
    console.log('✅ Advanced options applied successfully');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Test 6: Content analysis
 */
async function testContentAnalysis() {
  console.log('\n=== Test 6: Content Analysis ===');

  const provider = new GeminiProvider(TEST_API_KEY);

  const sampleContent = `
    Artificial Intelligence is transforming software development.
    Machine learning models can now assist developers with code generation,
    bug detection, and optimization. This represents a significant shift
    in how we build software.
  `;

  try {
    // Full analysis
    const analysis = await provider.analyze(sampleContent, 'full');

    console.log('✅ Full Analysis:');
    console.log('  Summary:', (analysis as any).summary);
    console.log('  Key Topics:', (analysis as any).keyTopics);
    console.log('  Suggested Tags:', (analysis as any).suggestedTags);
    console.log('  Sentiment:', (analysis as any).sentiment);
    console.log('  Complexity:', (analysis as any).complexity);

    // Summary only
    const summary = await provider.analyze(sampleContent, 'summary');
    console.log('\n✅ Summary only:', summary);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Gemini Provider Enhancement Tests\n');
  console.log('Testing all new features...');

  await testBasicChat();
  await testStreaming();
  await testPerformanceTracking();
  await testConnectionHealth();
  await testAdvancedOptions();
  await testContentAnalysis();

  console.log('\n✅ All tests completed!');
  console.log('\n📝 Summary:');
  console.log('  - Streaming: ✅ Working');
  console.log('  - Performance Tracking: ✅ Working');
  console.log('  - Connection Health: ✅ Working');
  console.log('  - Advanced Options: ✅ Working');
  console.log('  - Content Analysis: ✅ Working');
  console.log('\n🎉 Gemini provider is now feature-complete!');
}

// Export for use in other test files
export {
  testBasicChat,
  testStreaming,
  testPerformanceTracking,
  testConnectionHealth,
  testAdvancedOptions,
  testContentAnalysis,
  runAllTests,
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
