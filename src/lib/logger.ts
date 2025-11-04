/**
 * Structured logging system for MarkItUp
 * Provides consistent, leveled logging with context
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  [key: string]: unknown;
  userId?: string;
  requestId?: string;
  filename?: string;
  operation?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      error,
    };

    // Format for console output
    const levelStr = LogLevel[level];
    const emoji = this.getLevelEmoji(level);
    const prefix = `${emoji} [${levelStr}]`;

    // In development, use pretty console output
    if (this.isDevelopment) {
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`${prefix} ${message}${contextStr}`, error || '');
          break;
        case LogLevel.INFO:
          console.info(`${prefix} ${message}${contextStr}`);
          break;
        case LogLevel.WARN:
          console.warn(`${prefix} ${message}${contextStr}`, error || '');
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(`${prefix} ${message}${contextStr}`, error || '');
          break;
      }
    } else {
      // In production, output structured JSON
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.FATAL:
        return '💀';
      default:
        return '📝';
    }
  }

  /**
   * Debug logging
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info logging
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning logging
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Error logging
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Fatal error logging
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext): Logger {
    const child = new Logger();
    child.minLevel = this.minLevel;
    child.isDevelopment = this.isDevelopment;

    // Override log method to include default context
    const originalLog = child.log.bind(child);
    child.log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
      const mergedContext = { ...defaultContext, ...context };
      originalLog(level, message, mergedContext, error);
    };

    return child;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience loggers for specific domains
export const apiLogger = logger.child({ domain: 'api' });
export const dbLogger = logger.child({ domain: 'database' });
export const securityLogger = logger.child({ domain: 'security' });
export const aiLogger = logger.child({ domain: 'ai' });
export const performanceLogger = logger.child({ domain: 'performance' });
