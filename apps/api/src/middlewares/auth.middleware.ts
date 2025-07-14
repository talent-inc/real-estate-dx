import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../utils/jwt';
import { AppError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AppError(401, 'Authentication token missing', 'AUTHENTICATION_ERROR');
    }

    const payload = verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid authentication token', 'AUTHENTICATION_ERROR'));
    }
  }
};

export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions', 'AUTHORIZATION_ERROR'));
      return;
    }

    next();
  };
};

export const requireTenant = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    next(new AppError(400, 'Tenant ID required', 'VALIDATION_ERROR'));
    return;
  }
  
  if (req.user && req.user.tenantId !== tenantId) {
    next(new AppError(403, 'Access to this tenant not allowed', 'AUTHORIZATION_ERROR'));
    return;
  }
  
  next();
};