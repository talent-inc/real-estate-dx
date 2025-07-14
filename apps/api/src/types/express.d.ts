import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface TenantRequest extends AuthenticatedRequest {
  tenantId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      tenantId?: string;
    }
  }
}

export {};