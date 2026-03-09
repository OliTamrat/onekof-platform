import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Determine log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: {
    service: 'onekof-platform',
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  },
  transports: [],
});

// Console transport (all environments)
logger.add(new winston.transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    consoleFormat
  ),
}));

// File transports (production only)
if (process.env.NODE_ENV === 'production') {
  // Error logs
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }));

  // Combined logs
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }));

  // Access logs
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true,
  }));
}

// Helper functions for different log levels
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

// API Request/Response logging helper
export function logApiRequest(req: Request, context?: any) {
  const method = req.method;
  const url = req.url;

  log.http('API Request', {
    method,
    url,
    headers: {
      'user-agent': req.headers.get('user-agent'),
      'content-type': req.headers.get('content-type'),
    },
    ...context,
  });
}

export function logApiResponse(req: Request, status: number, duration: number) {
  const method = req.method;
  const url = req.url;

  log.http('API Response', {
    method,
    url,
    status,
    duration: `${duration}ms`,
  });
}

// Database query logging helper
export function logDbQuery(query: string, duration: number, context?: any) {
  log.debug('Database Query', {
    query,
    duration: `${duration}ms`,
    ...context,
  });
}

// Authentication logging helper
export function logAuth(action: string, userId?: string, context?: any) {
  log.info('Authentication', {
    action,
    userId,
    ...context,
  });
}

// Security event logging helper
export function logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: any) {
  const logFn = severity === 'critical' || severity === 'high' ? log.error : log.warn;

  logFn('Security Event', {
    event,
    severity,
    ...context,
  });
}

export default logger;
