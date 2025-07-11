import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { logger } from '../config/logger';

// Rate limiting configuration with enhanced security
const createRateLimitHandler = (limitType: string) => {
  return (req: Request, res: Response) => {
    const clientInfo = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      tenantId: req.headers['x-tenant-id'],
      userId: (req as any).user?.id,
      endpoint: req.path,
      method: req.method,
    };

    logger.warn(`Rate limit exceeded: ${limitType}`, {
      type: 'RATE_LIMIT_EXCEEDED',
      limitType,
      ...clientInfo,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      error: {
        code: `${limitType.toUpperCase()}_RATE_LIMIT_EXCEEDED`,
        message: 'Too many requests, please try again later.',
        retryAfter: res.getHeader('Retry-After'),
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
  };
};

// General API rate limiter - 100 requests per 15 minutes per IP
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks and development
    if (req.path === '/api/health' || process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  },
  handler: createRateLimitHandler('general'),
});

// Strict rate limiter for authentication endpoints - 5 attempts per 15 minutes per IP
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    // Use IP + User-Agent for more granular control
    return `${req.ip}:${req.get('User-Agent')?.substring(0, 100) || 'unknown'}`;
  },
  handler: createRateLimitHandler('auth'),
});

// OCR API rate limiter - 10 requests per minute per tenant
export const ocrRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const tenantId = req.headers['x-tenant-id'] as string || (req as any).user?.tenantId;
    return tenantId || req.ip;
  },
  handler: createRateLimitHandler('ocr'),
});

// File upload rate limiter - 20 uploads per 5 minutes per tenant
export const uploadRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const tenantId = req.headers['x-tenant-id'] as string || (req as any).user?.tenantId;
    return `upload:${tenantId || req.ip}`;
  },
  handler: createRateLimitHandler('upload'),
});

// Search API rate limiter - 200 searches per 10 minutes per tenant
export const searchRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const tenantId = req.headers['x-tenant-id'] as string || (req as any).user?.tenantId;
    return `search:${tenantId || req.ip}`;
  },
  handler: createRateLimitHandler('search'),
});

// Report generation rate limiter - 5 reports per hour per tenant
export const reportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const tenantId = req.headers['x-tenant-id'] as string || (req as any).user?.tenantId;
    return `report:${tenantId || req.ip}`;
  },
  handler: createRateLimitHandler('report'),
});

// Admin operations rate limiter - 50 requests per 15 minutes per admin user
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    return `admin:${userId || req.ip}`;
  },
  skip: (req: Request) => {
    const userRole = (req as any).user?.role;
    return !['TENANT_ADMIN', 'MANAGER'].includes(userRole);
  },
  handler: createRateLimitHandler('admin'),
});