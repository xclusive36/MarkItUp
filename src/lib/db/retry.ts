import { dbLogger } from '../logger';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryableErrors: ['SQLITE_BUSY', 'SQLITE_LOCKED', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],
};

/**
 * Exponential backoff delay calculator
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, config: RetryConfig): boolean {
  if (!config.retryableErrors || config.retryableErrors.length === 0) {
    return true; // Retry all errors if no specific errors configured
  }

  const errorMessage = error.message.toUpperCase();
  const errorName = error.name.toUpperCase();

  return config.retryableErrors.some(
    retryableError =>
      errorMessage.includes(retryableError.toUpperCase()) ||
      errorName.includes(retryableError.toUpperCase())
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a database operation with automatic retry logic
 * Uses exponential backoff for transient failures
 *
 * @param operation - The async function to execute
 * @param context - Context for logging (e.g., 'indexNote', 'syncAll')
 * @param config - Retry configuration (optional)
 * @returns The result of the operation
 * @throws The last error if all retries fail
 *
 * @example
 * const result = await withRetry(
 *   () => db.insert(schema.notes).values(note),
 *   'insertNote',
 *   { maxAttempts: 5 }
 * );
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      dbLogger.debug(`Executing database operation`, {
        context,
        attempt,
        maxAttempts: finalConfig.maxAttempts,
      });

      const result = await operation();

      if (attempt > 1) {
        dbLogger.info(`Database operation succeeded after retry`, {
          context,
          attempt,
          totalAttempts: attempt,
        });
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      const isRetryable = isRetryableError(lastError, finalConfig);
      const isLastAttempt = attempt === finalConfig.maxAttempts;

      if (!isRetryable || isLastAttempt) {
        dbLogger.error(
          `Database operation failed${isLastAttempt ? ' (final attempt)' : ' (non-retryable)'}`,
          {
            context,
            attempt,
            maxAttempts: finalConfig.maxAttempts,
            retryable: isRetryable,
          },
          lastError
        );
        throw lastError;
      }

      const delay = calculateDelay(attempt, finalConfig);

      dbLogger.warn(`Database operation failed, retrying`, {
        context,
        attempt,
        maxAttempts: finalConfig.maxAttempts,
        nextRetryInMs: delay,
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Operation failed without error');
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

/**
 * Circuit breaker for database operations
 * Prevents cascading failures by stopping requests when error rate is too high
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
  };

  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000,
    private halfOpenAttempts: number = 1
  ) {}

  async execute<T>(operation: () => Promise<T>, context: string): Promise<T> {
    if (this.state.state === 'open') {
      const now = Date.now();
      const timeSinceLastFailure = now - this.state.lastFailureTime;

      if (timeSinceLastFailure > this.resetTimeoutMs) {
        dbLogger.info('Circuit breaker transitioning to half-open', { context });
        this.state.state = 'half-open';
      } else {
        dbLogger.warn('Circuit breaker is open, rejecting operation', {
          context,
          timeUntilReset: this.resetTimeoutMs - timeSinceLastFailure,
        });
        throw new Error('Circuit breaker is open - database operations temporarily disabled');
      }
    }

    try {
      const result = await operation();

      if (this.state.state === 'half-open') {
        dbLogger.info('Circuit breaker closing after successful operation', { context });
        this.state = { failures: 0, lastFailureTime: 0, state: 'closed' };
      } else if (this.state.failures > 0) {
        // Reset failure count on success
        this.state.failures = 0;
      }

      return result;
    } catch (error) {
      this.state.failures++;
      this.state.lastFailureTime = Date.now();

      if (this.state.failures >= this.failureThreshold) {
        dbLogger.error('Circuit breaker opening due to failure threshold', {
          context,
          failures: this.state.failures,
          threshold: this.failureThreshold,
        });
        this.state.state = 'open';
      }

      throw error;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    dbLogger.info('Circuit breaker manually reset');
    this.state = { failures: 0, lastFailureTime: 0, state: 'closed' };
  }
}

/**
 * Global circuit breaker instance for database operations
 */
export const dbCircuitBreaker = new CircuitBreaker(5, 60000, 1);
