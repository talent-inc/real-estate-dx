import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { logger } from '../config/logger';

// Enhanced security headers configuration
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: ['no-referrer-when-downgrade'],
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Permissions Policy
  permittedCrossDomainPolicies: false,
});

// Custom security middleware for additional protection
export const additionalSecurity = (req: Request, res: Response, next: NextFunction): void => {
  // Set additional security headers
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || 'unknown');
  
  // Prevent DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // Disable IE compatibility mode
  res.setHeader('X-UA-Compatible', 'IE=edge');
  
  // Set cache control for sensitive endpoints
  if (req.path.includes('/auth/') || req.path.includes('/users/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];
  
  const checkForSuspiciousContent = (obj: any, path = ''): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (checkForSuspiciousContent(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Check request body, query, and params
  const allRequestData = {
    ...req.body,
    ...req.query,
    ...req.params,
  };
  
  if (checkForSuspiciousContent(allRequestData)) {
    logger.warn('Suspicious request detected', {
      type: 'SECURITY_ALERT',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      suspiciousData: allRequestData,
      timestamp: new Date().toISOString(),
    });
    
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request contains invalid characters',
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  
  next();
};

// IP whitelist middleware (for admin endpoints)
export const createIPWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (clientIP.includes('127.0.0.1') || clientIP.includes('::1'))) {
      return next();
    }
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('IP access denied', {
        type: 'IP_ACCESS_DENIED',
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      
      res.status(403).json({
        success: false,
        error: {
          code: 'IP_ACCESS_DENIED',
          message: 'Access denied from this IP address',
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    next();
  };
};

// Request size limiter
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      logger.warn('Request size exceeded', {
        type: 'REQUEST_SIZE_EXCEEDED',
        ip: req.ip,
        path: req.path,
        contentLength,
        maxSize: maxSizeBytes,
        timestamp: new Date().toISOString(),
      });
      
      res.status(413).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds limit of ${maxSize}`,
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    next();
  };
};

// Helper function to parse size strings like "10mb", "1gb"
const parseSize = (size: string): number => {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }
  
  const [, number, unit] = match;
  return parseFloat(number) * units[unit];
};

// Tenant isolation enforcement
export const enforceTenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
  if (user && requestedTenantId && user.tenantId !== requestedTenantId) {
    logger.warn('Tenant isolation violation attempt', {
      type: 'TENANT_ISOLATION_VIOLATION',
      userId: user.id,
      userTenantId: user.tenantId,
      requestedTenantId,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    
    res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Access to this tenant is not allowed',
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  
  next();
};