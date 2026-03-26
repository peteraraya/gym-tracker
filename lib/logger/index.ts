/**
 * Sistema de logging estructurado
 * Niveles: debug, info, warn, error
 * Características:
 * - Contexto estructurado
 * - Filtrado por nivel en producción
 * - Timestamps automáticos
 * - Metadata adicional
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.minLevel = this.getMinLevel();
  }

  private getMinLevel(): LogLevel {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel;
    if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
      return envLevel;
    }
    return this.isDevelopment ? 'debug' : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message,
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    return parts.join(' ');
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case 'debug':
        console.debug(formatted, error || '');
        break;
      case 'info':
        console.info(formatted, error || '');
        break;
      case 'warn':
        console.warn(formatted, error || '');
        break;
      case 'error':
        console.error(formatted, error || '');
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: Error) {
    this.log('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error);
  }
}

// Singleton instance
export const logger = new Logger();

// Helper para crear loggers con contexto específico
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) =>
      logger.warn(message, { ...defaultContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, { ...defaultContext, ...context }, error),
  };
}
