type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const SENSITIVE_KEYS = ['phone', 'password', 'secret', 'apikey', 'key', 'token', 'authorization']

/**
 * Recursively sanitizes sensitive fields in log contexts to protect user privacy.
 */
function sanitizeContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(sanitizeContext)
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const sanitizedCtx = context ? (sanitizeContext(context) as LogContext) : undefined

    if (this.isProduction) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...sanitizedCtx,
      })
    }

    const colorMap: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    const color = colorMap[level] ?? reset

    const ctxStr = sanitizedCtx && Object.keys(sanitizedCtx).length > 0
      ? ` | ${JSON.stringify(sanitizedCtx)}`
      : ''

    return `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}${ctxStr}`
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage('error', message, context))
  }
}

export const logger = new Logger()
