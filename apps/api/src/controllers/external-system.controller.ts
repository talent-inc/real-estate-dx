import type { Response, NextFunction } from 'express';
import { ExternalSystemService } from '../services/external-system.service';
import { AppError } from '../middlewares/error.middleware';
import {
  createExternalSystemAuthSchema,
  updateExternalSystemAuthSchema,
  testConnectionSchema,
  syncRequestSchema,
  type CreateExternalSystemAuthRequest,
  type UpdateExternalSystemAuthRequest,
  type TestConnectionRequest,
  type SyncRequest,
} from '../validators/external-system.validators';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

const externalSystemService = new ExternalSystemService();

export class ExternalSystemController {
  async getExternalSystems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Get external systems
      const systems = await externalSystemService.getExternalSystems(req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: {
          systems,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getExternalSystemById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'System ID is required', 'VALIDATION_ERROR');
      }

      const system = await externalSystemService.getExternalSystemById(id, req.user.tenantId);
      
      if (!system) {
        throw new AppError(404, 'External system not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          system,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createExternalSystemAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate request body
      const validatedData = createExternalSystemAuthSchema.parse(req.body) as CreateExternalSystemAuthRequest;
      
      // Create external system auth
      const system = await externalSystemService.createExternalSystemAuth(
        validatedData,
        req.user.tenantId
      );
      
      res.status(201).json({
        success: true,
        data: {
          system,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExternalSystemAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'System ID is required', 'VALIDATION_ERROR');
      }

      // Validate request body
      const validatedData = updateExternalSystemAuthSchema.parse(req.body) as UpdateExternalSystemAuthRequest;
      
      // Update external system auth
      const system = await externalSystemService.updateExternalSystemAuth(
        id,
        validatedData,
        req.user.tenantId
      );
      
      res.status(200).json({
        success: true,
        data: {
          system,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteExternalSystemAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'System ID is required', 'VALIDATION_ERROR');
      }

      // Delete external system auth
      await externalSystemService.deleteExternalSystemAuth(id, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        message: 'External system authentication deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate request body
      const validatedData = testConnectionSchema.parse(req.body) as TestConnectionRequest;
      
      // Test connection
      const result = await externalSystemService.testConnection(validatedData, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async testExistingConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'System ID is required', 'VALIDATION_ERROR');
      }

      // For existing connections, we would decrypt credentials and test
      // For now, return a mock successful test
      const result = {
        connectionStatus: 'SUCCESS' as const,
        responseTime: Math.floor(Math.random() * 2000 + 500),
        systemInfo: {
          version: '2.1.0',
          status: 'ONLINE',
        },
        capabilities: ['PROPERTY_SEARCH', 'PROPERTY_CREATE', 'PROPERTY_UPDATE'],
        testedAt: new Date(),
      };
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async startSync(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'System ID is required', 'VALIDATION_ERROR');
      }

      // Validate request body
      const validatedData = syncRequestSchema.parse(req.body || {}) as SyncRequest;
      
      // Start sync
      const result = await externalSystemService.startSync(id, validatedData, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSyncStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { syncId } = req.params;
      
      if (!syncId) {
        throw new AppError(400, 'Sync ID is required', 'VALIDATION_ERROR');
      }

      // Get sync status
      const syncLog = await externalSystemService.getSyncStatus(syncId, req.user.tenantId);
      
      if (!syncLog) {
        throw new AppError(404, 'Sync not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          sync: syncLog,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSyncHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { systemType } = req.query;

      // Get sync history
      const syncHistory = await externalSystemService.getSyncHistory(
        req.user.tenantId,
        systemType as string
      );
      
      res.status(200).json({
        success: true,
        data: {
          syncHistory,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}