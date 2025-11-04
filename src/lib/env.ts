/**
 * Environment variable validation
 * Ensures all required environment variables are present and valid at startup
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server configuration
  PORT: z.string().default('3000'),
  HOSTNAME: z.string().default('localhost'),

  // AI Provider API Keys (optional, but validated if present)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),

  // Ollama configuration
  OLLAMA_BASE_URL: z.string().url().optional().default('http://localhost:11434'),

  // Database configuration
  DATABASE_URL: z.string().optional(),

  // Security
  SESSION_SECRET: z.string().min(32).optional(),

  // Feature flags
  ENABLE_ANALYTICS: z.string().default('true'),
  ENABLE_TELEMETRY: z.string().default('false'),
});

export type Environment = z.infer<typeof envSchema>;

let validatedEnv: Environment | null = null;

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnvironment(): Environment {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach(issue => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

/**
 * Get validated environment
 * Returns cached validated environment or validates if not done yet
 */
export function getEnv(): Environment {
  if (!validatedEnv) {
    return validateEnvironment();
  }
  return validatedEnv;
}

/**
 * Check if a specific AI provider is configured
 */
export function isAIProviderConfigured(
  provider: 'openai' | 'anthropic' | 'google' | 'ollama'
): boolean {
  const env = getEnv();

  switch (provider) {
    case 'openai':
      return !!env.OPENAI_API_KEY;
    case 'anthropic':
      return !!env.ANTHROPIC_API_KEY;
    case 'google':
      return !!env.GOOGLE_API_KEY;
    case 'ollama':
      // Ollama doesn't require API key, just check if URL is set
      return !!env.OLLAMA_BASE_URL;
    default:
      return false;
  }
}

/**
 * Get missing AI provider keys
 */
export function getMissingAIProviderKeys(): string[] {
  const env = getEnv();
  const missing: string[] = [];

  if (!env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!env.GOOGLE_API_KEY) missing.push('GOOGLE_API_KEY');

  return missing;
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return getEnv().ENABLE_ANALYTICS === 'true';
}
