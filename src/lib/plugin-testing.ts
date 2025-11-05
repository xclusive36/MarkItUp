import { PluginTest, TestCase, PluginManifest, PluginAPI } from './types';

export class PluginTestFramework {
  private tests: Map<string, PluginTest> = new Map();
  private testResults: Map<string, TestResult[]> = new Map();

  // Register tests for a plugin
  registerTests(pluginId: string, testCases: TestCase[]): void {
    const pluginTest: PluginTest = {
      pluginId,
      testCases,
      lastRun: '',
      status: 'pending',
    };

    this.tests.set(pluginId, pluginTest);
  }

  // Run tests for a specific plugin
  async runTests(
    pluginId: string,
    _pluginManifest: PluginManifest,
    api: PluginAPI
  ): Promise<TestResult[]> {
    // pluginManifest unused
    const pluginTest = this.tests.get(pluginId);
    if (!pluginTest) {
      throw new Error(`No tests found for plugin: ${pluginId}`);
    }

    const results: TestResult[] = [];
    let passedCount = 0;

    for (const testCase of pluginTest.testCases) {
      const startTime = performance.now();

      try {
        // Create test environment
        const testEnv = this.createTestEnvironment(api);

        // Run the test
        const passed = await testCase.test.call(testEnv);
        const duration = performance.now() - startTime;

        const result: TestResult = {
          testId: testCase.id,
          name: testCase.name,
          passed,
          duration,
          error: passed ? undefined : 'Test assertion failed',
          timestamp: new Date().toISOString(),
        };

        results.push(result);
        if (passed) passedCount++;
      } catch (error) {
        const duration = performance.now() - startTime;

        const result: TestResult = {
          testId: testCase.id,
          name: testCase.name,
          passed: false,
          duration,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        };

        results.push(result);
      }
    }

    // Update test status
    pluginTest.lastRun = new Date().toISOString();
    pluginTest.status = passedCount === pluginTest.testCases.length ? 'passed' : 'failed';

    // Store results
    this.testResults.set(pluginId, results);

    return results;
  }

  // Run all tests
  async runAllTests(
    plugins: Map<string, { manifest: PluginManifest; api: PluginAPI }>
  ): Promise<Map<string, TestResult[]>> {
    const allResults = new Map<string, TestResult[]>();

    for (const [pluginId, { manifest, api }] of plugins) {
      try {
        const results = await this.runTests(pluginId, manifest, api);
        allResults.set(pluginId, results);
      } catch (error) {
        console.error(`Failed to run tests for ${pluginId}:`, error);
      }
    }

    return allResults;
  }

  // Get test results
  getTestResults(pluginId: string): TestResult[] {
    return this.testResults.get(pluginId) || [];
  }

  // Get all test results
  getAllTestResults(): Map<string, TestResult[]> {
    return new Map(this.testResults);
  }

  // Validate plugin manifest
  validatePlugin(manifest: PluginManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!manifest.id) errors.push('Plugin ID is required');
    if (!manifest.name) errors.push('Plugin name is required');
    if (!manifest.version) errors.push('Plugin version is required');
    if (!manifest.author) errors.push('Plugin author is required');
    if (!manifest.main) errors.push('Plugin main file is required');

    // Version format validation
    if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      warnings.push('Version should follow semantic versioning (x.y.z)');
    }

    // ID format validation
    if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
      warnings.push('Plugin ID should only contain lowercase letters, numbers, and hyphens');
    }

    // Description length
    if (manifest.description && manifest.description.length > 200) {
      warnings.push('Description should be under 200 characters');
    }

    // Permissions validation
    if (manifest.permissions) {
      for (const permission of manifest.permissions) {
        if (!permission.type || !permission.description) {
          errors.push('Permissions must have type and description');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Performance benchmark
  async benchmarkPlugin(pluginId: string, iterations: number = 100): Promise<BenchmarkResult> {
    const pluginTest = this.tests.get(pluginId);
    if (!pluginTest) {
      throw new Error(`No tests found for plugin: ${pluginId}`);
    }

    const performanceTest = pluginTest.testCases.find(test => test.id === 'performance');
    if (!performanceTest) {
      throw new Error(`No performance test found for plugin: ${pluginId}`);
    }

    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      try {
        await performanceTest.test();
        const duration = performance.now() - startTime;
        times.push(duration);
        successCount++;
      } catch (error) {
        // Record failed attempts but continue
        times.push(performance.now() - startTime);
      }
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successRate = (successCount / iterations) * 100;

    return {
      pluginId,
      iterations,
      averageTime: avgTime,
      minTime,
      maxTime,
      successRate,
      timestamp: new Date().toISOString(),
    };
  }

  private createTestEnvironment(api: PluginAPI): TestEnvironment {
    return {
      api,
      assert: {
        equal: (actual: any, expected: any) => {
          if (actual !== expected) {
            throw new Error(`Expected ${expected}, got ${actual}`);
          }
        },
        notEqual: (actual: any, expected: any) => {
          if (actual === expected) {
            throw new Error(`Expected ${actual} not to equal ${expected}`);
          }
        },
        truthy: (value: any) => {
          if (!value) {
            throw new Error(`Expected truthy value, got ${value}`);
          }
        },
        falsy: (value: any) => {
          if (value) {
            throw new Error(`Expected falsy value, got ${value}`);
          }
        },
      },
      mock: {
        createNote: (name: string, content: string) => ({
          id: `mock-${Date.now()}`,
          name,
          content,
          folder: 'test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          metadata: {},
          wordCount: content.split(' ').length,
          readingTime: Math.ceil(content.split(' ').length / 200),
        }),
      },
    };
  }
}

interface TestResult {
  testId: string;
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  timestamp: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface BenchmarkResult {
  pluginId: string;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  timestamp: string;
}

interface TestEnvironment {
  api: PluginAPI;
  assert: {
    equal: (actual: any, expected: any) => void;
    notEqual: (actual: any, expected: any) => void;
    truthy: (value: any) => void;
    falsy: (value: any) => void;
  };
  mock: {
    createNote: (name: string, content: string) => any;
  };
}

// Example test cases for built-in plugins
export const EXAMPLE_TESTS = {
  'enhanced-word-count': [
    {
      id: 'word-count-basic',
      name: 'Basic word counting',
      description: 'Test basic word counting functionality',
      test: async function (this: TestEnvironment) {
        const note = this.mock.createNote('Test Note', 'Hello world test');
        this.assert.equal(note.wordCount, 3);
        return true;
      },
      expected: true,
    },
    {
      id: 'word-count-empty',
      name: 'Empty content word count',
      description: 'Test word counting with empty content',
      test: async function (this: TestEnvironment) {
        const note = this.mock.createNote('Empty Note', '');
        this.assert.equal(note.wordCount, 0);
        return true;
      },
      expected: true,
    },
  ],
  'daily-notes': [
    {
      id: 'daily-note-creation',
      name: 'Daily note creation',
      description: 'Test automatic daily note creation',
      test: async function (this: TestEnvironment) {
        const today = new Date().toISOString().split('T')[0];
        const note = this.mock.createNote(`Daily Note ${today}`, `# ${today}\n\nDaily tasks:`);
        this.assert.truthy(note.name.includes(today));
        return true;
      },
      expected: true,
    },
  ],
};
