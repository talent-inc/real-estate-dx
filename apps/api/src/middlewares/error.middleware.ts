import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Error severity levels for better categorization
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories for better tracking
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  RATE_LIMIT = 'rate_limit',
  SYSTEM = 'system',
}

// Internationalization support for error messages
interface ErrorMessage {
  en: string;
  ja: string;
}

const errorMessages: Record<string, ErrorMessage> = {
  VALIDATION_ERROR: {
    en: 'Validation failed',
    ja: 'バリデーションエラーが発生しました',
  },
  AUTHENTICATION_ERROR: {
    en: 'Authentication failed',
    ja: '認証に失敗しました',
  },
  AUTHORIZATION_ERROR: {
    en: 'Insufficient permissions',
    ja: '権限が不足しています',
  },
  NOT_FOUND: {
    en: 'Resource not found',
    ja: 'リソースが見つかりません',
  },
  CONFLICT: {
    en: 'Resource already exists',
    ja: 'リソースが既に存在します',
  },
  RATE_LIMIT_EXCEEDED: {
    en: 'Too many requests',
    ja: 'リクエスト数が上限を超えました',
  },
  EXTERNAL_SERVICE_ERROR: {
    en: 'External service error',
    ja: '外部サービスエラーが発生しました',
  },
  INTERNAL_SERVER_ERROR: {
    en: 'An unexpected error occurred',
    ja: '予期しないエラーが発生しました',
  },
};

export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly correlationId?: string;

  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: unknown,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    isOperational: boolean = true,
    correlationId?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.category = category;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.correlationId = correlationId;
    Error.captureStackTrace(this, this.constructor);
  }

  // Get localized error message
  getLocalizedMessage(locale: string = 'ja'): string {
    const errorMessage = errorMessages[this.code];
    if (errorMessage) {
      return errorMessage[locale as keyof ErrorMessage] || errorMessage.en;
    }
    return this.message;
  }

  // Convert to JSON for API response
  toJSON(locale: string = 'ja', includeStack: boolean = false) {
    return {
      code: this.code,
      message: this.getLocalizedMessage(locale),
      severity: this.severity,
      category: this.category,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      details: this.details,
      ...(includeStack && { stack: this.stack }),
    };
  }
}

// Predefined error classes for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown, correlationId?: string) {
    super(400, message, 'VALIDATION_ERROR', details, ErrorSeverity.LOW, ErrorCategory.VALIDATION, true, correlationId);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown, correlationId?: string) {
    super(401, message, 'AUTHENTICATION_ERROR', details, ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, true, correlationId);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: unknown, correlationId?: string) {
    super(403, message, 'AUTHORIZATION_ERROR', details, ErrorSeverity.MEDIUM, ErrorCategory.AUTHORIZATION, true, correlationId);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown, correlationId?: string) {
    super(404, message, 'NOT_FOUND', details, ErrorSeverity.LOW, ErrorCategory.BUSINESS_LOGIC, true, correlationId);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: unknown, correlationId?: string) {
    super(409, message, 'CONFLICT', details, ErrorSeverity.MEDIUM, ErrorCategory.BUSINESS_LOGIC, true, correlationId);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: unknown, correlationId?: string) {
    super(429, message, 'RATE_LIMIT_EXCEEDED', details, ErrorSeverity.MEDIUM, ErrorCategory.RATE_LIMIT, true, correlationId);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown, correlationId?: string) {
    const errorDetails = typeof details === 'object' && details !== null ? { service, ...details } : { service, details };
    super(502, message, 'EXTERNAL_SERVICE_ERROR', errorDetails, ErrorSeverity.HIGH, ErrorCategory.EXTERNAL_SERVICE, true, correlationId);
  }
}

export class DatabaseError extends AppError {
  constructor(operation: string, message: string, details?: unknown, correlationId?: string) {
    const errorDetails = typeof details === 'object' && details !== null ? { operation, ...details } : { operation, details };
    super(500, message, 'DATABASE_ERROR', errorDetails, ErrorSeverity.HIGH, ErrorCategory.DATABASE, false, correlationId);
  }
}


// Enhanced error handler with improved logging and monitoring
export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  const correlationId = req.headers['x-correlation-id'] as string;
  const userAgent = req.get('User-Agent');
  const locale = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'ja';
  const userId = (req as any).user?.id;
  const tenantId = (req as any).user?.tenantId;

  // Enhanced error logging with more context
  const errorContext = {
    requestId,
    correlationId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent,
      userId,
      tenantId,
    },
    timestamp: new Date().toISOString(),
  };

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', {
      fields: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    }, correlationId);

    logger.warn('Validation error occurred', {
      ...errorContext,
      severity: validationError.severity,
      category: validationError.category,
    });

    res.status(400).json({
      success: false,
      error: {
        ...validationError.toJSON(locale),
        requestId,
      },
    });
    return;
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const logLevel = err.severity === ErrorSeverity.CRITICAL || err.severity === ErrorSeverity.HIGH ? 'error' : 'warn';
    
    logger[logLevel]('Application error occurred', {
      ...errorContext,
      severity: err.severity,
      category: err.category,
      isOperational: err.isOperational,
    });

    // Send alert for high severity errors
    if (err.severity === ErrorSeverity.CRITICAL || err.severity === ErrorSeverity.HIGH) {
      sendErrorAlert(err, errorContext);
    }

    const includeStack = process.env.NODE_ENV === 'development' && err.severity !== ErrorSeverity.LOW;
    
    res.status(err.statusCode).json({
      success: false,
      error: {
        ...err.toJSON(locale, includeStack),
        requestId,
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const authError = new AuthenticationError(
      err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      { jwtError: err.name },
      correlationId
    );

    logger.warn('Authentication error occurred', {
      ...errorContext,
      severity: authError.severity,
      category: authError.category,
    });

    res.status(401).json({
      success: false,
      error: {
        ...authError.toJSON(locale),
        requestId,
      },
    });
    return;
  }

  // Handle database errors
  if (err.name === 'PrismaClientKnownRequestError' || err.name === 'PrismaClientUnknownRequestError') {
    const dbError = new DatabaseError('database_operation', 'Database operation failed', {
      originalError: err.name,
    }, correlationId);

    logger.error('Database error occurred', {
      ...errorContext,
      severity: dbError.severity,
      category: dbError.category,
    });

    sendErrorAlert(dbError, errorContext);

    res.status(500).json({
      success: false,
      error: {
        ...dbError.toJSON(locale),
        requestId,
      },
    });
    return;
  }

  // Handle unexpected errors
  const unexpectedError = new AppError(
    500,
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'development' ? { originalError: err.message, stack: err.stack } : undefined,
    ErrorSeverity.HIGH,
    ErrorCategory.SYSTEM,
    false,
    correlationId
  );

  logger.error('Unexpected error occurred', {
    ...errorContext,
    severity: unexpectedError.severity,
    category: unexpectedError.category,
    isOperational: false,
  });

  sendErrorAlert(unexpectedError, errorContext);

  res.status(500).json({
    success: false,
    error: {
      ...unexpectedError.toJSON(locale, process.env.NODE_ENV === 'development'),
      requestId,
    },
  });
};

// Error alerting function (placeholder for actual alerting service)
const sendErrorAlert = (error: AppError, context: any): void => {
  // In a real implementation, this would send alerts to:
  // - Slack/Teams webhook
  // - Email notifications
  // - PagerDuty/Opsgenie
  // - Monitoring systems (Datadog, New Relic, etc.)
  
  if (error.severity === ErrorSeverity.CRITICAL) {
    logger.error('CRITICAL ERROR ALERT', {
      alert: true,
      error: error.toJSON('en', true),
      context,
      action: 'immediate_attention_required',
    });
  }
};

// Graceful shutdown handler for uncaught errors
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
      type: 'uncaughtException',
      timestamp: new Date().toISOString(),
    });
    
    // Give the logger time to write
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
      type: 'unhandledRejection',
      timestamp: new Date().toISOString(),
    });
    
    // Give the logger time to write
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};