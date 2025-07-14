import { Request } from 'express';
import type { JWTPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface TenantRequest extends AuthenticatedRequest {
  tenantId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      tenantId?: string;
    }
  }
}

export {};